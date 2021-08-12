import expect from "expect"
import {fork} from "child_process"
import path from "path"
import {Transport, createContainer, TransportData, createDefaultTransport} from "../src"
import {readFileSync} from "fs"

describe("transports.ts", () => {

    it("raises an error for anonymous container", () => {
        const container = createContainer(null)
        expect(() => container.useTransport(new Transport({
            recving() {},
            sending() {}
        }))).toThrowError()
        expect(() => container.createEvent("test").useTransport(new Transport({
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

        EmitEvent.useTransport(new Transport({
            recving() {},
            sending(data: TransportData) {
                new TransportEvent(data).emit()
            }
        }, {containerName: RecvEvent.containerName!}))
        RecvEvent.useTransport(new Transport({
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

    it("it works in child process", async () => {
        const container = createContainer("testChildProcess")

        const ECreate = container.createEvent("child.created")
        const child = fork(path.resolve(__dirname, "./processTransport.js"))
        const transport = createDefaultTransport({
            type: "childProcess",
            target: child
        })

        container.useTransport(transport)
        await ECreate.waitForOne()

        const EInit = container.createEvent<number>("child.data.init")
        const EEcho = container.createEvent<number>("child.data.echo")

        const n = Math.random()
        new EInit(n).emit()
        const e = await EEcho.waitForOne()
        expect(e.data).toEqual(n)
    })

    it("works in worker", async () => {
        const {createEvent, useTransport} = createContainer("workerTest")
        const online = createEvent<void>("worker.online")
        const data = createEvent<number>("worker.data")
        const echo = createEvent<number>("worker.echo")
        const worker = new Worker(
            URL.createObjectURL(
                new Blob([
                        readFileSync(path.resolve(__dirname, "./worker.js"), {encoding: "utf-8"})
                    ]
                )
            )
        )

        useTransport(createDefaultTransport({
            type: "worker",
            target: worker
        }))

        await online.waitForOne()

        const n = Math.random()

        const e = echo.waitForOne() // this isn't actually multithreaded so the listener has to be added before
        new data(n).emit()

        expect((await e).data).toEqual(n)
    })

})
