const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),serve=require('./server.cjs');
let browser,server;const checks=[];
(async()=>{
 const site=await serve();server=site.server;
 browser=await chromium.launch({headless:true,executablePath:process.env.ASNM_BROWSER_PATH,args:['--no-sandbox']});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:''}));
 await ctx.route('https://cdnjs.cloudflare.com/**',r=>r.fulfill({path:process.env.ASNM_CHART_JS_PATH,contentType:'application/javascript'}));
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const out=process.env.ASNM_SCREENSHOT_DIR;if(out)await fs.mkdir(out,{recursive:true});
 for(const lang of ['ko','en'])for(const [width,height] of [[1440,1000],[1280,720],[390,844],[320,740]]){
  await p.setViewportSize({width,height});await p.goto(site.base+(lang==='en'?'/en/':'/'));await p.locator('#demo-start').waitFor();
  assert.equal(await p.locator('.p-entry-art:visible').count(),3);assert.equal(await p.locator('#page-home .p-entry-choice:visible').count(),3);
  assert.equal(await p.locator('.p-maker-credit').innerText(),'Created by If Lab');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await p.locator('#page-home h1:visible').evaluate(n=>n.getBoundingClientRect().top>=64),true);
  assert.equal(await p.evaluate(()=>typeof BABYLON),'undefined');
  await p.evaluate(async()=>{const node=document.querySelector('.p-entry-art'),url=getComputedStyle(node).backgroundImage.slice(5,-2),img=new Image();img.src=url;await img.decode();if(img.width!==img.height*3)throw Error('Incorrect sprite aspect ratio');});
  const positions=await p.locator('.p-entry-art').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundPositionX));assert.deepEqual(positions,['0%','50%','100%']);
  const widths=await p.locator('.p-entry-label').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));assert.ok(Math.max(...widths)-Math.min(...widths)<2);assert.ok(Math.min(...widths)>250);
  for(const art of await p.locator('.p-entry-art').all())assert.equal(await art.evaluate(n=>{const b=n.getBoundingClientRect(),a=n.previousElementSibling.getBoundingClientRect();return b.top>=a.bottom&&getComputedStyle(n).transitionDuration==='0s';}),true);
  if(width>=1280)assert.equal(await p.locator('.p-maker-credit').evaluate(n=>n.getBoundingClientRect().bottom<=innerHeight+2),true);
  if(out&&[1440,390].includes(width))await p.screenshot({path:path.join(out,`space-${lang}-${width}.png`),fullPage:true});
  console.log('PASS artwork / responsive / native CTA',lang,width);checks.push(1);
 }
 await p.setViewportSize({width:390,height:844});await p.locator('#theme-toggle').click();assert.equal(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(255, 255, 255)');assert.equal(await p.locator('#page-home').evaluate(n=>getComputedStyle(n,'::before').opacity),'0.13');console.log('PASS light theme');checks.push(1);
 await p.locator('.p-entry-art-0').click();await p.locator('#page-journey.active').waitFor();assert.equal(await p.locator('.p-maker-credit').isVisible(),false);
 await p.goBack();await p.locator('.p-entry-art-1').click();await p.locator('#page-questions.active').waitFor();console.log('PASS image clicks route and footer stays on home');checks.push(1);
 await ctx.route('**/product/assets/**',r=>r.abort());await p.goto(site.base+'/');await p.locator('#demo-start').waitFor();await p.locator('#page-home .p-entry-choice').first().focus();await p.keyboard.press('Enter');await p.locator('#page-journey.active').waitFor();console.log('PASS missing artwork retains keyboard navigation');checks.push(1);
 assert.deepEqual(errors,[]);console.log(checks.length+' artwork browser groups passed');await browser.close();server.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();if(server)server.close();process.exit(1)});
