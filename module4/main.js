import {createEntry} from './ui/entry.js';
import {personas} from './world/avatars.js';
import {sampleState,clone,validateState,round} from './state/ASNMState.js';
import {StateStore,createSession,decodeImport,SESSION_KEY} from './state/StateStore.js';
import {simulateMonth,reflections} from './simulation/SimulationEngine.js';
import {decisions,defaultDecisions} from './simulation/DecisionEngine.js';
import {calibrate} from './simulation/CalibrationEngine.js';
import {RuleBasedProvider} from './agents/AgentProvider.js';
import {createWorld} from './world/createWorld.js';
import {rooms} from './world/rooms.js';
import {el,money,fmt,download} from './ui/dom.js';
import {dashboard,changeTable} from './ui/dashboard.js';
import {reportMarkdown} from './ui/report.js';

const lang=new URLSearchParams(location.search).get('lang')==='en'?'en':'ko';
document.documentElement.lang=lang;
const t=(ko,en)=>lang==='ko'?ko:en;
const app=document.getElementById('app');
let store,session=createSession(sampleState()),world=null,activeRoom='ceo',activeTab='calibration',started=false,conflict=false,advisorRequest=0;
let selections=defaultDecisions(),arrivedRoom='ceo',walking=false,pendingState=null;
const provider=new RuleBasedProvider();
const notify=message=>{document.getElementById('status').textContent=message;};
const actionName=(category,action)=>decisions[category]?.find(d=>d[0]===action)?.[lang==='ko'?1:2] || action;
const categoryName={hiring:t('채용','Hiring'),product:t('제품','Product'),marketing:t('마케팅','Marketing'),pricing:t('가격','Pricing'),fundraising:t('투자유치','Fundraising'),market:t('시장','Market')};
const tabs={calibration:t('가정 비교','Calibration'),timeline:t('결정 기록','Decision log'),agents:t('AI 자문','Advisors'),reflection:t('돌아보기','Reflection'),report:t('리포트','Report')};
const status=el('p',{id:'status',class:'status',role:'status','aria-live':'polite'});
const importInput=el('input',{type:'file',accept:'.json,application/json',id:'import-file',class:'sr-only','aria-label':t('JSON 가져오기','Import JSON')});
const header=el('header',{class:'header'},el('div',{class:'brand'},el('a',{href:lang==='en'?'../en/':'../',title:'ASNM Home'},'ASN',el('span',{text:'M'})),el('div',{class:'brand-title'},el('div',{class:'eyebrow',text:'MODULE 04'}),el('div',{text:'VENTURE DIGITAL TWIN'}))),el('div',{class:'tools'},el('button',{id:'entry-hub-button',text:t('새 Venture / 진입 화면','New venture / Entry'),onclick:showHub}),el('button',{id:'new-sample',text:t('새 샘플','New sample'),onclick:()=>requestNew(()=>openSetup(sampleState()))}),el('button',{id:'load-module3',text:t('Module 3 불러오기','Load Module 3'),onclick:loadModule3}),el('label',{class:'button',for:'import-file',text:t('JSON 가져오기','Import JSON'),tabindex:'0',onkeydown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();importInput.click();}}}),importInput,el('button',{id:'export-json',text:t('JSON 내보내기','Export JSON'),onclick:()=>download(JSON.stringify(session,null,2),'ASNM-venture-session.json')}),el('button',{text:lang==='ko'?'EN':'한국어',onclick:()=>{const url=new URL(location);url.searchParams.set('lang',lang==='ko'?'en':'ko');location.assign(url.href);},'aria-label':'Change language'})));
const sidebar=el('nav',{class:'sidebar','aria-label':t('연구실 이동','Navigate rooms')},el('p',{class:'side-label',text:'CAMPUS DIRECTORY'}),...rooms.map((r,i)=>el('button',{class:'room-link','data-room':r.id,'aria-pressed':i===0,onclick:()=>selectRoom(r.id)},el('span',{class:'dot',style:`background:${r.color}`}),el('span',{},el('strong',{text:r.name}),el('small',{text:r[lang]})))),el('div',{class:'side-footer'},el('div',{class:'eyebrow',text:'DECISION LAB'}),t('예측을 확정하고, 결정하고, 결과를 관찰하세요.','Commit predictions. Decide. Observe the outcome.'),el('br'),el('span',{class:'mono',id:'seed-label'})));
const title=el('h1',{id:'venture-title'}),monthBadge=el('div',{class:'month mono',id:'month-label'}),source=el('p',{class:'source',id:'source-label'});
const canvas=el('canvas',{id:'world-canvas',tabindex:'0','aria-label':t('3D 스타트업 캠퍼스. 마우스로 회전, 휠 확대, WASD 이동. 왼쪽 버튼으로도 방을 선택할 수 있습니다.','3D startup campus. Drag to orbit, wheel to zoom, WASD to pan. Room navigation is also available through buttons.')});
const worldShell=el('section',{class:'world-shell'},el('div',{class:'world-top'},el('strong',{text:'VENTURE CAMPUS'}),el('span',{text:'LIVE SCENARIO ENVIRONMENT'})),canvas,el('div',{class:'world-controls'},el('button',{id:'overview',text:t('전체 보기','Overview'),onclick:()=>world?.overview()})),el('div',{class:'world-bottom'},el('span',{},el('i',{class:'live-dot'}),t('방을 클릭해 의사결정 패널 열기','Click a room to explore decisions')),el('span',{text:t('드래그 회전 · 휠 확대 · WASD 이동','DRAG orbit · SCROLL zoom · WASD pan')})));
const interaction=el('section',{id:'persona-card',class:'persona-card','aria-live':'polite'});
const metrics=el('section',{class:'metrics',id:'metrics','aria-label':t('월별 지표','Monthly metrics')});
const roomDetail=el('section',{id:'room-detail','aria-live':'polite'});
const tabBar=el('div',{class:'detail-tabs',role:'tablist','aria-label':t('분석 보기','Analysis views')},...Object.entries(tabs).map(([id,label])=>el('button',{class:'tab',id:'tab-'+id,role:'tab','aria-selected':id===activeTab,'aria-controls':'analysis-panel',onclick:()=>{activeTab=id;renderPanel();},text:label})));
const panel=el('section',{class:'tab-panel',id:'analysis-panel',role:'tabpanel','aria-labelledby':'tab-calibration'});
const disclaimer=el('p',{class:'notice',text:t('연구 프로토타입 · 모든 결과는 명시된 가정과 규칙에 따른 시나리오입니다. 실제 생존확률이나 미래 실적의 예측이 아닙니다.','Research prototype · Outcomes are scenario-based estimates from explicit assumptions and rules, not real survival probabilities or forecasts.')});
const main=el('main',{class:'main'},el('div',{class:'title-row'},el('div',{},el('div',{class:'eyebrow',text:'COMMIT → DECIDE → CALIBRATE'}),title,source),monthBadge),worldShell,interaction,metrics,roomDetail,disclaimer,tabBar,panel);
const form=el('form',{class:'decision-form',id:'decision-form',onsubmit:advance});
for(const [category,options] of Object.entries(decisions)) {
  const select=el('select',{id:'decision-'+category,name:category,onchange:()=>{selections[category]=select.value;if(activeTab==='agents')renderPanel();}});
  select.append(...options.map(([value,ko,en])=>el('option',{value,text:lang==='ko'?ko:en})));
  select.value=selections[category];form.append(el('label',{},categoryName[category],select));
}
const reason=el('textarea',{id:'founder-reason',maxlength:'2000',placeholder:t('예: 고객 요청이 반복되어 제품 안정화를 먼저 검증한다.','Example: repeated customer feedback suggests testing reliability first.')});
const advanceButton=el('button',{class:'primary',id:'advance-month',type:'submit',text:t('결정 확정 · 1개월 진행 →','Commit decisions · Advance month →')});
form.append(el('label',{class:'reason-label'},t('이번 결정의 이유 / 검증할 가정','Your reason / assumption to test'),reason),advanceButton);
const offer=el('div',{id:'offer'}),endMessage=el('p',{id:'end-message',class:'end-message'});
const decisionSide=el('aside',{class:'decision-sidebar'},el('div',{class:'eyebrow',text:'FOUNDER CONTROL'}),el('h2',{text:t('이번 달의 결정','This month’s decisions')}),el('p',{text:t('여섯 분야에서 하나씩 선택하세요. 확정하면 시장 이벤트와 한 달의 운영 결과가 반영됩니다.','Choose one action per category. Committing applies decisions, a market event and one month of operations.')}),offer,form,endMessage,el('p',{text:t('AI 자문은 참고 정보입니다. 최종 결정은 창업자가 내립니다. 모든 계산은 공개된 코드 규칙을 따릅니다.','Advisors provide perspectives. You make the decisions. All calculations follow published code rules.')}));
app.append(header,status,el('div',{class:'workspace'},sidebar,main,decisionSide),el('footer',{class:'footer'},'ASNM · VENTURE DIGITAL TWIN · RESEARCH PROTOTYPE 2.0', ' · ',el('a',{href:'./README.md',text:t('모델 규칙 · 실행 안내','Model rules & documentation')})));

