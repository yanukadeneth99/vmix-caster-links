import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Absolute path to this folder. Without it, Next.js walks up looking for a lockfile and can latch
// onto an unrelated package-lock.json sitting in your home directory.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root: projectRoot },

  // "standalone" makes `next build` emit a self-contained .next/standalone folder with its own
  // server.js and only the node_modules it actually needs. Coolify builds this repo as a Docker
  // image, and standalone keeps that image small because we never ship the full node_modules.
  output: "standalone",
};

export default nextConfig;
