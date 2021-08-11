# Events

Events are the core of this library. In fact, as the name suggests, handling events
is the only thing this library does. The sections below assume you are using
an ES module that's installed through npm.

## Creating events

Events can be created with the `createEvent()` method

```js
import {createEvent} from "cross-context-events"
const Event = createEvent("something.happened")
```

Event names must start with a letter. If you try to create two events with the
same name, the same event object will be returned. That is 

```js
createEvent("something.happened") === createEvent("something.happened")
```

will be true.

## Emitting simple events (without data)

```js
import {createEvent} from "cross-context-events"

const InstallSuccessEvent = createEvent("install.sucess")
InstallSuccessEvent.addListener(() => console.log("Successfully installed!"))

let event = new InstallSuccessEvent()
event.emit()
```

## Emitting events with data

```js
import {createEvent} from "cross-context-events"

const DataReceivedEvent = createEvent("data.received")
DataReceivedEvent.addListener((e) => console.log("Received data is", e.data))

let data = doSomethingToGetSomeData()
let event = new DataReceivedEvent(data)
event.emit()
```

## Listener methods

The common methods `addListener()`, `removeListener()`, and `once()` are supported.

```js 
import {createEvent} from "cross-context-events"

const ListenerAddedEvent = createEvent("listener.add")

function listener() {
    console.log("triggered")
}

ListenerAddedEvent.addListener(listener)
ListenerAddedEvent.removeListener(listener)
ListenerAddedEvent.once(listener)

let event = new ListenerAddedEvent()
event.emit() // one instance of "triggered" will be logged
```

## Event bubbling

By default, events will bubble up to all parents by the event name

```js
import {createEvent} from "cross-context-events"

const BubbleEvent = createEvent("event.bubble")
const Event = createEvent("event") // the order of creation here doesn't actually matter

Event.addListener(() => console.log("Event triggered"))
BubbleEvent.addListener(() => console.log("Bubble triggered"))

let event = new BubbleEvent()
event.emit() // "Bubble triggered" will be logged first, then "Event triggered"
```

If you wish to disable this behavior, then you can pass in the `bubble: false` option

```js 
let event = new BubbleEvent()
event.emit({
    bubble: false
}) // Only "Bubble triggered" will be logged
```

## Lookup event by names

As stated in [introduction](/), the intention of the library is for you to pass event objects around instead of by a
string name. However, if you really need to use strings for whatever reason, you can use the `getEvent()` method

```js
import {createEvent, getEvent} from "cross-context-events"

const Event = createEvent("event")
console.log(getEvent("event") === Event) // true
```

Note that this is subject to the constraint of containers. See [Containers and transports](containers-and-transports)
for more details.

## Event types and typeClasses

You can get the type for the event by accessing `type` and `typeClass` fields

```js
import {createEvent, getEvent} from "cross-context-events"

const Event = createEvent("event.type.name")
console.log(Event.type) // "event.type.name"

let e = new Event()
console.log(e.type) // "event.type.name"
console.log(Event === e.typeClass) // true
```
