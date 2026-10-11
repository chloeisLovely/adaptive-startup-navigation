export const events=new Set(['landing_view','full_journey_start','quick_start','demo_start','module_complete','digital_twin_enter','first_decision','simulation_complete','compare_scenario','report_view','report_export','feedback_submit','market_view','founder_view','builder_view','world_view','report_module_view']);
export function validateFeedback(x){
 if(!x||typeof x!=='object'||Object.keys(x).some(k=>!['satisfaction','favorite','improvement','reuse','comment','website'].includes(k)))throw Error('Invalid fields');
 if(x.website)throw Error('Spam rejected');
 for(const k of ['satisfaction','reuse'])if(!Number.isInteger(x[k])||x[k]<1||x[k]>5)throw Error('Invalid score');
 if(!['market','founder','builder','world','report','other'].includes(x.favorite))throw Error('Invalid feature');
 if(typeof x.improvement!=='string'||!x.improvement.trim()||x.improvement.length>1500)throw Error('Invalid improvement');
 if(typeof x.comment!=='string'||x.comment.length>1500)throw Error('Invalid comment');
 return {satisfaction:x.satisfaction,favorite:x.favorite,improvement:x.improvement.trim(),reuse:x.reuse,comment:x.comment.trim()};
}
export function dateRange(url){const from=url.searchParams.get('from'),to=url.searchParams.get('to');if(!/^\d{4}-\d{2}-\d{2}$/.test(from||'')||!/^\d{4}-\d{2}-\d{2}$/.test(to||'')||!Number.isFinite(Date.parse(from))||!Number.isFinite(Date.parse(to))||from>to||Date.parse(to)-Date.parse(from)>366*86400000)throw Error('Invalid date range');return {from,to};}
export function makeHandler({origin,db,auth,rate}){
 return async request=>{
  const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,GET,OPTIONS','Cache-Control':'no-store'};
  const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(!origin||request.headers.get('Origin')!==origin)return json({error:'Origin denied'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const u=new URL(request.url),action=u.searchParams.get('action');
  try{
   if(action==='admin'&&request.method==='GET'){
    const token=request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)return json({error:'Authentication required'},401);
    const user=await auth(token);if(!user?.id)return json({error:'Invalid session'},401);
    if(!await db.isAdmin(user.id))return json({error:'Admin access denied'},403);
    return json(await db.overview(dateRange(u)));
   }
   if(request.method!=='POST'||!['feedback','event'].includes(action))return json({error:'Not found'},404);
   if(Number(request.headers.get('Content-Length'))>12000)return json({error:'Too large'},413);
   const reader=request.body?.getReader(),decoder=new TextDecoder();let raw='',bytes=0;
   if(reader){try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>12000){await reader.cancel();return json({error:'Too large'},413);}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}}
   let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
   // Global action quota stores no visitor identifier or IP address.
   if(!await rate(request,action))return json({error:'Rate limit or protection unavailable'},429);
   if(action==='feedback'){const data=validateFeedback(body);await db.feedback(data);return json({received:true},201);}
   if(!body||Object.keys(body).length!==1||!events.has(body.event))return json({error:'Invalid event'},400);
   await db.event(body.event);return json({received:true},202);
  }catch(e){if(/Invalid|Spam/.test(e.message))return json({error:'Invalid submission'},400);return json({error:'Service unavailable; nothing confirmed'},503);}
 };
}
