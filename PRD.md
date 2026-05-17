# [cite_start]PRODUCT REQUIREMENTS DOCUMENT [cite: 247]
## [cite_start]VERSION 2.0 [cite: 248]

## [cite_start]ServeIQ [cite: 249]
### [cite_start]AI-Powered Service Orchestrator for the Informal Economy [cite: 250]

| Metadata Field | Value |
| :--- | :--- |
| **Version** | [cite_start]2.0 — Final [cite: 251] |
| **Status** | [cite_start]Approved for Development [cite: 251] |
| **Hackathon Track** | [cite_start]Challenge 2 — AI Service Orchestrator [cite: 251] |
| **Primary Stack** | [cite_start]React Native, Supabase, Google Antigravity, Google Maps [cite: 251] |
| **Authors** | [cite_start]ServeIQ Engineering Team [cite: 251] |

---

## [cite_start]1. Executive Summary [cite: 252]
[cite_start]ServeIQ is an AI-native service orchestration platform targeting Pakistan's vast informal service economy — a sector comprising plumbers, electricians, AC technicians, tutors, beauticians, drivers, and mechanics[cite: 253]. [cite_start]Today, this sector operates through WhatsApp groups, phone referrals, and word-of-mouth, resulting in poor discovery, unreliable matching, opaque pricing, and zero accountability[cite: 254]. 

[cite_start]ServeIQ eliminates these friction points through a multilingual agentic workflow orchestrated by Google Antigravity[cite: 255]. [cite_start]From a natural-language voice or text request in Urdu, Roman Urdu, or English, the system autonomously performs intent extraction, 6-factor provider matching, dynamic transparent pricing, real-time booking with double-booking prevention, live tracking, and an automated post-service quality-and-dispute loop — all with full agent reasoning traces visible to both users and providers[cite: 256]. [cite_start]The platform targets two primary markets: desi urban households seeking reliable home services, and informal service providers seeking consistent, fairly-priced work opportunities[cite: 257]. [cite_start]The business model is a 10% platform commission per completed booking, with a future subscription tier for high-volume providers[cite: 258].

---

## [cite_start]2. Problem Statement [cite: 259]
### [cite_start]2.1 Market Context [cite: 260]
[cite_start]Pakistan's informal service sector employs an estimated 72% of the non-agricultural workforce (Pakistan Bureau of Statistics, 2023)[cite: 261]. [cite_start]Despite this scale, service discovery remains fragmented across personal contacts, unreliable WhatsApp groups, and unverified Facebook marketplace listings[cite: 262].

### [cite_start]2.2 Core Pain Points [cite: 263]
| Stakeholder | Problem | Impact |
| :--- | :--- | :--- |
| **User (Customer)** | [cite_start]Cannot find verified, available providers quickly [cite: 264] | [cite_start]Service delays, safety risk [cite: 264] |
| **User (Customer)** | [cite_start]Pricing is opaque and inconsistent [cite: 264] | [cite_start]Overcharging, distrust [cite: 264] |
| **User (Customer)** | [cite_start]No accountability after poor service [cite: 264] | [cite_start]No recourse for disputes [cite: 264] |
| **Technician** | [cite_start]Inconsistent job flow — feast or famine [cite: 264] | [cite_start]Income instability [cite: 264] |
| **Technician** | [cite_start]No formal reputation system [cite: 264] | [cite_start]Skilled providers invisible [cite: 264] |
| **Platform** | [cite_start]Multilingual input parsing is hard [cite: 264] | [cite_start]Poor UX for target audience [cite: 264] |

### [cite_start]2.3 Scope Boundary [cite: 265]
[cite_start]This PRD covers the MVP scope for the hackathon deliverable, which is a fully functional prototype demonstrating the end-to-end service lifecycle[cite: 266]. [cite_start]Production-scale infrastructure, real payment gateway integration, and full KYC are noted as post-MVP scope[cite: 267].

---

## [cite_start]3. Goals, Objectives & Success Metrics [cite: 268]
### [cite_start]3.1 Primary Goals [cite: 269]
* [cite_start]Demonstrate a fully agentic end-to-end service lifecycle using Google Antigravity as the primary orchestrator[cite: 270].
* [cite_start]Handle multilingual, noisy, and voice-based input with measurable parsing confidence[cite: 271].
* [cite_start]Solve the informal economy's core trust problem through transparent pricing, proof-of-execution, and automated dispute resolution[cite: 272].
* [cite_start]Provide a fair opportunity engine for both new and established service providers[cite: 273].

### [cite_start]3.2 Key Performance Indicators (KPIs) [cite: 274]
| Metric | Minimum Threshold | Target | Measurement Method |
| :--- | :--- | :--- | :--- |
| **Intent parsing accuracy (multilingual)** | 85% | 92%+ | [cite_start]NLP test suite (50+ inputs) [cite: 275] |
| **Provider matching latency** | < 5 sec | < 2 sec | [cite_start]Backend timestamp logging [cite: 275] |
| **Booking confirmation rate** | 75% | 85%+ | [cite_start]Bookings confirmed / initiated [cite: 275] |
| **Double-booking incidents** | 0 in demo | 0 in production | [cite_start]Concurrent stress test [cite: 275] |
| **Dispute auto-resolution accuracy** | 80% | 90%+ | [cite_start]Reviewer audit of decisions [cite: 275] |
| **Provider on-time rate** | 80% | 90%+ | [cite_start]Timestamp: dispatch vs arrival [cite: 275] |
| **Agent trace coverage** | 100% | 100% | [cite_start]All decisions must have trace [cite: 275] |
| **App crash rate during demo** | < 1% | 0% | [cite_start]Manual + automated QA [cite: 275] |

---

## [cite_start]4. User Personas [cite: 276]
### [cite_start]4.1 Aisha — The Urban Household User [cite: 277]
* [cite_start]**Age / Location:** 34, F-10 Islamabad [cite: 278]
* [cite_start]**Tech Literacy:** Medium — uses WhatsApp daily, comfortable with apps [cite: 278]
* [cite_start]**Language:** Code-switches between Urdu and English in the same sentence [cite: 278]
* [cite_start]**Primary Need:** Find a trusted AC technician quickly without calling 10 contacts [cite: 278]
* **Frustration:** Quoted Rs. [cite_start]2,000 over market rate with no breakdown [cite: 278]
* [cite_start]**Key Requirement:** Upfront price, provider photo + reviews, and real-time tracking [cite: 278]

