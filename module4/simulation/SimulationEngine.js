import {clone,clamp,round,recalculate,validateState,MODEL_VERSION} from '../state/ASNMState.js';
import {applyDecisions,validateDecisions} from './DecisionEngine.js';
import {randomForMonth,applyEvent} from './EventEngine.js';
import {calibrate} from './CalibrationEngine.js';
export const snapshot=s=>clone({venture:s.venture,market:s.market,operations:s.operations});

/** Pure engine: no DOM, Babylon, network, clock, storage or unseeded randomness. */
export function simulateMonth(input, choices, reason='', timestamp='') {
  const s=validateState(input);
  if(s.venture.cash<=0) throw new Error('Scenario ended: no cash remaining');
  if(s.simulation.currentMonth>=60) throw new Error('Scenario ended: 60-month research horizon');
  validateDecisions(choices,s);
  const before=snapshot(s), month=s.simulation.currentMonth+1;
  const rng=randomForMonth(s.simulation.seed,month);
  const fundingRoll=rng(), occurrence=rng(), selection=rng();
  // Canonical category order: callers cannot change calculations with JSON key ordering.
  const ordered=Object.fromEntries(['hiring','product','marketing','pricing','fundraising','market'].map(k=>[k,choices[k]]));
  const trace=applyDecisions(s,ordered,fundingRoll), afterDecisions=snapshot(s);
  const event=applyEvent(s,occurrence,selection);
  const cash=s.venture.cash; recalculate(s); s.venture.cash=cash;
  const afterEvent=snapshot(s);
  const v=s.venture,m=s.market,o=s.operations;
  v.productProgress=clamp(v.productProgress+v.teamCapacity*.06*(1-o.technicalDebt/150));
  // Retention is a monthly percentage. Demand/product/competition set paid lead conversion.
  const conversion=clamp((m.demand/100)*(.25+v.productProgress/100)*(1-m.competition/160),.02,.9);
  const acquiredCustomers=(o.marketingBudget/Math.max(v.cac,1))*conversion;
  const newMRR=acquiredCustomers*100*s.costUnit*o.priceMultiplier;
  const retainedMRR=v.mrr*v.retention/100;
  v.mrr=round(Math.max(0,(retainedMRR+newMRR)*(1+m.marketGrowth/1200)));
  const closingCash=v.cash+v.mrr-v.monthlyBurn;
  const cashShortfall=round(Math.max(0,-closingCash));
  v.cash=Math.max(0,closingCash);
  s.simulation.currentMonth=month;
  if(o.offer && o.offer.expiresMonth <= month) o.offer=null;
  recalculate(s);
  // Reject runaway imported/scenario values before a session becomes unrecoverable.
  validateState(s);
  const id=`${s.simulation.seed}-${month}`;
  const log={id,month,modelVersion:MODEL_VERSION,timestamp,founderReason:String(reason).slice(0,2000),decisions:trace.map((d,i)=>({...d,id:`${id}-${i}`,month,marketEvent:event.id,founderReason:String(reason).slice(0,2000),timestamp})),event,stateBefore:before,stateAfter:snapshot(s),stages:{afterDecisions,afterEvent},operating:{acquiredCustomers:round(acquiredCustomers),newMRR:round(newMRR),retainedMRR:round(retainedMRR),cashShortfall},calibration:calibrate(s)};
  return {state:s,log};
}

export function reflections(session) {
  const month=session.state.simulation.currentMonth;
  return session.history.filter(l=>[3,6].includes(month-l.month)).map(l=>({id:`${l.id}-review-${month}`,month:l.month,age:month-l.month,reason:l.founderReason,decisions:l.decisions,changes:Object.fromEntries(['productProgress','monthlyBurn','mrr','runway'].map(k=>[k,{before:l.stateBefore.venture[k],after:session.state.venture[k]}]))}));
}
