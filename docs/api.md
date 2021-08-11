# API Reference

Here's the API reference. Any API you can't find here is reserved for internal
use only and may change without notice. Use them at your own risk.

## CrossContextEvents

The global scope of this package. If you are using ES modules, the package name
to import things from is `"cross-context-events"`. See
[where to import things](quickstart?id=where-to-import-things).

### <code>CrossContextEvents.createContainer(name)</code> :id=createContainer

Create a container.

- Name: a string for named container, or `null` for anonymous container.
  Container names must be unique, starts with a letter, and do not contain ASCII
  dot `.` character.
- Returns: A new [EventContainer](api?id=container).

### <code>CrossContextEvents.createEvent(type, errorIfExists = false)</code> :id=createEvent

Create a new event in the global container.

See [EventContainer.createEvent()](api?id=container-createEvent) for more
details.

### <code>CrossContextEvents.createSimpleEvent(type, errorIfExists = true)</code> :id=createSimpleEvent

A Typescript alias for `CrossContextEvents.createEvent<void>()`. Identical
to [CrossContextEvents.createEvent()](api?id=createEvent) in vanilla JS. See
[CrossContextEvents.createEvent()](api?id=createEvent) for arguments.

### <code>CrossContextEvents.getEvent(name: string)</code> :id=getEvent

Find an event in the global container.

See [EventContainer.getEvent()](api?id=container-getEvent) for more details.

### <code>CrossContextEvents.useGlobalTransport(transport)</code> :id=useGlobalTransport

Registers a [transport](api?id=transport) to use globally. This applies to all
events created in the past and future in all named containers.

- `transport`: A [Transport](api?id=transport) object. The transport to
  register.
- Returns: `undefined`
- Typescript signature: `useGlobalTransport(transport: Transport) => void`

### <code>CrossContextEvents.createDefaultTransport(transportOptions)</code> :id=createDefaultTransport

A convenient function providing implementations for some common transports. See
[transports](transports) for more details.

- `transportOptions`: A `DefaultTransportOptions` object. See below for its
  definition.
- Returns: a [Transport](api?id=transport) object.

#### Typescript signature

```typescript
type WindowTransportOptions = {
    type: "window"
    target: Window
}

type IFrameTransportOptions = {
    type: "frame"
    target: HTMLIFrameElement
}

type WorkerTransportOptions = {
    type: "worker"
    target: Worker | DedicatedWorkerGlobalScope
}

type RuntimeTransportOptions = {
    type: "runtime"
    target?: string
}

type ChildProcessTransportOptions = {
    type: "childProcess"
    target: ChildProcess
}

type ParentProcessTransportOptions = {
    type: "parentProcess"
    target: NodeJS.Process
}

type DefaultTransportOptions = WindowTransportOptions
    | IFrameTransportOptions
    | WorkerTransportOptions
    | RuntimeTransportOptions
    | ChildProcessTransportOptions
    | ParentProcessTransportOptions

function createDefaultTransport(transportOptions: DefaultTransportOptions): Transport
```

## EventType :id=eventType

`EventType` is the class for [Event](api?id=event) objects (or instances). All
the methods implemented on `EventType` can be considered as (and many of them
are) the static methods on the class for each individual event. This type is
named `EventType` in part because this is (almost, but not exactly) what is
returned by `typeof (typeof event)` in the early days of this package.

### <code>EventType.container</code> :id=eventType-container

The [container](api?id=container) object for this event type.

- Typescript signature: `EventType.container: EventContainer`

### <code>EventType.type</code> :id=eventType-type

A string for the type (or name) of the event type. This is what you passed into
[createEvent()](api?id=container-createEvent)

- Typescript signature: `EventType.type: string`

### <code>EventType.containerName</code> :id=eventType-containerName

The name of the [container](api?id=container) object containing the `EventType`.
This property is `null` if created in an anonymous container.

- Typescript signature: `containerName: string | null`

### <code>EventType.listeners</code> :id=eventType-listeners

A set of listeners currently registered for the `EventType`

#### Typescript signature

```typescript
type EventListener<Data> = (event: Event<Data>) => void

interface EventType<Data> {
    listeners: Set<EventListener<Data>>
}
```

### <code>EventType.transports</code> :id=eventType-transports

A set of transports currently registered for the `EventType`. Note that this
does not contain any transports registered through
[EventContainer.useTransport()](api?id=container-useTransport) or
[useGlobalTransport()](api?id=useGlobalTransport).

- Typescript signature: `transports: Set<Transport>`

### <code>EventType.waitForOne()</code> :id=eventType-waitForOne

A convenient function for getting the next available event. The return value of
this method can be `await`ed. Note that this will not capture any event that is
already emitted.

- Returns: a `Promise` that resolves to the first event emitted after this
  method is called.

