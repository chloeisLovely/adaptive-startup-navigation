const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const base=(process.env.ASNM_TEST_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const out=process.env.ASNM_SCREENSHOT_DIR;
const wait=page=>page.waitForFunction(()=>document.querySelector('#world-canvas')?.dataset.ready==='true');
const data=page=>page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.endsWith(':module4:v1'));return JSON.parse(localStorage.getItem(key));});
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
  const page=await context.newPage();const errors=[];const resources=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base) && r.status()>=400)resources.push(`${r.status()} ${r.url()}`);});
  await page.goto(base+'/module4/');await wait(page);
  await page.locator('#start-simulation').click();
  assert.equal((await data(page)).state.venture.ventureName,'NovaAI');
  assert.equal(await page.locator('.metric').count(),12);
  assert.equal(await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.meshes.length>100),true);
  const targetBefore=await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.activeCamera.target.z);
  await page.locator('#world-canvas').focus();await page.keyboard.press('w');
  assert.notEqual(await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.activeCamera.target.z),targetBefore);
  await page.locator('[data-room="finance"]').click();assert.match(await page.locator('#room-detail').innerText(),/FINANCE ROOM/);
  for(const room of ['ceo','finance','market','product','customer','team','investor']){
    await page.locator(`[data-room="${room}"]`).click();
    assert.equal(await page.locator(`[data-room="${room}"]`).getAttribute('aria-pressed'),'true');
  }
  await page.locator('#overview').click();
  await page.waitForTimeout(200);
  const screen=await page.evaluate(()=>{const B=BABYLON,s=B.EngineStore.LastCreatedScene,e=s.getEngine(),c=document.querySelector('#world-canvas'),r=c.getBoundingClientRect(),mesh=s.getMeshByName('ceo-label');const p=B.Vector3.Project(mesh.getAbsolutePosition(),B.Matrix.Identity(),s.getTransformMatrix(),s.activeCamera.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight()));return{x:r.x+p.x*r.width/e.getRenderWidth(),y:r.y+p.y*r.height/e.getRenderHeight()};});
  await page.mouse.click(screen.x,screen.y);
  assert.match(await page.locator('#room-detail').innerText(),/CEO OFFICE/);
  await page.locator('#decision-hiring').selectOption('developer');
  await page.locator('#decision-product').selectOption('feature');
  await page.locator('#decision-marketing').selectOption('increase');
  await page.locator('#decision-pricing').selectOption('raise');
  await page.locator('#decision-fundraising').selectOption('attempt');
  await page.locator('#decision-market').selectOption('test');
  await page.locator('#founder-reason').fill('Test product delivery before scaling.');
  await page.locator('#advance-month').click();
  const first=await data(page);assert.equal(first.state.simulation.currentMonth,1);assert.equal(first.history[0].decisions.length,6);assert.notEqual(first.state.venture.cash,200000);assert.equal(first.history[0].founderReason,'Test product delivery before scaling.');
  await page.locator('#tab-agents').click();await page.waitForSelector('.agent-card');assert.equal(await page.locator('.agent-card').count(),5);
  await page.reload();await wait(page);assert.deepEqual(await data(page),first);assert.equal(await page.locator('#setup-dialog').isVisible(),false);
  for(let i=0;i<3;i++)await page.locator('#advance-month').click();
  await page.locator('#tab-reflection').click();
  await page.locator('.reflection-card textarea').fill('Revise the assumption: prioritize customer retention.');
  await page.locator('.reflection-card button').click();
  assert.equal(Object.keys((await data(page)).reflections).length,1);
  await page.locator('#tab-calibration').click();assert.equal(await page.locator('.cal-gap').count(),3);
  const downloadPromise=page.waitForEvent('download');await page.locator('#export-json').click();const exported=await downloadPromise;const exportPath=await exported.path();const json=await fs.readFile(exportPath,'utf8');assert.equal(JSON.parse(json).history.length,4);
  page.once('dialog',d=>d.accept());await page.locator('#import-file').setInputFiles({name:'session.json',mimeType:'application/json',buffer:Buffer.from(json)});await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('복구'));assert.equal((await data(page)).history.length,4);
  await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('실패'));assert.equal((await data(page)).history.length,4);
  if(out){await fs.mkdir(out,{recursive:true});await page.screenshot({path:path.join(out,'module4-desktop.png'),fullPage:true});}
  const mobile=await context.newPage({viewport:{width:390,height:844}});await mobile.setViewportSize({width:390,height:844});await mobile.goto(base+'/module4/?lang=en');await wait(mobile);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await mobile.locator('.metric').count(),12);
  if(out)await mobile.screenshot({path:path.join(out,'module4-mobile.png'),fullPage:true});
  await mobile.close();

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
    await legacy.locator('#sim-result [data-venture-world]').click();
    await legacy.waitForURL('**/module4/**');await wait(legacy);
    await legacy.waitForSelector('#setup-dialog[open]');
    assert.equal(await legacy.locator('[name="venture.cash"]').inputValue(),'100000000');
    assert.equal(await legacy.locator('[name="assumptions.expectedGrowth"]').inputValue(),'15');
    assert.equal(await legacy.locator('[name="market.marketGrowth"]').inputValue(),'12');
    assert.equal(await legacy.locator('[name="assumptions.expectedDemand"]').inputValue(),'');
    assert.equal(await legacy.evaluate(()=>location.hash),'');
    await legacy.locator('#start-simulation').click();const transferred=await data(legacy);
    assert.equal(transferred.state.provenance.module3.survival_score,score);
    assert.equal(transferred.state.founder.decisionOrientation,'T');
    assert.equal(transferred.state.provenance.module3.trends.length,1);
    await legacy.locator('#advance-month').click();assert.equal((await data(legacy)).history.length,1);
    assert.deepEqual(legacyErrors,[]);await legacy.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(resources,[]);
  await context.close();
  // Storage failure and unavailable WebGL remain explicit, usable fallback states.
  const fallbackContext=await browser.newContext();await fallbackContext.addInitScript(()=>{
    Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}});
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:original.call(this,type,...args);};
  });
  const fallback=await fallbackContext.newPage();await fallback.goto(base+'/module4/?lang=en');await fallback.locator('#start-simulation').click();await fallback.locator('#advance-month').click();assert.match(await fallback.locator('#month-label').innerText(),/01/);assert.match(await fallback.locator('#status').innerText(),/storage failed/);assert.equal(await fallback.locator('.fallback').count(),1);
  await fallbackContext.close();
  console.log('PASS: Babylon scene, keyboard movement, geometry picking, 7-room navigation, 6-category turn, HUD, event log, advisors, reflection, refresh, JSON export/import, mobile, KO/EN Module 3 handoff, zero page errors, storage/WebGL fallback.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();});
