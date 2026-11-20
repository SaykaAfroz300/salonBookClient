# SalonBook — Salon Appointment Booking Platform (Client)

**SalonBook** is a responsive, role-based salon appointment booking web application built with Next.js (App Router), TypeScript, Tailwind CSS, Better Auth, ImgBB image hosting, and Stripe Checkout integration.

## Important Features

- **Public Salon Discovery**: Luxury salon landing page with hero banner, featured active services, category exploration, and an interactive **Browse Services** page with search by name, category filtering, and price sorting.
- **Better Auth Authentication**: Email/password registration (with password strength rules & profile image upload/URL) and Google OAuth login. Role-based redirects after login; admin accounts cannot be created publicly.
- **Protected Service Details & Booking**: Authenticated customers can view full service details and request appointments using predefined time slots with automatic conflict prevention.
- **Customer Dashboard**: Role-protected sidebar dashboard with overview stats, **My Appointments** (view details, cancel pending requests, **Pay Now** via Stripe Checkout for confirmed appointments), and **My Profile**.
- **Admin Dashboard**: Role-protected sidebar dashboard with 6 overview KPIs, **Manage Services** (CRUD, ImgBB file upload, Active/Inactive toggle), **Manage Appointments** (confirm pending, cancel pending/confirmed), **Manage Users** (view & block/unblock customers), read-only **Transactions** ledger, and **My Profile**.
- **Verified Stripe Checkout Flow**: Redirects to Stripe Checkout with dedicated Payment Success and Payment Cancel pages; payment status is updated strictly via the server's verified Stripe webhook.

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Authentication**: Better Auth (MongoDB adapter, Email/Password + Google OAuth) + HS256 JWT token bridge (`jose`)
- **Media & Payments**: ImgBB (server-side proxy route) & Stripe Checkout
- **UI & Feedback**: Lucide Icons, Sonner Toast Notifications

## Installation Instructions

```bash
git clone <your-client-repo-url>
cd salonbook-client
npm install
```

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

## Required Environment Variables

Provide values for the following variables in `.env.local` (never commit `.env` or `.env.local` to GitHub):

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `MONGODB_URI`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `IMGBB_API_KEY`

## How to Run Locally

1. Ensure the `salonbook-server` backend is running on `http://localhost:5000`.
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Links

- **Live Website**: `<Add your deployed frontend URL here>`
- **Client Repository**: `<Add your client GitHub repository URL here>`
- **Server Repository**: `<Add your server GitHub repository URL here>`
