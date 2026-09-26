# Security notes

Auto Spot Hub is a portfolio/demo application. The browser is not a trusted environment.

## Current demo limitations

- Checkout does not process real payments.
- Order totals are calculated in the browser and therefore are not authoritative for a real commerce system.
- Customer reviews are community/demo reviews; purchase verification is not implemented.
- Contact form submission is local UI only and does not send email.
- Client-side login/activity telemetry must not be treated as an authoritative audit trail.

## Production requirements

Before using this project for real transactions, move order creation, authoritative pricing/tax calculations, inventory checks, payment confirmation, review verification, and sensitive audit events to trusted server-side code or Cloud Functions. Enable Firebase App Check, apply field-level Firestore validation, use Firebase Storage for uploaded media, and add monitoring/rate limiting appropriate to the deployment.

Never commit Firebase service-account credentials, private API keys, or `.env` secrets.
