# Introduction

Cross context events is a lightweight event library written in Typescript.

Note: to maintain performance, no runtime type checking is performed. This means that if you pass in the wrong argument
types, you might get some very cryptic errors (most likely something is undefined or something is not a function)
If this is an issue for you, consider using Typescript instead.

## Installation

CDN

```html
<script src="https://unpkg.com/cross-context-events/dist/cross-context-events.min.js"></script>
```

yarn

```shell
yarn add cross-context-events
```

npm

```shell
npm i cross-context-events
```

Note: while this package has no runtime dependencies, it does have quite a few dev dependencies. Therefore, it is
recommended that you install this package without the `--dev` flag if possible, especially if you are not using a
package bundler such as webpack.

Compile from source

```shell
git clone git@github.com:mia1024/cross-context-events
yarn && yarn pack
```

## Why

Both Node and modern browsers support custom events, however they don't really make sense (calling something `Emitter`?
Really?). They also don't have any support for namespace and containerization. Most importantly:

- Events are passed as strings instead of objects, which means if you ever decide to change the name of some events, you
  need to try really hard to hunt down every single occurrence of that string (if you have dynamically calculated string
  in runtime? Good luck, I will pray for you). Also, you can never be sure what kind of data you will get from a
  particular event's payload (or maybe you are sure, but typescript isn't).
- No support for cross context execution. While you can always spawn IPC channels and maintain them yourself, doing so
  is error prone and you might have flying messages that are hard to trace (again, partially because IPC messages are
  strings too)
- There are some subtle functional and syntactical differences between the browser events and Node events, so that code
  written for Node cannot be easily executed in the browser and vice versa without having to rewrite the event
  interfaces.

## What did we do differently

To address the issues above, `cross-context-events` was created. It was originally created to support executing the same
set of code that can run both as web pages (uses `window.postMessage`) and as a browser extension (uses
`browser.runtime.sendMessage`). The specific solutions to the issues above are

- All events are maintained as objects and they can be imported/exported between modules. If you want to rename it, you
  can just change the name from where the event was created and your IDE can just track down all the usages of that
  variable and rename all of them.
    - If you really want to pass a string for some reason, you can always use
      `getEvent(name)` to get the object, although this would lose the benefit mentioned above
    - If you use typescript, it can infer the data type in all event creation and in listeners. For example, if you
      created an event with
      `const Event=createEvent<number>("foo.bar")`, then when you do
      `Event.addListener(e => someVariable += e.data)`, typescript knows that
      `e.data` is of type number.
- Built-in support for cross-context executions (after all, this is what the package was mostly written for). If you can
  somehow communicate between the contexts (e.g. if you can use `window.postMessage`) or even using a server as a proxy
  and use a WebSocket. So long as communication can be established, you can just use a few lines of configuration to
  tell `cross-context-events`
  how to use that channel and it will handle everything else.
    - If, you have a mini-network and do not have direct communication between some nodes of the network, you can
      configure `cross-context-events` to relay the information between nodes. For example, if you have window
      `A`, `B`, and `C` where `A <=> B <=> C` are the available communication paths, you can enable the relay feature so
      that events emitted in `A` can be received by both `B` and `C`. A more complex graph is also supported and
      `cross-context-event` will avoid emitting the same event twice in a single context, even if there are cycles in
      your network of windows/iframes/childProcesses/whatever.
- Even if you don't use the cross context execution feature, you can still enjoy all other benefits from this package,
  and it's very lightweight so you can just add it without any trouble. For one thing, you can run it in both Node and
  browser without having to rewrite any code if you don't use the cross-context feature.

## What's next

- [Getting started](getting-started)
- [Typescript considerations](typescript)
- [Containers and transports](containers-and-transports)
- [API Reference](api)
