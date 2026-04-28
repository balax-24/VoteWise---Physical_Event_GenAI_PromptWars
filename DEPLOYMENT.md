# VoteWise — Deployment Guide

> Complete guide to push to GitHub and get a live Cloud Run URL for the Gen AI Academy submission.

---

## ⚡ How `.env` Works (Important Concept)

VoteWise uses **Vite**, which reads `.env` variables **at build time only**.

```
.env (your secret keys)
       │
       ▼ npm run build
  dist/ (minified JS with keys baked in)
       │
       ▼ deploy
  nginx serves dist/ ← no .env needed here!
```

**This means:**
- ✅ `.env` stays on **your local machine only** — it is gitignored and never committed
- ✅ The GitHub repo has **zero secrets** — only source code
- ✅ The live site works because keys were embedded into the bundle during the Docker build
- ✅ Keys are injected into Docker via `--build-arg` flags (not stored in any file)

---

## Step 1 — Fill In Your `.env` File

Before anything, update your local `.env` with real keys:

```env
VITE_GEMINI_API_KEY=AIzaSy...          # from aistudio.google.com
VITE_FIREBASE_API_KEY=AIzaSy...        # from Firebase Console
VITE_FIREBASE_AUTH_DOMAIN=your-proj.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-proj-id
VITE_FIREBASE_STORAGE_BUCKET=your-proj.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_MAPS_API_KEY=AIzaSy...            # enable Maps Embed API in Cloud Console
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX   # from Google Analytics
```

> You can leave `VITE_MAPS_API_KEY` and `VITE_GA_MEASUREMENT_ID` as placeholders if you don't have them — the app degrades gracefully.

---

## Step 2 — Push to GitHub (WITHOUT `.env`)

```bash
# Navigate to your project
cd "/home/buzzard/Documents/Projects/Gen AI Academy/VoteWise"

# Initialize git (if not already done)
git init
git branch -M main

# Add your remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/votewise.git

# Stage everything EXCEPT .env (it's already gitignored)
git add .

# Verify .env is NOT staged
git status   # .env should NOT appear in the list

# Commit and push
git commit -m "feat: VoteWise - AI-powered civic election guide"
git push -u origin main
```

**Verify repo size < 10 MB:**
```bash
git count-objects -vH
# "size-pack" should be well under 10 MB
```

---

## Step 3 — Get a Cloud Run URL

### Prerequisites (one-time setup)
```bash
# Install Google Cloud CLI if not already installed
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set your project (create one at console.cloud.google.com if needed)
gcloud config set project YOUR_GCP_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Build and Deploy

Read your keys from `.env` and pass them as Docker build args:

```bash
# Load your .env into shell variables
set -a && source .env && set +a

# Build the Docker image with Cloud Build (no Docker needed locally)
gcloud builds submit \
  --tag gcr.io/YOUR_GCP_PROJECT_ID/votewise \
  --substitutions \
    _VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY",\
    _VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY",\
    _VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN",\
    _VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID",\
    _VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET",\
    _VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID",\
    _VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID",\
    _VITE_MAPS_API_KEY="$VITE_MAPS_API_KEY",\
    _VITE_GA_MEASUREMENT_ID="$VITE_GA_MEASUREMENT_ID"
```

> **Simpler alternative** — build Docker locally (requires Docker Desktop):
> ```bash
> # Load env into shell
> set -a && source .env && set +a
>
> # Build with all keys as build args
> docker build \
>   --build-arg VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY" \
>   --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
>   --build-arg VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
>   --build-arg VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
>   --build-arg VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET" \
>   --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
>   --build-arg VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
>   --build-arg VITE_MAPS_API_KEY="$VITE_MAPS_API_KEY" \
>   --build-arg VITE_GA_MEASUREMENT_ID="$VITE_GA_MEASUREMENT_ID" \
>   -t gcr.io/YOUR_GCP_PROJECT_ID/votewise .
>
> # Push to Container Registry
> docker push gcr.io/YOUR_GCP_PROJECT_ID/votewise
> ```

### Deploy to Cloud Run
```bash
gcloud run deploy votewise \
  --image gcr.io/YOUR_GCP_PROJECT_ID/votewise \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi
```

This outputs a URL like:
```
https://votewise-xxxxxxxxxx-uc.a.run.app
```

**That's your Cloud Run URL for the submission form! ✅**

---

## Step 4 — Fastest Option: `gcloud run deploy --source .`

If you want the **single-command** approach, create a `cloudbuild.yaml`:

```bash
cat > cloudbuild.yaml << 'EOF'
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg=VITE_GEMINI_API_KEY=$_VITE_GEMINI_API_KEY'
      - '--build-arg=VITE_FIREBASE_API_KEY=$_VITE_FIREBASE_API_KEY'
      - '--build-arg=VITE_FIREBASE_AUTH_DOMAIN=$_VITE_FIREBASE_AUTH_DOMAIN'
      - '--build-arg=VITE_FIREBASE_PROJECT_ID=$_VITE_FIREBASE_PROJECT_ID'
      - '--build-arg=VITE_FIREBASE_STORAGE_BUCKET=$_VITE_FIREBASE_STORAGE_BUCKET'
      - '--build-arg=VITE_FIREBASE_MESSAGING_SENDER_ID=$_VITE_FIREBASE_MESSAGING_SENDER_ID'
      - '--build-arg=VITE_FIREBASE_APP_ID=$_VITE_FIREBASE_APP_ID'
      - '--build-arg=VITE_MAPS_API_KEY=$_VITE_MAPS_API_KEY'
      - '--build-arg=VITE_GA_MEASUREMENT_ID=$_VITE_GA_MEASUREMENT_ID'
      - '-t'
      - 'gcr.io/$PROJECT_ID/votewise'
      - '.'
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/votewise']
images:
  - 'gcr.io/$PROJECT_ID/votewise'
EOF
```

> **Do NOT commit `cloudbuild.yaml` if it contains actual key values.**
> The substitution variables (`$_VITE_*`) are passed at trigger time — no secrets in the file.

---

## Submission Checklist

| Item | Status | Notes |
|---|---|---|
| Public GitHub repo | ✅ | Must be public, single `main` branch |
| Repo size < 10 MB | ✅ | `node_modules` + `dist` are gitignored |
| `.env` NOT in repo | ✅ | Gitignored — keys baked into Docker build |
| Cloud Run URL | ✅ | `https://votewise-xxx-uc.a.run.app` from Step 3 |
| README in repo | ✅ | `README.md` fully written |
| LinkedIn post | 📝 | Post a brief write-up + your Cloud Run URL |

---

## What Goes In GitHub vs What Stays Local

```
GitHub repo (public)        Local only
─────────────────────       ──────────────
src/                        .env
tests/                      node_modules/
public/                     dist/
Dockerfile          ←──── Contains no secrets (uses build args)
nginx.conf
firebase.json
.firebaserc
README.md
FEATURES.md
package.json
vite.config.js
.env.example        ←──── Safe — only placeholder values
```

---

## Troubleshooting

### "Firebase features disabled" on live site
→ Check your `VITE_FIREBASE_*` build args were correctly passed during `docker build`

### Chat returns "API key missing"
→ Check `VITE_GEMINI_API_KEY` was passed as a `--build-arg`; rebuild the image

### Cloud Run returns 404 on page refresh
→ nginx.conf has the SPA fallback (`try_files $uri /index.html`) — confirm it was copied correctly

### Repo > 10 MB
→ Run `git rm -r --cached node_modules dist` if they were accidentally committed
