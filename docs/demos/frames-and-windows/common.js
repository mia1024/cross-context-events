"use strict"

const {
    useGlobalTransport,
    createDefaultTransport,
    createEvent
} = CrossContextEvents

if (window.parent !== window) { // in iframe
    useGlobalTransport(
        createDefaultTransport({
            type: "window",
            target: window.parent
        })
    )
}

if (window.opener !== null) { // in child window
    useGlobalTransport(
        createDefaultTransport({
            type: "window",
            target: window.opener
        })
    )
}

const MessageEvent = createEvent("message")
MessageEvent.addListener((event) => {
    console.log(`event raised in ${window.name ? window.name : "top"}, data is ${event.data}, at ${new Date().getTime()}`)
    document.getElementById("message-display").innerText = event.data
})

const NewFrameEvent = createEvent("frame.new")
NewFrameEvent.addListener(() => createFrame.frameCount++)

function createFrame() {
    let frame = document.createElement("iframe")
    frame.src = "frame.html"
    frame.name = "frame " + createFrame.frameCount
    document.getElementById("frames").appendChild(frame)
    useGlobalTransport(
        createDefaultTransport({
            type: "frame",
            target: frame
        })
    )
    new NewFrameEvent().emit()
}

let initialCount = parseInt(window.location.search.substring(1)) // window
if (Number.isNaN(initialCount)) 
    initialCount = parseInt(window.name.substring(6)) + 1 // iframe
createFrame.frameCount = Number.isNaN(initialCount) ? 0 : initialCount

function createWindow() {
    let win = open("index.html?" + createFrame.frameCount)
    useGlobalTransport(
        createDefaultTransport({
            type: "window",
            target: win
        })
    )
}

function sendMessage() {
    let event = new MessageEvent(document.getElementById("message").value || "a random message " + Math.floor(Math.random() * 1000))
    event.emit()
}
