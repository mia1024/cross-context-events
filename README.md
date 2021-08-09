# Cross Context Events
![](https://badgen.net/npm/v/cross-context-events)
![](https://badgen.net/bundlephobia/min/cross-context-events)
![](https://badgen.net/bundlephobia/minzip/cross-context-events)
![](https://badgen.net/bundlephobia/dependency-count/cross-context-events)
![](https://badgen.net/npm/types/cross-context-events)
![](https://badgen.net/npm/license/cross-context-events)

Cross context events is a robust, lightweight package providing 
the option to send and receive events across JS execution context. 

## Features

- Lightweight
    - 2.5KB GZipped + minified
    - 8.6KB Minified
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
      
## Installation
yarn
```bash
yarn add cross-context-events
```

npm
``` 
npm install cross-context-events
```

## Documentations

See [here](https://mia1024.github.io/cross-context-events/).
