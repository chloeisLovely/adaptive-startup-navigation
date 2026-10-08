import test from 'node:test';import assert from 'node:assert/strict';
import {demoState,suggestState,decisionMoment,choicesFor,compareScenarios,discussion,actionPlan,journalInsight,morningBrief} from '../experience.js';
import {adviseTeam,validateDiscussion} from '../agents.js';
import {simulateMonth} from '../../module4/simulation/SimulationEngine.js';
import {clone} from '../../module4/state/ASNMState.js';
import {createSession,validateSession} from '../../module4/state/StateStore.js';
import worker from '../../worker.js';
import {strategyFromText} from '../copilot.js';
test('demo is explicitly illustrative; presets are editable assumptions and reject invalid values',()=>{
 const demo=demoState();assert.equal(demo.venture.runway,8.49);assert.equal(demo.provenance.source,'product-demo');
 const s=suggestState({idea:'Test',stage:'idea',team:'solo',funds:'3-6'});assert.equal(s.venture.runway,4.5);assert.equal(s.venture.productProgress,10);
 assert.equal(suggestState({idea:'Test',cash:12000000,mrr:1000000,burn:3000000}).venture.runway,6);
 assert.throws(()=>suggestState({idea:'Test',cash:-1}));assert.throws(()=>suggestState({idea:''}));
});
test('every presented option executes existing six-category engine and risk/offer moments adapt',()=>{
 const s=demoState();for(const problem of ['priority','pricing','funding','market'])for(const option of decisionMoment(s,problem).options)assert.equal(simulateMonth(s,choicesFor(s,option)).state.simulation.currentMonth,1);
 const low=clone(s);low.venture.cash=10000000;low.venture.runway=1.89;assert.equal(decisionMoment(low).id,'cash');
 const offer=clone(s);offer.operations.offer={amount:15000000,equity:15,expiresMonth:1};assert.equal(decisionMoment(offer).id,'offer');for(const o of decisionMoment(offer).options)simulateMonth(offer,choicesFor(offer,o));
});
test('counterfactuals start with the same complete state/seed/month and do not mutate a session',()=>{
 const s=demoState(),before=clone(s),options=decisionMoment(s).options;
 const result=compareScenarios(s,options[0],options[2]);assert.deepEqual(s,before);assert.deepEqual(result[0].log.stateBefore,result[1].log.stateBefore);
 assert.equal(result[0].state.simulation.seed,result[1].state.simulation.seed);assert.notEqual(result[0].state.venture.monthlyBurn,result[1].state.venture.monthlyBurn);
 assert.deepEqual(compareScenarios(s,options[0],options[2]),result);
});
test('six advisors reply to distinct perspectives; errors fall back without mutating state',async()=>{
 const s=demoState(),original=clone(s),option=decisionMoment(s).options[0];const rules=discussion(s,option,'en');assert.equal(rules.turns.length,6);assert.equal(new Set(rules.turns.map(r=>r.role)).size,6);
 for(const fetcher of [async()=>{throw Error('offline')},async()=>({ok:false}),async()=>({ok:true,json:async()=>({content:'not JSON'})}),async()=>({ok:true,json:async()=>({discussion:{...rules,turns:[rules.turns[0]]}})})])assert.equal((await adviseTeam(s,option,'en','','https://example.test',fetcher)).source,'rules');
 assert.deepEqual(s,original);const ai=await adviseTeam(s,option,'en','','https://example.test',async()=>({ok:true,json:async()=>({discussion:{...rules,financialState:{cash:1e12}}})}));assert.equal(ai.source,'llm');assert.equal(ai.financialState,undefined);assert.equal(validateDiscussion({...rules}).source,'llm');
 for(const turns of [rules.turns.map(r=>({...r,replyTo:'Founder'})),rules.turns.map(r=>({...r,text:'Same opinion'})),rules.turns.map(r=>({...r,replyTo:r.role}))])assert.throws(()=>validateDiscussion({...rules,turns}));
});
test('journal expectations remain distinct from modeled outcomes, replay derives growth and restores product role',()=>{
 let session=createSession(demoState());session.productRole='CFO';session.decisionJournal=[];
 for(let i=0;i<3;i++){const option=decisionMoment(session.state).options.at(-1),result=simulateMonth(session.state,choicesFor(session.state,option));session.state=result.state;session.history.push(result.log);session.decisionJournal.push({logId:result.log.id,option:option.en,reason:'Test demand',expectedGrowth:80,modeledGrowth:999});}
 const restored=validateSession(session);assert.equal(restored.productRole,'CFO');assert.notEqual(restored.decisionJournal[0].modeledGrowth,999);assert.match(journalInsight(restored,'en'),/Across 3 decisions/);assert.equal(actionPlan(restored,'en').week.length,3);
 const bad=clone(session);bad.decisionJournal[0].logId='fake';assert.throws(()=>validateSession(bad));
});
test('worker denies lookalike local origins and validates structured output; legacy proxy remains compatible',async()=>{
 const ctx={waitUntil(){}},env={OPENAI_API_KEY:'test-placeholder',ALLOWED_ORIGIN:'https://example.test'};
 const req=(body,origin='https://example.test')=>new Request('https://worker.test',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await worker.fetch(req({messages:[]},'http://localhost.evil.test'),env,ctx)).status,403);
 const previous=globalThis.fetch;try{
  globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'bad JSON'}}]}));
  assert.equal((await worker.fetch(req({task:'venture-team',context:{},lang:'en'}),env,ctx)).status,502);
  const data=discussion(demoState(),decisionMoment(demoState()).options[0],'en');
  globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({...data,cash:1e12})}}]}));
  const response=await worker.fetch(req({task:'venture-team',context:{},lang:'en'}),env,ctx);assert.equal(response.status,200);const json=await response.json();assert.equal(json.discussion.turns.length,6);assert.equal(json.discussion.cash,undefined);
  globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({...data,turns:data.turns.map(r=>({...r,replyTo:'Founder'}))})}}]}));
  assert.equal((await worker.fetch(req({task:'venture-team',context:{},lang:'en'}),env,ctx)).status,502);
  globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'legacy response'}}]}));
  assert.equal((await(await worker.fetch(req({messages:[{role:'user',content:'test'}]}),env,ctx)).json()).content,'legacy response');
 }finally{globalThis.fetch=previous;}
});

