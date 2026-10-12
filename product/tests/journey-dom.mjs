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
render('market');assert.equal(host.querySelectorAll('[data-sector]').length,36);assert.equal(host.querySelectorAll('[data-sector-group]').length,9);
const [a,b]=[sectors[0][0],sectors[10][0]];
host.querySelector(`[data-sector="${a}"]`).click();host.querySelector(`[data-sector="${b}"]`).click();input('tw-topic','철도 안전 점검');
assert.deepEqual(p.marketDraft.sectors,[a,b]);render('market','en');assert.deepEqual(p.marketDraft.sectors,[a,b]);assert.equal(host.querySelectorAll('[data-sector][aria-pressed=true]').length,2);assert.equal(host.querySelector('#tw-topic').value,'철도 안전 점검');
input('tw-industry-filter','does-not-exist');assert.equal(host.querySelectorAll('[data-sector]').length,0);assert.equal(host.querySelectorAll('.journey-selected-chip').length,2);host.querySelector('.journey-selected-chip').click();assert.deepEqual(p.marketDraft.sectors,[b]);
host.querySelector('form').dispatchEvent(new Event('submit',{cancelable:true}));assert.match(p.opportunity.topic,/철도 안전 점검/);assert.ok(host.querySelector('[data-opportunity]'));assert.deepEqual(importProject(JSON.stringify(p),'copy').marketDraft,p.marketDraft);
render('founder');assert.equal(host.querySelectorAll('.v6-dna-card>summary .v6-portrait').length,6);assert.equal(host.querySelectorAll('.v6-dna-card[open]').length,0);p.assessment.step=18;p.assessment.answers={d1:4,l1:5};render('founder');assert.match(host.textContent,/CEO|경영/);assert.ok(host.querySelector('.eco-panel'));
p.company.step=0;render('builder');assert.equal(host.querySelectorAll('.journey-step').length,6);assert.equal(host.querySelector('#tw-barl-failReason1').closest('details').querySelector('summary').textContent,'기타 · 직접 쓰거나 말하기');host.querySelector('#journey-skip-barl').click();assert.equal(p.company.step,1);assert.equal(p.barl.survival,undefined);
let field=host.querySelector('#tw-customer');let label=field.closest('label');label.querySelector('[data-preset]').click();assert.ok(p.company.customer);label.querySelector('details').open=true;
label.querySelector('.v6-voice button').click();let mic=records.at(-1);mic.result('철도 운영기관');assert.equal(p.company.customer,'철도 운영기관');assert.equal(field.value,'철도 운영기관');
// Switching fields stops the old microphone. Late results cannot overwrite saved inputs.
host.querySelector('#tw-company-name').closest('label').querySelector('.v6-voice button').click();assert.ok(mic.aborted);mic.result('late old field');assert.equal(p.company.customer,'철도 운영기관');mic=records.at(-1);mic.result('가상 안전기업');assert.equal(p.company.name,'가상 안전기업');render('builder');assert.ok(mic.aborted);mic.result('late after render');assert.equal(p.company.name,'가상 안전기업');
p.company.step=4;render('builder');const ready=host.querySelector('.journey-readiness-choice');ready.querySelectorAll('.journey-quick-picks button')[1].click();assert.equal(p.readiness.finance.state,'gap');input('ready-finance','정기 비용 확인 필요');render('builder');assert.equal(host.querySelector('#ready-finance').value,'정기 비용 확인 필요');
// Browser without recognition leaves typing usable, and no microphone starts automatically.
delete globalThis.SpeechRecognition;const plain=document.createElement('input'),fallback=voiceControls(plain);assert.ok(fallback.querySelector('button').disabled);assert.match(fallback.textContent,/텍스트/);
host.replaceChildren();renderReport({host,project:p,lang:'ko',t:(k,e)=>k,notify:()=>{},go:()=>{},save:()=>true});assert.equal(host.querySelectorAll('.journey-risk-tile').length,7);assert.match(host.textContent,/30일 창업 준비/);assert.match(host.textContent,/정기 비용 확인 필요/);assert.ok(host.querySelector('#v6-download-pdf'));
console.log('PASS 36-sector selection/filter/locale/import, six visible human portraits, CEO results, six builder stages, unknown skip, choices and Other voice, microphone cancellation/late-result guards, readiness persistence and seven-area report');
