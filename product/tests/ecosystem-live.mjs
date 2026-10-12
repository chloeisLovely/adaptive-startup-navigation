// Explicit opt-in: one synthetic request to the existing ASNM AI server.
import assert from 'node:assert/strict';
import {requestAdvice,adviceContext} from '../v6/advice.js';
import {newProject} from '../trusted/model.js';
if(process.env.ASNM_LIVE_CHECK!=='1')throw Error('Set ASNM_LIVE_CHECK=1 to authorize one synthetic model call.');
const p=newProject('synthetic-consultant');Object.assign(p.company,{step:4,name:'Synthetic education venture',industry:'교육 AI',idea:'가상 직무교육 서비스',customer:'가상 기관',cash:12000000,burn:3000000,mrr:0});
const context=adviceContext(p,'builder'),before=JSON.stringify(p);let status;
const result=await requestAdvice('합성 검증용입니다. 현재 입력한 현금과 월비용을 기준으로 다음 주 점검할 일을 알려줘.',context,'ko',[],'https://asnm-ai.chloehappylee.workers.dev',async(url,opts)=>{const r=await fetch(url,{...opts,headers:{...opts.headers,Origin:'https://chloeislovely.github.io'}});status=r.status;return r;});
assert.equal(result.source,'llm');assert.equal(JSON.stringify(p),before);assert.equal(result.data.module,'m3a');console.log(JSON.stringify({status,source:result.source,module:result.data.module,unchanged:true,contextBytes:JSON.stringify(context).length}));
