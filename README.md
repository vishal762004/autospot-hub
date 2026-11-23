# Auto Spot Hub

Auto Spot Hub is a portfolio-grade automotive marketplace built with React, TypeScript, Vite, Firebase Authentication, Cloud Firestore, Tailwind CSS, and jsPDF.

## Brand logo policy

Brand cards render real automotive brand marks from the Simple Icons SVG CDN. The React app does not import the icon package at runtime, so a missing JavaScript export cannot break the page. The Mercedes-Maybach card uses the Mercedes-Benz parent mark while keeping Mercedes-Maybach as the displayed brand name.

## Inventory image policy

The catalogue uses one local image asset per vehicle. Exact duplicate image files were removed so the same photograph is not reused for multiple catalogue records. The bundled images are intended for portfolio/demo use; verify licensing and replace representative assets with model-specific licensed photography before commercial publication.

## Features

- 28-vehicle luxury catalogue with local image assets and filtering
- Vehicle detail views
- Shopping cart
- Firebase email/password and Google authentication
- Private user profiles
- Private customer orders and test-drive bookings
- Admin dashboard protected by Firebase Auth custom claims
- Firestore security rules for user ownership and admin authorization
- Firebase Hosting configuration for the Vite single-page application
- Document verification step with privacy-safe checklist status
- Professional PDF customer order-summary generation
- Responsive UI with reusable React components
- Automated tests for pricing calculations and Firestore security rules

## Technology

- React 19.3
- TypeScript
- Vite 8.3
- Tailwind CSS 4
- Firebase Web SDK 12.19
- Firebase Admin SDK 14.4 (trusted tooling only)
- Vitest
- jsPDF
- Lucide React
- Motion

The versions above reflect the package versions targeted by this project as of September 2026. React 19.3 and Vite 8.3 are the targeted stable versions for this revision.

## Important security model

Authentication and authorization are separate concerns.

Normal users can only access their own profile, orders, and test-drive records. Admin operations require the Firebase Auth custom claim:

```text
admin: true
```

The browser never decides whether a user is an admin. Firestore Security Rules enforce the authorization on the server side.

### Grant admin access

