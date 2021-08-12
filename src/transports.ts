/// <reference types="chrome" />
import type {ChildProcess} from "child_process"
import type {Event, EventContainer, EventType} from "./event_types"

interface TransportInit {
    recving: (callback: (data: TransportData) => void) => void
    sending: (data: TransportData) => void
}

interface TransportTarget {
    containerName?: string,
    eventType?: string
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
    private readonly targetEventType: string | undefined

    constructor(init: TransportInit, target: TransportTarget = {}) {
        this.recvingFunc = init.recving
        this.sendingFunc = init.sending
        if (target.eventType) this.targetEventType = target.eventType
        if (target.containerName) this.targetContainerName = target.containerName
    }

    // a central function for all incoming events to be relayed + emitted
    private emitEvent(Event: EventType<any>, data: TransportData) {
        const e = new Event(data.d, data.i)
        eventsSeen.add(data.i)
        if (data.r) {
            e.relay(this)
        }

        e.emit({
            relay: false
        })
    }

    static clearAllEventReferences() {
        eventsSeen.clear()
    }

    static ignore(id: string) {
        eventsSeen.add(id)
    }

    bindEvent(Event: EventType<any>): void {
        const type = Event.type
        const container = Event.containerName

        if (container === null) {
            throw Error("Anonymous containers cannot bind to cross context transport")
        }

        this.recvingFunc((data) => {
            if (data.e !== "x" || data.c !== container || data.t !== type || eventsSeen.has(data.i)) return
            this.emitEvent(Event, data)
        })
    }

    bindGlobal(containers: Map<string, EventContainer>): void {
        this.recvingFunc((data: TransportData) => {
            if (data.e !== "x" || eventsSeen.has(data.i)) return
            const container = containers.get(data.c)
            if (container === undefined) {
                console.warn(`Event targeted to container ${data.c} is received, but no such container is found`)
                console.warn("Event payload", data)
                return
            }
            const Event = container.getEvent(data.t)
            if (Event === undefined) {
                console.warn(`Event targeted to event type ${data.t} (container ${data.c}) is received, but no such event is found`)
                console.warn("Event payload", data)
                return
            }
            this.emitEvent(Event, data)
        })
    }

    bindContainer(container: EventContainer): void {
        if (container.name === null) throw Error("Anonymous containers cannot bind to transports")
        this.recvingFunc((data: TransportData) => {
            if (data.e !== "x" || data.c !== container.name || eventsSeen.has(data.i)) return
            const Event = container.getEvent(data.t)
            if (Event === undefined) {
                console.warn(`Event targeted to event type ${data.t} (container ${container.name}) is received, but no such event is found`)
                console.warn("Event payload", data)
                return
            }
            this.emitEvent(Event, data)
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
                t: this.targetEventType || e.type,
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
    target: HTMLIFrameElement
}

type WorkerTransportOptions = {
    type: "worker"
    target: Worker | Window
}

type RuntimeTransportOptions = {
    type: "runtime"
    target?: string
}

type ChildProcessTransportOptions = {
    type: "childProcess"
    target: ChildProcess
}

type ParentProcessTransportOptions = {
    type: "parentProcess"
    target: NodeJS.Process
}

type ElectronWindowStub = { // typed here to avoid requiring electron for users
    webContents: { send: (channel: string, ...args: any[]) => void }
}

type ElectronIpcMainStub = { // typed here to avoid requiring electron for users
    send: (channel: string, ...args: any[]) => void
    on: (channel: string, ...args: any[]) => void
}

type ElectronIpcRendererStub = { // typed here to avoid requiring electron for users
    send: (channel: string, ...args: any[]) => void
        on: (channel: string, ...args: any[]) => void
}


type ElectronMainTransportOptions = {
    type: "ipcMain"
    // target: Electron.BrowserWindow
    target: {
        win: ElectronWindowStub
        ipcMain: ElectronIpcMainStub
    }
}


type ElectronRendererTransportOptions = {
    type: "ipcRenderer"
    target: ElectronIpcRendererStub
}

type DefaultTransportOptions =
    WindowTransportOptions
    | IFrameTransportOptions
    | WorkerTransportOptions
    | RuntimeTransportOptions
    | ChildProcessTransportOptions
    | ParentProcessTransportOptions
    | ElectronMainTransportOptions
    | ElectronRendererTransportOptions

function createDefaultTransport(transportOptions: DefaultTransportOptions): Transport {
    const {type, target} = transportOptions
    switch (type) {
        case "window":
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    window.addEventListener("message", e => callback(e.data))
                }, sending(data: TransportData) {
                    (target as Window).postMessage(data, "*")
                }
            })
        case "frame":
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    window.addEventListener("message", e => callback(e.data))
                }, sending(data: TransportData) {
                    (target as HTMLIFrameElement).contentWindow!.postMessage(data, "*")
                }
            })
        case "worker":
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    (target as Worker).addEventListener("message", (e: MessageEvent) => callback(e.data))
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
        case "childProcess":
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    (target as ChildProcess).on("message", callback)
                }, sending(data: TransportData) {
                    (target as ChildProcess).send(data)
                }
            })
        case "parentProcess":
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    (target as NodeJS.Process).on("message", callback)
                }, sending(data: TransportData) {
                    const p = (target as NodeJS.Process)
                    if (p.send === undefined)
                        throw Error("IPC channel not established. process.send is undefined")
                    else
                        p.send(data)
                }
            })
        case "ipcMain": { // for scoping
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    (target as {
                        win: ElectronWindowStub
                        ipcMain: ElectronIpcMainStub
                    }).ipcMain.on("cross-context-events", (event: any, args: TransportData) => callback(args))
                }, sending(data: TransportData) {
                    (target as {
                        win: ElectronWindowStub
                        ipcMain: ElectronIpcMainStub
                    }).win.webContents.send("cross-context-events", data)
                }
            })
        }
        case "ipcRenderer": {
            return new Transport({
                recving(callback: (data: TransportData) => void) {
                    (target as ElectronIpcMainStub).on("cross-context-events", (event: any, args: TransportData) => callback(args))
                }, sending(data: TransportData) {
                    (target as ElectronIpcMainStub).send("cross-context-events", data)
                }
            })

        }

        default:
            throw Error(`Unsupported default transport type ${target}, please refer to ` +
                "https://mia1024.github.io/cross-context-events/#/api?id=createDefaultTransport " +
                "for supported types")
    }
}

export {createDefaultTransport, Transport}
export type {WindowTransportOptions, DefaultTransportOptions, TransportInit, TransportData}
