# ClearGround — Public Toilet Cleanliness and Inspection Compliance Tracker

ClearGround is a responsive public-service operations app for facility registers, routine inspections, corrective action, reinspection, and compliance history. It uses semantic HTML, custom CSS and vanilla JavaScript, an Express REST API, and Supabase PostgreSQL. Business data is never stored in browser storage. The short-lived access token used for the Supabase Auth session is held in sessionStorage for the active tab and cleared on sign out; no token is persisted in localStorage.

## Requirements

- Node.js 20+
- A Supabase project (URL and public anon key)
- Supabase CLI for local migrations, or use the SQL editor to apply the migration

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env`, then set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_ORIGIN=http://localhost:3000`, and optionally `PORT`.
3. Apply `supabase/migrations/202610280001_initial.sql` to the Supabase project. With the Supabase CLI, run `supabase init` if this project has not been initialized, then `supabase link --project-ref YOUR_REF` and `supabase db push`. The included SQL can also be run directly in the Supabase SQL editor.
4. Create an account in the app or Supabase Auth. New accounts start as `requester`. Grant least privilege from a trusted Supabase SQL session: `update public.profiles set role='operator', district='Central Ward' where id=(select id from auth.users where email='your-demo-email@example.test');` Never expose an admin credential in client code.
5. Run `supabase/seed.sql` in the SQL editor to add synthetic facilities, sample completed inspections and one sample corrective action after an operator profile exists. Seed inserts are idempotent.
6. `npm start` and visit `http://localhost:3000`. `npm run dev` enables Node watch mode.

The browser signs in directly against Supabase Auth using the public anon key. All facility and workflow requests go through Express with the user's bearer token; Supabase RLS remains authoritative. No service-role key is accepted or required.

## Demo workflow

Sign in as an operator, register or select a facility, submit an inspection (five scored checklist items), open Corrective actions and create a defect linked to the completed inspection, update it to resolved with a work note, then re-inspect and pass/fail it. A passing reinspection closes the defect; a failed reinspection returns it to in-progress. History records facility, inspection, defect and reinspection changes. Seed records are synthetic and contain no fabricated inspection results.

## API

All successful responses use `{ "data": ..., "error": null }`; errors use `{ "data": null, "error": { "code", "message", "details?" } }`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Process health |
| GET | `/api/config` | Public | Public Supabase URL/anon key for browser Auth |
| GET | `/api/public/summary` | Public | Aggregate facility/inspection counts |
| GET | `/api/me` | Signed in | Current profile and role |
| GET | `/api/staff` | Operator/admin | Staff roster for defect assignment |
| GET | `/api/dashboard` | Signed in | Facilities, inspections, defects, metrics |
| GET/POST | `/api/facilities` | Signed in / operator | List/search or create facilities |
| GET/POST | `/api/inspections` | Signed in / operator | Paginated/filterable inspections or submit inspection |
| POST | `/api/inspections/schedule` | Operator/admin | Schedule a future inspection |
| GET/POST | `/api/defects` | Signed in / operator | List/filter defects or create action |
| PATCH | `/api/defects/:id/action` | Signed in / operator | Record work and mark in progress/resolved |
| POST | `/api/defects/:id/reinspection` | Signed in / operator | Record reinspection result |
| GET | `/api/history` | Operator/admin | Read audit trail |

List endpoints support status filters and bounded pagination. Facilities search `q` is capped at 50 rows. Authenticated access is required for all operational records.

## Roles and data security

- `requester`: profile access and records explicitly assigned/reported to them.
- `operator`: manage facilities and operational workflow.
- `admin`: operator capabilities plus profile administration/read scope.

RLS is enabled on every exposed table. User role is held in the server-controlled profile row; self-profile updates cannot change role. Express revalidates each bearer token via Supabase Auth, validates payloads with strict schemas, checks role and inspection completion, and passes the same JWT to the anon-key Supabase client so RLS applies. Helmet, same-origin defaults, small JSON limit, compression and API rate limiting are enabled. The app does not accept file uploads; evidence URL field is reserved for future validated Storage support.

## Verification

Run `npm run check` for syntax checks and `npm test` for Node's test runner. The repository is new and no external Supabase credentials are included, so database migration, RLS cross-account behavior and live browser/API workflow checks require configuration of a Supabase project first. See `supabase/tests/rls-checks.md` for the manual security checks to run with two accounts and SQL editor.

## Deployment

Deploy the Node service to a host with Node 20+, set the environment variables, set `APP_ORIGIN` to the deployed origin, apply migrations, and serve the `public` directory through Express or a same-origin static host. Configure HTTPS at the hosting proxy and restrict Supabase Auth redirect URLs to the real application origin. Use Supabase's anon key only; never add a service-role key to the app environment. Back up the database and review RLS policies before production use.

## Known limitations

- No Supabase project is attached to this workspace, so live persistence, migration application and cross-user policy tests are not yet verified.
- New accounts must be promoted by a trusted administrator before they can perform operator tasks; no public role self-selection exists.
- Evidence is represented as a URL only; secure file upload/storage workflow is not included.
- Schedule display is driven by submitted inspection dates and facility cadence; automatic reminders/background scheduling are not included.





\n