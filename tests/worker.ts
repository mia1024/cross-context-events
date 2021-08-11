import {useGlobalTransport, createDefaultTransport, createContainer} from "../src";

const {createEvent} = createContainer("workerTest")

useGlobalTransport(createDefaultTransport(
    {
        type: "worker",
        target: self as DedicatedWorkerGlobalScope
    }
))

let online = createEvent<void>("worker.online")
let data = createEvent<number>("worker.data")
let echo = createEvent<number>("worker.echo")

new online().emit()

data.addListener(e => new echo(e.data).emit())
