import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _salonbookMongoClient: MongoClient | undefined;
}

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/salonbook";

const client =
  globalThis._salonbookMongoClient ?? new MongoClient(mongoUri);

if (process.env.NODE_ENV !== "production") {
  globalThis._salonbookMongoClient = client;
}

const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ].filter(Boolean),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // Prevents assigning admin role through public signup
      },
      isBlocked: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      phone: {
        type: "string",
        defaultValue: "",
        required: false,
        input: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
