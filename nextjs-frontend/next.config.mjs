/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8090',
                pathname: '/images/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8090',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: 'api.propertybikri.com',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: 'propertybikri.com',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: 'www.propertybikri.com',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            }
        ],
    },
};

export default nextConfig;
