import expect from "expect"
import {fork} from "child_process"
import path from "path"
import {Transport, createContainer, TransportData, createDefaultTransport, createEvent} from "../src";

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
        let EmitEvent = container1.createEvent<number>("event.x")
        let TransportEvent = container2.createEvent<TransportData>("event.transport")
        let RecvEvent = container3.createEvent<number>("event.x")

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
        let n = Math.random()
        setTimeout(() => {
            new EmitEvent(n)
                .emit()
        }, 1 + Math.random() * 10)
        let e = await RecvEvent.waitForOne()
        expect(e.data).toEqual(n)

    })

    it("it raises event in child process correctly", async () => {
        let container = createContainer("testChildProcess")

        let ECreate = container.createEvent("child.created")
        const child = fork(path.resolve(__dirname, "./processTransport.js"))
        const transport = createDefaultTransport({
            type: "childProcess",
            target: child
        })

        container.addTransport(transport)
        await ECreate.waitForOne()

        let EInit = container.createEvent<number>("child.data.init")
        let EEcho = container.createEvent<number>("child.data.echo")

        let n = Math.random()
        new EInit(n).emit()
        let e = await EEcho.waitForOne()
        expect(e.data).toEqual(n)
    })

})
