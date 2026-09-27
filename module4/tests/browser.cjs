const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const base=(process.env.ASNM_TEST_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const out=process.env.ASNM_SCREENSHOT_DIR;
const wait=page=>page.waitForFunction(()=>document.querySelector('#world-canvas')?.dataset.ready==='true');
const data=page=>page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.endsWith(':module4:v1'));return JSON.parse(localStorage.getItem(key));});
const enter=async(p,role='ceo')=>{await p.locator('#player-role').selectOption(role);await p.locator('#confirm-role').click();await p.locator('#tutorial-next').click();await p.locator('#tutorial-back').click();await p.locator('#tutorial-skip').click();};
const visit=async(p,room)=>{await p.locator(`[data-room="${room}"]`).click();await p.waitForFunction(()=>!document.querySelector('#persona-card').textContent.match(/Walking to|걸어가고/));};
const choose=async(p,c,a)=>{await p.locator(`#choose-${c}-${a}`).click();await p.locator('#confirm-decision').click();};
async function completeMonth(p){
 await p.locator('#start-month').click();
 const todo=await p.locator('[data-mission]').evaluateAll(nodes=>nodes.map(n=>n.dataset.mission));
 const rooms={hiring:'team',product:'product',marketing:'finance',pricing:'customer',fundraising:'finance',market:'market'};
 const actions={hiring:'hold',product:'improve',marketing:'maintain',pricing:'hold',fundraising:'bootstrap',market:'focus'};
 for(const c of todo){await visit(p,rooms[c]);await choose(p,c,actions[c]);}
 await visit(p,'ceo');assert.equal(await p.locator('.review-grid>div').count(),6);await p.locator('#commit-month').click();
 assert.ok(await p.locator('#outcome-next').isVisible());for(let i=0;i<4;i++)await p.locator('#outcome-next').click();
 await p.locator('#start-month').waitFor();
}
let browser;
(async()=>{
  browser=await chromium.launch({headless:true,executablePath:process.env.ASNM_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
  // Optional exact-version Chart.js mirror for legacy pages in network-restricted CI.
  // Real Chart.js 4.4.0 code is served unchanged; no chart functionality is stubbed.
  if(process.env.ASNM_CHART_JS_PATH){
    await context.route('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',route=>route.fulfill({path:process.env.ASNM_CHART_JS_PATH,contentType:'application/javascript'}));
    await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({body:'',contentType:'text/css'}));
  }
  const page=await context.newPage(),errors=[],resources=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)resources.push(r.url());});
  await page.goto(base+'/module4/?lang=en');await page.locator('#new-sample').click();await page.locator('#start-simulation').click();await page.locator('#enter-world').click();await enter(page);await wait(page);
  const positionBefore=await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('founder').position.z);await page.locator('#world-canvas').focus();await page.keyboard.press('w');assert.notEqual(await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('founder').position.z),positionBefore);
  assert.equal(await page.locator('#decision-form').isVisible(),false);assert.equal(await page.locator('#metrics').isVisible(),false);
  await page.locator('#start-month').click();
  const mapping={team:['hiring','developer'],product:['product','feature'],finance:['marketing','reduce'],customer:['pricing','hold'],investor:['fundraising','attempt'],market:['market','test']};
  for(const [room,[category,action]] of Object.entries(mapping)){
    await visit(page,room);await choose(page,category,action);console.log('Dialogue confirmed:',category,action);
  }
  let draft=await data(page);assert.equal(draft.experience.confirmed.length,6);assert.equal(draft.history.length,0);
  await page.reload();await wait(page);assert.equal(await page.locator('#tutorial-dialog').count(),0);assert.deepEqual((await data(page)).experience.choices,draft.experience.choices);
  await visit(page,'ceo');await page.locator('#dialogue-assumption').fill('Test delivery before scaling.');assert.equal(await page.locator('.review-grid>div').count(),6);
  const teamBefore=(await data(page)).state.venture.teamSize;await page.locator('#commit-month').click();
  let first=await data(page);assert.equal(first.history.length,1);assert.equal(first.history[0].founderReason,'Test delivery before scaling.');assert.equal(first.history[0].decisions.find(d=>d.category==='hiring').action,'developer');
  assert.match(await page.locator('#persona-card').innerText(),/30 days/);await page.locator('#outcome-next').click();assert.match(await page.locator('#persona-card').innerText(),new RegExp(first.history[0].event.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));await page.locator('#outcome-next').click();assert.equal(await page.locator('.outcome-grid article').count(),6);await page.locator('#outcome-next').click();
  assert.equal(await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.transformNodes.filter(n=>n.name.startsWith('team-member-')&&n.metadata?.actor&&n.isEnabled()).length),Math.min(6,first.state.venture.teamSize-1));
  if(out){await fs.mkdir(out,{recursive:true});await page.screenshot({path:path.join(out,'v3-outcome.png'),fullPage:true});}
  await page.reload();await wait(page);assert.match(await page.locator('#persona-card').innerText(),/30 days/);for(let i=0;i<4;i++)await page.locator('#outcome-next').click();await page.locator('#start-month').waitFor();
  await page.locator('#open-dashboard').click();await page.locator('#tab-agents').click();await page.locator('.agent-card').first().waitFor();assert.equal(await page.locator('.agent-card').count(),5);await page.locator('#tab-report').click();await page.locator('#dashboard-drawer button').first().click();
  const download=page.waitForEvent('download');await page.locator('#export-json').click();const file=await download;const exported=await fs.readFile(await file.path(),'utf8');assert.equal(JSON.parse(exported).history.length,1);
  await page.locator('#overview').click();await page.waitForTimeout(1400);
  const pos=await page.evaluate(()=>{const B=BABYLON,s=B.EngineStore.LastCreatedScene,c=document.querySelector('#world-canvas'),r=c.getBoundingClientRect(),e=s.getEngine(),m=s.getMeshByName('product-label'),v=B.Vector3.Project(m.getAbsolutePosition(),B.Matrix.Identity(),s.getTransformMatrix(),s.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return {x:r.x+v.x*r.width/e.getRenderWidth(),y:r.y+v.y*r.height/e.getRenderHeight()};});
  await page.mouse.click(pos.x,pos.y);await page.waitForFunction(()=>BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('founder').metadata.roomId==='product');
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(out)await page.screenshot({path:path.join(out,'v3-mobile.png'),fullPage:true});await page.close();
  // Real legacy form journey in both languages, with Module 2 and 1 state present.
  for(const prefix of ['', '/en']) {
    const legacy=await context.newPage();const legacyErrors=[];legacy.on('pageerror',e=>legacyErrors.push(e.message));
    await legacy.goto(base+prefix+'/');
    await legacy.waitForFunction(()=>typeof window.runSimulation==='function');
    // Exercise the existing trend and founder quiz handlers before the Module 3 form.
    await legacy.evaluate(()=>showPage('m1'));
    await legacy.locator('#trend-grid-ai .trend-block').first().click();
    await legacy.evaluate(()=>showPage('m2'));
    await legacy.evaluate(()=>{startDnaQuiz();quizAnswers=['T','T','A','T','V','T','S','T','A','T'];showFounderResult();});
    await legacy.evaluate(()=>showPage('m3a'));
    for(const [id,value] of Object.entries({'barl-q1':'80','barl-q2':'15','barl-q3':'6','barl-q4':'Cash','barl-q5':'Demand','barl-q6':'Team'}))await legacy.locator('#'+id).fill(value);
    await legacy.locator('[onclick="completeBarl()"]').click();
    await legacy.locator('#s-name').fill(prefix?'Bridge English':'연결 검증');
    await legacy.locator('#s-vision').fill('Make education more accessible.');
    await legacy.locator('#sim-0 [onclick="simNext()"]').click();
    await legacy.locator('#sim-1 .choice-card').first().click();
    await legacy.locator('#s-persona').fill('Teachers designing AI lessons for students');
    await legacy.locator('#sim-1 [onclick="simNext()"]').click();
    await legacy.locator('#sim-2 .choice-card').first().click();
    await legacy.locator('#sim-2 [onclick="simNext()"]').click();
    await legacy.locator('#sim-3 .choice-card').first().click();
    await legacy.locator('#sim-3 [onclick="simNext()"]').click();
    await legacy.locator('#sim-4 .choice-card').first().click();
    await legacy.locator('[onclick="runSimulation()"]').click();
    await legacy.waitForFunction(()=>document.querySelector('#venture-world-status').textContent.length>0);
    const score=Number(await legacy.locator('#survival-pct').innerText());assert.ok(score>=12&&score<=97);
    assert.equal(await legacy.locator('#factor-table > div').count(),7);
    await legacy.locator('#sim-result [onclick="showPage(\'result\')"]').click();
    assert.equal(await legacy.locator('#page-result').isVisible(),true);
    await legacy.evaluate(()=>showPage('m3a'));
    await legacy.locator('#sim-result [data-venture-world]').click();
    await legacy.waitForURL('**/module4/**');
    await legacy.locator('#guard-new').click();
    assert.match(await legacy.locator('#entry-screen').innerText(),/80%/);
    assert.match(await legacy.locator('#entry-screen').innerText(),/6/);
    await legacy.locator('#review-assumptions').click();
    await legacy.waitForSelector('#setup-dialog[open]');
    assert.equal(await legacy.locator('[name="venture.cash"]').inputValue(),'100000000');
    assert.equal(await legacy.locator('[name="assumptions.expectedGrowth"]').inputValue(),'15');
    assert.equal(await legacy.locator('[name="market.marketGrowth"]').inputValue(),'12');
    assert.equal(await legacy.locator('[name="assumptions.expectedDemand"]').inputValue(),'');
    assert.equal(await legacy.evaluate(()=>location.hash),'');
    await legacy.locator('#start-simulation').click();await legacy.locator('#enter-world').click();await enter(legacy);await wait(legacy);const transferred=await data(legacy);
    assert.equal(transferred.state.provenance.module3.survival_score,score);
    assert.equal(transferred.state.founder.decisionOrientation,'T');
    assert.equal(transferred.state.provenance.module3.trends.length,1);
    assert.match(await legacy.locator('#persona-card').innerText(),/Module 3/);await legacy.locator('#open-dashboard').click();
    await legacy.locator('#tab-report').click();await legacy.locator('#module3-report').click();
    await legacy.waitForSelector('#page-result.active');
    assert.match(await legacy.locator('#report-company-title').innerText(),prefix?/Bridge English/:/연결 검증/);
    assert.equal(Number(await legacy.locator('#survival-pct').innerText()),score);
    assert.deepEqual(legacyErrors,[]);await legacy.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(resources,[]);await context.close();
  for(const prefix of ['', '/en']){
    const fresh=await browser.newContext({viewport:{width:1280,height:1000}});
    if(process.env.ASNM_CHART_JS_PATH){
      await fresh.route('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',r=>r.fulfill({path:process.env.ASNM_CHART_JS_PATH,contentType:'application/javascript'}));
      await fresh.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:'',contentType:'text/css'}));
    }
    const p=await fresh.newPage();const issues=[];p.on('pageerror',e=>issues.push(e.message));
    await p.goto(base+prefix+'/');await p.locator('.nav-btn[onclick="showPage(\'m4\')"]').click();
    assert.equal(await p.locator('#digital-twin-hub [data-requires-module3]').isDisabled(),true);
    await p.locator('#digital-twin-hub a').click();await p.setViewportSize({width:390,height:844});
    await p.locator('[name="ventureName"]').fill('Independent <AI>');
    await p.locator('[name="industry"]').fill('Education');
    await p.locator('[name="capital"]').fill('350000');
    await p.locator('#wizard-next').click();
    await p.locator('[name="teamSize"]').fill('4');
    await p.locator('#wizard-next').click();await p.locator('#wizard-next').click();
    await p.locator('[name="expectedSurvival"]').fill('0');
    await p.locator('#create-venture').click();
    assert.match(await p.locator('#entry-screen').innerText(),/Independent <AI>/);
    assert.equal(await p.locator('.workspace').isVisible(),false);
    assert.equal(await data(p),null);
    await p.locator('#enter-world').click();await enter(p,'growth');await wait(p);
    const initial=await data(p);assert.equal(initial.state.provenance.source,'standalone');
    assert.equal(initial.state.venture.cash,350000);assert.equal(initial.state.venture.teamSize,4);
    assert.equal(initial.state.assumptions.expectedSurvival,0);assert.equal(initial.state.assumptions.expectedGrowth,undefined);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await completeMonth(p);const saved=await data(p);
    await p.locator('#entry-hub-button').click();await p.locator('#entry-standalone').click();
    assert.equal(await p.locator('#session-guard').isVisible(),true);
    const exportEvent=p.waitForEvent('download');await p.locator('#guard-export').click();assert.ok(await exportEvent);
    await p.locator('#guard-new').click();await p.locator('[name="ventureName"]').fill('Discard draft');
    assert.deepEqual(await data(p),saved);
    await p.reload();await wait(p);assert.deepEqual(await data(p),saved);
    if(out)await p.screenshot({path:path.join(out,`standalone-${prefix?'en':'ko'}.png`),fullPage:true});
    assert.deepEqual(issues,[]);await fresh.close();
  }
  const fallbackContext=await browser.newContext();await fallbackContext.addInitScript(()=>{
    Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}});const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:original.call(this,type,...args);};
  });
  const fallback=await fallbackContext.newPage();await fallback.goto(base+'/module4/?lang=en');await fallback.locator('#new-sample').click();await fallback.locator('#start-simulation').click();await fallback.locator('#enter-world').click();await enter(fallback);await completeMonth(fallback);assert.match(await fallback.locator('#month-label').innerText(),/01/);assert.match(await fallback.locator('#status').innerText(),/storage failed/);assert.equal(await fallback.locator('.fallback').count(),1);await fallbackContext.close();
  // Imported risk fixture exercises proactive notifications and actual visual flags.
  const risk=await browser.newContext();await risk.addInitScript(()=>{const s={schemaVersion:1,modelVersion:'1.0.0',currency:'USD',costUnit:1,founder:{riskTolerance:50,marketConfidence:50,executionReadiness:50,decisionOrientation:'Test'},venture:{ventureName:'Risk fixture',industry:'Test',stage:'MVP',cash:40000,monthlyBurn:10000,mrr:0,cac:100,retention:45,teamSize:2,teamCapacity:40,productProgress:30},market:{demand:50,marketGrowth:12,competition:80,uncertainty:50},assumptions:{},simulation:{currentMonth:0,seed:4},operations:{marketingBudget:1500,technicalDebt:30,priceMultiplier:1,founderEquity:55,offer:{amount:150000,equity:15,expiresMonth:2}},provenance:{source:'sample'}};localStorage.setItem('asnm:'+location.pathname.split('module4/')[0]+':module4:v1',JSON.stringify({schemaVersion:1,modelVersion:'1.0.0',initialState:s,state:s,history:[],reflections:{},experience:{month:0,phase:'briefing',tutorialSeen:true}}));});
  const r=await risk.newPage();await r.goto(base+'/module4/?lang=en');await wait(r);assert.equal(await r.locator('[data-notification]').count(),3);assert.equal(await r.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('investor-root').metadata.alert),true);await r.locator('#notice-finance').click();await r.waitForFunction(()=>BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('founder').metadata.roomId==='finance');assert.match(await r.locator('#persona-card').innerText(),/Cash runway is low/);await risk.close();
  console.log('PASS V3: all six dialogue actions, walking/picking, role/tutorial, mission/review/commit, staged real outcomes, hire visuals, draft/outcome refresh, dashboard/export, real KO/EN M1–3 handoff & standalone, mobile, risk prompts/offer glow, storage/WebGL fallback.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();});