### [cite_start]4.2 Ali Raza — The Independent Technician [cite: 279]
* [cite_start]**Age / Location:** 28, G-9 Islamabad [cite: 280]
* [cite_start]**Tech Literacy:** Low-medium — uses WhatsApp, never used a service app [cite: 280]
* [cite_start]**Skill:** AC installation, servicing, and inverter repair (5 years experience) [cite: 280]
* [cite_start]**Primary Need:** Steady daily job flow without relying on personal contacts [cite: 280]
* [cite_start]**Frustration:** Customers ghost after service; no formal rating or reputation [cite: 280]
* [cite_start]**Key Requirement:** Transparent payout, simple accept/decline flow, fair dispute process [cite: 280]

### [cite_start]4.3 Admin Operator — Platform Manager [cite: 281]
* [cite_start]**Role:** Internal ServeIQ staff member managing platform operations [cite: 282]
* [cite_start]**Responsibilities:** Review disputed resolutions flagged for human review, approve provider KYC, monitor system health metrics, manage blacklists [cite: 282]
* [cite_start]**Access:** Web-based admin dashboard (separate from user/technician apps) [cite: 282]

---

## [cite_start]5. System Architecture [cite: 283]
### [cite_start]5.1 High-Level Architecture Overview [cite: 284]
[cite_start]ServeIQ follows a client-server architecture with a thin backend orchestration layer, a managed PostgreSQL database, and Google Antigravity as the stateful agent runtime[cite: 285]. [cite_start]All agentic decision workflows are routed through Antigravity; external services are called by the agent, not directly by the client[cite: 286].

| Layer | Technology | Responsibility |
| :--- | :--- | :--- |
| **Presentation** | React Native (Expo) — iOS & Android | [cite_start]User App, Technician App [cite: 287] |
| **Presentation** | Next.js (Web) — Admin Dashboard | [cite_start]Platform operator management [cite: 287] |
| **Orchestration** | Google Antigravity | [cite_start]Intent parsing, matching, pricing, booking, dispute [cite: 287] |
| **Backend / BaaS** | Supabase (PostgreSQL + Realtime + Auth + Edge Functions) | [cite_start]Database, auth, real-time events, serverless endpoints [cite: 287] |
| **Voice Processing** | OpenAI Whisper API (primary) / Google STT (fallback) | [cite_start]Audio -> raw text transcription [cite: 287] |
| **Mapping** | Google Maps SDK + Distance Matrix API | [cite_start]Provider geo-filtering, ETA, route display [cite: 287] |
| **Notifications** | Expo Push Notifications (primary), Twilio WhatsApp/SMS (fallback) | [cite_start]Job alerts, status updates, reminders [cite: 287] |
| **Storage** | Supabase Storage | [cite_start]Proof photos/videos, provider documents [cite: 287] |

### [cite_start]5.2 Data Flow — End-to-End Request Lifecycle [cite: 42, 288]
[cite_start]`[1] User Input` ➔ `[2] Voice/Text Normalisation` ➔ `[3] Antigravity Intent Extraction` ➔ `[4] Clarification Loop (if needed)` ➔ `[5] Geo Pre-filter (20km radius)` ➔ `[6] Distance Matrix API` ➔ `[7] Antigravity 6-Factor Scoring` ➔ `[8] Dynamic Pricing` ➔ `[9] UI Presents Top 3 Providers` ➔ `[10] User Selects & Confirms` ➔ `[11] PostgreSQL Serializable Transaction (Optimistic Lock)` ➔ `[12] Parallel or Sequential Dispatch` ➔ `[13] Technician Accept/Decline` ➔ `[14] Real-time Tracking (Supabase Realtime WS)` ➔ `[15] Proof Upload` ➔ `[16] Invoice Generation` ➔ `[17] Feedback Collection` ➔ `[18] Reputation Score Update` ➔ `[19] Dispute Trigger (if any)` ➔ `[20] Antigravity Dispute Resolution` ➔ `[21] Human Escalation (if confidence < 0.70)`[cite: 43, 44, 289, 290].

### [cite_start]5.3 Dependency Risk & Contingency [cite: 45, 291]
| Dependency | Risk | Contingency |
| :--- | :--- | :--- |
| **Google Antigravity SDK** | [cite_start]No public documentation — must validate availability before dev [cite: 46, 292] | [cite_start]If unavailable: use LangGraph + tool-calling LLM as structural replacement; maintain same interface contract [cite: 46, 292] |
| **Google Maps Distance Matrix** | [cite_start]Cost overrun at scale [cite: 46, 292] | [cite_start]Pre-filter to 20km radius first; cache results for 15 min TTL [cite: 46, 292] |
| **OpenAI Whisper** | [cite_start]Latency on device / API cost [cite: 46, 292] | [cite_start]Fallback: Google STT; local Whisper.cpp for offline [cite: 46, 292] |
| **Supabase Realtime** | [cite_start]WebSocket drops on poor connectivity [cite: 46, 292] | [cite_start]Implement exponential backoff reconnect + manual poll fallback at 30s intervals [cite: 46, 292] |
| **Twilio SMS / WhatsApp** | [cite_start]Rate limits in Pakistan [cite: 46, 292] | [cite_start]Fallback: in-app push notification with deep link [cite: 46, 292] |

---

## [cite_start]6. Functional Requirements — User Application [cite: 47, 293]

### [cite_start]FR-U-01: Authentication & Onboarding [cite: 48, 294]
* [cite_start]Users register via phone number[cite: 49, 295]. [cite_start]OTP verified through Supabase Auth (SMS via Twilio)[cite: 49, 295].
* [cite_start]Profile consists of: name, preferred language (Urdu / English / Auto-detect), default location, and payment method preference[cite: 50, 296].
* [cite_start]Consent screen: Explicit PDPA-compliant data collection consent with a checkbox[cite: 51, 297]. [cite_start]Non-consent blocks registration[cite: 51, 297].

