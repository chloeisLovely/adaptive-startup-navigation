import {el,table,note} from '../trusted/ui.js';
const ns='http://www.w3.org/2000/svg';function svgNode(tag,attrs={},text){const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=String(text);return n;}
export function radar(scores,labels,lang='ko'){
 const wrap=el('figure'),svg=svgNode('svg',{viewBox:'0 0 500 370',class:'v6-chart',role:'img','aria-label':lang==='ko'?'응답한 창업자 영역 자신감, 1–5점':'Founder confidence by answered domain, 1–5'}),cx=250,cy=180,r=118;
 const point=(i,f)=>[cx+Math.cos(i*Math.PI/3-Math.PI/2)*r*f,cy+Math.sin(i*Math.PI/3-Math.PI/2)*r*f];
 for(let level=1;level<=5;level++)svg.append(svgNode('polygon',{points:scores.map((_,i)=>point(i,level/5).join(',')).join(' '),fill:'none',stroke:'#688199','stroke-width':.7}));
 scores.forEach((s,i)=>{const p=point(i,1),l=point(i,1.33);svg.append(svgNode('line',{x1:cx,y1:cy,x2:p[0],y2:p[1],stroke:'#688199'}),svgNode('text',{x:l[0],y:l[1],'text-anchor':'middle','font-size':12,fill:'#233d56'},labels[i]));if(s.score!==null){const q=point(i,s.score/5);svg.append(svgNode('circle',{cx:q[0],cy:q[1],r:5,fill:'#24a4b3'}));}});
 if(scores.every(s=>s.score!==null))svg.append(svgNode('polygon',{points:scores.map((s,i)=>point(i,s.score/5).join(',')).join(' '),fill:'#3cbdc833',stroke:'#2598aa','stroke-width':2}));
 wrap.append(svg,note(lang==='ko'?'미응답 영역은 점을 표시하지 않습니다. 각 점은 답한 문항 평균이며, 실제 수행능력 점수가 아닙니다.':'Missing domains have no point. Values average answered items, not demonstrated ability.'));return wrap;
}
export function cashChart(sim,lang='ko'){
 const t=(k,e)=>lang==='ko'?k:e;if(!sim?.history.length)return note(t('완료한 실험이 없어 현금 추이를 그리지 않습니다.','No completed experiment: cash trend is unavailable.'));
 const values=[{month:sim.initialState.simulation.currentMonth,value:sim.initialState.venture.cash},...sim.history.map(h=>({month:h.month,value:h.stateAfter.venture.cash}))],min=Math.min(0,...values.map(v=>v.value)),max=Math.max(1,...values.map(v=>v.value)),span=max-min;
 const svg=svgNode('svg',{viewBox:'0 0 560 250',class:'v6-chart',role:'img','aria-label':t('기록된 모델 현금 추이','Recorded modeled cash trend')});
 const point=(v,i)=>[60+i/(values.length-1)*470,190-(v.value-min)/span*150];
 svg.append(svgNode('line',{x1:60,y1:190,x2:530,y2:190,stroke:'#778da3'}),svgNode('polyline',{points:values.map((v,i)=>point(v,i).join(',')).join(' '),fill:'none',stroke:'#2395aa','stroke-width':3}));
 values.forEach((v,i)=>{const[x,y]=point(v,i);svg.append(svgNode('circle',{cx:x,cy:y,r:4,fill:'#2395aa'}));if(i===0||i===values.length-1)svg.append(svgNode('text',{x,y:y-10,'text-anchor':i===0?'start':'end',fill:'#233d56'},v.value.toLocaleString()),svgNode('text',{x,y:218,'text-anchor':'middle',fill:'#233d56'},t('월 ','Month ')+v.month));});
 return el('figure',{},el('figcaption',{text:t('모델 현금 추이 · ','Modeled cash trend · ')+sim.state.currency}),svg,table([t('월','Month'),t('현금','Cash')],values.map(v=>[v.month,v.value.toLocaleString()])));
}
