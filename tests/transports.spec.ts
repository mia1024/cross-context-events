import expect from "expect"
import {fork} from "child_process"
import path from "path"
import {Transport, createContainer, TransportData} from "../src";

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
        },RecvEvent.containerName!))
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
        let e = await RecvEvent.wait()
        expect(e.data).toEqual(n)

    })

    it("it raises event in child correctly", () => {
        // const child = fork(path.resolve(__dirname, "./processTransport.js"))
    })

})
