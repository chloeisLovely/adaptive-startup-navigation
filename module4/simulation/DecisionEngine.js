import {clamp,recalculate,round,clone} from '../state/ASNMState.js';
export const decisions = {
  hiring: [['developer','개발자 채용','Hire developer'],['marketer','마케터 채용','Hire marketer'],['hold','채용 보류','Hold hiring']],
  product: [['feature','신규 기능','Build feature'],['improve','제품 개선','Improve product'],['debt','기술부채 해결','Reduce technical debt']],
  marketing: [['increase','예산 +20%','Budget +20%'],['maintain','예산 유지','Maintain budget'],['reduce','예산 −20%','Budget −20%']],
  pricing: [['raise','가격 +10%','Price +10%'],['hold','가격 유지','Hold price'],['lower','가격 −10%','Price −10%']],
  fundraising: [['attempt','투자유치 시도','Seek funding'],['bootstrap','부트스트래핑','Bootstrap'],['accept','투자조건 수락','Accept terms'],['reject','투자조건 거절','Reject terms']],
  market: [['focus','현재 시장 집중','Focus market'],['test','고객 세그먼트 테스트','Test segment'],['enter','신규 시장 진입','Enter new market']]
};
export const defaultDecisions=()=>({hiring:'hold',product:'improve',marketing:'maintain',pricing:'hold',fundraising:'bootstrap',market:'focus'});
export function validateDecisions(input, state) {
  if(!input || Object.keys(input).length !== 6) throw new Error('Choose one decision in each of six categories');
  for(const [category,options] of Object.entries(decisions)) if(!options.some(o=>o[0]===input[category])) throw new Error(`Invalid ${category} decision`);
  if(['accept','reject'].includes(input.fundraising) && (!state.operations.offer || state.operations.offer.expiresMonth < state.simulation.currentMonth+1)) throw new Error('No active investment offer');
  if(input.fundraising==='attempt' && state.operations.offer) throw new Error('Resolve the current investment offer first');
  if(state.venture.teamSize >= 100 && input.hiring !== 'hold') throw new Error('Team limit reached');
}

export function applyDecisions(state, choices, fundingRoll) {
  const s=state, v=s.venture, m=s.market, o=s.operations, u=s.costUnit;
  const trace=[];
  for(const [category,action] of Object.entries(choices)) {
    const before=clone({venture:v,market:m,operations:o});
    switch(`${category}:${action}`) {
      case 'hiring:developer': v.teamSize++; v.monthlyBurn+=5000*u; v.teamCapacity+=12; v.productProgress+=3; break;
      case 'hiring:marketer': v.teamSize++; v.monthlyBurn+=4000*u; v.teamCapacity+=7; v.cac*=.92; break;
      case 'product:feature': v.cash-=2500*u; v.productProgress+=8; o.technicalDebt+=6; break;
      case 'product:improve': v.cash-=1000*u; v.productProgress+=4; v.retention+=2; break;
      case 'product:debt': v.cash-=1500*u; o.technicalDebt-=12; v.teamCapacity+=5; break;
      case 'marketing:increase': {const n=Math.max(o.marketingBudget*1.2,500*u); v.monthlyBurn+=n-o.marketingBudget; o.marketingBudget=n; v.cac*=1.04; break;}
      case 'marketing:reduce': v.monthlyBurn-=o.marketingBudget*.2; o.marketingBudget*=.8; v.cac*=.98; break;
      case 'pricing:raise': {const next=clamp(o.priceMultiplier*1.1,.25,4); v.mrr*=next/o.priceMultiplier; o.priceMultiplier=next; v.retention-=3; break;}
      case 'pricing:lower': {const next=clamp(o.priceMultiplier*.9,.25,4); v.mrr*=next/o.priceMultiplier; o.priceMultiplier=next; v.retention+=3; m.demand+=2; break;}
      case 'fundraising:attempt': {
        v.cash-=2000*u;
        const chance=clamp(.2+v.productProgress/250+m.demand/500-m.uncertainty/500,.1,.8);
        if(fundingRoll < chance) o.offer={amount:150000*u,equity:15,expiresMonth:s.simulation.currentMonth+2};
        break;
      }
      case 'fundraising:accept': v.cash+=o.offer.amount; o.founderEquity*=1-o.offer.equity/100; o.offer=null; break;
      case 'fundraising:reject': o.offer=null; break;
      case 'market:focus': m.demand+=1; break;
      case 'market:test': v.cash-=2000*u; m.demand+=4; m.uncertainty-=5; break;
      case 'market:enter': v.cash-=10000*u; v.monthlyBurn+=2000*u; m.demand+=10; m.competition+=6; m.uncertainty+=8; break;
    }
    o.technicalDebt=clamp(o.technicalDebt); o.marketingBudget=round(o.marketingBudget); o.founderEquity=round(o.founderEquity);
    // Preserve cash shortfalls until the month closes; do not mint cash by clamping per action.
    const cash=v.cash; recalculate(s); v.cash=round(cash);
    trace.push({category,action,stateBefore:before.venture,stateAfter:clone(v),marketBefore:before.market,marketAfter:clone(m),operationsBefore:before.operations,operationsAfter:clone(o)});
  }
  return trace;
}
