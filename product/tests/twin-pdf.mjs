// Offline integration: actual report DOM, bundled PDF runtime/font. No browser or network.
// NODE_PATH must resolve linkedom@0.18.12; ASNM_PDF_OUTPUT chooses a temporary QA folder.
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{parseHTML}=require('linkedom');
const {document}=parseHTML('<html><head></head><body><main></main></body></html>');
globalThis.document=document;
Object.defineProperty(document.defaultView.HTMLSelectElement.prototype,'value',{get(){return this._value??this.querySelector('option')?.getAttribute('value')??''},set(v){this._value=String(v)},configurable:true});
globalThis.PDFLib=require('../v6/vendor/pdf-lib.min.js');
globalThis.fontkit=require('../v6/vendor/fontkit.umd.min.js');
globalThis.fetch=async url=>{assert.equal(new URL(url).protocol,'file:');const bytes=await readFile(url);return {ok:true,arrayBuffer:async()=>bytes};};
const {newProject,buildState}=await import('../trusted/model.js');
const {createTwin,commitAction,reviseTwin}=await import('../twin/model.js');
const {initialProfile}=await import('../twin/settings.js');
const {localProposal}=await import('../twin/agents.js');
const {renderTwinReport}=await import('../twin/report.js');
const {createReportPDF}=await import('../v6/pdf.js');
const output=process.env.ASNM_PDF_OUTPUT||'/tmp/asnm-twin-pdf';await mkdir(output,{recursive:true});
for(const lang of ['ko','en']){
 const p=newProject('pdf-qa-'+lang);
 p.company={...p.company,name:lang==='ko'?'가상 베이커리 실험':'Fictional Education Studio',industry:lang==='ko'?'베이커리':'Education',idea:lang==='ko'?'예약 배송 서비스':'AI workshops',customer:lang==='ko'?'지역 직장인':'Adult learners',cash:30000000,burn:3000000,mrr:500000};
 const state=buildState(p.company);p.twin=createTwin(state,initialProfile(p,state));
 const proposal=localProposal(p.twin,lang);commitAction(p.twin,proposal.actions[0],{reason:lang==='ko'?'고객 수요를 먼저 확인하기 위해 선택했습니다.':'Validate demand before a larger investment.',proposal,timestamp:'2026-10-12T05:00:00Z'});
 p.twin.dialogue=proposal.turns.map(t=>({...t,source:'rules'}));
 const revised=structuredClone(p.twin.state);revised.venture.cash+=1000000;
 reviseTwin(p.twin,revised,{...p.twin.profile,goal:lang==='ko'?'예약 고객 20명 검증':'Validate twenty reservations'},'Synthetic revision','2026-10-12T05:30:00Z');
 const host=document.querySelector('main');host.replaceChildren();renderTwinReport({project:p,host,lang,t:(k,e)=>lang==='ko'?k:e,go:()=>{},notify:()=>{}});
 const article=host.querySelector('article');assert.equal(article.querySelectorAll(':scope>section').length,7);
 // LinkeDOM lacks these read-only HTML table collections.
 for(const table of article.querySelectorAll('table'))Object.defineProperty(table,'rows',{value:table.querySelectorAll('tr')});
 for(const row of article.querySelectorAll('tr'))Object.defineProperty(row,'cells',{value:row.querySelectorAll('th,td')});
 const bytes=await createReportPDF(article,lang),pdf=await PDFLib.PDFDocument.load(bytes);
 assert.ok(pdf.getPageCount()>0);const path=output+'/twin-report-'+lang+'.pdf';await writeFile(path,bytes);
 console.log(JSON.stringify({lang,path,pages:pdf.getPageCount(),bytes:bytes.length}));
}
