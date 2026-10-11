# Approved backend deployment — 2026-10-12 Asia/Seoul

The user explicitly approved the ASNM schema and anonymous feedback Edge Function deployment, and designated an operator email. This approval did **not** include main merge or GitHub Pages/V6 frontend release.

## Deployed

- Existing Free Supabase project: `uuyydrrjqeejvahfhdmj`, `ACTIVE_HEALTHY`.
- Migrations: `asnm_v6_private_feedback`, `asnm_verified_operator_email`.
- Five private tables: feedback, aggregate event counts, UUID admins, quota buckets, verified-email admin allowlist.
- Edge Function `asnm`, version 1, ACTIVE; endpoint `https://uuyydrrjqeejvahfhdmj.supabase.co/functions/v1/asnm`.
- `verify_jwt=false` permits anonymous feedback. Every admin request still validates its bearer token through Auth `/user`, then checks the private UUID or verified-email allowlist. Browser-provided metadata is never authority.
- Approved operator email recorded privately in `asnm_admin_emails`. No password was requested, generated or stored by this change. No invitation/confirmation email has been sent.
- Branch `config.js` includes the endpoint, project URL and **publishable** key only. No server secret is in the browser. Aggregate analytics remain disabled.

## Actual checks

| Check | Actual result |
|---|---|
| Feedback HTTP request | 201, received=true |
| Feedback database persistence | Synthetic record retrieved from Postgres |
| Branch feedback UI → real deployed backend | Browser 201 and genuine receipt displayed |
| Missing admin token | 401 |
| Forged admin token | 401 |
| Disallowed Origin | 403 |
| Five direct table reads with publishable key | All denied with 401 |
| Admin UI before login | Sign-in form, no private data |
| Cleanup | Both synthetic feedback records removed by their exact IDs and markers |
| Unit regression | 62 passed |

`product/tests/deployed-backend.cjs` serves the **branch frontend assets** under the approved test origin while leaving Supabase calls real. It is not evidence that the V6 frontend is publicly deployed. Opt-in requires `ASNM_LIVE_BACKEND=1`; it writes one marked synthetic feedback record that must be checked and deleted afterward. A test-only inspecting proxy certificate override is optional and does not change production TLS.

The Supabase security advisor reported five **INFO** notices for RLS with no policies. This is intentional: all browser table/RPC grants are revoked; only the server role accesses these tables. Adding a public SELECT policy would violate the design. [Supabase explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Operator first login — still required

The email is **designated**, but the owner must complete Supabase Auth account creation and email ownership verification. There are currently no Auth accounts. Successful owner login, authenticated admin queries and CSV export therefore cannot be claimed as live-tested yet. Mock authorization tests cover allowed/denied identities; genuine unauthenticated/forged-token checks passed.

Use the project's [Auth Users dashboard](https://supabase.com/dashboard/project/uuyydrrjqeejvahfhdmj/auth/users) to provision the designated account and complete email verification. Use a separate ASNM password, not the Gmail password. Do not put either password in repository files or chat. Delivery may require the project's Auth email/SMTP settings; no delivery claim is made. After the V6 frontend is separately released, use `product/v6/admin.html?lang=ko` and verify actual dashboard reads/CSV.

To revoke an email-based operator, remove its row from `asnm_admin_emails`; checks are live on each request. For UUID grants remove the corresponding `asnm_admins` row too. The verified email derives only from the provider-validated `/user` result, not user-editable metadata.

Main and Pages are unchanged. Provider/retention/private-contact confirmations and real owner login remain follow-up operational tasks; backend deployment itself is complete.
