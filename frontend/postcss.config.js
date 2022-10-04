const isProd = process.env.NODE_ENV === "production";

const usePlugins = [
    require("tailwindcss"),
    require("postcss-flexbugs-fixes"),
    require("postcss-preset-env")({
        autoprefixer: {
            flexbox: "no-2009",
        },
        stage: 3,
        features: {
            "custom-properties": false,
            "nesting-rules": true,
        },
    }),
    require("autoprefixer"),
];

if (isProd) {
    usePlugins.push(require("cssnano")({
        preset: "default"
    }));
}

module.exports = {
    plugins: usePlugins,
};
