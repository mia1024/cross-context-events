import type {Event, EventType} from "./event_types";

interface TransportInit {
    recving: (callback: ( data: TransportData ) => void) => void
    sending: (data: TransportData) => void
}

/* This object uses one letter names in the hope to save some bandwidth
 * e - event. always 'x'. used for identify data for this package.
 * c - container name. string.
 * t - type name, string.
 * d - data. any.
 */
interface TransportData {
    e: "x" // event: cross context
    c: string // container: name
    t: string // type: name
    d: any // data
    r: boolean// relay
}


class Transport {

    private readonly recvingFunc: (callback: (data: TransportData) => void) => void
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

        this.recvingFunc((data) => {
            if (data.e !== "x" || data.c !== container || data.t !== type) return
            new Event(data.d).emit({
                relay: data.r
            })
        })
    }

    // send the events to all listeners of the transport, excluding self
    send(e: Event<any>, relay: boolean) {
        this.sendingFunc(
            {
                c: (e.constructor as EventType<any>).containerName!,
                d: e.data,
                e: "x",
                r: relay,
                t: e.type
            }
        )
    }
}

type WindowTransportOptions = {
    target: Window
}

type DefaultTransportOptions = {
    type: 'window'
    options: WindowTransportOptions
}

function createDefaultTransport(transportOptions: DefaultTransportOptions) {
    let {type, options} = transportOptions
    switch (type) {
        case "window":
            const target = options.target
            return new Transport({
                recving(callback) {
                    target.addEventListener("message", e => callback(e.data))
                }, sending(data) {
                    target.postMessage(data, target.location.origin)
                }
            })
        default:
            throw Error("Unsupported default transport")
    }
}

export {createDefaultTransport, Transport}
export type {WindowTransportOptions, DefaultTransportOptions, TransportInit, TransportData}
