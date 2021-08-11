# Containers

Containers are designed to provide some context isolation if needed. Events
created in one container will not be emitted in another container. Every single
event in Cross Context Events has a container, including the ones created
globally
(in which case they reside in the global container).

Containers can be either named or anonymous (with a name of `null`). **Events
from anonymous containers cannot be emitted cross-context** (and you'll get an
error if you try) because it is impossible to locate the receiving event in a
different context without a named container.

## So...what do they do, exactly?

Containers are like sandboxes, they provide some amount of context isolations.
They allow you to create many events with same names and not interfering with
each other. This is to say, if you have two containers

```js
const containerA = createContainer("A")
const containerA = createContainer("B")
```

you can create two distinct events both named `event` in `containerA` and
`containerB`. 

```js
const EventA = containerA.createEvent("event")
const EventB = containerB.createEvent("event")
console.log(EventA === EventB) // false
```

In addition, their listeners will be independent (unless, of course, that 
you made a [transport](transports?id=custom-transport) to bridge them together)

```js
EventA.addListener(() => console.log("event in containerA"))
new EventB().emit() // nothing happens
```

Lastly, `getEvent()` will only find event in its own container
```js
const containerC = createContainer("C")
containerC.getEvent("event") // undefined
```

It is fine if you don't think you need containers, and feel free
to skip this section if this is the case. This library will work just fine even
if you never worry about containers.

## Creating containers

A container object can be simply obtained by

```js
import {createContainer} from "cross-context-events";

const container = createContainer("this is a named container")
```

The name for the container can be any string as long as it does not contain the
ascii dot (0x2e `.`) character and starts with an ascii letter.

You can create anonymous containers by having `null` as its name.

```js
import {createContainer} from "cross-context-events";

const anonymousContainer = createContainer(null)
```

Anonymous containers are always independent of each other and you can create as
many of them as you want (or, more precisely, as your RAM permits). On the other
hand, the names for named containers must be unique and you will get an error if
you try to create two containers with the same name.

## Using containers

You can create events in the container like you normally would, but instead of
calling the global `createEvent()`
function, you call `container.createEvent()`. Similarly, you should
call `container.getEvent()` to get an event when you need to.

Containers cannot be found by names like you can do with `getEvent`, so please
pass the reference around accordingly. Don't lose it!

However, you can always access the container of an event by using
`EventType.container` or, if you have an instance of an event,
`Event.typeClass.container`.

## Containers and cross context events

In order for events in other contexts to be emitted correctly, they must have
the same name and in containers with the same name. What about anonymous
containers, you ask? Well sorry, this is why anonymous containers cannot emit
cross-context events.
