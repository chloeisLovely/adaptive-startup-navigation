# Repository analysis before implementation

Baseline: `b4f39227523acda342be5b5232f63a244489aabb` on `main`.

| Existing file / area | Finding and integration decision |
|---|---|
| `index.html` (~4,700 lines) | Korean single-page app with inline CSS, inline classic JavaScript, `showPage()` navigation, globally registered handlers. Keep original navigation/logic; append one completion event and isolated ES-module bridge. |
| `en/index.html` | Full English app duplicating the interactive journey, not just the overview described by the existing README. Add the same bridge and explicit English launch route. |
| `en/research.html` | Separate academic overview and methodology/roadmap narrative. Unchanged; its pre-existing descriptions may lag the new implementation. |
| Module 1 | Curated trend selection in `selectedTrends`, optional AI search and charting. No verified numerical demand time series. Keep selected topics as source context. |
| Module 2 | Ten-question categorical orientation assessment; `quizAnswers`, `_founderType`, fixed six-type trait/radar descriptions. No empirically measured 0–100 risk-tolerance field. Retain raw values without inventing validated traits. |
| Module 3 | `simData`: BARL predictions/failure reasons/biases, name, vision, capital slider, region, item, persona, technologies, planned talent, welfare. `runSimulation()` computes deterministic six-factor rubric, scenarios and risk bars. It does not simulate monthly cash flows. |
| Module 3 output | `ASNM_FACTORS`, DOM resilience score, five local risk objects, existing report `downloadJSON()` with company/barl/founder_type/trends/survival_score. Completion event includes these plus original answers. Original download format remains accepted without requiring added fields. |
| Module 4 placeholder | Existing `page-m4` concept/roadmap, preview image and notification form. Add a working launch card, label the old image as a concept reference, retain notification and roadmap functionality. |
| UI style | Dark blue background, cyan/gold/purple accents, sans-serif/monospace hierarchy, bordered glass cards; theme toggle in the legacy app. Module 4 uses a separate dark research-dashboard stylesheet with responsive room navigation. |
| Persistence | Legacy web Modules 1–3 do not have a durable completed-state store. Add namespaced source/session keys without affecting any existing data. |
| `app.py`, `AI Agent_app.py` | Separate Streamlit versions using pandas/plotly and toy revenue/burn/survival/risk formulas; optional server-side AI in the agent variant. They are not executed by GitHub Pages. Leave both unchanged; automatic handoff is for the live HTML apps, not Streamlit. |
| `data/trends.csv` | Curated categorical signals, demand strength and competition buckets consumed by Streamlit. Not evidence of live market measurements. Unchanged. |
| `config.js`, `worker.js` | Client proxy configuration and Cloudflare Worker LLM integration. Module 4 fallback needs no key or proxy change. |
| `.streamlit/config.toml`, `requirements.txt` | Streamlit theme/server settings and Python dependencies; unchanged. |
| `.nojekyll`, `404.html`, `robots.txt`, `sitemap.xml`, `favicon.svg` | Static GitHub Pages support; preserved. Module 4 uses relative paths. |
| `privacy.html` | Pre-existing privacy text refers to a custom GPT. Not rewritten as part of this feature. Module 4 documents its local-only behavior and exports. |
| `.gitignore` | Existing secret, Python, Node, editor exclusions; node_modules already ignored. |
| `M4_Metaverse_Concept.png` | Existing static concept artwork; preserved and clearly distinguished from the executable scene. |
| `README.md` | Existing root instructions retained; add a small Module 4 entry pointing to detailed docs. |

## Pre-existing inconsistencies retained to preserve compatibility

- Capital slider/display and capital-factor explanatory text disagree by a factor of ten. Mapping follows the visible input; no change to legacy score results.
- BARL survival `0` is handled as falsy/missing in parts of the legacy rubric/report. The new adapter preserves `0` correctly without altering that rubric.
- Some legacy recommendations refer to scores as actual survival results and some report strings contain broad research claims. Module 4 uses explicit scenario/model language and does not promote these labels to observed facts.
- The two Streamlit simulators differ from the public HTML rubric; merging them would be a separate migration.

No AGENTS.md was present in the repository. Work is isolated on a feature branch. The live site's main branch is not overwritten or deployed as part of feature-branch implementation.
