# Campus Bites Razorpay and counter setup

## Server secrets
Configure on the API host only (never put the secret in Vite variables):
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET
- FIREBASE_SERVICE_ACCOUNT_JSON (complete Firebase service-account JSON stored as a secret)

Install dependencies: `npm install razorpay firebase-admin`.

## Razorpay
1. Activate Razorpay and enable required payment methods.
2. Use Test Mode keys for development.
3. Test successful, failed and cancelled payments.
4. Configure the webhook URL as `https://YOUR_DOMAIN/api/payments/webhook` and subscribe to `payment.captured` and `payment.failed`; use the same webhook secret in `RAZORPAY_WEBHOOK_SECRET`.
5. Switch to Live Mode only after account activation and end-to-end verification.

## Staff provisioning
Create Firestore documents manually in Firebase Console; client users cannot assign themselves privileges:
- `staff/{adminFirebaseAuthUid}`: `{ "role": "admin" }`
- `staff/{counterStaffUid}`: `{ "role": "counter", "stationId": "tiffin" }`
Station IDs: tiffin, juice, bakery, chat.

## Inventory
Create `inventory/{menuItemId}` docs with `{ "name": "...", "stationId": "tiffin", "available": true }`.
Add the actual bakery and chat products to the menu catalog and map them to the correct station before production. Current legacy menu has no bakery/chat catalog entries yet.

## Routes
- /counter/tiffin
- /counter/juice
- /counter/bakery
- /counter/chat
- /admin

## Production checklist
- Razorpay webhook endpoint for payment.captured/payment.failed is implemented; configure the webhook secret and subscribe to both events.
- Publish Firestore rules.
- Configure Firebase Admin service account as a server secret; never commit it.
- Provision staff accounts and inventory docs.
- Test all stations with separate staff accounts and four physical QR scanners.
- Do not treat a client-generated payment reference as proof of payment.
