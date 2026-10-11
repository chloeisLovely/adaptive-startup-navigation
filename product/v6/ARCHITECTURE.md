# V6 architecture

V6 extends the existing static GitHub Pages application. No framework migration, API-key storage, Worker redeployment or core simulation rewrite is included.

## Runtime boundaries

- `product/landing.js` keeps the three entry routes. `trusted/workspace.js` owns the current path-scoped project. The landing question, contextual advisor and modules share that project and its revision lease.
- `shell.js` and `cosmic.css` apply the approved cosmic background and exactly four footer destinations. Research remains accessible through existing pages and contextual evidence disclosures, not a landing marketing block.
- `founder.js` displays six approved characters, actual quick-question counts (including ties) and optional founder context. `assessment.js` remains an original exploratory 12-item/6-situation reflection. Neither MBTI nor archetype changes money or predicts success.
- `advice.js` receives a copy of venture inputs, recent decisions and limited conversation history. External requests require explicit consent. Worker responses pass an allowlisted structured-text schema; invalid/failed requests use visibly labeled local rules. `trusted/advisors.js` preserves distinct CFO/CTO/Product/Growth/Customer/Investor meeting viewpoints.
- Financial writes occur only after founder confirmation through the existing `SimulationEngine` and versioned decision wrapper. Comparing alternatives copies the complete state and seed. New outsourcing/hybrid policies are explicit modeled allowances, not price quotations.
- `speech.js` requests recognition only on a user click. Text remains editable and must be submitted separately. Speech synthesis is opt-in. Closing/navigating disposes recognition, narration and pending advisor requests.
- `report.js` uses project records, provenance and replayed decisions. Missing inputs remain missing. `charts.js` draws actual answered-domain means and recorded modeled cash. `pdf.js` walks that report, embeds a licensed Korean font and exports locally; PDF dependencies load only on demand.
- Babylon loads only upon world/demo entry. A text decision interface remains available without WebGL. The demo uses a separate V6 storage key, preserving previous demo and original Module 4 records.

## Storage and services

Local: idea/company inputs, source records, reflection answers, decision history, expectations/learning, comparisons, optional founder context and short advisor history. JSON exports contain those business records; they are not anonymous.

Optional server: five-field feedback and allowlisted date/event counters. No venture records, free-text analytics, visitor identifiers, raw IPs or launch-email signup are sent by analytics. The provider may retain its own request logs. Collection is disabled in the submitted configuration.

The Edge Function checks origin, byte-bounded request bodies, schemas, honeypot and an atomic global quota. Admin reads additionally verify Auth JWTs with the provider and the server-only `asnm_admins` allowlist. RLS and table/RPC grants deny browser roles. Service credentials remain server-side. See [backend setup](../../backend/asnm/README.md).

## Operational limits

No live Supabase deployment has been performed. The connected project was inactive and its intended use unconfirmed. The existing AI endpoint returned Cloudflare HTTP 403/error 1010 from the test environment. Valid responses were tested with fixtures, not claimed as live model success. No real microphone/device compatibility study or new psychometric validation was conducted. A browser-only deployment remains usable with local advice, JSON and PDF.