### [COMPLETED - PHASE 3.1] [cite_start]FR-U-02: Multilingual Voice & Text Input [cite: 52, 298]
* Voice input: User taps microphone; [cite_start]`expo-av` records in M4A format, which is uploaded to the Whisper API for transcription[cite: 53, 299].
* [cite_start]Text input: Raw text accepted in Urdu, Roman Urdu, English, or mixed code-switched language[cite: 54, 300].
* [cite_start]Language detection: Whisper returns detected language; if confidence < 0.80, system defaults to Urdu prompts[cite: 55, 301].
* [cite_start]Antigravity extracts: `service_type`, `complexity`, `urgency`, `preferred_time`, `location_parsed`, `budget_sensitivity`, and `confidence_score`[cite: 56, 302].
* [cite_start]If `confidence_score` < 0.75: Enter Clarification Loop (FR-U-03)[cite: 57, 303]. If `confidence_score` >= 0.75: Proceed to matching[cite: 57, 303].

### [cite_start]FR-U-03: Clarification Loop [cite: 58, 304]
* Antigravity returns: `{ needs_clarification: true, missing_field: "location", question: "Aapko kis area mein service chahiye?" }`[cite: 59, 305].
* [cite_start]UI renders a chat bubble with the AI question + up to 4 quick-reply chips (nearby areas, current location button)[cite: 60, 306].
* [cite_start]User response is appended to the original input and re-submitted to intent extraction[cite: 61, 307]. [cite_start]Maximum of 2 clarification rounds are permitted[cite: 61, 307].
* [cite_start]If still unresolved after 2 rounds: Escalate to a manual input form pre-filled with the successfully detected fields[cite: 62, 308].

### [cite_start]FR-U-04: Provider Discovery & Presentation [cite: 63, 309]
* [cite_start]Backend queries the `providers` table for skill matches and an `Available` status within a 20km radius[cite: 64, 310].
* [cite_start]Google Distance Matrix API is called for the filtered candidate list (maximum of 30 providers)[cite: 65, 311].
* [cite_start]Antigravity scores all candidates using the 6-Factor Matching Algorithm (see Section 8.2)[cite: 66, 312].
* [cite_start]UI presents the top 3 providers[cite: 67, 313]. [cite_start]Each card displays: name, photo, rating, distance, ETA, price estimate, specialization badge, and a 1-sentence Antigravity reasoning trace (e.g., *"Matched: Highest AC Inverter rating within budget in your area"*)[cite: 67, 313].
* [cite_start]User may expand any provider card to view full review history, recent job count, and average response time[cite: 68, 314].

### [cite_start]FR-U-05: Booking Confirmation [cite: 69, 315]
* [cite_start]User selects a preferred time slot from available slots populated from the provider's calendar[cite: 70, 316].
* [cite_start]Booking is initiated via a Supabase RPC with a `SERIALIZABLE` isolation level using `SELECT FOR UPDATE` on the target provider row[cite: 71, 317].
* [cite_start]On success: Booking record is created, provider status is set to `Busy`, and a confirmation push notification is sent to both parties[cite: 72, 318].
* [cite_start]On failure (concurrent booking conflict): User is shown *"Provider just got booked — showing next best match"* with automatic re-routing to the Rank 2 provider[cite: 73, 319].
* [cite_start]Confirmation screen displays: provider name, ETA, address, breakdown of charges, and cancellation policy[cite: 74, 320].

### [cite_start]FR-U-06: Real-Time Tracking [cite: 75, 321]
* [cite_start]After confirmation, the app switches to the Tracking Screen[cite: 76, 322].
* [cite_start]Operates via a Supabase Realtime subscription on the `bookings` table (filtered by `booking_id`) with exponential backoff reconnection[cite: 77, 323].
* [cite_start]Status progression: `Confirmed` ➔ `Provider Accepted` ➔ `En Route` ➔ `Arrived` ➔ `In Progress` ➔ `Completed`[cite: 78, 324].
* [cite_start]Map view shows the technician's last-known location, updated every 30 seconds from the technician app[cite: 79, 325].
* [cite_start]If WebSocket connection drops: Execute a silent background poll every 30 seconds until reconnected[cite: 80, 326].

### [cite_start]FR-U-07: Payment & Invoice [cite: 81, 327]
* [cite_start]MVP payment: Cash confirmation or JazzCash/EasyPaisa deep-link redirect[cite: 82, 328].
* [cite_start]On job completion: Antigravity generates an itemized invoice calculation: `Base Rate + Distance Fee + Urgency Surge - Loyalty Discount`[cite: 83, 329].
* [cite_start]Invoice is displayed directly in-app, with a PDF downloadable via a Supabase Storage link[cite: 84, 330].
* [cite_start]The platform commission (10%) is deducted directly from the provider payout and is hidden from the user[cite: 85, 331].

### [cite_start]FR-U-08: Feedback & Rating [cite: 86, 332]
* [cite_start]Post-completion: 5-star rating prompt + optional text review (skippable after 5 seconds)[cite: 87, 333].
* [cite_start]Rating is submitted to Antigravity, which automatically recalculates the provider score and adjusts future matching weights[cite: 88, 334].
* [cite_start]A negative rating (1-2 stars) triggers an optional issue category selection (`Late Arrival` / `Poor Work Quality` / `Overcharged` / `Rude Behaviour`)[cite: 89, 335].

### [cite_start]FR-U-09: Dispute Initiation [cite: 90, 336]
* [cite_start]User may tap "Report Issue" within 24 hours of job completion[cite: 91, 337].
* Dispute categories: `Overcharged` | `No-Show` | `Poor Quality` | `Provider Did Not Arrive` | [cite_start]`Safety Concern`[cite: 92, 338].
* [cite_start]Evidence upload: Supports photos/videos (optional but highly recommended)[cite: 93, 339].
* [cite_start]System initiates the automated dispute resolution workflow (see Section 8.4)[cite: 94, 340].

---

## [cite_start]7. Functional Requirements — Technician Application [cite: 95, 341]

