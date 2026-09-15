import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'platform.opspilot.test',
    '*.opspilot.test',
  ],
};

export default nextConfig;
