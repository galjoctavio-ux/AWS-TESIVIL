module.exports = function (api) {
    api.cache(false);

    const isProduction = process.env.NODE_ENV === 'production' ||
        process.env.EAS_BUILD_PROFILE === 'production';

    const plugins = [
        "react-native-reanimated/plugin",
    ];

    // Remove console.* statements in production builds
    if (isProduction) {
        plugins.push("transform-remove-console");
    }

    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins,
    };
};