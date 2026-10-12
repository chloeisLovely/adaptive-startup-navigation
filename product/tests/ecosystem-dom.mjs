// Offline DOM integration. This does not claim visual browser QA.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {parseHTML}=createRequire(import.meta.url)('linkedom');
const {window}=parseHTML('<html><head></head><body><main id="host"></main></body></html>');
for(const k of ['document','HTMLElement','Event','CustomEvent'])globalThis[k]=window[k];
globalThis.window=window;globalThis.dispatchEvent=window.dispatchEvent.bind(window);globalThis.addEventListener=window.addEventListener.bind(window);globalThis.location=new URL('https://example.org/product/trusted/index.html?mode=builder');globalThis.history={replaceState(){}};globalThis.matchMedia=()=>({matches:true});
const memory=()=>{const m=new Map;return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i],get length(){return m.size}}};globalThis.localStorage=memory();globalThis.sessionStorage=memory();window.HTMLElement.prototype.scrollIntoView=()=>{};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return this._value??this.querySelector('option')?.getAttribute('value')??''},set(v){this._value=String(v)},configurable:true});
const {mountWorkspace,getActiveProject,setActiveProject}=await import('../trusted/workspace.js');
const {newProject,validateProject,importProject}=await import('../trusted/model.js');
const {ecosystemPanel,companyPanel}=await import('../ecosystem/ui.js');
const p=newProject('ecosystem-dom');setActiveProject(p);const host=document.getElementById('host');let requested;
globalThis.ASNM_CONFIG={aiProxyUrl:'https://ai.example'};
globalThis.fetch=async(url,opts)=>{requested=JSON.parse(opts.body);return {ok:true,json:async()=>({content:JSON.stringify({summary:'Synthetic summary',problem:'Synthetic problem',reason:'Current inputs',options:'A or B',tradeoff:'Cost versus evidence',nextAction:'Verify costs',followup:'What evidence?',module:'m3a'})})}};
const input=(id,value)=>{const n=host.querySelector('#'+id);assert.ok(n,id);n.value=String(value);n.dispatchEvent(new window.Event('input'));};
const render=()=>mountWorkspace(host,'builder','ko');render();
assert.match(host.textContent,/생각의 사각지대/);assert.equal(host.querySelector('progress').getAttribute('max'),'6');assert.ok(host.querySelector('[data-advisor="builder"]'));host.querySelector('#tw-builder-next').click();assert.equal(p.company.step,0);
for(const [id,value] of [['survival',0],['growth',0],['months',0],['failReason1','수요'],['failReason2','현금'],['failReason3','기술']])input('tw-barl-'+id,value);
host.querySelector('#tw-builder-next').click();assert.equal(p.company.step,1);input('tw-company-name','가상 교육기업');input('tw-industry','교육 AI');input('tw-idea','실습 교육');host.querySelector('#tw-builder-next').click();assert.equal(p.company.step,2);
host.querySelector('#tw-business-model [data-value="transaction"]').click();input('tw-unitPrice',5000);input('tw-monthlyUnits',100);host.querySelector('#tw-builder-next').click();assert.equal(p.company.step,3);host.querySelector('#tw-team-priority [data-value="HR"]').click();host.querySelector('#tw-builder-next').click();assert.equal(p.company.step,4);input('tw-cash',12000000);input('tw-burn',3000000);input('tw-mrr',0);assert.match(host.querySelector('[data-builder-risk]').textContent,/6개월 미만/);
const advisor=host.querySelector('.v6-advisor');advisor.querySelector('textarea').value='합성 테스트: 입력한 현금을 검토해줘';advisor.querySelector('input[type=checkbox]').checked=true;advisor.querySelector('[data-review-question]').click();await new Promise(r=>setTimeout(r,20));const sent=JSON.parse(requested.messages[1].content);assert.equal(sent.context.draftCompany.cash,'12000000');assert.equal(sent.context.builderStep.index,4);assert.equal(p.adviceHistory.length,1);render();assert.match(host.querySelector('.eco-advice-history').textContent,/Synthetic summary/);
host.querySelector('#tw-builder-next').click();assert.equal(p.company.step,5);assert.ok(host.querySelector('#tw-enter-world'));assert.match(host.textContent,/실제 기업/);assert.equal(validateProject(p).barl.survival,'0');
// Eligibility state and program-specific checklists remain editable and survive export.
const c={project:p,t:(k,e)=>k,lang:'ko',save:()=>true,notify:()=>{}};host.replaceChildren(ecosystemPanel(c));const country=host.querySelector('#eco-country');country.value='KR';country.dispatchEvent(new window.Event('change'));const check=host.querySelector('input[type=checkbox]');check.checked=true;check.dispatchEvent(new window.Event('change'));const copy=importProject(JSON.stringify(p),'roundtrip');assert.ok(Object.values(copy.ecosystem.checklist).some(row=>Object.values(row).includes(true)));
// Unknown business areas do not receive unrelated company cards; portrait fallback is safe text.
p.company.industry='quantum rail';p.company.idea='signals';host.replaceChildren(companyPanel(c));assert.match(host.textContent,/찾지 못했습니다/);
console.log('PASS six-step builder, zero-valued BARL, edited AI context, restored history, dynamic risks, checklist round trip and empty matching');
// Re-entering from the builder after a twin decision must fork, even if legacy history is empty.
const {builder}=await import('../ecosystem/builder.js');
const {buildState}=await import('../trusted/model.js');
const {createTwin,profileFrom,commitAction}=await import('../twin/model.js');
const {localProposal}=await import('../twin/agents.js');
p.company.name='Synthetic';p.company.step=5;const state=buildState(p.company);p.simulation={initialState:state,state:structuredClone(state),history:[]};p.twin=createTwin(state,profileFrom(p,state));commitAction(p.twin,localProposal(p.twin).actions[0]);let fork,route;
host.replaceChildren();builder({...c,host,rerender:()=>{},setProject:x=>fork=x,store:{save:x=>validateProject(x)},go:x=>route=x});host.querySelector('#tw-enter-world').click();assert.equal(route,'world');assert.equal(p.twin.history.length,1);assert.notEqual(fork.id,p.id);assert.equal(fork.twin,undefined);assert.equal(fork.simulation.history.length,0);console.log('PASS rebuilding forks completed twin and retains original decision history');
