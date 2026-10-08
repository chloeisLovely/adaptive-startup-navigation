# ASNM Module 4 v4 — Decision World

The default entry now opens the simplified decision experience. See [v4 implementation and user flows](../product/RELEASE.md) and [validation](../product/VALIDATION.md). The complete V3 experience below remains available at `immersive.html`, using the same personal state store and unchanged financial engines.

---

# ASNM Module 4 V3 — Immersive Venture Digital Twin

Interactive Babylon.js venture simulation built on V2. See [V3 changes and experience rules](V3_CHANGES.md) for the complete flow and file list.

**COMMIT → DECIDE → SIMULATE → OBSERVE → CALIBRATE → LEARN → DECIDE AGAIN**

## Run locally

From repository root:

```sh
python3 -m http.server 4173
```

Open:

- `http://localhost:4173/` — original Korean Modules 1–3; finish Module 3, then click **Venture Digital Twin 체험하기**.
- `http://localhost:4173/en/` — original English app with the same bridge.
- `http://localhost:4173/module4/` — standalone Korean Module 4.
- `http://localhost:4173/module4/?lang=en` — English Module 4.

No install, build, API key, CDN, or server-side application is needed for Module 4 runtime. Serve HTTP; opening `index.html` with `file://` will not load native ES Modules reliably. The original Modules 1–3 retain their existing external fonts/chart and optional AI dependencies.

## User flow

1. **Entry A:** finish Module 3, then choose the existing full report or **Enter Venture Digital Twin**. The completion event carries a snapshot of the actual `simData`, BARL expectations, founder profile, trends, score, factors and risks. The existing JSON export stays unchanged.
2. **Entry B:** open the main site's Digital Twin tab. Continue from a completed Module 3 result, or create a new world independently. The standalone wizard has four steps: venture → team/product → market → optional expectations/seed.
3. Both paths show a welcome screen before the campus. Missing source fields say “Not provided.” Survival is labeled a founder expectation, never an observed probability. Review/edit operating assumptions, choose a player role, then enter to commit the new session and begin the tutorial.
4. If a live session exists, choose **Continue / Export / Start New** before preparing a replacement. A wizard draft or welcome screen does not overwrite it. Ordinary refresh restores the committed session.
5. Founder starts in CEO Office. Select a room using the menu or its 3D geometry. The camera focuses smoothly; the founder walks around room footprints, arrives, and a state-aware persona card appears. Mouse orbit/zoom and canvas WASD/arrows are available. The player walks; room selection also works on mobile.
6. Start the month at CEO. Complete 2–4 required missions through persona dialogue and trade-off confirmation; optional categories remain available. Return to CEO, review all six final choices (including labeled defaults), and commit. Advance through the actual event, animated outcomes and reactions. Open Dashboard for calibration, timeline, advisory, reflections and report. Advanced Decision Sheet retains the six selects. Financial model 1.0.0, seeded behavior and the 60-month limit are unchanged.
7. Export/import reproducible session JSON or download a Markdown report. A Module 3 scenario also offers **View Module 3 Full Report**; its original completed data is restored through the original report path.
8. **New sample** retains the illustrative NovaAI review flow. It is separate from standalone user input and is never silently committed.

If WebGL is unavailable, all simulation controls remain available through room buttons and dashboard panels. Blocked/full browser storage produces a visible warning; JSON export remains available. Another tab changing the session pauses decisions in the current tab to avoid silent overwrites.

## Architecture and changed files

