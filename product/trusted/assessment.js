import {text} from './model.js';
export const ASSESSMENT_VERSION='asnm-exploratory-1';
export const domains=[
 ['discovery','고객·기회 탐색','Customer discovery','discovery','고객의 최근 문제 사례 5개를 수집하세요.','Collect five recent customer problem stories.'],
 ['planning','계획·실험 설계','Planning & experiments','product','이번 주 실험의 중단 기준을 먼저 적어보세요.','Write a stop rule for this week’s experiment.'],
 ['resources','자원·협력','Resources & partnerships','team','필요한 역량과 도움을 요청할 사람을 연결하세요.','Match a needed capability to a person who can help.'],
 ['finance','재무 이해','Financial confidence','funding','현금·월비용·반복매출을 실제 기록과 대조하세요.','Reconcile cash, monthly costs and recurring revenue.'],
 ['team','협업·실행','Team & execution','welfare','팀원과 역할·완료 기준·피드백 시간을 합의하세요.','Agree on roles, completion criteria and feedback time.'],
 ['learning','불확실성·학습','Uncertainty & learning','market','최근 가정 하나를 반박할 증거를 찾아보세요.','Find evidence that could disprove one recent assumption.']
];
// Original ASNM items. Concept references do not confer psychometric validity.
export const items=[
 ['d1','discovery','고객이 최근 겪은 불편을 유도 질문 없이 구체적으로 물어볼 자신이 있습니다.','I feel confident asking about a recent customer difficulty without leading the answer.'],
 ['d2','discovery','고객이 지금 쓰는 대안과 내 제안의 차이를 고객에게 확인할 수 있습니다.','I can check the difference between my offer and a customer’s current alternative.'],
 ['p1','planning','작은 실험의 기간·예산·성공과 중단 기준을 적을 수 있습니다.','I can write a small experiment’s duration, budget and continuation or stop criteria.'],
 ['p2','planning','큰 목표를 이번 주에 끝낼 수 있는 과제로 나눌 수 있습니다.','I can break a large goal into tasks that fit this week.'],
 ['r1','resources','부족한 기술이나 자원을 도와줄 사람에게 구체적으로 요청할 수 있습니다.','I can make a specific request to someone who can provide a missing skill or resource.'],
 ['r2','resources','협력 상대와 서로 제공할 것과 책임을 문서로 정리할 수 있습니다.','I can document contributions and responsibilities with a partner.'],
 ['f1','finance','보유 현금·월 비용·반복 매출을 구분해 기록할 수 있습니다.','I can record cash, monthly expenses and recurring revenue separately.'],
 ['f2','finance','새 지출을 결정하기 전에 자금이 버틸 기간을 다시 계산할 수 있습니다.','I can recalculate how long cash lasts before committing new spending.'],
 ['t1','team','함께 일할 사람의 역할과 완료 기준을 명확히 합의할 수 있습니다.','I can agree on clear responsibilities and completion criteria with a collaborator.'],
 ['t2','team','팀원과 의견이 다를 때 근거와 제약을 함께 검토할 수 있습니다.','I can discuss evidence and constraints when a teammate disagrees.'],
 ['l1','learning','고객 반응이 예상과 다르면 가정과 실행 계획을 수정할 수 있습니다.','I can revise assumptions and plans when customer responses differ from expectations.'],
 ['l2','learning','확실하지 않은 결정에서도 감당할 손실 범위를 정하고 작은 시도를 할 수 있습니다.','I can set an affordable loss limit and try something small under uncertainty.']
];
const choice=(id,ko,en,tradeKo,tradeEn)=>({id,ko,en,tradeKo,tradeEn});
export const situations=[
 {id:'s1',ko:'개발은 3개월 더 필요하고 고객 인터뷰는 아직 없습니다. 무엇을 먼저 할까요?',en:'Development needs three more months; no customer interviews yet. What comes first?',options:[choice('plan','핵심 기능 완성','Finish core features','출시 준비에 집중하지만 고객 문제 가정은 남습니다.','Supports delivery; the customer-problem assumption remains.'),choice('experiment','고객 5명 인터뷰','Interview five customers','문제를 배우지만 개발 일정은 조정해야 합니다.','Supports learning; delivery time must be renegotiated.'),choice('hybrid','작은 시제품과 인터뷰 병행','Small prototype plus interviews','두 가지를 배울 수 있지만 집중할 범위를 좁혀야 합니다.','Provides two learning paths but needs tight scope.')]},
 {id:'s2',ko:'자금이 부족하지만 좋은 개발자를 채용할 기회가 있습니다.',en:'Cash is tight, but a strong developer is available.',options:[choice('plan','확장 계획대로 채용','Hire for the growth plan','개발 역량과 고정비가 함께 증가합니다.','Capacity and fixed costs both increase.'),choice('loss','지출 상한 내 단기 협업','Bounded trial contract','손실을 제한하지만 지속적인 인력 확보는 불확실합니다.','Limits downside; long-term availability remains uncertain.'),choice('pause','검증될 때까지 보류','Wait for evidence','현금은 보존하지만 영입 기회를 놓칠 수 있습니다.','Preserves cash but may lose the recruiting opportunity.')]},
 {id:'s3',ko:'고객 반응이 예상보다 약합니다. 다음 선택은?',en:'Customer response is weaker than expected. What next?',options:[choice('plan','계획을 유지하며 더 실행','Execute the existing plan','일관성을 유지하지만 잘못된 가정을 지속할 수 있습니다.','Maintains consistency but may extend a faulty assumption.'),choice('flex','다른 고객군을 작게 시험','Test another segment','새 학습을 얻지만 기존 고객에 대한 집중은 줄어듭니다.','Adds learning but reduces focus on current customers.'),choice('pause','추가 자료를 모은 후 결정','Gather more evidence','근거는 늘지만 결정 비용과 지연도 고려해야 합니다.','Adds evidence; consider the cost of delay.')]},
 {id:'s4',ko:'파트너가 공동 개발을 제안하며 독점 조건을 요구합니다.',en:'A partner offers joint development but requests exclusivity.',options:[choice('partner','범위와 종료 조건 협상','Negotiate scope and exit','자원을 얻지만 선택의 자유가 줄어들 수 있습니다.','Gains resources but can constrain future choices.'),choice('loss','독점 없는 작은 파일럿','Small nonexclusive pilot','의존도를 줄이지만 파트너 투입은 적을 수 있습니다.','Reduces dependency but may limit partner commitment.'),choice('plan','독립 개발 유지','Continue independently','통제력을 유지하지만 자원 부담이 커집니다.','Preserves control but requires more resources.')]},
 {id:'s5',ko:'팀원이 일정 지연과 업무 과부하를 호소합니다.',en:'A teammate reports delays and overload.',options:[choice('partner','업무 범위와 역할 재합의','Renegotiate scope and roles','협업을 개선할 여지가 있지만 일정은 바뀝니다.','May improve coordination but changes the schedule.'),choice('plan','현재 출시일을 유지','Keep the launch date','납기를 지키려 하지만 품질·과부하 위험을 점검해야 합니다.','Targets delivery but requires checking quality and overload.'),choice('experiment','한 주 운영 방식 시험','Trial a working change for a week','작게 배울 수 있지만 평가 기준이 필요합니다.','Enables learning but needs explicit evaluation criteria.')]},
 {id:'s6',ko:'신규 기능 요청은 많지만 실제 결제는 적습니다.',en:'Feature requests are plentiful, but few customers pay.',options:[choice('experiment','소규모 유료 제안 테스트','Test a small paid offer','지불 의사를 배우지만 일부 고객을 놓칠 수 있습니다.','Tests willingness to pay but may lose some customers.'),choice('plan','요청 기능 먼저 개발','Build requested features first','요구에 반응하지만 구매 원인인지 확인이 필요합니다.','Responds to requests; their link to buying remains untested.'),choice('flex','고객 문제와 제안 재검토','Revisit problem and offer','방향 전환의 기회를 얻지만 기존 노력이 매몰될 수 있습니다.','Opens a new direction but some prior work may be sunk.')]}
];
export function assessmentResult(assessment){
 const a=assessment?.answers||{},s=assessment?.situations||{};
 const scores=domains.map(([id])=>{const group=items.filter(i=>i[1]===id),values=group.map(i=>a[i[0]]).filter(v=>Number.isInteger(v)&&v>=1&&v<=5);return {id,answered:values.length,total:group.length,score:values.length?Math.round(values.reduce((x,y)=>x+y,0)/values.length*10)/10:null};});
 const choices=situations.flatMap(row=>{const answer=s[row.id],option=row.options.find(o=>o.id===answer?.choice);return option?[{id:row.id,choice:option.id,reason:answer.reason,option}]:[];});
 const complete=scores.every(x=>x.answered===x.total),ranked=scores.filter(x=>x.answered===x.total).sort((a,b)=>a.score-b.score);
 const spread=ranked.length>1&&ranked[0].score<ranked.at(-1).score;
 return {version:ASSESSMENT_VERSION,answered:scores.reduce((n,x)=>n+x.answered,0),scores,choices,complete,development:spread?ranked[0].id:null,strength:spread?ranked.at(-1).id:null,patterns:Object.fromEntries(['plan','experiment','hybrid','loss','flex','partner','pause'].map(k=>[k,choices.filter(c=>c.choice===k).length]))};
}
export function founderNudge(assessment,lang){const r=assessmentResult(assessment),d=domains.find(x=>x[0]===r.development);return d?text(lang,`완료한 영역 중 상대적으로 자신감이 낮은 영역: ${d[1]}. ${d[4]}`,`A relatively lower-confidence completed area: ${d[2]}. ${d[5]}`):r.answered?text(lang,'응답한 영역만으로 강약점을 구분할 차이가 충분하지 않습니다. 실제 수행 경험과 고객 근거로 다음 학습 과제를 정하세요.','Completed areas do not establish a relative strength or gap. Use actual task experience and customer evidence to choose a learning goal.'):text(lang,'자기평가가 없으면 일반적인 팀 자문을 제공합니다.','Without self-assessment, general team guidance is used.');}
