import {experienceState} from '../experience/MissionDirector.js';
import {clone,validateState,MODEL_VERSION} from './ASNMState.js';
import {fromModule3} from './Module3Adapter.js';
import {simulateMonth} from '../simulation/SimulationEngine.js';
export const PREFIX=`asnm:${new URL('../../',import.meta.url).pathname}:`;
export const SESSION_KEY=PREFIX+'module4:v1';
export const SOURCE_KEY=PREFIX+'module3:v1';
export function createSession(state) {
  const s=validateState(state);
  return {schemaVersion:1,modelVersion:MODEL_VERSION,initialState:clone(s),state:s,history:[],reflections:{}};
}
const canonical=v=>JSON.stringify(v,(_,x)=>x && typeof x==='object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])) : x);
export function validateSession(data) {
  if(data?.schemaVersion!==1 || data.modelVersion!==MODEL_VERSION || !Array.isArray(data.history) || data.history.length>60) throw new Error('Unsupported session format');
  const session=createSession(data.initialState);
  for(const row of data.history) {
    if(!Array.isArray(row.decisions) || row.decisions.length!==6) throw new Error('Invalid decision history');
    const choices=Object.fromEntries(row.decisions.map(d=>[d.category,d.action]));
    const result=simulateMonth(session.state,choices,row.founderReason,row.timestamp);
    session.state=result.state; session.history.push(result.log);
  }
  if(canonical(session.state)!==canonical(validateState(data.state))) throw new Error('Session does not match its reproducible decision history');
  for(const [id,value] of Object.entries(data.reflections || {})) {
    if(!/^[0-9]+-[0-9]+-review-[0-9]+$/.test(id) || typeof value!=='string' || value.length>2000) throw new Error('Invalid reflection');
    session.reflections[id]=value;
  }
  if(data.productRole!==undefined){if(!['CEO','CTO','CFO','Growth','Product'].includes(data.productRole))throw new Error('Invalid player role');session.productRole=data.productRole;}
  if(data.decisionJournal!==undefined){
    if(!Array.isArray(data.decisionJournal)||data.decisionJournal.length>session.history.length)throw new Error('Invalid decision journal');
    const seen=new Set();
    session.decisionJournal=data.decisionJournal.map(row=>{
      const log=session.history.find(l=>l.id===row.logId);
      if(!log||seen.has(row.logId)||typeof row.option!=='string'||row.option.length>200||typeof row.reason!=='string'||row.reason.length>2000||!(row.expectedGrowth===null||(Number.isFinite(row.expectedGrowth)&&row.expectedGrowth>=-100&&row.expectedGrowth<=1000)))throw new Error('Invalid decision journal row');
      seen.add(row.logId);const before=log.stateBefore.venture.mrr,after=log.stateAfter.venture.mrr;
      return {logId:log.id,option:row.option,reason:row.reason,expectedGrowth:row.expectedGrowth,modeledGrowth:before>0?(after/before-1)*100:null};
    });
  }
  if(data.experience)session.experience=experienceState(data.experience,session.state);
  return session;
}
export function decodeImport(text) {
  if(text.length>8*1024*1024) throw new Error('JSON file exceeds 8 MB');
  const data=JSON.parse(text);
  if(data?.history) return {session:validateSession(data)};
  if(data?.company) return {state:fromModule3(data)};
  return {state:validateState(data)};
}
/** Replace this adapter with a server-backed store; the engine is unchanged. */
export class StateStore {
  constructor(storage) { this.storage=storage; }
  readSource() {const raw=this.storage.getItem(SOURCE_KEY); return raw ? validateState(JSON.parse(raw)) : null;}
  saveSource(state) {this.storage.setItem(SOURCE_KEY,JSON.stringify(validateState(state)));}
  load() {const raw=this.storage.getItem(SESSION_KEY); return raw ? validateSession(JSON.parse(raw)) : null;}
  save(session) {this.storage.setItem(SESSION_KEY,JSON.stringify(session));}
  export(session) {return JSON.stringify(session,null,2);}
}
