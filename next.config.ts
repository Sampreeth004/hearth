import type { NextConfig } from "next";

// Serve the Firebase Auth handler from our own origin so the sign-in flow is
// same-origin. This keeps popup and redirect sign-in working in browsers that
// block third-party cookies/storage (Chrome, Safari, Brave, Firefox).
const FIREBASE_AUTH_DOMAIN = "fir-chat-app-da571.firebaseapp.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${FIREBASE_AUTH_DOMAIN}/__/auth/:path*`,
      },
      {
        source: "/__/firebase/:path*",
        destination: `https://${FIREBASE_AUTH_DOMAIN}/__/firebase/:path*`,
      },
    ];
  },
};

export default nextConfig;
