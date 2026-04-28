# Job Thrive - Complete UI/UX Flow Map

## Tech Stack
- **Frontend:** React 18, TypeScript, Wouter (routing), TanStack Query, Tailwind CSS, Radix UI (shadcn)
- **Backend:** Express, Drizzle ORM, PostgreSQL (Neon)
- **Auth:** AWS Cognito (Google OAuth)
- **Payments:** Cashfree
- **Storage:** AWS S3

---

## Route Map (App.tsx)

| Route | Component | Auth | Guard |
|---|---|---|---|
| `/login` | LoginPage | Public | - |
| `/post-login` | PostLoginPage | Public | - |
| `/terms` | TermsPage | Public | - |
| `/privacy` | PrivacyPage | Public | - |
| `/refund` | RefundPage | Public | - |
| `/onboarding` | PostLoginOnboarding | Logged in (no guard) | Redirects to login if no user |
| `/dashboard` | DashboardPage | AuthGuard | Token + Onboarding check |
| `/` | DashboardPage | AuthGuard | Same as /dashboard |
| `/job-search` | JobSearchPage | AuthGuard | Token + Onboarding check |
| `/referral-request/:jobId` | ReferralRequestPage | AuthGuard | Token + Onboarding check |
| `/profile` | ProfilePage | AuthGuard | Token + Onboarding check |
| `/profile-settings` | ProfileSettingsPage | AuthGuard | Token + Onboarding check |
| `/analytics` | AnalyticsPage | AuthGuard | Token + Onboarding check |
| `/coaching` | CoachingDashboard | AuthGuard | Token + Onboarding check |
| `*` | 404 Not Found | - | - |

---

## Screen-by-Screen Breakdown

### SCREEN 1: Onboarding Splash (`/login` -> OnboardingPage)
**File:** `pages/onboarding.tsx`
**Purpose:** First-time app intro with 2 slides explaining the platform
**Flow:**
- **Slide 1:** "Welcome to Job Thrive" - 3 value props (Find Jobs, Get Consulted, Earn Money)
- **Slide 2:** "Dual-Side Marketplace" - Seeker vs Referrer benefits, pricing info
- Progress dots at top (2 steps)
- **Actions:** Previous / Next / Get Started
- Footer links: Terms, Privacy, Refund
- **Exits to:** Login screen (shows Google sign-in)

### SCREEN 2: Login (`/login`)
**File:** `pages/login.tsx`
**Purpose:** Google sign-in via AWS Cognito
**Flow:**
1. First shows OnboardingPage (splash slides)
2. After "Get Started" -> Shows login card
3. Logo + "Welcome to Job Thrive" + tagline
4. Single button: "Continue with Gmail"
5. Error display if auth fails
6. Footer: Terms, Privacy, Refund links
- **Exits to:** Cognito OAuth redirect -> `/post-login`

### SCREEN 3: Post-Login Callback (`/post-login`)
**File:** `pages/post-login.tsx`
**Purpose:** OAuth callback handler - exchanges Cognito auth code for token
**Flow:**
1. Shows "Completing sign in..." spinner
2. Extracts `code` from URL params
3. Sends to backend: `POST /api/auth/cognito-callback`
4. Stores auth data in localStorage (`circl_user`, `circl_auth`)
5. **If `onboardingCompleted === false`** -> `/onboarding`
6. **If `onboardingCompleted === true`** -> `/dashboard`
7. On error: shows error message + "Try Again" -> `/login`

### SCREEN 4: Post-Login Onboarding (`/onboarding`)
**File:** `pages/post-login-onboarding.tsx`
**Purpose:** Multi-step profile setup after first login
**Flow:**
- Progress bar at top
- **Step 1 (all users):** Role selection
  - "I'm looking for a job" (seeker)
  - "I want to provide referrals" (referrer)
  - "Both - Job seeker & Referrer" (both)
- **Step 2 (referrer/both):** Work information
  - Company (searchable dropdown from INDIA_TECH_COMPANIES list + "Others")
  - Current Position (text input)
  - Department (select)
  - Total Work Experience (select: 0-1 to 12+)
