# V5.1 decision rules and provenance

The original `SimulationEngine`, `DecisionEngine`, `EventEngine`, `CalibrationEngine`, legacy score and Module3Adapter are unchanged. The wrapper `simulateDecision` is versioned `venture-decisions-1`. Reproducibility uses the complete starting state, decision IDs, original engine 1.0.0, seed and a one-month horizon.

## New explicit policy assumptions

| Policy | One-time adoption cost (USD model units) | Monthly allowance | Product index on adoption |
| --- | ---: | ---: | ---: |
| External technology service | 1,000 | 300 | +2 |
| Custom technology build | 4,000 | 100 | +5 |
| Team learning allowance | 0 | 200 | 0 |
| Flexible-work tools | 300 | 100 | 0 |

These are **illustrative rules, not empirical effect estimates**. The existing engine's KRW cost unit multiplies these amounts by 1,000. This is not an exchange rate. Allowances apply to the entire venture, not per employee. Switching replaces the prior policy's monthly allowance; selecting the same current policy does not charge another setup cost or add another allowance. Switching away and back is a new adoption. A setup that exhausts cash is rejected. Product index is capped at 100. Welfare has no modeled employee-retention or productivity benefit. Its customer-retention effect is also zero; original monthly product improvement and events can independently affect customer retention.

## Original monthly rules

The chosen mission overrides only its relevant original categories. All other categories keep the original defaults: hold hiring, improve product, maintain marketing, hold price, bootstrap, focus market. **Keep current policy does not freeze the whole company**: default product improvement costs money and affects retention, then a seeded event and monthly operations occur. The UI discloses the defaults before commitment.

Hiring, product, marketing, pricing, fundraising and market expansion use the original DecisionEngine costs/effects exactly. Technology/welfare preparation is applied to a cloned state before the original month. `stateBefore` is the true pre-policy state; `originalEngineBefore` records the prepared state; original operating/event traces remain available. Comparing alternatives starts from the same pre-policy state and seed. The same random draws do not imply identical state-dependent funding outcomes or event impacts.

## Builder and observed data

- New builder amounts are always **KRW**, not millions of won. Original slider conversion remains **1 unit = KRW 10,000,000** through the untouched adapter.
- Blank cash/burn/MRR is missing; zero is an entered zero. Suggested initial state is reviewed before entry.
- Existing-company values are **user-reported**, not independently verified; prospective values are **user-plan**. Unfilled values are **model-assumption**.
- Team-range presets are 1 / 3 / 5 people. Planned future recruitment does not change initial headcount. Technology/welfare plans do not take effect until commitment.
- The legacy adapter still interprets its original planned team as an initial team, as its existing provenance states; imports retain that distinction.
- Runway = cash / (monthly total costs − recurring revenue), in months; if cash is zero runway is zero, otherwise nonpositive net burn is represented by `null` / no net burn. Missing inputs are not presented as observed zeros.
- Starting demand, CAC, monthly retention, market growth, competition, uncertainty and product/capacity indices are assumptions. The builder exposes demand/retention/CAC; the report appendix exposes the complete state and original rules.
- Recurring-revenue growth assumes subscription-like acquisition and retention. Rail, manufacturing, one-off retail and other businesses require calibration; no sector-specific forecast is claimed.
- Customer headcount, employee retention and team morale are not state variables in this engine and are not fabricated.

## Persistence and backward compatibility

New projects use a separate path-scoped `trusted:v1` registry, unique IDs and per-project revision leases. Original demo, standalone and Module 3 keys are not overwritten. New-project and legacy imports always fork. Existing ASNM session imports are validated by the original replay validator and retained under `legacyImport`; their current state becomes a new baseline. New histories replay the policy wrapper on import; tampered financial states are rejected. Stored comparison results are recalculated from their stored complete baseline and decisions.

If storage is blocked, work continues in memory and the UI asks for JSON export. Recovery after closing the browser is impossible without that export. New world entry from a changed builder forks when an existing decision history exists. Local JSON contains business information; share deliberately.

## AI and market evidence

Market exploration is a **local hypothesis template**, without live external search. It accepts arbitrary topics and never invents market size or growth. Manually supplied source metadata/URLs are labeled user-recorded and unverified. Original market tools remain under a marked legacy disclosure; their unsupported figures are not included as verified facts in the new report.

Team advice defaults to distinct rule-based roles. A user can explicitly send metrics, decision and reason to the existing configured HTTPS Worker. The `venture-team` task validates six role turns and summary strings, rejects malformed output and falls back after error/timeout. Schema validation is not factual verification. Returned advice cannot change financial state. This release does not redeploy the Worker, configure secrets or assert live-provider availability.

## V6 additive policies and reflection records

The `venture-decisions-1` rules are preserved. Technology adds two optional illustrative policies: outsourcing costs 2,500 × costUnit initially and 400 × costUnit monthly with +4 product-index points; hybrid costs 2,000 × costUnit initially and 250 × costUnit monthly with +3 points. These are disclosed scenario allowances, not local market prices or delivery guarantees. Existing policies retain their values. Switching replaces the previous monthly allowance; repetition does not duplicate setup cost. Code ownership, vendor security and delivery risk remain qualitative questions.

Expected MRR change is an optional founder estimate (-100% to +1000%). Actual comparison is a **modeled** month change recomputed from recorded before/after state; opening MRR of zero has no defined percentage and stays missing. Import replays state and rederives the percentage rather than trusting imported computed values. Learning and next-assumption notes are user-entered. No expectation is inferred when absent; no real-world calibration claim follows from simulator outcomes.
