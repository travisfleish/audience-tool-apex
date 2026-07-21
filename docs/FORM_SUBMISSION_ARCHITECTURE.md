# Form Submission Technical Architecture

This document describes the technical architecture of all form submission flows in the Audience Tool: which forms exist, how they are handled, which third-party services are used, and how data flows from the client to storage and notifications.

---

## Overview

The application has three distinct form submission flows:

1. **Gate (password) verification** — Access control; no persistent storage of PII.
2. **Activation / Deal ID request** — Audience or Moment activation requests; stored in Supabase and emailed to Deal Desk via Resend.
3. **Moment “Get Started” interest** — PMG Moments modal; client-only confirmation (no backend or third-party submission).

All backend form handling is implemented as **Supabase Edge Functions**, invoked by the React client via `fetch()` with the Supabase anon key. No form data is posted directly to Supabase tables from the client; the edge functions perform validation, persistence, and optional third-party API calls.

---

## 1. Gate (Password) Verification

### Purpose

Restrict access to the app (or app variant) until the user enters a valid shared password. Optional multi-password support returns a `clientId` used for segmentation.

### Client Entry Points

| Location | File | Route / context |
|----------|------|------------------|
| Main app gate | `src/pages/GatePage.tsx` | Shown when gate is not unlocked |
| PMG app gate | `src/apps/pmg/pages/PmgGate.tsx` | PMG variant gate |

### Form Behavior

- **Fields:** Single password field.
- **Submit:** `handleSubmit` sends `POST` to the `verify-gate` Edge Function with `{ password, requirePassword: true }`.
- **Success:** Response includes `{ ok: true, clientId }`. Client calls `login(clientId)` from `GateContext`, then navigates to `/` (or PMG home).
- **Persistence:** No form data is stored server-side. The client stores gate state in **localStorage** via `GateContext`:
  - `gate_clientId`
  - `gate_userName` (optional)
  - `gate_userRole` (optional)
  - `gate_unlockedAt` (timestamp for session TTL)
- **Session TTL:** Configurable via `VITE_GATE_SESSION_TTL_DAYS` (default 14 days). After expiry, the user must re-enter the password.

### Backend: `verify-gate` Edge Function

- **Path:** `supabase/functions/verify-gate/index.ts`
- **Method:** POST only (OPTIONS for CORS).
- **Input:** `{ password?: string, requirePassword?: boolean }`.
- **Configuration (env):**
  - `GATE_PASSWORD` — Single shared password (optional).
  - `GATE_PASSWORDS_JSON` — JSON object mapping `clientId` → password for multiple passwords (optional).
- **Logic:**
  - If no password is configured, returns `{ ok: true, clientId: "open-access" }`.
  - Otherwise validates password against `GATE_PASSWORD` or `GATE_PASSWORDS_JSON` and returns `{ ok: true, clientId }` (from map key or `"default"`).
  - Returns 400 if password required but missing, 401 if invalid.
- **Third-party APIs:** None.
- **Database:** No reads or writes.

---

## 2. Activation / Deal ID Request

### Purpose

Allow users to request Deal ID / activation for one or more audiences (or for a Moment). Submissions are stored in Supabase for internal tracking and emailed to Deal Desk via Resend.

### Client Entry Points

| Location | File | Context |
|----------|------|--------|
| Audience activation modal | `src/apps/pmg/components/ActivateModal.tsx` | Single audience or notebook (multi-audience) |
| Moment activation modal | `src/apps/pmg/components/RequestMomentActivationModal.tsx` | Moment-based activation |

Both modals submit to the same Edge Function: `submit-activation-request`.

### Form Fields (ActivateModal / RequestMomentActivationModal)

- **Required:** Name, Email, Company, at least one DSP/Platform (with “Other” free text if “Other” selected).
- **Optional:** Per-DSP Seat IDs (CIDs), Preferred Inventory Channel, Notes.
- **Context:** List of audiences (or moment) and `app_variant` (e.g. PMG vs Guide).

### Client Submit Flow

1. User fills form and submits.
2. Client builds payload (e.g. `requestor_email`, `requestor_name`, `requestor_company`, `dsp`, `dsp_platforms`, `dsp_seat_ids`, `preferred_inventory_channel`, `notes`, `app_variant`, `audiences`).
3. `fetch(POST)` to `${VITE_SUPABASE_URL}/functions/v1/submit-activation-request` with:
   - `Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}`
   - `Content-Type: application/json`
   - Body: JSON payload above.
4. On success: modal shows success message; no redirect.
5. On error: modal shows `data.error` or a generic message.

### Backend: `submit-activation-request` Edge Function

- **Path:** `supabase/functions/submit-activation-request/index.ts`
- **Method:** POST (OPTIONS for CORS).

#### Request body (sanitized)

- `requestor_email` (required, validated as email)
- `requestor_name` (required)
- `requestor_company` (required)
- `dsp` (required; legacy single string)
- `dsp_platforms` (optional array)
- `dsp_seat_id` (optional; legacy single string)
- `dsp_seat_ids` (optional array of `{ platform, seatId }`)
- `preferred_inventory_channel`, `notes`, `app_variant`
- `audiences` (required): array of `{ id, name, displayName }`

#### Processing steps

