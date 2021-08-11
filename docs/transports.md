# Transports

Transports are the core of this library. They are what made this library
powerful and enables emitting events cross context.

(In case you are wondering, yes it is possible to connect two containers through
transports and this is actually what some of the unittests are doing).

## Using transports

## Default Transports

To make things easier for everyone, some implementations for common scenarios
requiring transports are provided. Please see
[API reference](api?id=createDefaultTransport) for a detailed list of supported
types and their respective arguments. The big categories for default transports
are:

- iframe
- window
- worker
- process (NodeJS)
- experimental supports for electron and browser extensions, see below.

As a rule of thumb, if you are running into issues with the default transports
that you can't debug in a few minutes, you should probably write your own
transports instead (see below for details).

### Iframe

In an iframe, the transport to use to communicate with the parent window is

```js
// inside iframe

createDefaultTransport({
    type: "window",
    target: window.parent
})
```

and for the parent (the window containing the iframe), it is

```js
// outside iframe

let frame = document.getElementById("id-for-the-iframe")

createDefaultTransport({
    type: "frame",
    target: frame
})
```

The reason of them having different types is that, to talk to the parent within
the iframe, the function to call is `window.parent.postMessage`; whereas, for
the window to talk to the iframe, the function to call is
`frame.contentWindow.postMessage`.

### Window

If you have opened another window through `window.open`, you can talk to that
window using `window.postMessage` as above. In the parent window, the transport
to use is

```js
// in parent window

let newWin = window.open("https://example.com")

createDefaultTransport({
    type: "window",
    target: newWin
})
```

and in the child window

```js
// in the newly opened window

createDefaultTransport({
    type: "window",
    target: window.opener
})
```

### Worker

Worker is similar to window as it uses a `postMessage` method (except, instead
of `window.postMessage`, it uses
`DedicatedWorkerGlobalScope.postMessage`). In the main thread, the transport to
use it

```js
// in main thread

let worker = new Worker("worker.js")

createDefaultTransport({
    type: "worker",
    target: worker
})
```

and then in the worker thread

```js
// in worker thread

createDefaultTransport({
    type: "worker",
    target: self
})
```

The reason for using `self` as target is that worker uses `self.postMessage`
to talk to the main thread.

### Process

If you are using node, you can spawn child processes with IPC channel using
[child_process.fork()](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options)
. On the parent process (the one that called `fork()`), the transport to use is

```js
import {fork} from "child_process"

let child = fork("child.js")

createDefaultTransport({
    type: "childProcess",
    target: child
})
```

And on the child process,

```js
createDefaultTransport({
    type: "parentProcess",
    target: process
})
```

The reason for `target: process` is to communicate with the parent process, the
child needs to call `process.send`

### Content Security Policy

If you are using some browser APIs, you need to deal with content security
policy. In essence, since the underlying transport uses
the `window.postMessage()`, it is subject to same-origin policy like everything
else you do in the browser. If you need to access things from another origin,
consider having the server send out `Access-Control-Allow-Origin` header. If you
have control over the user's browser (or if you are just debugging), you can
launch a chrome instance with `--disable-web-security` flag to bypass it.

### Experimental supports

There are also experimental supports with browser extensions and electron IPC.
They work to the best of my knowledge. However, due to the complexity of setting
up unittests involving either electron or browser extension, they are not tested
regularly. If you are running into issues with them, please consider opening an
issue on GitHub.

## Event relaying

## Writing your own transport :id=custom-transport

While it may sound complicated, a transport is not hard to write. All you need
to do is providing two functions `recving` and `sending` to bridge things
together. For reference, here is the implementation for default transport for
type `window`, which uses the
[Window.postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
.

```js
import {Transport} from "cross-context-events";

new Transport({
    recving(callback) {
        window.addEventListener("message", e => callback(e.data))
    }, sending(data) {
        window.postMessage(data, "*")
    }
})
```

And here is the implementation for type `childProcess`, which uses the
[child process API](https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback)
from NodeJS.

```js
Transport({
    recving(callback) {
        target.on("message", callback)
    }, sending(data) {
        target.send(data)
    }
})
```

as you can see, they are pretty simple. 
