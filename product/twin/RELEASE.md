# Adaptive Venture Twin — review candidate

This replaces the fixed MVP-launch story with an editable, user-directed venture experience.

## Implemented
- Six real textured and rigged Microsoft Rocketbox business humans, bundled locally under MIT. Skin, face, clothing, 80 joints, seven facial targets, six gesture clips. Babylon loader pinned to 8.26.0.
- Warm continuous office, windows, skyline, planting, furniture, and configurable retail/lab/classroom props. Scene updates venture name, team count, readiness and revenue.
- Unified direct / Module 3 / quick-demo entry. Confirmed settings create a separate experiment. Module 3 original state is retained.
- Industry, product, customer, region, goal, constraints, revenue structure, workspace and evidence inputs. Subscription, transactional, project and pre-revenue cash models; CSV financial evidence import.
- User-directed AI planning and role discussion through the existing messages-only Worker. Two bounded model calls avoid the existing 1,200-token response cap. A single LLM generates the role perspectives; these are not independently running agents.
- Editable strategy parameters, low/base/high sensitivity comparison, explicit cash collection and funding gap, founder confirmation before state changes.
- In-progress profile/numeric changes recorded as ledger revisions; branch from earlier decisions; reproducible JSON restore.
- Sequential device speech, captions, role voice variation when available, speech-state jaw movement, stop control and user-started speech recognition. This is not phoneme-aligned lip-sync or a full-duplex streaming voice service.
- Experience report: venture/goal, choices and cash flows, alternatives, discussions, revisions, learning, next actions, evidence and model assumptions. Existing Unicode PDF exporter reused.
- Prior in-progress footer contact and entry validation changes retained.

## Verification in this turn
PASS: 73 Node unit tests including 11 new adaptive model tests; core Module 1–3 and original engine tests remain passing.
PASS: DOM integration using LinkeDOM: 6 roles, confirm a decision, revise current cash, retain Module 3 originals, deterministic restore, 7 report sections, editable entry.
PASS: syntax validation of the new modules and 3D runtime modules; git diff whitespace check.
PASS: GLB structural validation and independent Blender re-import/render; realistic face/clothing and natural relaxed pose inspected.
NOT TESTED: real browser rendering, responsive visual QA, real-device voice, this new report's PDF render. The managed environment had no supported control-browser preview capability; no alternative preview browser was started.
PASS (2026-10-12, after explicit user authorization): live synthetic Korean bakery planning, six-role discussion and CFO followup; live English fictional education planning and six-role discussion. Actual Worker HTTP 200. Advice left financial state unchanged and proposed actions passed the deterministic calculator. The first Node request lacked the allowed Origin and correctly received 403; adding the existing ASNM site Origin resolved it without changing server security settings.
PASS: fixed a live-model compatibility issue where the model produced a second discussion round. Bounded normalization retains the first authentic turn from each of all six roles, rejects missing/invalid roles, and does not manufacture dialogue. Fresh English requests passed after the fix.
The real model is gpt-4o-mini in the existing Worker. These are synthetic API integration checks, not browser, market-validity, or forecasting-accuracy tests.
NOT TESTED: authenticated administrator login; backend is unchanged.

## Accuracy and product boundaries
This is an input-driven virtual venture model. It has no automatic synchronization with real business operations, no live market-research connector, and no calibrated probabilistic forecasting. User evidence is not automatically verified. AI proposes hypotheses; an explicit deterministic cash model evaluates founder-confirmed assumptions. Industry-specific production, inventory, tax, medical/regulatory and supply-chain dynamics require separate calibration.

Financial rule: period cash = opening cash + prorated collections − prorated fixed costs − prorated variable costs − one-off spending. A 30-day basis is used. Revenue sensitivity bounds are not statistical confidence intervals. New payroll must be included in monthlyCostDelta, preventing hidden double charges.

The user explicitly approved branch upload, a review PR and synthetic live AI requests on 2026-10-12. Git CLI has no credentials; the connected GitHub app is used for the authorized review branch. Main merge and public deployment are outside this approval.

This candidate is not publicly deployed. Review actual browser/voice behavior before a production release.

## Reproduction
- `node --test module4/tests/*.test.js product/tests/*.test.js`
- `NODE_PATH=<directory containing linkedom@0.18.12> node product/tests/twin-dom.mjs`
- Explicitly opt-in only: `ASNM_LIVE_CHECK=1 node product/tests/twin-live.mjs` (five synthetic billable model requests; not automatic CI).