#### Typescript signature

```typescript
interface EventType<Data> {
    waitForOne: () => Promise<Event<Data>>
}
```

### <code>EventType.addListener(listener)</code> :id=eventType-addListener

Add a listener to the event. The listener takes one argument which is the
[event](api?id=event) emitted. For example,

```js
const Event = createEvent("event")

Event.addListener(function (ev) {
    console.log(ev.data) // 5
    console.log(ev === event) // true
})

let event = new Event(5)
event.emit()
```

This method will throw an error when trying to add a listener already
registered.

- `listener`: a function that takes one argument. The listener to register
- Returns: the same [EventType](api?id=eventType) object for fluent style
  chaining.

#### Typescript signature

```typescript
type EventListener<Data> = (event: Event<Data>) => void

interface EventType<Data> {
    addListener(listener: EventListener<Data>): EventType<Data>
}
```

### <code>EventType.removeListener(listener)</code> :id=eventType-removeListener

Remove a listener registered to the `EventType`. This method will throw an error
if the listener to be removed is not registered.

- `listener`: a function that takes one argument. The listener to remove.
- Returns: the same [EventType](api?id=eventType) object for fluent style
  chaining.

#### Typescript signature

```typescript
type EventListener<Data> = (event: Event<Data>) => void

interface EventType<Data> {
    removeListener(listener: EventListener<Data>): EventType<Data>
}
```

### <code>EventType.once(listener)</code> :id=eventType-once

Register an event listener to be only fired once. The listener is automatically
removed after called. This is a shortcut for

```js
const Event = createEvent("event")

function listener(event) {
    Event.removeListener(event)
    // do something with event
}

Event.addListener(listener)
```

- `listener`: a function that takes one argument. The listener to register
- Returns: the same [EventType](api?id=eventType) object for fluent style
  chaining.

#### Typescript signature

```typescript
type EventListener<Data> = (event: Event<Data>) => void

interface EventType<Data> {
    once(listener: EventListener<Data>): EventType<Data>
}
```

### <code>EventType.useTransport(transport)</code> :id=eventType-useTransport

Register a [transport](api?id=transport) onto this event only. For transports
involving more events, consider using
[EventContainer.useTransport()](api?id=container-useTransport) or
[useGlobalTransport()](api?id=useGlobalTransport) instead for better
performance. Note that if you register a transport as both event level and
container level, any time the event is emitted it will be sent out twice.

- `transport`: A [transport](api?id=transport) object to register.
- Typescript Signature: `useTransport: (transport: Transport) => void`

### <code>EventType.new(data, id)</code> :id=eventType-new

The `new` operator for `EventType`. Used to create new [Events](api?id=event).

- `data`: any object serializable by the underlying transport, if any.
- `id`: Optional. string. The id for the event used to avoid circular reference
  in transport. If you provide one, please make sure it's unique, or some of the
  events received from transports will not be fired for any event with a
  colliding id. By default, this is the string representation of a random UUID4.
- Returns: an [Event](api?id=event) object.
- Typescript signature: `new(data: Data, id?: string): Event<Data>`

## Event :id=event

The Event interface. This is the object constructed by using the `new` operator
on an [EventType](api?id=eventType). See [events](events) for a guide.

### <code>Event.id</code> :id=event-id

The ID for the event. By default, this is the string representation of a random
UUID4.

- Typescript signature: `id: string`

### <code>Event.data</code> :id=event-data

The data associated with this event. This is what you passed into
[EventType.new()](api?id=eventType-new). May be `undefined`.

#### Typescript signature

```typescript
interface Event<Data> {
    data: Data
}
```

### <code>Event.listeners</code> :id=event-listeners

A set of listeners that are registered to this event type.

#### Typescript signature

```typescript
type EventListener<Data> = (event: Event<Data>) => void

interface Event<Data> {
    listeners: Set<EventListener<Data>>
}
```

### <code>Event.type</code> :id=event-type

The type (or name) of the event as a string. Can be passed
into [getEvent()](api?id=container-getEvent) to retrieve the EventType object
(but it's probably better to use [Event.typeClass](api?id=event-typeClass)
instead).

- Typescript signature: `Event.type: string`

### <code>Event.typeClass</code> :id=event-typeClass

The [EventType](api?id=eventType) from which this event is constructed from. In
practice, `event.typeClass` is identical to `event.constructor` but more
typescript friendly.

#### Typescript signature

```typescript
interface Event<Data> {
    typeClass: EventType<Data>
}
```

### <code>Event.relay(from)</code> :id=event-relay

Relay an event across registered transports without emitting it in the current
execution context.

- `from`: Optional. A [Transport](api?id=transport) object. If set, this
  particular transport will not be used.
