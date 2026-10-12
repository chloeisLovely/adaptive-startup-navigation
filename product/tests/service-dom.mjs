// Offline DOM and recognition lifecycle tests, not a claim of rendered browser QA.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {parseHTML}=createRequire(import.meta.url)('linkedom');
const {window}=parseHTML('<html><head></head><body><main id="host"></main></body></html>');
for(const k of ['document','HTMLElement','Event','CustomEvent'])globalThis[k]=window[k];
globalThis.window=window;globalThis.dispatchEvent=window.dispatchEvent.bind(window);globalThis.addEventListener=window.addEventListener.bind(window);globalThis.location=new URL('https://example.org/product/trusted/index.html?mode=market');globalThis.history={replaceState(){}};globalThis.matchMedia=()=>({matches:true});
const memory=()=>{const m=new Map;return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i],get length(){return m.size}}};globalThis.localStorage=memory();globalThis.sessionStorage=memory();window.HTMLElement.prototype.scrollIntoView=()=>{};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return this._value??this.querySelector('option')?.getAttribute('value')??''},set(v){this._value=String(v)},configurable:true});
const records=[];class Recognition{constructor(){records.push(this)}start(){this.started=true}abort(){this.aborted=true}result(text){this.onresult?.({results:[[{transcript:text}]]})}}globalThis.SpeechRecognition=Recognition;
const {mountWorkspace,setActiveProject}=await import('../trusted/workspace.js');
const {newProject,importProject}=await import('../trusted/model.js');
const {sectors}=await import('../journey/topics.js');
const {renderReport}=await import('../trusted/report.js');
const {voiceControls}=await import('../v6/speech.js');
const p=newProject('journey-dom');setActiveProject(p);const host=document.getElementById('host');
const render=(mode,lang='ko')=>mountWorkspace(host,mode,lang);
const input=(id,v)=>{const n=host.querySelector('#'+id);assert.ok(n,id);n.value=String(v);n.dispatchEvent(new Event('input'));return n;};
// New canonical service flow: ten choices, persistent icon plans, optional writing.
render('founder');assert.equal(host.querySelectorAll('.v6-portrait').length,6);assert.equal(host.querySelector('[data-answer]'),null);host.querySelector('#service-start-quiz').click();
for(let i=0;i<10;i++){assert.ok(host.querySelector('#service-quiz-next').disabled);host.querySelector('[data-quick-answer]').click();assert.equal(host.querySelector('#service-quiz-next').disabled,false);host.querySelector('#service-quiz-next').click();}
assert.equal(p.quickCheck.answers.length,10);assert.equal(p.founderFlow,'result');assert.ok(host.querySelector('.eco-panel'));assert.equal(host.querySelector('a[href*=RESEARCH]'),null);
p.company={builderVersion:2,step:0};p.barl={};render('builder');host.querySelector('#tw-builder-next').click();assert.equal(p.company.step,1);assert.equal(p.company.cash,undefined);assert.equal(host.querySelectorAll('[data-region]').length,11);host.querySelector('[data-region]').click();host.querySelector('#tw-builder-next').click();
assert.equal(p.company.step,2);assert.equal(host.querySelectorAll('[data-industry]').length,36);host.querySelector('[data-industry="rail"]').click();assert.ok(p.company.idea);const tech=host.querySelector('[data-design=technology] [data-design-value]');const techId=tech.dataset.designValue;tech.click();input('service-technology-other','철도 안전 센서');assert.match(host.querySelector('.service-advisor-context').textContent,/철도 안전 센서/);host.querySelector('#tw-builder-next').click();
assert.equal(p.company.step,3);assert.equal(host.querySelectorAll('[data-design=talent] [data-design-value]').length,24);host.querySelector('[data-design=talent] [data-design-value]').click();host.querySelector('#tw-builder-next').click();assert.equal(host.querySelectorAll('[data-design=culture] [data-design-value]').length,20);host.querySelector('[data-design=culture] [data-design-value]').click();host.querySelector('#tw-builder-next').click();assert.ok(host.querySelector('#tw-enter-world'));assert.match(host.textContent,/철도 안전 센서/);
const copy=importProject(JSON.stringify(p),'service-copy');assert.deepEqual(copy.design,p.design);assert.deepEqual(copy.quickCheck,p.quickCheck);
const {buildState,validateProject}=await import('../trusted/model.js');const {profileFrom,createTwin}=await import('../twin/model.js');const state=buildState(p.company),profile=profileFrom(p,state);assert.ok(profile.evidence.some(e=>e.text.includes('철도 안전 센서')));createTwin(state,profile);assert.equal(state.venture.teamSize,1);assert.equal(p.company.burn,undefined);
const {adviceContext,requestAdvice}=await import('../v6/advice.js');const ctx=adviceContext(p,'builder');assert.equal(ctx.ventureDesign.length,3);let sent;await requestAdvice('질문을 끝까지 보존',ctx,'ko',[], 'https://test.example',async(u,o)=>{sent=JSON.parse(o.body);return {ok:false}});assert.equal(JSON.parse(sent.messages[1].content).question,'질문을 끝까지 보존');
const bad=structuredClone(p);bad.design.technology.selected.push('invalid-id');assert.throws(()=>validateProject(bad),/design/);const duplicate=structuredClone(p);duplicate.design.technology.selected.push(techId);assert.throws(()=>validateProject(duplicate),/design/);
host.replaceChildren();renderReport({host,project:p,lang:'ko',t:(k,e)=>k,notify:()=>{},go:()=>{},save:()=>true});assert.match(host.textContent,/철도 안전 센서/);assert.equal(host.querySelectorAll('.journey-risk-tile').length,7);assert.doesNotMatch(host.textContent,/SEM|SUS|n=190|RESEARCH|V6 beta/);
for(const lang of ['ko','en']){p.company.step=2;render('builder',lang);assert.equal(host.querySelectorAll('[data-design-value][aria-pressed=true]').length,1);assert.equal(host.querySelector('#service-technology-other').value,'철도 안전 센서');}
console.log('PASS service intro/10-question/CEO flow, no-writing six-stage journey, 36 sectors, 11 regions, 26/24/20 design choices, advisor context, import, twin evidence, no automatic hiring, report and invalid design rejection');
