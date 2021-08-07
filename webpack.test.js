const nodeExternals = require("webpack-node-externals")
const path = require("path")

module.exports = {
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ]
    },
    entry: {
        processTransport: path.resolve(__dirname,"tests/processTransport.ts") // mochapack doesn't actually read this so it's fine
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        devtoolModuleFilenameTemplate(info){
            return "/home"+info.resourcePath.substring(8)
        },
        devtoolFallbackModuleFilenameTemplate(info){
            return "/home"+info.resourcePath.substring(8)+"?"+info.hash
        },
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    stats:{
        errorDetails: true
    },
    mode: "development",
    target: "node",
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder from bundling
    devtool:"inline-cheap-module-source-map",
}
