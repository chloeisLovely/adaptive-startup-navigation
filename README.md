> **2026-10-12 service update:** Live browser AI and the six-role response are now verified; the messages-only Worker compatibility bug is fixed. Supabase is ACTIVE_HEALTHY. Schema/function deployment was blocked by automatic approval review and remains pending explicit approval. Earlier inactive/unverified entries below are the initial audit, not the current service state. See [current recovery evidence](backend/asnm/SERVICE_RECOVERY.md).

> **V6 review branch — not publicly deployed.** Approved founder characters, cosmic shell, contextual advice, local PDF and anonymous feedback/admin scaffolding are implemented. Live AI replies are verified; production feedback/admin deployment and operator designation remain open. See [release status](product/v6/RELEASE.md), [architecture](product/v6/ARCHITECTURE.md), [validation](product/v6/VALIDATION.md) and [beta guide](product/v6/BETA_GUIDE.md). Main merge and public deployment require final approval.

# ASNM — Adaptive Startup Navigation Model

**Test your startup decisions before you spend real money.**

A decision-support prototype for first-time founders. ASNM asks a founder to
commit their own predictions in writing, then shows how far those predictions sit
from what a transparent, published rubric returns. The gap — not the score — is
the output that matters.

🔗 **[Open the prototype](https://chloeislovely.github.io/adaptive-startup-navigation/)**
&nbsp;·&nbsp; **[English overview](https://chloeislovely.github.io/adaptive-startup-navigation/en/)**

---

## V5.1 trusted venture workspace

The approved space landing and three-minute demo are preserved. Inside the journey, a shared project now connects unrestricted topic exploration, an original multidimensional founder reflection, five-step venture setup, ten management missions and an integrated decision report. The original detailed tools, scores, research and seeded engines remain available.

- [Implementation, tested routes and remaining limits](product/trusted/RELEASE.md)
- [Assessment design, sources and rights](product/trusted/RESEARCH.md)
- [Decision rules, costs, units and provenance](product/trusted/ASSUMPTIONS.md)
- [Open the workspace](https://chloeislovely.github.io/adaptive-startup-navigation/product/trusted/index.html?mode=builder&lang=en)

Market suggestions are explicitly unverified local hypotheses. Founder reflection is an original exploratory instrument, not a validated psychological diagnosis. AI advice is optional and cannot alter engine calculations.

## v4 product experience

The redesigned entry offers a full founder journey, question-first routes and an input-free AI education demo. Decision World connects one decision to a six-role team discussion, a reproducible monthly simulation, same-seed comparisons, a decision journal and a practical action plan. The original scoring and simulation engines are retained.

- [Implementation, files and user flows](product/RELEASE.md)
- [Executed validation and deployment limits](product/VALIDATION.md)
- [Try the demo](https://chloeislovely.github.io/adaptive-startup-navigation/module4/?mode=demo)
- Classic V3 remains at `module4/immersive.html`.

## Status

The v4 experience is a **decision-support product pilot**, with explicit research and model limitations:

| Holds up | Doesn't yet |
|---|---|
| Historical claim: n=190, SEM; underlying data/report not located in repository (verification required) | No predictive validity for venture survival — the score is a rubric, not a trained model |
| Historical claim: 15-person pilot, SUS 82.2; report not located (verification required) | Founder typology has no psychometric validation |
| Full journey runs end to end | Decision-quality improvement untested |
| Scoring rubric published in-product; deterministic | Single-market sample (Korea); cross-market replication is open |

The score in Module 3 is a **weighted rubric with published factors and no
randomness**. Same input, same output, every time. Weights are initial values
drawn from the venture-failure literature; estimating them from outcome data is
the next research step.

---

## Repository layout

```
├── index.html          Main application (Korean interface)
├── en/index.html       English overview for academic and partner audiences
├── config.js           Client config — NO SECRETS, safe to commit
├── worker.js           Cloudflare Worker: server-side LLM proxy
├── privacy.html        Privacy notice
├── 404.html            Not-found page
├── favicon.svg         Icon
├── robots.txt          Crawler directives
├── sitemap.xml         Sitemap with hreflang alternates
├── .nojekyll           Disable Jekyll processing on GitHub Pages
└── .gitignore          Excludes secrets and build artifacts
```

---

## Connecting the AI features

The AI modules (trend search, strategy consultant) are optional. **Modules 1–3
work fully without them** — scoring and risk analysis are rule-based.

### Why a proxy is required

GitHub Pages serves static files. An API key placed in browser JavaScript is
public: automated scanners find committed keys within minutes, and the charges
land on the key's owner. `worker.js` solves this by moving the key server-side.

```
Browser  →  Cloudflare Worker  →  OpenAI
             (key lives here)
```

### Setup (about 5 minutes, free tier is sufficient)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create Worker**
2. Paste the contents of `worker.js`, then **Deploy**
3. Under **Settings → Variables and Secrets**, add:

   | Name | Type | Value |
   |---|---|---|
   | `OPENAI_API_KEY` | Secret | `sk-...` |
   | `ALLOWED_ORIGINS` | Text | `https://chloeislovely.github.io` |
   | `OPENAI_MODEL` | Text | `gpt-4o-mini` *(optional)* |

4. Copy the deployed Worker URL into `aiProxyUrl` in `config.js`
5. Commit and push — the AI features activate

**Recommended:** set a hard spending limit on the OpenAI account before going
live. The Worker rate-limits to 10 requests per IP per minute, but a billing cap
is the real backstop.

---

## Research

**V6 audit (2026-10-11):** the statements below are retained as historical project claims. Raw data, full thesis and pilot report were not located in this repository. Do not treat the reported statistics as independently verified evidence. See [research audit](product/v6/RESEARCH_AUDIT.md).

Developed as an MSTM thesis at aSSIST. The empirical study tested whether
cognitive-bias awareness drives perceived usefulness, which in turn drives
adoption intention (n=190, structural equation modeling), followed by a
15-participant usability pilot including accelerator directors, a national
startup-agency researcher, and a VC analyst.

The mechanism under test is not market-specific. Korea provided the first sample;
cross-market replication is the open question.

---

## Author

**Kyungsim (Chloe) Lee** — Founder, NolCo · Stony Brook University · MSTM, aSSIST

---

## License

Code released under the MIT License. Research content and figures are the
author's; please cite the thesis if referenced.
