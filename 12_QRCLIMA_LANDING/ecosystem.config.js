module.exports = {
    apps: [
        {
            name: "qrclima-landing",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3002
            },
        },
    ],
};
