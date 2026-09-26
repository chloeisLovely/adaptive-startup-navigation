import {validateState} from './ASNMState.js';

// Editable scenario defaults, not observations or currency conversion.
export function standaloneDefaults(currency='USD') {
  const unit=currency==='KRW'?1000:1;
  return {ventureName:'',industry:'',stage:'MVP',currency,capital:200000*unit,
    teamSize:1,monthlyBurn:10000*unit,mrr:0,productProgress:20,teamCapacity:50,
    demand:50,marketGrowth:12,competition:50,uncertainty:50,cac:140*unit,retention:73,
    expectedSurvival:'',expectedGrowth:'',expectedDemand:'',seed:20260925};
}
export function fromStandalone(input) {
  const d={...input};
  for(const key of ['capital','teamSize','monthlyBurn','mrr','productProgress','teamCapacity','demand','marketGrowth','competition','uncertainty','cac','retention','seed']) {
    if(d[key]==null || String(d[key]).trim()==='')throw new Error(`Required: ${key}`);
    d[key]=Number(d[key]);
  }
  const expectations={};
  for(const key of ['expectedSurvival','expectedGrowth','expectedDemand']) {
    if(d[key]!=null && String(d[key]).trim()!=='')expectations[key]=Number(d[key]);
  }
  if(typeof d.industry!=='string'||!d.industry.trim()||d.industry.length>120)throw new Error('Industry required (1–120 characters)');
  if(!['Idea','MVP','Early revenue','Growth'].includes(d.stage))throw new Error('Invalid venture stage');
  return validateState({currency:d.currency,
    founder:{riskTolerance:50,marketConfidence:50,executionReadiness:50,decisionOrientation:'Self-defined'},
    venture:{ventureName:String(d.ventureName||'').trim(),industry:d.industry.trim(),stage:d.stage,
      cash:d.capital,monthlyBurn:d.monthlyBurn,mrr:d.mrr,cac:d.cac,retention:d.retention,
      teamSize:d.teamSize,teamCapacity:d.teamCapacity,productProgress:d.productProgress},
    market:{demand:d.demand,marketGrowth:d.marketGrowth,competition:d.competition,uncertainty:d.uncertainty},
    assumptions:expectations,simulation:{currentMonth:0,seed:d.seed},
    provenance:{source:'standalone',inputs:structuredClone(input),notes:[
      'Standalone values are user-confirmed scenario assumptions, not verified venture observations.',
      'Founder risk tolerance, confidence and readiness use neutral 50 defaults.',
      'Marketing budget is 15% of burn; technical debt 30, price multiplier 1, founder equity 100. These are existing model defaults.',
      'USD/KRW presets use model cost units, not an exchange rate. Currency changes never convert entered amounts.',
      'Optional founder expectations are kept separate from market assumptions. Blank expectations remain missing.'
    ]}});
}