- Returns: `undefined`.
- Typescript signature: `relay: (from?: Transport) => void`.

### <code>Event.emit(options)</code> :id=event-emit

Emit the event. This calls all the listeners registered for the event in some
order and send it across all
registered [event level](api?id=eventType-useTransport),
[container level](api?id=container-useTransport), and
[global level](api?id=useGlobalTransport) transports unless `relay` is set
to `false`, in which case the event is only emitted in the current context.

- `options`: an object containing either `bubble`, `relay`, or both fields.
- `options.bubble`: boolean. If set to `false`, event namespace bubbling will be
  disabled. Default is `true`. See [event bubbling](events?id=event-bubbling)
  for an example.
- `options.relay`: boolean. If set to `false`, the event will not be sent
  through any registered [transport](api?id=transport), if any. Default is
  `true`.
- Returns: `undefined`. If any errors occurred in the listeners, the first one
  encountered will be thrown after all listeners have finished executing.

#### Typescript signature

```typescript
type EmitOptions = {
    relay?: boolean,
    bubble?: boolean
}

interface Event {
    emit: (options?: EmitOptions) => void
}
```

## EventContainer :id=container

The event container interface, see [containers](containers) for a conceptual
introduction.

### <code>EventContainer.name</code> :id=container-name

The name of the container, or null if the container is anonymous.

- Typescript signature: `string|null`

### <code>EventContainer.createEvent(type, errorIfExists = false)</code> :id=container-createEvent

Create an event in the current container.

- `type`: string. The type (or name) for the event.
- `errorIfExists`: Optional. boolean. If set to true, creating two events with
  the same name within the same container with result an error. If false, the
  existing event will be returned. Default is false.
- Returns: A new [EventType](api?id=eventtype) object.
- Typescript
  signature: `createEvent<Data>(type: string, errorIfExists?: boolean) => EventType<Data>`

### <code>EventContainer.useTransport(transport)</code> :id=container-useTransport

Apply the transport to the current container, including all events already
created and to be created in the future. Calling this method on an anonymous
container will result in an error.

- `transport`: A [Transport](api?id=transport) object.
- Returns: `undefined`
- Typescript signature: `useTransport(transport: Transport) => void`

### <code>EventContainer.getEvent(type)</code> :id=container-getEvent

Look up an event type in the current container and returns it if found.

- `type`: string. The type (the name) of the event to look up.
- Returns: An [EventType](api?id=eventType) object if the type exists,
  `undefined` otherwise.
- Typescript
  signature: `getEvent<Data = any>(type: string) => EventType<Data> | undefined`

## Transport :id=transport

The transport interface, see [transports](transports) for a conceptual
introduction.

### <code>Transport.new(init, target)</code> :id=transport-new

The constructor for `Transport`.

- `init`: A [TransportInit](api?id=transportInit) object.
- `target`: Optional. An object with fields `containerName` and `eventType`. If
  set, any event sent from this transport will always target the provided
  container name and event type regardless of the container name and type of the
  event that triggered this. Used mostly for the purpose of unittesting.

#### Typescript signature

```typescript
interface TransportTarget {
    containerName?: string,
    eventType?: string
}

class Transport {
    constructor(init: TransportInit, target: TransportTarget = {})
}
```

### <code>Transport.ignore(id)</code> :id=transport-ignore

This is a static method. Marks an event with a given ID as ignored and never
emit an event for it.

- `id`: string. The ID to ignore.
- Typescript signature: `ignore(id: string) => void`

### TransportInit

An object describing the sending and receiving function for the transport.

#### Fields

- `sending`: a function that takes a single argument `data` and send it out
  using the underlying IPC channel.
- `recving`: a function that takes one callback function to register with any
  underlying IPC channel.

#### Typescript signature

```typescript
interface TransportInit {
    recving: (callback: (data: TransportData) => void) => void
    sending: (data: TransportData) => void
}
```

### TransportData

This object is what [Transports](api?id=transport) use to transmit events across
contexts. This is reserved for internal use only but documented here to aid
potential debugging process. All fields in this object are one letter in the
hope to reduce bandwidths used.

#### Fields

- `e`: Always a string of a single letter `"x"`. Used to identify payloads sent
  by this library.
- `c`: string. the name of the target container.
- `t`: string. the name of the target event type
- `d`: any serializable object by the underlying serialization interface (most
  likely JSON). The data to transmit, if any. Possibly `undefined`.
- `r`: boolean. Whether the event should be relayed. Currently, this is always
  true.
- `i`: string. The ID of the event. Used to identify any possible circular
  messages and ignore them.

#### Typescript signature

```typescript
interface TransportData {
    e: "x" // event: cross context
    c: string // container: name
    t: string // type: name
    d: any // data
    r: boolean// relay
    i: string //id
}
```
