import {el,money,fmt} from '../module4/ui/dom.js';
import {decisionMoment,actionPlan,choicesFor} from './experience.js';
import {decisions} from '../module4/simulation/DecisionEngine.js';

/** A presentation-only walkthrough. The existing engine remains the sole state writer. */
export function renderGuidedDemo({host,session,lang,stage,turnIndex,selected,team,busy,conflict,onStage,onTurn,onChoose,onCommit,onWorkspace,onRestart,mountWorld,home,startOwn}){
 const t=(ko,en)=>lang==='ko'?ko:en,s=session.state;
 const button=(text,fn,id='',primary=false)=>el('button',{type:'button',text,onclick:fn,id,class:primary?'p-primary':''});
 const stages=['intro','choice','discussion','summary','result','action'];
 const labels=[t('입장','Arrive'),t('선택','Choose'),t('팀 회의','Meet'),t('결정','Decide'),t('변화','Outcome'),t('다음 행동','Act')];
 const shell=el('section',{class:'p-demo-stage p-fade','data-demo-stage':stage});
 host.append(el('div',{class:'p-demo-top'},el('a',{href:home,text:t('← 처음으로','← Home')}),el('span',{text:t('3분 데모 · LearnLoop AI','3-minute demo · LearnLoop AI')})),el('ol',{class:'p-demo-progress','aria-label':t('데모 진행','Demo progress')},...labels.map((label,i)=>el('li',{'aria-current':stages[i]===stage?'step':null,class:i<=stages.indexOf(stage)?'reached':''},el('span',{text:String(i+1)}),label))),shell);
 const heading=(overline,title,desc)=>shell.append(el('p',{class:'p-kicker',text:overline}),el('h1',{tabindex:'-1',text:title}),desc?el('p',{class:'p-demo-description',text:desc}):null);
 if(conflict){heading('SESSION CHANGED',t('다른 탭에서 데모가 바뀌었습니다.','The demo changed in another tab.'),t('새로고침하면 저장된 결정부터 이어집니다.','Reload to continue from the saved decision.'));shell.append(button(t('새로고침','Reload'),()=>location.reload()));return;}
 if(stage==='intro'){
  heading('MISSION 01 / CEO',t('오늘부터 당신이 CEO입니다.','You’re the CEO today.'),t('AI 교육 스타트업 LearnLoop AI. 제품을 더 만들까요, 고객부터 만날까요? 다음 한 달의 방향을 정해보세요.','Welcome to LearnLoop AI, an AI education startup. Build more product or meet more customers? Set the direction for one month.'));
  shell.append(el('div',{class:'p-demo-emblem','aria-hidden':'true',text:'A'}),el('div',{class:'p-demo-stats'},...[[t('남은 자금 기간','Runway'),`${fmt(s.venture.runway)} ${t('개월','months')}`],[t('팀','Team'),`${s.venture.teamSize} ${t('명','people')}`],[t('제품 완성도','Product readiness'),`${fmt(s.venture.productProgress)} / 100`]].map(([label,value])=>el('div',{},el('small',{text:label}),el('b',{text:value})))),button(t('출근하기 →','Enter the office →'),()=>onStage('choice'),'demo-begin',true),el('p',{class:'p-notice',text:t('예시 회사 · 규칙 기반 팀 자문 · 결과는 가정에 따른 시뮬레이션입니다.','Sample venture · rule-based advisors · outcomes are simulations of assumptions.')}));
 }else if(stage==='choice'){
  heading('YOUR FIRST MOVE',t('다음 한 달, 무엇을 먼저 할까요?','What is your first move?'),t('하나를 고르면 팀이 회의실에 모입니다. 아직 실행되지는 않습니다.','Choose a move to bring the team together. Nothing is committed yet.'));
  const icons={developer:'⌘',marketer:'↗',discover:'◎'};
  shell.append(el('div',{class:'p-demo-choices'},...decisionMoment(s).options.map(o=>{const b=button('',()=>onChoose(o));b.className='p-demo-option';b.dataset.option=o.id;b.disabled=busy;b.append(el('span',{class:'p-demo-option-icon','aria-hidden':'true',text:icons[o.id]||'◇'}),el('b',{text:t(o.ko,o.en)}),el('small',{text:t(o.whyKo,o.whyEn)}));return b;})),el('p',{role:'status',text:busy?t('팀이 회의실로 모이고 있습니다…','The team is gathering…'):''}),button(t('← 회사 소개','← Venture brief'),()=>onStage('intro')));
 }else if(stage==='discussion'){
  heading('TEAM MEETING',t('잠깐, 다른 관점도 들어볼까요?','Hear the other side.'),t('팀의 의견을 한 명씩 듣고, 마지막 결정은 직접 내려주세요.','Hear each viewpoint. You make the final decision.'));
  const shell3d=el('section',{class:'p-world p-demo-world'}),canvas=el('canvas',{id:'living-world',tabindex:'0','aria-label':t('회의 중인 팀. 화살표 또는 WASD로 이동','Team meeting. Move with arrows or WASD')}),bubble=el('div',{id:'agent-bubble',class:'p-bubble'},el('strong'),el('span'));
  shell3d.append(canvas,bubble);const talk=el('section',{id:'team-discussion',class:'p-demo-talk','aria-live':'polite'});shell.append(shell3d,talk);mountWorld(canvas,shell3d,bubble);
  let index=Math.min(Math.max(turnIndex||0,0),team.turns.length-1);
  const draw=()=>{const turn=team.turns[index];onTurn(index,turn);talk.replaceChildren(el('div',{class:'p-row p-between'},el('b',{text:`${turn.role} → ${turn.replyTo}`}),el('span',{class:'p-small',text:`${index+1} / ${team.turns.length}`})),el('p',{class:'p-turn',text:turn.text}),el('div',{class:'p-demo-controls'},button(index?t('← 이전 의견','← Previous'):t('← 다른 선택','← Change choice'),()=>{if(index){index--;draw();}else onStage('choice');}),button(index<team.turns.length-1?t('다음 팀원의 의견 →','Next viewpoint →'):t('내 결정 정리하기 →','Review my decision →'),()=>{if(index<team.turns.length-1){index++;draw();}else onStage('summary');},'demo-next-turn',true)));};draw();
  shell.append(el('p',{id:'advisor-mode',class:'p-notice',text:t('규칙 기반 팀 자문 · 실제 AI 호출 없이 체험합니다.','Rule-based team advice · no live AI call in this walkthrough.')}));
 }else if(stage==='summary'){
  heading('FOUNDER DECIDES',t(`「${selected.ko}」, 실행할까요?`,`Commit “${selected.en}”?`),t('팀은 조언합니다. 당신이 결정하면 엔진이 한 달의 변화를 계산합니다.','The team advises. Your decision lets the engine simulate one month.'));
  shell.append(el('div',{class:'p-demo-summary'},...Object.entries(team.summary).map(([key,text])=>el('div',{},el('small',{text:({agreement:t('함께 동의한 점','Agreement'),disagreement:t('갈리는 의견','Disagreement'),tradeoff:t('가장 큰 맞교환','Trade-off'),question:t('스스로에게 물어볼 질문','Your question')})[key]}),el('p',{text})))),el('details',{},el('summary',{text:t('계산에 쓰일 선택과 가정','Choices used by the engine')}),el('ul',{},...Object.entries(choicesFor(s,selected)).map(([category,action])=>el('li',{text:decisions[category].find(d=>d[0]===action)[lang==='ko'?1:2]})))),el('div',{class:'p-demo-controls'},button(t('← 선택 바꾸기','← Change choice'),()=>onStage('choice')),button(t('결정하고 한 달 보내기 →','Commit and advance one month →'),onCommit,'commit-decision',true)));
 }else if(stage==='result'){
  const row=session.history.at(-1),a=row.stateBefore,b=row.stateAfter;
  heading('ONE MONTH LATER',t('당신의 선택이 회사를 바꿨습니다.','Your decision changed the venture.'),t(row.event.ko,row.event.en));
  shell.append(el('div',{id:'decision-outcome',class:'p-demo-results'},...[[t('남은 자금 기간 (개월)','Runway (months)'),a.venture.runway,b.venture.runway],[t('제품 완성도','Product readiness'),a.venture.productProgress,b.venture.productProgress],[t('수요 가정','Demand assumption'),a.market.demand,b.market.demand]].map(([label,from,to])=>el('div',{class:'p-demo-result'},el('small',{text:label}),el('span',{text:fmt(from)+' →'}),el('b',{text:fmt(to)})))),el('p',{class:'p-notice',text:t('선택과 월별 이벤트가 함께 반영된 모델 결과입니다. 실제 성과 예측이 아닙니다.','Modeled results include choices and monthly events; they are not forecasts.')}),button(t('이제 무엇을 하면 좋을까요? →','What should I do next? →'),()=>onStage('action'),'demo-next-action',true));
 }else if(stage==='action'){
  heading('MISSION COMPLETE',t('이번 실험을 실제 행동으로.','Turn this experiment into action.'),t('다음 7일 동안, 이 세 가지부터 시작하세요.','Start with these three actions over the next seven days.'));
  shell.append(el('ol',{class:'p-demo-actions'},...actionPlan(session,lang).week.map((text,i)=>el('li',{},el('span',{'aria-hidden':'true',text:`0${i+1}`}),el('p',{text})))),el('div',{class:'p-demo-controls'},button(t('다른 선택과 비교하기','Compare another choice'),()=>onWorkspace('compare'),'demo-compare'),el('a',{href:startOwn,class:'p-button p-primary',text:t('내 스타트업으로 시작 →','Try my own venture →')})),el('div',{class:'p-row'},button(t('자유롭게 더 실험하기','Explore the full workspace'),()=>onWorkspace('decision'),'demo-workspace'),button(t('데모 다시 시작','Restart demo'),onRestart,'demo-restart')));
 }
 shell.querySelector('h1')?.focus({preventScroll:true});
}
