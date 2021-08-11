# Quickstart

This section only explains how to use the package with plain Javascript. If you
are using Typescript, please also refer to [typescript](typescript) for a few
additional considerations.

## Where to import things

If you are using an ES-module, after [installing](../) the package, you can
simply import the functions such as

```js
import {createEvent} from "cross-context-events"
```

If you are getting the library through a script tag, then after the script is
loaded, you can find everything in `CrossContextEvents` global variable. Such as

```html

<script src="https://unpkg.com/cross-context-events/dist/cross-context-events.min.js"></script>
<script type="text/javascript">
    const {createEvent} = CrossContextEvents
</script>
```

## Emitting cross context events

This example uses
the [WebWorker API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
, but it can be easily switched to Node processes, iFrames, or others by simply
changing the transport used. For details, please refer
to [transports](transports)

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

## Potential issue with Webpack

You might run into issue with Webpack due to the experimental support for
Electron as a transport. If you are not using electron, you should be able to
fix it by adding

```js
module.exports = {
    externals: {
        "electron": "commonjs2 electron"
    }
}
```

to your Webpack configuration. If this is an unacceptable solution, please open
an issue on GitHub. If you do not have the time to open the issue, you can
edit either `cross-context-events/dist/transports.js` (if you installed it as a
dependency) or `cross-context-events/src/transports.ts` (if you installed it as
a devDependency) in your `node_modules` and remove the branches starting with

```
case "ipcMain":
```
and 
```
 case "ipcRenderer":
```

in `createDefaultTransports()`.

## What's next

- [Containers](containers)
- [Transports](transports)
- [Typescript support](typescript)
- [API Reference](api)
