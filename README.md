# Cross Context Events

![](https://badgen.net/npm/v/cross-context-events)
![](https://badgen.net/bundlephobia/min/cross-context-events)
![](https://badgen.net/bundlephobia/minzip/cross-context-events)
![](https://badgen.net/bundlephobia/dependency-count/cross-context-events)
![](https://badgen.net/npm/types/cross-context-events)
![](https://badgen.net/npm/license/cross-context-events)

Cross context events is a robust, lightweight package providing the option to
send and receive events across JS execution context.

You asked, what does this mean, exactly? Well, it means that when you emit an
event in your script, the same event will also be emitted in all other linked
execution contexts (i.e. other tabs, windows, processes), even on different
computers if you want to! All you need to do is writing a few lines of code to
link them together.

![demo](docs/demos/frames-and-windows/demo.gif)

[Try the demo here](https://mia1024.github.io/cross-context-events/demos/frames-and-windows/)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  [Source code for the demo](https://github.com/mia1024/cross-context-events/tree/main/docs/demos/frames-and-windows)

## Documentations

See [here](https://mia1024.github.io/cross-context-events/).

## Installation

CDN

```html

<script src="https://unpkg.com/cross-context-events/dist/cross-context-events.min.js"></script>
```

yarn

```bash
yarn add cross-context-events
```

npm

```bash 
npm install cross-context-events
```

## Getting started

This example uses
the [WebWorker API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
, but it can be easily switched to Node processes, iFrames, or others by simply
changing the transport used. For details, please refer
to [transports](https://mia1024.github.io/cross-context-events/#/transports)

```js
// index.js

import {
    useGlobalTransport,
    createDefaultTransport,
    createEvent
} from "cross-context-events";

const OnlineEvent = createEvent("worker.online")
OnlineEvent.addListener(() => console.log("Worker is now online ＼(＾▽＾)／"))

let worker = new Worker("worker.js")

useGlobalTransport(createDefaultTransport({
    type: "worker",
    target: worker
}))
```

```js
// worker.js

import {
    useGlobalTransport,
    createDefaultTransport,
    createEvent
} from "cross-context-events";

useGlobalTransport(createDefaultTransport({
    type: "worker",
    target: self
}))

const OnlineEvent = createEvent("worker.online")
new OnlineEvent().emit()
```

## Features

- Lightweight
- No runtime dependency
- Comprehensive [documentations](https://mia1024.github.
  io/cross-context-events/)
- Containerization
    - Support for named and anonymous containers to provide isolation if you
      need
- Unified interface
    - Works the same way whether you are using browser, service worker, node,
      or electron
- Cross Context
    - Capable of sending events across execution context (e.g. from one tab to
      another tab in browser or from one process to another process in Node)
      with minimal setup, so long as an IPC channel can be established between
      the sending context and receiving context.
    - Relay support: events can be optionally relayed across the network if you
      have one.
- Typescript support
    - In fact, `cross-context-events` is written in typescript completely.
- Comprehensive testing
    - All core functions are unittested
- Namespaced events and bubbling
    - If you emit an event for `event.context.new`, then listeners for
      `event.context` and `event` are also notified (but `event.context2` is
      not). This behavior can be disabled if desired.
      
