# Job Thrive — Launch & Growth Plan

---

## PART 1: MAKING IT LIVE

### Step 1: Get Production Database Ready (30 min)

**Action:** Get Neon DB URL from console.neon.tech

```
1. Go to console.neon.tech
2. Open your project (or create one: "job-thrive-prod")
3. Go to Connection Details
4. Copy the connection string
5. Update .env: DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
6. Run: npx drizzle-kit push (pushes schema to Neon)
7. Run: POST /api/admin/fetch-jobs (seeds 100+ jobs)
```

### Step 2: Switch Cashfree to Sandbox for Testing (5 min)

```
In .env:
CASHFREE_ENV=sandbox

Test the full payment flow with Cashfree test cards:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: 123

Once tested, switch back to:
CASHFREE_ENV=production
```

### Step 3: Deploy to EC2 (Already Running)

Your EC2 instance `i-022c4ea349d664078` at `13.205.45.90` is already running.

**Option A: Deploy via Git (recommended)**
```bash
# SSH into EC2 (you need the job-thrive.pem key)
ssh -i job-thrive.pem ubuntu@13.205.45.90

# On EC2:
cd ~/job-thrive
git fetch origin test
git checkout test
npm install
npm run build
pm2 restart ecosystem.config.cjs
```

**Option B: If no SSH key, use GitHub Actions**
Create `.github/workflows/deploy.yml` — I can set this up for you.

### Step 4: Domain & SSL

Your domain `jobthrive.in` is already configured. Ensure:
```
1. DNS A record: jobthrive.in → 13.205.45.90
2. Nginx reverse proxy: port 80/443 → localhost:5000
3. SSL via Let's Encrypt (certbot)
4. Update Cognito callback URLs to include https://jobthrive.in/post-login
```

### Step 5: Pre-Launch Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Neon DB connected | ⬜ Need URL |
| 2 | Cashfree sandbox tested | ⬜ |
| 3 | Cashfree production tested (Rs.1 test) | ⬜ |
| 4 | Deploy to EC2 | ⬜ Need SSH key |
| 5 | SSL certificate active | ⬜ |
| 6 | Cognito callbacks updated for jobthrive.in | ✅ Already done |
| 7 | Google Analytics installed | ⬜ |
| 8 | Duplicate application check added | ⬜ |
| 9 | Admin endpoint secured | ⬜ |
| 10 | 100+ real jobs in prod DB | ⬜ Auto-fetches on deploy |

---

## PART 2: PRODUCT IMPROVEMENTS BEFORE LAUNCH

### Priority 1 — Must Have (Before Launch)

#### 1.1 Duplicate Application Guard
**Problem:** User can pay Rs.499 twice for the same job.
**Fix:** Before creating referral, check if user already applied to that jobId. Show "You've already applied" message.

#### 1.2 Referral Status Emails
**Problem:** User pays and has no idea what's happening.
**Fix:** Send emails at each status change:
- "Your referral request is received" (on payment)
- "A referrer has been assigned" (on match)
- "Your referral has been submitted" (on proof upload)
- "Congratulations! Referral verified" (on completion)
Use AWS SES (already configured in env).

#### 1.3 Job Detail Page
**Problem:** Clicking a job goes straight to payment page. User can't read full details.
**Fix:** Add a proper job detail page (`/jobs/:id`) with:
- Full description
- Company info
- Skills required
- "Get Referred" CTA
- Related jobs

#### 1.4 Admin Dashboard
**Problem:** No way to manage referrals, verify proofs, or see platform metrics.
**Fix:** Simple admin page at `/admin` with:
- All referrals list with filters
- Proof verification (approve/reject)
- User list
- Revenue metrics
- Job management (add/edit/deactivate)

### Priority 2 — Should Have (Week 1-2 After Launch)

#### 2.1 Referrer Verification
**Problem:** Anyone can claim to work at Google.
**Fix:** Email domain verification — if they sign up with `@google.com` email, auto-verify. Otherwise, ask for employee ID or LinkedIn profile.

#### 2.2 WhatsApp/SMS Notifications
**Problem:** Emails have low open rates in India.
**Fix:** Integrate Twilio or MSG91 for WhatsApp notifications. Indian users prefer WhatsApp.

#### 2.3 Referral Tracking Timeline
**Problem:** Seeker sees "Pending" but doesn't know what that means.
**Fix:** Visual timeline on each referral:
```
Applied ✅ → Matched ✅ → Referrer Accepted ⏳ → Proof Submitted → Verified
```
Like tracking a Flipkart order.

