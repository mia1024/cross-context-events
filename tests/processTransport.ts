import {createEvent, createDefaultTransport} from "../src"

const Event = createEvent("test.message")
const transport = createDefaultTransport({
    type: "subprocess",
    target: process
})

Event.addTransport(transport)
