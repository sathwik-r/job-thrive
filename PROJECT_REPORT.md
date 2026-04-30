# Job Thrive — Complete Project Report

**Date:** April 30, 2026
**Branch:** `test`
**Repository:** `sathwik-r/job-thrive`
**Local:** `/Users/rehanyadav/job-thrive`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What is Job Thrive](#2-what-is-job-thrive)
3. [Tech Stack & Why](#3-tech-stack--why)
4. [Architecture Overview](#4-architecture-overview)
5. [Design System](#5-design-system)
6. [Screen-by-Screen Breakdown](#6-screen-by-screen-breakdown)
7. [Automated Job Fetching](#7-automated-job-fetching)
8. [Authentication Flow](#8-authentication-flow)
9. [Payment Flow (E2E)](#9-payment-flow-e2e)
10. [Database Schema](#10-database-schema)
11. [API Reference](#11-api-reference)
12. [What Was Changed](#12-what-was-changed)
13. [Known Issues & Recommendations](#13-known-issues--recommendations)
14. [File Structure](#14-file-structure)

---

## 1. Executive Summary

Job Thrive is a **two-sided referral marketplace** that connects:
- **Job Seekers** who want employee referrals at top companies (pay Rs.499 per referral)
- **Referrers** who work at top companies and earn Rs.249+ per referral they submit

### What was built on the `test` branch:

| Item | Details |
|------|---------|
| **Landing page** | Full scrollable page with 8 sections, live ticker, dual-sided pitch, company logos, testimonials, pricing |
| **UI Design System** | Palette C "Electric Focus" — true black (#0C0C0C) + lime green (#A3E635) + violet (#818CF8) |
| **Navigation** | Collapsible sidebar (desktop) + bottom nav (mobile) via AppLayout component |
| **Job Fetching** | Automated cron fetching from 2 free APIs (RemoteOK + Arbeitnow), 185 real jobs loaded |
| **Login Fix** | Fixed COGNITO_DOMAIN env var, added localhost:5000 to Cognito callback URLs |
| **7 Screens Rebuilt** | Login, Onboarding, Dashboard, Job Search, Apply Flow, Profile, Coaching — all structurally redesigned |
| **Logo** | New lime-green mark with upward arrow (career growth symbol) |

---

## 2. What is Job Thrive

### The Problem
- Cold job applications have a ~2% response rate
- Employee referrals have a ~20% interview rate (10x better)
- But most people don't know anyone at their target companies
- Meanwhile, employees at top companies get referral bonuses but rarely use their referral capacity

### The Solution
Job Thrive connects both sides:

**For Job Seekers:**
1. Browse real job listings from top companies
2. Upload resume + pay Rs.499 flat fee
3. Get matched with a verified employee at that company
4. Employee submits internal referral
5. Seeker gets 10x better chance of interview

**For Referrers:**
1. Sign up and verify your company
2. Get matched with qualified candidates automatically
3. Submit the internal referral (we provide resume + details)
4. Earn Rs.249+ per successful referral
5. Zero effort — platform handles matching and payment

**Revenue Model:**
- Seeker pays Rs.499 per referral
- Rs.249 goes to referrer
- Rs.250 goes to Job Thrive (platform fee)

---

## 3. Tech Stack & Why

### Frontend

| Technology | Why |
|-----------|-----|
| **React 18** | Industry standard, large ecosystem, component-based |
| **TypeScript** | Type safety catches bugs before runtime, better IDE support |
| **Wouter** | Lightweight router (3KB vs React Router's 30KB). Enough for our simple routing needs |
| **TanStack Query** | Smart data fetching with caching, deduplication, background refetch. Eliminates manual loading/error states |
| **Tailwind CSS** | Utility-first CSS — faster development, consistent spacing, no CSS file bloat |
| **shadcn/ui (Radix)** | Accessible, unstyled component primitives. We style them ourselves but get keyboard nav, screen readers for free |
| **Framer Motion** | Production-grade animation library. Used for page transitions, staggered card entries, hover effects |

### Backend

| Technology | Why |
|-----------|-----|
| **Express** | Simple, battle-tested Node.js server. No overhead of Next.js since we don't need SSR |
| **Drizzle ORM** | Type-safe SQL queries with zero runtime overhead. Schema defined in TypeScript, auto-generates types |
| **PostgreSQL (Neon)** | Serverless Postgres — scales to zero, branches for testing. Production DB |
| **PostgreSQL (local)** | Homebrew install for local development. Same engine as production |

### Services

| Service | Why | Cost |
|---------|-----|------|
| **AWS Cognito** | Google OAuth login. Handles tokens, session management, security. Free tier: 50K MAU |
| **AWS S3** | Resume + proof file storage. Pre-signed URLs for secure direct upload from browser. ~$0.023/GB |
| **Cashfree** | Payment gateway. Indian company, supports UPI/cards/netbanking. 1.95% + Rs.3 per transaction |
| **RemoteOK API** | Free job listings API. No key needed. Remote-first jobs |
| **Arbeitnow API** | Free job listings API. No key needed. European + global jobs |
| **Clearbit Logo API** | Free company logo images. Used in job cards and landing page |

### Why NOT other choices:

| Rejected | Reason |
|----------|--------|
| Next.js | Adds SSR complexity we don't need. Express + Vite is simpler for an SPA |
| Prisma | Heavier than Drizzle, slower queries, larger bundle |
| Firebase Auth | Vendor lock-in, harder to customize OAuth flow |
| Razorpay | Was used originally, migrated to Cashfree (better pricing) |
| MongoDB | Referral/payment data is relational. Postgres is the right choice |
| Stripe | Not available in India for this business model |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│                                                  │
│  React App (Vite)                               │
│  ├── Login (landing page)                       │
│  ├── Onboarding (role + profile setup)          │
│  ├── Dashboard (seeker/referrer views)          │
│  ├── Job Search (browse + filter)               │
│  ├── Referral Request (upload + pay)            │
│  ├── Profile (view + edit)                      │
│  └── Coaching (browse mentors + book)           │
│                                                  │
│  Auth: Cognito JWT in localStorage              │
│  Files: Direct S3 upload via pre-signed URL     │
│  Payment: Cashfree JS SDK (modal checkout)      │
└──────────────────┬──────────────────────────────┘
                   │ HTTP (JSON)
                   │ Authorization: Bearer {JWT}
┌──────────────────▼──────────────────────────────┐
│              EXPRESS SERVER (:5000)               │
│                                                  │
│  Middleware:                                     │
│  ├── JSON body parser                           │
│  ├── Auth middleware (JWT validation)            │
│  └── Request logging                            │
│                                                  │
│  Routes:                                        │
│  ├── /api/auth/* (Cognito callback, validate)   │
│  ├── /api/jobs/* (list, search, detail)          │
│  ├── /api/referrals/* (create, list, update)    │
│  ├── /api/assignments/* (proof, accept, reject) │
│  ├── /api/payment/* (create order, verify)      │
│  ├── /api/upload/* (pre-signed S3 URLs)         │
│  ├── /api/coaching/* (requests, booking)        │
│  ├── /api/mentors (list, search)                │
│  └── /api/admin/fetch-jobs (manual trigger)     │
│                                                  │
│  Services:                                      │
│  ├── CashfreeService (payment orders)           │
│  ├── JobFetcher (cron: daily at 3 AM IST)       │
│  ├── MatchMaking (assign referrer to seeker)    │
│  └── CoachingService (session management)       │
└──────────────────┬──────────────────────────────┘
                   │ SQL (Drizzle ORM)
┌──────────────────▼──────────────────────────────┐
│         POSTGRESQL (Neon / Local)                │
│                                                  │
│  Tables:                                        │
│  ├── users (seekers + referrers)                │
│  ├── jobs (from APIs + manual)                  │
│  ├── referrals (seeker applications)            │
│  ├── assignments (referrer <-> referral link)   │
│  ├── coaching_requests (session bookings)       │
│  └── mentor_profiles (ratings, sessions)        │
└─────────────────────────────────────────────────┘

External Services:
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐
│ AWS       │  │ Cashfree  │  │ RemoteOK  │  │Arbeitnow │
│ Cognito   │  │ Payment   │  │ Jobs API  │  │Jobs API  │
│ S3        │  │ Gateway   │  │ (free)    │  │(free)    │
└───────────┘  └───────────┘  └───────────┘  └──────────┘
```

---

## 5. Design System

### Palette C — "Electric Focus"

**Inspiration:** Raycast + Figma + Linear

**Why this palette:**
- True black (#0C0C0C) eliminates OLED power draw and looks premium
- Lime green (#A3E635) is distinctive — no other job platform uses it
- High contrast CTA buttons (lime on black) maximize click rates
- Violet (#818CF8) as secondary adds depth without competing with lime

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#0C0C0C` | Page backgrounds |
| `--bg-surface` | `#141414` | Cards, inputs, sections |
| `--bg-card` | `#1C1C1C` | Elevated cards |
| `--bg-elevated` | `#242424` | Hover states, icon containers |
| `--border-subtle` | `#1F1F1F` | Default borders |
| `--border-default` | `#2A2A2A` | Hover borders |
| `--lime` | `#A3E635` | Primary CTAs, success states, key numbers |
| `--violet` | `#818CF8` | Secondary actions, links, tags |
| `--orange` | `#FB923C` | Warnings, pending states, referral fees |
| `--red` | `#EF4444` | Errors, destructive actions |
| `--text-primary` | `#F5F5F5` | Headlines, important text |
| `--text-secondary` | `#D4D4D4` | Body copy, descriptions |
| `--text-muted` | `#737373` | Labels, metadata |
| `--text-dim` | `#525252` | Timestamps, placeholders |

### Typography

- **Font:** Inter (Google Fonts)
- **Titles:** 900 weight (black), tight tracking (-0.04em)
- **Labels:** 700 weight, uppercase, tracking-[2px], 10px
- **Body:** 400-500 weight, 14px, #D4D4D4
- **Brand name:** "Job Thrive" (two words, capitalized)

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `AppLayout` | `components/app-layout.tsx` | Sidebar (desktop) + bottom nav (mobile) + role toggle |
| `Logo` | `components/logo.tsx` | Lime square + arrow mark + "Job Thrive" text |
| `RoleToggle` | `components/role-toggle.tsx` | Sliding pill (Seeker/Referrer) with gradient active state |
| `ReferralCard` | `components/referral-card.tsx` | Status-coded left accent bar + company logo + progress bar |
| `JobCard` | `components/job-card.tsx` | Clickable card with logo, meta row, "Get Referred" CTA |
| `MentorCard` | `components/mentor-card.tsx` | Avatar + skills + rating + "Book" button |
| `Footer` | `components/footer.tsx` | Logo + copyright + legal links |

---

## 6. Screen-by-Screen Breakdown

### 6.1 Landing Page (`/login`)

**Purpose:** Convert visitors into sign-ups. Pitch BOTH seekers and referrers.

**Sections (scrollable):**

| # | Section | Content |
|---|---------|---------|
| 1 | **Nav** | Logo + "Get Started" CTA button |
| 2 | **Hero** | Headline "The referral platform that pays everyone" + dual pitch (seekers get referred, referrers earn money) + live ticker showing recent referrals + Google sign-in CTA + 4 stats (500+ referrals, 95+ companies, 24h match, 94% success) + floating mock UI cards on right (job cards, success notification, weekly stats) |
| 3 | **Company Logos** | 10 Clearbit logos (Google, Microsoft, Amazon, Meta, Flipkart, Adobe, Atlassian, Stripe, Razorpay, Swiggy) |
| 4 | **Dual Value Prop** | Side-by-side cards — "For Job Seekers" (lime border, 4 benefits) vs "For Referrers" (violet border, 4 benefits) |
| 5 | **How It Works** | 3 numbered step cards with icons (Browse → Pay → Get Referred) |
| 6 | **Why Job Thrive** | 6 feature cards (refund guarantee, verified referrers, 24h matching, 94% success, coaching, earn as referrer) |
| 7 | **Testimonials** | 3 reviews with star ratings |
| 8 | **Pricing** | Rs.499 card with 5 checkmark features |
| 9 | **Final CTA** | "Your dream job is one referral away" with glowing button |
| 10 | **Footer** | Logo + links |

**Visual features:**
- Subtle grid background (lime lines at 0.015 opacity)
- Animated glow orbs (lime + violet, pulsing)
- Floating mock job cards on hero right side (bobbing animation)
- Live referral ticker (rotates every 2.8 seconds)
- Mouse-shaped scroll indicator with bouncing lime dot
- Scroll-reveal animations on each section (framer-motion useInView)

**Why no separate onboarding slides:**
The old design showed 2 slides of marketing content before letting the user log in. This added friction — 2 extra clicks before they could do anything. The new landing page shows all that content (and more) in one scrollable page. User can sign up immediately or scroll to learn more.

---

### 6.2 Onboarding (`/onboarding`)

**Purpose:** Collect minimum profile data to start matching. Under 30 seconds.

**Old design:** 2-4 step multi-page form
**New design:** Single page with smart form

**Flow:**
1. "Welcome, {name}" greeting
2. Pick role: 3 cards (Seeker / Referrer / Both)
3. Smart form appears below based on role:
   - Seeker: Education + Target Domain + Skills (optional)
   - Referrer: Company (typeahead with logos) + Position + Experience
   - Both: All fields
4. "Get Started" button → dashboard

**Why single page:**
Multi-step forms have drop-off at every step. A single page with conditional fields feels faster and reduces abandonment.

---

### 6.3 Dashboard (`/dashboard`)

**Purpose:** Command center. Show key metrics, recent activity, and quick actions.

**Layout:** AppLayout (sidebar on desktop, bottom nav on mobile)

**Seeker View:**

| Row | Content |
|-----|---------|
| 1 | 2-column: Welcome hero card (2/3) with 2 CTAs (Explore Jobs + Coaching) + Stats column (1/3) with total invested + 3 mini stats (Jobs/Applied/Won) |
| 2 | 3 quick action cards: Profile strength meter (SVG ring) + 1v1 Coaching + Refund guarantee |
| 3 | Trending Jobs — 3 latest job cards pulled from API with company logos, clickable |
| 4 | Active Referrals with count badge (or empty state with "Browse Jobs" CTA) |
| 5 | Past Referrals (if any) |

**Referrer View:**

| Row | Content |
|-----|---------|
| 1 | 2-column: Earnings hero (total earned, this month, successful) + Stats column (total + pending/done/rate) |
| 2 | "How referrer earns" — 3 step cards (Get matched → Submit referral → Earn Rs.249+) |
| 3 | Assigned Referrals with count badge |
| 4 | Completed Referrals |

**Why trending jobs on dashboard:**
Reduces one click. User sees interesting jobs immediately instead of having to navigate to job search. Increases engagement.

---

### 6.4 Job Search (`/job-search`)

**Purpose:** Browse and search all available jobs.

**Features:**
- Hero search bar with focus glow ring
- Filter pills: All / Tech / Finance / Remote
- Live job count with green pulse dot ("185 live")
- Job cards with company logos, remote badges, salary, referral fee
- Skeleton loading (5 shimmer cards)
- Numbered pagination (1, 2, 3... not just prev/next)
- Empty state with "Show all jobs" CTA

**Each job card shows:**
- Company logo (Clearbit, with first-letter fallback)
- Job title + company name (violet) + location + remote badge
- Time posted + salary + referral fee (orange)
- "Get Referred →" CTA button (lime)
- Left accent bar appears on hover

---

### 6.5 Referral Request (`/referral-request/:jobId`)

**Purpose:** Apply for a referral — upload resume and pay.

**Flow (3 steps on one page):**

1. **Job Info Card** — Title, company, location, referral fee. Gradient top border.

2. **Resume Upload** — Drag & drop zone or click to browse. Accepts PDF/DOC/DOCX (max 5MB). Uploads directly to S3 via pre-signed URL. Shows progress bar (0-100%). Green checkmark on success.

3. **Payment** — Phone number input (required, 10 digits). Fee breakdown (Rs.499). "Pay & Get Referred" button (disabled until resume uploaded + phone entered). Opens Cashfree modal checkout.

4. **Success** — Celebration modal with confetti. "Continue to Dashboard" button.

**Why combined (not separate steps):**
E-commerce checkout pattern — keep everything on one page. Reduces page loads, reduces drop-off. User sees the full flow upfront.

---

### 6.6 Profile (`/profile`)

**Purpose:** View and manage personal info.

**Features:**
- Avatar with lime ring
- Profile strength meter (SVG ring, 0-100%)
  - Shows "Complete your profile to get matched 3x faster" if < 100%
  - Calculated from: company, position, education, targetDomain, experience, skills
- Stats grid: Referrals count + Total invested + Join date
- Detailed info section with icons
- Skills showcase (violet pills)
- Edit Profile → navigates to settings
- Sign Out → clears localStorage, redirects to login

**Why profile strength:**
Gamification drives completion. Users with complete profiles get matched to referrers faster (better data for the algorithm). LinkedIn uses the same pattern.

---

### 6.7 Coaching (`/coaching`)

**Purpose:** Book 1v1 sessions with industry professionals.

**Features:**
- Tab toggle: Browse Mentors / My Sessions
- Stats cards (Available, Upcoming, Pending, Success Rate)
- Mentor grid with cards (avatar, company, rating, skills, price)
- Booking modal (session type, date, duration)
- Session request management (accept/decline/cancel)

---

## 7. Automated Job Fetching

**File:** `server/job-fetcher.ts`

### Sources

| API | URL | Auth | Rate Limit | Jobs Fetched |
|-----|-----|------|-----------|--------------|
| RemoteOK | `https://remoteok.com/api` | None | Unlimited | ~50/call |
| Arbeitnow | `https://www.arbeitnow.com/api/job-board-api` | None | Unlimited | ~50/call |

### How It Works

1. **Cron Schedule:** Runs daily at 3:00 AM IST (21:30 UTC)
   - Configured via `node-cron`: `"30 21 * * *"`
   - Also runs once on server startup (initial seed)

2. **Fetch:** Parallel requests to both APIs
   - Filters: only jobs posted in last 30 days
   - Limits: 50 jobs per source per run
   - HTML tags stripped from descriptions

3. **Deduplication:** Before inserting, checks if a job with the same title + company already exists (case-insensitive match via `ilike`)

4. **Insert:** Creates job with:
   - `referralFee: "499.00"` (platform standard)
   - `active: true`
   - `remote: true/false` based on source data

5. **Manual Trigger:** `POST /api/admin/fetch-jobs` (no auth required — should be secured in production)

### Current State
- **185 jobs** in the database
- All with Rs.499 referral fee
- Mix of remote and on-site positions
- Companies include: Google, Microsoft, Amazon, various startups

### Staying in Free Tier
- Both APIs are completely free with no API key
- 1 request/day × 2 APIs = 2 requests/day total
- No rate limit concerns

---

## 8. Authentication Flow

### Technology: AWS Cognito with Google OAuth

**Why Cognito:**
- Managed service — no password storage, no token management code
- Google OAuth built-in — one click sign up
- JWT tokens — stateless auth, no session cookies needed
- Free tier: 50,000 MAU

### Flow (step by step)

```
1. User clicks "Get Started with Google" on landing page

2. Frontend constructs OAuth URL:
   https://{cognito-domain}/oauth2/authorize
   ?identity_provider=Google
   &redirect_uri=http://localhost:5000/post-login
   &response_type=CODE
   &client_id={cognito_client_id}
   &scope=openid+email+profile

3. Browser redirects to Cognito → Cognito redirects to Google

4. User authenticates with Google account

5. Google redirects back to Cognito with auth code

6. Cognito redirects to http://localhost:5000/post-login?code=XXX

7. Post-login page extracts code from URL params

8. Frontend sends code to backend:
   POST /api/auth/cognito-callback
   { code: "XXX", redirectUri: "http://localhost:5000/post-login" }

9. Backend exchanges code for tokens with Cognito:
   POST https://{cognito-domain}/oauth2/token
   (with client_id + client_secret as Basic auth)

10. Backend gets access_token + id_token from Cognito

11. Backend fetches user info from Cognito:
    GET https://{cognito-domain}/oauth2/userInfo
    Authorization: Bearer {access_token}

12. Backend checks if user exists in database (by email)
    - If exists: updates name/photo from Google
    - If new: creates user with role="both", onboardingCompleted=false

13. Backend returns to frontend:
    { user: {...}, token: id_token, tokenType: "Bearer" }

14. Frontend stores in localStorage:
    - circl_user: user object (JSON)
    - circl_auth: { token, tokenType } (JSON)

15. Frontend redirects:
    - If onboardingCompleted=false → /onboarding
    - If onboardingCompleted=true → /dashboard

16. On every subsequent API call:
    Authorization: Bearer {id_token} header is attached
    Backend validates JWT signature against Cognito JWKS
```

### Environment Variables Required

| Variable | Server/Client | Purpose |
|----------|--------------|---------|
| `COGNITO_USER_POOL_ID` | Server | Identifies the Cognito user pool |
| `COGNITO_CLIENT_ID` | Server | App client ID |
| `COGNITO_CLIENT_SECRET` | Server | App client secret (for token exchange) |
| `COGNITO_DOMAIN` | Server | Full domain: `xxx.auth.region.amazoncognito.com` |
| `VITE_AWS_USER_POOL_ID` | Client | For Amplify config |
| `VITE_AWS_USER_POOL_CLIENT_ID` | Client | For OAuth URL construction |
| `VITE_AWS_COGNITO_DOMAIN` | Client | For OAuth URL construction |

### Bug Fixed
**Problem:** `COGNITO_DOMAIN` was set to just the prefix (`ap-south-1u1oays3zw`) instead of the full domain (`ap-south-1u1oays3zw.auth.ap-south-1.amazoncognito.com`). The server was constructing `https://ap-south-1u1oays3zw/oauth2/token` which doesn't resolve.

**Fix:** Updated `.env` with full domain. Also added `http://localhost:5000/post-login` to Cognito callback URLs (was only `localhost:3001`).

---

## 9. Payment Flow (E2E)

### Full Flow

```
Step 1: User clicks "Get Referred" on a job card
        → Navigates to /referral-request/:jobId

Step 2: Page loads job details
        → GET /api/jobs/:id

Step 3: User drags/drops resume (PDF/DOC/DOCX, max 5MB)
        → Client validates file type and size
        → POST /api/upload/resume-presigned-url (auth required)
        → Server generates S3 pre-signed URL (1 hour expiry)
        → Client uploads file directly to S3 via XHR PUT
        → Progress tracked (0-100%)
        → S3 URL stored in state: uploadedResumeUrl

Step 4: User enters 10-digit phone number

Step 5: User clicks "Pay & Get Referred"
        → Button disabled if: no resume, uploading, phone < 10 digits

Step 6: Initialize Cashfree SDK
        → Loads https://sdk.cashfree.com/js/v3/cashfree.js
        → If fails: "Payment system not available" error toast

Step 7: Create referral record
        → POST /api/referrals
        → { jobId, amount: "499.00", resumeUrl }
        → Server creates referral with status="pending"
        → Server auto-assigns referrer if company match found

Step 8: Create Cashfree payment order
        → POST /api/payment/create-order
        → { amount: 499, currency: "INR", jobId, customerPhone }
        → Server validates: amount matches job.referralFee, phone is 10 digits
        → Server calls Cashfree API to create order
        → Returns: { orderId, paymentSessionId, mode }

Step 9: Open Cashfree checkout modal
        → cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" })
        → User sees payment options (UPI, cards, netbanking)
        → User completes or cancels payment

Step 10: If payment completed:
         → POST /api/payment/verify
         → { orderId, referralId }
         → Server fetches order from Cashfree API
         → Checks order_status === "PAID"
         → Updates referral with paymentId, orderId
         → Runs match-making algorithm (assignReferral)
         → Updates seeker's totalSpent
         → Returns { success: true }

Step 11: Success celebration
         → Modal with confetti animation
         → "Continue to Dashboard" button
         → Referral appears in dashboard Active Referrals
```

### Payment Validation

| Check | Where | What |
|-------|-------|------|
| File type | Client | Only PDF/DOC/DOCX |
| File size | Client | Max 5MB |
| Phone digits | Client + Server | Exactly 10 digits |
| Amount match | Server | Must equal job.referralFee |
| Auth token | Server | Valid Cognito JWT required |
| Job exists | Server | Job must be active |
| Company mismatch | Server | Can't refer yourself (same company blocked) |
| Payment status | Server | Must be "PAID" on Cashfree |

### Error Handling

| Error | User Sees |
|-------|-----------|
| Upload fails | "Upload Failed" toast, file cleared, can retry |
| Payment system unavailable | "Payment system not available" toast |
| Payment cancelled | Button re-enabled, can retry |
| Payment fails | "Payment Error" toast with message |
| Verification fails | "Payment Verification Failed" toast |
| Token expired | Redirected to /login |

---

## 10. Database Schema

### `users` table

| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | Auto-increment ID |
| email | text UNIQUE | User email (from Google) |
| name | text | Full name |
| googleId | text UNIQUE | Google/Cognito sub ID |
| photoUrl | text | Google profile photo |
| company | text | Current company (referrers) |
| role | enum | "seeker" / "referrer" / "both" |
| totalEarnings | decimal | Referrer earnings |
| totalSpent | decimal | Seeker spending |
| successfulReferrals | int | Count |
| active | boolean | Account active |
| onboardingCompleted | boolean | Profile setup done |
| position | text | Job title |
| department | text | Department |
| workExperience | text | Experience range (e.g., "3-5") |
| referrerScore | int | Match-making algorithm score |
| education | text | Education level |
| targetDomain | text | Desired field |
| experience | text | Experience level |
| skills | text[] | Skill tags array |
| createdAt | timestamp | Sign-up date |

### `jobs` table

| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | |
| title | text | Job title |
| company | text | Company name |
| location | text | Location |
| description | text | Full description |
| salary | text | Salary range (optional) |
| referralFee | decimal | Fee (always 499.00) |
| remote | boolean | Remote OK |
| active | boolean | Still accepting |
| createdAt | timestamp | Posted date |

### `referrals` table

| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | |
| jobId | FK → jobs | Which job |
| seekerId | FK → users | Who's applying |
| referrerId | FK → users | Who's referring (nullable until assigned) |
| status | enum | pending → assigned → verification_pending → completed / expired / cancelled |
| amount | decimal | Rs.499 |
| resumeUrl | text | S3 URL |
| proofUrl | text | Referral proof screenshot |
| paymentId | text | Cashfree order ID |
| orderId | text | Cashfree order ID |
| assignedAt | timestamp | When referrer assigned |
| completedAt | timestamp | When verified complete |
| createdAt | timestamp | Application date |

### `assignments` table

| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | |
| referralId | FK → referrals | Which referral |
| referrerId | FK → users | Which referrer |
| status | enum | assigned / accepted / rejected / expired / completed |
| assignedAt | timestamp | |
| expiresAt | timestamp | 12 hours from assignment |
| acceptedAt | timestamp | |
| completedAt | timestamp | |

### `coaching_requests` table

| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | |
| mentorId | FK → users | Mentor |
| menteeId | FK → users | Mentee |
| status | enum | pending / accepted / declined / completed / cancelled |
| sessionType | enum | career-advice / mock-interview / technical-review / project-guidance |
| startTime | timestamp | Scheduled time |
| duration | int | Minutes |
| cost | int | Rs.499 |

### Status Lifecycles

**Referral:**
```
pending → assigned → verification_pending → completed
                   ↘ cancelled
                   ↘ expired
```

**Assignment:**
```
assigned → accepted → completed
         ↘ rejected → (new assignment created)
         ↘ expired → (new assignment created)
```

**Coaching:**
```
pending → accepted → completed
        ↘ declined
        ↘ cancelled
```

---

## 11. API Reference

### Auth

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/cognito-callback` | No | Exchange auth code for JWT |
| GET | `/api/auth/validate` | Yes | Validate JWT token |
| POST | `/api/auth/google` | No | Legacy Google auth (deprecated) |

### Jobs

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/jobs?search=&page=` | Optional | List/search jobs (paginated, 20/page) |
| GET | `/api/jobs/:id` | Optional | Single job detail |

### Referrals

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/referrals` | Yes | Create referral application |
| GET | `/api/referrals/seeker/:userId` | Yes | List seeker's referrals |
| GET | `/api/referrals/referrer/:userId` | Yes | List referrer's assignments |
| PUT | `/api/referrals/:id` | Yes | Update referral |
| PUT | `/api/assignments/:id` | Yes | Accept/reject/upload proof |

### Payments

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/payment/create-order` | Yes | Create Cashfree order |
| POST | `/api/payment/verify` | Yes | Verify payment status |

### Uploads

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/upload/resume-presigned-url` | Yes | Get S3 pre-signed URL for resume |
| POST | `/api/upload/proof-presigned-url` | Yes | Get S3 pre-signed URL for proof |

### Users

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/user/:id` | Yes | Get user |
| PUT | `/api/user/:id` | Yes | Update user |
| POST | `/api/user/profile` | Yes | Update profile + complete onboarding |
| GET | `/api/seeker-metrics/:id` | Yes | Seeker dashboard stats |
| GET | `/api/referrer-metrics/:id` | Yes | Referrer dashboard stats |

### Coaching

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/mentors?page=&search=` | Optional | List mentors |
| POST | `/api/coaching/create-request` | Yes | Book session |
| POST | `/api/coaching/get-requests` | Yes | List my sessions |
| POST | `/api/coaching/update-request/:id` | Yes | Accept/decline/cancel |

### Admin

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/admin/fetch-jobs` | No | Manual job fetch trigger |

---

## 12. What Was Changed

### Summary of All Changes on `test` Branch

| Category | Files Changed | What Changed |
|----------|--------------|-------------|
| **Landing Page** | `login.tsx` | Complete rewrite — 8-section scrollable page with live ticker, dual pitch, testimonials, pricing |
| **Onboarding** | `post-login-onboarding.tsx` | Rewrite — single page, role cards, smart conditional form |
| **Dashboard** | `dashboard.tsx` | Rewrite — 2-column layout, trending jobs, profile strength, how-referrer-earns |
| **Job Search** | `job-search.tsx` | Rewrite — hero search, live count, numbered pagination, skeleton loading |
| **Job Card** | `job-card.tsx` | Rewrite — full-click card, company logo, hover accent, "Get Referred" CTA |
| **Profile** | `profile.tsx` | Rewrite — strength meter, stats grid, skills showcase |
| **Coaching** | `coaching-dashboard.tsx` | Wrapped in AppLayout, dark themed |
| **Apply Flow** | `referral-request.tsx` | Wrapped in AppLayout, dark themed |
| **Navigation** | `app-layout.tsx` | **NEW** — collapsible sidebar + bottom nav |
| **Logo** | `logo.tsx` | **NEW** — lime mark + "Job Thrive" |
| **Design System** | `index.css` | Complete rewrite — Palette C tokens, animations |
| **Components** | `role-toggle.tsx`, `referral-card.tsx`, `mentor-card.tsx`, `footer.tsx` | All dark themed |
| **Router** | `App.tsx` | Updated loading screen, 404 page |
| **Job Fetcher** | `server/job-fetcher.ts` | **NEW** — cron + RemoteOK + Arbeitnow |
| **Server** | `server/index.ts`, `server/routes.ts` | Added job fetcher cron + manual trigger endpoint |
| **Auth Fix** | `.env` | Fixed COGNITO_DOMAIN, added VITE_ vars, Cashfree keys |
| **Text Contrast** | All files | Bumped muted text colors for readability |
| **Static Pages** | `terms.tsx`, `privacy.tsx`, `refund.tsx` | Dark themed |
| **Auth Guard** | `auth-guard.tsx` | Dark themed |
| **Post-Login** | `post-login.tsx` | Dark themed + redirect fix |

### Commits on `test` Branch

1. `feat: world-class UI overhaul, automated job fetching, new logo`
2. `feat: dark purple-tinted design system (A+C hybrid)`
3. `feat: palette C "Electric Focus" — lime green + true black`
4. `feat: complete UX redesign — all 7 screens rebuilt`
5. `feat: full landing page — hero, how-it-works, features, testimonials, pricing, CTA`
6. `fix: rich hero section + "Job Thrive" spelling + visible scroll indicator`
7. `fix: text contrast + dual-sided pitch for seekers AND referrers`
8. `feat: polish dashboard, job search, profile to landing page level`
9. `feat: dashboard redesign — zero blank space, packed with content`

---

## 13. Known Issues & Recommendations

### Issues

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| 1 | **High** | `CASHFREE_ENV=production` — real payments charged during testing | Use `sandbox` for testing |
| 2 | **High** | No duplicate application check — user can apply to same job multiple times | Double charges possible |
| 3 | **Medium** | `POST /api/admin/fetch-jobs` has no auth | Anyone can trigger job fetch |
| 4 | **Medium** | Using local PostgreSQL — no data persists across machines | Need Neon DB URL for production |
| 5 | **Low** | Some shadcn components have pre-existing TS errors (UMD React) | Doesn't affect build |
| 6 | **Low** | Job descriptions from APIs sometimes in German/other languages | Need language filter |

### Recommendations for Next Steps

| Priority | Recommendation |
|----------|---------------|
| **P0** | Get Neon production DB URL and switch DATABASE_URL |
| **P0** | Switch CASHFREE_ENV to sandbox for testing, production for deploy |
| **P0** | Add duplicate application check (prevent same user + same job) |
| **P1** | Add auth to admin endpoints |
| **P1** | Add email notifications (referral assigned, proof submitted, completed) using AWS SES |
| **P1** | Add Google Analytics / Mixpanel for user tracking |
| **P2** | Add more job sources (Indeed, LinkedIn via SerpAPI) |
| **P2** | Add referral status email updates |
| **P2** | Add admin dashboard for managing referrals |
| **P3** | PWA support (installable on mobile) |
| **P3** | SEO meta tags for job pages |

---

## 14. File Structure

```
job-thrive/
├── client/
│   ├── public/
│   │   └── logo.svg                    # Static logo file
│   └── src/
│       ├── App.tsx                     # Router + auth guards
│       ├── main.tsx                    # Entry point
│       ├── index.css                   # Design system (Palette C)
│       ├── components/
│       │   ├── app-layout.tsx          # Sidebar + bottom nav
│       │   ├── logo.tsx                # Brand logo component
│       │   ├── role-toggle.tsx         # Seeker/Referrer toggle
│       │   ├── job-card.tsx            # Job listing card
│       │   ├── referral-card.tsx       # Referral status card
│       │   ├── mentor-card.tsx         # Coaching mentor card
│       │   ├── footer.tsx              # Page footer
│       │   ├── auth-guard.tsx          # Route protection
│       │   ├── booking-modal.tsx       # Coaching booking
│       │   ├── proof-upload-modal.tsx  # Referrer proof upload
│       │   ├── requests-panel.tsx      # Coaching sessions
│       │   ├── search-filters.tsx      # Coaching filters
│       │   ├── file-upload.tsx         # Generic file upload
│       │   └── ui/                     # shadcn components
│       ├── pages/
│       │   ├── login.tsx               # Landing page (8 sections)
│       │   ├── post-login.tsx          # OAuth callback handler
│       │   ├── post-login-onboarding.tsx # Profile setup
│       │   ├── dashboard.tsx           # Main dashboard
│       │   ├── job-search.tsx          # Browse jobs
│       │   ├── referral-request.tsx    # Apply + pay
│       │   ├── profile.tsx             # User profile
│       │   ├── profile-settings.tsx    # Edit profile
│       │   ├── coaching-dashboard.tsx  # Coaching feature
│       │   ├── analytics.tsx           # (stub)
│       │   ├── onboarding.tsx          # (old, unused)
│       │   ├── terms.tsx               # Legal
│       │   ├── privacy.tsx             # Legal
│       │   └── refund.tsx              # Legal
│       ├── hooks/
│       │   ├── use-auth.tsx            # Auth context + hooks
│       │   ├── use-toast.ts            # Toast notifications
│       │   └── use-mobile.tsx          # Mobile detection
│       └── lib/
│           ├── queryClient.ts          # TanStack Query + API helper
│           ├── cashfree.ts             # Cashfree SDK wrapper
│           ├── cognito.ts              # Cognito OAuth helper
│           ├── companies.ts            # India tech companies list
│           └── utils.ts                # Utilities
├── server/
│   ├── index.ts                        # Express server entry
│   ├── routes.ts                       # All API routes
│   ├── db.ts                           # Database connection
│   ├── db-storage.ts                   # Database queries (Drizzle)
│   ├── storage.ts                      # Storage interface
│   ├── config/env.ts                   # Environment validation (Zod)
│   ├── auth-middleware.ts              # JWT validation middleware
│   ├── cashfree-service.ts             # Cashfree API client
│   ├── job-fetcher.ts                  # Cron job fetcher
│   ├── match-making/index.ts          # Referrer assignment algorithm
│   ├── coaching/index.ts              # Coaching service
│   ├── notifications/index.ts         # Email notifications (SES)
│   └── vite.ts                        # Vite dev server integration
├── shared/
│   └── schema.ts                       # Drizzle schema + Zod types
├── scripts/
│   ├── add-dummy-jobs.ts              # Seed dummy jobs
│   └── schema.sql                     # Raw SQL schema
├── design-proposals/                   # Design mockups (SVGs)
├── figma-wireframes/                   # Figma-importable wireframes
├── UI_FLOW_MAP.md                      # Screen flow documentation
├── PROJECT_REPORT.md                   # This file
├── .env                                # Environment variables
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── vite.config.ts                      # Vite config
├── drizzle.config.ts                   # Drizzle ORM config
└── tailwind.config.ts                  # Tailwind config
```

---

*Report generated on April 30, 2026*
*Branch: test | Commits: 9 | Files changed: 40+ | Lines: ~4,500 added*
