# Vercel preview deployment

Live preview: https://novacart-updated-preview.vercel.app

Deploy this repository's `novacart-updated-preview` branch with the repository root as the project root. `vercel.json` builds `client/dist`, sends `/api/*` requests to the exported Express app in `api/index.js`, and serves React routes from `index.html`.

Configure these server-side environment variables in Vercel:

- `MONGO_URI`: an authenticated cloud MongoDB connection string. Local MongoDB and `mongodb-memory-server` cannot run inside Vercel Functions.
- `JWT_SECRET`: a unique, random signing secret.
- `NODE_ENV=production`
- `CLIENT_URL`: the deployed storefront origin.
- `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-3.5-flash-lite` for AI features.

Secrets are stored in Vercel's encrypted environment settings and excluded from Git. Cloudinary and Razorpay remain optional and unconfigured on this preview. The payment simulator does not transfer money.

The hosted preview uses a separate Atlas Free cluster with 2,500 sample products. Its administrator has a generated private password, not the public password used by the local demo seeder. No fake reviews or customer accounts were loaded into the hosted database.

Verification completed: frontend build, `/api/health`, product listing, React route refresh, authenticated administrator login/access, and Gemini shopping recommendations. This is a demonstration deployment; the checkout and inventory limitations documented in README still apply.
