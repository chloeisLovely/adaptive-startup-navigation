# Module 4 V3 — executed validation

Baseline: `dbefe4f151dd4380dfebdfda63c919580c75fcb9` (main with V2 merged).
Financial model **1.0.0** is unchanged; V3 is the interaction layer.

## Executed checks

- **21/21 Node tests passed**: 17 existing engine/adapter/replay tests plus 4 experience tests covering mission selection, all dialogue mappings/trade-offs, role-independent calculations, UI metadata persistence/reset, and real BARL context/risk signals.
- **Playwright integration suite passed** using the real local Babylon.js runtime, Chromium 138 and SwiftShader. Tested under `/asnm/` to cover GitHub Pages project-relative paths.
- Selected and confirmed all six categories through dialogue: developer, feature, reduce marketing, hold price, seek funding, test segment. No engine turn ran until CEO review and commit. The recorded engine actions and assumption note matched the choices.
- Tested player role selection, tutorial Next/Back/Skip, actual routed walking, keyboard movement and 3D geometry picking. Six final choices appeared at review. Form and dashboard remained hidden by default.
- The monthly sequence displayed the actual engine event, all six outcome cards and reactions. Actual team-size change matched enabled staff visuals. Refresh restored both the uncommitted draft and the completed outcome without a second turn.
- Full original Module 1 trend / Module 2 founder quiz / Module 3 form → report → Digital Twin → welcome → role → tutorial → CEO paths passed in Korean and English. Source score, capital, trends and founder type were retained; the original full report and score reopened correctly.
- Standalone entry from the main Digital Twin tab passed in both languages. Missing/zero expectations, source label, mobile layout, first full mission-based month and existing-session replacement guard were exercised.
- A risk fixture with runway <6, retention <60 and an active offer showed three proactive prompts; the Investor room alert flag was active. CFO notification caused the player to walk to Finance and open the concerned dialogue.
- Actual JSON export was parsed. Existing Node tests continued to validate import replay, malformed/tampered inputs, source/session isolation, reflection timing and seeded 60-month behavior.
- Blocked storage and unavailable WebGL still allowed a complete mission/review/commit/outcome loop through HTML, with explicit warnings.
- No uncaught page errors or failed local Module 4 resources in the integration assertions. Desktop and 390px mobile screenshots were inspected; the canvas, dialogue and missions do not overlap, and document width fits the mobile viewport.
- Final focused browser check passed for the Korean Finance-role briefing, NPC dialogue and cross-tab conflict: acknowledging another tab’s change prevented subsequent draft saves from overwriting storage.
- `git diff --check` and explicit ES-module syntax checks passed.

## Protected code

Byte comparison against the baseline confirms no changes to:

- `index.html`, `en/index.html` (Modules 1–3, score, report, export, existing AI Consultant and handoff)
- `module4/simulation/SimulationEngine.js`
- `module4/simulation/DecisionEngine.js`
- `module4/simulation/EventEngine.js`
- `module4/simulation/CalibrationEngine.js`
- `module4/state/ASNMState.js`, `Module3Adapter.js`, `StandaloneAdapter.js`
- `module4/bridge.js`, `ui/entry.js`, `ui/dashboard.js`, `ui/report.js`

StateStore only gains optional validated experience metadata after the existing replay check. Legacy JSON without that field retains its shape.

## Environment and limits

Playwright and Chromium are test tooling, not app dependencies. The legacy Chart.js 4.4.0 CDN script was mirrored unchanged locally during tests; external legacy font CSS was omitted. Module 4 uses its existing vendored Babylon.js and adds no CDN or binary asset dependency. Procedural characters are stylized low-poly, not photorealistic scanned avatars. Team representation is intentionally capped and disclosed on the room board.

The original main-site desktop navigation is hidden at narrow widths; standalone tests enter from that navigation then resize Module 4. This work does not redesign legacy mobile navigation. Browser testing used Chromium with software WebGL; it is not exhaustive across every browser/GPU.

Tests establish prototype behavior, not predictive financial accuracy. The requested deliverable is a reviewable branch/PR. No production deployment or automatic merge is performed.

## Re-run

```sh
node --test module4/tests/engine.test.js module4/tests/experience.test.js
python3 -m http.server 4173
# With Playwright available, in another terminal:
node module4/tests/browser.cjs
```

Optional environment settings: `ASNM_TEST_URL`, `ASNM_BROWSER_PATH`, `ASNM_CHART_JS_PATH`, `ASNM_SCREENSHOT_DIR`.
