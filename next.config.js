/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // PWA headers for service worker
    async headers() {
        return [
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Service-Worker-Allowed',
                        value: '/',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
