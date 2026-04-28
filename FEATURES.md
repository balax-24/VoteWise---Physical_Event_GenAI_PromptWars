# VoteWise — Feature Reference

> A complete technical reference of every feature, component, hook, and function in the VoteWise application.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Pages & Routes](#pages--routes)
3. [Components](#components)
4. [Hooks](#hooks)
5. [Firebase Layer](#firebase-layer)
6. [Gemini AI Client](#gemini-ai-client)
7. [Data Layer](#data-layer)
8. [Design System](#design-system)
9. [Analytics Events](#analytics-events)
10. [Security Measures](#security-measures)
11. [Testing](#testing)

---

## Application Overview

**VoteWise** is a single-page React application that helps citizens navigate the Indian election process. It combines a Gemini AI chatbot, interactive visual guides, and Google Maps polling booth discovery into one accessible, multilingual civic tool.

```
┌─────────────────────────────────────────────────────────────┐
│                       VoteWise App                          │
│                                                             │
│  ┌──────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │  Navbar  │  │  Page Content  │  │      Footer        │  │
│  └──────────┘  └────────────────┘  └────────────────────┘  │
│                        │                                    │
│          ┌─────────────┼─────────────┐                     │
│          ▼             ▼             ▼                      │
│   ┌────────────┐ ┌──────────┐ ┌──────────────┐            │
│   │ Gemini API │ │Firestore │ │  Firebase    │            │
│   │ (AI Chat)  │ │ (History)│ │  Auth (Anon) │            │
│   └────────────┘ └──────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Pages & Routes

| Route | Page Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Landing page with hero, feature cards, and FAQ |
| `/how-to-vote` | `HowToVote.jsx` | 8-step animated voting guide with PDF export |
| `/timeline` | `Timeline.jsx` | Interactive 7-phase election lifecycle timeline |
| `/find-booth` | `FindPollingBooth.jsx` | Google Maps polling booth search |
| `/chat` | `Chat.jsx` | Full-screen AI civic assistant chatbot |
| `*` | `NotFound.jsx` | 404 page for unknown routes |

### Page Transitions
All route changes use **Framer Motion `AnimatePresence`** with a fade + 8px vertical slide (duration 0.25s).

---

## Components

### `Navbar.jsx`
**Purpose:** Persistent top navigation bar.

**Features:**
- Sticky positioning (`sticky top-0 z-50`)
- Active route highlighting via `useLocation`
- Desktop: horizontal link bar
- Mobile: compact bottom strip (all 5 routes)
- Google Translate widget (`<LanguageSwitcher />`) embedded in the right section
- Full ARIA: `role="navigation"`, `aria-label`, `aria-current="page"` on active link

---

### `ChatBot.jsx`
**Purpose:** Gemini-powered conversational civic assistant.

**Features:**
- **Streaming responses** — text streams chunk-by-chunk from Gemini, updating in real time
- **Markdown rendering** — bot responses rendered via `react-markdown` + `remark-gfm` (supports bold, lists, tables)
- **Typing indicator** — animated 3-dot bounce shown while Gemini streams
- **Starter questions** — 5 pre-seeded questions shown when conversation is empty
- **Rate limit display** — shows `X/10 remaining` in header badge
- **Double-submit guard** — `isSubmitting` local state prevents sending while a request is in flight
- **Split loading states** — `historyLoading` (initial load) separated from `isLoading` (per-message)
- **Error banner** — inline red alert for API failures without crashing the UI
- **AI avatar badge** — "AI" chip on the left of each bot message bubble
- **Accessible chat log** — `role="log"` + `aria-live="polite"` on message container
- **Character limit** — input capped at 500 characters

**Props:** None (reads from `useAuth` and `useChat` hooks internally)

---

### `ElectionTimeline.jsx`
**Purpose:** Scroll-triggered 7-phase interactive timeline of the Indian election process.

**Features:**
- **Alternating layout (desktop):** Odd phases appear on the right, even on the left, with a centred vertical connector line
- **Single-column layout (mobile):** All cards appear in a left-aligned stack with an icon column — no broken gap
- **Scroll animation:** Each card uses `useInView` and animates in from the appropriate side (`x: ±50`)
- **Icon bounce:** Centre icon blob scales in (`scale: 0 → 1`) as it enters view
- **Phase colours:** Each phase has its own accent colour applied to the heading
- **"Ask AI" button:** Navigates to `/chat` with the phase name pre-filled as the initial question
- **GA4 event:** Fires `timeline_phase_clicked` with the phase name on each click

---

### `StepGuide.jsx`
**Purpose:** 8-step animated guide for voting day, with PDF export.

**Features:**
- **Staggered entry animation:** Cards animate in with 80ms delay increments as they enter the viewport
- **Hover micro-animation:** Cards lift `hover:-translate-y-0.5` on hover
- **Step number badge:** Amber circle with step number in JetBrains Mono font
- **External link support:** Steps with a `link` field show a "Visit Portal →" anchor (e.g. ECI voter search)
- **PDF export (`jsPDF`):**
  - Branded header with VoteWise title in navy
  - `splitTextToSize()` for automatic word-wrapping at the page margin
  - Automatic page-break when content exceeds 260mm
  - Footer with ECI portal URL
  - Saves as `votewise-checklist.pdf`
- **GA4 completion tracking:** Fires `step_guide_completed` when all 8 cards have been scrolled into view (tracked via `useRef` Set, fires once per session)
- **Stable `onVisible` callback:** Wrapped in `useCallback` to prevent unnecessary `useEffect` re-runs in child cards

---

### `PollingFinder.jsx`
**Purpose:** Google Maps embed for finding polling booths near a user-specified location.

**Features:**
- **Search form:** User enters city, pincode, or area name
- **Live map embed:** Updates `<iframe>` `src` to `maps/embed/v1/search?q=polling+booth+near+{location}` on submit
- **Graceful degradation:** If `VITE_MAPS_API_KEY` is missing/placeholder, shows an instructional fallback panel instead of a broken iframe
- **Official portal link:** Prominent button linking to `electoralsearch.eci.gov.in`
- **GA4 event:** Fires `polling_booth_searched` with the location string on each search

---

### `FAQSection.jsx`
**Purpose:** Accordion FAQ, seeded from static defaults, optionally enriched from Firestore.

**Features:**
- **Static defaults:** 3 pre-defined Q&A pairs always present
- **Dynamic questions:** On mount, queries `faq_analytics` Firestore collection (top 5 logged questions) and appends them as community FAQs
- **Accordion toggle:** `aria-expanded`, `aria-controls`, `role="region"`, and `aria-labelledby` wired correctly
- **Always-rendered panels:** Answer `div`s are always in the DOM (toggled with `hidden`/`block`) so `aria-controls` IDs are always valid

---

### `LanguageSwitcher.jsx`
**Purpose:** Renders the Google Translate widget mount point.

**Features:**
- Renders `<div id="google_translate_element">` which the global `googleTranslateElementInit()` script (in `index.html`) initialises
- Supports 10 Indian languages: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu

---

### `Footer.jsx`
**Purpose:** Site-wide footer with navigation and official resource links.

**Features:**
- **Brand section** with logo + tagline
- **Internal nav links** to all 5 routes
- **External official resource links:** ECI Voter Portal, Electoral Search, MyNeta.info
- **Legal disclaimer** linking to `voters.eci.gov.in`
- `role="contentinfo"` for screen readers

---

### `ErrorBoundary.jsx`
**Purpose:** React class component that catches runtime errors in the component tree.

**Features:**
- Renders a friendly error UI instead of a blank white screen
- Shows a "Refresh Page" button
- In **development mode** (`import.meta.env.DEV`), displays the raw error stack in a styled pre block
- Logs errors to console via `componentDidCatch`

---

## Hooks

### `useAuth.js`
**Purpose:** Firebase anonymous authentication.

**Returns:**
| Property | Type | Description |
|---|---|---|
| `user` | `User \| null` | Current Firebase Auth user object |
| `loading` | `boolean` | `true` while auth state is resolving |

**Behaviour:** On mount, calls `signInAnonymously()` if no user is signed in. Subscribes to `onAuthStateChanged` to keep `user` in sync.

---

### `useChat.js`
**Purpose:** Manages chat state, Gemini streaming, and Firestore persistence.

**Parameters:**
| Param | Type | Description |
|---|---|---|
| `userId` | `string \| undefined` | Firebase anonymous UID |

**Returns:**
| Property | Type | Description |
|---|---|---|
| `messages` | `Message[]` | Ordered list of chat messages |
| `sendMessage` | `(text: string) => Promise<void>` | Sends a message and streams Gemini response |
| `isLoading` | `boolean` | `true` while Gemini is streaming a response |
| `historyLoading` | `boolean` | `true` only during initial Firestore history fetch |
| `error` | `string \| null` | Error message from last failed request |
| `remainingRequests` | `number` | Remaining Gemini requests (max 10/session) |

**Key implementation details:**
- History load uses a **cancellation flag** (`cancelled = true` in cleanup) to prevent state updates on unmounted components
- `sendMessage` is memoised with `useCallback` and guards against double-invocation via the `isLoading` dependency
- Firestore saves are **fire-and-forget** (`.catch(console.error)`) to avoid blocking the streaming UI
- Welcome message is injected locally if Firestore returns an empty history

---

## Firebase Layer

### `config.js`
Initialises Firebase app with environment variables. Falls back gracefully (logs a warning, returns `null` for `db` and `auth`) if keys are missing or are placeholder values. All consumers check for `null` before using Firebase services.

### `firestoreHelpers.js`

| Function | Signature | Description |
|---|---|---|
| `saveMessage` | `(userId, message) → Promise<string\|null>` | Adds a message document to `sessions/{userId}/messages` |
| `getChatHistory` | `(userId) → Promise<Message[]>` | Fetches all messages for a user, ordered by `timestamp asc` |
| `logQuestion` | `(question) → Promise<void>` | Appends the raw question text to `faq_analytics` collection for FAQ enrichment |

All functions check `if (!db)` and skip gracefully in local dev without Firebase credentials.

---

## Gemini AI Client

### `geminiClient.js`

**Exported functions:**

| Function | Signature | Description |
|---|---|---|
| `getGeminiResponseStream` | `(userId, message, onChunk) → Promise<void>` | Sends message to Gemini 1.5 Flash, calls `onChunk(text)` for each streamed token |
| `sanitizeInput` | `(text) → string` | Strips HTML tags from user input before sending to Gemini |
| `getRequestCount` | `(userId) → number` | Returns how many requests this user has made |
| `getRemainingRequests` | `(userId) → number` | Returns `MAX_REQUESTS_PER_SESSION - count` |

**System prompt (hardcoded):** Configures the model as "VoteWise", restricting it to civic/election topics and preventing it from discussing candidates or opinions.

**Rate limiting:** Session counts tracked in a module-level `Map<userId, count>`. Throws if `count >= 10` before calling the API.

**Input sanitisation:** `text.replace(/<[^>]*>/g, '')` strips all HTML tags.

---

## Data Layer

### `electionSteps.js`

#### `timelinePhases` (Array, 7 items)
Each item:
```js
{
  phase: string,       // Phase name
  icon: string,        // Emoji
  description: string, // One-sentence description
  color: string        // Hex colour for heading accent
}
```

#### `votingSteps` (Array, 8 items)
Each item:
```js
{
  id: number,          // Step number (1–8)
  title: string,       // Step heading
  description: string, // Brief instruction
  icon: string,        // Emoji
  link?: string        // Optional external URL (e.g. ECI portal)
}
```

---

## Design System

Defined in `src/index.css` using Tailwind v4's `@theme` directive.

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1a3a5c` | Deep navy — headings, navbar, primary buttons |
| `--color-accent` | `#f4a623` | Warm amber — CTAs, active states, badges |
| `--color-bg` | `#f8f6f1` | Warm off-white — page background |
| `--color-surface` | `#ffffff` | Card backgrounds |
| `--color-text` | `#1c1c1e` | Body text |
| `--color-muted` | `#6b7280` | Secondary text, placeholders |
| `--color-success` | `#16a34a` | Vote counting phase accent |
| `--color-border` | `#e5e0d8` | Card borders, dividers |
| `--font-display` | Playfair Display | Headings, editorial authority |
| `--font-body` | DM Sans | Body text, UI copy |
| `--font-mono` | JetBrains Mono | Step numbers, counters |

**Accessibility:**
- `:focus-visible` ring: `2px solid var(--color-accent)` offset `2px`
- Skip-to-content link hidden off-screen, revealed on focus
- All minimum body font size: `16px` equivalent (`text-sm` = 14px used only for metadata)

---

## Analytics Events

Fired via `window.gtag('event', ...)` when GA4 is configured.

| Event Name | Where Fired | Extra Parameters |
|---|---|---|
| `chat_question_asked` | `useChat.js` after successful Gemini response | `{ question: string }` |
| `timeline_phase_clicked` | `ElectionTimeline.jsx` on "Ask AI about this" click | `{ phase: string }` |
| `step_guide_completed` | `StepGuide.jsx` when all 8 cards enter viewport | _(none)_ |
| `language_switched` | `LanguageSwitcher.jsx` (hook into Google Translate callback) | _(none)_ |
| `polling_booth_searched` | `PollingFinder.jsx` on form submit | `{ location: string }` |

---

## Security Measures

| Measure | Implementation |
|---|---|
| **Environment variables** | All API keys via `VITE_*` in `.env` (never hardcoded) |
| **`.env` gitignored** | `.env` excluded; `.env.example` committed with placeholders |
| **Input sanitisation** | `sanitizeInput()` strips HTML from all chat inputs before Gemini |
| **Rate limiting** | Max 10 Gemini requests per session per `userId` |
| **CSP headers** | Restrictive Content-Security-Policy in `firebase.json` |
| **Firebase graceful fallback** | `null` checks prevent crashes when Firebase isn't configured |
| **Anonymous auth** | No PII collected — sessions tracked only by anonymous UID |
| **`noopener noreferrer`** | All external links use both attributes |

---

## Testing

Tests live in `tests/` and run with `vitest run`.

| File | Coverage |
|---|---|
| `geminiClient.test.js` | `sanitizeInput` HTML stripping, `MAX_REQUESTS_PER_SESSION` value |
| `electionSteps.test.js` | All 7 timeline phases and 8 voting steps have correct field types |
| `firestoreHelpers.test.js` | `saveMessage` returns doc ID; `getChatHistory` maps docs correctly (mocked Firestore) |
| `ChatBot.test.jsx` | Renders welcome message; calls `sendMessage` on form submit |
| `accessibility.test.jsx` | Zero axe violations on Home and HowToVote pages (via `jest-axe`) |

**Setup file (`tests/setup.js`):** Polyfills `IntersectionObserver` and `Element.prototype.scrollIntoView` for jsdom.
