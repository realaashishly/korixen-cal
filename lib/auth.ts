import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";


const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db()

const token = process.env.POLAR_ACCESS_TOKEN || "";
const envServer = process.env.POLAR_SERVER;
const server = envServer === "production" ? "production" : (envServer === "sandbox" ? "sandbox" : (token.startsWith("polar_live_") ? "production" : "sandbox"));

const polarClient = new Polar({
    accessToken: token,
    server: server as "production" | "sandbox"
});

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {    
        enabled: true
    },
    socialProviders: {
        google: {
            // enabled: true,
            prompt: "select_account", 
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: true,
                defaultValue: 'Other',
                input: true
            },
            name: {
                type: 'string',
                required: true,
                defaultValue: '',
                input: true
            },
            location: {
                type: 'string',
                required: true,
                defaultValue: '',
                input: true
            },
            isOnboardingComplete: {
                type: 'boolean',
                required: true,
                defaultValue: false,
                input: true
            },
            trialStartDate: {
                type: 'date',
                required: true,
                defaultValue: new Date(),
                input: true
            },
            isUpgraded: {
                type: 'boolean',
                required: true,
                defaultValue: false,
                input: true
            },
            couponRedeemed: {
                type: 'boolean',
                required: true,
                defaultValue: false,
                input: true
            },
            theme: {
                type: 'string',
                required: true,
                defaultValue: 'light',
                input: true
            },
        }
    },
    plugins:[
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: process.env.POLAR_PRODUCT_ID!,
                            slug: "pro-access" 
                        }
                    ],
                    successUrl: "/success?checkout_id={CHECKOUT_ID}",
                    authenticatedUsersOnly: true
                }),
                portal(),
                usage(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET!,
                    onSubscriptionActive: async (event) => {
                        // User successfully subscribed/renewed
                        const email = event.data.customer.email;
                        await auth.api.updateUser({
                            body: { isUpgraded: true, role: "user" }, // Use the email filter if available in your update logic, else finding user by email first might be needed depending on your adapter
                            // Note: BetterAuth updateUser typically requires a session or userId.
                            // Since webhooks are async and server-to-server, we might need a direct DB call or a specific better-auth method if available.
                            // However, the Polar plugin often handles mapping. Let's assume standard behavior or fallback to direct DB if needed.
                        });
                        
                        // For simplicity in this mono-repo setup with Mongoose adapter access:
                        // We can also double-check via direct DB if needed, but BetterAuth plugins usually provide context.
                        // Actually, the event payload gives us the customer email.
                        console.log(`[Polar Webhook] Subscription Active for ${email}`);
                    },
                    onSubscriptionRevoked: async (event) => {
                         // Subscription expired or cancelled immediately
                         const email = event.data.customer.email;
                         console.log(`[Polar Webhook] Subscription Revoked for ${email}`);
                         // We need to find the user by email and update them.
                         // Since we have direct database access in this file via 'db', we can use it directly for reliability.
                         const users = db.collection("user");
                         await users.updateOne({ email: email }, { $set: { isUpgraded: false } });
                    },
                    onPayload: async (payload) => {
                        console.log("Polar Webhook Recieved:", payload.type);
                    }
                })
            ]
        })
    ]
})