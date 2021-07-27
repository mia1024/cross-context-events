import {Transport} from "./transport";

type EventListener<Data> = (event: Event<Data>) => void

interface Event<Data> {
    data: Data
    listeners: Set<EventListener<Data>>
    type: string
    emit: (options?: {
        relay: boolean
    }) => void
}

interface EventType<Data> {
    new(data: Data): Event<Data>

    container: EventContainer
    containerName: string | null

    listeners: Set<EventListener<Data>>
    addListener(listener: EventListener<Data>): EventType<Data>
    removeListener(listener: EventListener<Data>): EventType<Data>

    transports: Set<Transport>
    addTransport:(transport:Transport)=>void
    removeTransport:(transport:Transport)=>void

    type: string
}

interface EventContainer {
    createEvent<Data>(type: string, errorIfExists?: boolean): EventType<Data>

    getEvent<Data = any>(type: string): EventType<Data> | undefined
}

interface TransportInit {
    recving: (listener: (e: { data: TransportData }) => void) => void
    sending: (data: TransportData) => void
}

/* This object uses one letter names in the hope to save some bandwidth
 * e - event. always 'x'. used for identify data for this package.
 * c - container name. string.
 * t - type name, string.
 * d - data. any.
 */
interface TransportData {
    e: "x" // event: cross context
    c: string // container: name
    t: string // type: name
    d: any // data
    r: boolean// relay
}


export type {EventListener, Event, EventType, EventContainer, TransportData, TransportInit}

