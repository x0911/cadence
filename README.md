<div align="center">

# 🔥 Cadence

**Your consistency, beautifully tracked.**

A gamified habit & streak tracker with a real-time 3D "Streak Orb" that grows as you build consistency — built with Next.js 14, Supabase, and Three.js.

[**🚀 Live Demo**](https://get-cadence.vercel.app/login) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase)
![Three.js](https://img.shields.io/badge/Three.js-r185-black?logo=three.js)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

</div>

---

## ✨ What is Cadence?

Cadence turns habit-building into something you actually want to look at. Instead of a boring checklist, every habit you track feeds into a **living 3D orb** that visually strengthens — from a dormant wireframe sphere to a pulsing, particle-wrapped centerpiece — as your streaks grow.

It's a full-stack, production-shaped reference app: real auth, row-level security, optimistic UI, timezone-correct streak math, unit + E2E tests, and a guest demo mode — built as a portfolio-grade example of a polished Next.js + Supabase product, not a toy CRUD app.

> 🧪 Want to poke around without signing up? Hit **"Try Interactive Guest Demo"** on the [login page](https://get-cadence.vercel.app/login) — no account needed.

---

## 🖼️ Preview

| Dashboard & Streak Orb | Habit Detail & Heatmap |
|---|---|
| *screenshot/GIF placeholder — add after visual refresh* | *screenshot/GIF placeholder — add after visual refresh* |

---

## 🧠 Key Features

- **3D Streak Orb** — a `react-three-fiber` scene that reacts to your overall consistency across 4 strength levels (dormant → building → established → strong), with instanced particle auras and orbit rings at higher levels. Automatically falls back to a static, accessible SVG on low-end devices, when WebGL is unavailable, or when `prefers-reduced-motion` is set.
- **Timezone-correct streak logic** — all streak math runs on local calendar dates (never raw UTC timestamps), mirrored client-side (for instant optimistic UI) and server-side (Postgres `get_current_streak()` function) so they never drift apart.
- **Milestone celebrations** — hitting 7 / 30 / 100 / 365-day streaks fires a full-screen confetti celebration, tracked via a unique DB constraint so it only ever fires once per milestone per habit.
- **Focus Mode** — an optional countdown timer per habit with a Web Audio chime on completion — no external audio assets needed.
- **Consistency heatmap** — a 26-week GitHub-style contribution calendar per habit.
- **Guest demo account** — one-click, no-signup exploration, reset nightly via a scheduled Supabase Edge Function.
- **Weekly email recaps** — opt-in summary emails (via Resend) of completions, focus time, and active habits.
- **Full accessibility pass** — screen-reader-only status summaries on every visual widget (orb, heatmap), keyboard-navigable dialogs/menus (Radix primitives), WCAG AA-checked color palette, and device-capability guard-railing (`lib/device.ts`) before any WebGL is ever mounted.
- **Dark mode** and a cohesive, animated design language (see [Design & Credits](#-design--credits)).

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Database / Auth | [Supabase](https://supabase.com) (Postgres, Row-Level Security, Auth) |
| Data fetching / cache | [TanStack Query](https://tanstack.com/query) |
| Client state | [Zustand](https://github.com/pmndrs/zustand) |
| 3D rendering | [Three.js](https://threejs.org) + [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) + [drei](https://github.com/pmndrs/drei) |
| Styling | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) |
| Animation | [GSAP](https://gsap.com) + [React Bits](https://reactbits.dev) (animated backgrounds, text, and card effects) |
| Email | [Resend](https://resend.com) |
| Testing | [Vitest](https://vitest.dev) (unit) + [Playwright](https://playwright.dev) (E2E) |
| Deployment | [Vercel](https://vercel.com) (app) + [GitHub Actions](https://github.com/features/actions) (scheduled jobs) |

---

## 📂 Project Structure

```
cadence/
├── app/
│   ├── (marketing)/       # Public landing page — zero client-side data deps, fast LCP
│   ├── (app)/             # Authenticated app shell — dashboard, habit detail, settings
│   ├── login/             # Auth screen (email/password, magic link, guest demo)
│   ├── auth/callback/     # Supabase OAuth/magic-link callback handler
│   └── api/cron/          # Vercel-invoked cron routes (weekly summary, demo reset)
├── components/
│   ├── features/          # Domain components (habit-card, streak-orb, focus-timer, ...)
│   ├── ui/                 # shadcn/Radix-based primitives
│   └── react-bits/         # Vendored, theme-matched React Bits components
├── hooks/                 # TanStack Query hooks (useHabits, useCheckIn, useStreakStats, ...)
├── lib/
│   ├── streaks.ts         # Pure, unit-tested streak calculation functions
│   ├── device.ts          # WebGL / reduced-motion / low-end-device guard-railing
│   ├── palette.ts         # Constrained, WCAG-AA-checked icon & color tokens
│   └── supabase/          # Browser, server, middleware, and admin Supabase clients
├── store/                 # Zustand UI store (modals, celebration queue, 3D toggle)
├── supabase/
│   ├── migrations/        # SQL schema + RLS policies + streak function
│   └── functions/         # Deno Edge Functions (weekly-summary, reset-demo-data)
├── tests/
│   ├── unit/               # Vitest
│   └── e2e/                 # Playwright
└── .github/workflows/      # CI + Supabase keep-alive cron
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A free [Supabase](https://supabase.com) project
- (Optional) A [Resend](https://resend.com) API key for weekly summary emails

### 1. Clone & install
```bash
git clone https://github.com/x0911/cadence.git
cd cadence
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API keys (publishable key) |
| `SUPABASE_SECRET_KEY` | Supabase Dashboard → Project Settings → API keys (secret key) — **server-only, never expose to the client** |
| `SUPABASE_JWKS_URL` | `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json` |
| `RESEND_API_KEY` | [resend.com](https://resend.com) dashboard (optional — weekly emails no-op without it) |
| `CRON_SECRET` | Any random string — protects the `/api/cron/*` routes from unauthenticated calls |

### 3. Set up the database
Run the schema migration against your Supabase project:
```bash
# via Supabase CLI
supabase link --project-ref <your-project-ref>
supabase db push
```
This creates all tables, RLS policies, the `get_current_streak()` function, and the auto-profile-creation trigger — see `supabase/migrations/001_initial_schema.sql`.

### 4. Run the dev server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

### 5. Run tests
```bash
npm run test          # Vitest unit tests
npm run test:e2e       # Playwright E2E (requires a running build)
npm run typecheck      # TypeScript strict check
npm run lint           # ESLint
```

---

## ⏰ Keeping the free-tier database awake

Supabase free-tier projects pause after ~7 days without database activity. This repo includes `.github/workflows/supabase-keepalive.yml`, which pings the Supabase REST API every 3 days via GitHub Actions — no server, no cost.

To enable it on your own fork:
1. Go to your repo's **Settings → Secrets and variables → Actions**
2. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (same values as your `.env.local`)
3. That's it — the workflow runs automatically, or trigger it manually from the **Actions** tab (`workflow_dispatch`).

---

## 🎨 Design & Credits

Cadence's visual language combines:
- A custom emerald-based design token system (`app/globals.css`) shared between the UI chrome and the 3D Streak Orb's own color ramp, so the "orb colors" and "app colors" are always the same palette.
- [**React Bits**](https://reactbits.dev) for animated backgrounds, kinetic text, and interactive card effects across the landing page and key in-app moments — themed to match the app's palette rather than used with default styling.
- [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) for accessible, unstyled-by-default primitives (dialogs, dropdowns, switches).
- Full design rationale and the component-by-component migration plan live in [`plan.md`](./plan.md) for anyone curious about the *why*, not just the *what*.

---

## 🗺️ Roadmap

- [ ] Public API for third-party integrations (Zapier/Make)
- [ ] Mobile app (React Native) sharing the same Supabase backend
- [ ] Habit sharing / accountability partners
- [ ] Slack/Discord notifications for streak-at-risk reminders
- [ ] Optional Slack alert on GitHub Actions cron failure (currently relies on GitHub's default email notification)

Contributions and ideas are very welcome — see below.

---

## 🤝 Contributing

This is an open-source, portfolio project and contributions are genuinely welcome:

1. Fork the repo and create a feature branch
2. Follow the existing code style (`npm run lint:fix` and `npm run format` before committing)
3. Add/update tests for any logic change (`lib/`, `hooks/`)
4. Open a PR describing the change and why

Good first areas to contribute: additional React Bits component integrations, more Playwright E2E coverage, i18n, or accessibility audits.

---

## 📄 License

MIT © [Hamdi Mohamed](./LICENSE) — free to use, modify, and build on.

---

## 🙋 About this project

Built by **Hamdi Mohamed**, Senior Frontend Engineer (Vue/Nuxt background, also comfortable in React, WordPress/PHP, and Python) — this project was built to demonstrate full-stack product thinking in the React/Next.js ecosystem: real auth and RLS, correct timezone-aware business logic, accessibility guard-railing around a custom WebGL feature, automated testing, and a deliberate, documented design system rather than an out-of-the-box template.

📫 Feel free to reach out via GitHub issues or connect on [LinkedIn](#) for feedback or collaboration.