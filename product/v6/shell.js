import {el} from '../trusted/ui.js';
export const root=new URL('../../',import.meta.url);
export function installShell(lang=document.documentElement.lang==='en'?'en':'ko'){
 if(!document.getElementById('v6-style'))document.head.append(el('link',{id:'v6-style',rel:'stylesheet',href:new URL('./cosmic.css',import.meta.url).href}));
 if(!document.getElementById('journey-style'))document.head.append(el('link',{id:'journey-style',rel:'stylesheet',href:new URL('../journey/journey.css',import.meta.url).href}));
 document.querySelectorAll('.p-maker-credit,.p-footer').forEach(n=>n.remove());
 document.getElementById('asnm-footer')?.remove();
 const t=(k,e)=>lang==='ko'?k:e;
 const links=[['Privacy Policy','privacy.html'],['Terms of Use','product/v6/policy.html?section=terms'],['AI Disclaimer','product/v6/policy.html?section=ai'],['Contact & Feedback','product/v6/feedback.html']];
 const footer=el('footer',{id:'asnm-footer',class:'v6-footer'},el('p',{},'ASNM · Created by ',el('strong',{text:'If Lab'})),el('nav',{'aria-label':t('서비스 안내','Service information')},...links.map(([label,path])=>{const u=new URL(path,root);u.searchParams.set('lang',lang);return el('a',{href:u.href,text:label});})),el('p',{class:'v6-disclaimer',text:t('AI와 시뮬레이션은 의사결정을 돕습니다. 최종 결정은 창업자에게 있습니다.','AI and simulations support your decisions. The founder makes the final choice.')}),el('small',{text:'© '+new Date().getFullYear()+' If Lab · ASNM V6 beta'}));
 document.body.append(footer);return footer;
}