### [cite_start]FR-T-01: Onboarding & Verification [cite: 96, 342]
* [cite_start]Registration: Phone number (OTP), CNIC photo upload (front + back), and face selfie verification[cite: 97, 343].
* KYC status transitions: `Pending` | `Verified` | [cite_start]`Rejected`[cite: 98, 344]. [cite_start]Only `Verified` technicians are eligible to receive job dispatches[cite: 98, 344].
* [cite_start]Skills entry: Multi-select from service catalogue (AC, Plumbing, Electrical, etc.) with sub-skills (e.g., AC Inverter, AC Split, AC Window)[cite: 99, 345].
* [cite_start]Base rate entry: PKR per hour or per job (configurable per skill type)[cite: 100, 346].
* [cite_start]New technicians receive a "Verified New Talent" badge, with a Cold Start Boost active for their first 5 completed jobs[cite: 101, 347].

### [cite_start]FR-T-02: Cold Start Boost — Newbie Boost Engine [cite: 102, 348]
* [cite_start]Eligibility: Technician has fewer than 5 successfully completed and rated jobs[cite: 103, 349].
* [cite_start]Mechanism: Antigravity adds a flat +15 points to the matching score calculation for basic and intermediate complexity jobs only[cite: 104, 350].
* [cite_start]Decay: Boost deactivates automatically after the 5th rated completion[cite: 105, 351]. [cite_start]Status is managed via `providers.newbie_boost_remaining` (integer 5 ➔ 0)[cite: 105, 351].
* [cite_start]Boost is explicitly **NOT** applied to Complex jobs to protect platform quality boundaries[cite: 106, 352].

### [COMPLETED - PHASE 2.2] [cite_start]FR-T-03: Availability Engine (3-Tier) [cite: 107, 353]
* [cite_start]**OFFLINE (Manual):** Technician manually sets status to Offline[cite: 108, 354]. [cite_start]Stops all job dispatches and displays clearly in red on the dashboard[cite: 108, 354].
* [cite_start]**AVAILABLE (Default):** Active in the system and eligible for dispatch[cite: 109, 355]. [cite_start]Set automatically on app open and immediately following job completion[cite: 109, 355].
* [cite_start]**BUSY / ON-JOB (Auto-Triggered):** Set automatically when the technician accepts a job via database transaction[cite: 110, 356]. [cite_start]Reverts to `Available` when the job is marked `Completed` AND the invoice is acknowledged[cite: 111, 357].
* [cite_start]Manual override: Technician may switch back to `Available` mid-job only after a confirmation warning prompt (*"Are you sure? Current booking will be flagged for review."*)[cite: 112, 358].

### [cite_start]FR-T-04: Intelligent Job Dispatch — Parallel vs Sequential [cite: 113, 359]
* [cite_start]**Scheduled Jobs** (preferred_time > 2 hours from now): Sequential dispatch — only the Rank 1 provider receives the alert[cite: 114, 360]. [cite_start]Timeout: 10 minutes[cite: 114, 360].
* [cite_start]**Urgent Jobs** (preferred_time < 2 hours from now): Parallel dispatch — the top 2 providers receive simultaneous alerts[cite: 115, 361]. [cite_start]Timeout: 3 minutes[cite: 115, 361].
* [cite_start]On parallel dispatch acceptance: The accepting provider's status is locked instantly via database transaction[cite: 116, 362]. [cite_start]The other provider's alert is removed from their job inbox with a push notification: *"This urgent job was claimed by another provider."*[cite: 117, 363].
* [cite_start]On timeout (no acceptance): Antigravity auto-escalates to Rank 2 (sequential) or Rank 3 (urgent), notifying the user of the minor routing delay[cite: 118, 364].

### [COMPLETED - PHASE 2.2] [cite_start]FR-T-05: Job Alert & Reasoning Transparency [cite: 119, 365]
* [cite_start]Job alert notification contains: Service type, location (area only — exact address hidden until accepted), estimated payout, urgency indicator, and accept/decline buttons[cite: 120, 366].
* [cite_start]Below the alert: Displays a one-line Antigravity reasoning trace — e.g., *"Dispatched to you: 3.2km, 4.8-star AC Inverter specialist, within user budget."*[cite: 121, 367].
* [cite_start]Accept button starts a 3-minute countdown timer (urgent) or 10-minute timer (scheduled)[cite: 122, 368].
* [cite_start]Decline with reason (`Too Far` / `Not Available` / `Skill Mismatch`) is recorded directly to the provider profile[cite: 123, 369]. [cite_start]3 declines in one day triggers an automated system notification[cite: 124, 370].

### [cite_start]FR-T-06: Service Execution Flow [cite: 125, 371]
* [cite_start]**"Start Journey":** Triggers map navigation to the user's location, updates booking status to `En Route`, and timestamps departure[cite: 126, 372].
* [cite_start]**"Arrived":** Marks arrival timestamp and fires an arrival notification to the user[cite: 127, 373].
* [cite_start]**"Mark In Progress":** Starts an optional job timer tracking execution efficiency[cite: 128, 374].
* [cite_start]**Proof of Execution:** Technician must upload at least one photo or short video (maximum 30 seconds) before completion is unlocked[cite: 129, 375]. [cite_start]This is mandatory — the `Complete` button remains disabled until the upload resolves successfully[cite: 130, 376].
* [cite_start]**"Mark Completed":** Triggers invoice generation, issues a payment prompt to the user, and opens the 24-hour dispute window[cite: 131, 377].

### [cite_start]FR-T-07: Gamified Performance Dashboard [cite: 132, 378]
* [cite_start]Technician home screen displays: Reliability Score (0–100) with a 30-day change history graph [cite: 134, 379, 380][cite_start], today's/monthly earnings [cite: 135, 381][cite_start], job completion rate, average rating, and average response time[cite: 136, 382].

