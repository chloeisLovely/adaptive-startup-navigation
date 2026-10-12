# ASNM ecosystem integration — 2026-10-12

This extends the human-avatar/adaptive-twin release merged in PR #8. It keeps project schema v1 and the existing server contracts. No database, authentication, feedback, admin, dependency or deployment configuration changes.

## User-visible changes

- Module 1 accepts multiple industry chips plus free text and offers up to three relevant real-company references. Unknown sectors show a coverage gap instead of unrelated examples.
- Module 2 links actual answered domains to public leadership cases, with licensed photographs and visible author/license/source attribution. These are not personality diagnoses or claims that a real person shares the user's type.
- Module 3 uses exactly six stages: 생각의 사각지대, 회사, 사업 설계, 팀 구성, 운영 전략, 최종 점검. Existing five-stage project positions migrate by meaning once. BARL inputs, zero values and legacy calculations are retained; the legacy tools share the entered expectations through an explicit bridge.
- Choice cards, reactive risk guidance, a desktop advisor sidebar and a collapsible mobile advisor replace portions of the long-form flow. The advisor receives edited draft values at send time, not only an older simulation. The last twelve conversation summaries and next actions are saved and restored. Financial questions in a builder step stay in that step.
- Review and reports offer company references, support/investment resources, explicit eligibility comparisons and program-specific preparation checklists. Preparation remains in JSON exports/imports, and a previous checklist stays available after recommendations change. Reports/PDFs include initial expectations and preparation progress.
- Module 4 retains existing rigged human assets, environments, editable entry/revisions, financial calculations and voice handling. Adds HR as the seventh advisor; existing saved six-turn discussions remain valid. Builder revenue structure, unit price, volume and variable-cost assumptions carry into editable entry. Starting a new experiment after twin decisions forks the project rather than deleting the original history.

## Recommendation provenance and limitations

`catalog.js` is an editorial snapshot of 11 companies, three leaders and five support resources/programs checked against the linked official pages on 2026-10-12. It is deliberately limited, not exhaustive or a live-search backend. Matching is transparent topic/stage/location rules; optional LLM consultation explains trade-offs using supplied references. LLM prose is not treated as a verified new source or application URL.

- Company cards use original text identity tiles, explicitly not official logos. Licensed leader portraits are local thumbnails; see `assets/RIGHTS.md` and the visible attribution under each image.
- Google Korea's listed 2026 cohort is closed. YC's listed Winter 2027 on-time deadline is Nov 2, 2026, 8pm Pacific (Nov 3 04:00 UTC). AWS credits are not cash grants. K-Startup is a directory, not one program with common eligibility.
- Open/rolling statuses expire to “recheck” after fourteen days. Past listed deadlines display closed. Application links come only from the curated catalog and appear only for a recently checked open/rolling status without a known unmet criterion. Unknown eligibility remains explicitly unknown. Final decisions and full conditions belong to the provider.
- Preparation tasks are ASNM suggestions, not invented official required documents. Completing them never establishes eligibility, funding or acceptance.
- Startup outcomes remain sensitivity calculations over explicit user/AI assumptions, not calibrated probabilities or an independently validated digital twin of every industry.

## Verification

- `node --test module4/tests/*.test.js product/tests/*.test.js`: 83 passing tests. New coverage includes stage migration, zero/missing BARL, source expiry, three-state eligibility, contextual matching, export/import, revenue handoff and advisory routing.
- Offline LinkeDOM integrations: `ecosystem-dom.mjs`, `twin-dom.mjs`, `twin-requests.mjs`, `twin-voice.mjs`. Covers all six builder steps, edited AI context, restored history, checklist persistence, preserved original twin history, revision/async cancellation and speech lifecycle.
- `twin-assets.mjs`: actual six bundled GLBs imported through Babylon NullEngine; seven human attachments, independent 80-joint skeletons, picking metadata and isolated speech morphs. This does not test WebGL pixels/materials.
- `twin-pdf.mjs`: actual Korean/English report DOM and bundled PDF runtime/font, three pages each. Korean extraction verified with Poppler. Reports contain BARL/preparation text.
- Explicitly authorized synthetic live server checks: Korean bakery and English education alternatives, seven-role discussions, CFO follow-up and the builder consultant returned HTTP 200 and valid LLM output. Advisory calls did not mutate financial state. A first consultant response suggested the wrong module; routing was corrected and the live check passed afterward.
- KO/EN inline script syntax and `git diff --check` pass.

Browser pixel/interaction QA was not available: the managed Sites environment did not expose its required browser capability. No substitute browser/server was launched. A reviewer should check desktop/mobile visual layout, WebGL rendering and actual device speech before production rollout.

## Review paths

Use the existing integrated pages or `product/trusted/index.html?mode=builder&lang=ko`, then `mode=market`, `mode=founder`, `mode=world`, `mode=report`. `lang=en` uses English. No automatic production merge is included in this review change.
