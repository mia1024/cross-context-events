# Typescript support

Cross context events fully supports typescript. In fact, this library is written
in Typescript. For the best results with inferences, a few annotation is needed.
For any type that is not documented here, you can find it in
the [API reference](api).

## Annotation in createEvent()

The first (and likely the only) type annotation you need is for `createEvent()`,
and a lot of other things can be inferred. For simple events (one without data),
the annotation for the data type should be `void`

```typescript
import {createEvent} from "cross-context-events"

const SimpleEvent = createEvent<void>("event.simple")
const NumberEvent = createEvent<number>("event.number")

new SimpleEvent() // ok
new SimpleEvent("A") // TS2345: string is not assignable to void

new NumberEvent(5) // ok
new NumberEvent() // TS2554: expected 1 arguments, got 0
new NumberEvent("5") // TS2345: string is not assignable to number
```

## Annotation for getEvent()

Similarly, if you use `getEvent()` to retrieve the event, you must provide a
type annotation or typescript might get mad at you.

```typescript
import {getEvent, createEvent} from "cross-context-events"

createEvent<void>("event.simple")
const SimpleEvent = getEvent<void>("event.simple")

// if you are sure you have created the event, you can use a not null assertion here
// however, only do that if you are really sure because your code will crash if this 
// is not the case
let event = new SimpleEvent!()
event.emit()
```

## Types for events and listeners

If you have enabled `noImplicitAny` option for Typescript, you will need to
provide the type for the argument to your listener function. The return type
of `createEvent` is `EventType`, and the instance is
`Event`.

```typescript
import type {EventType, Event} from "cross-context-event";
import {createEvent} from "cross-context-events"


const DataEvent = createEvent<string>("event.data")
// the type for DataEvent is EventType<string>

DataEvent.addListener(function (e: Event<string>) {
    // do something
})

let event = new DataEvent("Some data")
// the type for event is Event<string>

event.emit()
```

## Types for transport

Typescript might not be able to infer the types for functions
inside `Transport`'s constructor. If you find yourself writing your own
transport and wonder what the types are for the constructor, here you go:

```typescript
import type {TransportData} from "cross-context-events";

new Transport({
    recving(callback: (data: TransportData) => void) {
        // do something with callback
    },
    sending(data: TransportData) {
        // do something with data
    }
})
```

