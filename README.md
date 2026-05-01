# Elite Digital Card

Premium digital business cards with QR sharing, vCard download, and PWA install. Built with Vite + React 19, Firebase Auth/Firestore, and Tailwind v4.

**Live:** https://digicardapp.netlify.app
**Sample card:** https://digicardapp.netlify.app/d/sample

## Stack

- **Frontend:** React 19, React Router 7, TypeScript, Tailwind v4, Motion
- **Auth:** Firebase Auth (Google + Phone/SMS with reCAPTCHA)
- **Data:** Firestore (`cards/{id}` + `usernames/{slug}` mapping for unique slugs)
- **PWA:** vite-plugin-pwa (autoUpdate, installable on mobile)
- **Hosting:** Netlify (auto-deploy from `main`)

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm run build    # production build into dist/
```

## Project layout

```
src/
  App.tsx              # auth context + router
  firebase.ts          # Firebase init, Google/phone helpers
  components/
    Landing.tsx        # marketing hero + sample link
    AuthModal.tsx      # Google + phone OTP flow
    Dashboard.tsx      # authenticated card editor
    CardView.tsx       # public profile at /d/:slug
    Navbar.tsx
firestore.rules        # owner-only writes, public reads, slug uniqueness
netlify.toml           # build = vite, publish = dist, SPA redirect
```

## Firestore rules

Cards are publicly readable by slug, writable only by their owner. Slugs are reserved via a separate `usernames` collection in a single batch write to guarantee uniqueness. See `firestore.rules`.
