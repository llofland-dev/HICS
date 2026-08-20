import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Without this, Turbopack infers the workspace root from the repo-root
  // package-lock.json (added for the Supabase CLI) instead of this
  // directory, and silently fails to pick up proxy.ts.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