[cite_start]**Score Delta Rules Matrix:** [cite: 137, 383]
| Event | Score Delta | Notes |
| :--- | :--- | :--- |
| **Job completed + rated (4-5 stars)** | +3 | [cite_start]Applied after user submits rating [cite: 138, 384] |
| **Job completed + rated (1-3 stars)** | +1 | [cite_start]Completed status is still partially rewarded [cite: 138, 384] |
| **Job completed + no rating (24h passed)** | +1 | [cite_start]Partial baseline credit applied automatically [cite: 138, 384] |
| **Alert timeout (no response within window)** | -5 | [cite_start]Per incident penalty [cite: 138, 384] |
| **No-show (dispatched but did not arrive)** | -20 | [cite_start]Triggers immediate human review escalation [cite: 138, 384] |
| **Confirmed cancellation by provider** | -10 | [cite_start]User is auto-rerouted seamlessly [cite: 138, 384] |
| **Dispute resolved against provider** | -15 | [cite_start]Evidence-based enforcement action [cite: 138, 384] |
| **Dispute resolved in provider's favour** | 0 | [cite_start]No penalty or delta applied [cite: 138, 384] |

---

## [cite_start]8. Google Antigravity Orchestration Layer [cite: 139, 385]
[cite_start]Google Antigravity serves as the central agentic runtime, managing all critical decision loops with full reasoning trace logging[cite: 140, 386]. [cite_start]Databases, external LLMs, and APIs are treated as tools called directly by the agent[cite: 141, 387].

### [cite_start]8.1 Agent Workflow Inventory [cite: 142, 388]
| Workflow | Description | Trace Required |
| :--- | :--- | :--- |
| **intent_extraction** [COMPLETED - PHASE 3.1] | Parse multilingual input ➔ structured JSON | [cite_start]Yes — confidence score + field mapping [cite: 143, 389] |
| **provider_matching** | Score providers using 6-factor algorithm | [cite_start]Yes — per-provider score breakdown [cite: 143, 389] |
| **dynamic_pricing** | Generate itemized quote per provider | [cite_start]Yes — each price component logged [cite: 143, 389] |
| **scheduling_check** | Validate availability, prevent conflicts | [cite_start]Yes — conflict reason if any [cite: 143, 389] |
| **dispute_resolution** | Auto-adjudicate or escalate disputes | [cite_start]Yes — decision rationale + confidence [cite: 143, 389] |
| **reputation_update** | Recalculate provider score post-job | [cite_start]Yes — delta and reason [cite: 143, 389] |
| **demand_forecast** | Suggest optimal working hours to provider | [cite_start]Yes — forecast basis [cite: 143, 389] |

### [cite_start]8.2 6-Factor Provider Matching Algorithm [cite: 144, 390]
[cite_start]Antigravity computes a composite match score (0–100) for each candidate provider using the following normalized formula[cite: 145, 391]:

[cite_start]Score = (W1 * NormalizedRating) + (W2 * NormalizedProximity) + (W3 * AvailabilityScore) + (W4 * ReliabilityScore) + (W5 * SkillSpecialisationScore) + (W6 * PriceFairnessScore) + NewbieBoost [cite: 146, 392]

| Factor | Weight (W) | Calculation Basis | Normalization Method |
| :--- | :--- | :--- | :--- |
| **Rating** | 25% | Average rating from last 20 reviews (recency-weighted) | [cite_start]Linear scale: 0–5 ➔ 0–100 [cite: 147, 393] |
| **Proximity** | 20% | Travel time from provider to user via Distance Matrix | [cite_start]Inverse: 0 min = 100, 60 min = 0 [cite: 147, 393] |
| **Availability** | 15% | No calendar conflict in requested window + buffer | [cite_start]Binary: 0 or 100; partial overlap = 50 [cite: 147, 393] |
| **Reliability** | 20% | Reliability Score straight from dashboard (0–100) | [cite_start]Direct passthrough [cite: 147, 393] |
| **Skill Match** | 10% | Sub-skill match to job complexity classification | [cite_start]Exact=100, Partial=60, None=0 [cite: 147, 393] |
| **Price Fairness** | 10% | Proximity of base rate to user's budget sensitivity | [cite_start]Budget match = 100; over budget = 0 [cite: 147, 393] |
| **Newbie Boost** | Flat +15 | Applied only if newbie_boost_remaining > 0 | [cite_start]Additive, not weighted [cite: 147, 393] |

### [cite_start]8.3 Dynamic Pricing Engine [cite: 148, 394]
[cite_start]The pricing breakdown is structured as follows[cite: 149, 395]:
[cite_start]Final Price = Base Rate + Distance Fee + Urgency Surge + Complexity Premium - Loyalty Discount - Budget Compression [cite: 149, 395]

| Component | Calculation Basis | Cap / Floor |
| :--- | :--- | :--- |
| **Base Rate** | [cite_start]Provider's declared rate for this skill [cite: 150, 396] | [cite_start]Min PKR 200 [cite: 150, 396] |
| **Distance Fee** | [cite_start]PKR 20 × distance in km (round trip) [cite: 150, 396] | [cite_start]Cap: PKR 400 [cite: 150, 396] |
| **Urgency Surge** | [cite_start]20% of base rate if preferred_time is < 2 hours away [cite: 150, 396] | [cite_start]Only for Urgent jobs [cite: 150, 396] |
| **Complexity Premium** | [cite_start]Basic: 0%, Intermediate: 10%, Complex: 25% [cite: 150, 396] | [cite_start]Applied directly to base rate [cite: 150, 396] |
| **Loyalty Discount** | [cite_start]5% off if user has > 3 completed bookings [cite: 150, 396] | [cite_start]Max: PKR 100 [cite: 150, 396] |
| **Budget Compression** | [cite_start]If budget_sensitivity = High, agent attempts up to -10% negotiation [cite: 150, 396] | [cite_start]Provider must have auto-negotiation enabled [cite: 150, 396] |

