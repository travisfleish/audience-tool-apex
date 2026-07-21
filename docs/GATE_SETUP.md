# Gate System

The application includes a lightweight access gate. Users must submit their name (and, for the PMG variant, their role) plus an access password before accessing the app. This is not full user authentication — it’s a shared-password gate intended for basic access restriction, identity capture, and visit logging.

## How It Works

1. When a user visits the app, `GateContext` checks `localStorage` for a valid session
2. If no valid session exists, the user is redirected to `/gate`
3. The user enters their **Name** (and optional **Role**) and the **Password**
4. The form posts the name + password to the `verify-gate` Edge Function
5. The Edge Function validates the password (via `GATE_PASSWORDS_JSON` / `GATE_PASSWORD`), logs the login to the `gate_logins` table, and returns `{ ok: true, clientId }`
6. The client stores the session in `localStorage` (name, role, client ID, timestamp)
7. The user is redirected to `/`
8. On subsequent visits, the session is validated against the TTL — if still valid, the user enters without the gate; their visit is logged to `gate_visits`

## Components

### `GateContext` (`src/contexts/GateContext.tsx`)

Provides gate state throughout the app via the `useGate` hook.

```typescript
const { isUnlocked, clientId, userName, userRole, isLoading, login, logout } = useGate();
```

| Value | Type | Description |
|---|---|---|
| `isUnlocked` | boolean | Whether the current session is valid |
| `clientId` | string \| null | Always `"open-access"` in current implementation |
| `userName` | string \| null | Name entered at the gate |
| `userRole` | string \| null | Role entered at the gate |
| `isLoading` | boolean | True while session is being validated on mount |
| `login` | function | Called after successful gate submission |
| `logout` | function | Clears session and resets state |

### `PmgGate` (`src/apps/pmg/pages/PmgGate.tsx`)

The gate form for the PMG variant. Collects name and role. Both fields are required before the form can be submitted.

### `ProtectedRoute` (`src/components/ProtectedRoute.tsx`)

Wraps protected routes. Redirects to `/gate` if `isUnlocked` is false.

### `verify-gate` Edge Function (`supabase/functions/verify-gate/index.ts`)

Server-side handler for gate submissions. Accepts a name + password, validates the password, logs the login, and returns a client ID.

**Request**:
```json
{ "name": "Jane Smith", "password": "Acme-2026!" }
```

**Response**:
```json
{ "ok": true, "clientId": "acme" }
```

**What it does**:
- Validates that `name` is present and non-empty
- Validates `password` when password env vars are configured
- Logs to `gate_logins` table: `client_id`, `user_name`, `ip_address`, `user_agent`
- Returns `ok: true` with the resolved `clientId`

**Note**: This is a shared-password gate, not user authentication.

## Session Management

Sessions are stored in `localStorage` using these keys:

| Key | Value |
|---|---|
| `gate_clientId` | `"open-access"` |
| `gate_userName` | Name entered at gate |
| `gate_userRole` | Role entered at gate |
| `gate_unlockedAt` | Unix timestamp (ms) of when the session was created |

Session TTL is controlled by `VITE_GATE_SESSION_TTL_DAYS` (default: 14 days). When the session expires, all keys are cleared and the user is redirected to `/gate` on next visit.

## Visit Logging

Two tables track usage:

**`gate_logins`** — logged once per gate form submission via the Edge Function:
- `client_id`, `user_name`, `ip_address`, `user_agent`, `created_at`

**`gate_visits`** — logged once per browser session via `GateContext`:
- `client_id`, `user_name`, `visit_type` (`"login"` or `"session_resume"`), `created_at`
- Uses `sessionStorage` to prevent duplicate visit logs within a single tab session

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_GATE_SESSION_TTL_DAYS` | No | `14` | Days before session expires |
| `GATE_PASSWORDS_JSON` | No | (none) | JSON map of `{ "clientId": "password" }` for resolving `clientId` |
| `GATE_PASSWORD` | No | (none) | Single shared password (uses `clientId: "default"`) |

## Using Gate Data in Components

```typescript
import { useGate } from '../contexts/GateContext';

function MyComponent() {
  const { isUnlocked, userName, userRole } = useGate();

  return <div>Welcome, {userName} ({userRole})</div>;
}
```

`userName` and `userRole` are also passed to `search_logs` so each search is attributed to the user.

## Logout

Call `logout()` from `useGate()` to clear the session:

```typescript
const { logout } = useGate();
logout(); // clears localStorage, resets state
```

After logout the user will be redirected to `/gate` on their next protected route access.

## Troubleshooting

### Form doesn't submit

Both **Name** and **Role** must be filled in. The button is disabled until both fields have content.

### User is redirected to gate on every visit

Check that `localStorage` is not being blocked or cleared. In incognito/private browsing mode this may happen depending on browser settings.

### Session expires too quickly

Increase `VITE_GATE_SESSION_TTL_DAYS` in your `.env` file and redeploy.

### Visit logs not appearing

Verify the `gate_logins` and `gate_visits` tables exist and have the correct RLS policies (service role insert). Check the Edge Function logs in the Supabase dashboard for errors.

## Security Notes

This gate is intentionally lightweight. It provides:
- Identity capture (who is accessing the app)
- Visit logging for analytics
- Session expiry to periodically re-capture identity

It does **not** provide:
- Protection against determined access attempts
- Encryption of app content
- Role-based access control (all users see the same content)

Consider this suitable for client demos, previews, and first-party audience research. Do not use it to protect genuinely sensitive data.
