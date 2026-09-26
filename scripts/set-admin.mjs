/**
 * Grants the Firebase Auth `admin` custom claim to one account.
 *
 * SECURITY: Run this script only on a trusted machine/server. Never bundle
 * firebase-admin or a service-account credential into the browser application.
 *
 * Required environment variables:
 *   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account.json
 *   ADMIN_EMAIL=admin@example.com
 *
 * Usage:
 *   npm run set-admin
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const adminEmail = process.env.ADMIN_EMAIL;

if (!credentialsPath || !adminEmail) {
  console.error('Missing GOOGLE_APPLICATION_CREDENTIALS or ADMIN_EMAIL.');
  process.exit(1);
}

if (!fs.existsSync(credentialsPath)) {
  console.error(`Service account file not found: ${credentialsPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth(app);
const user = await auth.getUserByEmail(adminEmail);
await auth.setCustomUserClaims(user.uid, { admin: true });

console.log(`Admin claim granted to ${adminEmail} (${user.uid}).`);
console.log('The user must sign out and sign back in before the browser receives the new claim.');
