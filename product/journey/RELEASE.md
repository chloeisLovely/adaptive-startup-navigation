# Visual founder journey

This update responds to the four October 12 reference screens: equal-area sector cards, human illustrated founder personas, and the choice-led builder with a consultant alongside it. The previous builder implementations at `1e4e354`, `c7b21f1`, `34b3e7e`, and `9d0c3e3` were inspected before adapting their interaction pattern to the current six stages.

## Changes

- Module 1: nine equal groups of four sectors (36 total), search, multiple selections, visible removable choices, and voice/custom input. Existing opportunity hypotheses, company references and evidence notebook remain. Historical unsupported market-size figures are not restored.
- Module 2: the existing human illustration asset is visible as six portrait cards in the main and legacy introductions. Once assessment starts, the gallery is collapsible. Actual CEO/company references appear with results, including the ten-question legacy result; they are illustrative management references, not a personality match probability.
- Module 3: retain the current six stages and financial semantics, adding large icon choices, quick answers, Other text/voice inputs, and optional evidence notes. Unknown BARL estimates can remain blank. The desktop consultant remains alongside the builder; smaller screens show a collapsible consultant above the current step. Existing detailed tools, company/program references, exports and twin handoff remain.
- Reports: show founder sustainability, finance, team, product/technology, operations/supply, contracts/regulation/data, and customer demand. Seven-day priorities depend on recorded gaps, modeled cash and stated concerns. The 30-day plan includes founder limits, operating readiness, quality and contracts as well as customer evidence. These are explicit rules, not an LLM risk probability. Both legacy and twin reports include the seven areas.
- Advice: include self-reported readiness in the existing contextual AI request and instruct the advisor to consider relevant founder risks beyond marketing. No additional automatic request is introduced.
- Voice: user-initiated only; one active field microphone at a time. Stopping, switching fields, changing modules or rerendering ignores late callbacks. Text input remains available without browser recognition support.

## Compatibility

Saved project version remains 1. Readiness and selected-sector metadata are optional and validated on import. Unknown fields do not become risk findings or zero financial inputs. Explicit zero amounts stay zero. Calculation, seed replay, editable Module 4 entry, user revisions, founder simulation history, and the six rigged 3D assets remain intact.

## Validation (2026-10-12)

- `node --test module4/tests/*.test.js product/tests/*.test.js`: 89 passing tests.
- `journey-dom.mjs`: selection/filter/locale/import, six visible human portraits, CEO result references, six steps, unknown skip, presets and Other, speech transcript saving/cancellation/late-event guards, readiness restoration and report content.
- Existing `ecosystem-dom.mjs`, `twin-dom.mjs`, `twin-voice.mjs`: passing.
- `twin-pdf.mjs`: Korean and English report PDFs, four pages each; seven report sections retained. Text extraction confirms readiness content.
- CSSOM parse: 111 rules; changed JS syntax and `git diff --check`: passing.
- One authorized synthetic request to the existing ASNM server: HTTP 200, source `llm`, module `m3a`; project state unchanged.

Browser-rendered visual inspection, device microphone behavior and mobile pixel layout were not verified: the current managed Sites environment has no supported browser control capability. Offline DOM tests and stylesheet parsing do not substitute for those checks. No screenshot is presented as a rendering of this release.

## Follow-up: input preservation and consistent cash review

- Preserve all 36 sector labels plus the full 600-character custom question in the combined topic (2,400-character limit). Keep card titles short while retaining the full topic in the brief, export and market advice context.
- Update sector selection in place so the active keyboard button remains in the document; removing a selected chip moves focus to the next chip or search field.
- Share revenue-model-aware cash checks between builder warnings and readiness cards. Transaction/project revenue and variable costs now inform builder warnings; missing financial input remains missing.
- Builder readiness and its advisor use the edited company draft. Experience reports continue using the completed/current simulation state, with no financial state mutation.
- Clarify fixed-cost versus variable-cost input, and prevent speech input from bypassing disabled/read-only fields.
- Validation: 92 passing unit/regression tests; journey, ecosystem and twin DOM tests passing. All-sector/custom-text export restoration, stable choice nodes, draft-versus-modeled cash and disabled-field recognition covered. Browser visual QA remains unavailable as described above.
