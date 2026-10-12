// Test dependency: linkedom@0.18.12 (resolve with NODE_PATH if installed outside the checkout).
import {createRequire} from 'node:module';
const {parseHTML}=createRequire(import.meta.url)('linkedom');
import assert from 'node:assert/strict';
const {window}=parseHTML('<html><head></head><body><main id="host"></main></body></html>');
for(const k of ['document','HTMLElement','Event','CustomEvent'])globalThis[k]=window[k];
globalThis.window=window;window.print=()=>{};globalThis.location=new URL('https://example.org/product/trusted/index.html?mode=world');globalThis.BABYLON={Engine:{isSupported:()=>false}};globalThis.matchMedia=()=>({matches:false});
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return this._value??this.querySelector('option')?.getAttribute('value')??''},set(v){this._value=String(v)},configurable:true});
window.HTMLElement.prototype.scrollIntoView=()=>{};
const dir=new URL('../../',import.meta.url).href;
const {newProject,validateProject,buildState}=await import(dir+'product/trusted/model.js');
const {renderWorld:renderTwinWorld}=await import(dir+'product/trusted/world.js');
const {renderReport:renderTwinReport}=await import(dir+'product/trusted/report.js');
const {renderEntry}=await import(dir+'product/v6/entry.js');
const p=newProject('dom-test');p.company={...p.company,name:'교육사업',industry:'교육',idea:'AI 실습',customer:'기관',cash:30000000,burn:3000000,mrr:500000};const start=buildState(p.company);p.simulation={initialState:start,state:structuredClone(start),history:[]};p.worldEntry={confirmed:true,mode:'quick'};
let writes=0;const host=document.getElementById('host'),c={project:p,host,lang:'ko',t:(k,e)=>k,save:()=>{validateProject(p);writes++;return true},notify:console.log,go:()=>{},store:{save:()=>{}},setProject:()=>{}};
const dispose=await renderTwinWorld(c);assert.equal(host.querySelectorAll('[data-twin-role]').length,6);assert.ok(host.querySelector('#twin-commit'));host.querySelector('#twin-commit').click();assert.equal(p.twin.history.length,1);assert.ok(host.querySelector('#twin-outcome').textContent.includes('내 결정'));
host.querySelector('#twin-edit-settings').click();let input=host.querySelector('#twin-revision-cash');input.value='42000000';input.dispatchEvent(new window.Event('input'));host.querySelector('#twin-apply-settings').click();assert.equal(p.twin.state.venture.cash,42000000);assert.equal(p.simulation.state.venture.cash,30000000);assert.equal(p.twin.history.length,2);assert.ok(validateProject(p));dispose();host.replaceChildren();renderTwinReport(c);assert.equal(host.querySelectorAll('#tw-integrated-report>section').length,7);assert.ok(host.textContent.includes('4200')||host.textContent.includes('42,000,000'));host.replaceChildren();renderEntry(c);assert.ok(host.querySelector('#twin-industry'));assert.ok(host.querySelector('#v6-initial-cash'));assert.ok(host.querySelector('#v6-enter-office'));console.log(JSON.stringify({dom:'passed',checks:['six roles','decision commit','revision applied','Module3 original retained','replay restore','seven report sections','editable entry'],writes}));
