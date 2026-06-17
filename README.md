# MPH P&L Pop Quiz

A small full-stack quiz web app for reinforcing **Mission Pet Health — P&L
Line-Item Definitions** during a live team huddle. Each participant opens a
link, enters their name, answers **10 questions randomly drawn from a bank of
20**, and gets an instant score with a full review (correct answers +
rationales). Every submission is recorded so an admin can view results and
per-question analytics.

Built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, and
**Upstash Redis**.

## Features

- **Random per-session quiz** — 10 of 20 questions, selected server-side.
- **No answer leakage** — `/api/quiz` never sends correct answers to the
  browser; grading happens on the server in `/api/submit`.
- **Instant score + review** — color-coded correct/incorrect answers with a
  one-line rationale for each question.
- **Mobile-first UI** — one question at a time, progress bar, and a jump grid.
- **Admin dashboard** — results table, summary stats, per-question analytics
  (weakest concepts first), and CSV export, all behind an `ADMIN_KEY`.

## Routes

| Route          | Description                                            |
| -------------- | ------------------------------------------------------ |
| `/`            | Start page (name entry)                                |
| `/quiz`        | Take the quiz + score/review                           |
| `/admin`       | Admin login + dashboard                                |
| `GET /api/quiz`    | Returns 10 random questions (no answers)           |
| `POST /api/submit` | Grades + stores a submission, returns the review   |
| `GET /api/results` | Admin-only; all submissions + computed analytics   |

## Local development

```bash
npm install
cp .env.example .env.local   # set ADMIN_KEY; Upstash vars are optional locally
npm run dev
```

Open <http://localhost:3000>.

> **Zero-setup local mode:** if the Upstash env vars are left blank, the app
> uses an in-memory store so you can run and demo it without any database.
> In-memory data resets on restart and is per-instance — use Upstash for
> anything real.

### Environment variables

| Variable                  | Required | Notes                                              |
| ------------------------- | -------- | -------------------------------------------------- |
| `ADMIN_KEY`               | Yes      | Password for `/admin`. Choose something strong.    |
| `UPSTASH_REDIS_REST_URL`  | Prod     | Auto-injected by the Vercel Upstash integration.   |
| `UPSTASH_REDIS_REST_TOKEN`| Prod     | Auto-injected by the Vercel Upstash integration.   |

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Open the project's **Storage** tab → add **Upstash Redis** from the
   Marketplace. This auto-creates `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN`.
4. In **Settings → Environment Variables**, add `ADMIN_KEY` with a strong
   password.
5. **Deploy.** Your quiz is the root URL; the dashboard is at `/admin`.

## How grading & integrity work

`/api/quiz` returns only `{ id, part, question, options }` — the
`correctIndex` field never reaches the client. On submit, the server matches
each answer against the full question bank in `lib/questions.ts`, computes the
score, stores the submission in Redis, and returns the graded review for the
results screen.

## Project structure

```
app/
  page.tsx            # Landing / name entry
  quiz/page.tsx       # Quiz + result/review
  admin/page.tsx      # Admin login + dashboard
  api/quiz/route.ts   # Random questions (no answers)
  api/submit/route.ts # Grade + store
  api/results/route.ts# Admin-only results + analytics
components/Logo.tsx
lib/
  questions.ts        # Typed 20-question bank
  store.ts            # Upstash Redis with in-memory fallback
```
