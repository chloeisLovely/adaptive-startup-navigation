# ASNM v4 — Product experience transformation

## What changed

The public entry surface now explains a concrete task: **test a startup decision before spending real money**. It offers a full journey, nine question cards routed to relevant steps, and an input-free AI education demo. Existing Korean and English apps remain the source of market discovery, Founder DNA answers, the Module 3 deterministic rubric and the original report.

`module4/index.html` now opens the simplified Decision World. `module4/immersive.html` preserves the complete V3 room/mission experience. Both use the same state schema, project-scoped personal session key, published cost assumptions and deterministic monthly engines. The demo uses a separate key, so it does not overwrite personal venture records.

### User flows

1. **Full journey:** Home → Market discovery → Founder reflection → Venture assumptions → original score/report or Decision World → one decision → six-role team discussion → commit one modeled month → outcomes → ten-section action plan. The visible journey navigation allows a user to continue or revisit a step. Module 3 handoff preserves original answers, trends and score provenance.
2. **Question first:** Market/customer questions open market discovery; founder questions open the existing quiz; pricing/funding/expansion/priority questions open a four-field starting-state form and the matching decision moment. Numeric inputs are optional advanced settings; suggested inputs are reviewed explicitly.
3. **Demo:** Home → LearnLoop AI sample → choose developer/marketer/customer discovery → hear the team → confirm → see actual engine deltas, the seeded event and three practical next actions. No signup or numerical input.

### Living team and AI

- Six advisor viewpoints: CTO, CFO, Growth, Product, Customer and Investor, plus the Founder/player.
- Rule-based dialogue explicitly replies to other roles, cites the current/projected model state and ends with agreement, disagreement, trade-off and a founder question.
- Advisor mode is labeled. Optional AI advice requires an explicit in-product toggle explaining transmission of venture context. No browser API key. The existing proxy is used; both frontend and updated Worker validate bounded six-role structured responses and strip extra properties.
- Optional LLM dialogue currently uses one structured request with six defined roles, rather than six independent persistent agent workers. The world is a local single-player simulation.
- AI never has a state-write capability. Only the original `simulateMonth()` commits outcomes.
- Characters move to a meeting, react to state, show projected speech bubbles, and support room movement plus overview/first/third person views. They are procedural stylized avatars, not photorealistic humans. Advisor characters are separate from modeled staff.
- A state-aware Copilot uses current records, published rules and evidence-based repetition counts. It is explicitly labeled rule-based. The optional LLM team receives condensed recent decision context, not raw Module 3 provenance.
- Short text strategies are mapped to a bounded subset of existing engine choices, displayed for review, and never automatically committed. Unsupported interpretations require choosing a card. Browser speech recognition has text fallback.

### Comparison and learning

- Counterfactual lab copies the state **before the latest committed month**, including cash, operations, outstanding offer, market, month and seed. Both policies use identical random draws. Conditional event effects can differ because their state/choices differ. Comparing never writes the session.
- Comparison includes runway, MRR, retention, product readiness, demand, uncertainty, ownership and modeled customer acquisition. The current engine has no cumulative customer count.
- Journal stores decision label, founder reason, optional expected MRR growth, reproducibly derived modeled growth, and editable reflections. Three comparable expectations enable a gap reflection. This is not calibration against observed performance or a psychological diagnosis.
- Action plan includes state, assumptions, risks, decisions tested, changes, patterns, three actions for seven days, a 30-day experiment, measures and a revisit trigger. Markdown download, print/PDF and original Module 3 report are available.

## Files

| Area | Modified/added files |
|---|---|
| Entry/navigation | `index.html`, `en/index.html`, `product/landing.js`, `product/product.css` |
| Decision experience | `module4/index.html`, `module4/immersive.html`, `product/world-app.js`, `product/experience.js`, `product/copilot.js` |
| Advisor gateway | `product/agents.js`, `worker.js` |
| Persistence | `module4/state/StateStore.js` — additive optional `productRole` and `decisionJournal`; old sessions remain accepted, derived growth is recalculated on replay |
| World presentation | `module4/world/createWorld.js`, `module4/world/avatars.js` — product-specific palette/roster enabled only through options; V3 default rendering retained |
| Trust | `privacy.html`, `product/about.html`, `product/terms.html` |
| Measurement | `product/telemetry.js` — aggregate counts in memory, no external collector or venture content |
| Tests | `product/tests/product.test.js`, `product/tests/browser.cjs`, `product/tests/server.cjs`, `product/tests/legacy.cjs`; original tests unchanged |
| Docs | `README.md`, `module4/README.md`, this file, `product/VALIDATION.md` |

The financial transitions in `SimulationEngine`, `DecisionEngine`, `EventEngine` and `CalibrationEngine` remain unchanged. Original Module 3 arithmetic/weights/export keys also remain unchanged. Two Korean output sentences were revised to remove an inaccurate “actual result” comparison; their calculations were preserved. Market AI prompts now request research hypotheses rather than unsupported numerical market charts, and explicitly disclose the absence of live web search. Founder results add Strength/Watch-outs/Under-pressure reflection questions without changing questionnaire answers or type calculations. Research pages/content were retained.

## Run and verify

Serve from the repository root:

```sh
python3 -m http.server 4173
```

Open `/`, `/en/`, `/module4/?mode=demo`, `/module4/?lang=en` or `/module4/immersive.html`.

Unit and integration tests need Node with native ES modules:

```sh
node --test module4/tests/engine.test.js module4/tests/experience.test.js product/tests/product.test.js
```

Browser tests use Playwright (QA runtime: 1.62.1) and Chromium. Install in a test environment if needed and keep dependencies untracked:

```sh
npm install --no-save playwright
npx playwright install chromium
node product/tests/browser.cjs
node product/tests/legacy.cjs
```

Both browser runners create and stop their own static server. Set `ASNM_BROWSER_PATH` for an existing browser binary and `ASNM_SCREENSHOT_DIR` for screenshots. `ASNM_CHART_JS_PATH` can mirror the original Chart.js **4.4.0** file when the legacy CDN is inaccessible; no chart behavior is stubbed. The legacy runner serves `immersive.html` at its historical URL fixture so the original V3 acceptance script can run unchanged.

## Deployment and limits

This change is prepared as a feature-branch PR. GitHub Pages currently publishes main, so **creating this PR does not deploy v4 to the public URL**. Merge through normal review to publish the static app. A branch URL on GitHub is a code review URL, not an executable preview.

The updated `worker.js` needs a separate Cloudflare Worker deployment by the operator. This task has GitHub access but no Cloudflare deployment credential. The existing deployed proxy can still serve the frontend's JSON prompt; frontend schema validation/fallback applies even before the Worker update. Live LLM quality and production Worker schema behavior are not established by mocked tests.

Additional limits: no accounts, billing, cloud journal sync or external analytics collector; no verified live market-search integration; stage presets and interview effects are explicit modeling assumptions; browser voice support varies; no predictive survival validity; newly redesigned UX has not been tested with founders. Feedback is exported locally and can be voluntarily shared through GitHub Issues.

## Next product validation

Recruit 5–8 first-time founders and record (with consent): understanding after 30 seconds, completion of one demo decision within three minutes, completion of their own first decision within five minutes, the next action they can state, where they get stuck, and whether they return for a second real decision. Evaluate willingness to pay after the experience; do not infer it from UI polish or the earlier SUS pilot. Revise presets and decision wording from these observations before introducing billing.
