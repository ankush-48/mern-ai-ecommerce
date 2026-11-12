# NovaCart

MERN ecommerce with product discovery, cart, accounts, wishlists, reviews, orders,
administrator tools, optional Gemini assistance, Cloudinary uploads and Razorpay.

## Local development

Requires Node.js 22+ and MongoDB Atlas or a MongoDB replica set (checkout uses transactions).

1. Run `npm ci --prefix server` and `npm ci --prefix client`.
2. Copy `server/.env.example` to `server/.env`; set `MONGO_URI` and a random
   `JWT_SECRET` of at least 32 characters. Never commit secrets.
3. Run `npm run dev --prefix server` and `npm run dev --prefix client` in two terminals.
4. Open http://localhost:5173. Vite proxies `/api`; no client env file is needed.

Cash on delivery works without payment keys. Gemini, online payments and uploads
require their respective server credentials. Missing AI configuration returns a
readable unavailable response; keyword search remains available.

## Deploy on Render with a free Atlas database

`render.yaml` defines one **free** Node service for the API and built React app,
generates the JWT secret and requests `MONGO_URI`.

1. Create an Atlas **Free / M0** cluster in your MongoDB account. Create a database
   user and allow the Render service's outbound IP ranges in Atlas network access.
2. Choose **New > Blueprint** in Render and select this repository. Confirm the
   free instance type, enter the Atlas connection string as `MONGO_URI`, and deploy.
3. Verify `/api/health`, register an account and test checkout using COD.
4. From `server/`, run `node utils/bootstrap.js --catalog` to add six starter
   products to an empty catalogue without fake reviews or demo accounts.
5. To promote a registered account, set `ADMIN_EMAIL` in the command environment
   and run `node utils/bootstrap.js`. This never removes data or resets passwords.
   Run locally against Atlas if your hosting plan has no shell.

Build: `npm run build`. Start: `npm start`. Render supplies `PORT`. React routes
such as `/shop` work on refresh. Keep frontend and API on the same domain for
secure same-site session cookies. Set `CLIENT_URL` for an explicit alternate
origin during local development.

Optional server environment variables:

| Feature | Variables |
| --- | --- |
| Gemini | `GEMINI_API_KEY`, optional `GEMINI_MODEL` |
| Uploads | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |

Enable automatic capture in Razorpay and use test keys until verified end to end.
The API verifies signatures, captured amount, currency, cart contents and payment
ownership. A unique payment ID index prevents reuse. Prices come from the database;
order creation and inventory changes run in a transaction.

Payment capture is external to that transaction: if stock disappears after a
payment is captured, issue a refund through Razorpay. Automatic payment webhooks
and refund reconciliation are not implemented.

Free services have resource limits and cold starts. Atlas Free has limited storage
and no managed backups. Review capacity, backups, shipping/tax policy, refunds and
monitoring before accepting real customer payments. A deployment configuration
alone does not mean a live deployment exists.

## Validation

`npm run build --prefix client` builds the frontend. `npm test` uses a disposable
MongoDB replica set to test forged prices, rollback, concurrent checkout, origin
protection, missing AI configuration and SPA routing. First run downloads an
official MongoDB binary. GitHub Actions runs the build and tests on pushes and PRs.

The old destructive demo seeder is disabled in production and requires
`ALLOW_DESTRUCTIVE_SEED=true` in development. Never use its public demo passwords
in a hosted database; use the non-destructive bootstrap command instead.
