import {el,money,fmt} from './dom.js';
export const metrics=[
  ['cash','Cash','현금','money'],['runway','Runway','순소진 기준 Runway','months'],['mrr','MRR','월 반복매출','money'],['monthlyBurn','Monthly burn','월 총비용','money'],['cac','CAC','고객획득비','money'],['retention','Retention','월 고객유지율','%'],['teamSize','Team','팀 규모',''],['teamCapacity','Capacity','팀 실행역량','/100'],['productProgress','Product','제품 완성도','/100'],['demand','Demand','시장수요','/100'],['competition','Competition','경쟁강도','/100'],['marketGrowth','Market growth','연 시장성장률','%/yr']
];
export const readMetric=(state,key)=>state.venture[key]===undefined?state.market[key]:state.venture[key];
export function dashboard(container,state,before,lang) {
  container.replaceChildren(...metrics.map(([key,en,ko,unit])=>{
    const value=readMetric(state,key),previous=before?readMetric(before,key):value;
    const delta=value!==null && previous!==null ? Math.round((value-previous)*100)/100 : null;
    const valueText=unit==='money'?money(value,state.currency,lang):fmt(value)+(value===null?'':` ${unit==='months'?(lang==='ko'?'개월':'mo'):unit}`);
    const deltaText=delta===null?(lang==='ko'?'순소진 상태 변경':'Net-burn status change'):delta===0?'—':`${delta>0?'↑':'↓'} ${unit==='money'?money(Math.abs(delta),state.currency,lang):fmt(Math.abs(delta))}`;
    return el('div',{class:'metric','data-metric':key},el('div',{class:'label',text:lang==='ko'?ko:en}),el('div',{class:'value mono',text:valueText}),el('div',{class:`delta mono ${delta?'changed':''}`,text:deltaText}));
  }));
}
export function changeTable(log,lang) {
  const head=el('tr',{},...(lang==='ko'?['지표','결정 전','결정 후','이벤트 후','월말']:['Metric','Before','Decisions','Event','Month end']).map(t=>el('th',{text:t})));
  const stages=[log.stateBefore,log.stages.afterDecisions,log.stages.afterEvent,log.stateAfter];
  const body=metrics.map(([key,en,ko])=>{
    const cells=stages.map(s=>el('td',{text:fmt(readMetric(s,key))}));
    return el('tr',{},el('td',{text:lang==='ko'?ko:en}),...cells);
  });
  return el('div',{class:'table-wrap'},el('table',{},el('thead',{},head),el('tbody',{},...body)));
}
