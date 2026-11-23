import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _salonbookMongoClient: MongoClient | undefined;
}

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/salonbook";

const client =
  globalThis._salonbookMongoClient ?? new MongoClient(mongoUri);
globalThis._salonbookMongoClient = client;

const db = client.db();

const normalizeUrl = (url?: string) =>
  url ? url.trim().replace(/\/+$/, "") : "";

const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "";
const vercelPreviewUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

const baseURL =
  normalizeUrl(process.env.BETTER_AUTH_URL) ||
  normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ||
  vercelProdUrl ||
  vercelPreviewUrl ||
  "http://localhost:3000";

const trustedOrigins = Array.from(
  new Set(
    [
      baseURL,
      normalizeUrl(process.env.NEXT_PUBLIC_APP_URL),
      normalizeUrl(process.env.BETTER_AUTH_URL),
      vercelProdUrl,
      vercelPreviewUrl,
      "http://localhost:3000",
    ].filter(Boolean)
  )
);

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET?.trim(),
  baseURL,
  trustedOrigins,
  plugins: [nextCookies()],
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
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
