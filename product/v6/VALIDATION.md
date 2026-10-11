# V6 validation — 2026-10-11

All results below are from this branch served locally over HTTP, including repository-subpath routes. No V6 deployment or live-service integration success is implied. Browser automation used headless Chromium with SwiftShader WebGL; this is not a physical iPhone/Android test. External legacy Chart.js 4.4.0 was served unchanged from an exact-version local mirror; Google Fonts CSS was suppressed for network-independent runs.

## Results

| Check | Result / scope |
|---|---|
| Node unit suites | **60 passed, 0 failed**: original simulation/experience/product/entry/trusted suites plus 9 V6 tests |
| Product browser | **15 acceptance groups passed**: routes, setup, demo, state restore, same-seed comparison, journal, JSON, AI schema/failure, full KO/EN legacy journey |
| Entry browser | **11 groups passed**: KO/EN three entries, four-module journey, question routing, six-stage demo, mobile and blocked storage/WebGL |
| Trusted browser | **18 groups passed**: market inputs/XSS, deep assessment, builder, roles/avatar/movement/cameras, two decisions, comparison, report/import, no-WebGL/storage/AI 503 |
| Artwork browser | **11 groups passed**: KO/EN 1440/1280/390/320, keyboard, missing-image fallback, light theme and footer |
| V6 browser | **8 groups passed**: four-link footer, 10 problem cards, structured advice, five widths, 3D demo, founder question, direct PDF, asset failure, feedback receipt/failure, disconnected admin and six character cards. Final run also checks selected hybrid option appears in comparisons and the cash chart belongs to financial section. |
| Original Module 4 browser | Passed all six dialogue decisions, navigation, tutorial/role, commit/outcomes, hire visuals, refresh, export, KO/EN Module 3 handoff, standalone setup and mobile/fallback checks |
| Database | Local PGlite/PostgreSQL-compatible execution: 8 anon/authenticated table SELECT denials; browser RPC denials; service-only insert/count increment, constraints and atomic quota passed |
| Speech | Mocked recognition denial, reviewed transcript, no automatic send and opt-in synthesis passed. No real microphone/provider/device test. |
| AI | Mock valid schema, malformed response, unavailable/503 and no financial mutation passed. Existing live Worker returned HTTP 403 / Cloudflare 1010 from this environment; real LLM output not verified. |
| Backend | Handler auth/admin allowlist, anonymous/non-admin denials, validation, bounded body, quota and DB failure passed with test doubles; browser simulated receipt/503 passed. **Not deployed to Supabase.** |
| PDF visual QA | Direct Korean PDF exported, selectable Unicode text extracted, seven pages rendered with Poppler and visually checked; corrected missing-glyph font embedding and cash-chart section placement. Print-PDF is a separate fallback. |
| Regression review | Core SimulationEngine, DecisionEngine, EventEngine, CalibrationEngine and Module 3 scoring implementation unchanged. Legacy signup removal and UI hooks are isolated from scoring. Old persisted schemas/keys retained. |

Widths tested: **320, 390, 768, 1280, 1440 px**. Desktop and 390px world screenshots also recorded. Reduced motion, keyboard operation and missing WebGL were exercised. This is not a full WCAG or assistive-technology certification. Initial 30-second comprehension / three-minute enjoyment / five-minute own-decision targets need real user observation.

## Reproduce

Dependencies: Node, Playwright + Chromium, and (for SQL tests only) `@electric-sql/pglite` 0.3.14. Browser suites start/stop their own local server through `server.cjs`; use `legacy.cjs` to launch the original Module 4 suite with a server.

```sh
node --test module4/tests/engine.test.js module4/tests/experience.test.js product/tests/product.test.js product/tests/entry.test.js product/tests/trusted.test.js product/tests/v6.test.js
node product/tests/browser.cjs
node product/tests/entry-browser.cjs
node product/tests/trusted-browser.cjs
node product/tests/art-browser.cjs
node product/tests/v6-browser.cjs
node product/tests/legacy.cjs
node product/tests/v6-database.cjs
node product/tests/v6-voice.cjs
```

`ASNM_BROWSER_PATH` can point to Chromium. `ASNM_CHART_JS_PATH` optionally points to the unmodified Chart.js 4.4.0 runtime. `ASNM_PGLITE_PATH` optionally points to the PGlite package. `ASNM_SCREENSHOT_DIR` enables trusted world/report screenshots. V6 browser tests currently put QA output in `/tmp/asnm-v6-qa`.

Existing browser assertions were adapted for the new footer, question routing, demo baseline and progressive legacy disclosures. They still execute actual original trend/quiz/scoring handlers and handoff, rather than replacing them with mocks. AI/provider and feedback-response fixtures are explicitly isolated cases, not evidence of a successful external deployment.

See [qa](qa/) for selected actual renderings, and [release status](RELEASE.md) for unresolved operating requirements.
