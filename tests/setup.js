require("jsdom-global")()
global.expect = require("expect")
process.on("unhandledRejection", e => {
    throw e
})