| Path | Responsibility |
|---|---|
| `../index.html`, `../en/index.html` | Add post-completion event and launch buttons; update Module 4 availability labels. Existing Module 1–3 calculation code is unchanged. |
| `bridge.js` | Listen to the completion event, map and store initial state, transfer directly to Module 4. |
| `state/ASNMState.js` | Validation, normalization, types documented through structure, sample, derived runway. |
| `state/Module3Adapter.js` | Existing report/event → ASNMState; original data retained under `provenance.module3`. |
| `state/StateStore.js` | Versioned persistence adapter, project-scoped keys, JSON import/export, deterministic session replay validation. |
| `simulation/SimulationEngine.js` | Pure monthly engine and delayed reflections. |
| `simulation/DecisionEngine.js` | Six categories, 19 actions, ordered per-decision state traces. |
| `simulation/EventEngine.js` | Seeded RNG, 11 possible market events, fixed per-month draws. |
| `simulation/CalibrationEngine.js` | Expected versus modeled assessments, units, missing predictions. |
| `agents/AgentProvider.js` | Five rule-based advisory roles behind an asynchronous provider interface. |
| `world/rooms.js`, `world/createWorld.js` | Seven-room Babylon scene, camera, picking, state indicators, resource lifecycle. |
| `ui/dom.js`, `ui/dashboard.js`, `ui/report.js` | Safe DOM rendering, metrics, stage trace tables, downloadable report. |
| `main.js`, `index.html`, `styles/world.css` | Bilingual hybrid UI, initialization review, decisions, calibration, timeline, advisors, reflection. |
| `experience/`, `ui/immersive.js` | Role, mission routing, state-aware dialogues, tutorials, draft decisions, outcome sequencing and visual-state flags; separate from the simulation. |
| `data/sampleState.json` | Complete importable NovaAI sample. |
| `vendor/babylon.js`, `vendor/BABYLON-LICENSE.md` | Pinned Babylon.js 8.26.0 runtime and Apache-2.0 license. |
| `tests/engine.test.js`, `tests/browser.cjs` | Meaningful deterministic, boundary, persistence and browser workflow tests. |
| `ASSUMPTIONS.md`, `REPOSITORY_ANALYSIS.md`, `VALIDATION.md` | Explicit modeling assumptions, repository analysis, executed checks and limitations. |
| `state/StandaloneAdapter.js` | Standalone inputs → validated shared ASNMState; source `standalone`. |
| `ui/entry.js` | Bilingual entry hub, four-step wizard and welcome screen. |
| `world/avatars.js` | Jointed professional procedural avatars, routed/manual movement, six animation states, actual team representation and cleanup. |

Business logic has no DOM, Babylon, network or storage imports. A future Unity or other UI can reuse the engine contract.

## Module 3 → Module 4 mapping

`runSimulation()` finishes the existing rubric → dispatches `asnm:module3-complete` → `fromModule3()` → ASNMState → StateStore/source key → welcome / optional assumption review → committed session → unchanged monthly engine → living campus.

| Legacy field | Destination / rule |
|---|---|
| `company.name`, `company.item` | `venture.ventureName`, `venture.industry` |
| `company.capital` | Cash = slider value × KRW 10,000,000; follows input display |
| `company.talent` | Assumed initial team = selected roles + founder |
| `company.tech` | Scenario defaults for product progress and execution readiness |
| `company.persona` | Competition = 45 if 10+ characters, otherwise 65 |
| `founder_type`, completion `founder_answers` | Orientation and raw provenance; no hidden causal financial coefficient |
| `barl.survival` | `assumptions.expectedSurvival`; zero preserved |
| `barl.growth` | `assumptions.expectedGrowth`; annual market growth (%) |
| `survival_score` | Original resilience score retained; founder calibrationGap = expectedSurvival − original score when both exist |
| `factors`, `risks`, `trends`, `vision`, `region`, failure reasons, biases | Retained in provenance; no fabricated numeric measurement |
| Not collected: MRR, burn, CAC, retention, demand, etc. | Explicit editable defaults; see ASSUMPTIONS.md |

The direct handoff fragment is removed before rendering. An ordinary visit to Module 4 restores the last session. A fresh Module 3 handoff offers the existing-session choices first, then welcome; entering commits the replacement. The original Module 3 JSON export format remains compatible and unchanged.

## Variables and calculation rules (model 1.0.0)

All percentages and indices are on a 0–100 scale unless noted. `marketGrowth` is annual percent in −100…100. `monthlyBurn` means gross recurring monthly expenses; marketing budget is a component, not a second expense added at close. `retention` is monthly customer/revenue retention. `technicalDebt`, `priceMultiplier`, `founderEquity`, investment offer and marketing budget are additional explicit operating state.

