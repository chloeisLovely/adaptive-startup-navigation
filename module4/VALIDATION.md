# Executed validation

Validated against original repository commit `b4f39227523acda342be5b5232f63a244489aabb`. Results below refer to the implemented Module 4 model 1.0.0, not empirical validation of startup outcomes.

## Results

- **14 automated engine tests passed** with Node.js 24.19.0 (`npm test`).
- **Browser workflow passed** with Playwright 1.62.1 and Chromium 138, rendering Babylon.js through SwiftShader WebGL. Tests used the actual vendored Babylon.js 8.26.0 bundle.
- **No uncaught page errors** in Module 4 or either legacy-language handoff; no failed local asset responses in the standalone Module 4 flow.
- **All existing inline JavaScript preserved:** extracted original/current classic script contents for `index.html` and `en/index.html`, removed only the newly added completion event, and compared byte-for-byte: both identical. Streamlit files, proxy/config, source data and existing static assets are untouched.
- **Responsive inspection:** rendered desktop 1440×1100 and mobile 390×844; mobile document width does not overflow the viewport. The screenshot in `docs/preview.png` shows the executable English interface.

The environment's standard Playwright browser download was unavailable. An actual Chromium 138 executable distributed through `@sparticuz/chromium@138.0.2` was used instead; this is a test-environment dependency, not an application dependency. For legacy pages only, the exact Chart.js 4.4.0 library was served from a local copy because their external CDN/font access was restricted. Chart functionality was not stubbed. External Google Font CSS was omitted during those legacy tests, using system fonts. Module 4 itself has no external runtime resource requests.

## Acceptance matrix

| Requirement | Evidence / result |
|---|---|
| 1. Direct Module 4 launch | Browser loads the standalone route and startup review |
| 2. Sample startup | NovaAI state committed; all 12 dashboard metrics populated |
| 3. Module 3 handoff | Filled the original BARL/company/technology/team/culture form in KO and EN; followed the result button; verified cash KRW 100,000,000, founder type, trends and growth predictions |
| 4. Babylon scene | Actual WebGL scene rendered with over 100 meshes |
| 5. Movement | Canvas WASD input changed the camera target |
| 6. Room interaction | All seven room buttons selected their panels; projected a 3D room label and clicked its geometry successfully |
| 7. Six decision categories | Browser executed one choice in each; engine exercised all 19 available actions under valid conditions |
| 8. Real state changes | Cash/operating values changed; input object immutability and per-category effects checked |
| 9. Month progression | Month advanced and recorded; 60-month horizon enforced |
| 10. Market events | Seeded events appeared in recorded runs; all 11 effects tested independently |
| 11. Runway | Net-burn definition, unbounded state and cash-depletion boundary tested |
| 12. Dashboard | 12 live metrics and previous-month changes rendered after decisions |
| 13. Decision history | Six per-decision records plus turn/event/operating trace stored for each month |
| 14. Refresh recovery | Reloaded and compared complete stored state/log with pre-refresh session |
| 15. Calibration | Three cards rendered, missing demand prediction preserved, growth units and non-probability resilience comparison tested |
| 16. JSON export/import | Actual download parsed; import replays and restores history; malformed JSON and changed final state rejected |
| 17. Fatal console errors | Zero uncaught page errors across standalone and KO/EN handoff flows |
| 18. Static Pages compatibility | No runtime build step; locally vendored library; relative asset/ES-module links; project subpath workflow checked |
| Advisors | Five role cards; four structured advisory fields; no mutation of input state |
| Reflection | Month-1 decision revisited at month 4, revised assumption saved; 3/6-month due calculations tested |
| Unavailable storage / WebGL | Injected those browser limitations; month progression still worked, fallback UI and explicit export-before-refresh warning appeared |
| Replay reproducibility | Same initial state/seed/decisions reproduced states/events/traces; five different seeds ran through 60 months |
| Compatibility boundaries | Automatic bridge covers the two public HTML apps, not the separate Streamlit applications |

## Re-run

See `README.md` for normal `npm ci`, engine tests, browser installation and local server commands. Browser tests accept optional `ASNM_BROWSER_PATH`, `ASNM_CHART_JS_PATH`, `ASNM_TEST_URL` and `ASNM_SCREENSHOT_DIR` environment variables for constrained CI environments.

These checks establish prototype functionality, not validated financial forecasting. Live GitHub Pages publication is separate: the feature branch must be reviewed/merged into the configured deployment branch before the public route updates.
