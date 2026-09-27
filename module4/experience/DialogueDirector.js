import {decisions} from '../simulation/DecisionEngine.js';
import {money,fmt} from '../ui/dom.js';
export function dialogue(s,room,lang='ko') {
  const t=(ko,en)=>lang==='ko'?ko:en,v=s.venture,o=s.operations,m=s.market;
  const cash=money(v.cash,s.currency,lang),runway=fmt(v.runway);
  const offer=o.offer?t(`제안 ${money(o.offer.amount,s.currency,lang)}, 지분 ${o.offer.equity}%, Month ${o.offer.expiresMonth} 말 만료.`,`Offer ${money(o.offer.amount,s.currency,lang)} for ${o.offer.equity}% equity; expires at the end of month ${o.offer.expiresMonth}.`):t('현재 투자 제안이 없습니다.','There is no current investment offer.');
  const info={
    ceo:['Chief of Staff',t('CEO 비서실장','Chief of Staff'),t(`현금 ${cash}, MRR ${money(v.mrr,s.currency,lang)}, Runway ${runway}개월. 이번 달에 검증할 가정은 무엇인가요?`,`Cash ${cash}, MRR ${money(v.mrr,s.currency,lang)}, runway ${runway} months. What assumption will you test?`),false],
    finance:['CFO','CFO',t(`현금 ${cash}, 월 비용 ${money(v.monthlyBurn,s.currency,lang)}, Runway ${runway}개월. 마케팅 비용과 자금조달을 함께 검토하세요.`,`Cash ${cash}, monthly burn ${money(v.monthlyBurn,s.currency,lang)}, runway ${runway} months. Review marketing costs and financing together.`)+(v.runway!==null&&v.runway<6?t(' 현금 여력이 부족합니다.',' Cash runway is low.'):'')+(o.founderEquity<60?t(' 창업자 지분이 60% 미만입니다.',' Founder equity is below 60%.'):''),v.runway!==null&&v.runway<6||o.founderEquity<60],
    market:['Research Lead',t('시장 리서치 리드','Research Lead'),t(`시장수요 ${m.demand}/100, 경쟁 ${m.competition}/100, 불확실성 ${m.uncertainty}/100. 어떤 시장을 검증할까요?`,`Demand ${m.demand}/100, competition ${m.competition}/100, uncertainty ${m.uncertainty}/100. Which market will you test?`)+(m.competition>70?t(' 경쟁 압력이 높습니다.',' Competitive pressure is high.'):''),m.competition>70],
    product:['CTO',t('제품·기술 리드','CTO / Product Lead'),t(`제품 완성도 ${v.productProgress}/100, 기술부채 ${o.technicalDebt}/100. 기능, 안정성, 개발 속도 사이의 우선순위를 선택해주세요.`,`Product ${v.productProgress}/100, technical debt ${o.technicalDebt}/100. Choose between features, reliability and development speed.`)+(v.productProgress<40?t(' 제품 준비도가 낮습니다.',' Product readiness is low.'):''),v.productProgress<40],
    customer:['Customer',t('고객 대표','Customer'),t(`유지율 ${v.retention}%, CAC ${money(v.cac,s.currency,lang)}. 가격과 고객 경험의 균형을 어떻게 잡을까요?`,`Retention ${v.retention}%, CAC ${money(v.cac,s.currency,lang)}. How will you balance pricing and customer experience?`)+(v.retention<60?t(' 고객 이탈을 살펴봐야 합니다.',' Customer churn needs attention.'):''),v.retention<60],
    team:['Developer & Marketer',t('개발자 · 마케터','Developer & Marketer'),t(`팀 ${v.teamSize}명, 실행역량 ${v.teamCapacity}/100. 이번 달에 어떤 역할이 필요할까요?`,`Team ${v.teamSize}, capacity ${v.teamCapacity}/100. Which role do we need this month?`),v.teamCapacity<40],
    investor:['Investor',t('투자자','Investor'),`${offer} `+t(`창업자 지분 ${o.founderEquity}%. 성장 자금과 지분 희석을 비교해보세요.`,`Founder equity ${o.founderEquity}%. Weigh growth capital against dilution.`),o.founderEquity<60]
  }[room];
  return {speaker:info[1],portrait:info[0],mood:info[3]?'concerned':'talk',text:info[2],context:sourceContext(s,room,lang)};
}
export function sourceContext(s,room,lang){
  const t=(ko,en)=>lang==='ko'?ko:en,raw=s.provenance?.module3;
  if(!raw)return room==='ceo'?t(s.provenance?.source==='standalone'?'이 World는 Standalone 입력과 기본 가정을 기반으로 생성되었습니다.':'이 World는 샘플 또는 가져온 시나리오 가정을 기반으로 생성되었습니다.',s.provenance?.source==='standalone'?'This world was created from standalone inputs and default assumptions.':'This world uses sample or imported scenario assumptions.'):'';
  const c=raw.company||{},b=raw.barl||{};
  const values={ceo:{company:c.name,capital:c.capital,expectedSurvival:b.survival,expectedGrowth:b.growth,firstRevenueMonths:b.months,biases:b.biases,founderProfile:raw.founder_type},finance:{capital:c.capital,preMortem:[b.failReason1,b.failReason2,b.failReason3].filter(Boolean)},product:{tech:c.tech,biases:b.biases},market:{persona:c.persona},customer:{persona:c.persona},team:{talent:c.talent},investor:{expectedSurvival:b.survival,expectedGrowth:b.growth,firstRevenueMonths:b.months}}[room];
  const present=Object.entries(values).filter(([,v])=>v!==undefined&&v!==null&&v!==''&&(!Array.isArray(v)||v.length));
  return t('Module 3에 기록한 가정: ','Your recorded Module 3 assumptions: ')+present.map(([k,v])=>`${k}: ${typeof v==='object'?JSON.stringify(v):v}`).join(' · ');
}
export function choicesFor(s,category,lang){return decisions[category].filter(([a])=>category==='fundraising'?['accept','reject'].includes(a)?!!s.operations.offer:a==='attempt'?!s.operations.offer:true:category==='hiring'&&s.venture.teamSize>=100?a==='hold':true).map(([action,ko,en])=>({action,label:lang==='ko'?ko:en}));}
const tradeoffs={
 'hiring:developer':['월 비용 +5,000 × 통화 단위, 역량 +12, 제품 +3.','Monthly burn +5,000 × currency unit, capacity +12, product +3.'],
 'hiring:marketer':['월 비용 +4,000 × 통화 단위, 역량 +7, CAC −8%.','Monthly burn +4,000 × currency unit, capacity +7, CAC −8%.'],
 'hiring:hold':['추가 채용 비용이 없습니다. 기존 팀으로 실행합니다.','No additional hiring costs. Execute with the current team.'],
 'product:feature':['현금 −2,500 × 통화 단위, 제품 +8, 기술부채 +6.','Cash −2,500 × currency unit, product +8, technical debt +6.'],
 'product:improve':['현금 −1,000 × 통화 단위, 제품 +4, 유지율 +2%p. 기본 선택도 비용이 있습니다.','Cash −1,000 × currency unit, product +4, retention +2 pp. This default also has a cost.'],
 'product:debt':['현금 −1,500 × 통화 단위, 기술부채 −12, 역량 +5.','Cash −1,500 × currency unit, technical debt −12, capacity +5.'],
 'marketing:increase':['예산 +20% (최소 500 × 통화 단위), 월 비용 증가, CAC +4%.','Budget +20% (minimum 500 × currency unit), higher burn, CAC +4%.'],
 'marketing:maintain':['현재 예산을 유지합니다.','Maintain the existing budget.'],
 'marketing:reduce':['예산 −20%, 해당 금액만큼 월 비용 감소, CAC −2%.','Budget −20%, burn decreases by the same amount, CAC −2%.'],
 'pricing:raise':['가격 +10% (상한 ×4), MRR에 가격비율 적용, 유지율 −3%p.','Price +10% (cap ×4), MRR scales with price, retention −3 pp.'],
 'pricing:hold':['현재 가격을 유지합니다.','Maintain the current price.'],
 'pricing:lower':['가격 −10% (하한 ×0.25), MRR에 가격비율 적용, 유지율 +3%p, 수요 +2.','Price −10% (floor ×0.25), MRR scales with price, retention +3 pp, demand +2.'],
 'fundraising:attempt':['현금 −2,000 × 통화 단위. 제안 여부는 기존 확률 규칙으로 결정됩니다.','Cash −2,000 × currency unit. An offer is not guaranteed; existing probability rules apply.'],
 'fundraising:bootstrap':['새 자금을 받지 않습니다. 기존 제안은 만료될 수 있습니다.','No new funding. An existing offer may expire.'],
 'fundraising:accept':['제안 금액을 받고 현재 창업자 지분에 (1 − 제안 지분율)을 곱합니다.','Receive the offer amount; multiply current founder equity by (1 − offered equity fraction).'],
 'fundraising:reject':['현재 제안을 거절합니다. 자금이나 지분의 즉시 변화는 없습니다.','Decline the current offer. No immediate cash or equity change.'],
 'market:focus':['현재 시장 수요 +1.','Current market demand +1.'],
 'market:test':['현금 −2,000 × 통화 단위, 수요 +4, 불확실성 −5.','Cash −2,000 × currency unit, demand +4, uncertainty −5.'],
 'market:enter':['현금 −10,000 × 통화 단위, 월 비용 +2,000 × 통화 단위, 수요 +10, 경쟁 +6, 불확실성 +8.','Cash −10,000 × currency unit, burn +2,000 × currency unit, demand +10, competition +6, uncertainty +8.']
};
export const tradeoff=(category,action,lang)=>tradeoffs[`${category}:${action}`][lang==='ko'?0:1];
