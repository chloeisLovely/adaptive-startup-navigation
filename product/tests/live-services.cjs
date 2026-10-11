// Explicit opt-in: two synthetic, billable model requests to the existing Worker.
// No model response is mocked. Never run automatically in normal CI.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 if(process.env.ASNM_LIVE_CHECK!=='1')throw Error('Set ASNM_LIVE_CHECK=1 to authorize two real synthetic AI requests.');
 const root=path.resolve(__dirname,'../..'),load=p=>import(pathToFileURL(path.join(root,p)).href);
 const {requestAdvice}=await load('product/v6/advice.js'),{meetingAdvice}=await load('product/trusted/advisors.js'),{demoStateV6}=await load('product/experience.js');
 const proxyURL=process.env.HTTPS_PROXY||process.env.HTTP_PROXY;
 const browser=await chromium.launch({headless:true,executablePath:process.env.ASNM_BROWSER_PATH||undefined,proxy:proxyURL?{server:proxyURL}:undefined,args:['--no-sandbox']});
 try{
  // Only for a test environment's inspecting proxy; never changes production TLS.
  const p=await browser.newPage({ignoreHTTPSErrors:process.env.ASNM_TEST_IGNORE_HTTPS_ERRORS==='1'});
  await p.goto('https://chloeislovely.github.io/adaptive-startup-navigation/',{waitUntil:'domcontentloaded',timeout:60000});
  const fetcher=async(url,options)=>{
   const r=await p.evaluate(async({url,body})=>{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(18000)});return {status:r.status,body:await r.text()};},{url,body:options.body});
   console.log('Real Worker HTTP',r.status);return new Response(r.body,{status:r.status});
  };
  const endpoint='https://asnm-ai.chloehappylee.workers.dev';
  const advice=await requestAdvice('Should a solo MVP founder interview customers before hiring?',{mode:'world',idea:'Synthetic education app',current:{cash:30000000,burn:3000000,mrr:0,runway:10,currency:'KRW'}},'en',[],endpoint,fetcher);
  assert.equal(advice.source,'llm');console.log('PASS real structured English advice');
  const state=demoStateV6(),before=JSON.stringify(state),meeting=await meetingAdvice(state,'team','hold','ko','Synthetic connectivity test',endpoint,fetcher);
  assert.equal(meeting.source,'llm');assert.equal(meeting.turns.length,6);assert.equal(JSON.stringify(state),before);console.log('PASS real Korean six-role meeting; deterministic state unchanged');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exit(1)});
