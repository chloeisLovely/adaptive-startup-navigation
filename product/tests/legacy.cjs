const {spawn}=require('node:child_process');const serve=require('./server.cjs');
(async()=>{const {server,base}=await serve({classic:true});const child=spawn(process.execPath,['module4/tests/browser.cjs'],{cwd:require('node:path').resolve(__dirname,'../..'),stdio:'inherit',env:{...process.env,ASNM_TEST_URL:base}});child.on('exit',code=>{server.close();process.exitCode=code??1;});})();
