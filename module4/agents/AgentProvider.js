// AgentProvider interface: async advise(readonlyState, proposedDecisions, lang)
// => [{role, observation, risk, consequence, question}]. No state-write capability.
// A future HTTP provider should call a server-side proxy and validate this shape.
import {clone} from '../state/ASNMState.js';
export class RuleBasedProvider {
  async advise(state, choices, lang='ko') {
    const s=clone(state),v=s.venture,u=s.costUnit,ko=lang==='ko';
    const money=n=>new Intl.NumberFormat(ko?'ko-KR':'en-US',{style:'currency',currency:s.currency,maximumFractionDigits:0}).format(n);
    const runway=v.runway===null ? (ko?'순현금소진 없음':'no net cash burn') : `${v.runway} ${ko?'개월':'months'}`;
    const hireCost=choices.hiring==='developer'?5000*u:choices.hiring==='marketer'?4000*u:0;
    const nextBurn=v.monthlyBurn+hireCost-v.mrr;
    const hireRunway=nextBurn>0 ? (v.cash/nextBurn).toFixed(1) : '∞';
    return [
      {role:'CFO',observation:ko?`현재 Runway ${runway}, 월 비용 ${money(v.monthlyBurn)}.`:`Runway: ${runway}; monthly expenses ${money(v.monthlyBurn)}.`,risk:ko?'고정비가 늘면 의사결정 시간이 줄어듭니다.':'Fixed costs reduce time available to learn.',consequence:ko?`채용 선택만 적용한 Runway는 약 ${hireRunway}개월입니다. 다른 효과는 제외한 계산입니다.`:`Hiring alone implies about ${hireRunway} months of runway, before other effects.`,question:ko?'이번 비용으로 어떤 검증 결과를 얻으려 하나요?':'What evidence will this spending produce?'},
      {role:'CMO',observation:`CAC ${money(v.cac)} · Demand ${s.market.demand}/100`,risk:ko?'예산 확대만으로 고객획득 효율이 보장되지 않습니다.':'Higher spend does not guarantee efficient acquisition.',consequence:ko?'예산 확대는 비용과 예상 고객 수를 함께 바꿉니다.':'Increasing the budget changes both expenses and acquired customers.',question:ko?'어떤 고객군의 전환을 먼저 측정할까요?':'Which segment conversion would you measure first?'},
      {role:'CTO',observation:ko?`제품 완성도 ${v.productProgress}/100 · 기술부채 ${s.operations.technicalDebt}/100`:`Product ${v.productProgress}/100 · Technical debt ${s.operations.technicalDebt}/100`,risk:ko?'기능 추가는 기술부채를 누적시킵니다.':'New features accumulate technical debt.',consequence:ko?'기술부채를 줄이면 이후 월별 개발속도가 개선됩니다.':'Reducing debt improves subsequent monthly development.',question:ko?'기능 추가와 안정화 중 어떤 가정을 검증하나요?':'Which assumption needs a feature or stability test?'},
      {role:'Customer',observation:ko?`월 고객유지율 ${v.retention}%`:`Monthly retention ${v.retention}%`,risk:ko?'가격 인상은 고객 이탈을 높일 수 있습니다.':'Raising prices can increase churn.',consequence:ko?'모델에서 가격 인상은 즉시 MRR을 늘리고 유지율을 3%p 낮춥니다.':'In this model, a price increase raises MRR immediately and lowers retention by 3 pp.',question:ko?'고객은 어떤 가치 때문에 계속 결제하나요?':'What value makes a customer renew?'},
      {role:'Investor',observation:ko?`창업자 지분 ${s.operations.founderEquity}% · 제안 ${s.operations.offer?'있음':'없음'}`:`Founder ownership ${s.operations.founderEquity}% · Offer ${s.operations.offer?'available':'none'}`,risk:ko?'자금 확보에는 지분 희석과 협상비용이 따릅니다.':'Funding involves dilution and fundraising costs.',consequence:ko?'제안을 수락해야 현금이 들어옵니다. 시도만으로 투자가 확정되지 않습니다.':'Cash arrives only after accepting an offer; an attempt is not funding.',question:ko?'어떤 성과를 달성하기 위해 투자가 필요한가요?':'Which milestone requires external capital?'}
    ];
  }
}
