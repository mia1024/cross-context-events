require("global-jsdom/register")
require("jsdom-worker")
global.expect = require("expect")
process.on("unhandledRejection", e => {
    throw e
})