1. Create/download a Firebase service-account credential on a trusted machine.
2. Do **not** commit the credential to Git.
3. Set:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\service-account.json"
$env:ADMIN_EMAIL="your-admin-email@example.com"
```

4. Run:

```bash
npm install
npm run set-admin
```

5. Sign out and sign back in to refresh the Firebase ID token.
6. Deploy `firestore.rules`.

The Firebase Admin SDK is server-side tooling and must not be included in the browser bundle.

## Firebase Hosting deployment

The repository includes Firebase Hosting configuration for the Vite `dist/` output and a single-page-app rewrite. See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the complete checklist, emulator validation, authentication setup, deployment command, and demo limitations. The intended Firebase project is `auto-spot-hub`.

Deploy only after `npm ci` and the complete Firestore Emulator-backed `npm run check` pass. The deployment command publishes Hosting and Firestore rules; it does not deploy Cloud Functions or Storage rules.

## Local setup

Prerequisites:

- Node.js 22.12+
- Java 21+ for the Firestore Emulator
- Firebase CLI 15.37.0+
- Access to the Firebase project

Install dependencies:

```bash
npm install
```

Configure the Firebase app configuration used by `src/lib/firebase.ts` and the required environment values for your deployment.

Run locally:

```bash
npm run dev
```

Run the complete checks with a temporary Firestore Emulator:

```powershell
npx --yes firebase-tools@15.37.0 emulators:exec --only firestore --project demo-autospot-hub "npm run check"
```

## Payment status

This repository intentionally does **not** collect raw card numbers or CVV values. The checkout UI is a demo flow. For a real deployment, integrate a PCI-compliant payment provider and verify the payment server-side before creating an order.

## Pricing and tax model

The displayed taxes and fees are an **illustrative demo pricing model**, not a legal or universal Indian tax calculator. Production deployment should source applicable GST, RTO, insurance, TCS, registration, and state-specific charges from verified business/legal data.

## Project structure

```text
src/
├── components/
├── data/
├── lib/
│   └── firebase.ts
├── utils/
│   ├── pdfGenerator.ts
│   └── taxCalculator.ts
├── types.ts
├── App.tsx
└── main.tsx
scripts/
└── set-admin.mjs
tests/
├── firestore.rules.test.ts
└── taxCalculator.test.ts
firestore.rules
firebase.json
.firebaserc
DEPLOYMENT.md
vitest.config.ts
```

## Production roadmap

- Add a real payment provider with server-side verification
- Add Firebase App Check
- Move checkout/order creation to trusted backend functions
- Add integration and end-to-end tests with Playwright
- Keep the configured GitHub Actions CI quality gate passing on every pull request
- Add inventory reservation/transaction handling
- Add server-generated timestamps and audit events
- Add monitoring and structured error reporting


## UI Architecture
The customer-facing interface is built with React and TypeScript. Reusable catalogue, authentication, checkout, profile, review, contact, and admin views live in `src/components`; the root `App.tsx` coordinates only cross-page state and navigation.

## Inventory
The demo showroom contains 28 vehicle records across luxury sedans, SUVs, sports cars, supercars, and electric/hybrid categories. Inventory is centralized in `src/data/cars.ts`. The repository contains the real-photo source manifest and prepares the 28 local vehicle photographs under `public/images/cars/` on first run. Keeping the photos local after preparation avoids runtime third-party image-host dependencies and improves browsing speed. `CarCard` uses a neutral non-car fallback only when a prepared photo cannot be loaded.

### Search

The showroom search matches brand, model, category, engine, power, transmission, fuel type, performance fields, and listed vehicle features. Search/filter changes reset pagination to the first result page.


## Contact

Project contact: `+91 7657881959` · `itsmevishal76@gmail.com`

## Real vehicle photos and local brand logos

Auto Spot Hub does not hotlink vehicle photographs or brand marks during normal browsing. The project ships the source manifests and one-time asset preparation scripts so a developer with internet access can download the real source images/logos into local assets. This keeps normal browsing fast and avoids runtime dependency on external image servers.

Run once after cloning:

```bash
npm install
npm run prepare:assets
```

The car asset script downloads resized Wikimedia Commons thumbnails (or the documented official Mahindra source) and stores them under `public/images/cars/`. The brand script stores real SVG marks under `public/images/brands/`. Review each source page and its current license/terms before commercial reuse.

Each catalogue entry intentionally has one primary vehicle photograph. The UI does not create fake angles by zooming/cropping one image.

## Real vehicle photo setup
The catalogue is configured with one real vehicle photograph source per listing. `npm run dev` never downloads images, so Vite starts immediately. Before a portfolio demo, run `npm run prepare:assets` once to cache the 800px vehicle thumbnails and brand SVGs into `public/images/`. Until then, the UI can fall back to the real source URL lazily.

For public GitHub use, review the source/license information in `PHOTO-SOURCES.md` and `BRAND-LOGO-SOURCES.md` and keep only assets you are permitted to redistribute.


## Final project status

This repository is a **portfolio-grade automotive marketplace demo**, not a live dealership commerce platform. The UI, Firebase authentication, Firestore access controls, admin dashboard, catalog, cart, demo checkout, test-drive workflow, PDF order summary, validation scripts, tests, and documentation are included.

### Important demo limitations

- Checkout does not process real money or connect to a payment gateway.
- Order totals are calculated in the browser for demonstration and are not authoritative for production commerce.
- Customer reviews are community/demo reviews; purchase verification is intentionally disabled.
- The contact form is a local demo interaction and does not send email.
- Uploaded profile avatars should use Firebase Storage in a production deployment.
- Login/activity audit records require trusted server-side generation for production.

### Recommended production architecture

For real transactions, add trusted server-side code/Cloud Functions for authoritative pricing, tax calculation, inventory checks, payment confirmation, order creation, review verification, and sensitive audit events. Enable Firebase App Check, add rate limiting/monitoring, and validate all sensitive Firestore fields. See `SECURITY.md`.

### Quality checks

Run the complete repository verification locally with:

```bash
npm ci
npm run check
```

The CI workflow in `.github/workflows/ci.yml` runs the same quality gate on pushes and pull requests.

### License

Source code is released under the MIT License. Vehicle photographs, brand logos, and other third-party assets may have separate licenses; review `PHOTO-SOURCES.md` and `BRAND-LOGO-SOURCES.md` before redistribution.
