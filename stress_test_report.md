# DESTROY REPORT: Next.js + TypeScript Application

**Date:** 2025-12-14
**Status:** CRITICAL VULNERABILITIES DETECTED

## 1. Executive Summary: What Breaks First?

Your application will explode immediately upon moderate load, likely before you even hit "viral" traffic.

**The First Dominos to Fall:**

1.  **Database Connection Exhaustion:** You are opening TWO separate connection pools to MongoDB. `lib/db.ts` uses Mongoose with a cache, but `lib/auth.ts` initializes a raw `MongoClient` at the top level without any caching or connection pooling strategy. In a serverless environment (Vercel), this will inevitably hit the `maxPoolSize` limit immediately as every lambda spin-up creates a new connection.
2.  **Memory OOM (Out of Memory):** `getEvents` in `app/actions.ts` fetches **ALL** events for a user without pagination (`Event.find({ userId: sessionUser.id })`). A single user with 2-3 years of data refreshing their calendar will crash the server function.
3.  **Security Breach:** Your Gemini API Key is exposed in `services/geminiService.ts` via `process.env.NEXT_PUBLIC_GEMINI_API_KEY` (if the env var actually starts with NEXT_PUBLIC). If it doesn't, the client-side code import might still bundle it if not careful, but the explicit `NEXT_PUBLIC` usage in code suggests you intended to expose it, or are leaking it.

**Verdict:** The system is **NOT PRODUCTION READY**.

---

## 2. Top 10 Critical Risks (Ranked)

| Rank   | Risk                                                        | Impact                                                                          | Difficulty to Fix |
| :----- | :---------------------------------------------------------- | :------------------------------------------------------------------------------ | :---------------- |
| **1**  | **Duplicate DB Connections** (`lib/db.ts` vs `lib/auth.ts`) | **Catastrophic.** Connection limit errors within minutes of load.               | Low               |
| **2**  | **Unbounded Queries** (`getEvents`, `getSubscriptions`)     | **High.** API timeouts & OOM crashes as data grows.                             | Medium            |
| **3**  | **Exposed Secrets** (Gemini API Key)                        | **Severe.** Quota theft and wallet drainage.                                    | Low               |
| **4**  | **No Rate Limiting**                                        | **High.** Bots can spam `askAiAssistant` and drain your AI credits instantly.   | Medium            |
| **5**  | **Heavy Client Re-renders** (`Widgets.tsx`)                 | **Medium.** `setInterval` every 1000ms causes full widget tree re-renders.      | Low               |
| **6**  | **Blocking Sync Logic**                                     | Potential main thread blocking if large datasets are processed in `EventModal`. | Medium            |
| **7**  | **No Error Boundaries**                                     | **Medium.** A single component crash white-screens the entire app.              | Low               |
| **8**  | **Missing Caching**                                         | **Medium.** Static data (weather, constant resources) is refetched too often.   | Low               |
| **9**  | **Wait for "Processing"** (`EventModal.tsx`)                | **Annoyance.** Artificial `setTimeout` delay decreases perceived performance.   | Low               |
| **10** | **Logging Blindness**                                       | **High.** `console.error` is insufficient for diagnosing production outages.    | Medium            |

---

## 3. Scalability Score

**Score: 2/10**

- **1 point** for using Next.js (good foundation).
- **1 point** for separating UI into components.
- **-8 points** for DB connection leaks, unpaginated queries, and exposed secrets.

---

## 4. Estimated Safe Traffic Limits

Based on current architecture (Vercel Free/Pro limits assumed):

- **Concurrent Users:** ~20-50 (limited by DB connection pool exhaustion).
- **Requests Per Second (RPS):** ~10 RPS (before DB latency spikes due to connection overhead).
- **Data Limit:** ~500 events per user (before `getEvents` becomes noticeably slow/times out).

---

## 5. Immediate Action Checklist (The "Don't GET FIRED" List)

1.  **[CRITICAL] Unified DB Connection:**

    - **Delete** the raw `MongoClient` in `lib/auth.ts`.
    - Reuse the Mongoose connection from `lib/db.ts` or create a proper singleton for `better-auth`.
    - Ensure `maxPoolSize` is configured correctly for Serverless (usually 1-2 per lambda, or use something like MongoDB Realm/Atlas Data API/Prisma Accelerate).

2.  **[CRITICAL] Pagination:**

    - Update `getEvents` to accept `startDate` and `endDate`.
    - **Only fetch** events for the current view (Month/Week).
    - `Event.find({ userId: ..., startTime: { $gte: start, $lte: end } })`.

3.  **[SECURITY] Secure Env Vars:**

    - Move `gemini-2.5-flash` calls to a **Server Action** or API Route.
    - **NEVER** use `NEXT_PUBLIC_` for the API key.
    - The client should call your server -> your server calls Gemini.

4.  **[PERFORMANCE] Fix `Widgets.tsx`:**

    - Remove the 1-second interval if you only need minutes. Or move the clock to a tiny isolated component `Clock.tsx` so the entire `TimeWeatherWidget` doesn't re-render every second.

5.  **[PROTECTION] Rate Limiting:**
    - Install `@upstash/ratelimit` (or similar).
    - Wrap `askAiAssistant` and `generateMeetingDetails` to allow max 5 requests/minute per IP/User.

---

## 6. Survival Plan: "If This Goes Viral Tomorrow"

If you wake up to 100k users:

1.  **Database Panic Button:**
    - Immediately enable **MongoDB Atlas Connection Pooling** (or PgBouncer if SQL).
    - If that fails, shut down the "Statistics/Widgets" endpoints to save DB CPU.
2.  **Cache Everything:**
    - Wrap `getEvents` results in `unstable_cache` (Next.js Cache) tagged by user ID. Invalidated only on write actions.
3.  **Disable AI Features:**
    - Feature flag off `askAiAssistant` and `getWeatherForecast`. These are heavy external calls that will throttle your backend.
4.  **CDN Static Assets:**
    - Ensure strict `Cache-Control` headers for all images and JS bundles.

---

## 7. Brutal Honesty Section

- **The Clock:** You have a `useEffect` updating state every 1000ms in a massive component. This is React 101 performance suicide. Isolate that clock.
- **The Sleep:** `await new Promise(resolve => setTimeout(resolve, 300));` in `EventModal.tsx`? **Why?** Users want speed. Do not fake latency. Remove it.
- **The "Any" Types:** `onSave: (eventData: any) => void` in `EventModal`. You are using TypeScript, use it! This `any` hides the fact that you might be passing unserializable data (Dates) to Server Actions, which Next.js will warn about or fail on.

**Final Word:** Good UI work, but the backend plumbing is leaking. Fix the DB connections and pagination _today_.
