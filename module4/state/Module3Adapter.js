import {validateState, clamp} from './ASNMState.js';

/** Map the existing downloadJSON format or completion event; never modify M3. */
export function fromModule3(raw) {
  if(!raw?.company || typeof raw.company.name !== 'string' || !raw.company.item) throw new Error('Complete Module 3 or import its report JSON');
  const c=raw.company, b=raw.barl || {};
  const capital=Number(c.capital);
  if(!Number.isFinite(capital) || capital < 1 || capital > 100) throw new Error('Invalid Module 3 capital');
  const talents=Array.isArray(c.talent) ? c.talent : [], tech=Array.isArray(c.tech) ? c.tech : [];
  const founderPrediction = v => v === '' || v == null || !Number.isFinite(Number(v)) ? undefined : Number(v);
  const survival=founderPrediction(b.survival), growth=founderPrediction(b.growth);
  const score=founderPrediction(raw.survival_score);
  const defined=typeof c.persona === 'string' && c.persona.trim().length >= 10;
  const team=Math.min(100,1+talents.length);
  return validateState({
    currency:'KRW',
    founder:{riskTolerance:50,marketConfidence:50,executionReadiness:clamp(30+talents.length*8+Math.min(tech.length,2)*8),decisionOrientation:raw.founder_type || 'Unspecified',calibrationGap:survival != null && score != null ? survival-score : undefined},
    venture:{ventureName:c.name,industry:c.item,stage:'Pre-revenue MVP',cash:capital*10000000,monthlyBurn:6000000+team*4000000,mrr:0,cac:140000,retention:73,teamSize:team,teamCapacity:clamp(25+team*10),productProgress:tech.length ? 35 : 20},
    market:{demand:50,marketGrowth:12,competition:defined ? 45 : 65,uncertainty:50},
    assumptions:{expectedSurvival:survival,expectedGrowth:growth},
    simulation:{currentMonth:0,seed:20260925},
    provenance:{source:'module3',module3:raw,notes:[
      'Capital follows the original input display: 1 slider unit = KRW 10,000,000. The legacy score text uses a conflicting unit; its score is preserved without recalculation.',
      'Planned talent is treated as an initial team plus one founder; this is a scenario assumption, not confirmed hiring.',
      'Monthly burn, MRR, CAC, retention, capacity, product progress, demand, growth and uncertainty are editable assumptions, not observed business data.',
      'Founder risk tolerance and market confidence use neutral 50 defaults. Execution readiness is an unvalidated team/technology rubric. Typology does not determine financial outcomes.',
      'BARL growth is an annual MARKET growth expectation, not venture MRR growth. Expected demand was not collected and is left unset.'
    ]}
  });
}