- **Step 2 (seeker only) / Step 3 (both):** Job search profile
  - Education Background (select + "Other" text input)
  - Target Domain (select + "Other" text input)
  - Target Role Level (select: Entry to Management)
  - Key Skills (tag input, optional)
- **Step 4 (both role only):** Review summary card
- Navigation: Back / Next / Complete Setup
- On complete: `POST /api/user/profile` -> updates user -> navigates to `/dashboard`
- **Total steps:** Seeker=2, Referrer=2, Both=4

### SCREEN 5: Dashboard (`/dashboard`)
**File:** `pages/dashboard.tsx`
**Purpose:** Main hub with role-based views (Seeker vs Referrer)
**Components:** RoleToggle, ReferralCard, ProofUploadModal, Footer

#### Header (sticky):
- Logo + "Job Thrive"
- RoleToggle (Seeker / Referrer switch)
- Profile avatar (click -> `/profile`)

#### Seeker View:
- **Welcome Card:** User name, "Total Invested" amount, "Find Jobs" CTA -> `/job-search`
- **Quick Stats:** 3 cards (Total Jobs, Applied, Successful)
- **1v1 Coaching Card:** CTA "Get Started" -> `/coaching`
  - Shows: 500+ Mentors, Flexible Scheduling, Global Network
- **Active Requests:** List of ReferralCards (pending/assigned/verification_pending)
- **Past Requests:** List of ReferralCards (completed/expired/cancelled)

#### Referrer View:
- **Earnings Card:** User name, Total Earned, This Month earnings, Successful count
- **Quick Stats:** 3 cards (Pending, Completed, Success Rate %)
- **Assigned Referrals:** List of ReferralCards with Upload Proof / Decline actions
- **Completed Referrals:** List of completed ReferralCards

#### Bottom Navigation (fixed):
- Policy links: Terms, Privacy, Refund
- Nav buttons: Dashboard | Search | Profile

#### Modals:
- **Referral Details Modal:** Job info, status badge, fee, seeker info (name, email, experience, skills), resume download, Upload Proof / Decline buttons (referrer only)
- **Proof Upload Modal:** File upload for referral proof

### SCREEN 6: Job Search (`/job-search`)
**File:** `pages/job-search.tsx`
**Purpose:** Browse and search job listings
**Flow:**
- Header: Back to Dashboard, "Find Your Dream Job" title
- Search bar (by title or company)
- Filter pills: All Jobs, Tech, Finance, Remote
- Pagination (Previous / Page X of Y / Next)
- Job listing cards (JobCard component)
- Each JobCard shows: title, company, location, remote badge, salary, description, time ago, referral fee
- "Apply for Referral" button on each card -> `/referral-request/:jobId`
- API: `GET /api/jobs?search=X&page=N`

### SCREEN 7: Referral Request (`/referral-request/:jobId`)
**File:** `pages/referral-request.tsx`
**Purpose:** Apply for a job referral with resume upload and payment
**Flow:**
1. Back to Jobs link
2. **Job Info Card:** Title, company, location, referral fee (gradient card)
3. **Resume Upload Section:**
   - Drag & drop zone or file picker
   - Accepts: PDF, DOC, DOCX (max 5MB)
   - Upload to S3 via presigned URL (`POST /api/upload/resume-presigned-url`)
   - Shows upload progress bar
   - Success confirmation with green badge
   - Replace/Remove file options
4. **Payment Section:**
   - Phone number input (required, 10 digits)
   - Referral fee breakdown
   - Total amount
   - "Pay Securely" button (disabled until resume uploaded + phone entered)
   - Powered by Cashfree
   - Creates referral: `POST /api/referrals`
   - Creates Cashfree order -> Opens checkout popup
   - Verifies payment on success
5. **Success Modal:** Celebration animation, "Payment Successful!", "Continue" -> `/dashboard`
- Footer: Terms, Privacy, Refund links

### SCREEN 8: Profile (`/profile`)
**File:** `pages/profile.tsx`
**Purpose:** View user profile information
**Flow:**
- Header: Back -> Dashboard, "Profile" title
- **Profile Header Card:** Avatar, name, email, role badge
- **Information Card:** Email, Company (if set), Member Since date
- **Account Card:**
  - Profile Settings -> `/profile-settings`
  - Sign Out (clears localStorage, redirects to login)

