import {Transport} from "./transports"

type EventListener<Data> = (event: Event<Data>) => void
export type EmitOptions={
    relay?: boolean,
    bubble?: boolean
}

interface Event<Data> {
    data: Data
    id:string
    listeners: Set<EventListener<Data>>
    type: string
    relay: ()=>void
    typeClass: EventType<Data>
    emit: (options?: EmitOptions) => void
}

interface EventType<Data> {
    new(data: Data, id?:string): Event<Data>

    container: EventContainer
    containerName: string | null

    listeners: Set<EventListener<Data>>
    addListener(listener: EventListener<Data>): EventType<Data>
    removeListener(listener: EventListener<Data>): EventType<Data>
    once(listener: EventListener<Data>): EventType<Data>
    waitForOne: ()=>Promise<Event<Data>>

    transports: Set<Transport>
    addTransport:(transport:Transport)=>void

    type: string
}

interface EventContainer {
    createEvent<Data>(type: string, errorIfExists?: boolean): EventType<Data>
    addTransport(transport:Transport):void
    getEvent<Data = any>(type: string): EventType<Data> | undefined
    name:string|null
}


export type {EventListener, Event, EventType, EventContainer}

