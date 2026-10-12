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
NOT TESTED: real browser rendering, responsive visual QA, real-device voice and browser-triggered PDF download. The managed environment had no supported control-browser preview capability; no alternative preview browser was started.
PASS (2026-10-12, after explicit user authorization): live synthetic Korean bakery planning, six-role discussion and CFO followup; live English fictional education planning and six-role discussion. Actual Worker HTTP 200. Advice left financial state unchanged and proposed actions passed the deterministic calculator. The first Node request lacked the allowed Origin and correctly received 403; adding the existing ASNM site Origin resolved it without changing server security settings.
PASS: fixed a live-model compatibility issue where the model produced a second discussion round. Bounded normalization retains the first authentic turn from each of all six roles, rejects missing/invalid roles, and does not manufacture dialogue. Fresh English requests passed after the fix.
The real model is gpt-4o-mini in the existing Worker. These are synthetic API integration checks, not browser, market-validity, or forecasting-accuracy tests.
NOT TESTED: authenticated administrator login; backend is unchanged.

## Follow-up verification (2026-10-12)
- Fixed speech queue failures: stop/replay isolates stale callbacks; stalled or failed device speech cancels the queue instead of advancing the speaking avatar while audio remains queued. Missing utterance APIs and synchronous device errors fall back to captions.
- Fixed asynchronous view cleanup when leaving during 3D loading; dispose partial worlds on asset failure and prevent a late view disposer from replacing the current view's disposer.
- Isolated cancelled/restarted AI requests. Old completions cannot clear a newer request's busy state or insert role advice after a settings revision. Conversation panels refresh after decisions and revisions.
- PASS: six speech lifecycle regression cases (mock device API, not audible real-device validation).
- PASS: DOM navigation-during-load cleanup and three request-race regressions with synthetic responses, without network calls.
- PASS: real Babylon glTF loader + NullEngine imports all six bundled models and attaches seven humans to test clone isolation. Verified 80-joint skins, independent cloned skeletons, fallback hiding, role picking metadata and isolated speaking morphs. Materials/textures and WebGL pixels are outside this test; previous Blender inspection remains separate.
- PASS: actual report DOM + bundled PDF runtime/font generated Korean and English two-page PDFs. All four pages were rasterized with Poppler and visually checked. Fixed English word wrapping, heading space reservation, and Unicode minus/dash rendering. These samples contain a decision, revision and dialogue; this is not a browser download or legacy SVG-chart export test.
- PASS: 73 existing Node tests remain green after these changes, plus the targeted integration scripts below.

## Accuracy and product boundaries
This is an input-driven virtual venture model. It has no automatic synchronization with real business operations, no live market-research connector, and no calibrated probabilistic forecasting. User evidence is not automatically verified. AI proposes hypotheses; an explicit deterministic cash model evaluates founder-confirmed assumptions. Industry-specific production, inventory, tax, medical/regulatory and supply-chain dynamics require separate calibration.

Financial rule: period cash = opening cash + prorated collections − prorated fixed costs − prorated variable costs − one-off spending. A 30-day basis is used. Revenue sensitivity bounds are not statistical confidence intervals. New payroll must be included in monthlyCostDelta, preventing hidden double charges.

The user explicitly approved branch upload, a review PR and synthetic live AI requests on 2026-10-12. Git CLI has no credentials; the connected GitHub app is used for the authorized review branch. Main merge and public deployment are outside this approval.

This candidate is not publicly deployed. Review actual browser/voice behavior before a production release.

## Reproduction
- `node --test module4/tests/*.test.js product/tests/*.test.js`
- `NODE_PATH=<directory containing linkedom@0.18.12> node product/tests/twin-dom.mjs`
- Explicitly opt-in only: `ASNM_LIVE_CHECK=1 node product/tests/twin-live.mjs` (five synthetic billable model requests; not automatic CI).

Follow-up offline integration checks:
- `node product/tests/twin-assets.mjs`
- `NODE_PATH=<directory containing linkedom@0.18.12> node product/tests/twin-voice.mjs`
- `NODE_PATH=<directory containing linkedom@0.18.12> node product/tests/twin-requests.mjs`
- `NODE_PATH=<directory containing linkedom@0.18.12> node product/tests/twin-pdf.mjs` (temporary QA PDFs under `/tmp/asnm-twin-pdf`; override with `ASNM_PDF_OUTPUT`)
