import {createDefaultTransport, useGlobalTransport, Event, createContainer} from "../src"


const transport = createDefaultTransport({
    type: "parentProcess",
    target: process
})
useGlobalTransport(transport)
const {createEvent} = createContainer("testChildProcess")
const ECreate = createEvent<void>("child.created")
const EInit = createEvent<number>("child.data.init")
const EEcho = createEvent<number>("child.data.echo")

EInit.addListener((e: Event<number>) => {
    new EEcho(e.data).emit()
})

new ECreate().emit()