const workspace=document.querySelector('.workspace');
const entryHost=el('section',{id:'entry-screen',class:'entry-screen',hidden:true});
workspace.before(entryHost);
const entry=createEntry({host:entryHost,lang,
  hasSession:()=>started,readSource:()=>incomingSource||store?.readSource(),
  onStandalone:()=>requestNew(()=>{hideWorld();entry.wizard();}),
  onModule3:loadModule3,onEnter:(state,commit)=>commit?startState(state):showWelcome(state),
  onReview:openSetup,onResume:()=>{clearEntryURL();showWorld();}});
let incomingSource=null;
function hideWorld(){workspace.hidden=true;world?.pause();}
function clearEntryURL(){history.replaceState(null,'',location.pathname+`?lang=${lang}`);}
function showHub(){hideWorld();entry.hub();}
function showWelcome(state){pendingState=validateState(state);hideWorld();entry.welcome(pendingState);}
function resetControls(){
  selections=defaultDecisions();for(const [key,value] of Object.entries(selections))form.elements[key].value=value;
  reason.value='';activeTab='calibration';activeRoom='ceo';arrivedRoom='ceo';walking=false;
}
function showWorld(){
  entry.hide();workspace.hidden=false;render();
  if(!world && !worldShell.querySelector('.fallback')){
    try{world=createWorld(canvas,selectRoom,id=>{arrivedRoom=id;activeRoom=id;walking=false;renderRoom();renderPersona();});world.update(session.state);}
    catch{worldShell.append(el('div',{class:'fallback',text:t('이 환경에서는 3D 화면을 열 수 없습니다. 방 메뉴와 대시보드로 모든 시뮬레이션을 사용할 수 있습니다.','3D is unavailable. All simulation features remain accessible through the room menu and dashboard.')}));}
  }
  world?.resume();world?.update(session.state);renderPersona();render();
}
function startState(state){
  if(conflict){notify(t('다른 탭에서 세션이 바뀌었습니다. 새로고침 후 다시 시작하세요.','Another tab changed the session. Refresh before starting.'));return;}
  session=createSession(validateState(state));started=true;pendingState=null;resetControls();
  world?.dispose();world=null;worldShell.querySelector('.fallback')?.remove();
  notify('');save();clearEntryURL();showWorld();
}
const sessionGuard=el('dialog',{id:'session-guard','aria-labelledby':'guard-heading'});document.body.append(sessionGuard);
function requestNew(next){
  if(conflict){notify(t('다른 탭에서 세션이 바뀌었습니다. 새로고침하거나 현재 기록을 내보내세요.','Another tab changed the session. Refresh or export this tab’s data.'));return;}
  if(!started){next();return;}
  sessionGuard.replaceChildren(el('h2',{id:'guard-heading',text:t('기존 Venture World가 있습니다.','An existing Venture World is available.')}),
    el('p',{text:`${session.state.venture.ventureName} · Month ${session.state.simulation.currentMonth}`}),
    el('p',{text:t('새 시나리오 입장 시 기존 세션이 교체됩니다. 보관하려면 먼저 내보내세요.','Entering a new scenario replaces this session. Export it first if you want to keep it.')}),
    el('div',{class:'entry-actions'},el('button',{id:'guard-continue',text:t('이어가기','Continue'),onclick:()=>{sessionGuard.close();clearEntryURL();showWorld();}}),
      el('button',{id:'guard-export',text:t('내보내기','Export'),onclick:()=>download(JSON.stringify(session,null,2),'ASNM-venture-session.json')}),
      el('button',{id:'guard-new',class:'primary',text:t('새로 시작','Start New'),onclick:()=>{sessionGuard.close();next();}})));
  if(!sessionGuard.open)sessionGuard.showModal();
}
function renderPersona(){
  if(walking){interaction.replaceChildren(el('p',{text:t('창업자가 이동하고 있습니다…','Your founder is walking…')}));return;}
  const s=session.state,v=s.venture;
  const runway=v.runway===null?t('현재 순소진 없음','No current net burn'):`${fmt(v.runway)} ${t('개월','months')}`;
  const text={
    ceo:t('이번 달에는 어떤 가정을 검증할까요? 여섯 분야의 결정을 함께 검토해보세요.','Which assumption will you test this month? Review your six decisions together.'),
    finance:t(`현금 ${money(v.cash,s.currency,lang)}, 순소진 ${money(v.monthlyBurn-v.mrr,s.currency,lang)}. Runway: ${runway}.`,`Cash ${money(v.cash,s.currency,lang)}, net burn ${money(v.monthlyBurn-v.mrr,s.currency,lang)}. Runway: ${runway}.`),
    market:t(`시장수요 ${s.market.demand}/100, 불확실성 ${s.market.uncertainty}/100입니다. 어떤 고객군을 먼저 인터뷰할까요?`,`Demand is ${s.market.demand}/100 and uncertainty ${s.market.uncertainty}/100. Which segment should we interview first?`),
    product:t(`제품 완성도 ${v.productProgress}/100, 기술부채 ${s.operations.technicalDebt}/100입니다. 기능과 안정성 중 무엇을 우선할까요?`,`Product progress is ${v.productProgress}/100; technical debt is ${s.operations.technicalDebt}/100. Features or reliability first?`),
    customer:t(`월 고객유지율 ${v.retention}%, CAC ${money(v.cac,s.currency,lang)}입니다. 가격을 바꾸기 전에 사용 경험을 검토할까요?`,`Monthly retention is ${v.retention}%; CAC is ${money(v.cac,s.currency,lang)}. Shall we review the customer experience before changing price?`),
    team:t(`팀 ${v.teamSize}명, 실행역량 ${v.teamCapacity}/100입니다. 이번 달에 필요한 역할은 무엇인가요?`,`Our team has ${v.teamSize} people and capacity ${v.teamCapacity}/100. Which role would help this month?`),
    investor:t(`현재 Runway: ${runway}. 창업자 지분 ${s.operations.founderEquity}%. 투자유치 결정을 검토하시겠습니까?`,`Current runway: ${runway}. Founder ownership: ${s.operations.founderEquity}%. Would you like to review funding?`)
  };
  const category=rooms.find(r=>r.id===arrivedRoom)?.category;
  interaction.replaceChildren(el('div',{class:'eyebrow',text:t('시나리오 페르소나 · 규칙 기반','SCENARIO PERSONA · RULE-BASED')}),
    el('h3',{text:personas[arrivedRoom].map(p=>p[lang==='ko'?1:0]).join(' · ')}),el('p',{text:text[arrivedRoom]}),
    el('button',{id:'persona-action',text:category?t('관련 결정 검토','Review decision'):t('자문 관점 보기','Review advisor perspectives'),onclick:()=>{
      if(category){const field=form.elements[category];field.focus();field.scrollIntoView({block:'center',behavior:'smooth'});}
      else{activeTab='agents';renderPanel();panel.scrollIntoView({block:'start',behavior:'smooth'});}
    }}));
}

