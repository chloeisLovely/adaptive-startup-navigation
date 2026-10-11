# Live-service recovery — 2026-10-12 Asia/Seoul

## Confirmed results

- Existing Supabase project `uuyydrrjqeejvahfhdmj`, ap-northeast-2, organization `exuaduedhwmrvrghirkv`, **Free plan**, restored from INACTIVE to **ACTIVE_HEALTHY**. No new project, paid plan, billing change or destructive reset.
- No pre-existing public application tables or Auth users were found. A migration attempted during COMING_UP returned success, but the restored database subsequently had no tables or migration history. Do not treat that transient response as completed deployment.
- Automatic approval review rejected stable schema reapplication and public Edge Function deployment because the V6 master prompt requires final deployment approval. No alternative deployment route was used. Final remote state: **no ASNM tables, no migrations, no Edge Functions, zero Auth accounts/admins**.
- The Python urllib probe received Cloudflare HTTP 403 / error 1010. The standard Chromium browser request from the actual GitHub Pages origin received **HTTP 200 with actual `gpt-4o-mini` output**. No Cloudflare security setting was disabled and no API key was read or changed.
- The structured contextual advisor returned real schema-valid English advice. The team client initially received **HTTP 400: messages required**, because the deployed Worker accepts the older `messages` contract. V6 had sent only `task/context`.
- Fixed `trusted/advisors.js` to send compatible `messages` together with `task/context`, an explicit 1,200-token ceiling and concise role instructions. Both old generic and new task-aware Workers can handle the same request. Real Korean **six-role discussion passed schema validation**, with input financial state unchanged. This fix is on PR #7, not main/public V6 yet.
- 61 unit tests passed, including a regression test for a messages-only Worker. Live requests were made with synthetic venture context only. Successful connectivity does not prove advice quality, future availability or accuracy.

## Test environment

The browser uses the execution environment's HTTPS proxy. Its intercepting certificate required test-only `ignoreHTTPSErrors`; this is **not** a production browser or server configuration change. The Worker response itself was real, not a fixture. Python's 1010 result should not be presented as evidence that all website users cannot reach AI.

To repeat the opt-in two-call check:

```sh
ASNM_LIVE_CHECK=1 ASNM_BROWSER_PATH=/path/to/chromium node product/tests/live-services.cjs
```

Only if the test environment requires its inspecting proxy, set `ASNM_TEST_IGNORE_HTTPS_ERRORS=1`. No keys are supplied to this script; the existing Worker holds its server-side model credential. These are real API calls, subject to the operator's normal quota.

## Exact deployment awaiting approval

1. Apply reviewed `schema.sql` to the restored project: four ASNM tables, RLS, server-only grants and two server-only RPCs. No existing application records will be migrated/deleted.
2. Deploy Edge Function **`asnm`** from `index.ts` + `handler.js` with `verify_jwt=false`. This makes anonymous feedback/events reachable. **Admin requests still require a valid Supabase Auth JWT plus `asnm_admins` membership**; disabling the gateway JWT check does not disable the function's admin authorization.
3. Verify a synthetic feedback receipt, database persistence, denied anonymous/non-admin reads, rate limiting and cleanup of our test records. Then set the public function URL/project URL/publishable key in the V6 branch. No service-role or AI secret goes into the browser.
4. Register the user's explicitly designated operator account and verify its admin login/read/CSV. No Auth user currently exists; the operator email/account must be designated. Never request passwords or private API keys in chat.
5. Keep anonymous analytics disabled pending processing/retention confirmation. These events are counts, not unique people. Keep main/Pages unchanged unless separately approved.

Planned endpoint: `https://uuyydrrjqeejvahfhdmj.supabase.co/functions/v1/asnm` (not deployed). Allowed website origin: `https://chloeislovely.github.io`. The free project can pause again with prolonged inactivity; no keepalive automation or paid upgrade was installed.
