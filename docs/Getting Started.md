# Getting started

## Emitting simple events

With ES6

```js
import {createEvent} from "cross-context-events"

const InstallSuccessEvent = createEvent("install.sucess")
InstallSuccessEvent.addListener(() => console.log("Successfully installed!"))

let event = new InstallSuccessEvent()
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


