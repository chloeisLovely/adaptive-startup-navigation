import {validateTwin,validateProfile} from '../twin/model.js';
import {clone,validateState,MODEL_VERSION} from '../../module4/state/ASNMState.js';
import {simulateMonth,snapshot} from '../../module4/simulation/SimulationEngine.js';
import {defaultDecisions} from '../../module4/simulation/DecisionEngine.js';
import {suggestState} from '../experience.js';
import {decodeImport} from '../../module4/state/StateStore.js';
export const VERSION='6.0.0-beta', RULE_VERSION='venture-decisions-1';
export const text=(lang,ko,en)=>lang==='en'?en:ko;
export const industries=[['AI·소프트웨어','AI & software'],['IT·클라우드·보안','IT, cloud & security'],['데이터·자동화','Data & automation'],['로봇·첨단제조','Robotics & manufacturing'],['반도체·전자','Semiconductors & electronics'],['교육·에듀테크','Education & edtech'],['의료·디지털 헬스','Healthcare'],['바이오·제약','Biotech & pharma'],['시니어·돌봄','Ageing & care'],['식품·외식·베이커리','Food & bakeries'],['농업·애그테크','Agriculture'],['유통·이커머스','Retail & commerce'],['패션·뷰티','Fashion & beauty'],['관광·여행·숙박','Travel & hospitality'],['콘텐츠·게임','Content & games'],['금융·핀테크','Finance & fintech'],['부동산·프롭테크','Property'],['물류·모빌리티·철도','Logistics, mobility & rail'],['에너지·기후테크','Energy & climate'],['건설·스마트시티','Construction & smart cities'],['공공서비스·GovTech','Public services'],['제조·B2B 산업','Industrial B2B'],['지역 생활서비스','Local services'],['사회적기업','Social ventures'],['반려동물','Pet care'],['스포츠·웰니스','Sports & wellness'],['기타 · 직접 입력','Other · enter anything']];
const option=(id,ko,en,changes={},extra=null)=>({id,ko,en,changes,extra});
export const missions=[
 {id:'launch',room:'product',ko:'이번 달의 도전 · MVP 출시',en:'This month’s challenge · launch your MVP',options:[option('ship','지금 MVP 출시','Release MVP now',{product:'improve',marketing:'increase'}),option('polish','2주간 안정화 후 출시','Stabilize for two weeks, then launch',{product:'debt'}),option('pilot','고객 20명에게 먼저 테스트','Pilot with 20 customers',{market:'test',product:'improve'})]},
 {id:'team',room:'team',ko:'첫 팀 · 인재 영입',en:'Build your team',options:[option('developer','개발자 1명','One developer',{hiring:'developer'}),option('marketer','마케터 1명','One marketer',{hiring:'marketer'}),option('hold','현재 팀 유지','Keep the team')]},
 {id:'technology',room:'product',ko:'기술 도입',en:'Choose technology',options:[option('service','외부 서비스 도입','Adopt external service',{}, {kind:'technology',value:'service',once:1000,monthly:300,progress:2}),option('custom','자체 기술 구축','Build custom technology',{}, {kind:'technology',value:'custom',once:4000,monthly:100,progress:5}),option('outsource','범위를 정한 외주 개발','Scoped outsourcing',{}, {kind:'technology',value:'outsource',once:2500,monthly:400,progress:4}),option('hybrid','내부·외부 혼합 개발','Hybrid development',{}, {kind:'technology',value:'hybrid',once:2000,monthly:250,progress:3}),option('hold','현재 기술 유지','Keep technology')]},
 {id:'product',room:'product',ko:'제품·MVP 전략',en:'Product & MVP',options:[option('feature','핵심 기능 개발','Build core feature',{product:'feature'}),option('improve','기존 경험 개선','Improve experience',{product:'improve'}),option('debt','기술부채 정리','Reduce technical debt',{product:'debt'})]},
 {id:'discovery',room:'customer',ko:'첫 고객 검증',en:'Validate customers',options:[option('test','작은 고객 실험','Test a customer segment',{market:'test'}),option('focus','현재 고객 집중','Focus current customers')]},
 {id:'marketing',room:'market',ko:'고객 확보 예산',en:'Acquisition budget',options:[option('increase','예산 20% 확대','Increase budget 20%',{marketing:'increase'}),option('maintain','예산 유지','Maintain budget'),option('reduce','예산 20% 절감','Reduce budget 20%',{marketing:'reduce'})]},
 {id:'pricing',room:'market',ko:'가격 전략',en:'Pricing',options:[option('raise','가격 10% 인상','Raise price 10%',{pricing:'raise'}),option('hold','가격 유지','Hold price'),option('lower','가격 10% 인하','Lower price 10%',{pricing:'lower'})]},
 {id:'welfare',room:'team',ko:'팀 문화·복지',en:'Culture & welfare',options:[option('learning','학습 지원 예산','Learning allowance',{}, {kind:'welfare',value:'learning',once:0,monthly:200,progress:0}),option('flexible','유연근무 도구 지원','Flexible-work tools',{}, {kind:'welfare',value:'flexible',once:300,monthly:100,progress:0}),option('hold','현재 정책 유지','Keep policy')]},
 {id:'funding',room:'finance',ko:'자금 확보',en:'Financing',options:[option('attempt','투자 제안 요청','Seek an offer',{fundraising:'attempt'}),option('bootstrap','자체 자금 운영','Bootstrap'),option('accept','제안 수락','Accept offer',{fundraising:'accept'}),option('reject','제안 거절','Reject offer',{fundraising:'reject'})]},
 {id:'market',room:'market',ko:'새 시장 확장',en:'Market expansion',options:[option('enter','신규 시장 진입','Enter a market',{market:'enter'}),option('test','먼저 소규모 실험','Test first',{market:'test'}),option('focus','현재 시장 집중','Focus current market')]},
 {id:'risk',room:'finance',ko:'비용·위기 대응',en:'Manage costs & risks',options:[option('reduce','마케팅비 절감','Reduce marketing',{marketing:'reduce'}),option('debt','기술 위험 줄이기','Reduce technical risk',{product:'debt'}),option('hold','현재 전략 유지','Continue strategy')]}
];
export function findDecision(missionId,actionId){const m=missions.find(x=>x.id===missionId),o=m?.options.find(x=>x.id===actionId);if(!o)throw Error('Invalid decision');return {mission:m,option:o};}
export function availableOptions(state,m){return m.options.filter(o=>!(['accept','reject'].includes(o.changes.fundraising)&&!state.operations.offer)&&!(o.changes.fundraising==='attempt'&&state.operations.offer)&&!(o.changes.hiring&&state.venture.teamSize>=100));}
/** Versioned additions wrap the original engine. No LLM can write state. */
export function simulateDecision(input,missionId,actionId,reason='',timestamp=''){
 const {option:o}=findDecision(missionId,actionId),s=validateState(input),before=clone(s);
 validatePolicies(s);
 if(!availableOptions(s,missions.find(m=>m.id===missionId)).some(x=>x.id===actionId))throw Error('Decision unavailable');
 const assumptions=[];
 if(o.extra){const x=o.extra,u=s.costUnit,policies=s.venturePolicies||{};const old=policies[x.kind];
  if(old?.value!==x.value){s.venture.cash-=x.once*u;if(s.venture.cash<=0)throw Error('Insufficient cash for setup cost');s.venture.monthlyBurn+=(x.monthly-(old?.monthly||0))*u;s.venture.productProgress=Math.min(100,s.venture.productProgress+x.progress);s.venturePolicies={...policies,[x.kind]:{value:x.value,monthly:x.monthly}};}
  assumptions.push(`${x.kind}: setup ${x.once*u} ${s.currency}, monthly ${x.monthly*u} ${s.currency}; replaces this policy's prior monthly allowance. Product index +${x.progress} on adoption, capped at 100. No employee retention effect modeled.`);
 }
 if(missionId==='launch'){
  // A within-month milestone, never an extra monthly tick. Original engine still closes the month.
  if(actionId==='ship'){s.venture.retention=Math.max(0,s.venture.retention-2);s.operations.technicalDebt=Math.min(100,s.operations.technicalDebt+4);}
  if(actionId==='polish'){s.venture.productProgress=Math.min(100,s.venture.productProgress+6);s.venture.cash-=500*s.costUnit;if(s.venture.cash<=0)throw Error('Insufficient cash for release preparation');}
  s.releasePlan={status:actionId==='pilot'?'pilot':'released',action:actionId,targetParticipants:actionId==='pilot'?20:null,preparationDays:actionId==='polish'?14:0,month:s.simulation.currentMonth+1};
  assumptions.push('Launch v1: ship reduces retention by 2 points and adds 4 debt points; stabilize adds 6 readiness points and costs 500 cost units; pilot uses the existing segment-test cost and uncertainty rule. 14 days is a milestone inside the modeled month, not a half-month financial forecast. 20 is a target sample, not acquired or observed customers.');
 }
 const choices={...defaultDecisions(),...o.changes};
 const result=simulateMonth(s,choices,reason,timestamp);
 return {...result,log:{...result.log,stateBefore:snapshot(before),decisionModel:RULE_VERSION,missionId,actionId,extensionAssumptions:assumptions,originalEngineBefore:snapshot(s)}};
}
export function compareDecisions(state,missionId,ids){return ids.map(id=>({id,...simulateDecision(clone(state),missionId,id)}));}
export function numberOrMissing(value,max=1e13){if(value===''||value==null)return null;const n=Number(value);if(!Number.isFinite(n)||n<0||n>max)throw Error('Enter a non-negative finite number within the allowed range');return n;}
export function buildState(company){
 const nums={};for(const k of ['cash','burn','mrr'])nums[k]=numberOrMissing(company[k]);
 const s=suggestState({idea:company.name||company.idea||'My venture',stage:company.stage||'idea',team:company.team||'solo',funds:company.funds||'6-12',cash:nums.cash??undefined,burn:nums.burn??undefined,mrr:nums.mrr??undefined});
 s.venture.industry=String(company.industry||company.idea||'Unspecified').slice(0,120);s.venture.stage=company.stage||'idea';
 for(const k of ['retention','cac'])if(company[k]!==undefined&&company[k]!=='')s.venture[k]=Number(company[k]);
 if(company.demand!==undefined&&company.demand!=='')s.market.demand=Number(company.demand);
 s.provenance={source:'trusted-builder',company:clone(company),fields:Object.fromEntries(Object.entries(nums).map(([k,v])=>[k,{value:v,origin:v===null?'model-assumption':company.kind==='existing'?'user-reported':'user-plan',unit:'KRW'}])),notes:['All amounts are KRW, no implicit exchange conversion. Blank is missing; zero is a supplied value.','Team size comes from the selected team range preset (1 / 3 / 5). Hiring plans are not hired staff.','Stage/team/runway suggestions and demand, retention, CAC remain editable scenario assumptions.','Technology, welfare and hiring plans are descriptive until explicitly committed as decisions.','Monthly recurring-revenue model is most suitable for subscription businesses; other revenue models require calibration.']};
 return validateState(s);
}
export function opportunityBrief(topic,customer='',region='',lang='ko'){
 topic=String(topic).trim().slice(0,600);if(!topic)throw Error(text(lang,'관심 분야를 입력하세요.','Enter an area to explore.'));
 const t=(k,e)=>text(lang,k,e),audience=customer.trim()||t('직접 확인할 고객군','A customer segment to verify');
 return {topic,customer:audience,region,source:'local-hypothesis-template',sources:[],selected:null,opportunities:[
  {id:'problem',title:t(`${topic}: 반복되는 불편 줄이기`,`${topic}: reduce recurring friction`),problem:t(`${audience}이 현재 사용하는 방식에서 시간·비용이 드는 순간을 찾습니다.`, `Find where ${audience} spend time or money with their current solution.`),experiment:t('고객 5명에게 최근 사례와 현재 해결 방법을 질문하고 반복 문제를 기록하세요.','Ask five customers about recent incidents and current alternatives; record repeated problems.')},
  {id:'service',title:t(`${topic}: 작은 서비스로 시작`,`${topic}: start with a small service`),problem:t('대규모 개발 전 사람이 직접 해결해 줄 수 있는 문제인지 확인합니다.','Check whether a manual service can address the problem before large-scale development.'),experiment:t('범위가 좁은 유료 제안을 보여주고 실제 신청·거절 이유를 기록하세요.','Present a narrowly scoped paid offer; record sign-ups and reasons for rejection.')},
  {id:'workflow',title:t(`${topic}: 기존 업무 개선`,`${topic}: improve an existing workflow`),problem:t('기존 도구와 함께 사용할 수 있는 개선 지점을 고객에게 확인합니다.','Ask customers where an improvement could work alongside existing tools.'),experiment:t('현재 방식과 간단한 시제품의 시간·오류를 비교하세요.','Compare time and errors between the current method and a small prototype.')}
 ],uncertainty:t('실시간 검색을 수행하지 않았습니다. 시장 규모·성장률·경쟁 정보가 확인되지 않았으며, 아래는 검증할 가설입니다.','No live search was performed. Market size, growth and competitors are unverified; these are hypotheses to test.')};
}
export function newProject(id){return {schema:'asnm-project',version:1,id,revision:0,name:'',opportunity:null,assessment:{answers:{},situations:{},step:0},company:{kind:'planned',stage:'idea',team:'solo',funds:'6-12'},simulation:null,comparisons:[]};}
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
function validatePolicies(state){
 if(state.venturePolicies===undefined)return;
 if(!state.venturePolicies||Array.isArray(state.venturePolicies)||typeof state.venturePolicies!=='object')throw Error('Invalid venture policies');
 for(const [kind,policy] of Object.entries(state.venturePolicies)){
  const rule=missions.flatMap(m=>m.options).map(o=>o.extra).find(x=>x?.kind===kind&&x.value===policy?.value);
  if(!rule||policy.monthly!==rule.monthly)throw Error('Policy allowance does not match the versioned rule');
 }
}
export function decisionReflection(row,reflection={}){
 const expected=reflection.expectedGrowth==null||reflection.expectedGrowth===''?null:Number(reflection.expectedGrowth);
 if(expected!==null&&(!Number.isFinite(expected)||expected< -100||expected>1000))throw Error('Invalid expectation');
 for(const k of ['learning','nextAssumption'])if(reflection[k]!==undefined&&(typeof reflection[k]!=='string'||reflection[k].length>800))throw Error('Invalid reflection');
 const before=row.stateBefore.venture.mrr,after=row.stateAfter.venture.mrr;
 return {expectedGrowth:expected,modeledGrowth:before>0?Math.round((after-before)/before*10000)/100:null,learning:reflection.learning||'',nextAssumption:reflection.nextAssumption||''};
}
export function validateProject(data){
 if(!data||data.schema!=='asnm-project'||data.version!==1||typeof data.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(data.id)||!Number.isInteger(data.revision)||data.revision<0)throw Error('Unsupported project');
 if(JSON.stringify(data).length>8*1024*1024)throw Error('Project exceeds 8 MB');
 const p=clone(data),record=v=>v&&typeof v==='object'&&!Array.isArray(v);
 if(!record(p.company)||!record(p.assessment)||!record(p.assessment.answers)||!record(p.assessment.situations))throw Error('Missing project sections');
 if(p.founderContext&&(!record(p.founderContext)||Object.values(p.founderContext).some(v=>typeof v!=='string'||v.length>240)))throw Error('Invalid founder context');
 if(p.adviceHistory&&(!Array.isArray(p.adviceHistory)||p.adviceHistory.length>12||p.adviceHistory.some(v=>!record(v)||typeof v.question!=='string'||v.question.length>600||typeof v.answer!=='string'||v.answer.length>900||!['llm','rules','rules-fallback'].includes(v.source))))throw Error('Invalid advice history');
 if(p.quickCheck?.answers&&(!Array.isArray(p.quickCheck.answers)||p.quickCheck.answers.length>10||p.quickCheck.answers.some(v=>!['V','A','C','T','I','S'].includes(v))))throw Error('Invalid quick answers');
 if(p.entryQuestion!==undefined&&typeof p.entryQuestion!=='string')throw Error('Invalid question');
 if(p.assessment.step!==undefined&&(!Number.isInteger(p.assessment.step)||p.assessment.step<0||p.assessment.step>18))throw Error('Invalid assessment step');
 if(p.company.step!==undefined&&(!Number.isInteger(p.company.step)||p.company.step<0||p.company.step>4))throw Error('Invalid builder step');
 if(p.worldUI&&(!['CEO','CTO','CFO','Growth','Product'].includes(p.worldUI.role)||!missions.some(m=>m.id===p.worldUI.mission)))throw Error('Invalid role or mission');
 for(const [k,v] of Object.entries(p.company))if(k!=='step'&&typeof v!=='string'&&typeof v!=='number')throw Error('Invalid company field');
 for(const val of Object.values(p.assessment.answers))if(!Number.isInteger(val)||val<1||val>5)throw Error('Invalid assessment answer');
 for(const row of Object.values(p.assessment.situations))if(!row||typeof row.choice!=='string'||typeof row.reason!=='string'||row.reason.length>800)throw Error('Invalid situation answer');
 if(p.opportunity&&(!Array.isArray(p.opportunity.opportunities)||!Array.isArray(p.opportunity.sources)||typeof p.opportunity.topic!=='string'))throw Error('Invalid opportunity');
 if(p.opportunity){
  for(const o of p.opportunity.opportunities)if(!record(o)||!['id','title','problem','experiment'].every(k=>typeof o[k]==='string'))throw Error('Invalid opportunity item');
  for(const s of p.opportunity.sources)if(!record(s)||Object.values(s).some(v=>typeof v!=='string'))throw Error('Invalid source record');
 }
 if(!Array.isArray(p.comparisons)||p.comparisons.length>60)throw Error('Invalid comparisons');
 if(p.simulation){const sim=p.simulation;if(!Array.isArray(sim.history)||sim.history.length>60)throw Error('Invalid history');let state=validateState(sim.initialState);validatePolicies(state);const history=[];
  for(const row of sim.history){const r=simulateDecision(state,row.missionId,row.actionId,row.founderReason,row.timestamp);history.push({...r.log,...(row.role?{role:String(row.role).slice(0,30)}:{}),...(row.meeting?{meeting:clone(row.meeting)}:{}),...(row.reflection?{reflection:decisionReflection(r.log,row.reflection)}:{})});state=r.state;}
  if(canonical(state)!==canonical(validateState(sim.state)))throw Error('State does not match reproducible history');
  p.simulation={...sim,state,history};
 }
 for(const c of p.comparisons){if(!Array.isArray(c.ids)||c.ids.length<2||c.ids.length>3)throw Error('Invalid comparison');c.results=compareDecisions(validateState(c.state),c.missionId,c.ids);}
 if(p.twinProfile)p.twinProfile=validateProfile(p.twinProfile);if(p.twin)p.twin=validateTwin(p.twin);
 return p;
}
export function importProject(raw,id){const d=JSON.parse(raw);if(d.schema==='asnm-project'){const p=validateProject(d);p.id=id;p.revision=0;return p;}const old=decodeImport(raw),p=newProject(id),s=old.session?.state||old.state;p.company={...p.company,name:s.venture.ventureName,idea:s.venture.industry,kind:'planned'};p.legacyImport=old;p.simulation={initialState:clone(s),state:clone(s),history:[]};return p;}
export class ProjectStore {
 constructor(storage,prefix='asnm:trusted:v1:'){this.storage=storage;this.prefix=prefix;this.memory=new Map();this.volatile=false;this.last=new Map();}
 read(key){if(this.volatile&&this.memory.has(key))return this.memory.get(key);try{return this.storage.getItem(this.prefix+key);}catch{this.volatile=true;return this.memory.get(key)||null;}}
 write(key,value){try{this.storage.setItem(this.prefix+key,value);}catch{this.volatile=true;}this.memory.set(key,value);}
 load(id){const raw=this.read(id);if(!raw)return null;const p=validateProject(JSON.parse(raw));this.last.set(id,raw);return p;}
 save(p){const current=this.read(p.id);if(this.last.has(p.id)&&current!==this.last.get(p.id))throw Error('Another tab changed this project. Export a copy, then reload.');p.revision++;const raw=JSON.stringify(p);this.write(p.id,raw);this.last.set(p.id,raw);this.write('active',p.id);return p;}
 list(){let ids=[];try{for(let i=0;i<this.storage.length;i++){const key=this.storage.key(i);if(key.startsWith(this.prefix)&&key!==this.prefix+'active')ids.push(key.slice(this.prefix.length));}}catch{ids=[...this.memory.keys()].filter(k=>k!=='active');}return ids;}
}
