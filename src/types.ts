type EventListener<Data> = (event: Event<Data>) => void

interface Event<Data>{
    data: Data
    listeners: Set<EventListener<Data>>
    type: string
    emit:()=>void
}

interface EventType<Data>{
    new(data:Data):Event<Data>
    listeners: Set<EventListener<Data>>
    container: EventContainer
    addListener(listener:EventListener<Data>): EventType<Data>
    removeListener(listener:EventListener<Data>): EventType<Data>
    type: string
}

interface EventContainer{
    createEvent<Data>(type: string, errorIfExists?: boolean):EventType<Data>
    getEvent<Data=any>(type:string):EventType<Data>|undefined
}

export type {EventListener, Event, EventType, EventContainer}

