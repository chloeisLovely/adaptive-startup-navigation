import {el,button,field,details,note,table,list} from '../trusted/ui.js';
import {readinessAreas,readinessStates,ventureReadiness,priorityActions} from './readiness.js';
import {spokenField} from './inputs.js';
export function readinessEditor(c,ids){const {project:p,t,lang}=c;const host=el('section',{class:'journey-readiness-editor'},el('h3',{text:t('지금 알고 있는 만큼만 체크해요','Check only what you know')}),note(t('정답은 없어요. 미정으로 두어도 다음 단계로 갈 수 있어요.','No right answer. You can leave this unknown and continue.')));
 for(const a of readinessAreas.filter(x=>ids.includes(x[0]))){const chosen=p.readiness?.[a[0]]?.state||'unknown',choices=el('div',{class:'journey-quick-picks'});const set=(key,value)=>{p.readiness??={};p.readiness[a[0]]??={state:'unknown',note:''};p.readiness[a[0]][key]=value;c.save();};for(const [value,labels] of Object.entries(readinessStates)){const b=button(t(...labels),()=>{set('state',value);choices.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));},{'aria-pressed':chosen===value});choices.append(b);}host.append(el('div',{class:'journey-readiness-choice'},el('h4',{text:a[1]+' '+t(a[2],a[3])}),el('p',{text:t(a[5],a[6])}),choices,details(t('짧은 메모 · 선택 사항','Short note · optional'),spokenField(field('ready-'+a[0],t('근거·다음 확인','Evidence / next check'),p.readiness?.[a[0]]?.note,v=>set('note',v),{multiline:true}),lang))));}return host;}
export function riskOverview(p,lang='ko'){
 const t=(k,e)=>lang==='ko'?k:e,rows=ventureReadiness(p);
 const tiles=rows.map(r=>el('div',{class:'journey-risk-tile','data-state':r.state},
  el('span',{class:'journey-risk-icon','aria-hidden':'true',text:r.icon}),
  el('h3',{text:t(...r.label)}),el('strong',{text:t(...readinessStates[r.state])}),
  el('p',{text:r.cashAlert?t(`현재 ${r.modeled?'모델':'입력'}의 자금 기간은 ${r.runway.toFixed(1)}개월입니다.`,`Current ${r.modeled?'modeled':'entered'} runway is ${r.runway.toFixed(1)} months.`):t(...r.action)})
 ));
 const evidence=rows.map(r=>el('p',{text:t(...r.label)+' · '+(r.note||t('메모 없음','No note'))+' · '+(r.selfReported?t('사용자 자기기록','User self-report'):t('미입력','Not supplied'))}));
 return el('div',{class:'journey-risk-overview'},
  el('span',{class:'journey-eyebrow',text:'VENTURE READINESS'}),
  el('h2',{text:t('창업을 위해 무엇부터 확인할까요?','What needs checking before you commit?')}),
  note(t('자금·사람·제품·운영·규제·고객을 함께 살펴봅니다. 확인 전 항목은 실패 위험으로 단정하지 않습니다.','Consider money, people, product, operations, obligations and customers together. Unchecked items are not findings of failure risk.')),
  el('div',{class:'journey-risk-grid'},...tiles),
  el('h3',{text:t('지금 우선할 세 가지','Three priorities now')}),
  table([t('확인 영역','Area'),t('책임 역할','Owner'),t('다음 행동','Next action')],priorityActions(p).map(r=>[t(...r.label),r.owner,t(...r.action)])),
  details(t('입력한 근거와 판단 범위','Your evidence and the limits of this review'),...evidence),
  note(t('준비 상태는 자기기록이며 독립 검증·투자 심사·법률 의견·성공 확률이 아닙니다. 재무 경고는 입력 또는 명시된 시뮬레이션 가정에서 계산합니다.','Readiness is self-reported, not independently verified, an investment assessment, legal opinion or success probability. Cash warnings use entered or explicitly modeled assumptions.'))
 );
}
