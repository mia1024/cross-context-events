const path = require("path")

module.exports = {
    mode: "production",
    // target: "node",
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    compilerOptions: {
                        declaration: false
                    },
                }
            },
        ]
    },
    entry: "./src/index.ts",
    output: {
        clean: true,
        filename: "cross-context-events.min.js",
        path: path.resolve(__dirname, "dist"),
        library: {
            name: "CrossContextEvents",
            type: "umd"
        }
    },
    resolve: {
        extensions: [".ts"],
    },
    stats: {
        errorDetails: true
    },

}
