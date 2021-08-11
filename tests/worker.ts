import {useGlobalTransport, createDefaultTransport, createContainer} from "../src"

const {createEvent} = createContainer("workerTest")

useGlobalTransport(createDefaultTransport(
    {
        type: "worker",
        target: self as Window
    }
))

const online = createEvent<void>("worker.online")
const data = createEvent<number>("worker.data")
const echo = createEvent<number>("worker.echo")

new online().emit()

data.addListener(e => new echo(e.data).emit())
