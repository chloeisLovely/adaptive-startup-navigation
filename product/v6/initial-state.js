import {clone,validateState} from '../../module4/state/ASNMState.js';
import {buildState,simulateDecision} from '../trusted/model.js';
// Input drafts retain blanks. Only an explicit confirmation creates engine state.
export const initialFields=[
 ['cash','venture','cash',0,1e15,'보유현금','Cash'],
 ['burn','venture','monthlyBurn',0,1e13,'월 운영비','Monthly costs'],
 ['mrr','venture','mrr',0,1e13,'월 반복매출','Monthly recurring revenue'],
 ['team','venture','teamSize',1,100,'현재 팀 인원','Current headcount'],
 ['progress','venture','productProgress',0,100,'제품 완성도 (0–100)','Product readiness (0–100)'],
 ['demand','market','demand',0,100,'수요 가정 (0–100)','Demand assumption (0–100)'],
 ['retention','venture','retention',0,100,'월 고객 유지율 (%)','Monthly retention (%)'],
 ['cac','venture','cac',1,1e10,'고객 확보 비용','Customer acquisition cost'],
 ['marketing','operations','marketingBudget',0,1e13,'월 마케팅비 · 운영비에 포함','Monthly marketing · included in costs'],
 ['capacity','venture','teamCapacity',0,100,'팀 실행 역량 (0–100)','Team capacity (0–100)'],
 ['growth','market','marketGrowth',-100,100,'연 시장 성장 가정 (%)','Annual market growth assumption (%)'],
 ['competition','market','competition',0,100,'경쟁 강도 (0–100)','Competition (0–100)'],
 ['uncertainty','market','uncertainty',0,100,'불확실성 (0–100)','Uncertainty (0–100)'],
 ['debt','operations','technicalDebt',0,100,'기술부채 (0–100)','Technical debt (0–100)'],
 ['equity','operations','founderEquity',0,100,'창업자 지분 (%)','Founder ownership (%)']
];
export function initialDraft(project){
 const supplied=project.simulation?.state;const hasCompany=Boolean(project.company?.name||project.company?.idea);
 const base=supplied?validateState(supplied):buildState(hasCompany?project.company:{name:'My Startup',stage:'mvp',team:'small',cash:30000000,burn:5000000,mrr:0});
 if(!supplied&&!hasCompany){base.venture.productProgress=70;base.operations.marketingBudget=750000;}
 const source=supplied?(base.provenance?.source==='module3'?'module3':project.simulation.history.length?'simulation':'builder'):hasCompany?'builder':'example';
 const values={name:base.venture.ventureName,teamNotes:project.company?.teamNotes||''};const origins={name:source==='example'?'example':'imported',teamNotes:project.company?.teamNotes?'imported':'example'};
 for(const [key,section,field] of initialFields){values[key]=String(base[section][field]);origins[key]=source==='simulation'?'modeled':source==='module3'?(['cash','team'].includes(key)?'module3-derived':'example'):source==='builder'?(['cash','burn','mrr','demand','retention','cac'].includes(key)&&project.company[key]!==undefined&&project.company[key]!==''?'imported':'example'):'example';}
 return {base,source,values,origins,mode:'quick'};
}
export function confirmInitial(draft){
 const s=validateState(draft.base),name=String(draft.values.name||'').trim();if(!name||name.length>120)throw Error('name');s.venture.ventureName=name;
 const fields={};for(const [key,section,field,min,max] of initialFields){const raw=draft.values[key];if(raw==null||String(raw).trim()==='')throw Error(key);const n=Number(raw);if(!Number.isFinite(n)||n<min||n>max||(key==='team'&&!Number.isInteger(n)))throw Error(key);s[section][field]=n;fields[key]={value:n,origin:draft.origins[key]||'user-edited'};}
 if(s.operations.marketingBudget>s.venture.monthlyBurn)throw Error('marketing');
 s.initialConditions={source:draft.source,fields,teamNotes:String(draft.values.teamNotes||'').slice(0,600)};
 return validateState(s);
}
export function forkInitial(project,draft,id){const p=clone(project),start=confirmInitial(draft);p.id=id;p.revision=0;p.comparisons=[];p.parentProjectId=project.id;p.simulation={initialState:start,state:clone(start),history:[]};p.worldEntry={confirmed:true,mode:draft.mode==='full'?'full':'quick'};p.worldUI={role:'CEO',mission:'launch',avatar:project.worldUI?.avatar||'teal'};return p;}
export function rewindProject(project,index,id){if(!Number.isInteger(index)||index<0||index>=project.simulation.history.length)throw Error('Invalid rewind');const p=clone(project);p.id=id;p.revision=0;p.parentProjectId=project.id;p.comparisons=[];p.simulation.history=p.simulation.history.slice(0,index);let state=clone(p.simulation.initialState);for(const row of p.simulation.history)state=simulateDecision(state,row.missionId,row.actionId,row.founderReason,row.timestamp).state;p.simulation.state=state;return p;}
