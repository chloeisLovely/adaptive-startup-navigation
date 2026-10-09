import {copilotView} from './copilot.js';
import {StateStore} from '../module4/state/StateStore.js';
import {el} from '../module4/ui/dom.js';
import {track} from './telemetry.js';
import {routeQuestion} from './question-router.js';
const lang=document.documentElement.lang==='en'?'en':'ko',t=(ko,en)=>lang==='ko'?ko:en;
const root=new URL('../',import.meta.url),world=(problem='',mode='')=>new URL(`module4/?lang=${lang}${problem?'&problem='+problem:''}${mode?'&mode='+mode:''}`,root).href;
const home=document.getElementById('page-home');
const button=(text,fn,cls='')=>el('button',{type:'button',class:cls,text,onclick:fn});
// Keep the original research and module markup intact; the entry screens replace only its presentation.
const legacy=el('div',{hidden:true});while(home.firstChild)legacy.append(home.firstChild);
home.classList.add('asnm-product','p-entry-screen');home.append(legacy);
const moduleInfo=[
 ['m1','📡',t('시장 · 기회 탐색','Market discovery'),t('내 아이디어를 원하는 고객은 누구일까요?','Who needs my idea?'),t('고객 문제와 시장의 수요 신호를 살펴봅니다.','Explore customer problems and demand signals.')],
 ['m2','🧬',t('창업자 DNA','Founder DNA'),t('나는 어떤 방식으로 결정하는 창업자일까요?','How do I make decisions as a founder?'),t('의사결정 스타일과 놓치기 쉬운 가정을 돌아봅니다.','Reflect on decision habits and assumptions.')],
 ['m3a','🚀',t('스타트업 시뮬레이터','Startup simulator'),t('내 사업의 가정과 리스크를 점검해볼까요?','Which venture assumptions need testing?'),t('사업을 구성하고 가정과 리스크를 점검합니다.','Build your venture and examine its assumptions.')],
 ['m4','🌐',t('벤처 디지털 트윈','Venture digital twin'),t('채용·가격·투자, 다른 선택을 하면 달라질까요?','What changes if I hire, reprice or raise funding?'),t('팀과 토론하고 결정에 따른 변화를 실험합니다.','Meet your team and experiment with decisions.')]
];
const journey=el('div',{id:'page-journey',class:'page asnm-product p-entry-screen'}),questions=el('div',{id:'page-questions',class:'page asnm-product p-entry-screen'});
home.after(journey,questions);
const screenTitle=text=>el('h1',{tabindex:'-1',text});
const open=id=>window.showPage(id);
const goModule=(id,question='')=>{
 track('quick_start');
 if(id==='m4') {if(question)try{sessionStorage.setItem('asnm:entry-question',question);}catch{}location.assign(world('priority','quick'));return;}
 open(id);
 if(question){const host=document.getElementById('page-'+id);host.querySelector('.p-entry-question')?.remove();host.prepend(el('p',{class:'p-entry-question',text:t('나의 질문: ','Your question: ')+question}));if(id==='m1')document.getElementById('ai-trend-query').value=question;}
};
const back=()=>button(t('← 처음으로','← Back to start'),()=>open('home'),'p-entry-back');
home.prepend(el('main',{class:'p-entry-shell p-start'},el('p',{class:'p-kicker',text:'ASNM · STARTUP DECISION SIMULATOR'}),screenTitle(t('당신의 스타트업에서\n지금 무엇이 가장 궁금한가요?','What is your next\nstartup question?')),el('div',{class:'p-entry-choices'},
 button(t('전체 창업여정 선택하기','Explore the full journey'),()=>{track('full_journey_start');open('journey');},'p-entry-choice'),
 button(t('지금 고민부터 시작하기','Start with your question'),()=>open('questions'),'p-entry-choice'),
 el('a',{class:'p-entry-choice',id:'demo-start',href:world('','demo'),text:t('3분 데모','3-minute demo'),onclick:()=>track('demo_start')})
)));
journey.append(el('main',{class:'p-entry-shell'},back(),el('p',{class:'p-kicker',text:'YOUR STARTUP JOURNEY'}),screenTitle(t('당신의 창업 여정, 네 번의 발견.','Four steps for your startup journey.')),el('div',{class:'p-module-grid'},...moduleInfo.map(([id,icon,title,,desc],i)=>{const b=button('',()=>goModule(id),'p-module-card');b.dataset.module=id;b.append(el('small',{text:`MODULE 0${i+1}`}),el('span',{class:'p-module-icon','aria-hidden':'true',text:icon}),el('h2',{text:title}),el('p',{text:desc}),el('span',{class:'p-module-arrow','aria-hidden':'true',text:'→'}));return b;})),el('section',{class:'p-journey-prompt'},el('h2',{text:t('모듈 1부터 시작하시겠습니까?','Start with Module 1?')}),button(t('네, 시장 탐색부터 시작할게요 →','Yes, start with market discovery →'),()=>open('m1'),'p-primary'))));
const questionInput=el('textarea',{id:'entry-question',rows:'2',maxlength:'600',required:true,placeholder:t('예: 개발자를 채용하면 자금이 얼마나 버틸까요?','Example: How would hiring affect my runway?')});
const routeStatus=el('p',{id:'question-route-status',role:'status','aria-live':'polite'});
questions.append(el('main',{class:'p-entry-shell'},back(),el('p',{class:'p-kicker',text:'START WITH YOUR QUESTION'}),screenTitle(t('어떤 질문을 함께 풀어볼까요?','Which question shall we explore?')),el('div',{class:'p-question-grid'},...moduleInfo.map(([id,,title,question])=>{const b=button('',()=>goModule(id),'p-question-card');b.dataset.module=id;b.append(el('span',{text:question}),el('small',{text:title+' →'}));return b;})),el('form',{class:'p-question-form',onsubmit:e=>{e.preventDefault();const text=questionInput.value.trim();if(!text){routeStatus.textContent=t('질문을 입력해주세요.','Please enter a question.');return;}const id=routeQuestion(text);if(id)goModule(id,text);else{routeStatus.textContent=t('여러 의미가 있거나 아직 연결하기 어려운 질문입니다. 위의 네 가지 질문 중 가장 가까운 것을 골라주세요.','This could mean several things. Choose the closest question above.');}}},el('label',{for:'entry-question',text:t('또는, 직접 질문해주세요.','Or ask in your own words.')}),questionInput,el('div',{class:'p-row'},el('button',{type:'submit',class:'p-primary',text:t('맞는 단계로 이동 →','Find my starting point →')}),el('small',{text:t('키워드로 연결 · 서버 전송 없음','Local keyword routing · nothing sent')})),routeStatus)));
track('landing_view');
// URL history supports Back/Forward and refresh on each entry screen, without changing the original module functions.
const originalShowPage=window.showPage;
let restoring=false;
window.showPage=function(id){
 if(['home','journey','questions','m1','m2','m3a'].includes(id)&&!restoring){const u=new URL(location);u.hash=id;history.pushState({asnmScreen:id},'',u);}
 originalShowPage(id);
 const title=document.querySelector('#page-'+id+' h1');if(title){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}
};
window.addEventListener('popstate',()=>{const id=location.hash.slice(1)||'home';if(['home','journey','questions','m1','m2','m3a'].includes(id)){restoring=true;window.showPage(id);restoring=false;}});
if(['home','journey','questions','m1','m2','m3a'].includes(location.hash.slice(1))){restoring=true;window.showPage(location.hash.slice(1));restoring=false;}
// Navigation labels describe the user task, while the legacy calculation functions remain intact.
const labels=[t('홈','Home'),t('시장 발견','Discover'),t('창업자 이해','Know yourself'),t('사업 가정 검증','Validate'),t('결정 실험','Simulate'),t('실행 계획','Action plan')];
document.querySelectorAll('.nav-btn').forEach((b,i)=>{if(labels[i])b.textContent=labels[i];});
const nav=el('div',{class:'p-journey-nav','aria-label':t('창업 여정','Founder journey')},...[[t('시장 →','Market →'),'m1'],[t('창업자 →','Founder →'),'m2'],[t('사업 가정 →','Venture assumptions →'),'m3a'],[t('디지털 트윈 ↗','Digital twin ↗'),'m4']].map(([label,id])=>button(label,()=>window.showPage(id))));
document.querySelector('nav')?.after(nav);
const update=()=>{const active=document.querySelector('.page.active'),entry=[home,journey,questions].includes(active);document.body.classList.toggle('asnm-home-active',entry);nav.hidden=entry;document.body.classList.toggle('asnm-journey-active',!entry);nav.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('current',active?.id===['page-m1','page-m2','page-m3a','page-m4'][i]));};
const entryObserver=new MutationObserver(update);document.querySelectorAll('.page').forEach(p=>entryObserver.observe(p,{attributes:true,attributeFilter:['class']}));update();
window.addEventListener('asnm:module3-complete',()=>track('module_complete'));
// Keep original Founder DNA answers/rubric, explain the scope without diagnostic claims.
const founder=document.querySelector('#page-m2 .page-desc');if(founder)founder.textContent=t('10개 질문으로 의사결정 습관을 돌아보세요. 성격 진단이 아닌 자기 점검이며, 유형의 심리측정 타당성은 검증되지 않았습니다.','Reflect on decision habits through ten questions. This is self-reflection, not a personality diagnosis; the typology has not been psychometrically validated.');
const market=document.querySelector('#page-m1 .page-desc');if(market)market.textContent=t('내 아이디어 주변의 고객 문제와 수요 가정을 찾으세요. 기본 카드와 AI 설명은 실시간 시장 증거와 구분해야 합니다.','Explore customer problems and demand assumptions around your idea. Curated cards and AI explanations must be distinguished from live market evidence.');

