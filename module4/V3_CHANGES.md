# Module 4 V3 — Immersive Venture Digital Twin

Built on main `dbefe4f151dd4380dfebdfda63c919580c75fcb9` (merged V2). No changes to Modules 1–3, their report/AI/score/export/handoff, the entry adapters, or the four simulation engines. Model version remains 1.0.0.

## First five minutes

1. Finish Module 3 and choose Digital Twin, or open the Digital Twin tab and create an independent venture.
2. Review the welcome assumptions. Choose Founder/CEO, Product, Growth/Marketing or Finance Lead.
3. Follow the five-step tutorial (Back/Next/Skip; Help reopens it). The first CEO briefing explicitly identifies the source.
4. Start the month. The mission panel highlights 2–4 priorities. Click a room button, a 3D room/person, or a proactive notification to walk there. Canvas WASD/arrows allow short manual movements; room navigation provides routed movement on mobile and desktop.
5. Talk to the persona, choose an action, inspect its exact immediate trade-off and confirm. A contextual guide appears until acknowledged in each room.
6. Return to CEO, record an assumption in the dialogue, review all six final choices, and commit. Defaults are individually labeled. Product improvement is not a free/no-op default.
7. Advance through “30 days later”, the actual seeded event, six before/after outcome cards and NPC reactions. Continue to the next briefing.

## Boundaries and decisions

`experience/MissionDirector.js` routes attention without predicting finances: active offer scores 110; runway <8 scores 90 for financing; retention <65 scores 85 for pricing; product <45 scores 80; competition >65 scores 75; team capacity <40 scores 60. Role-relevant categories receive +20. Select between two and four categories from this ordering (three if no high-priority issues). These are disclosed UX heuristics, not validated business thresholds. An active offer routes financing to Investor; otherwise it routes to Finance.

| Room | Engine decisions |
|---|---|
| CEO | Briefing, assumption note, all-six review, commit |
| Finance | Marketing budget; fundraising |
| Market | Market strategy; marketing budget |
| Product | Product action |
| Customer | Pricing |
| Team | Hiring |
| Investor | Fundraising; current offer accept/reject |

Every dialogue option uses the existing action identifiers. No persona auto-executes anything. Final choices are submitted unchanged to `simulateMonth`. Role has no numeric engine effect. Cost explanations use the existing `costUnit` (USD=1, KRW=1000), and explicitly distinguish immediate effects from event/operating outcomes. Notes are logged as founderReason and do not alter financial inputs.

## World and presentation

- Local procedural low-poly characters with tapered torsos, shoulders, neck/head/face/hair, jacket/shirt/lapels, hips, articulated upper/lower limbs, cuffs, hands and shoes. Distinct proportions, hair, glasses/headphones and clothing. No new CDN or binary assets.
- Shared disposable animation tick supports idle breathing/weight shift, walk, talk, think, celebration and concern. NPCs face the player during conversations.
- Warm lighting, soft shadows, player ring, pulsing room mission beacons and smooth conversation two-shot framing.
- Runway <6 warns in Finance; retention <60 warns in Customer; active offer lights Investor and moves the investor forward. Product prototype grows with actual progress. CEO screen shows actual MRR and its previous value. Market screen displays the actual event. Team members appear/disappear from actual team count.
- Team visuals represent the founder plus at most six staff; resident personas are separate advisors, not counted employees. The Team board displays actual count and visual cap. Detailed team composition is not tracked by the existing engine, so no fictional role history is added.
- Source-aware dialogue reads actual `provenance.module3.company`, `barl` (including zero-valued expectations, months, biases and failure reasons), and founder profile. Missing fields are omitted.
- Dashboard (calibration, timeline, advisory, reflection, report) and Advanced Decision Sheet are opt-in dialogs. Main interactions are HTML, so WebGL failure does not prevent decisions. Mobile uses a horizontal room navigator and stacked canvas/dialogue/mission regions.

## Persistence

Optional `session.experience` stores role, month draft choices, confirmed categories, reason, tutorial acknowledgment and visited-room acknowledgments. It is outside the engine state and replay history. Legacy V1/V2 JSON remains accepted without changing its shape until used in V3. Import still replays every logged month before restoring UI metadata. On a new month, choices reset to existing defaults; role/tutorial acknowledgments remain. If refreshed during an outcome, the actual completed outcome restarts from its first stage and is not simulated again.

## Complete changed files

- `module4/main.js`
- `module4/state/StateStore.js`
- `module4/world/avatars.js`
- `module4/world/createWorld.js`
- `module4/styles/world.css`
- `module4/ui/immersive.js` (new)
- `module4/experience/MissionDirector.js` (new)
- `module4/experience/DialogueDirector.js` (new)
- `module4/experience/WorldStatePresenter.js` (new)
- `module4/tests/browser.cjs`
- `module4/tests/experience.test.js` (new)
- `module4/README.md`
- `module4/ASSUMPTIONS.md`
- `module4/VALIDATION.md`
- `module4/V3_CHANGES.md` (new)

The delivery ZIP contains only these complete files, with repository-relative paths. Existing V2 assets and all unchanged files are still needed. The PR targets main; merging/publishing is a separate user action.
