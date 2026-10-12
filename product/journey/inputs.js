import {el,button,details,row,note} from '../trusted/ui.js';
import {voiceControls} from '../v6/speech.js';
const translations={
 customer:[['개인·가정','Individuals & households'],['기업·기관','Businesses & institutions'],['학교·교육기관','Schools & educators'],['지역 사업자','Local businesses']],
 region:[['한국','Korea'],['해외','International'],['온라인·지역 무관','Online / location independent']],
 vision:[['안전·품질 개선','Improve safety & quality'],['일상 불편 해결','Solve daily friction'],['전문 업무 개선','Improve professional work'],['접근성·사회적 가치','Accessibility & social value']],
 product:[['디지털 서비스','Digital service'],['실물 제품','Physical product'],['현장·전문 서비스','Field / professional service'],['혼합 제품·서비스','Hybrid product & service']],
 difference:[['더 안전하게','Safer'],['더 쉽게','Easier'],['시간·비용 절감','Save time & cost'],['새로운 경험','A new experience']],
 teamNotes:[['역할을 나누는 중','Allocating roles'],['공동창업자 탐색','Finding a co-founder'],['외부 전문가 협업','Working with specialists'],['직접 운영하며 검증','Validating as a solo founder']],
 revenue:[['온라인 판매','Online sales'],['매장·현장 운영','Store / field operation'],['기업·기관 계약','Business / institutional contracts'],['파트너와 협업','Partner-led delivery']],
 risk:[['자금·비용','Cash & costs'],['팀·실행','Team & execution'],['기술·품질','Technology & quality'],['고객 문제','Customer problem'],['계약·규제','Contracts & regulation'],['운영·공급망','Operations & supply chain']],
 failure:[['고객 문제 불명확','Unclear customer problem'],['현금 부족','Cash shortage'],['팀·실행 문제','Team or execution'],['기술·품질 문제','Technology or quality'],['공급·운영 중단','Supply or operations disruption'],['규제·계약 문제','Regulation or contracts'],['창업자 과부하','Founder overload'],['아직 모르겠어요','Not sure yet']]
};
export function spokenField(labelNode,lang){const input=labelNode.querySelector('input,textarea');if(!input||input.type==='number'||labelNode.querySelector('.v6-voice'))return labelNode;const voice=voiceControls(input,lang);labelNode.append(voice);return labelNode;}
export function assistInputs(host,c){const t=c.t;
 for(const input of [...host.querySelectorAll('input:not([type=checkbox]),textarea')]){
  if(input.dataset.journeyInput||input.closest('.v6-advisor')||input.type==='range')continue;input.dataset.journeyInput='true';const label=input.parentElement;if(label.tagName!=='LABEL')continue;
  const key=input.id.replace(/^tw-/,''),mapped=key.startsWith('barl-failReason')?'failure':({'company-name':'name','business-difference':'difference','team-notes':'teamNotes'}[key]||key);
  if(input.type==='number'){
   if(key.startsWith('barl-')&&['survival','growth','months'].some(x=>key.endsWith(x))){const values=key.endsWith('months')?[0,3,6,12,24]:[20,40,60,80,100];label.append(row(...values.map(v=>button(String(v),()=>{input.value=String(v);input.dispatchEvent(new Event('input',{bubbles:true}));},{class:'journey-number-pick'})),button(t('미정','Unknown'),()=>{input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));},{class:'journey-number-pick'})));}continue;
  }
  spokenField(label,c.lang);
  let presets=translations[mapped];if(!presets)continue;
  const editor=details(t('기타 · 직접 쓰거나 말하기','Other · type or speak'));const options=el('div',{class:'journey-quick-picks','aria-label':t('빠르게 선택','Quick choices')});
  const paint=()=>options.querySelectorAll('button[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(input.value===b.dataset.preset)));
  for(const pair of presets){const value=t(...pair);options.append(button(value,()=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));editor.open=false;paint();},{'data-preset':value,'aria-pressed':input.value===value}));}
  editor.open=!!input.value&&!presets.some(pair=>t(...pair)===input.value);const voice=label.querySelector('.v6-voice');editor.append(input,voice);label.append(options,editor);input.addEventListener('input',paint);
 }
}
export function disposeInputs(host){host.querySelectorAll('.v6-voice').forEach(n=>n.dispose?.());}
