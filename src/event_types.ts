import {Transport} from "./transport"

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
    typeClass: EventType<Data>
    emit: (options?: EmitOptions) => void
}

interface EventType<Data> {
    new(data: Data): Event<Data>

    container: EventContainer
    containerName: string | null

    listeners: Set<EventListener<Data>>
    addListener(listener: EventListener<Data>): EventType<Data>
    removeListener(listener: EventListener<Data>): EventType<Data>
    once(listener: EventListener<Data>): EventType<Data>
    wait: ()=>Promise<Event<Data>>

    transports: Set<Transport>
    addTransport:(transport:Transport)=>void
    removeTransport:(transport:Transport)=>void

    type: string
}

interface EventContainer {
    createEvent<Data>(type: string, errorIfExists?: boolean): EventType<Data>

    getEvent<Data = any>(type: string): EventType<Data> | undefined
}


export type {EventListener, Event, EventType, EventContainer}

