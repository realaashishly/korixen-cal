import { inferAdditionalFields } from "better-auth/client/plugins"
import { polarClient } from "@polar-sh/better-auth/client";
import { createAuthClient } from "better-auth/react"
import { auth } from "./auth"
export const authClient = createAuthClient({
     baseURL: process.env.NEXT_PUBLIC_BASE_URL,
     plugins: [inferAdditionalFields<typeof auth>({}), polarClient()],
})