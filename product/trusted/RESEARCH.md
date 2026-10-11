# ASNM exploratory founder assessment — design record

Reviewed 2026-10-11. Instrument version: `asnm-exploratory-1`.

## Primary concept sources

- European Commission, Joint Research Centre: [Competence areas and learning progress](https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/entrecomp-entrepreneurship-competence-framework/competence-areas-and-learning-progress_en). EntreComp describes three areas (ideas/opportunities, resources, action), 15 competences and progression. It is a competence framework, not automatic validation of an ASNM questionnaire.
- McGee, Peterson, Mueller & Sequeira (2009), *Entrepreneurial Self-Efficacy: Refining the Measure*, Entrepreneurship Theory and Practice 33(4), 965–988. [University repository abstract](https://aquila.usm.edu/fac_pubs/1117/), [DOI](https://doi.org/10.1111/j.1540-6520.2009.00304.x). The study develops a multidimensional measure of task-related self-efficacy. ASNM measures reported confidence, not demonstrated competence.
- Chandler, DeTienne, McKelvie & Mumford (2011), *Causation and effectuation processes: A validation study*, Journal of Business Venturing 26, 375–390. [Author/community-hosted article](https://effectuation.org/hubfs/Journal%20Articles/2017/05/Causation-and-effectuation-processes.pdf), [DOI](https://doi.org/10.1016/j.jbusvent.2009.10.006). Concepts include planning, experimentation, affordable loss, flexibility and stakeholder commitments. The paper states Elsevier copyright/all rights reserved.

## Rights and interpretation

No commercial reuse or translation license for the original ESE or Chandler questionnaire items has been obtained. Public availability is not permission to reproduce their instruments. ASNM does **not** reproduce, translate or claim to implement either original scale. All 12 prompts and six situations in `assessment.js` are newly written exploratory ASNM items. Framework concepts inform their topics, not a claim of equivalent reliability or validity. No psychometric validation, expert translation panel, normative comparison, diagnostic capability or predictive success validity has been demonstrated.

## Item map and scoring

| IDs | ASNM domain | Concept connection |
| --- | --- | --- |
| d1, d2 | Customer discovery | Opportunity exploration / searching |
| p1, p2 | Planning and experiments | Planning, initiative and learning |
| r1, r2 | Resources and partnership | Mobilising resources / stakeholders |
| f1, f2 | Financial confidence | Financial literacy / task efficacy |
| t1, t2 | Team and execution | Working with others / implementing |
| l1, l2 | Uncertainty and learning | Learning, flexibility / affordable loss |

All items use positive wording. Scores are arithmetic means of answered items, 1–5, rounded to one decimal. There are no reverse-keyed items. Missing answers are excluded, never zero-filled, and coverage is shown. A domain is ranked for relative strength/development only when both items are answered. Ties are possible; the interface discloses this. There is no composite success score. The six situation answers carry no correct-answer score; the choice, reason and associated trade-off are retained. Descriptive frequencies are not population norms or a personality classification.

The existing ten-item Founder DNA remains available as Quick Check. Its typology is explicitly self-reflection, not a validated psychological diagnosis. Deep-assessment results only customize advisory wording and learning suggestions. They do not enter financial calculations.

## Further validation

Before stronger claims: founder cognitive interviews, bilingual expert review, item refinement, consent-based pilot, internal consistency and dimensionality study, test–retest assessment and observed decision-quality study. Assess willingness to pay separately with real users. Data stays in local project JSON unless a user explicitly chooses an AI request; no research collection is enabled.
