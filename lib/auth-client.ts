import { inferAdditionalFields } from "better-auth/client/plugins"
import { polarClient } from "@polar-sh/better-auth/client";
import { createAuthClient } from "better-auth/react"
import { auth } from "./auth"
export const authClient = createAuthClient({
     plugins: [inferAdditionalFields<typeof auth>({}), polarClient()],
})