#### 2.4 Search Improvements
- Auto-suggest as user types
- Save recent searches
- Filter by salary range (slider)
- Filter by experience level
- Sort by: newest, salary, company

### Priority 3 — Nice to Have (Month 1-2)

#### 3.1 Referrer Leaderboard
Show top referrers by earnings, referrals given, success rate. Creates competition and engagement.

#### 3.2 Company Pages
`/companies/google` — shows all jobs at Google, referrer count, avg match time. Helps SEO.

#### 3.3 Blog / Content
SEO content: "How to get referred to Google in 2026", "Top 10 companies hiring in Bangalore". Drives organic traffic.

#### 3.4 Mobile App (React Native)
Wrap the web app in a WebView or rebuild key screens in React Native. Push notifications.

---

## PART 3: MARKETING & ADS PLAN

### Target Audience

| Segment | Who | Size | Where They Are |
|---------|-----|------|----------------|
| **Job Seekers** | Engineers, PMs, designers looking for jobs at FAANG/top companies | Massive | LinkedIn, Twitter/X, Reddit, Telegram groups, college WhatsApp groups |
| **Referrers** | Employees at Google, Microsoft, Amazon, Flipkart etc. | Moderate | LinkedIn, Twitter/X, internal Slack communities |
| **Fresh Grads** | 2024-2026 graduates looking for first job | Large | College WhatsApp groups, Instagram, LinkedIn |
| **Laid Off** | People recently laid off from tech companies | Growing | LinkedIn, Blind, Twitter/X |

### Channel Strategy

#### Channel 1: LinkedIn (Primary — Both Audiences)

**Why:** Both seekers and referrers live on LinkedIn. Highest intent platform.

**Content Plan (3 posts/week):**

| Day | Post Type | Example |
|-----|-----------|---------|
| Mon | **Success Story** | "Priya got referred to Google in 24 hours. Here's how." + screenshot of her referral journey |
| Wed | **Data/Insight** | "Cold applications: 2% response rate. Referrals: 20%. The math is simple." + infographic |
| Fri | **Referrer Spotlight** | "Meet Amit, a Google engineer who earned Rs.15,000 last month by referring 6 people on Job Thrive." |

**LinkedIn Ads:**
- **Budget:** Rs.500/day to start (Rs.15,000/month)
- **Targeting:** India, 22-35 age, job titles containing "engineer", "developer", "product manager", "designer"
- **Ad Type:** Single image + CTA
- **Creative A (Seeker):**
  ```
  Headline: "Stop mass-applying. Get referred directly."
  Body: "500+ people got referred to Google, Microsoft, Amazon through Job Thrive. Rs.499 flat. Refund if not matched."
  CTA: "Get Referred Now"
  ```
- **Creative B (Referrer):**
  ```
  Headline: "Work at a top company? Earn Rs.249+ per referral."
  Body: "Refer qualified candidates through Job Thrive. We match, you submit. Earn passive income."
  CTA: "Start Earning"
  ```

#### Channel 2: Twitter/X (Awareness + Virality)

**Strategy:** Build founder brand + platform awareness

**Content Plan:**
- Tweet about referral industry insights
- Share anonymous success metrics ("This week: 47 referrals, 23 interviews")
- Engage with #hiring, #jobsearch, #techjobs threads
- Reply to people complaining about job search with "try getting referred instead"

**Growth Hack:**
- Create a thread: "I analyzed 1000 job applications. Here's what I found about referrals vs cold applying." Include Job Thrive as solution at the end.
- These threads get 100K+ impressions if done right.

#### Channel 3: Instagram Reels (Fresh Grads)

**Why:** Fresh grads (22-25) are on Instagram more than LinkedIn.

**Content:**
- 15-30 second reels showing the flow: "How I got referred to Google in 3 steps"
- Before/After: "100 cold applications = 0 calls. 1 referral = interview in 1 week."
- Behind the scenes of building Job Thrive

**Budget:** Rs.300/day for reels promotion

#### Channel 4: Telegram / WhatsApp Groups (Direct Acquisition)

**Strategy:** Join/create groups for job seekers

**Execution:**
1. Create "Job Thrive — Daily Referral Opportunities" Telegram channel
2. Post 3-5 new jobs daily with "Get Referred" links
3. Share success stories in the group
4. Ask members to share with friends (viral loop)

**WhatsApp:**
- Create broadcast list for interested users
- Send weekly "Top 5 referral opportunities this week"
- This is HIGH conversion because WhatsApp messages get read

#### Channel 5: College Partnerships (Long Term)

**Strategy:** Partner with placement cells at tier-1 and tier-2 colleges.

