import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", 
  register: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config options can stay here
};

export default withPWA(nextConfig);