1. **Validation** — Email format, required fields, at least one audience.
2. **Supabase (Postgres)** — Insert one row into `activation_requests` with request metadata plus requestor identity:
   - `email`, `requestor_name`
   - `looking_for`, `request_kind`, `audience_id`, `audience_name`, `audience_display_name`, `audiences` (jsonb), `dsp_platforms`, `dsp_seat_ids`, `app_variant`
   - Company, notes, and preferred channel are emailed to Deal Desk but not stored in DB.
3. **Resend (third-party)** — Send one email to Deal Desk with full request details (requestor name, company, email, DSP/CIDs, preferred channel, notes, audience list, timestamp, app variant). Plain-text body built in `buildPlainTextEmailBody`.
4. **Response** — `{ ok: true, request_id }` on success; 4xx/5xx with `{ ok: false, error }` on failure. If insert succeeds but email fails, response is 502 with a message that the request was saved but email failed.

#### Environment variables (Edge Function)

| Variable | Purpose |
|----------|--------|
| `SUPABASE_URL` | Supabase project URL (for service-role client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for DB insert |
| `DEAL_DESK_TO_EMAIL` | Recipient for activation request emails |
| `DEAL_DESK_FROM_EMAIL` | Sender address (must be Resend-verified) |
| `DEAL_DESK_SUBJECT_PREFIX` | Optional subject line prefix |
| `RESEND_API_KEY` | Resend API key for sending email |

#### Third-party API: Resend

- **Endpoint:** `POST https://api.resend.com/emails`
- **Auth:** `Authorization: Bearer ${RESEND_API_KEY}`
- **Payload:** `from`, `to` (array), `subject`, `text` (plain body).
- **Usage:** One transactional email per activation request; no form data is sent to any other external system.

#### Database: `activation_requests` (Supabase/Postgres)

- **Schema (current):** Stores request metadata plus requestor identity for tracking:
  - `id`, `created_at`
  - `email`, `requestor_name`
  - `looking_for` (text[]), `request_kind` (e.g. `audience` / `moment` / `deal`)
  - `audience_id`, `audience_name`, `audience_display_name`
  - `audiences` (jsonb) — full list for notebook flows
  - `dsp_platforms` (text[]), `dsp_seat_ids` (jsonb)
  - `app_variant`
- **RLS:** Insert allowed for `anon` and `authenticated`; no public read (dashboard/service role only).

---

## 3. Moment “Get Started” Modal (MomentDetailsModal)

### Purpose

Collect interest (email, “What are you looking for?”, notes) for a PMG Moment. No backend or third-party submission.

### Client Entry Points

- **File:** `src/apps/pmg/components/MomentDetailsModal.tsx`
- **Modes:** `details` → `get_started` (form) → `submitted` (thank-you).

### Form Behavior

- **Fields:** Email, “What are you looking for?” (multi-select), Notes.
- **Submit:** `handleSubmit` does **not** call any API or write to the database. Comment in code: *“Intentionally avoid DB write: PII tracking has been disabled.”*
- **Success:** Modal switches to `submitted` and shows a thank-you message. No data leaves the client.

### Third-party APIs / Backend

- **None.** Purely client-side state and UI.

---

## Client-Side Environment Variables (Forms)

| Variable | Used by | Purpose |
|----------|--------|--------|
| `VITE_SUPABASE_URL` | All gate + activation forms | Base URL for Edge Functions |
| `VITE_SUPABASE_ANON_KEY` | All gate + activation forms | Bearer token for Edge Function requests |
| `VITE_GATE_SESSION_TTL_DAYS` | GateContext | Session validity in days (optional) |
| `VITE_APP_VARIANT` | ActivateModal, RequestMomentActivationModal | e.g. `pmg` / `guide`; sent as `app_variant` |

---

## Summary: Third-Party and Backend Usage

| Form / flow | Supabase Edge Functions | Supabase DB | Resend | Other |
|-------------|--------------------------|-------------|--------|--------|
| Gate verification | `verify-gate` | — | — | — |
| Activation / Deal ID request | `submit-activation-request` | `activation_requests` (non-PII row) | Deal Desk email | — |
| Moment “Get Started” | — | — | — | — |

---

## Security and Privacy Notes

- **Gate:** Passwords are configured server-side (`GATE_PASSWORD` / `GATE_PASSWORDS_JSON`). Client only receives a boolean success and `clientId`; password is not stored in the client.
- **Activation requests:** PII (email, name, company, notes, full DSP/preferred channel) is not stored in Postgres; it is only sent to Deal Desk via Resend and exists in Resend’s systems per their terms. The DB holds only non-PII metadata for internal tracking.
- **Moment Get Started:** No server or third-party submission; no PII leaves the browser.

---

## Diagram (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  React client (GatePage / PmgGate / ActivateModal / RequestMoment...)   │
└─────────────────────────────────────────────────────────────────────────┘
    │
    │  POST + Authorization: Bearer VITE_SUPABASE_ANON_KEY
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Supabase Edge Functions                                                │
│  • verify-gate          → no DB, no third party                         │
│  • submit-activation-request → Postgres + Resend                         │
└─────────────────────────────────────────────────────────────────────────┘
    │
    ├──► Supabase (Postgres): activation_requests (non-PII only)
    │
    └──► Resend API: POST /emails → Deal Desk inbox (full request details)
```

This document reflects the architecture as implemented in the codebase and migrations referenced above.
