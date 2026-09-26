import {clamp,round} from '../state/ASNMState.js';
export function calibrate(s) {
  const v=s.venture, m=s.market, a=s.assumptions;
  const runwayScore=v.runway===null ? 100 : clamp(v.runway/12*100);
  const resilience=round(.35*runwayScore+.2*v.retention+.15*v.productProgress+.15*v.teamCapacity+.15*m.demand);
  const make=(id,expected,estimate,unit,comparable=true)=>({id,expected:expected??null,estimate,gap:expected==null?null:round(expected-estimate),unit,comparable});
  return [
    make('resilience',a.expectedSurvival,resilience,'points',false),
    make('growth',a.expectedGrowth,m.marketGrowth,'pp/year'),
    make('demand',a.expectedDemand,m.demand,'points')
  ];
}