### SCREEN 9: Profile Settings (`/profile-settings`)
**File:** `pages/profile-settings.tsx`
**Purpose:** Edit profile/onboarding data
**Flow:**
- Header: Back -> Profile, "Profile Settings" title, Edit toggle
- **Role Card:** View/edit role (seeker/referrer/both)
- **Work Information (referrer/both):** Company, Position, Department, Work Experience
- **Job Search Profile (seeker/both):** Education, Target Domain, Experience Level, Skills (tag input)
- Edit mode toggle with pencil icon
- Save button: `POST /api/user/profile`

### SCREEN 10: Coaching Dashboard (`/coaching`)
**File:** `pages/coaching-dashboard.tsx`
**Purpose:** Browse mentors and manage coaching sessions
**Flow:**
- Header: "1v1 Coaching" title, Browse Mentors / My Sessions toggle
- **Stats Cards:** Available Mentors, Upcoming Sessions, Pending Requests, Success Rate

#### Browse Mentors View:
- Left sidebar: SearchFilters (search, company, role, experience, expertise, availability, price)
- Right area: Mentor grid (MentorCard components)
- Each MentorCard shows: name, title, company, experience, rating, expertise, price
- "Book Session" -> opens BookingModal
- API: `GET /api/mentors?page=N&pageSize=12&search=X&company=X&skills=X`

#### My Sessions View:
- RequestsPanel component
- Outgoing requests (as mentee): status tracking, cancel option
- Incoming requests (as mentor): accept/decline options
- APIs: `POST /api/coaching/get-requests`, `POST /api/coaching/update-request/:id`

#### Booking Modal:
- Select session type, date, duration
- Cost: fixed ₹499
- API: `POST /api/coaching/create-request`

### SCREEN 11: Analytics (`/analytics`)
**File:** `pages/analytics.tsx`
**Purpose:** View referral analytics (currently mostly empty/stub)
**Flow:**
- Header: Back -> Profile, "Analytics" title
- Fetches seeker + referrer referral data
- Calculates: total referrals, completed, success rate, applications, monthly earnings
- **Note:** Currently only renders the header - body content is empty

### SCREEN 12: Terms & Conditions (`/terms`)
**File:** `pages/terms.tsx`
**Purpose:** Static legal page
- 9 sections covering services, accounts, payments, cancellations, prohibited activities, IP, liability, governing law, contact

### SCREEN 13: Privacy Policy (`/privacy`)
**File:** `pages/privacy.tsx`
**Purpose:** Static legal page

### SCREEN 14: Refund Policy (`/refund`)
**File:** `pages/refund.tsx`
**Purpose:** Static legal page
- Refund if services not provided within 10 days
- 3-4 business day processing
- Contact: Rehan Yadav, admin@jobthrive.in

---

## Complete User Flows

### Flow A: New User (Job Seeker)
```
Onboarding Splash (2 slides)
  -> "Get Started"
  -> Login Screen
  -> "Continue with Gmail"
  -> Cognito OAuth
  -> /post-login (callback)
  -> /onboarding (role=seeker, 2 steps: role + job profile)
  -> "Complete Setup"
  -> /dashboard (seeker view)
```

### Flow B: New User (Referrer)
```
Onboarding Splash
  -> Login
  -> Cognito
  -> /post-login
  -> /onboarding (role=referrer, 2 steps: role + work info)
  -> /dashboard (referrer view)
```

### Flow C: New User (Both)
```
Onboarding Splash
  -> Login
  -> Cognito
  -> /post-login
  -> /onboarding (role=both, 4 steps: role + work info + job profile + review)
  -> /dashboard
```

### Flow D: Returning User
```
App loads -> checks localStorage (circl_user, circl_auth)
  -> validates token (GET /api/auth/validate)
  -> if valid + onboarded -> /dashboard
  -> if valid + not onboarded -> /onboarding
  -> if invalid -> /login
```

