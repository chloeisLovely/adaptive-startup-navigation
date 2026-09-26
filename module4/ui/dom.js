export const el=(tag,props={},...children)=>{
  const node=document.createElement(tag);
  for(const [key,value] of Object.entries(props)) {
    if(key==='class') node.className=value;
    else if(key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(),value);
    else if(key==='text') node.textContent=value;
    else if(value!==false && value!=null) node.setAttribute(key,String(value));
  }
  node.append(...children.filter(x=>x!=null)); return node;
};
export const money=(value,currency='USD',lang='ko')=>new Intl.NumberFormat(lang==='ko'?'ko-KR':'en-US',{style:'currency',currency,maximumFractionDigits:0}).format(value);
export const fmt=n=>n===null?'∞':new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
export function download(text,name,type='application/json') {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const a=el('a',{href:url,download:name}); document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