test('short natural-language strategy maps to explicit legal engine choices and never silently invents an action',()=>{
 const s=demoState(),before=clone(s);const o=strategyFromText('채용을 미루고 고객 인터뷰에 집중하고 싶어요',s);assert.equal(choicesFor(s,o).hiring,'hold');assert.equal(choicesFor(s,o).market,'test');assert.equal(strategyFromText('Build a quantum time machine',s),null);assert.deepEqual(s,before);
});
test('gap feedback needs three comparable expectations, not zero-revenue or missing-expectation rows',()=>{
 const s=createSession(demoState());s.decisionJournal=[{expectedGrowth:20,modeledGrowth:null},{expectedGrowth:20,modeledGrowth:null},{expectedGrowth:20,modeledGrowth:null}];assert.match(journalInsight(s,'en'),/After three/);
});
test('all 90 stage/team/funding presets have non-negative cash and matching modeled runway',()=>{
 const months={'none':.5,'0-3':2,'3-6':4.5,'6-12':9,'12+':15};
 for(const stage of ['idea','interview','mvp','customer','revenue','growth'])for(const team of ['solo','small','large'])for(const funds of Object.keys(months)){
  const s=suggestState({idea:'Preset coverage',stage,team,funds});assert.ok(s.venture.cash>0);assert.equal(s.venture.runway,months[funds]);
 }
 const changed=suggestState({idea:'Edited costs',stage:'revenue',team:'solo',funds:'3-6',mrr:1000000,burn:4000000});assert.equal(changed.venture.cash,13500000);assert.equal(changed.venture.runway,4.5);
 const profitable=suggestState({idea:'No net burn',mrr:5000000,burn:3000000});assert.equal(profitable.venture.runway,null);assert.ok(profitable.venture.cash>0);
});
test('product drafts restore independently of engine state and reject stale or oversized imported context',()=>{
 const s=createSession(demoState());s.productDraft={month:0,reason:'Hold hiring and interview customers',expectation:'20',optionId:'discover'};const before=clone(s.state);
 assert.deepEqual(validateSession(s).productDraft,s.productDraft);assert.deepEqual(s.state,before);assert.equal(validateSession(createSession(before)).productDraft,undefined);
 for(const patch of [{month:1},{reason:'x'.repeat(801)},{expectation:'x'.repeat(31)},{optionId:'<script>'}])assert.throws(()=>validateSession({...s,productDraft:{...s.productDraft,...patch}}));
 const result=simulateMonth(s.state,choicesFor(s.state,decisionMoment(s.state).options[2]));s.state=result.state;s.history.push(result.log);assert.equal(validateSession(s).productDraft,undefined);assert.equal(validateSession(s).history.length,1);
});
test('proactive team brief responds to cash, retention, offers and seeded events without changing state',()=>{
 const s=createSession(demoState());s.state.venture.cash=5000000;s.state.venture.runway=.94;s.state.venture.retention=45;s.state.operations.offer={amount:15000000,equity:15,expiresMonth:1};const before=clone(s);
 const turns=morningBrief(s,'en');assert.match(turns[0].text,/0.94 months/);assert.ok(turns.some(x=>x.role==='Customer'&&x.text.includes('45%')));assert.ok(turns.some(x=>x.role==='Investor'&&x.text.includes('15%')));assert.deepEqual(s,before);
 const result=simulateMonth(s.state,choicesFor(s.state,decisionMoment(s.state).options[1]));s.state=result.state;s.history.push(result.log);if(result.log.event.id!=='quiet')assert.ok(morningBrief(s,'en').some(x=>x.text.includes(result.log.event.en)));
});
