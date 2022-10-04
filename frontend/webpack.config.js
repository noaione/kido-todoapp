const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProd = process.env.NODE_ENV === "production";
console.info(isProd ? "Production build" : "Development build");

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
    mode: isProd ? "production" : "development",
    entry: "./src/index.tsx",
    output: {
        path: path.join(__dirname, "..", "public", "static", "js"),
        filename: "bundle.[contenthash].js",
        clean: {
            keep: /\.keep$/,
        }
    },
    devtool: 'source-map',
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    // `.swcrc` can be used to configure swc
                    loader: 'swc-loader',
                },
            },
            {
                test: /\.css$/,
                include: /src/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../"
                        }
                    },
                    "css-loader",
                    "postcss-loader"
                ],
                sideEffects: true
            },
            {
                test: /\.(jpe?g|gif|png|svg)/,
                type: "asset/resource",
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
    devServer: {
        port: 4541,
        liveReload: true
    }
}