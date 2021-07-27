import type {EventType, EventContainer} from "./types"
import {Transport} from "./transport";

const EVENT_NAMESPACE_ROOT_EVENT_NAME = "__root__" // cannot be set through createEvent

/*
an example namespace for 'test.user.create'
{
    test: {
        EVENT_NAMESPACE_ROOT_EVENT_NAME: TestEvent
        user: {
            EVENT_NAMESPACE_ROOT_EVENT_NAME: TestUserEvent
            create: {
                EVENT_NAMESPACE_ROOT_EVENT_NAME: TestUserCreateEvent
            }
        }
    }
}
 */

const createdContainers = new Set<string>()

/** Create isolated containers. Events in different containers won't affect
 * each other even if they have the same names. Events created in one container
 * won't exist in other containers.
 *
 * @param{string|null} containerName - Name of the container. If null, the
 * container will be anonymous and cannot emit or listen to cross context
 * (window/tab/process) events. The names of two containers must be identical
 * for cross-context events to associate with each other.
 * @return {getEvent,createEvent} - a getEvent function and createEvent function
 * functionally equivalent to the normal versions but isolated.
 */
function createContainer(containerName: string | null): EventContainer {

    if (containerName !== null) {
        if (createdContainers.has(containerName)) {
            throw Error(`A container with name '${containerName}' already exists`)
        }
        if (containerName.indexOf(".") !== -1) {
            throw Error(`Container name '${containerName}' cannot contain '.'`)
        }

        if (containerName.match(/^[a-zA-Z]/) === null) {
            throw Error(`Container name '${containerName}' must starts with a letter`)
        }

        createdContainers.add(containerName)
    }

    type BaseEventListener<Data> = (event: BaseEvent<Data>) => void
    type EventNamespace = Map<string, EventType<any> | EventNamespace>

    abstract class BaseEvent<D> { // D: DataType
        data: D
        static containerName: string | null = containerName
        static transports: Set<Transport>

        // implemented in createEvent through Object.defineProperty
        static listeners: Set<BaseEventListener<any>>
        declare static type: string

        private static registeredTypes: EventNamespace = new Map();

        constructor(data: D) {
            this.data = data
        }

        get type(): string {
            return (this.constructor as any).type
        }

        get listeners(): Set<BaseEventListener<D>> {
            // the as any cast is the only way to get prototype
            return (this.constructor as any).listeners
        }

        static addListener<Data>(listener: BaseEventListener<Data>) {
            if (this.listeners.has(listener)) {
                throw Error("The listener to add is already registered for " + this.type)
            }
            this.listeners.add(listener)
            return this as unknown as EventType<Data>
        }

        static removeListener<Data>(listener: BaseEventListener<Data>) {
            if (!this.listeners.delete(listener)) {
                throw Error("The listener to remove was not found on " + this.type)
            }
            return this as unknown as EventType<Data>
        }

        static createEventNamespaces(stems: Array<string>, namespace: EventNamespace, created: string): EventNamespace {
            if (stems.length === 0) return namespace

            const name = stems.shift() as string
            const currentName = created ? created + "." + name : name

            let ns = namespace.get(name)
            if (ns === undefined) {
                // create empty namespace
                ns = new Map()
                namespace.set(name, ns)
                const e = createEventUnchecked(currentName)
                ns.set(EVENT_NAMESPACE_ROOT_EVENT_NAME, e)
            } else if (!(ns instanceof Map)) {
                // moves current event to a namespace
                const e = ns
                ns = new Map()
                ns.set(EVENT_NAMESPACE_ROOT_EVENT_NAME, e)
                namespace.set(name, ns)
            }

            return this.createEventNamespaces(stems, ns, currentName)
        }

        static registerType(typeName: string, type: EventType<any>) {
            const stems = typeName.split(".")
            const name = stems.pop()
            const ns = this.createEventNamespaces(stems, this.registeredTypes, "")
            ns.set(name!, type)
        }

        static getRegisteredType(typeName: string): EventType<any> | undefined {
            const stems = typeName.split(".")

            let ns = this.registeredTypes

            do {
                const name = stems.shift() as string
                const nsOrEvent = ns.get(name)
                if (nsOrEvent === undefined) return undefined
                if (nsOrEvent instanceof Map) {
                    ns = nsOrEvent
                    if (stems.length === 0)
                        return ns.get(EVENT_NAMESPACE_ROOT_EVENT_NAME) as EventType<any>
                } else if (stems.length === 0) {
                    return nsOrEvent
                } else {
                    return undefined
                }
            } while (stems.length > 0)
        }

        static addTransport(transport: Transport) {
            if (containerName === null) throw Error("Anonymous container cannot add cross context target")
            transport.bind(this as unknown as EventType<any>)
            if (this.transports.has(transport)) throw Error(`Transport already exists for event '${this.type}' (container '${containerName}')`)
            this.transports.add(transport)
        }

        static removeTransport(transport: Transport) {
            if (!this.transports.delete(transport)) throw Error(`Specified transport does not exist for event '${this.type}' (container '${containerName}')`)
        }

        emit(options={relay: false}) {
            const errors: any[] = []
            let type: EventType<any> = this.constructor as EventType<any>
            let parents = type.type.substring(0, type.type.lastIndexOf("."))
            for (; ;) {
                type.transports.forEach(t => {
                    t.send(this, options.relay)
                })
                type.listeners.forEach(l => {
                        try {
                            l(this)
                        } catch (e: any) {
                            console.error(`Error in event listener for ${this.type} ${
                                containerName === null ? "(anonymous container)" : "(container " + containerName + ")"
                            }`, e)
                            errors.push(e)
                        }
                    }
                )
                if (errors.length > 0) {
                    throw errors.shift()
                }
                const tmp = getEvent(parents)
                if (tmp === undefined) return
                type = tmp
                parents = type.type.substring(0, type.type.lastIndexOf("."))
            }
        }
    }

    function createEventUnchecked<Data>(type: string): EventType<Data> {
        class E extends BaseEvent<Data> {
            declare static type: string // assigned using Object.defineProperty below()
            declare static container: EventContainer
        }

        Object.defineProperty(E, "type", {value: type, writable: false, configurable: false})
        Object.defineProperty(E, "name", {
            value: type.replace(/(?:^|\.)(\w)/gi, (p1: string, p2: string) => p2.toUpperCase()) + "Event",
            writable: false, configurable: false
        })
        Object.defineProperty(E, "listeners", {value: new Set(), writable: false, configurable: false})
        Object.defineProperty(E, "transports", {value: new Set(), writable: false, configurable: false})
        Object.defineProperty(E, "container", {value: container, writable: false, configurable: false})
        return E
    }


    function createEvent<Data>(type: string, errorIfExists: boolean = false): EventType<Data> {
        if (type.match(/^([A-Za-z][^.]*?(\.(?!$))?)+$/) === null) {
            throw Error(`Event type name '${type}' must starts with a letter (every level)`)
        }
        const e = getEvent(type)
        if (e !== undefined) {
            if (errorIfExists) {
                throw Error(`An event type with name '${type}' ${
                    containerName === null ? "(anonymous container)" : "(container " + containerName + ")"
                } already exists`)
            } else return e
        }

        const E = createEventUnchecked<Data>(type)

        BaseEvent.registerType(type, E)
        return E
    }


    function getEvent<Data = any>(type: string): EventType<Data> | undefined {
        if (!type.match(/^[a-zA-Z]/)) {
            return undefined
        }
        return BaseEvent.getRegisteredType(type) as EventType<Data>
    }


    const container = {createEvent, getEvent}
    return container
}

const {createEvent, getEvent} = createContainer("global")

function createSimpleEvent(type: string, errorIfExists: boolean = true): EventType<void> {
    return createEvent<void>(type, errorIfExists)
}

export {createContainer, createEvent, createSimpleEvent, getEvent}
