# Cross Context Events

Cross context events is a robust, lightweight package providing 
the option to send and receive events across JS execution context. 

## Features

- Lightweight
    - 1.12KB GZipped + minified
    - 3.1KB Minified
    - No runtime dependency
- Containerization
    - Support for named and anonymous containers to provide isolation if you need
- Unified interface
    - Works in Node and browser exactly the same way
- Cross Context
    - Capable of sending events across execution context (e.g. from one tab to 
      another tab in browser or from one process to another process in Node) 
      with minimal setup, so long as an IPC channel can be established between
      the sending context and receiving context.
    - Relay support: events can be optionally relayed across the network if 
      you have one, see below for details.
- Typescript support
    - In fact, `cross-context-events` is written in typescript.
- Comprehensive testing
    - All core functions are unittested
- Namespaced events and bubbling
    - If you emit an event for `event.context.new`, then listeners for 
      `event.context` and `event` are also notified (but `event.context2` is not). 
      This behavior can be disabled if desired.
      
## Why (a.k.a the problems)

Both Node and modern browsers support custom events, however they don't really
make sense (calling something `Emitter`? Really?). They also don't have any 
support for namespace and containerization. Most importantly: 
- Events are passed as strings instead of objects, which means if you ever 
  decide to change the name of some events, you need to try really hard to hunt down
  every single occurrence of that string (if you have dynamically calculated string
  in runtime? Good luck, I will pray for you). Also, you can never be sure what
  kind of data you will get from a particular event's payload (or maybe you 
  are sure, but typescript isn't).
- No support for cross context execution. While you can always spawn IPC channels
  and maintain them yourself, doing so is error prone and you might have flying 
  messages that are hard to trace (again, partially because IPC messages 
  are strings too)
- There are some subtle functional and syntactical differences between the browser
  events and Node events, so that code written for Node cannot be easily executed
  in the browser and vice versa without having to rewrite the event interfaces.

## The solutions

To address the issues above, `cross-context-events` was created. It was 
originally created to support executing the same set of code that can run 
both as web pages (uses `window.postMessage`) and as a browser extension (uses 
`browser.runtime.sendMessage`). The specific solutions to the issues above are
- All events are maintained as objects and they can be imported/exported between
  modules. If you want to rename it, you can just change the name from where the 
  event was created and your IDE can just track down all the usages of that variable
  and rename all of them. 
  - If you really want to pass a string for some reason, you can always use 
    `getEvent(name)` to get the object, although this would lose the benefit 
    mentioned above
  - If you use typescript, it can infer the data type in all event 
    creation and in listeners. For example, if you created an event with
    `const Event=createEvent<number>("foo.bar")`, then when you do
    `Event.addListener(e => someVariable += e.data)`, typescript knows that
    `e.data` is of type number. 
- Built-in support for cross-context executions (after all, this is what the 
  package was mostly written for). If you can somehow communicate between the 
  contexts (e.g. if you can use `window.postMessage`) or even using a server
  as a proxy and use a WebSocket. So long as communication can be established,
  you can just use a few lines of configuration to tell `cross-context-events`
  how to use that channel and it will handle everything else.
    - If, you have a mini-network and do not have direct communication between
      some nodes of the network, you can configure `cross-context-events` to 
      relay the information between nodes. For example, if you have window 
      `A`, `B`, and `C` where `A <=> B <=> C` are the available communication paths,
      you can enable the relay feature so that events emitted in `A` can be 
      received by both `B` and `C`. A more complex graph is also supported and 
      `cross-context-event` will avoid emitting the same event twice in a single
      context, even if there are cycles in your network of 
      windows/iframes/childProcesses/whatever.
- Even if you don't use the cross context execution feature, you can still enjoy
  all other benefits from this package, and it's very lightweight so you can 
  just add it without any trouble. For one thing, you can run it in both Node
  and browser without having to rewrite any code if you don't use the cross-context
  feature. 

## Installation
yarn
```bash
yarn add cross-context-events
```

npm
``` 
npm install cross-context-events
```

Note: it's recommended you add it as a dependency instead of a devDependency
so that you only get the core package, instead of all the things like eslint 
and webpack that you most likely don't need. Althought this package doesn't have 
any runtime dependency, it does have a decent amount of devDependencies. 

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
