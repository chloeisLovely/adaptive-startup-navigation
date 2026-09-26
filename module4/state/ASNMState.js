export const MODEL_VERSION = '1.0.0';
export const clone = value => structuredClone(value);
export const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, n));
export const round = n => Math.round(n * 100) / 100;

export function recalculate(state) {
  const v = state.venture;
  for (const key of ['cash', 'monthlyBurn', 'mrr', 'cac']) v[key] = round(Math.max(0, v[key]));
  v.cac = Math.max(1, v.cac);
  for (const key of ['retention', 'teamCapacity', 'productProgress']) v[key] = round(clamp(v[key]));
  for (const key of ['demand', 'competition', 'uncertainty']) state.market[key] = round(clamp(state.market[key]));
  state.market.marketGrowth = round(clamp(state.market.marketGrowth, -100, 100));
  v.teamSize = Math.round(clamp(v.teamSize, 1, 100));
  // null is an unbounded runway, serializable without Infinity => null ambiguity.
  v.runway = v.cash <= 0 ? 0 : v.monthlyBurn > v.mrr ? round(v.cash / (v.monthlyBurn - v.mrr)) : null;
  return state;
}

const ranges = {
  founder: {riskTolerance:[0,100],marketConfidence:[0,100],executionReadiness:[0,100]},
  venture: {cash:[0,1e15],monthlyBurn:[0,1e13],mrr:[0,1e13],cac:[1,1e10],retention:[0,100],teamSize:[1,100],teamCapacity:[0,100],productProgress:[0,100]},
  market: {demand:[0,100],marketGrowth:[-100,100],competition:[0,100],uncertainty:[0,100]},
  simulation: {currentMonth:[0,60],seed:[0,4294967295]}
};
function number(value, low, high, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < low || value > high) throw new Error(`Invalid ${label}: ${low}…${high}`);
  return value;
}
export function validateState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('ASNMState object required');
  const s = clone(input);
  if (s.schemaVersion !== undefined && s.schemaVersion !== 1) throw new Error('Unsupported state schema');
  if (s.modelVersion && s.modelVersion !== MODEL_VERSION) throw new Error('Unsupported simulation model');
  for (const [section, fields] of Object.entries(ranges)) {
    if (!s[section]) throw new Error(`Missing ${section}`);
    if(section === 'simulation' && s.simulation.seed === undefined) s.simulation.seed = 20260925;
    for (const [key, [low,high]] of Object.entries(fields)) number(s[section][key], low, high, `${section}.${key}`);
  }
  for(const n of [s.venture.teamSize, s.simulation.currentMonth, s.simulation.seed]) if(!Number.isInteger(n)) throw new Error('Team size, month and seed must be integers');
  if (typeof s.venture.ventureName !== 'string' || !s.venture.ventureName.trim() || s.venture.ventureName.length > 120) throw new Error('Venture name required (1–120 characters)');
  s.currency ??= 'USD';
  if (!['USD','KRW'].includes(s.currency)) throw new Error('Currency must be USD or KRW');
  s.costUnit = s.currency === 'KRW' ? 1000 : 1;
  s.assumptions ??= {};
  for(const k of ['expectedSurvival','expectedGrowth','expectedDemand']) if(s.assumptions[k] != null) number(s.assumptions[k], k === 'expectedGrowth' ? -100 : 0, 100, k);
  s.operations ??= {marketingBudget:s.venture.monthlyBurn * .15, technicalDebt:30, priceMultiplier:1, founderEquity:100, offer:null};
  for(const [k,lo,hi] of [['marketingBudget',0,1e13],['technicalDebt',0,100],['priceMultiplier',.25,4],['founderEquity',0,100]]) number(s.operations[k],lo,hi,`operations.${k}`);
  if(s.operations.marketingBudget > s.venture.monthlyBurn) throw new Error('Marketing budget exceeds total monthly burn');
  if(s.operations.offer != null) {
    number(s.operations.offer.amount,1,1e15,'offer.amount');
    number(s.operations.offer.equity,1,50,'offer.equity');
    number(s.operations.offer.expiresMonth,0,61,'offer.expiresMonth');
  }
  s.schemaVersion = 1; s.modelVersion = MODEL_VERSION;
  return recalculate(s);
}

export function sampleState() {
  return validateState({schemaVersion:1,currency:'USD',founder:{riskTolerance:55,marketConfidence:70,executionReadiness:60,decisionOrientation:'Sample',calibrationGap:15},venture:{ventureName:'NovaAI',industry:'AI SaaS',stage:'MVP',cash:200000,monthlyBurn:18000,runway:20,mrr:8000,cac:140,retention:73,teamSize:3,teamCapacity:55,productProgress:50},market:{demand:65,marketGrowth:12,competition:70,uncertainty:45},assumptions:{expectedSurvival:80,expectedGrowth:18,expectedDemand:85},simulation:{currentMonth:0,seed:20260925},provenance:{source:'sample',notes:['All sample values are illustrative scenario assumptions.']}});
}
