// src/lib/polar.ts
import { Polar } from "@polar-sh/sdk";

const token = process.env.POLAR_ACCESS_TOKEN || "";
const server = token.startsWith("polar_live_") ? "production" : "sandbox";

export const polarWrapperApi = new Polar({
  accessToken: token,
  server: process.env.POLAR_SERVER === "production" ? "production" : server,
});

