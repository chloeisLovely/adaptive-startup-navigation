# ASNM anonymous feedback / aggregate backend

**Backend deployed after explicit approval.** The existing Free project is ACTIVE_HEALTHY, both migrations and Edge Function `asnm` v1 are live. Actual feedback receipt/persistence and anonymous/forged access denials passed. The designated operator email is registered privately; initial Auth account creation and email verification remain with the owner. V6 frontend/main deployment remains unapproved. See [deployment evidence](DEPLOYMENT.md); [earlier recovery audit](SERVICE_RECOVERY.md) is historical.

## Deployment after operator configuration

1. Select an authorized, active Supabase project. Review `schema.sql` in its SQL Editor or generate a new migration with the Supabase CLI; apply it and `admin-email.sql` once. Existing data must be backed up before any separate migration.
2. Create the Edge Function with `supabase functions new asnm`. Copy `index.ts`, `handler.js` and `admin-identity.js` into the generated `supabase/functions/asnm/` directory.
3. The function defaults to the existing `https://chloeislovely.github.io` origin; optionally override `ASNM_ALLOWED_ORIGIN` in server settings. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be server-only. Never put a service-role key in config.js. The allowed Origin is scheme+host, not the repository subpath.
4. Deploy `supabase functions deploy asnm --no-verify-jwt`: anonymous feedback/events are intentionally public. The `admin` action separately calls Auth `/user` with the supplied JWT and checks `asnm_admins`. A public function is **not** a public admin endpoint.
5. Register the authorized operator email in private `asnm_admin_emails`, then provision the Auth account and complete email verification. Alternatively grant a verified account UUID through `asnm_admins`. The function checks the provider-verified identity each request; user-editable metadata is never authorization.
6. Add the function URL, project URL and publishable/anon API key to public `config.js`. `anonymousAnalytics` remains false until the policy and processing details are approved.
7. Test actual feedback receipt, anonymous/non-admin SELECT denials, admin login, revoked membership, expiry, CORS, rate limits and failure behavior on the deployed project before announcing live collection.
8. Open `product/v6/admin.html?lang=ko` (or en). Tokens stay in memory, not localStorage; refresh requires login. Dashboard dates use UTC. Feedback queries return up to 500 most recent rows within the date range; export reflects that loaded subset. Large dataset pagination is a known limitation.

## Tables and permissions

| Table | Stored | Access |
|---|---|---|
| asnm_feedback | 5 survey fields + server receipt time + record ID | service role only; function checks admin before read |
| asnm_event_counts | UTC date, allowlisted event, aggregate count | service role only |
| asnm_admins | approved Auth user UUIDs | service role only |
| asnm_admin_emails | designated verified-owner emails | service role only |
| asnm_rate_limits | global action/hour bucket, count, expiry | service role only |

RLS is enabled; anon/authenticated have no table or RPC privileges. No public SELECT policy exists. Admins do not receive browser-side direct-table privileges either. RPCs are security-definer with an empty search_path and execute permission restricted to service_role. SQL constraints validate lengths, ranges and feature/event enums again.

## Abuse and interpretation

Feedback uses field validation, honeypot and a global 60-request/hour quota; events have a global 6,000-request/hour quota. The quota is atomic in Postgres and expires after an hour. It stores no raw IP or user identifier. It is **coarse flood protection**, not bot-proof authentication or per-person limiting: an attacker could exhaust the global quota or inflate counts. Add gateway abuse protection/Turnstile before larger traffic, reviewing its privacy impact. CORS is not authentication. Provider logs may still contain network metadata.

Counters represent submitted occurrences, not unique people, funnels or statistically representative conversion rates. They contain no page URLs, free text, venture data, identity, referrer or precise event timestamp. Feedback is separate. Automatic venture uploads, email signup and launch notification collection are absent.

Operator must still decide and publish: legal identity, private support contact, provider/processing regions, retention/deletion policy and prior Google Apps Script notification-record handling. No fabricated compliance claim is made.
