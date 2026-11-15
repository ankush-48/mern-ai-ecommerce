# NovaCart updated local preview

This branch contains the complete React/TypeScript app from the supplied NovaCart ZIP, including the verified Gemini model configuration and Vite type fix. It is a local demonstration snapshot, separate from the newer JavaScript application and checkout hardening on `main`. Do not replace `main` with this branch without reconciling those changes.

## Setup

Requires Node.js 22+.

1. Run `npm ci --prefix server` and `npm ci --prefix client`.
2. Run `npm install --prefix local-preview`.
3. Run `npm start --prefix local-preview` in one terminal. On first launch this downloads MongoDB 8.0.16, starts an isolated local database and seeds 2,500 sample products. Later launches retain that data. It creates a persistent random JWT secret in the ignored `server/.env` file.
4. Run `npm run dev --prefix client -- --host 127.0.0.1` in another terminal.
5. Open http://localhost:5173.

Alternatively, configure your own development MongoDB through `server/.env` based on the example, then run `npm run dev --prefix server`. The standalone `server/utils/seeder.js` deletes existing collections; only run it against an expendable demo database.

## Service configuration

Secrets are deliberately excluded from Git. Credentials configured on one computer do not transfer with a clone or deployment.

- Gemini: set `GEMINI_API_KEY` on the server. `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`, verified in this preview with AI search and shopping recommendations.
- Razorpay: integration code exists, but keys and end-to-end payment verification have not been configured/tested in this preview. Set the server's `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; only the public ID belongs in `client/.env.local` as `VITE_RAZORPAY_KEY_ID`.
- Cloudinary: optional; set all three `CLOUDINARY_*` variables for remote image uploads. Otherwise the original local data-URL fallback is used.
- Stripe: backend code only; there is no Stripe checkout UI. No Stripe keys are configured.

Optional masked local key form: run `npm run keys --prefix local-preview` and open http://127.0.0.1:5175. Stop the form server after saving. Restart the app to apply changed service keys. It accepts test payment keys only and keeps secrets on the backend.

## Demo accounts and validation

Admin: `admin@novacart.ai` / `Admin@123`.
Customer: `customer@novacart.ai` / `Customer@123`.
These are public demo accounts for the isolated local database only.

Build the frontend with `npm run build --prefix client`.

This snapshot is not production-ready: simulated payments are present, order totals are client-supplied, and inventory/payment integrity needs the hardening present on `main` plus further work. Use test data and test payments. The package name's “enterprise” label does not establish production readiness.