The action cost unit `u` equals 1 for USD and 1000 for KRW presets; it is not an exchange rate.

| Action | Immediate rule |
|---|---|
| Hire developer | Team +1; monthly burn +5000u; capacity +12; product +3 |
| Hire marketer | Team +1; burn +4000u; capacity +7; CAC ×0.92 |
| Hold hiring | No new hire expense; existing operations continue |
| Build feature | One-time cash −2500u; product +8; debt +6 |
| Improve product | One-time cash −1000u; product +4; retention +2 pp |
| Reduce debt | One-time cash −1500u; debt −12; capacity +5 |
| Marketing increase | Budget ×1.2 (minimum 500u); gross burn changes by budget difference; CAC ×1.04 |
| Maintain marketing | Keep the current budget, which still generates leads and costs cash monthly |
| Marketing reduction | Budget ×0.8; burn decreases by saved budget; CAC ×0.98 |
| Price increase | Price multiplier ×1.1 within 0.25…4; current MRR changes proportionally; retention −3 pp |
| Hold price | Preserve price multiplier |
| Price reduction | Multiplier ×0.9 within 0.25…4; MRR changes proportionally; retention +3 pp; demand +2 |
| Seek funding | One-time −2000u; offer chance = clamp(0.2 + product/250 + demand/500 − uncertainty/500, 0.1, 0.8) |
| Bootstrap | No financing inflow |
| Accept terms | Requires live offer; cash +150000u; founder ownership ×0.85; offer cleared |
| Reject terms | Requires live offer; offer cleared without inflow |
| Focus market | Demand +1 |
| Test segment | One-time −2000u; demand +4; uncertainty −5 |
| Enter market | One-time −10000u; burn +2000u; demand +10; competition +6; uncertainty +8 |

The funding offer is normally valid through the following month. New attempts are blocked until the live offer is resolved/expired. An accepted offer affects equity, not just cash.

Each month has 65% probability of one of 11 equally weighted events; otherwise no major event. Events cover competitor prices/funding, demand up/down, CAC, lost customer, enterprise opportunity, development expense, staff exit, regulation and technology shift. The exact rules are readable in `EventEngine.js`. The RNG consumes funding, event-occurrence and event-selection draws in fixed slots regardless of the chosen decision, enabling reproducible event exposure across policy paths.

After decisions and the event:

```text
productProgress += teamCapacity × 0.06 × (1 − technicalDebt / 150)
conversion = clamp((demand / 100) × (0.25 + productProgress / 100)
                   × (1 − competition / 160), 0.02, 0.9)
acquiredCustomers = marketingBudget / max(CAC, 1) × conversion
newMRR = acquiredCustomers × 100u × priceMultiplier
retainedMRR = previousMRR × retention / 100
monthEndMRR = (retainedMRR + newMRR) × (1 + marketGrowth / 1200)
closingCash = postEventCash + monthEndMRR − monthlyBurn
cashShortfall = max(0, −closingCash)
cash = max(0, closingCash)
netRunway = cash / (monthlyBurn − MRR)
```

MRR/financial amounts round to two decimals; indices are bounded. Nonpositive net burn gives unbounded runway (`null`/`∞`) when cash is positive. Zero cash ends the scenario. The session horizon is 60 months. No-op policies are intentional choices that preserve costs/position while the month still operates.

**Calibration:** normalize runway to `min(100, runway / 12 × 100)`; resilience score = 35% runway + 20% retention + 15% product + 15% capacity + 15% demand. Expected survival minus that score is labeled a **scale contrast**, not a probability error. Expected annual market growth is compared with the modeled annual market-growth variable. Demand compares 0–100 indices only when the founder entered an expectation.

**Trace:** each decision records venture, market and operating states before/after. Each turn additionally records after-decisions, after-event and final operating stages, acquired/retained MRR, cash shortfall, reason, event, timestamp and calibration. Later reflections compare an earlier starting state with current results and explicitly do not claim isolated causality.

## Tests

