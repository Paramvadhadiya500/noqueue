import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js to intercept requests and forward them to AWS safely
  async rewrites() {
    return [
      {
        source: '/api/queue',
        destination: 'https://mgvktchshg.execute-api.ap-south-1.amazonaws.com/default/GetSmartOPDQueue',
      },
    ];
  },
};

export default nextConfig;