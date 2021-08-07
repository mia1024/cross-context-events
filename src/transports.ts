/// <reference types="chrome" />
import type {ChildProcess} from "child_process"
import type {Event, EventType} from "./event_types"

interface TransportInit {
    recving: (callback: (data: TransportData) => void) => void
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
    i: string //id
}

const eventsSeen = new Set<string>()

class Transport {

    private readonly recvingFunc: (callback: (data: TransportData) => void) => void
    private readonly sendingFunc: (data: TransportData) => void
    private readonly targetContainerName: string | undefined

    constructor(init: TransportInit, targetContainerName?: string) {
        this.recvingFunc = init.recving
        this.sendingFunc = init.sending
        this.targetContainerName = targetContainerName
    }

    bind(Event: EventType<any>): void {
        const type = Event.type
        const container = Event.containerName

        if (container === null) {
            throw Error("Anonymous containers cannot bind to cross context transport")
        }

        this.recvingFunc((data) => {
            if (data.e !== "x" || data.c !== container || data.t !== type || eventsSeen.has(data.i)) return
            eventsSeen.add(data.i)
            new Event(data.d, data.i).emit({
                relay: data.r
            })
        })
    }

    // send the events to all listeners of the transport, excluding self
    send(e: Event<any>, relay: boolean): void {
        this.sendingFunc(
            {
                c: this.targetContainerName || (e.constructor as EventType<any>).containerName!,
                d: e.data,
                e: "x",
                r: relay,
                t: e.type,
                i: e.id
            }
        )
    }
}

type WindowTransportOptions = {
    type: "window"
    target: Window
}

type IFrameTransportOptions = {
    type: "frame"
    target: Window
}

type WorkerTransportOptions = {
    type: "worker"
    target: Worker
}

type RuntimeTransportOptions = {
    type: "runtime"
    target?: string
}

type SubprocessTransportOptions = {
    type: "subprocess"
    target: ChildProcess | NodeJS.Process
}


type DefaultTransportOptions =
    WindowTransportOptions
    | IFrameTransportOptions
    | WorkerTransportOptions
    | RuntimeTransportOptions
    | SubprocessTransportOptions

function createDefaultTransport(transportOptions: DefaultTransportOptions): Transport {
    const {type, target} = transportOptions
    switch (type) {
        case "window":
        case "frame":
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    (target as Window).addEventListener("message", e => callback(e.data))
                }, sending(data: TransportData) {
                    (target as Window).postMessage(data, (target as Window).location.origin)
                }
            })
        case "worker":
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    (target as Worker).addEventListener("message", e => callback(e.data))
                }, sending(data: TransportData) {
                    (target as Worker).postMessage(data)
                }
            })
        case "runtime":
            // this uses chrome because both chrome and firefox supports the chrome namespace
            if (target)
                return new Transport({
                    recving(callback: (data: TransportData) => void) {
                        chrome.runtime.onMessageExternal.addListener(callback)
                    }, sending(data: TransportData) {
                        chrome.runtime.sendMessage(target as string, data)
                    }
                })
            else
                return new Transport({
                    recving(callback: (data: TransportData) => void) {
                        chrome.runtime.onMessage.addListener(callback)
                    }, sending(data) {
                        chrome.runtime.sendMessage(data)
                    }
                })
        case "subprocess":
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    const events = require("events")
                    events.addListener("message", callback)
                }, sending(data: TransportData) {
                    (target as ChildProcess).send(data)
                }
            })
        default:
            throw Error("Unsupported default transport")
    }
}

export {createDefaultTransport, Transport}
export type {WindowTransportOptions, DefaultTransportOptions, TransportInit, TransportData}