const founderTitle=document.querySelector('#page-m2 .page-title');if(founderTitle)founderTitle.textContent=t('의사결정 스타일과 주의할 가정','Decision style & assumptions to watch');

const copilotButton=button(t('✧ 결정 도움','✧ Decision help'),()=>{
  let saved=null;try{saved=new StateStore(localStorage).load();}catch{}
  const d=el('dialog',{'aria-label':'ASNM Startup Copilot'},copilotView(saved,lang,document.querySelector('.page.active')?.id,window._founderType||''),button(t('닫기','Close'),()=>{d.close();d.remove();}));d.className='asnm-product';document.body.append(d);d.showModal();
});copilotButton.className='p-copilot-launch';document.body.append(copilotButton);

// Add reflection questions alongside the preserved original questionnaire output.
const reflectionHost=document.getElementById('founder-result');
if(reflectionHost){
 const reflection=el('section',{class:'asnm-product p-card p-stack',style:'text-align:left'},el('h3',{text:t('유형보다, 다음 결정에 사용할 질문','Use the answers to question your next decision')}),el('div',{},el('b',{text:'Strength'}),el('p',{text:t('반복해서 고른 접근을 실제로 잘했던 경험과 연결하세요. 빠른 실행, 분석, 협업 중 무엇이 도움이 되었나요?','Connect recurring choices to an experience where you performed well. Did execution, analysis or collaboration help?')})),el('div',{},el('b',{text:'Watch-outs'}),el('p',{text:t('내 생각을 지지하는 증거만 찾고 있나요? 고객 검증 전에 비용을 크게 늘리려 하나요?','Are you seeking only confirming evidence? Are you scaling spending before validating customers?')})),el('div',{},el('b',{text:'Under pressure'}),el('p',{text:t('시간이나 자금이 부족할 때 기능 개발, 조사, 협상 중 무엇을 먼저 선택할지 점검하세요. 결과는 자기 점검 자료이며 심리 진단이 아닙니다.','When time or cash is scarce, review whether you default to building, researching or negotiating. These questions are self-reflection, not a psychological diagnosis.')})));reflectionHost.append(reflection);
}
