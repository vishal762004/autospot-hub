# Auto Spot Hub: Firebase deployment guide

This guide deploys the current React/Vite portfolio demo to Firebase Hosting and publishes the Firestore security rules to the Firebase project configured in `.firebaserc`.

**Target Firebase project:** `auto-spot-hub`
**Expected default Hosting URL:** `https://auto-spot-hub.web.app`

Do not use this demo checkout for real payments or real commercial order fulfilment. See the production limitations below before sharing the site as a live commerce service.

## 1. Prerequisites

- Node.js 22.12 or newer.
- Java 21 or newer (required by the Firestore Emulator).
- Firebase CLI 15.37.0 or newer.
- Access to the Firebase project `auto-spot-hub` with permission to deploy Hosting and Firestore rules.
- The project root `.firebaserc` must map the `default` alias to `auto-spot-hub`.

Authenticate with the Google account that has access to the project:

```powershell
firebase login
firebase login:list
firebase login:use vsha87407@gmail.com
firebase projects:list
firebase use
```

Confirm that `firebase projects:list` includes `auto-spot-hub` and `firebase use` reports `default (auto-spot-hub)`. Do not continue if the active project is different.

## 2. Configure Firebase Authentication

In Firebase Console → Authentication → Sign-in method, enable the providers used by the application:

- Email/Password
- Google

In Authentication → Settings → Authorized domains, verify that the deployed Hosting domain is authorized. Add `auto-spot-hub.web.app` if it is not already listed. Keep any existing development domains that you still use.

The app's browser Firebase configuration is in `firebase-applet-config.json`. Firebase web API keys identify the project; they are not service-account credentials. Never put a service-account JSON file, private key, or Admin SDK credential in the browser bundle or Git repository.

## 3. Install and validate locally

From the project root:

```powershell
npm ci
```

Run the full validation through a temporary Firestore Emulator process:

```powershell
npx --yes firebase-tools@15.37.0 emulators:exec --only firestore --project demo-autospot-hub "npm run check"
```

This command starts the local Firestore Emulator, runs inventory checks, brand/local asset checks, TypeScript, unit/security-rule tests, and the production build, then stops the emulator.

If port 8080 is already occupied, stop any manually running Firestore Emulator (press Ctrl+C in its terminal) and retry. Do not start a second emulator on the same port.

Do not proceed if any check fails. Inspect the failed test or build output and fix it first.

## 4. Review what will be deployed

The Firebase configuration deploys only:

- Firestore rules from `firestore.rules`.
- The Vite build output from `dist/` to Firebase Hosting.

The configuration does not deploy Cloud Functions, Storage rules, or any service-account credentials.

Review the current production rules in Firebase Console → Firestore Database → Rules before deployment. Publishing `firestore.rules` replaces the rules currently published for the configured Firestore database. Keep a copy of the previous rules for rollback and deploy only after the emulator tests pass.

## 5. Build and deploy

Build the static site:

```powershell
npm run build
```

Then deploy Hosting and Firestore rules to the explicitly named project:

```powershell
firebase deploy --only hosting,firestore:rules --project auto-spot-hub
```

Read the CLI deployment summary and confirm the project ID is `auto-spot-hub`. If the CLI shows a different project, cancel and correct the active project before retrying.

After a successful Hosting deployment, open:

```text
https://auto-spot-hub.web.app
```

Firebase may also show the `firebaseapp.com` Hosting domain in the deploy summary.

## 6. Post-deployment smoke checks

In a browser, verify:

1. The home page loads and direct refreshes on app routes return the React app (the Hosting rewrite handles SPA routes).
2. Email/password registration and sign-in work.
3. Google sign-in works (check authorized domains if the popup reports an OAuth domain error).
4. A user can read and update their own profile.
5. A user can create and read their own test-drive booking.
6. A user can create and read their own demo order.
7. A normal user cannot read another user's private profile/order/test-drive record or change protected account fields.
8. The admin dashboard works only for an account carrying the server-issued Firebase Auth custom claim `admin: true`.

Do not test destructive actions against real customer records. Use test accounts and clearly identifiable test data.

## 7. Important production limitations

This is a portfolio/demo marketplace, not a production commerce backend:

- Checkout does not process or verify real payments. Do not collect real card details or CVV.
- Order data and tax totals are assembled in the browser. Firestore rules check ownership, status, payment-method enum, and arithmetic consistency, but a browser client is not a trusted source of prices or order truth. For real commerce, move pricing, inventory, payment verification, and order creation to trusted server-side code/Cloud Functions.
- Tax and fee calculations are illustrative and are not a legal/tax calculator.
- Reviews are stored in browser localStorage in this build; Firestore review rules are not currently connected to that UI. Client-side/local data must not be treated as purchase verification.
- Contact form submission is a local demo interaction and does not send email.
- Profile avatars are currently data URLs in Firestore profile documents. Use Firebase Storage with file-size/type validation for a production implementation.
- Login/activity audit writes are disabled from the client. Use trusted server-side event collection if authoritative audit logs are required.
- Enable Firebase App Check, monitoring, abuse controls, and appropriate backend validation before handling real customers or transactions.

A successful deployment publishes the portfolio/demo website and its current Firestore rules; it does not turn the demo checkout into a real payment or fulfilment system.
