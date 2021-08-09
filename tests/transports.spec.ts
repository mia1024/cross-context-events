import expect from "expect"
import {fork} from "child_process"
import path from "path"
import {Transport, createContainer, TransportData, createDefaultTransport, createEvent} from "../src"

describe("transports.ts", () => {

    it("raises an error for anonymous container", () => {
        const container = createContainer(null)
        expect(() => container.addTransport(new Transport({
            recving() {},
            sending() {}
        }))).toThrowError()
        expect(() => container.createEvent("test").addTransport(new Transport({
            recving() {},
            sending() {}
        }))).toThrowError()
    })

    it("propagates listeners correctly", async () => {
        const container1 = createContainer("test" + Math.random().toString().substring(2))
        const container2 = createContainer("test" + Math.random().toString().substring(2))
        const container3 = createContainer("test" + Math.random().toString().substring(2))
        const EmitEvent = container1.createEvent<number>("event.x")
        const TransportEvent = container2.createEvent<TransportData>("event.transport")
        const RecvEvent = container3.createEvent<number>("event.x")

        EmitEvent.addTransport(new Transport({
            recving() {},
            sending(data: TransportData) {
                new TransportEvent(data).emit()
            }
        }, {containerName: RecvEvent.containerName!}))
        RecvEvent.addTransport(new Transport({
            recving(listener: (data: TransportData) => void) {
                TransportEvent.addListener(e => listener(e.data))
            },
            sending() {}
        }))
        const n = Math.random()
        setTimeout(() => {
            new EmitEvent(n)
                .emit()
        }, 1 + Math.random() * 10)
        const e = await RecvEvent.waitForOne()
        expect(e.data).toEqual(n)

    })

    it("it raises event in child process correctly", async () => {
        const container = createContainer("testChildProcess")

        const ECreate = container.createEvent("child.created")
        const child = fork(path.resolve(__dirname, "./processTransport.js"))
        const transport = createDefaultTransport({
            type: "childProcess",
            target: child
        })

        container.addTransport(transport)
        await ECreate.waitForOne()

        const EInit = container.createEvent<number>("child.data.init")
        const EEcho = container.createEvent<number>("child.data.echo")

        const n = Math.random()
        new EInit(n).emit()
        const e = await EEcho.waitForOne()
        expect(e.data).toEqual(n)
    })

})