**Offer:**
- Free platform access for final year students (pay only on success)
- Exclusive "campus ambassador" role — student gets Rs.100 for every sign-up
- Present at campus placement prep sessions

**Colleges to target:**
- IITs, NITs, BITS, VIT, Manipal, SRM, IIIT
- Start with 5 colleges, scale to 50

### Creative Assets Needed

| Asset | Format | Purpose | Who Creates |
|-------|--------|---------|-------------|
| LinkedIn carousel | 1080x1080 (5-8 slides) | How Job Thrive works | Designer |
| Instagram reel | 1080x1920 (15-30 sec) | "Get referred in 3 steps" | Video editor |
| LinkedIn single image ad | 1200x627 | Seeker acquisition | Designer |
| LinkedIn single image ad | 1200x627 | Referrer acquisition | Designer |
| Twitter banner | 1500x500 | @jobthrive profile | Designer |
| OG image | 1200x630 | Link preview when shared | Designer |
| Testimonial cards | 1080x1080 | Social proof posts | Designer |
| Email template | HTML | Referral status updates | Dev |

### Landing Page Optimization (A/B Tests)

| Test | Variant A | Variant B | Metric |
|------|-----------|-----------|--------|
| 1 | Current headline | "Get hired 10x faster with referrals" | Sign-up rate |
| 2 | Google sign-in only | Google + email sign-in | Sign-up rate |
| 3 | Rs.499 shown on hero | Price hidden until apply | Click-through |
| 4 | Live ticker ON | Live ticker OFF | Sign-up rate |
| 5 | Testimonials with photos | Testimonials without | Trust score |

---

## PART 4: GROWTH METRICS TO TRACK

### North Star Metric
**Referrals completed per week** — this means money in, users happy on both sides.

### Key Metrics

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Landing page visitors | 5,000 | 25,000 |
| Sign-ups | 500 | 3,000 |
| Jobs browsed | 2,000 | 15,000 |
| Referral applications | 100 | 500 |
| Payments collected | Rs.49,900 | Rs.2,49,500 |
| Referrals completed | 80 | 400 |
| Referrers active | 30 | 150 |
| Revenue (after referrer payout) | Rs.25,000 | Rs.1,25,000 |

### Funnel Metrics

```
Visitor → Sign-up:        Target 10%
Sign-up → Browse jobs:    Target 80%
Browse → Apply:           Target 15%
Apply → Pay:              Target 60%
Pay → Matched:            Target 95%
Matched → Completed:      Target 80%
```

### Tools to Install

| Tool | Purpose | Cost |
|------|---------|------|
| **Google Analytics 4** | Page views, user flow, conversion tracking | Free |
| **Mixpanel** | Event tracking (sign-up, apply, pay) | Free up to 100K events |
| **Hotjar** | Heatmaps, session recordings | Free (500 sessions/month) |
| **Cashfree Dashboard** | Payment analytics | Included |
| **Google Search Console** | SEO performance | Free |

---

## PART 5: SUGGESTED PRODUCT CHANGES

### Changes I'd Make (Ranked by Impact)

#### 1. Add Job Detail Page (HIGH IMPACT)
Right now clicking a job goes straight to the payment page. Users need to read the full description first. Add `/jobs/:id` with full details + "Get Referred" CTA at the bottom.

#### 2. Referrer Onboarding Flow (HIGH IMPACT)
Currently both seekers and referrers see the same dashboard. Referrers need a dedicated onboarding: "Here's how you'll earn money" → verify company → set availability → start getting matches.

#### 3. Social Proof on Every Screen (MEDIUM IMPACT)
The landing page has social proof but internal pages don't. Add:
- "12 people applied to this job" on job cards
- "3 referrals submitted today" on dashboard
- "Avg response time: 24 hours" on apply page

#### 4. Referral Fee Flexibility (MEDIUM IMPACT)
Rs.499 flat for all jobs is limiting. Some jobs at Google should be Rs.999 (higher value). Some entry-level jobs could be Rs.299. Variable pricing based on company tier.

#### 5. Resume Review by Referrer (MEDIUM IMPACT)
Before submitting the internal referral, let the referrer review the resume and provide feedback. This increases referral quality and success rate. Also makes referrers feel more involved.

#### 6. Urgency & Scarcity Signals (MEDIUM IMPACT)
- "Only 2 referral slots left for this job"
- "12 people viewing this job right now"
- "This job was posted 3 days ago — apply soon"
These create FOMO and increase conversion.

