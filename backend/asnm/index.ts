// Supabase Edge Function entry point. Secrets are read only on the server.
import {makeHandler} from './handler.js';
import {verifiedAdminEmail} from './admin-identity.js';
const url=Deno.env.get('SUPABASE_URL')||'',secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',origin=Deno.env.get('ASNM_ALLOWED_ORIGIN')||'https://chloeislovely.github.io';
async function rest(path:string,options:RequestInit={}){const r=await fetch(url+'/rest/v1/'+path,{...options,headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json',...(options.headers||{})}});if(!r.ok)throw Error('Database unavailable');const text=await r.text();return text?JSON.parse(text):null;}
const db={
 isAdmin:async(id:string,user:unknown)=>{
  if((await rest('asnm_admins?select=user_id&user_id=eq.'+encodeURIComponent(id)+'&limit=1')).length===1)return true;
  const email=verifiedAdminEmail(user);
  return email!==null&&(await rest('asnm_admin_emails?select=email&email=eq.'+encodeURIComponent(email)+'&limit=1')).length===1;
 },
 feedback:(data:unknown)=>rest('asnm_feedback',{method:'POST',body:JSON.stringify(data)}),
 event:(name:string)=>rest('rpc/asnm_increment_event',{method:'POST',body:JSON.stringify({event_name:name})}),
 overview:async({from,to}:{from:string,to:string})=>{const [feedback,counts]=await Promise.all([rest(`asnm_feedback?select=*&created_at=gte.${from}T00:00:00Z&created_at=lte.${to}T23:59:59.999999Z&order=created_at.desc&limit=500`),rest(`asnm_event_counts?select=*&day=gte.${from}&day=lte.${to}&order=day.desc&limit=7000`)]);return {feedback,counts,feedbackLimit:500,timezone:'UTC'};}
};
async function auth(token:string){const r=await fetch(url+'/auth/v1/user',{headers:{apikey:secret,Authorization:'Bearer '+token}});return r.ok?await r.json():null;}
async function rate(_request:Request,action:string){
 // Coarse global quota, no IP/user identifier. Counts are indicative, not audit data.
 // This bounds database writes; it does not establish one request per human.
 const bucket=action+'|'+Math.floor(Date.now()/3600000);
 return await rest('rpc/asnm_rate_check',{method:'POST',body:JSON.stringify({bucket_key:bucket,limit_count:action==='feedback'?60:6000})});
}
Deno.serve(makeHandler({origin,db,auth,rate}));
