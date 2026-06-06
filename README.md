# VM Migration Dashboard

A full-stack demo dashboard inspired by Red Hat's **Migration Toolkit for Virtualization (MTV)** — built to learn modern cloud-native development with React, PatternFly, and a real backend.

---

## Live Demo

> Deploy to Vercel (frontend) + Railway (backend) — instructions in the [Deployment](#deployment) section below.

---

## What This Project Does

This dashboard simulates the real workflow of migrating virtual machines (VMs) from legacy hypervisors (VMware, oVirt, OpenStack) into a modern OpenShift/Kubernetes cluster running **KubeVirt** — where VMs and containers run side by side.

You can:
- Browse and filter infrastructure providers
- Create migration plans with a 5-step wizard
- Map network and storage resources
- Watch per-VM live progress during migration
- Export plans as real Kubernetes YAML (Forklift CRD format)
- View migrated VMs alongside Kubernetes pods in the Cluster view
- Switch between English and Hebrew (עברית) with RTL layout support
- Toggle dark/light mode

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| UI Components | PatternFly 6 (Red Hat's design system) |
| Routing | React Router v7 |
| Charts | `@patternfly/react-charts/victory` |
| Backend | Node.js + Express 5 |
| Database | lowdb (JSON file, no setup needed) |
| Real-time | Server-Sent Events (SSE) |
| i18n | Custom Hebrew/English with RTL |
| Testing | Vitest + React Testing Library + Playwright |
| CI/CD | GitHub Actions |

---

## Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/vm-migration-dashboard-demo.git
cd vm-migration-dashboard-demo

# 2. Install dependencies
npm install

# 3. Start frontend + backend together
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001/api](http://localhost:3001/api)

The backend auto-creates `.db/db.json` with seeded data (6 providers, 20 VMs, 7 plans) on first run.

---

## Project Structure

```
vm-migration-dashboard-demo/
├── server/
│   ├── db.ts          # lowdb JSON database + seed data
│   └── index.ts       # Express REST API + SSE stream
├── src/
│   ├── api/
│   │   └── client.ts          # Typed fetch wrapper for all API calls
│   ├── context/
│   │   ├── MigrationContext.tsx   # Global state: plans, providers, VMs, toasts
│   │   └── LanguageContext.tsx    # Language toggle state
│   ├── pages/
│   │   ├── DashboardPage.tsx      # Stats cards + charts
│   │   ├── ProvidersPage.tsx      # Filterable provider list
│   │   ├── PlansPage.tsx          # Sortable plans table
│   │   ├── PlanNewPage.tsx        # 5-step wizard
│   │   ├── PlanDetailPage.tsx     # Per-VM progress + migration log
│   │   ├── ClusterPage.tsx        # KubeVirt VMs + Kubernetes pods
│   │   └── AboutPage.tsx          # Real vs simulated breakdown
│   ├── components/
│   │   ├── layout/AppLayout.tsx   # Shell: nav, masthead, language, dark mode
│   │   └── StatusBadge.tsx        # Colored status chips
│   ├── i18n.ts                    # English + Hebrew translation strings
│   ├── utils/yamlExport.ts        # Generates Forklift/MTV Kubernetes CRDs
│   └── types/migration.ts         # All TypeScript interfaces
├── src/tests/           # Vitest component tests (16 tests)
├── e2e/                 # Playwright E2E tests
├── .github/workflows/
│   └── ci.yml           # Lint → type-check → test → build
└── vercel.json          # Vercel SPA rewrites + cache headers
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/providers` | List all providers |
| `GET` | `/api/vms` | List all VMs |
| `GET` | `/api/plans` | List all plans |
| `GET` | `/api/plans/:id` | Get one plan |
| `POST` | `/api/plans` | Create a plan |
| `PUT` | `/api/plans/:id` | Update a plan |
| `GET` | `/api/plans/:id/events` | **SSE stream** — live migration progress |

---

## Tests

```bash
npm test                 # 16 unit/component tests with Vitest
npm run test:coverage    # With coverage report
npm run e2e              # Playwright E2E (needs dev server running)
```

---

## What's Real vs Simulated

**Real functionality:**
- Express REST API with persistent JSON database
- Plans created in the wizard are saved and survive page reload
- YAML export generates valid Forklift Kubernetes Custom Resources
- SSE endpoint streams real-time progress updates
- Language preference and dark mode persist to localStorage

**Simulated for demo purposes:**
- Provider connections (VMware, oVirt, OpenStack are seeded test data)
- VM inventory (20 seeded VMs, not queried from real hypervisors)
- Migration progress (animated in the server, not real disk copy)
- KubeVirt cluster view (mock VMs and pods)

See the **About** page in the app for the full breakdown.

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com), import your repo
3. Vercel auto-detects Vite — no config needed
4. A `vercel.json` is already included for SPA routing

### Backend → Railway

1. Go to [railway.app](https://railway.app), create a new project
2. Connect your GitHub repo
3. Set start command: `tsx server/index.ts`
4. Copy the Railway URL, then set `VITE_API_URL=https://your-app.railway.app` in Vercel environment variables
5. Update `src/api/client.ts`: change `const API = '/api'` to `const API = \`\${import.meta.env.VITE_API_URL ?? ''}/api\``

---

## Connection to Red Hat

This project is built on real Red Hat open-source projects:

| Project | What it is |
|---|---|
| [PatternFly](https://github.com/patternfly/patternfly) | Red Hat's design system used in OpenShift, ACM, RHACM, and this dashboard |
| [Forklift / MTV](https://github.com/konveyor/forklift) | The real Migration Toolkit for Virtualization — this UI mimics its workflow |
| [KubeVirt](https://github.com/kubevirt/kubevirt) | Runs VMs inside Kubernetes — shown in the Cluster page |
| [Konveyor](https://www.konveyor.io/) | Red Hat's umbrella project for migration and modernization tools |

The YAML this app exports matches the real `forklift.konveyor.io/v1beta1` API — you could apply it to a real cluster with Forklift installed.

---

## Why This Was Built

This project was built as a learning exercise to understand:

- How Red Hat's platform engineering tools work end-to-end
- Building production-quality UIs with PatternFly 6
- Full-stack TypeScript with a real backend and database
- Real-time streaming with Server-Sent Events
- Kubernetes-style YAML generation from a React app
- Internationalization with RTL language support
- Accessibility standards (WCAG, ARIA) in a complex UI
- CI/CD with GitHub Actions

---

## CI Status

[![CI](https://github.com/YOUR_USERNAME/vm-migration-dashboard-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/vm-migration-dashboard-demo/actions/workflows/ci.yml)

Pipeline: **Lint → Type Check → Unit Tests → Build → Upload artifact**
