# Cross Context Events

## Emitting simple events

With ES6

```js
import {createEvent} from "cross-context-events"

const InstallSuccessEvent = createEvent("install.sucess")
InstallSuccessEvent.addListener(() => console.log("Successfully installed!"))

let event = new InstallSuccessEvent()
event.emit()
```

With Typescript

```ts
// All type annotations in this examples are optional as they can be resolved 
// through type inference. They are only included for completeness.

import {createEvent} from "cross-context-events"
import type {EventType, Event} from "cross-context-events"

const InstallSuccessEvent: EventType<void> = createEvent<void>("install.sucess")
InstallSuccessEvent.addListener(() => console.log("Successfully installed!"))

let event: Event<void> = new InstallSuccessEvent()
event.emit()
```

## Emitting events with data

With ES6

```js
import {createEvent} from "cross-context-events"

const DataReceivedEvent = createEvent("data.received")
DataReceivedEvent.addListener((e) => console.log("Received data is", e.data))

let data = doSomethingToGetSomeData()
let event = new DataReceivedEvent(data)
event.emit()
```

With Typescript

```ts
import {createEvent} from "cross-context-events"
import type {EventType, Event} from "cross-context-events"

type DataType = ReturnType<typeof doSomethingToGetSomeData>

// unlike the previous example, the DataType here is necessary
const DataReceivedEvent = createEvent<DataType>("data.received")
DataReceivedEvent.addListener((e) => console.log("Received data is", e.data))

let data: DataType = doSomethingToGetSomeData()
let event = new DataReceivedEvent<DataType>(data)
event.emit()
```
