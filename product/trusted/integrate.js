import {founderGallery} from '../v6/founder.js';
import {leaderPanel} from '../ecosystem/ui.js';
import {mountWorkspace,projectURL,adoptLegacy,recordQuickResult,getActiveProject,saveActiveProject} from './workspace.js';
import {el,button,note} from './ui.js';
export function installTrusted(){
 const lang=document.documentElement.lang==='en'?'en':'ko',t=(k,e)=>lang==='ko'?k:e;
 const css=el('link',{rel:'stylesheet',href:new URL('./trusted.css',import.meta.url).href});document.head.append(css);
 const mapping={m1:'market',m2:'founder',m3a:'builder',result:'report'},roots={};
 for(const [id,mode] of Object.entries(mapping)){
  const page=document.getElementById('page-'+id);if(!page)continue;
  const legacy=el('details',{class:'trusted-legacy',id:'trusted-legacy-'+id,hidden:true},el('summary',{text:t(id==='m2'?'빠른 자기이해 · 기존 10문항 열기':'기존 상세 도구 열기',id==='m2'?'Quick check · original ten questions':'Open original detailed tools')}));
  while(page.firstChild)legacy.append(page.firstChild);
  if(id==='m1')legacy.prepend(note(t('기존 카드·AI 설명은 검증된 시장 통계가 아닙니다. 실제 검색 연결이 확인되지 않은 수치·시장 전망은 근거로 사용하지 마세요.','Original cards and AI text are not verified market statistics. Do not treat unsupported figures or forecasts as evidence.')));
  const host=el('div',{id:'trusted-'+mode});page.append(host,legacy);roots[id]=host;
 }
 const intro=document.getElementById('dna-intro');if(intro){intro.classList.add('trusted','journey');intro.replaceChildren(founderGallery({project:getActiveProject(),t,lang}),button(t('나의 유형 찾기 · 10문항 →','Explore my approach · 10 questions →'),()=>window.startDnaQuiz?.(),{class:'tw-primary'}));}
 const original=window.showPage;window.showPage=function(id){original(id);for(const [key,root] of Object.entries(roots))if(key!==id){root.querySelectorAll('.v6-voice,.v6-advisor').forEach(n=>n.dispose?.());root.replaceChildren();}if(mapping[id])mountWorkspace(roots[id],mapping[id],lang,mode=>window.showPage(Object.keys(mapping).find(k=>mapping[k]===mode)));};
 const active=document.querySelector('.page.active')?.id.replace('page-','');if(mapping[active])window.showPage(active);
 const m4=document.getElementById('page-m4');if(m4){const hidden=el('div',{hidden:true,style:'display:none!important'});while(m4.firstChild)hidden.append(m4.firstChild);m4.append(hidden);}if(m4)m4.prepend(el('section',{class:'trusted'},el('h2',{text:t('내 회사로 경영 미션 시작하기','Start management missions with your venture')}),el('p',{text:t('팀·기술·복지 계획을 같은 프로젝트에서 실험하세요.','Experiment with team, technology and welfare plans in the same project.')}),el('a',{class:'tw-button tw-primary',href:projectURL('world',lang),onclick:e=>{e.preventDefault();location.assign(projectURL('world',lang));},text:t('회사 세계 입장 →','Enter venture world →')})));

 // The existing proxy generates text without a search tool; correct its UI claim.
 const desc=document.querySelector('#page-m1 .ai-search-desc');if(desc)desc.textContent=t('선택 시 기존 AI 프록시에 질문이 전송됩니다. 실시간 검색이 아닌 생성형 설명이며 출처와 수치는 별도 확인이 필요합니다.','Submitting sends your question to the existing AI proxy. This is generated explanation, not live search; verify sources and figures separately.');
 const oldQuery=window.aiTrendSearch;if(oldQuery)window.aiTrendSearch=function(){const consent=confirm(t('입력한 질문이 설정된 ASNM AI 프록시와 AI 제공자에게 전송됩니다. 전송할까요?','Your question will be sent to the configured ASNM AI proxy and provider. Send it?'));if(consent)return oldQuery.apply(this,arguments);};
 const quickResult=window.showFounderResult;if(quickResult)window.showFounderResult=function(){const result=quickResult.apply(this,arguments);recordQuickResult(window._founderType||'',window.getFounderAnswers?.()||[]);const graph=document.getElementById('founder-result');graph?.querySelector('.eco-panel')?.remove();if(graph){const references=leaderPanel({project:getActiveProject(),t,lang});references.classList.add('trusted','journey');references.open=true;graph.append(references);}if(graph&&!graph.querySelector('.v6-radar-note'))graph.append(el('p',{class:'v6-radar-note',text:t('기존 유형 레이더는 유형 설명용 예시이며 실제 응답 점수가 아닙니다. 심층 결과의 레이더는 실제 답변 평균을 표시합니다.','The original type radar is illustrative, not an answer-derived score. The deeper assessment radar uses actual answer averages.')}));return result;};
 window.addEventListener('asnm:barl-complete',event=>{getActiveProject().barl=structuredClone(event.detail);saveActiveProject();});
 window.addEventListener('asnm:module3-complete',event=>{
  document.getElementById('trusted-legacy-handoff')?.remove();
  const handoff=el('div',{class:'trusted',id:'trusted-legacy-handoff'},el('h2',{text:t('이 회사로 V6 경영 미션 체험','Experience V6 missions with this company')}),button(t('기존 결과를 보존하고 연결 →','Preserve & connect these results →'),()=>{adoptLegacy(event.detail);location.assign(projectURL('world',lang));},{class:'tw-primary'}));
  const target=document.getElementById('page-result');target.append(handoff);
 });
}
