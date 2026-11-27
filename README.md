# Marco — Minimalist Monotone Portfolio + Firebase CMS

Minimalist monochrome personal portfolio paired with a single signal-orange (`#FF4D00`) accent, a Google-authenticated CMS (`#/admin`), Cloud Firestore database (Spark Free Tier), and automated GitHub Pages deployment.

## Architecture

- **Frontend:** React + Vite + Tailwind CSS (`base: './'` for GitHub Pages)
- **Database:** Firebase Cloud Firestore (1 document read per visit on the Spark Free Tier)
- **CMS Auth:** Firebase Authentication (Google Sign-In) restricted to `arodisspj2006@gmail.com` via both frontend guard and `firestore.rules`
- **Hosting:** GitHub Pages via `.github/workflows/deploy.yml`

---

## 1. Local Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase Web App credentials, then run:

```bash
npm run dev
```

Open `http://localhost:5173/` for the portfolio and `http://localhost:5173/#/admin` for the CMS.

---

## 2. Firebase Free Tier Setup (Account: `arodisspj2006@gmail.com`)

1. Sign in to [Firebase Console](https://console.firebase.google.com/) with **`arodisspj2006@gmail.com`** and create a project on the **Spark (Free)** plan.
2. **Enable Firestore Database:**
   - Go to **Build → Firestore Database → Create database** (Production mode).
   - Deploy `firestore.rules` (included in this repo) via Firebase Console Rules tab or Firebase CLI:
     ```bash
     npx -y firebase-tools@latest login --reauth
     npx -y firebase-tools@latest use --add
     npx -y firebase-tools@latest deploy --only firestore:rules
     ```
3. **Enable Google Authentication:**
   - Go to **Build → Authentication → Get started → Sign-in method → Google → Enable**.
   - Go to **Authentication → Settings → Authorized domains** and add:
     - `therealarosha.github.io`
4. **Register Web App:**
   - Go to **Project Settings → Your apps → Web (`</>`)**, register the app, and copy the `firebaseConfig` values.

---

## 3. GitHub Pages Deployment (`therealarosha/Marco`)

1. In your GitHub repo (`https://github.com/therealarosha/Marco`), go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
2. Go to **Settings → Secrets and variables → Actions → New repository secret** and add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_ADMIN_EMAIL` (`arodisspj2006@gmail.com`)
3. Push to `main`:
   ```bash
   git push -u origin main
   ```
4. Once deployed, visit `https://therealarosha.github.io/Marco/#/admin`, sign in with `arodisspj2006@gmail.com`, and click **Save to Firebase** to publish initial content to Firestore.
