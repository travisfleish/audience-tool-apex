# Genius Sports Audience Discovery Platform

React + TypeScript application for discovering, filtering, and activating Genius Sports audience segments. The codebase supports multiple branded app variants from one frontend and Supabase backend.

## What This Repo Includes

- Audience search with hybrid semantic + keyword retrieval
- Profile and seasonal filtering for sports/event use cases
- Notebook workflow for saving audiences during a session
- Variant-aware UI for `main`, `pmg`, and `guide`
- Supabase Edge Functions for embeddings, gate verification, and activation requests

## App Variants

Select variant with `VITE_APP_VARIANT` (defaults to `main`).

| Variant | Entry | Primary Use |
| --- | --- | --- |
| `main` | `src/apps/main/MainApp.tsx` | Standard Genius Sports audience explorer |
| `pmg` | `src/apps/pmg/PmgApp.tsx` | PMG co-branded experience with gate + activation flow |
| `guide` | `src/apps/guide/GuideApp.tsx` | Guide-focused variant with tailored homepage copy/layout |

In `src/App.tsx`, variant routing is:

- `pmg` -> `PmgApp`
- `guide` -> `GuideApp`
- otherwise -> `MainApp`

## Gate Behavior

- Gate UI + protected routes are currently enforced in the `pmg` app (`/gate` + `ProtectedRoute`)
- `main` and `guide` do not currently enforce gate access in routing
- Password validation is handled by `supabase/functions/verify-gate`

Detailed gate docs: `docs/GATE_SETUP.md`.

## Tech Stack

- React 18 + TypeScript
- Vite 5
- React Router DOM 7 (hash router in app variants)
- Tailwind CSS + custom theme styles
- Supabase (Postgres + Edge Functions)

## Project Structure

```text
src/
  App.tsx
  appVariant.ts
  apps/
    main/
    pmg/
    guide/
  components/
  contexts/
  core/
  pages/
data/          # Source spreadsheets for scripts
docs/          # Architecture, branding, and static HTML guides
scripts/
supabase/
  functions/
    generate-embeddings/
    verify-gate/
    submit-activation-request/
  migrations/
```

## Quick Start

### 1) Install

```bash
npm install
```

### 2) Create `.env`

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_APP_VARIANT=main
VITE_GATE_SESSION_TTL_DAYS=14
```

### 3) Run Dev Server

```bash
npm run dev
```

### 4) Build / Preview

```bash
npm run build
npm run preview
```

## Environment Variables

### Frontend

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public anon key for client calls |
| `VITE_APP_VARIANT` | No | `main`, `pmg`, or `guide` (default `main`) |
| `VITE_GATE_SESSION_TTL_DAYS` | No | Gate session TTL in days (default `14`) |

### Edge Functions / Server-Side

| Variable | Used By | Required | Notes |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | `generate-embeddings` | Yes | OpenAI embedding generation |
| `SUPABASE_URL` | Functions/scripts | Yes | Server-side Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Functions/scripts | Yes | Required for protected table writes/exports |
| `GATE_PASSWORD` | `verify-gate` | Cond. | Optional single gate password |
| `GATE_PASSWORDS_JSON` | `verify-gate` | Cond. | Optional JSON map of `{ "clientId": "password" }` |
| `DEAL_DESK_TO_EMAIL` | `submit-activation-request` | Yes | Recipient for activation request emails |
| `DEAL_DESK_FROM_EMAIL` | `submit-activation-request` | Yes | Sender address for Resend |
| `RESEND_API_KEY` | `submit-activation-request` | Yes | API key used to send activation emails |
| `DEAL_DESK_SUBJECT_PREFIX` | `submit-activation-request` | No | Optional email subject prefix |

## NPM Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview built app locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript no-emit check |
| `npm run generate-embeddings` | Run `scripts/generate-embeddings-sql.ts` (RPC embedding backfill/update) |
| `npm run export-audiences` | Export audience JSON datasets |
| `npm run export-search-terms` | Export aggregated search-term CSV from `search_logs` |
| `npm run export-table-csv` | Generic table-to-CSV export utility |

## Additional Data Utilities

These are present but not wired to package scripts:

- `scripts/refresh-audience-seasonal-map.mjs`
- `scripts/backfill-query-embedding-cache.mjs`
- `scripts/compare-index-exchange-csv.ts`

Run with `node <script>` or `npx tsx <script>` and required env vars.

## Search Flow (High-Level)

1. Frontend posts query to `generate-embeddings`
2. Function returns embedding and expanded query terms
3. Frontend calls `hybrid_semantic_search` RPC in Supabase
4. Results are filtered/scored client-side for profile/seasonal contexts
5. Search activity is logged to `search_logs`

## Deployment Notes

- Build output is generated in `dist/`
- Set frontend env vars in your host (Vercel/Netlify/etc.)
- Deploy Supabase migrations and Edge Functions for production parity
- If using PMG activation requests, ensure Resend-related secrets are configured

## Related Docs

- `docs/GATE_SETUP.md` - gate architecture and operations
- `docs/genius_brand_guideline.md` - current branding/font/token guidance
- `docs/DOCUMENTATION_INDEX.md` - static HTML export and audience display reference