function save() {
  try {if(!store) throw new Error('Storage unavailable');store.save(session);return true;}
  catch {notify(t('브라우저 저장에 실패했습니다. 새로고침 전에 JSON을 내보내세요. 현재 화면에서는 계속 실행할 수 있습니다.','Browser storage failed. Export JSON before refreshing; this session can still run in memory.'));return false;}
}
function render() {
  const s=session.state,v=s.venture;
  document.getElementById('export-json').disabled=!started;
  title.textContent=v.ventureName;
  monthBadge.textContent=`MONTH ${String(s.simulation.currentMonth).padStart(2,'0')} / 60`;
  source.textContent=`${s.provenance?.source==='module3'?t('Module 3에서 이어짐','Connected from Module 3'):t('시나리오 상태','Scenario state')} · ${s.currency} · ${v.industry||'Venture'} · ${t('모델','Model')} ${s.modelVersion}`;
  document.getElementById('seed-label').textContent=`SEED ${s.simulation.seed}`;
  dashboard(metrics,s,session.history.at(-1)?.stateBefore,lang);
  world?.update(s);
  renderRoom();renderPersona();renderPanel();
  const pending=s.operations.offer;
  offer.className=pending?'offer':'';
  offer.textContent=pending ? t(`투자 제안: ${money(pending.amount,s.currency,lang)} / 지분 ${pending.equity}%. ${pending.expiresMonth}개월차 말 만료.`, `Offer: ${money(pending.amount,s.currency,lang)} for ${pending.equity}% equity. Expires at end of month ${pending.expiresMonth}.`) : '';
  const funding=form.elements.fundraising;
  for(const option of funding.options) option.disabled=['accept','reject'].includes(option.value)?!pending:option.value==='attempt'?!!pending:false;
  if(funding.selectedOptions[0].disabled){funding.value='bootstrap';selections.fundraising='bootstrap';}
  advanceButton.disabled=!started||conflict||v.cash<=0||s.simulation.currentMonth>=60;
  endMessage.textContent=v.cash<=0?t('현금이 소진되어 시나리오가 종료되었습니다. 기록을 내보내고 새 가정을 검토하세요.','Scenario ended: cash depleted. Export the log and review new assumptions.'):s.simulation.currentMonth>=60?t('60개월 시나리오를 완료했습니다. 리포트에서 결과를 확인하세요.','60-month scenario complete. Review your report.'):'';
}
function selectRoom(id) {
  activeRoom=id;walking=!!world;renderRoom();renderPersona();
  if(world)world.goToRoom(id);else{arrivedRoom=id;walking=false;renderPersona();}
  const category=rooms.find(r=>r.id===id)?.category;
  if(category) {const select=document.getElementById('decision-'+category);select.focus({preventScroll:true});}
}
function renderRoom() {
  const r=rooms.find(r=>r.id===activeRoom),s=session.state,v=s.venture;
  document.querySelectorAll('[data-room]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.room===activeRoom));
  const texts={ceo:t('여섯 분야의 결정을 확정하면 1개월이 진행됩니다. 아래 가정 비교와 AI 자문을 먼저 확인하세요.','Commit all six decisions to advance one month. Review calibration and advisor perspectives below.'),finance:`Cash ${money(v.cash,s.currency,lang)} · Burn ${money(v.monthlyBurn,s.currency,lang)} · Net burn ${money(v.monthlyBurn-v.mrr,s.currency,lang)} · Runway ${fmt(v.runway)}`,market:`Demand ${s.market.demand} · Growth ${s.market.marketGrowth}%/yr · Competition ${s.market.competition} · Uncertainty ${s.market.uncertainty}`,product:`Product ${v.productProgress}/100 · Technical debt ${s.operations.technicalDebt}/100`,customer:`Monthly retention ${v.retention}% · CAC ${money(v.cac,s.currency,lang)} · Price ×${fmt(s.operations.priceMultiplier)}`,team:`Team ${v.teamSize} · Capacity ${v.teamCapacity}/100`,investor:t(`창업자 지분 ${s.operations.founderEquity}%. 투자유치 시도 후 제안을 수락/거절합니다.`,`Founder ownership ${s.operations.founderEquity}%. Seek funding, then accept or reject offered terms.`)};
  roomDetail.replaceChildren(el('h3',{text:r.name}),el('div',{text:texts[activeRoom]}));
}
async function advance(event) {
  event.preventDefault();if(advanceButton.disabled)return;
  try {
    advanceButton.disabled=true;
    const result=simulateMonth(session.state,selections,reason.value,new Date().toISOString());
    session={...session,state:result.state,history:[...session.history,result.log]};
    notify(t(`Month ${result.log.month} 완료 · ${result.log.event.ko} · 아래 결정 기록에서 변화 원인을 확인하세요.`,`Month ${result.log.month} complete · ${result.log.event.en} · Inspect the decision log for explanations.`));
    save();reason.value='';activeTab='timeline';render();
  } catch(error) {notify(error.message);render();}
}
function renderPanel() {
  for(const b of tabBar.children)b.setAttribute('aria-selected',b.id==='tab-'+activeTab);
  panel.setAttribute('aria-labelledby','tab-'+activeTab);panel.replaceChildren();
  const s=session.state;
  if(activeTab==='calibration') {
    panel.append(el('div',{class:'cal-grid'},...calibrate(s).map(c=>{
      const names={resilience:t('생존 기대 vs 회복력 점수','Survival belief vs resilience score'),growth:t('연 시장성장률','Annual market growth'),demand:t('시장수요 지수','Market demand index')};
      return el('article',{class:'cal-card'},el('h4',{text:names[c.id]}),el('div',{class:'cal-row'},t('창업자 초기 예상','Founder prediction'),el('b',{text:c.expected===null?t('미입력','Not entered'):fmt(c.expected)})),el('div',{class:'cal-row'},'Simulation Estimate',el('b',{text:fmt(c.estimate)})),el('div',{class:'cal-gap mono',text:c.gap===null?'—':`${c.gap>0?'+':''}${fmt(c.gap)}`}),el('div',{class:'small muted',text:c.comparable?t('예상 − 모델 · '+c.unit,'Prediction − model · '+c.unit):t('척도 간 차이 · 확률 오차 아님','Scale contrast · not probability error')}),el('div',{class:'cal-bar'},el('span',{style:`width:${Math.max(0,Math.min(100,c.estimate))}%`})));
    })),el('p',{class:'notice',text:t('회복력 점수 = Runway 35% + 유지율 20% + 제품 15% + 팀 역량 15% + 수요 15%. 생존 기대와의 차이는 학습용 척도 비교입니다. 시장성장률은 연간 시장 성장 가정을 비교하며, MRR 성장률과 섞지 않습니다.','Resilience = runway 35% + retention 20% + product 15% + team capacity 15% + demand 15%. Its difference from a survival belief is a learning contrast between scales. Growth compares annual market assumptions, not MRR growth.')}));
  }
  if(activeTab==='timeline') {
    if(!session.history.length)panel.append(el('p',{class:'muted small',text:t('첫 달의 결정을 확정하면 기록이 나타납니다.','Commit the first month to create your decision log.')}));
    for(const [i,log] of [...session.history].reverse().entries()) {
      const details=el('details',{class:'timeline-item',open:i===0},el('summary',{text:`MONTH ${log.month} · ${log.event[lang]} · Cash ${money(log.stateAfter.venture.cash,s.currency,lang)}`}),el('div',{class:'chips'},...log.decisions.map(d=>el('span',{class:'chip',text:`${categoryName[d.category]}: ${actionName(d.category,d.action)}`}))),el('p',{text:t('당시 이유: ','Reason: ')+(log.founderReason||t('미기록','Not recorded'))}),changeTable(log,lang),el('p',{class:'small muted',text:t(`운영: 신규 고객 ${log.operating.acquiredCustomers}명 × 기본 ARPU × 가격배수 → 신규 MRR ${money(log.operating.newMRR,s.currency,lang)}. 유지 MRR ${money(log.operating.retainedMRR,s.currency,lang)}. 현금 = 이벤트 후 현금 + 월말 MRR − 월 비용. 자금 부족액 ${money(log.operating.cashShortfall,s.currency,lang)}.`,`Operations: ${log.operating.acquiredCustomers} acquired customers × base ARPU × price multiplier → new MRR ${money(log.operating.newMRR,s.currency,lang)}. Retained MRR ${money(log.operating.retainedMRR,s.currency,lang)}. Cash = post-event cash + month-end MRR − monthly burn. Shortfall ${money(log.operating.cashShortfall,s.currency,lang)}.`)}));
      const decisionDetails=el('details',{},el('summary',{text:t('결정별 즉시 변화 보기','Inspect each decision’s immediate effects')}));
      for(const d of log.decisions) {
        const changes=Object.keys(d.stateBefore).filter(k=>typeof d.stateBefore[k]==='number' && d.stateBefore[k]!==d.stateAfter[k]).map(k=>`${k}: ${fmt(d.stateBefore[k])} → ${fmt(d.stateAfter[k])}`);
        for(const k of ['demand','competition','uncertainty']) if(d.marketBefore[k]!==d.marketAfter[k])changes.push(`${k}: ${fmt(d.marketBefore[k])} → ${fmt(d.marketAfter[k])}`);
        for(const k of ['technicalDebt','founderEquity','marketingBudget']) if(d.operationsBefore[k]!==d.operationsAfter[k])changes.push(`${k}: ${fmt(d.operationsBefore[k])} → ${fmt(d.operationsAfter[k])}`);
        if(JSON.stringify(d.operationsBefore.offer)!==JSON.stringify(d.operationsAfter.offer))changes.push(t('투자 제안 상태 변경','Investment offer changed'));
        decisionDetails.append(el('p',{text:`${actionName(d.category,d.action)} — ${changes.join(' · ')||t('즉시 변화 없음; 현재 방침 유지','No immediate change; current policy maintained')}`}));
      }
      details.append(decisionDetails);panel.append(details);
    }
  }
  if(activeTab==='agents') {
    const request=++advisorRequest;
    panel.append(el('p',{class:'muted small',text:t('API 키 없이 동작하는 규칙 기반 자문 · 제안은 결정을 자동 실행하지 않습니다.','Rule-based advisory fallback · no API key · advice never executes a decision.')}));
    provider.advise(s,selections,lang).then(advice=>{
      if(activeTab!=='agents'||request!==advisorRequest)return;
      panel.append(el('div',{class:'agent-grid'},...advice.map(a=>el('article',{class:'agent-card'},el('h4',{text:`AI ${a.role}`}),...['observation','risk','consequence','question'].map(k=>el('p',{},el('strong',{text:({observation:t('관찰','Observation'),risk:t('리스크','Risk'),consequence:t('가능한 결과','Possible consequence'),question:t('창업자에게 묻기','Question for founder')})[k]}),a[k]))))));
    }).catch(error=>notify(error.message));
  }
  if(activeTab==='reflection') {
    const due=reflections(session);
    panel.append(el('p',{class:'muted small',text:t('각 결정의 3개월·6개월 후 돌아봅니다. 결과에는 이후 결정과 시장 이벤트도 영향을 줍니다. 한 결정의 인과효과로 해석하지 마세요.','Review decisions after 3 and 6 months. Outcomes also reflect later decisions and market events; they do not isolate causality.')}));
    if(!due.length)panel.append(el('p',{text:t('이번 달에 도래한 회고가 없습니다. 첫 결정의 회고는 Month 4에 열립니다.','No review is due this month. The first decision review opens in Month 4.')}));
    for(const item of due) {
      const input=el('textarea',{maxlength:'2000','aria-label':t('수정할 가정','Assumption to revise')});input.value=session.reflections[item.id]||'';
      panel.append(el('article',{class:'reflection-card'},el('h3',{text:`MONTH ${item.month} → +${item.age} MONTHS`}),el('div',{class:'chips'},...item.decisions.map(d=>el('span',{class:'chip',text:actionName(d.category,d.action)}))),el('p',{text:t('당시 기대: ','You expected: ')+(item.reason||t('미기록','Not recorded'))}),...Object.entries(item.changes).map(([key,val])=>el('p',{class:'mono small',text:`${key}: ${fmt(val.before)} → ${fmt(val.after)}${val.before!==null&&val.after!==null?` (${val.after-val.before>=0?'+':''}${fmt(round(val.after-val.before))})`:''}`})),el('label',{},t('지금 어떤 가정을 수정하겠습니까?','What assumption would you revise now?'),input),el('button',{text:t('회고 저장','Save reflection'),onclick:()=>{if(conflict)return;session.reflections[item.id]=input.value;if(save())notify(t('회고를 저장했습니다.','Reflection saved.'));renderPanel();}})));
    }
    for(const [id,text] of Object.entries(session.reflections))panel.append(el('details',{class:'timeline-item'},el('summary',{text:t('저장된 회고 · ','Saved reflection · ')+id}),el('p',{text})));
  }
  if(activeTab==='report') {
    const raw=session.initialState.provenance?.module3;
    if(raw)panel.append(el('button',{id:'module3-report',text:t('Module 3 전체 리포트 보기','View Module 3 Full Report'),onclick:()=>{
      const url=new URL(lang==='en'?'../en/':'../',location.href);url.searchParams.set('view','module3-report');
      url.hash='report='+encodeURIComponent(JSON.stringify(raw));location.assign(url.href);
    }}));
    panel.append(el('h3',{text:t('실험 리포트와 재현 데이터','Research report & reproducible data')}),el('p',{class:'muted small',text:t('JSON에는 초기 가정, seed, 매월 결정 전후 상태, 이벤트, 이유, 회고가 포함됩니다. 가져오면 동일 모델로 기록을 재실행하여 검증합니다.','JSON includes initial assumptions, seed, decision states, events, reasons and reflections. Imports replay the history with the same model to verify consistency.')}),el('div',{class:'report-actions'},el('button',{class:'primary',text:t('리포트 내려받기 (.md)','Download report (.md)'),onclick:()=>download(reportMarkdown(session),'ASNM-venture-report.md','text/markdown')}),el('button',{text:t('실험 데이터 (.json)','Experiment data (.json)'),onclick:()=>download(JSON.stringify(session,null,2),'ASNM-venture-session.json')})),el('details',{class:'source-notes'},el('summary',{text:t('데이터 출처와 초기 가정','Data provenance & initial assumptions')}),el('ul',{},...(s.provenance?.notes||[]).map(n=>el('li',{text:n})))));
  }
}

const setup=el('dialog',{id:'setup-dialog','aria-labelledby':'setup-heading'});document.body.append(setup);
const fieldSpecs=[
  ['venture.cash','현금','Cash',0,1e15],['venture.monthlyBurn','월 총비용','Monthly burn',0,1e13],['venture.mrr','월 반복매출','MRR',0,1e13],['venture.cac','고객획득비','CAC',1,1e10],['venture.retention','월 고객유지율 (%)','Monthly retention (%)',0,100],['venture.teamSize','팀 규모','Team size',1,100],['venture.teamCapacity','팀 실행역량 (0–100)','Team capacity (0–100)',0,100],['venture.productProgress','제품 완성도 (0–100)','Product progress (0–100)',0,100],['market.demand','시장수요 (0–100)','Demand (0–100)',0,100],['market.marketGrowth','연 시장성장률 (%)','Annual market growth (%)',-100,100],['market.competition','경쟁강도 (0–100)','Competition (0–100)',0,100],['market.uncertainty','불확실성 (0–100)','Uncertainty (0–100)',0,100],['founder.riskTolerance','위험감수 가정 (0–100)','Risk tolerance assumption',0,100],['founder.marketConfidence','시장확신 가정 (0–100)','Market confidence assumption',0,100],['founder.executionReadiness','실행준비 가정 (0–100)','Execution readiness assumption',0,100],['assumptions.expectedSurvival','초기 생존 기대 (%)','Initial survival belief (%)',0,100],['assumptions.expectedGrowth','예상 연 시장성장률 (%)','Expected annual market growth (%)',-100,100],['assumptions.expectedDemand','예상 수요지수 (선택)','Expected demand (optional)',0,100],['simulation.seed','재현 Seed','Reproducibility seed',0,4294967295]
];
function openSetup(input) {
  const draft=clone(input),isM3=draft.provenance?.source==='module3';
  const setupForm=el('form',{id:'setup-form'}),grid=el('div',{class:'setup-grid'}),error=el('p',{id:'setup-error',class:'error',role:'alert'});
  setup.replaceChildren(el('div',{class:'eyebrow',text:isM3?'MODULE 03 → MODULE 04':'NEW SCENARIO'}),el('h2',{id:'setup-heading',text:t('초기 상태를 검토하고 시작하세요','Review your initial state')}),el('p',{text:t(`금액 단위: ${draft.currency}. 실제 입력과 연구용 가정을 구분하여 검토하세요. 수정 후 환영 화면에서 확인하고 입장할 때 초기 상태를 확정합니다.`,`Currency: ${draft.currency}. Review source inputs and scenario assumptions. Changes are reviewed on the welcome screen before the new scenario is committed.`)}));
  if(isM3)setup.append(el('p',{class:'notice',text:t('회사명·자본금·업종·BARL 예상은 Module 3에서 전달됩니다. 팀은 채용 계획을 초기 인원으로 가정합니다. 나머지 운영·시장 값은 검증되지 않은 기본값입니다. 예상 시장성장률을 실제 시장성장률로 사용하지 않습니다.','Company, capital, industry and BARL predictions come from Module 3. Planned hiring is treated as initial staffing. Other operating/market values are unvalidated defaults. Expected market growth is not treated as observed growth.')}));
  const name=el('input',{name:'ventureName',required:true,maxlength:'120',value:draft.venture.ventureName});
  grid.append(el('label',{class:'wide'},t('벤처 이름','Venture name'),name));
  for(const [path,ko,en,min,max] of fieldSpecs) {
    const [section,key]=path.split('.');
    const value=draft[section][key];
    const input=el('input',{type:'number',name:path,value:value??'',min,max,step:['teamSize','seed'].includes(key)?'1':'any',required:section!=='assumptions'});
    grid.append(el('label',{},lang==='ko'?ko:en,input));
  }
  const actions=el('div',{class:'setup-actions'},el('button',{type:'button',text:t('취소 / 현재 화면','Cancel / current view'),onclick:()=>setup.close()}),el('button',{class:'primary',type:'submit',id:'start-simulation',text:t('가정 확정 · 시뮬레이션 시작','Commit assumptions · Start simulation')}));
  setupForm.append(grid,error,actions);setup.append(setupForm);
  setupForm.addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const next=clone(draft);next.venture.ventureName=name.value.trim();
      for(const [path] of fieldSpecs){const [section,key]=path.split('.');const value=setupForm.elements[path].value;next[section][key]=value===''?undefined:Number(value);}
      // Recalculate derived operating defaults when editing a new initial scenario.
      next.operations.marketingBudget=Math.min(next.venture.monthlyBurn,next.venture.monthlyBurn*.15);
      if(next.provenance?.source==='module3')next.provenance.reviewed=true;
      next.provenance??={source:'import',notes:[]};
      next.provenance.reviewChanges=fieldSpecs.filter(([p])=>{const[a,b]=p.split('.');return next[a][b]!==draft[a][b];}).map(([p])=>{const[a,b]=p.split('.');return {field:p,source:draft[a][b]??null,reviewed:next[a][b]??null};});
      setup.close();showWelcome(validateState(next));
    }catch(err){error.textContent=err.message;}
  });
  if(!setup.open)setup.showModal();
}
function loadModule3() {
  try {const initial=incomingSource||store?.readSource();if(!initial)throw new Error(t('저장된 Module 3 결과가 없습니다. 기존 앱에서 완료하거나 보고서 JSON을 가져오세요.','No saved Module 3 result. Complete the original app or import its report JSON.'));requestNew(()=>showWelcome(initial));}
  catch(error){notify(error.message);}
}
importInput.addEventListener('change',async()=>{
  const file=importInput.files[0];if(!file)return;
  try {
    if(file.size>8*1024*1024)throw new Error('JSON file exceeds 8 MB');
    const result=decodeImport(await file.text());
    if(result.session) {
      if(started && !confirm(t('현재 세션을 가져온 세션으로 바꾸시겠습니까? 필요한 기록은 먼저 내보내세요.','Replace this session with the imported one? Export existing history first.')))return;
      session=result.session;started=true;conflict=false;notify(t('동일 모델로 기록을 재실행하여 복구했습니다.','Replayed and restored the session with the same model.'));save();setup.close();clearEntryURL();resetControls();world?.dispose();world=null;showWorld();
    }else requestNew(()=>showWelcome(result.state));
  }catch(error){notify(t('가져오기 실패: ','Import failed: ')+error.message);}finally{importInput.value='';}
});
window.addEventListener('storage',event=>{
  if(event.key===SESSION_KEY || event.key===null){conflict=true;render();notify(t('다른 탭에서 세션이 변경되었습니다. 현재 탭 기록을 JSON으로 내보내거나 새로고침하여 이어가세요.','Another tab changed this session. Export this tab’s data or refresh to continue.'));}
});

async function boot() {
  hideWorld();
  let stored=null,initial=null;
  try{store=new StateStore(localStorage);stored=store.load();}catch(error){notify(t('저장된 상태를 읽을 수 없습니다: ','Cannot load stored state: ')+error.message);}
  const query=new URLSearchParams(location.search),hash=location.hash;
  if(hash.startsWith('#state=')){
    history.replaceState(null,'',location.pathname+location.search);
    try{initial=decodeImport(decodeURIComponent(hash.slice(7))).state;}catch(error){notify(t('직접 전달 실패: ','Direct transfer failed: ')+error.message);}
  }
  if(!initial && query.get('source')==='module3'){
    try{initial=store?.readSource();}catch(error){notify(error.message);}
  }
  incomingSource=initial;
  if(stored){session=stored;started=true;}
  render();
  if(document.readyState!=='complete')await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
  entry.hub();
  if(initial)requestNew(()=>showWelcome(initial));
  else if(query.get('entry')==='standalone')requestNew(()=>entry.wizard());
  else if(query.get('entry')==='hub')entry.hub();
  else if(stored)showWorld();
}
boot().catch(error=>notify(error.message));
window.addEventListener('pagehide',event=>{if(!event.persisted)world?.dispose();});