### [cite_start]8.4 Dispute Resolution Engine [cite: 151, 397]
* [cite_start]Follows a two-tier process with automatic escalation rules[cite: 152, 398].
* **Tier 1 (Automated — Antigravity):** Agent compares user complaint text, booking invoice, proof-of-execution media metadata, and historical provider records[cite: 153, 399]. Confidence threshold for auto-resolution must be >= 0.75[cite: 154, 400]. 
* Available automated actions: `Issue full refund` | `Issue partial refund` | `No refund (dismiss)` | `Apply provider penalty` | `Issue warning` | [cite_start]`Clear dispute`[cite: 155, 156, 401, 402]. [cite_start]All automated actions trigger a 48-hour freeze period during which the penalized party may appeal[cite: 157, 403].
* **Tier 2 (Human Escalation):** Automatically escalates to the Admin dispute queue if agent confidence < 0.75 OR dispute amount > PKR 5,000 OR complaint category is flagged as a `Safety Concern`[cite: 158, 404]. Response SLA: 24 hours[cite: 159, 405].
* [cite_start]Provider appeals auto-escalate directly to Tier 2 within the 48-hour window[cite: 160, 406].
* [cite_start]Blacklist trigger: 3 no-show incidents OR 2 Safety Concern disputes within 90 days results in immediate account suspension + manual review[cite: 161, 407].

### [cite_start]8.5 Scheduling Intelligence [cite: 162, 408]
* [cite_start]**Double-booking prevention:** Checks provider's current bookings for any time overlaps, enforcing a strict 30-minute travel buffer before and after each job[cite: 163, 409].
* **Alternate slot suggestion:** If the user's preferred time window is blocked, the agent returns the top 3 alternative slots within the same day[cite: 164, 410].
* [cite_start]**Waitlist management:** Users can join an active waitlist if no matching providers are free in the requested window[cite: 165, 411]. [cite_start]System notifies them immediately when availability shifts[cite: 166, 412].
* **Provider cancellation handling:** If a provider cancels post-confirmation, the system auto-triggers re-matching from the top of the originally generated ranked list, issues an apology to the user, and hits the provider with a -10 reliability score penalty[cite: 167, 413].

---

## 9. Non-Functional Requirements [cite: 414]
| Category | Requirement | Specification |
| :--- | :--- | :--- |
| **Performance** | Intent extraction latency [cite: 415] | < 2 seconds (P95) for text; < 5 seconds for voice input (with STT processing) [cite: 415] |
| **Performance** | Provider matching latency [cite: 415] | < 3 seconds from intent lock to ranked list returned [cite: 415] |
| **Performance** | Realtime status update latency [cite: 415] | < 1 second from database update to client UI change [cite: 415] |
| **Scalability** | Concurrent users (MVP) [cite: 415] | 50 concurrent sessions for demo; must scale horizontally [cite: 415] |
| **Reliability** | App uptime [cite: 415] | 99.5% during demo window; graceful degradation on API failure [cite: 415] |
| **Reliability** | Offline handling [cite: 415] | Actions queued when offline and replayed on reconnect; UI indicates offline status [cite: 415] |
| **Security** | Authentication [cite: 415] | Supabase Auth with OTP; JWT tokens expire in 1 hour; secure storage used [cite: 415] |
| **Security** | Row Level Security [cite: 415] | RLS policies enforced on all tables. Users can only read their own bookings [cite: 415] |
| **Security** | API exposure [cite: 415] | Edge Functions expose only signed endpoints; Anon key has read-only access [cite: 415] |
| **Privacy** | PDPA Compliance [cite: 415] | Explicit consent; data minimization; location purged 7 days post-booking [cite: 415] |
| **Accessibility** | Language support [cite: 415] | UI bilingual labels (EN/UR); font size min 14pt; high contrast support [cite: 415] |
| **Observability** | Agent trace logging [cite: 415] | 100% of decisions logged with timestamp, payload, output, confidence, and latency [cite: 415] |

---

## 10. Data Models & Schema (Supabase PostgreSQL) [cite: 416, 417]
All primary keys use UUID, and all tables enforce updated_at and created_at timestamps[cite: 418, 419].

### 10.1 `users` Table [cite: 420]
| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | UUID (PK) | Supabase Auth UID [cite: 421] |
| **phone** | TEXT UNIQUE | E.164 format; used for OTP authentication [cite: 421] |
| **name** | TEXT | Display name [cite: 421] |
| **preferred_language** | ENUM('ur', 'en', 'auto') | [cite_start]UI and NLP engine language preference [cite: 421] |
| **wallet_balance** | NUMERIC(10,2) | [cite_start]Platform credit balance in PKR [cite: 421] |
| **total_bookings** | INTEGER | [cite_start]Count of completed bookings (used for loyalty discounts) [cite: 421] |
| **pdpa_consent** | BOOLEAN | [cite_start]Must be TRUE to allow platform utilization [cite: 421] |
| **pdpa_consent_at** | TIMESTAMPTZ | [cite_start]Exact timestamp of user privacy consent [cite: 421] |

### [cite_start]10.2 `providers` Table [cite: 422]
| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | UUID (PK) | [cite_start]Supabase Auth UID [cite: 423] |
| **phone** | TEXT UNIQUE | [cite_start]E.164 phone format [cite: 423] |
| **cnic_verified** | BOOLEAN | [cite_start]Set to TRUE by admin after KYC document review [cite: 423] |
| **kyc_status** | ENUM('pending', 'verified', 'rejected') | [cite_start]Only 'verified' technicians receive active job alerts [cite: 423] |
| **skills** | TEXT[] | [cite_start]Array of validated skill tags (e.g., `['AC Inverter', 'AC Split']`) [cite: 423] |
| **base_rate** | JSONB | [cite_start]Map charting rates per skill (e.g., `{skill: rate_pkr}`) [cite: 423] |
| **current_status** | ENUM('available', 'busy', 'offline') | [cite_start]Managed dynamically by system and manual toggle inputs [cite: 423] |
| **reliability_score** | INTEGER (0-100) | [cite_start]Gamified engine rating updated by Antigravity [cite: 423] |
| **avg_rating** | NUMERIC(3,2) | [cite_start]Recalculated dynamically on each new review entry [cite: 423] |
| **total_ratings** | INTEGER | [cite_start]Count tracking base for rating recalculations [cite: 423] |
| **cancellation_rate** | NUMERIC(5,4) | [cite_start]Total Cancellations / Total Dispatches; updated per event [cite: 423] |
| **newbie_boost_remaining**| INTEGER (0-5) | Decrements per rated completion; [cite_start]0 equals boost inactive [cite: 423] |
| **last_known_lat** | NUMERIC(9,6) | [cite_start]Tracked location latitude (updates every 30 sec mid-job) [cite: 423] |
| **last_known_lng** | NUMERIC(9,6) | [cite_start]Tracked location longitude (updates every 30 sec mid-job) [cite: 423] |
| **suspended_until** | TIMESTAMPTZ | [cite_start]NULL if active; tracks ban date expiration if flagged [cite: 423] |

