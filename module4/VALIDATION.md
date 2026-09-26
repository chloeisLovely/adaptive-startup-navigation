# Module 4 V2 — executed validation

Baseline: `db9487588800d37ecbf3d04e01057a79eb4c0db1` (`main`, Module 4 V1 merged).
The financial model remains **1.0.0**; V2 denotes the entry and world experience.

## Executed checks

- **17/17 Node engine/adapter tests passed.** The original 14 tests remain, plus standalone normalization/missing-versus-zero expectations, invalid-input/currency bounds, deterministic replay and source/session isolation.
- **Playwright integration suite passed** with actual vendored Babylon.js 8.26.0, Chromium 138 and SwiftShader WebGL. Both Korean and English paths were exercised. No uncaught page errors in the tested paths; no failing local Module 4 asset responses.
- The server used a project subpath (`/asnm/`) rather than `/`, covering relative links equivalent to GitHub Pages project hosting.
- The complete original inline JavaScript from `index.html` and `en/index.html` was compared against baseline after removing only the two new integration hooks. It is identical. Module 3 scoring, Module 1/2 behavior, the existing report and JSON export are preserved.
- All four `simulation/*.js` files are byte-identical to baseline. `ASNMState.js`, `Module3Adapter.js` and `StateStore.js` are also unchanged.
- Additional browser verification passed for arrival at all six non-CEO destinations, live persona updates after a turn, the funding-action focus button and cross-tab conflict disabling.
- Syntax was checked in explicit ES module mode; `git diff --check` passed.
- Desktop and 390px mobile pages were rendered. Mobile Module 4 document width fits the viewport. New UI uses textContent, including a venture name containing literal `<AI>`.

## Acceptance matrix

| Test | Result |
|---|---|
| A: completed Module 3 → existing full report | Passed in Korean and English; score preserved |
| B: completed Module 3 → welcome → living world | Passed; name, KRW capital, founder type, trends, expectations and original score retained; fragment cleared |
| C: main Digital Twin tab → standalone wizard → welcome → world | Passed in both languages; no Module 3 source needed; optional blank/zero predictions handled |
| D: room selection → actual founder movement → persona | Passed; walking state observed before arrival; seven NPCs rendered; geometry picking and room-menu routes work |
| E: commit six decisions → monthly engine and world | Passed; state and history update without losing the world UI |
| F: refresh → full session restoration | Passed; draft replacement does not overwrite the existing session |
| G: JSON export/import | Passed; actual download parsed, replay import restored, malformed JSON rejected |
| H: Korean/English and responsive layout | Passed; both language paths and 390px Module 4 layouts |
| Session safety | Existing-world Continue / Export / Start New guard; exported old session before drafting; uncommitted draft left storage unchanged |
| Report after digital twin | Original Module 3 full report restored in KO/EN; original score retained |
| Retained features | Six categories, 19 actions, events, seed, calibration, five advisors, timeline, reflection, 60-month horizon |
| Browser limitations | Blocked localStorage + disabled WebGL still allow monthly decisions with a visible warning and fallback |

## Environment and limits

Playwright was supplied by the execution runtime. Its normal Chromium download failed, so the actual Chromium 138 executable from `@sparticuz/chromium@138.0.2` was used as test tooling only. The legacy Chart.js 4.4.0 CDN script was mirrored unchanged locally during tests; legacy external Google Font CSS was omitted. A Korean font was installed only in the test environment for visual inspection. None of these test dependencies is shipped as a new runtime dependency or CDN request.

The main site's pre-existing desktop navigation is hidden at narrow widths; standalone mobile tests enter via desktop navigation and then resize the Module 4 page. Mobile users can also use the main home Module 4 card or the direct Module 4 URL. This change does not redesign legacy mobile navigation.

Tests establish prototype behavior, not empirical financial prediction. No live Pages deployment is claimed. A PR/branch alone does not update the public site; review, merge and the existing Pages deployment are separate.

## Re-run

From the repository root:

```sh
node --test module4/tests/engine.test.js
python3 -m http.server 4173
# With Playwright installed as development tooling, in another terminal:
node module4/tests/browser.cjs
```

The browser script supports `ASNM_TEST_URL`, `ASNM_BROWSER_PATH`, `ASNM_CHART_JS_PATH` and `ASNM_SCREENSHOT_DIR` for constrained environments.
