import type {Event, EventType, TransportData, TransportInit} from "./types";

// from https://github.com/purposeindustries/window-or-global
const GLOBAL = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global.global === global && global) ||
    this

class Transport {

    private readonly recvingFunc: (listener: (e: { data: TransportData }) => void) => void
    private readonly sendingFunc: (data: TransportData) => void

    constructor(init: TransportInit) {
        this.recvingFunc = init.recving
        this.sendingFunc = init.sending
    }

    bind(Event: EventType<any>) {
        const type = Event.type
        const container = Event.containerName

        if (container === null) {
            throw Error("Anonymous containers cannot bind to cross context transport")
        }

        this.recvingFunc((e) => {
            const data = e.data
            if (data.e !== "x" || data.c !== container || data.t !== type) return
            new Event(data.d).emit({
                relay: data.r
            })
        })
    }

    send(e: Event<any>,relay:boolean) {
        this.sendingFunc(
            {
                c: (e.constructor as EventType<any>).containerName!,
                d: e.data,
                e: "x",
                r: relay ,
                t: e.type
            }
        )
    }
}

const WINDOW_TRANSPORT = new Transport({
    recving(listener) {
        if (!GLOBAL) throw Error("Cannot find global object (window)")
        GLOBAL.addEventListener("message", listener)
    }, sending(data) {
        if (!GLOBAL) throw Error("Cannot find global object (window)")
        GLOBAL.postMessage(data, window.location.origin)
    }
})

export {WINDOW_TRANSPORT, Transport}
