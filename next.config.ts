import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Enable standalone output for Docker
  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        assert: false,
        path: false,
        url: false,
        util: false,
        querystring: false,
        stream: false,
        http: false,
        https: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
  // Mark nodemailer as external for server-side only
  serverExternalPackages: ['nodemailer'],
};

export default nextConfig;
