# ASNM V5.1 — implementation and verification

## Scope

This release keeps PR #5's approved space landing, three illustrated entries, If Lab credit and guided LearnLoop demo. It adds a shared, bilingual project workspace behind the existing journey. No framework migration, account system, billing system or remote user database is introduced.

- Market: 27 optional industry starting points, arbitrary topic/question input, three explicitly unverified hypothesis templates, opportunity selection and a manual evidence notebook.
- Founder: original ten-question check remains available. New original 12-item / six-domain confidence reflection and six decision situations preserve partial answers, explain scoring and record reasons. Equal scores do not manufacture a strength/gap.
- Builder: five steps distinguish prospective/operating ventures, current team and future hiring, product/technology, welfare/operations, and confirmed initial assumptions. Missing money differs from zero; KRW units are explicit.
- World: five player roles, three avatar colors, three cameras, keyboard and room navigation, room-linked missions, six-role meetings, speech bubbles, state-based suggested missions, ten decision categories, before/after results, saved same-seed comparisons and restoration.
- Report: executive brief, ten connected sections and a provenance appendix; 7-day owners/actions/evidence and a 30-day experiment plan; browser print/PDF and JSON export/import. Incomplete modules remain marked incomplete.

## User routes

1. Landing → full journey → Market → Founder → Builder → World → decision → report.
2. Landing → question → locally matched module; ambiguous questions stay on the choice screen.
3. Landing → three-minute demo → guided decision/discussion/summary/result/action sequence (preserved).
4. Standalone `product/trusted/index.html?mode=world&lang=en` → builder when no project exists.
5. Existing detailed tools remain in expandable sections. Original Module 3 results expose both the original handoff/report and a separate V5.1 project import.

## Architecture and changed files

`product/trusted/model.js` holds project schema, isolated storage, shared decisions, replay validation and explicit policy extensions. `assessment.js` contains original items/scoring. `workspace.js` renders Market/Founder/Builder; `integrate.js` wraps existing navigation and retains original tools. `world.js` lazily reuses Babylon world assets and the untouched simulation engine. `advisors.js` isolates optional structured Worker advice from state changes. `report.js`, `ui.js`, `trusted.css` and `index.html` supply the report, accessible controls and standalone entry.

Existing modifications are limited to `product/landing.js` navigation, README documentation and browser tests adjusted to the new destinations. New tests are `product/tests/trusted.test.js` and `product/tests/trusted-browser.cjs`.

Research rights/scoring are documented in [RESEARCH.md](RESEARCH.md). Exact added costs, units, missing-data treatment and compatibility are in [ASSUMPTIONS.md](ASSUMPTIONS.md).

## Baseline and protected assets

