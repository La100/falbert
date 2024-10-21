const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fal.ai",
      },
      {
        protocol: "https",
        hostname: "fal.media",
      },
    ],
  },
};
 
module.exports = nextConfig;