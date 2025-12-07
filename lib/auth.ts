import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db()

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
    }
})