#### 7. Invite & Earn (MEDIUM IMPACT)
Referral program for the platform itself:
- "Invite a friend → You both get Rs.50 off"
- Shareable invite link with tracking
- Leaderboard for top inviters

#### 8. LinkedIn Profile Import (LOW EFFORT, HIGH VALUE)
Instead of manual onboarding form, let users "Import from LinkedIn" to auto-fill company, position, education, skills. Reduces onboarding from 30 seconds to 5 seconds.

#### 9. Slack/Discord Community (LOW COST, HIGH RETENTION)
Create a community where:
- Users share interview experiences
- Referrers answer questions
- Daily job highlights posted
This increases retention and word-of-mouth.

#### 10. Subscription Model for Power Users (FUTURE)
Rs.1,499/month for unlimited referral applications (instead of Rs.499 each). Targets active job seekers who apply to 5+ jobs. Higher LTV.

---

## PART 6: 30-DAY LAUNCH TIMELINE

### Week 1: Technical Prep

| Day | Task |
|-----|------|
| Day 1 | Get Neon DB URL, connect production database |
| Day 1 | Test full payment flow with Cashfree sandbox |
| Day 2 | Add duplicate application check |
| Day 2 | Add admin endpoint authentication |
| Day 3 | Deploy `test` branch to EC2 |
| Day 3 | Verify SSL, domain, Cognito callbacks |
| Day 4 | Test E2E on jobthrive.in (real domain) |
| Day 4 | Fix any production bugs |
| Day 5 | Install Google Analytics + Mixpanel |
| Day 5 | Set up error monitoring (Sentry) |

### Week 2: Content & Creative

| Day | Task |
|-----|------|
| Day 6 | Create LinkedIn page for Job Thrive |
| Day 6 | Create Twitter/X account |
| Day 7 | Design 5 LinkedIn carousel posts |
| Day 7 | Design 3 ad creatives (seeker + referrer) |
| Day 8 | Write 10 LinkedIn posts (schedule for 2 weeks) |
| Day 8 | Create Instagram account + first 3 reels |
| Day 9 | Set up Telegram channel + invite first 50 people |
| Day 9 | Write email templates for referral status updates |
| Day 10 | Create "How Job Thrive Works" video (2 min) |

### Week 3: Soft Launch

| Day | Task |
|-----|------|
| Day 11 | Invite 50 friends/colleagues to try the platform |
| Day 11 | Post first LinkedIn carousel |
| Day 12 | Collect feedback from first users |
| Day 12 | Fix top 3 issues reported |
| Day 13 | Start LinkedIn ads (Rs.500/day) |
| Day 13 | Post first Twitter thread |
| Day 14 | Recruit first 10 referrers (reach out personally on LinkedIn) |
| Day 15 | Verify first 10 referrers' companies |

### Week 4: Public Launch

| Day | Task |
|-----|------|
| Day 16 | Post "We're live!" on LinkedIn + Twitter |
| Day 16 | Share in 10 job seeker Telegram groups |
| Day 17 | Launch on Product Hunt |
| Day 17 | Post on Reddit (r/india, r/developersIndia, r/bangalore) |
| Day 18 | Instagram reels push (Rs.300/day) |
| Day 19 | Reach out to 5 tech influencers for shoutouts |
| Day 20 | First weekly newsletter to all sign-ups |
| Day 21 | Review metrics, adjust ad spend |
| Day 22-30 | Iterate based on data, double down on what works |

---

## BUDGET ESTIMATE (First Month)

| Item | Monthly Cost |
|------|-------------|
| EC2 (already running) | ~Rs.2,000 |
| Neon DB (free tier) | Rs.0 |
| Domain (already owned) | Rs.0 |
| LinkedIn Ads | Rs.15,000 |
| Instagram Ads | Rs.9,000 |
| Cashfree (per transaction) | ~2% of revenue |
| Designer (freelance, 5 creatives) | Rs.5,000 |
| **Total** | **~Rs.31,000** |

### Revenue Projection (Conservative)

| Month | Referrals | Revenue (Rs.499 each) | Referrer Payout (Rs.249) | Net Revenue |
|-------|-----------|----------------------|-------------------------|-------------|
| Month 1 | 50 | Rs.24,950 | Rs.12,450 | Rs.12,500 |
| Month 2 | 150 | Rs.74,850 | Rs.37,350 | Rs.37,500 |
| Month 3 | 400 | Rs.1,99,600 | Rs.99,600 | Rs.1,00,000 |

**Break-even: Month 1** (if ads convert at target rates)

---

*Plan created April 30, 2026*
*Ready for execution on your go.*
