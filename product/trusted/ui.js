import {el,download} from '../../module4/ui/dom.js';
export {el,download};
export const button=(label,fn,props={})=>el('button',{type:'button',text:label,onclick:fn,...props});
export const card=(...children)=>el('section',{class:'tw-card tw-stack'},...children);
export const note=text=>el('p',{class:'tw-note',text});
export const field=(id,label,value,change,props={})=>{const n=el(props.multiline?'textarea':'input',{id,type:'text',maxlength:'600',...props,oninput:()=>change(n.value)});n.value=value??'';return el('label',{},label,n);};
export const select=(id,label,value,options,change)=>{const n=el('select',{id,onchange:()=>change(n.value)},...options.map(([value,text])=>el('option',{value,text})));n.value=value;return el('label',{},label,n);};
export const details=(label,...children)=>el('details',{},el('summary',{text:label}),...children);
export const row=(...children)=>el('div',{class:'tw-row'},...children);
export const grid=(...children)=>el('div',{class:'tw-grid'},...children);
export const list=values=>el('ul',{},...values.map(text=>el('li',{text})));
export function table(headers,rows){return el('div',{class:'tw-table-wrap'},el('table',{},el('thead',{},el('tr',{},...headers.map(text=>el('th',{scope:'col',text})))),el('tbody',{},...rows.map(cells=>el('tr',{},...cells.map(text=>el('td',{text:String(text??'—')})))))));}
export const safeURL=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
export function metricLabel(key,lang,currency='KRW'){
 const labels={cash:['보유 현금','Cash',currency],burn:['월 운영비','Monthly costs',currency],monthlyBurn:['월 운영비','Monthly costs',currency],mrr:['월 반복매출','Recurring monthly revenue',currency],runway:['자금 기간','Runway',lang==='ko'?'개월':'months'],productProgress:['제품 준비 지표','Product readiness','/100'],retention:['고객 유지율','Customer retention','%'],teamSize:['팀 인원','Team size',lang==='ko'?'명':'people']};
 const v=labels[key];return v?`${v[lang==='en'?1:0]} (${v[2]})`:key;
}
