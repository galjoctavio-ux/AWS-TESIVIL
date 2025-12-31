module.exports = {
    apps: [
        {
            name: 'qr-webview',
            script: 'npm',
            args: 'start -- -p 3003',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
