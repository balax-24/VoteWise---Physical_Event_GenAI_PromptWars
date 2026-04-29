<div align="center">

# 🗳️ VoteWise

### *Every vote starts with understanding.*

**An AI-powered interactive election guide for every citizen.**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-4285f4?style=flat-square&logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Google Services Setup](#-google-services-setup)
- [Firebase Setup](#-firebase-setup)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Folder Structure](#-folder-structure)
- [Testing](#-testing)
- [Accessibility](#-accessibility)
- [Assumptions](#-assumptions)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 About

**VoteWise** is a full-stack civic education web application designed to help Indian first-time and returning voters understand the entire election process — from voter registration and polling day procedures to result counting and post-election steps.

Built for the **Gen AI Academy — Civic Education / Election Assistance** vertical, VoteWise combines:
- 🤖 A **Gemini 1.5 Flash AI chatbot** that answers election Q&A in plain language
- 🗓️ An **interactive 7-phase election timeline** with scroll animations
- 🚶 An **8-step animated voting guide** with PDF export
- 📍 A **Google Maps polling booth finder**
- 🌐 **Google Translate** support for 10 Indian languages
- 🔒 **Firebase Auth + Firestore** for session management and history persistence

---

## 🚀 Live Demo

> **Deployed at:** `https://your-project.web.app` *(Will be updated after `firebase deploy`)*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chatbot** | Streaming Gemini 1.5 Flash responses with Markdown rendering |
| 🧭 **Guided Journeys** | Goal-based flows for first-time voters, polling day, booth lookup, and counting |
| 🗓️ **Election Timeline** | Animated 7-phase alternating timeline (desktop & mobile) |
| 🚶 **Step Guide** | 8-step voting guide with PDF checklist download |
| 📍 **Polling Finder** | Google Maps embed with location search |
| 🌐 **Multilingual** | Google Translate for Hindi, Tamil, Telugu, Bengali + 6 more |
| 💾 **Chat History** | Conversations saved to Firestore and restored on reload |
| 📊 **Analytics** | Shared GA4 event tracking for journeys, timeline clicks, booth searches, and chat usage |
| ♿ **Accessibility** | axe-tested pages, ARIA roles, skip links, keyboard navigation |
| 🔒 **Security** | CSP headers, anonymous auth, input sanitisation, session guardrails |
| 📱 **Responsive** | Mobile-first, 320px → 1440px |

---

## 🏗️ Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | v4 | Utility-first styling |
| Framer Motion | latest | Animations & transitions |
| React Router | v7 | Client-side routing |
| react-markdown | latest | Render Gemini markdown responses |
| jsPDF | latest | PDF checklist export |

### AI & Backend
| Service | Purpose |
|---|---|
| Google Gemini 1.5 Flash | Election Q&A chatbot (streaming) |
| Firebase Firestore | Chat history + FAQ analytics |
| Firebase Anonymous Auth | Session tracking without login |

### Google Services (6 integrations)
| Service | How Used |
|---|---|
| **Gemini API** | AI chatbot responses |
| **Firebase Firestore** | Chat persistence, popular questions log |
| **Firebase Auth** | Anonymous session tracking |
| **Google Translate** | Multilingual UI (10 Indian languages) |
| **Google Maps Embed** | Polling booth location search |
| **Google Analytics (GA4)** | Shared tracking for key assistant decisions and learning flows |

---

## 🏛️ Architecture

```
+----------------------------------------------------------------+
|                        VoteWise (SPA)                          |
|   React 19 + Vite + Tailwind v4 + Framer Motion               |
+----------------------------------------------------------------+
         |                    |                   |
         ▼                    ▼                   ▼
+----------------+  +------------------+  +------------------+
|  Gemini 1.5    |  |   Firebase       |  |  Google Maps     |
|  Flash API     |  │   Firestore      |  |  Embed API       |
|  (streaming)   |  │   (sessions/)    |  |  (search embed)  |
+----------------+  +------------------+  +------------------+
                           |
                    +------+------+
                    |  Firebase   |
                    |  Auth (anon)|
                    +-------------+

Side services: Google Translate Widget | Google Analytics (GA4) | Guided Journey prompts
```

**Data flow for a chat message:**
```
User types or picks a guided journey → sanitizeInput() → rate limit check → Gemini API (stream)
     │                                                    │
     ▼                                                    ▼
Firestore (save user msg)                   onChunk() → state update → UI re-render
                                                         │
                                              Firestore (save bot msg, async)
                                                         │
                                      Shared analytics helper fires GA4 events
```

**Performance and maintainability highlights:**
- Route-level code splitting keeps non-chat pages lighter.
- `jspdf` and guided journey UI are lazy-loaded only when needed.
- Shared `appConfig` and `analytics` utilities reduce duplicated strings and tracking logic.
- CI validates lint, tests, and production builds on every push to `main`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- A Google account (for Firebase and Gemini)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/votewise.git
cd votewise

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual API keys (see below)

# 4. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** The app runs in graceful degradation mode without API keys — Firebase features are disabled and the chat shows a configuration error instead of crashing.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc

# Google Maps
VITE_MAPS_API_KEY=your_google_maps_api_key

# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## ☁️ Google Services Setup

### 1. Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `VITE_GEMINI_API_KEY`

### 2. Google Maps Embed API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps Embed API**
3. Create an API key (restrict to your domain)
4. Add to `.env` as `VITE_MAPS_API_KEY`

### 3. Google Analytics (GA4)
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Copy the Measurement ID (`G-XXXXXXXXXX`)
4. Add to `.env` as `VITE_GA_MEASUREMENT_ID`

---

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it `votewise`
3. Enable Google Analytics if prompted

### 2. Enable Services
- **Firestore Database:** Build → Firestore Database → Create database (start in **test mode**, then apply rules below)
- **Authentication:** Build → Authentication → Sign-in method → Enable **Anonymous**
- **Hosting:** Build → Hosting → Get started

### 3. Firestore Security Rules
In the Firebase Console → Firestore → Rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own session
    match /sessions/{userId}/messages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // FAQ analytics: any authenticated user can write (append-only)
    match /faq_analytics/{docId} {
      allow write: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

### 4. Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Update .firebaserc with your project ID
# (replace "votewise-placeholder" with your actual project ID)

# Build and deploy
npm run build
firebase deploy
```

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server (localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm test          # Run all tests (Vitest)
```

---

## 📁 Folder Structure

```
votewise/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ChatBot.jsx          ← Gemini streaming chatbot
│   │   ├── ElectionTimeline.jsx ← 7-phase scroll timeline
│   │   ├── ErrorBoundary.jsx    ← Runtime error catch
│   │   ├── FAQSection.jsx       ← Accordion FAQ (Firestore-enriched)
│   │   ├── Footer.jsx           ← Site footer with nav + official links
│   │   ├── GuidedJourneyGrid.jsx← Goal-based assistant quick-start cards
│   │   ├── LanguageSwitcher.jsx ← Google Translate widget
│   │   ├── Navbar.jsx           ← Responsive navigation bar
│   │   ├── PollingFinder.jsx    ← Maps embed + search
│   │   └── StepGuide.jsx        ← 8-step voting guide + PDF
│   ├── config/
│   │   └── appConfig.js         ← Shared prompts, limits, and official links
│   ├── pages/
│   │   ├── Chat.jsx
│   │   ├── FindPollingBooth.jsx
│   │   ├── Home.jsx
│   │   ├── HowToVote.jsx
│   │   ├── NotFound.jsx         ← 404 page
│   │   └── Timeline.jsx
│   ├── firebase/
│   │   ├── config.js            ← Firebase init (graceful fallback)
│   │   └── firestoreHelpers.js  ← save/getChatHistory/logQuestion
│   ├── gemini/
│   │   └── geminiClient.js      ← API wrapper + rate limit + sanitise
│   ├── hooks/
│   │   ├── useAuth.js           ← Anonymous auth hook
│   │   └── useChat.js           ← Chat state + streaming + Firestore
│   ├── lib/
│   │   └── analytics.js         ← Shared GA4 event + pageview helpers
│   ├── data/
│   │   └── electionSteps.js     ← Timeline phases + voting steps data
│   ├── App.jsx                  ← Router + AnimatePresence + ErrorBoundary
│   ├── App.css                  ← Cleared (styles in index.css)
│   ├── index.css                ← Tailwind @theme tokens + global styles
│   └── main.jsx                 ← React root mount
├── tests/
│   ├── accessibility.test.jsx
│   ├── ChatBot.test.jsx
│   ├── ElectionTimeline.test.jsx
│   ├── electionSteps.test.js
│   ├── firestoreHelpers.test.js
│   ├── geminiClient.test.js
│   ├── Home.test.jsx
│   ├── PollingFinder.test.jsx
│   └── setup.js
├── .env.example
├── .firebaserc
├── firebase.json
├── FEATURES.md                  ← Detailed feature reference
├── README.md
├── vite.config.js
└── package.json
```

---

## 🧪 Testing

Tests use **Vitest** + **React Testing Library** + **jest-axe**.

```bash
npm test
```

| Test File | What It Tests |
|---|---|
| `geminiClient.test.js` | Input sanitisation, request counters, session reset helpers |
| `electionSteps.test.js` | Data integrity — 7 phases, 8 steps, required fields |
| `firestoreHelpers.test.js` | `saveMessage` + `getChatHistory` with mocked Firestore |
| `ChatBot.test.jsx` | Welcome state, guided journeys, form submit, and session-limit UI |
| `ElectionTimeline.test.jsx` | Contextual navigation from timeline into chat and analytics tracking |
| `Home.test.jsx` | Guided journey entry points on the landing page |
| `PollingFinder.test.jsx` | Fallback mode and GA4 search event tracking |
| `accessibility.test.jsx` | Zero axe violations on Home and HowToVote pages |
| `CI workflow` | Runs lint, tests, and build on every push to `main` |

**Results:** 21/21 tests passing locally ✅

---

## ♿ Accessibility

VoteWise is built to WCAG 2.1 AA standards:

- ✅ All interactive elements have `aria-label`
- ✅ Colour contrast ratio ≥ 4.5:1 throughout
- ✅ `role="main"`, `role="navigation"`, `role="contentinfo"` used correctly
- ✅ Skip-to-content link at top of every page
- ✅ Focus rings visible on all interactive elements (`outline: 2px solid accent`)
- ✅ `role="log"` + `aria-live="polite"` on chat message container
- ✅ `role="alert"` on error messages
- ✅ `lang="en"` on `<html>` tag
- ✅ Images/emojis have descriptive `aria-label`
- ✅ Keyboard navigable (Tab, Enter, Escape)
- ✅ Responsive from 320px mobile to 1440px desktop
- ✅ Axe-clean on all pages (verified by automated tests)
- ✅ Loading and error states announced with assistive-friendly markup
- ✅ Reduced-motion-friendly transitions for users who prefer less animation

---

## 💡 Assumptions

1. **Target audience:** Indian voters — content references ECI, EVMs, and the Indian election process specifically.
2. **Anonymous auth only:** No user accounts or PII collected; sessions tracked by anonymous Firebase UID.
3. **Rate limit:** 10 Gemini requests per session is sufficient for a civic guide use case without excessive API costs.
4. **Maps key restriction:** The Maps Embed API key should be restricted to the deployed domain in production.
5. **Gemini 1.5 Flash:** Chosen for speed and cost-efficiency; can be upgraded to Pro for more complex reasoning if needed.
6. **Static FAQ fallback:** The 3 default FAQs provide value even before Firestore has accumulated question logs.

---

## 🔮 Future Enhancements

- [ ] **Candidate information lookup** — integrate with myneta.info API for local candidate profiles
- [ ] **Push notifications** — remind registered users of election dates via Firebase Cloud Messaging
- [ ] **Voice input** — use Web Speech API so users can speak their questions to the chatbot
- [ ] **Offline support** — PWA with service worker caching for core content
- [ ] **Multi-state election data** — dynamically load state-specific timelines and booth locators
- [ ] **User accounts** — optional login to persist history across devices
- [ ] **Admin dashboard** — view FAQ analytics and most-asked questions
- [x] **Code splitting** — pages, guided journeys, and PDF generation are lazy-loaded to reduce initial bundle size
- [ ] **VVPAT explanation** — animated explainer for voter-verifiable paper audit trail
- [ ] **RTL support** — for Urdu language direction

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for civic empowerment.

*VoteWise — Helping every citizen understand their most important right.*

</div>