### Flow E: Seeker Applies for Referral
```
/dashboard (seeker)
  -> "Find Jobs"
  -> /job-search
  -> browse/search/filter jobs
  -> "Apply for Referral" on job card
  -> /referral-request/:jobId
  -> upload resume (S3)
  -> enter phone
  -> "Pay Securely" (₹499 via Cashfree)
  -> success celebration
  -> /dashboard (appears in Active Requests)
```

### Flow F: Referrer Handles Assignment
```
/dashboard (referrer view)
  -> sees Assigned Referrals
  -> click card -> Referral Details Modal
  -> view seeker info + resume
  -> "Upload Proof" -> Proof Upload Modal -> submit file (S3)
  -> OR "Decline" -> removes assignment
  -> status changes to verification_pending -> admin verifies -> completed
```

### Flow G: Coaching (Seeker books mentor)
```
/dashboard (seeker)
  -> "Get Started" on 1v1 Coaching card
  -> /coaching
  -> browse mentors (filter by company, skills, experience)
  -> "Book Session" on mentor card
  -> BookingModal (session type, date, duration)
  -> confirm booking (POST /api/coaching/create-request)
  -> switch to "My Sessions" tab to track
```

### Flow H: Coaching (Mentor responds)
```
/coaching -> "My Sessions" tab
  -> incoming requests panel
  -> "Accept" or "Decline" request
  -> POST /api/coaching/update-request/:id
```

### Flow I: Profile Management
```
/dashboard -> profile avatar (top right) OR bottom nav "Profile"
  -> /profile (view info)
  -> "Profile Settings"
  -> /profile-settings
  -> toggle edit mode
  -> modify role/work info/job profile/skills
  -> "Save Changes" (POST /api/user/profile)
```

### Flow J: Sign Out
```
/profile -> "Sign Out"
  -> clears localStorage
  -> redirects to /login
```

---

## Referral Status Lifecycle
```
pending -> assigned -> verification_pending -> completed
                   |                        -> expired
                   -> cancelled
```

## Coaching Request Lifecycle
```
pending -> accepted -> completed
        -> declined
        -> cancelled
```

---

## Key Components

| Component | File | Used In |
|---|---|---|
| AuthGuard | `components/auth-guard.tsx` | All protected routes |
| RoleToggle | `components/role-toggle.tsx` | Dashboard header |
| JobCard | `components/job-card.tsx` | Job Search page |
| ReferralCard | `components/referral-card.tsx` | Dashboard (both views) |
| ProofUploadModal | `components/proof-upload-modal.tsx` | Dashboard (referrer) |
| MentorCard | `components/mentor-card.tsx` | Coaching Dashboard |
| BookingModal | `components/booking-modal.tsx` | Coaching Dashboard |
| SearchFilters | `components/search-filters.tsx` | Coaching Dashboard |
| RequestsPanel | `components/requests-panel.tsx` | Coaching Dashboard |
| Footer | `components/footer.tsx` | Dashboard |

## API Endpoints Used

| Method | Endpoint | Used By |
|---|---|---|
| POST | `/api/auth/cognito-callback` | Post-login |
| GET | `/api/auth/validate` | AuthGuard, token validation |
| POST | `/api/user/profile` | Onboarding, Profile Settings |
| GET | `/api/jobs?search=&page=` | Job Search |
| GET | `/api/jobs/:id` | Referral Request |
| POST | `/api/referrals` | Referral Request |
| GET | `/api/referrals/seeker/:userId` | Dashboard (seeker) |
| GET | `/api/referrals/referrer/:userId` | Dashboard (referrer) |
| PUT | `/api/assignments/:id` | Dashboard (proof upload, decline) |
| GET | `/api/seeker-metrics/:userId` | Dashboard (seeker stats) |
| GET | `/api/referrer-metrics/:userId` | Dashboard (referrer stats) |
| POST | `/api/upload/resume-presigned-url` | Referral Request |
| POST | `/api/upload/proof-presigned-url` | Dashboard (referrer) |
| GET | `/api/mentors?page=&search=` | Coaching Dashboard |
| POST | `/api/coaching/create-request` | Coaching (booking) |
| POST | `/api/coaching/get-requests` | Coaching (my sessions) |
| POST | `/api/coaching/update-request/:id` | Coaching (accept/decline/cancel) |
