import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleState,clone,validateState,recalculate} from '../state/ASNMState.js';
import {fromModule3} from '../state/Module3Adapter.js';
import {createSession,validateSession,decodeImport,StateStore} from '../state/StateStore.js';
import {defaultDecisions,decisions} from '../simulation/DecisionEngine.js';
import {simulateMonth,reflections} from '../simulation/SimulationEngine.js';
import {calibrate} from '../simulation/CalibrationEngine.js';
import {events,applyEvent} from '../simulation/EventEngine.js';
import {RuleBasedProvider} from '../agents/AgentProvider.js';
const source={company:{name:'교육 AI',capital:10,item:'에듀테크',persona:'초등 교사를 위한 수업 도구',talent:['CTO','CMO'],tech:['AI'],welfare:[]},barl:{survival:0,growth:0,months:6},founder_type:'T',survival_score:67};
function run(state,months=6,choices=defaultDecisions()) {
  const session=createSession(state);
  for(let i=0;i<months;i++){const r=simulateMonth(session.state,choices,'Test assumption',`2026-01-${String(i+1).padStart(2,'0')}T00:00:00Z`);session.state=r.state;session.history.push(r.log);}
  return session;
}
test('Module 3 mapping preserves zero predictions, original capital, provenance and market-growth units',()=>{
  const s=fromModule3(source);assert.equal(s.venture.cash,100000000);assert.equal(s.venture.teamSize,3);assert.equal(s.assumptions.expectedSurvival,0);assert.equal(s.assumptions.expectedGrowth,0);assert.equal(s.assumptions.expectedDemand,undefined);assert.equal(s.market.marketGrowth,12);assert.equal(s.founder.calibrationGap,-67);assert.deepEqual(s.provenance.module3,source);
});
test('same seed + initial state + decisions yields exactly the same states/events/traces',()=>{
  assert.deepEqual(run(sampleState()),run(sampleState()));
  const s=sampleState();s.simulation.seed++;assert.notDeepEqual(run(s).history.map(l=>l.event),run(sampleState()).history.map(l=>l.event));
});
test('input state is not mutated and category property order does not change outcomes',()=>{
  const s=sampleState(),original=clone(s),choices=defaultDecisions();
  assert.deepEqual(simulateMonth(s,choices),simulateMonth(s,Object.fromEntries(Object.entries(choices).reverse())));assert.deepEqual(s,original);
});
test('each of six categories changes outcomes relative to alternative policies',()=>{
  const baseline=simulateMonth(sampleState(),defaultDecisions()).state;
  for(const [category,action] of Object.entries({hiring:'developer',product:'feature',marketing:'increase',pricing:'raise',fundraising:'attempt',market:'enter'})) {
    assert.notDeepEqual(simulateMonth(sampleState(),{...defaultDecisions(),[category]:action}).state,baseline,category);
  }
});
test('all 19 choices are executable under valid conditions and all events have bounded outcomes',()=>{
  let count=0;
  for(const [category,options] of Object.entries(decisions))for(const [action] of options){
    const s=sampleState();if(['accept','reject'].includes(action))s.operations.offer={amount:150000,equity:15,expiresMonth:2};
    validateState(simulateMonth(s,{...defaultDecisions(),[category]:action}).state);count++;
  }
  assert.equal(count,19);
  for(let i=0;i<events.length;i++){const s=sampleState();assert.equal(applyEvent(s,0,(i+.1)/events.length).id,events[i].id);validateState(recalculate(s));}
});
test('funding requires an offer, accepting changes cash and equity, expired offer is removed',()=>{
  assert.throws(()=>simulateMonth(sampleState(),{...defaultDecisions(),fundraising:'accept'}),/offer/);
  const s=sampleState();s.operations.offer={amount:150000,equity:15,expiresMonth:1};
  const accepted=simulateMonth(s,{...defaultDecisions(),fundraising:'accept'});
  assert.equal(accepted.state.operations.founderEquity,85);assert.equal(accepted.state.operations.offer,null);
  const ignored=simulateMonth(s,defaultDecisions());assert.equal(ignored.state.operations.offer,null);
  assert.equal(accepted.state.venture.cash-ignored.state.venture.cash,150000);
});
test('net runway recalculates; cash shortfall is not erased between expenses',()=>{
  const s=sampleState();assert.equal(s.venture.runway,20);
  s.venture.mrr=s.venture.monthlyBurn;assert.equal(recalculate(s).venture.runway,null);
  s.venture.cash=1;s.venture.mrr=0;s.operations.marketingBudget=0;
  const out=simulateMonth(s,{...defaultDecisions(),product:'feature',market:'enter'});
  assert.equal(out.state.venture.cash,0);assert.equal(out.state.venture.runway,0);assert.ok(out.log.operating.cashShortfall>10000);assert.throws(()=>simulateMonth(out.state,defaultDecisions()),/cash/);
});
test('calibration uses annual market growth and does not call resilience a survival probability',()=>{
  const s=fromModule3(source);const c=calibrate(s);assert.equal(c[0].comparable,false);assert.equal(c[1].gap,-12);assert.equal(c[1].unit,'pp/year');assert.equal(c[2].gap,null);
});
test('minimum CAC remains valid when hiring improves acquisition efficiency',()=>{
  const s=sampleState();s.venture.cac=1;
  const next=simulateMonth(s,{...defaultDecisions(),hiring:'marketer',marketing:'reduce'}).state;
  assert.ok(next.venture.cac>=1);assert.doesNotThrow(()=>validateState(next));
});
test('export/import replays history and rejects changed state, malformed JSON, NaN, invalid choices and oversized files',()=>{
  const original=run(sampleState(),4);assert.deepEqual(decodeImport(JSON.stringify(original)).session,original);
  const bad=clone(original);bad.state.venture.cash++;assert.throws(()=>validateSession(bad),/history/);
  assert.throws(()=>decodeImport('{bad'));assert.throws(()=>decodeImport(' '.repeat(8*1024*1024+1)),/8 MB/);
  const invalid=sampleState();invalid.venture.cash=NaN;assert.throws(()=>validateState(invalid));
  assert.throws(()=>simulateMonth(sampleState(),{...defaultDecisions(),pricing:'free-money'}));
  const future=sampleState();future.schemaVersion=99;assert.throws(()=>validateState(future));
});
test('refresh store round trip retains state, seed, initial data, full log and reflection',()=>{
  const map=new Map();const store=new StateStore({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)});
  const session=run(sampleState(),4),due=reflections(session);assert.equal(due.length,1);assert.equal(due[0].age,3);
  session.reflections[due[0].id]='Validate retention before hiring.';store.save(session);assert.deepEqual(store.load(),session);
  store.saveSource(fromModule3(source));assert.equal(store.readSource().venture.cash,100000000);
});
test('3- and 6-month reviews occur without treating trajectory as causal attribution',()=>{
  const s=sampleState();s.venture.cash=10000000;
  const session=run(s,7);assert.deepEqual(reflections(session).map(x=>x.age),[6,3]);
});
test('60-month horizon, varied seeds and high-cost strategies stay finite and serializable',()=>{
  for(const seed of [0,1,77,20260925,4294967295]){
    const s=sampleState();s.venture.cash=1e10;s.simulation.seed=seed;
    const session=run(s,60,{...defaultDecisions(),product:'debt'});
    assert.doesNotThrow(()=>validateSession(JSON.parse(JSON.stringify(session))));assert.throws(()=>simulateMonth(session.state,defaultDecisions()),/60-month/);
  }
});
test('advisors do not mutate state and provide all five roles and four fields',async()=>{
  const s=sampleState(),copy=clone(s);const answers=await new RuleBasedProvider().advise(s,defaultDecisions(),'en');
  assert.equal(answers.length,5);for(const a of answers)for(const k of ['observation','risk','consequence','question'])assert.equal(typeof a[k],'string');assert.deepEqual(s,copy);
});
