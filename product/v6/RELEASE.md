# ASNM V6 review release

**Implementation and local validation complete for review; V6 is not merged or publicly deployed.** Final merge/deployment approval is required by the V6 master prompt §22. Main remains the prior V5.1 commit `10c7f633ffe9286e46b47c53146f9a5c034b04fa` at the release audit. This work preserves previous assets and local history; it does not claim to recover unsaved work from unavailable earlier environments.

| Feature | Implementation | Test state | V6 public deployment | Limits / next action |
|---|---|---|---|---|
| Cosmic home, three entries, four-link footer | Implemented | KO/EN + mobile + keyboard passed | No | Approval required |
| Market / free question / shared context | Implemented | Routing and structured local/mocked AI passed | No | Local hypothesis templates; no live search |
| Six founder characters / original quick reflection / deeper assessment | Implemented; approved revised artwork | Counts/ties, UI, actual answered radar passed | No | Exploratory, not psychological diagnosis or validated prediction |
| Venture builder / outsource / hybrid | Implemented, original engine preserved | Setup, deterministic rules, comparison and import passed | No | Price/effect allowances are transparent illustrative assumptions |
| Digital twin / six-role discussion / state-triggered brief | Implemented | 3D, roles, movement, cameras, dialogue, events, decisions, restore passed | No | Avatars are advisors, not claimed real employees; local rules by default |
| Voice / narration | Implemented with text fallback | Mock browser APIs passed | No | Real mobile microphones and provider behavior unverified |
| Same-seed alternatives / decision journal | Implemented | No state mutation, selected hybrid comparison, replay and reflection passed | No | Modeled outcomes, not causal real-world forecasts |
| 13-part report / local PDF | Implemented | KO/EN web, actual data, Unicode PDF and failure fallback passed | No | PDF tables use labeled rows; charts rasterized; PDF/UA not claimed |
| Existing AI gateway | Reused; schema + consent + fallback | Mock paths passed; live HTTP 403 observed | No new Worker deployment | Resolve gateway access and validate actual provider response |
| Five-field feedback | UI + Edge handler + SQL implemented | UI fixtures, API and SQL passed | No | Config deliberately empty; real save unavailable pending authorized project |
| Aggregate event counts | Optional abstraction + SQL implemented | Allowlist, atomic counters/quota passed | No | Disabled; not unique visitors or a complete conversion funnel |
| Private admin dashboard | Auth + server allowlist + reads/CSV implemented | API auth/permissions and disconnected UI passed | No | Live admin login/query/CSV still need deployed backend verification; up to 500 loaded feedback rows |
| Privacy / terms / AI notice | Beta notices implemented | Links and configured/unconfigured states reviewed | No | Legal operator, private contact, retention/processing details require operator confirmation |

## Required before public V6 operation

1. Resolve the existing Worker HTTP 403 from a supported user browser and validate a real structured response. Local rules remain a supported path; do not advertise working live AI without this check.
2. Identify the authorized active Supabase project and admin account. The connected project was **INACTIVE**; no restore, paid project creation or remote migration was performed. Deploy [backend](../../backend/asnm/README.md), verify receipt/admin denials and genuine dashboard data. Keep analytics off until policy/configuration are approved.
3. Confirm legal operator, private contact and retention/deletion arrangements, including any prior Google Apps Script signup records. Four-footer notices do not constitute a legal compliance certification. The current [PIPC processing-policy guidance](https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=G010030020&nttId=12018) was identified for operator review; no claim is made that this implementation has been legally audited.
4. Review the PR, approve main merge/public deployment, verify Pages then perform the beta tasks in [BETA_GUIDE.md](BETA_GUIDE.md). No launch message has been posted.

## Preserved assets and intentional removals

SimulationEngine / DecisionEngine / EventEngine / CalibrationEngine and original Module 3 scoring remain intact. Original Module 1–3 views stay available in progressive disclosures. New metadata is additive and validated. Existing report, JSON import/export, language routes and prior local storage keys remain supported. V6 demo uses a new key.

Only obsolete launch notification UI and its browser Apps Script submission were removed as requested; no existing remote signup records were deleted. Historical study figures remain in research content, now marked as requiring primary artifact verification. No fabricated sample admin statistics or fake AI success is displayed.

## Files

- Entry/design: `index.html`, `en/index.html`, `config.js`, `privacy.html`, `product/landing.js`, `product/v6/shell.js`, `cosmic.css`, `assets/founder-scenes-v6.webp`.
- Product: `product/trusted/{workspace,integrate,model,world,report}.js`, `product/{experience,guided-demo,world-app,telemetry}.js`, `module4/world/avatars.js`.
- New modules: `product/v6/{advice,speech,founder,charts,pdf,backend,feedback,admin,policy}.js`, related HTML and licensed PDF vendor assets.
- Services: `backend/asnm/{schema.sql,handler.js,index.ts,README.md}`.
- Evidence: `product/tests/v6*`, updated existing browser selectors, `module4/tests/browser.cjs`, V6 architecture/research/asset/validation/beta documents and screenshots.

The complete authoritative changed-file list is the PR diff. See [VALIDATION.md](VALIDATION.md) for measured test results; user comprehension/retention/willingness to pay remain research questions.
