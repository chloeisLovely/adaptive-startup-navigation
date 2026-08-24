# ASNM — Adaptive Startup Navigation Model

**Test your assumptions before you spend money on them.**

A decision-support prototype for first-time founders. ASNM asks a founder to
commit their own predictions in writing, then shows how far those predictions sit
from what a transparent, published rubric returns. The gap — not the score — is
the output that matters.

🔗 **[Open the prototype](https://chloeislovely.github.io/adaptive-startup-navigation/)**
&nbsp;·&nbsp; **[English overview](https://chloeislovely.github.io/adaptive-startup-navigation/en/)**

---

## Status

This is a **research prototype**, not a product. Stating the boundary plainly:

| Holds up | Doesn't yet |
|---|---|
| Adoption pathway validated (n=190, SEM). Indirect effect .785, 95% CI [.679, .903] | No predictive validity for venture survival — the score is a rubric, not a trained model |
| Usability pilot, 15 participants, SUS 82.2 | Founder typology has no psychometric validation |
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
