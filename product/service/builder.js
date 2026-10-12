import {builder as originalBuilder} from '../ecosystem/builder.js';
import {steps,validateBarl} from '../ecosystem/model.js';
import {buildState} from '../trusted/model.js';
import {baselineMetrics,profileFrom} from '../twin/model.js';
import {companyPanel,ecosystemPanel,barlSummary} from '../ecosystem/ui.js';
import {readinessEditor,riskOverview} from '../journey/readiness-ui.js';
import {sectorGroups} from '../journey/topics.js';
import {catalog} from './catalog.js';
import {designPicker,designSummary,paintIcon} from './choices.js';
import {el,button,card,details,field,row,note} from '../trusted/ui.js';
export function builder(c){
 const {host,project:p,t,lang}=c,b=p.company,temp=el('div');originalBuilder({...c,host:temp});const step=b.step;
 const take=id=>{const n=temp.querySelector('#'+id);return n?.matches('input,textarea,select')?n.closest('label'):n;};
 const optional=(ko,en,...nodes)=>details(t(ko,en),...nodes.filter(Boolean));
 const set=(key,value)=>{b[key]=value;c.save();c.refreshContext?.();};
 const text=(id,ko,en)=>{const node=take(id);if(node&&ko){const input=node.querySelector('input,textarea');node.childNodes[0].textContent=t(ko,en);if(input)input.setAttribute('aria-label',t(ko,en));}return node;};
 host.classList.add('service-builder');host.dataset.step=String(step);
 const rail=el('nav',{class:'service-steps','aria-label':t('회사 만들기 단계','Venture builder steps')});
 steps.forEach(([ko,en],i)=>rail.append(button('',()=>{b.step=i;c.save();c.rerender();},{class:'service-step','aria-current':i===step?'step':false,'data-step':i})));
 [...rail.children].forEach((btn,i)=>btn.append(el('span',{class:'service-step-dot',text:String(i+1)}),el('span',{text:t(...steps[i])})));
 host.append(rail,el('header',{class:'service-step-heading'},el('span',{class:'journey-eyebrow',text:`STEP ${step+1} / 6`}),el('h1',{text:t(...steps[step])}),el('p',{text:t(['떠오르는 걱정을 골라보세요. 정답은 없어요.','어디서, 어떤 이름으로 시작할까요?','어떤 사업을, 어떤 도구로 만들어볼까요?','혼자 다 하지 않아도 괜찮아요. 함께할 역할을 골라요.','감당할 비용과 함께 일할 방식을 정해요.','내 선택을 확인하고 다음 행동으로 이어가세요.'][step],['Choose a concern. There is no right answer.','Where will you start, and what will you call it?','Choose a field and the tools you want to use.','You do not have to do everything alone. Choose the roles you need.','Choose affordable costs and a way of working.','Review your choices and take the next step.'][step])})));
 if(step===0){
  host.append(card(el('h2',{text:t('🛡️ 만약 잘 안 된다면, 무엇 때문일까요?','🛡️ What might get in the way?')}),text('tw-barl-failReason1','먼저 살펴볼 한 가지','One thing to look at first'),optional('다른 걱정도 더 고르기','Add other concerns',take('tw-barl-failReason2'),take('tw-barl-failReason3'))));
  host.append(optional('내 예상 숫자 · 알고 있다면','My expectations · if known',note(t('내 생각을 기록하는 칸입니다. 실제 성공 확률을 뜻하지 않아요.','These record your expectations, not actual success probabilities.')),take('tw-barl-survival'),take('tw-barl-growth'),take('tw-barl-months')));
  const habits=temp.querySelector('input.tw-inline-check')||temp.querySelector('.tw-inline-check');if(habits)host.append(optional('판단할 때 나의 습관','My decision habits',habits.closest('details')));
 }
 if(step===1){
  const region=text('tw-region','다른 지역 · 직접 쓰거나 말하기','Another location · type or speak'),regionGrid=el('div',{class:'service-choice-grid'}),custom=optional('기타 지역','Other location',region);custom.open=!!b.region&&!catalog.region.some(x=>x[0]===b.region);
  for(const [id,icon,ko,en] of catalog.region)regionGrid.append(paintIcon(button('',()=>{region.querySelector('input').value=id;set('region',id);regionGrid.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.region===id)));},{class:'service-choice','data-region':id,'aria-pressed':b.region===id}),icon,t(ko,en)));
  regionGrid.append(paintIcon(button('',()=>{custom.open=true;region.querySelector('input').focus();},{class:'service-choice'}),'✏️',t('기타','Other')));
  host.append(card(text('tw-company-name','회사 이름 · 나중에 정해도 괜찮아요','Company name · you can decide later'),el('h3',{text:t('📍 시작할 지역','📍 Choose a location')}),regionGrid,custom));
  const value=el('output',{class:'service-money',text:b.cash!==undefined&&b.cash!==''?Number(b.cash).toLocaleString()+t('원',' KRW'):t('아직 정하지 않았어요','Not set yet')}),range=el('input',{type:'range',min:0,max:1000000000,step:1000000,value:Math.min(1000000000,Number(b.cash)||0),'aria-label':t('시작 자금 선택 · 원','Starting cash · KRW'),oninput:e=>{set('cash',e.target.value);value.textContent=Number(e.target.value).toLocaleString()+t('원',' KRW');exact.value=e.target.value;}}),exact=el('input',{id:'service-start-cash',type:'number',min:0,max:1e13,value:b.cash??'','aria-label':t('정확한 시작 자금','Exact starting cash'),oninput:e=>{set('cash',e.target.value);range.value=Math.min(1000000000,Number(e.target.value)||0);value.textContent=e.target.value===''?t('아직 정하지 않았어요','Not set yet'):Number(e.target.value).toLocaleString()+t('원',' KRW');}});
  host.append(optional('💰 시작 자금도 정해볼까요?','💰 Set starting cash?',range,value,el('label',{},t('정확한 금액 · 원','Exact amount · KRW'),exact)),optional('회사 소개·형태 더하기','Add company details',take('tw-kind'),take('tw-vision'),take('tw-legal')));
 }
 if(step===2){
  const industry=field('tw-industry',t('기타 분야 · 직접 입력','Other sector · type or speak'),b.industry,v=>{set('industry',v);if(!b.idea)set('idea',v);}),other=optional('기타 분야','Other sector',industry),sectors=el('div',{class:'service-choice-grid service-sectors'});
  for(const [,icon,,,items] of sectorGroups)for(const [id,ko,en] of items)sectors.append(paintIcon(button('',()=>{const value=t(ko,en);set('industry',value);industry.querySelector('input').value=value;if(!b.idea)set('idea',value);sectors.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.industry===id)));},{class:'service-choice','data-industry':id,'aria-pressed':[ko,en].includes(b.industry)}),icon,t(ko,en)));
  sectors.append(paintIcon(button('',()=>{other.open=true;industry.querySelector('input').focus();},{class:'service-choice'}),'✏️',t('기타','Other')));
  host.append(card(el('h2',{text:t('💡 사업 분야','💡 Venture field')}),sectors,other,optional('아이디어·고객을 더 구체적으로','Describe the idea & customer',field('tw-idea',t('아이디어','Idea'),b.idea,v=>set('idea',v)),field('tw-customer',t('대상 고객','Customers'),b.customer,v=>set('customer',v)),take('tw-business-difference'))),card(designPicker(c,'technology')),optional('만드는 방식·제품·수익 구조','Build approach, product & revenue',take('tw-stage'),take('tw-technology'),take('tw-product'),take('tw-business-model'),take('tw-unitPrice'),take('tw-monthlyUnits'),take('tw-monthlyRevenue'),take('tw-variableCostRate')));
 }
 if(step===3)host.append(card(take('tw-team'),designPicker(c,'talent'),note(t('영입하고 싶은 역할입니다. 선택만으로 인원이나 비용이 늘어나지 않아요.','These are roles you would like to add. Selection alone does not increase headcount or costs.'))),optional('역할 우선순위·채용 계획·메모','Priorities, hiring plans & notes',take('tw-team-priority'),take('tw-hiring'),take('tw-team-notes')));
 if(step===4)host.append(card(take('tw-funds')),optional('보유 현금·월 고정비·매출 입력','Enter cash, fixed costs & revenue',note(t('모르는 금액은 비워 두세요. 고정비와 매출에 비례하는 변동비는 나누어 입력합니다.','Leave unknown amounts blank. Keep fixed costs separate from sales-linked variable costs.')),take('tw-cash'),take('tw-burn'),take('tw-mrr')),card(designPicker(c,'culture')),optional('운영 정책·판매 방식·걱정 더하기','Policies, channels & concerns',take('tw-welfare'),take('tw-revenue'),take('tw-risk')));
 if(step===5){
  host.append(designSummary(p,lang),riskOverview(p,lang,{useDraft:true}));
  const entry=temp.querySelector('#tw-enter-world');if(entry){const final=entry.closest('.tw-card');const s=buildState(b),m=baselineMetrics(s,profileFrom(p,s)).twinMetrics;host.append(card(el('h2',{text:t('🚀 내 회사로 선택을 실험해볼까요?','🚀 Try decisions in your venture')}),el('div',{class:'service-financial-summary'},...[[t('시작 현금','Starting cash'),s.venture.cash.toLocaleString()+' KRW'],[t('월 고정비','Monthly fixed costs'),s.venture.monthlyBurn.toLocaleString()+' KRW'],[t('자금이 버틸 기간','Cash runway'),m.runway===null?t('순현금소진 없음','No net burn'):m.runway+t('개월',' months')]].map(([label,value])=>el('div',{},el('small',{text:label}),el('strong',{text:value})))),note(t('빈 금액에는 시작 가정이 들어갑니다. 아래에서 확인·수정한 뒤 입장하세요.','Missing amounts use starting assumptions. Review and edit them below before entering.')),optional('시작 금액의 근거·상세 설정','Starting amounts & detailed settings',...([...final.children].filter(n=>n!==entry))),entry));}else host.append(note(t('사업 설계에서 분야나 아이디어를 먼저 골라주세요.','Choose a field or idea in Business design first.')));
  host.append(optional('내 예상·판단 기록','My expectations & decisions',barlSummary(p,lang)),companyPanel(c,2),ecosystemPanel(c));
 }
 if(step<5)host.append(optional('준비 상태 체크 · 선택 사항','Readiness check · optional',readinessEditor(c,[['founder'],['demand'],['technology','governance'],['team'],['finance','operations']][step])));
 const risk=temp.querySelector('[data-builder-risk]');if(risk?.textContent)host.append(optional('이 단계에서 챙길 점','A useful check for this step',risk));
 host.append(row(button(t('← 이전','← Back'),()=>{b.step=Math.max(0,step-1);c.save();c.rerender();},{disabled:step===0}),step<5?button(t('다음 단계 →','Next step →'),()=>{try{validateBarl(p.barl);b.step=step+1;if(c.save()!==false)c.rerender();else b.step=step;}catch{c.notify(t('예상 수치의 범위를 확인해 주세요. 모르는 값은 비워도 됩니다.','Check the estimate ranges. Unknown values may stay blank.'));}},{id:'tw-builder-next',class:'tw-primary'}):button(t('내 창업 준비 리포트','My venture readiness report'),()=>c.go('report'),{class:'tw-primary'})));
}
