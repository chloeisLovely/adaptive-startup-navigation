import {clamp} from '../state/ASNMState.js';
// Fixed draw slots per month keep market events comparable across decision paths.
export function randomForMonth(seed, month) {
  let x=(seed ^ Math.imul(month+1,0x9e3779b9))>>>0;
  return ()=> { x=(x+0x6D2B79F5)>>>0; let t=Math.imul(x^(x>>>15),1|x); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; };
}
export const events=[
  {id:'price_cut',ko:'경쟁사 가격 인하',en:'Competitor cuts prices',apply:s=>{s.market.competition+=8;s.venture.mrr*=.94;}},
  {id:'competitor_funded',ko:'경쟁사 투자유치',en:'Competitor raises funding',apply:s=>{s.market.competition+=6;s.venture.cac*=1.08;}},
  {id:'demand_up',ko:'시장수요 증가',en:'Market demand rises',apply:s=>{s.market.demand+=10;s.market.marketGrowth+=3;}},
  {id:'demand_down',ko:'시장수요 감소',en:'Market demand falls',apply:s=>{s.market.demand-=10;s.market.marketGrowth-=3;}},
  {id:'cac_up',ko:'광고 고객획득비 증가',en:'Acquisition costs rise',apply:s=>{s.venture.cac*=1.15;}},
  {id:'customer_lost',ko:'주요 고객 이탈',en:'Major customer leaves',apply:s=>{s.venture.mrr*=.85;s.venture.retention-=4;}},
  {id:'enterprise',ko:'대형 고객 기회',en:'Enterprise customer opportunity',apply:s=>{s.venture.mrr+=s.venture.productProgress>=50?2000*s.costUnit:500*s.costUnit;}},
  {id:'dev_cost',ko:'예상 밖 개발비',en:'Unexpected development expense',apply:s=>{s.venture.cash-=5000*s.costUnit;}},
  {id:'staff_exit',ko:'핵심 인력 이탈',en:'Key team member exits',apply:s=>{if(s.venture.teamSize>1){s.venture.teamSize--;s.venture.teamCapacity-=12;s.venture.monthlyBurn=Math.max(s.operations.marketingBudget,s.venture.monthlyBurn-3000*s.costUnit);}else{s.venture.teamCapacity-=5;}}},
  {id:'regulation',ko:'산업 환경 변화',en:'Industry rules change',apply:s=>{s.market.uncertainty+=8;s.venture.cash-=2000*s.costUnit;}},
  {id:'tech_shift',ko:'기술 트렌드 변화',en:'Technology shift',apply:s=>{s.operations.technicalDebt=clamp(s.operations.technicalDebt+8);s.market.demand+=3;}}
];
export function applyEvent(state, occurrence, selection) {
  if(occurrence>=.65) return {id:'quiet',ko:'중대 시장 이벤트 없음',en:'No major market event'};
  const event=events[Math.min(events.length-1,Math.floor(selection*events.length))];
  event.apply(state);
  return {id:event.id,ko:event.ko,en:event.en};
}
