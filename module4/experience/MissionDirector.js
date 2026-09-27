import {decisions,defaultDecisions} from '../simulation/DecisionEngine.js';
export const roles={ceo:['Founder / CEO','창업자 / CEO'],product:['Product Lead','제품 리드'],growth:['Growth / Marketing Lead','성장 / 마케팅 리드'],finance:['Finance Lead','재무 리드']};
export const roomCategories={ceo:[],finance:['marketing','fundraising'],market:['market','marketing'],product:['product'],customer:['pricing'],team:['hiring'],investor:['fundraising']};
// Attention routing only. These thresholds never enter simulation arithmetic.
export function missions(s,role='ceo') {
  const v=s.venture,offer=!!s.operations.offer;
  const candidates=[
    {room:offer?'investor':'finance',category:'fundraising',score:offer?110:v.runway!==null&&v.runway<8?90:25},
    {room:'customer',category:'pricing',score:v.retention<65?85:20},
    {room:'product',category:'product',score:v.productProgress<45?80:40},
    {room:'market',category:'market',score:s.market.competition>65?75:30},
    {room:'team',category:'hiring',score:v.teamCapacity<40?60:15},
    {room:'finance',category:'marketing',score:35}
  ];
  for(const c of candidates)if(({product:['product'],growth:['market','marketing','pricing'],finance:['fundraising','marketing']}[role]||[]).includes(c.category))c.score+=20;
  candidates.sort((a,b)=>b.score-a.score);
  return candidates.slice(0,Math.max(2,Math.min(4,candidates.filter(c=>c.score>=60).length||3)));
}
export function experienceState(raw,s) {
  const month=s.simulation.currentMonth;
  const same=raw?.month===month;
  const choices=defaultDecisions(),confirmed=[];
  if(same)for(const k of Object.keys(choices)){
    const a=raw.choices?.[k];
    if(decisions[k].some(o=>o[0]===a))choices[k]=a;
    if(Array.isArray(raw.confirmed)&&raw.confirmed.includes(k))confirmed.push(k);
  }
  if(!s.operations.offer&&['accept','reject'].includes(choices.fundraising)||s.operations.offer&&choices.fundraising==='attempt'){
    choices.fundraising='bootstrap';const i=confirmed.indexOf('fundraising');if(i>=0)confirmed.splice(i,1);
  }
  return {version:3,role:Object.hasOwn(roles,raw?.role)?raw.role:'ceo',month,phase:same&&['active','outcome'].includes(raw.phase)?raw.phase:'briefing',choices,confirmed,reason:same&&typeof raw.reason==='string'?raw.reason.slice(0,2000):'',tutorialSeen:raw?.tutorialSeen===true,seenRooms:Array.isArray(raw?.seenRooms)?[...new Set(raw.seenRooms.filter(r=>Object.hasOwn(roomCategories,r)))]:[]};
}
export const ready=(s,x)=>missions(s,x.role).every(m=>x.confirmed.includes(m.category));
