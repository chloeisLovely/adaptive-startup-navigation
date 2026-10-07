import {el,money,fmt} from '../module4/ui/dom.js';
import {actionPlan,decisionMoment,tr} from './experience.js';
export function copilotView(session,lang='ko',page='home',founderType=''){
 const t=(ko,en)=>tr(lang,ko,en),state=session?.state,history=session?.history||[],plan=state?actionPlan(session,lang):null;
 let observed=t('현재 여정을 시작하거나 지금 고민을 선택할 수 있습니다.','Start the full journey or choose the decision you face today.');
 if(state)observed=`${state.venture.ventureName} · ${t('현금','cash')} ${money(state.venture.cash,state.currency,lang)} · Runway ${fmt(state.venture.runway)} · ${t('기록된 결정','recorded decisions')} ${history.length}`;
 else if(page==='page-m1')observed=t('지금 시장 발견 단계입니다. 기본 카드는 선별된 예시이며 실시간 수요 검증 자료가 아닙니다.','You are discovering market assumptions. Curated cards are examples, not live validation evidence.');
 else if(page==='page-m2')observed=t(`의사결정 습관을 점검하는 단계입니다.${founderType?' 저장된 자기 점검 유형: '+founderType:''}` ,`You are reflecting on decision habits.${founderType?' Recorded self-reflection orientation: '+founderType:''}`);
 else if(page==='page-m3a')observed=t('사업 가정과 기대를 기록하는 단계입니다. 입력한 구성이 규칙 기반 지표를 만듭니다.','You are recording venture assumptions and expectations. Your inputs feed a transparent rubric.');
 const caution=state?plan.risk:t('고객 문제의 근거 없이 개발이나 확장에 비용을 쓰기 쉽습니다.','Without evidence of a customer problem, development or expansion can consume scarce resources.');
 const options=state?decisionMoment(state).options.map(o=>t(o.ko,o.en)).join(' / '):t('시장 가정 탐색 / 의사결정 습관 점검 / 짧은 결정 데모','Explore market assumptions / reflect on decision habits / try the decision demo');
 const trades=state?decisionMoment(state).options.map(o=>t(o.whyKo,o.whyEn)).join(' '):t('더 많이 알아보는 시간과 빠르게 실행하는 속도 사이의 균형을 찾으세요.','Balance time spent learning with speed of execution.');
 const next=state?(state.venture.runway!==null&&state.venture.runway<6?plan.week[2]:plan.week[0]):t('목표 고객 한 명의 최근 문제와 현재 해결 방법을 질문하고 실제 답을 기록하세요.','Ask one target customer about their most recent problem and current workaround; record their answer.');
 const node=el('section',{class:'p-card p-stack',id:'startup-copilot'},el('div',{class:'p-row p-between'},el('h3',{text:'ASNM Startup Copilot'}),el('span',{class:'p-chip',text:t('규칙 기반 · 내 기록 참고','Rule-based · grounded in your record')})),...[
 [t('현재 상태','What I see'),observed],[t('왜 중요한가요?','Why it matters'),caution],[t('가능한 선택','Options'),options],[t('선택의 장단점','Trade-off'),trades],[t('지금 가장 먼저 할 행동','Next best action'),next]
 ].map(([label,value])=>el('div',{},el('b',{class:'p-small',text:label}),el('p',{class:'p-small',text:value}))));
 const recent=history.slice(-3);if(recent.length===3){const developer=recent.filter(l=>l.decisions.some(d=>d.category==='hiring'&&d.action==='developer')).length,discovery=recent.filter(l=>l.decisions.some(d=>d.category==='market'&&d.action==='test')).length;if(developer>=2&&discovery===0)node.append(el('p',{class:'p-notice',text:t(`최근 3개 결정 중 ${developer}개에서 개발자를 채용했고 고객 세그먼트 테스트는 없었습니다. 이번 선택도 같은 우선순위인지 점검할까요? 실제 고객 인터뷰 기록은 이 모델에 없으므로 별도로 확인하세요.`,`In your last three rounds, ${developer} hired a developer and none tested a segment. Does this choice repeat that priority? Real interview records are not in this model, so check them separately.`)}));}
 node.append(el('p',{class:'p-notice',text:t('최종 결정은 Founder에게 있습니다.','The founder makes the final decision.')}));return node;
}
export function strategyFromText(text,state,lang='ko'){
 const t=(ko,en)=>tr(lang,ko,en),clean=String(text).trim(),changes={};
 if(/(채용.{0,8}(보류|미루|않|안)|hold.{0,8}hir|no.{0,8}hir)/i.test(clean))changes.hiring='hold';
 else if(/개발자|developer/i.test(clean))changes.hiring='developer';else if(/마케터|marketer/i.test(clean))changes.hiring='marketer';
 if(/인터뷰|고객.{0,6}(검증|만나)|interview|discovery/i.test(clean))changes.market='test';
 if(/가격.{0,6}(올|인상)|raise.{0,6}price/i.test(clean))changes.pricing='raise';
 if(/비용.{0,6}(줄|절감)|마케팅.{0,8}(줄|절감)|reduce.{0,8}(spend|marketing)/i.test(clean))changes.marketing='reduce';
 if(/투자.{0,8}(유치|시작)|seek.{0,8}(fund|invest)/i.test(clean)&&!state.operations.offer)changes.fundraising='attempt';
 if(!Object.keys(changes).length)return null;
 return {id:'custom',ko:'내 전략 검토',en:'Review my strategy',changes,whyKo:'문장에서 연결한 모델 규칙만 실행합니다. 팀 토론에서 전체 선택을 확인한 뒤 결정하세요.',whyEn:'Only the mapped model rules execute. Review all choices in the team discussion before committing.'};
}