Work began from deployed main `3458f221fe7a1073362c7ea8ed51bd728683316e` (merged PR #5). No other PR was open. That deployment was successful in Pages run `37928600278`.

The original Korean/English HTML, scoring, research content, Module3Adapter, SimulationEngine, DecisionEngine, EventEngine, CalibrationEngine, original StateStore, Babylon scene, landing artwork/CSS, original demo and Worker are not part of the V5.1 code changes. Remote Git tree comparison confirmed the original engine and HTML bytes. Recovered source copies of several unchanged helpers had only an extra trailing newline; those files are not published by this change.

## Executed validation — 2026-10-11

| Suite | Result | Evidence covered |
| --- | --- | --- |
| Node engine/product/entry/trusted tests | 51 passed | Original scoring adapters, deterministic rules, all available mission choices, policy costs, same-seed comparison, missing/zero money, replay, tamper rejection, projects, multi-tab conflicts, partial/tied assessment, AI failure/validation |
| Trusted Chromium browser | 18 groups passed | KO/EN complete journey, arbitrary input/XSS-safe rendering, assessment persistence, company setup, role/avatar/cameras, room mission, discussion, technology/welfare commits, refresh, report, project import identity, PDF/JSON |
| Original product Chromium browser | 15 groups passed | KO/EN legacy Module 1–3 scoring/handoff/report, original demo/world, cameras/movement, journal, AI error/malformed/success mocks, 390px, lost WebGL, blocked storage |
| Entry/demo Chromium browser | 11 groups passed | Three entry paths, typed routing, browser Back/refresh, six demo stages, one commit, action plan, no-WebGL/storage fallback |
| Landing artwork Chromium browser | 11 groups passed | Preserved illustrations, If Lab footer, 1440/1280/390/320px, theme switch, keyboard/image navigation, missing-image fallback |

The new report is checked at 1440/768/390/360px. World is checked at desktop and 390px. Korean/English screenshots and A4 PDFs were generated; desktop world, mobile report and the first PDF page were visually inspected. Chromium uses software WebGL, so this is not a physical-device GPU or Safari certification. No horizontal document overflow or page errors occurred in tested flows.

New combined failure test disables WebGL and localStorage and returns AI HTTP 503: builder → decision → rule fallback → outcome → report → JSON still succeeds. Optional AI output is mocked for validation; no live LLM-provider availability is claimed.

### Reproduce

From the repository root, use Node with Playwright installed and a Chromium executable. Set `ASNM_BROWSER_PATH` when Chromium is not on Playwright's default path. `ASNM_CHART_JS_PATH` points to a local Chart.js 4.4.0 UMD file for repeatable offline legacy tests. Optional `ASNM_SCREENSHOT_DIR` writes screenshots/PDFs.

```sh
node --test module4/tests/engine.test.js module4/tests/experience.test.js product/tests/product.test.js product/tests/entry.test.js product/tests/trusted.test.js
node product/tests/trusted-browser.cjs
node product/tests/browser.cjs
node product/tests/entry-browser.cjs
node product/tests/art-browser.cjs
```

## Product assessment and real limits

| Acceptance question | Implemented evidence / remaining validation |
| --- | --- |
| Understand the service immediately | Approved question-led landing and input-free demo preserved; comprehension timing still needs first-time users. |
| Explore any industry | Free text accepts arbitrary topics, including rail maintenance; industry-specific live research is not connected. |
| Trust founder reflection | Original items, conceptual sources, partial scoring, non-diagnostic limits; psychometric reliability/validity not established. |
| Start without financial expertise | Five steps with ranges and editable assumptions; actual beginner completion times not measured. |
| Review an existing business | User-reported cash/cost/revenue distinguish blank and zero; no accounting verification or sector-specific model. |
| Connect Builder and World | Same project/state and explicit confirmation; planned hires/technology/welfare do not silently apply. |
| Act through an avatar | Rooms open relevant missions, roles/cameras/movement/meetings work; not a free-form autonomous multi-agent society. |
| Understand consequences and alternatives | Exact unit-labeled before/after tables, original seeded events, identical baseline comparisons; effects are illustrative model assumptions. |
| Obtain actionable output | Three weekly actions plus owners/evidence and 30-day plan; plans use transparent templates rather than bespoke professional due diligence. |
| Differentiate from a generic chatbot | Reproducible engine, decision history, state provenance and counterfactual comparison; external market evidence remains manual. |
| Have a reason to return | Isolated projects, persisted decisions, editable assumptions and replayable imports; actual retention unmeasured. |
| Justify future willingness to pay | Usable decision workflow delivered; paid demand and decision-quality improvement require real founder tests. |

Further constraints: recurring-revenue assumptions do not fit every industry; customer headcount, employee retention and morale are not calculated. Storage is browser-local and not encrypted or synchronized; blocked storage needs a JSON export before leaving. Live Worker deployment/secrets are unchanged. The new world uses text reasoning; browser-native voice remains in the preserved original experience. Full WCAG, Safari/Firefox and physical mobile-device audits are outstanding. No payment or account feature is claimed.

Next validation: recruit both prospective and operating founders, measure unaided first decision time and comprehension of modeled versus observed results, inspect source quality, repeat use after seven days, and ask about willingness to pay only after actual use. Separately pilot the original assessment for clarity, reliability and criterion validity before using it for stronger claims.

## Deployment

This document records pre-merge validation. The PR, merge commit, Pages run and live smoke result are reported separately after actual completion; a successful local run is not presented as a production deployment.