### [cite_start]10.3 `bookings` Table [cite: 424]
| Column | Type | Description |
| :--- | :--- | :--- |
| **id** | UUID (PK) | [cite_start]Unique booking reference ID [cite: 425] |
| **user_id** | UUID (FK ➔ users) | [cite_start]Reference to the requesting user [cite: 425] |
| **provider_id** | UUID (FK ➔ providers)| [cite_start]Reference to the assigned technician [cite: 425] |
| **service_type** | TEXT | [cite_start]Parsed clean service name string [cite: 425] |
| **complexity** | ENUM('basic', 'intermediate', 'complex') | [cite_start]Job tier sorting [cite: 425] |
| **urgency** | ENUM('standard', 'urgent') | [cite_start]Drives the matching dispatch strategy [cite: 425] |
| **scheduled_at** | TIMESTAMPTZ | [cite_start]Agreed service delivery time [cite: 425] |
| **status** | ENUM('pending', 'confirmed', 'en_route', 'arrived', 'in_progress', 'completed', 'disputed', 'cancelled') | [cite_start]Core lifecycle tracker state [cite: 425] |
| **price_breakdown** | JSONB | [cite_start]Nested map mapping `{base, distance, surge, complexity, discount, total}` [cite: 425] |
| **antigravity_trace** | JSONB | [cite_start]Full agent reasoning log trace for internal auditing [cite: 425] |
| **proof_media_urls** | TEXT[] | [cite_start]Supabase Storage paths for uploaded job completion evidence [cite: 425] |
| **dispute_id** | UUID (FK ➔ disputes) | Linked dispute pointer; [cite_start]NULL by default if unflagged [cite: 425] |
| **departed_at** | TIMESTAMPTZ | [cite_start]Timestamp mapping when provider clicked 'Start Journey' [cite: 425] |
| **arrived_at** | TIMESTAMPTZ | [cite_start]Timestamp mapping when provider clicked 'Arrived' [cite: 425] |
| **completed_at** | TIMESTAMPTZ | [cite_start]Job completion settlement timestamp [cite: 425] |

---

## [cite_start]11. Security & Privacy [cite: 180, 426]
* **Auth & Session Control:** Handled via Supabase Auth; [cite_start]JWT access tokens expire in 1 hour, and refresh tokens are securely compartmentalized inside `expo-secure-store`[cite: 182, 428]. 
* **Role-Based Access Control:** Users are separated into `USER`, `PROVIDER`, and `ADMIN` tiers, with data access restrictions heavily enforced at the database layer via PostgreSQL Row Level Security (RLS) policies[cite: 183, 429]. Admin operations enforce a mandatory 2FA (TOTP) constraint[cite: 184, 430].
* [cite_start]**PDPA 2023 Compliance:** Mandatory explicit consent collected and version-logged at registration[cite: 186, 432]. [cite_start]Enforces data minimization: User real-time location vectors are permanently purged 7 days post-booking completion, and sensitive CNIC assets are encrypted in storage with admin-only visibility[cite: 187, 433].
* User data deletion rules: Hard account deletions soft-delete all identifiable personal information within 30 days, keeping completely anonymized records for compliance auditing[cite: 188, 189, 434, 435]. Proof media files are deleted 90 days post dispute-resolution[cite: 190, 436].
* [cite_start]**Booking Mutations Pipeline:** Writes and adjustments bypass direct client-to-DB calls and route through server-side validated Supabase Edge Functions[cite: 192, 438]. [cite_start]Inbound actions are rate-limited to a maximum of 10 booking initiations per user per hour[cite: 193, 439]. [cite_start]Provider location updates are rejected unless status is explicitly `En Route` or `Arrived`[cite: 194, 440].

---

## [cite_start]12. Testing & QA Strategy [cite: 195, 441]
* [cite_start]**Multilingual NLP Test Suite:** Minimum of 50 distinct text inputs testing formal Urdu [cite: 197, 198, 443, 444][cite_start], Roman Urdu [cite: 199, 445][cite_start], mixed code-switching [cite: 200, 446][cite_start], common regional typos/slang (*"plmber bhej do"*) [cite: 201, 447][cite_start], Whisper audio transcript cases [cite: 202, 448][cite_start], and ambiguity edge cases designed to test the Clarification Loop pipeline[cite: 203, 449].
* [cite_start]**Concurrent Booking Stress Testing:** Simulates a scenario where 5 distinct user sessions target the exact same provider at the exact same milisecond[cite: 205, 206, 451, 452]. [cite_start]Testing passes if exactly 1 transaction locks successfully while the remaining 4 gracefully auto-reroute to their respective Rank 2 options[cite: 207, 453].
* **Validation Baseline Metrics:** Scoring calculations outputted by Antigravity must fall within a strict delta constraint of $\pm 2$ points compared against a manual multi-factor mathematical spreadsheet baseline[cite: 209, 210, 211, 455, 456, 457]. Automated dispute resolutions must align with 10 pre-scripted validation outcomes with an accuracy threshold of $\ge 80\%$[cite: 212, 213, 214, 458, 459, 460].

**System Stress-Test Requirements:** [cite: 215, 461]
| Scenario Context | Expected System Behaviour |
| :--- | :--- |
| **No provider available in window** | Offer active waitlist placement; fire update alert when slot shifts open [cite: 216, 462] |
| **Provider cancels post-confirmation** | Auto-trigger reroute to Rank 2; penalize score by -10; push apology notification [cite: 216, 462] |
| **Misspelled, mixed, or ambiguous text** | Trigger Clarification loop (max 2 rounds); fail gracefully to manual pre-filled form [cite: 216, 462] |
| **Two users request same provider slot** | First transaction commit locks; second collision context instantly reroutes [cite: 216, 462] |
| **Customer disputes invoice calculation** | Trigger Tier 1 automated review if agent confidence $\ge 0.75$; else route to Tier 2 queue [cite: 216, 462] |
| **High rating provider with recent drops** | Recency-weighted math and cancellation factors decay score; system demotes matching priority [cite: 216, 462] |

