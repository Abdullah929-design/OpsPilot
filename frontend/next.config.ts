import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'platform.opspilot.test',
    '*.opspilot.test',
    '*.sslip.io',
    '100.58.183.34.sslip.io',
  ],
};

export default nextConfig;
