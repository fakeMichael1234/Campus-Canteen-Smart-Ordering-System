# Campus Bites

Premium college canteen food ordering frontend built with React, Tailwind CSS, Framer Motion, Lucide Icons, Firebase Authentication, and Firestore.

## What changed

- Modern startup-style landing page, dashboard, menu, cart, checkout, orders, and profile/account pages.
- Firebase Google Authentication with persistent browser sessions.
- Firestore is the source of truth for user data, not localStorage.
- Realtime Firestore listeners restore profile, cart, favorites, orders, settings, and notifications after refresh, logout, and device changes.
- Mobile app-style bottom navigation and responsive layouts.
- Firestore security rules included in `firestore.rules`.

## Firestore structure

```text
users/{uid}
orders/{uid}/history/{orderId}
favorites/{uid}
cart/{uid}
notifications/{uid}
settings/{uid}
```

The Firebase Auth Google UID is the permanent account key.

## Setup

1. Create a Firebase project.
2. Enable Authentication -> Google provider.
3. Create a Firestore database.
4. Copy `.env.example` to `.env` and fill in the Firebase web app config values.
5. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Deploy rules

Install Firebase CLI and deploy Firestore rules:

```bash
firebase deploy --only firestore
```

## Build

```bash
npm run build
npm run preview
```