```sh
node --test module4/tests/engine.test.js
# Optional browser-test tooling only (no application build step):
npm install --no-save --package-lock=false playwright@1.62.0
npx playwright install chromium
python3 -m http.server 4173
# in a second terminal
node module4/tests/browser.cjs
```

Browser tests use `ASNM_TEST_URL` (default `http://127.0.0.1:4173`) and optional `ASNM_BROWSER_PATH` for an installed Chromium executable. `ASNM_SCREENSHOT_DIR` optionally stores review screenshots outside the repo. See VALIDATION.md for the actual checks executed in the implementation environment.

## GitHub Pages deployment

The repository retains its static structure. Review and merge the feature branch/PR into the branch currently used by Pages (normally `main`, folder `/ (root)`). No bundler, build output or Pages workflow replacement is needed. In repository Settings → Pages, retain the existing configured source.

After that branch is deployed, the route is:

`https://chloeislovely.github.io/adaptive-startup-navigation/module4/`

All Module 4 asset/import paths are relative and support the GitHub project subpath. Creating a feature branch or PR alone does not update the live Pages site. Never change the Worker or notification webhook just to deploy Module 4.

## Future API / database connection points

- **LLM:** implement `advise(readonlyState, proposedDecisions, lang)` in a new provider replacing `RuleBasedProvider`. Return the five roles with observation/risk/consequence/question. Use a server-side proxy (the repository's `worker.js` is an existing integration reference) and never embed API keys in browser code. Validate the provider response; the UI should fall back to the rule-based provider on failure. Advisors receive a copy and never execute financial state transitions. No Module 4 LLM API requests are implemented/enabled in this version.
- **Backend/database:** replace `StateStore` with an authenticated persistence adapter with server IDs, append-only decisions, explicit schema/model versions, consent, revision checks and ownership authorization. Preserve initialState + ordered decisions + seed. Add import migrations when the model changes. Current local replay validation is not cryptographic tamper protection.

## Limits and next priorities

1. Empirically calibrate financial/market coefficients and test learning outcomes; align forecast horizons/units before probability calibration claims.
2. Add side-by-side counterfactual policy runs under the same seed, sensitivity analysis and outcome distributions.
3. Add authenticated backend, consented research data capture, cross-device sessions and model migrations.
4. Add optional LLM providers with bounded context, validated outputs and role-specific evidence.
5. Refine industry-specific economics and timing, liquidity/receivables, cash-flow accounting and portfolio/team roles.
6. Extend the primitive personas and room activities without treating them as autonomous financial agents.

No multiplayer, real startup synchronization, live data feeds or causal attribution is claimed. The English UI is localized; imported Korean source text is preserved verbatim for provenance.

## V2 movement and lifecycle

`selectRoom(id)` → `world.goToRoom(id)` → camera interpolation + avatar route → arrival callback → persona card. `focus(id)` remains a camera-only API. `avatars.js` owns founder/NPC meshes and a single render observer. A bounded walkable grid avoids room footprints; each room uses its open south side. Repeated clicks re-route from the current position. This is a small campus route planner, not a physics/navmesh engine.

Seven NPCs occupy Finance (CFO), Market (customer persona), Product (CTO), Customer (customer), Team (developer and marketer), Investor (investor). The founder and NPCs are visual scenario roles, not evidence of actual staffing. Persona text reads current state only; interaction buttons focus existing decision/advisory controls and never auto-commit a turn.

The hidden entry screen pauses rendering. Disposal removes render observers, avatar nodes/materials, canvas handlers, ResizeObserver, scene and engine. Reduced-motion preferences suppress limb/idle oscillation; founder position still moves continuously. Babylon remains the existing locally vendored version, with no new CDN or runtime dependency.

## V2 replacement package

Apply the ZIP contents to the repository root while retaining its paths. It includes **only modified/new complete files**, so it requires the existing `main` baseline (`db9487588800d37ecbf3d04e01057a79eb4c0db1`) and its vendored Babylon runtime. Do not replace the entire repository with this patch package. No merge or live deployment is automatic.