---

## 13. Risk Register [cite: 217, 463]
| Risk Event | Likelihood | Impact | Mitigation Plan |
| :--- | :--- | :--- | :--- |
| **Antigravity SDK access restricted** | High | Critical | Validate SDK hooks in Week 1. Fallback: LangGraph + structured tool-calling schema [cite: 218, 464] |
| **Maps Distance Matrix cost overrun** | Medium | High | Apply 20km geo pre-filtering; cache queries with 15-min TTL; set a $50 alert cap [cite: 218, 464] |
| **Poor local network connectivity** | High | Medium | Implement exponential backoff WS reconnection + 30s manual poll; queue offline tasks [cite: 218, 464] |
| **Provider supply cold-start blocks flow** | Medium | High | Deploy the Newbie Boost scoring engine + reward incentives (0% commission on first 5 jobs) [cite: 218, 464] |
| **Bad-faith dispute exploitation** | Medium | High | Hard limit: max 2 automated dispute resolutions per user per 30 days; 3rd requires manual review [cite: 218, 464] |
| **Provider location spoofing attempts** | Low | Medium | Run Haversine boundary check: flag for review if location vector shifts $>10\text{km}$ from route [cite: 218, 464] |
| **Provider app crashes mid-job (Stuck state)**| Medium | Medium | Dead-man timer: if status stays `Busy` for $>4\text{ hours}$, alert admin and auto-revert state [cite: 218, 464] |

---

## 14. Future Scope (Post-MVP) [cite: 219, 465]
### 14.1 Phase 2 — Market Expansion (3–6 Months) [cite: 220, 466]
* [cite_start]Expand service taxonomy to encompass healthcare at home, pest control, cleaning, and private tutoring[cite: 221, 467].
* [cite_start]Launch geographic expansion across Karachi, Lahore, and Islamabad/Rawalpindi simultaneously[cite: 222, 468].
* Deploy provider premium subscription model (PKR 999/month for reduced platform commission and priority job dispatching)[cite: 223, 469].

### 14.2 Phase 3 — Intelligence Layer (6–12 Months) [cite: 224, 470]
* [cite_start]Integrate predictive demand forecasting engines to alert providers ahead of localized demand spikes[cite: 225, 471].
* [cite_start]Introduce localized surge pricing mechanisms driven by live micro-demand vectors[cite: 226, 472].
* Deploy an earnings optimization advisor recommending optimal coverage routing strategies[cite: 227, 473].

### 14.3 Phase 4 — Platform Ecosystem (12+ Months) [cite: 229, 475]
* [cite_start]Launch ServeIQ Business tier specialized for property and housing asset management operators[cite: 230, 476].
* [cite_start]Embed dynamic financing options (BNPL lines for high-scale structural repairs) partnered with credit lenders[cite: 231, 477].
* Integrate production digital payment rails (JazzCash, EasyPaisa, bank APIs) backed by built-in platform escrow safety features[cite: 232, 478].

---

## 15. Assumptions & Constraints [cite: 233, 479]
### 15.1 Assumptions [cite: 234, 480]
* [cite_start]Antigravity runtime environments remain accessible with sufficient operational rate limits throughout the hackathon[cite: 235, 481].
* [cite_start]Minimum baseline of 30 mock provider rows spanning 5 core disciplines will be seeded prior to live presentation judging[cite: 236, 482].
* Demo environments evaluate behavior assuming access to stable connection channels[cite: 237, 483].
* [cite_start]Payments are cash-simulated and financial ledger records are mocked during MVP testing[cite: 238, 484].
* [cite_start]KYC image authenticity processing is simulated via mock state toggles in the admin dashboard[cite: 239, 485].

### [cite_start]15.2 Constraints [cite: 240, 486]
* [cite_start]Delivery timeline: Prototypes must map completely to the definitive hackathon time framework[cite: 241, 487].
* Mobile priority: Delivering a fully working React Native frontend represents the primary mandatory constraint[cite: 242, 488].
* [cite_start]Budget ceiling: API execution costs must remain strictly within tier limits or minimized credit windows[cite: 243, 489].
* [cite_start]Architectural integrity: Google Antigravity must serve as the explicit backend orchestrator runtime[cite: 244, 490].

---

## [cite_start]16. Glossary [cite: 245, 491]
* [cite_start]**Antigravity:** Google's agentic orchestration runtime used as the central decision engine for all AI workflows in ServeIQ[cite: 246, 492].
* **Reasoning Trace:** A logged explanation of why Antigravity made a specific decision (e.g., why Provider A was ranked above Provider B)[cite: 246, 492].
* [cite_start]**Cold Start Problem:** The challenge of matching new providers who have no rating history; solved by the Newbie Boost engine[cite: 246, 492].
* [cite_start]**Optimistic Locking:** A database technique that prevents two concurrent requests from both succeeding in booking the same provider[cite: 246, 492].
* **Parallel Dispatch:** Sending a job alert to multiple providers simultaneously; used for urgent jobs only[cite: 246, 492].
* [cite_start]**Sequential Dispatch:** Sending a job alert to one provider at a time (best match first); used for scheduled jobs[cite: 246, 492].
* [cite_start]**PDPA:** Pakistan Personal Data Protection Act 2023 — the legal framework governing data collection and privacy[cite: 246, 492].
* **RLS:** Row Level Security — Supabase/PostgreSQL feature ensuring users can only access their own data rows[cite: 246, 492].
* [cite_start]**Reliability Score:** A 0–100 gamified score tracking a technician's on-time rate, completion rate, and dispute history[cite: 246, 492].
* [cite_start]**Urgency Surge:** A price premium applied when the requested service time is less than 2 hours from the request[cite: 246, 492].
* **KYC:** Know Your Customer — identity verification process (CNIC + selfie) for provider onboarding[cite: 246, 492].
* [cite_start]**ETA:** Estimated Time of Arrival — calculated from Google Maps using live traffic data[cite: 246, 492].