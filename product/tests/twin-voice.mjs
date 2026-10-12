// Run with linkedom@0.18.12 available through NODE_PATH.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {parseHTML}=createRequire(import.meta.url)('linkedom');
const {document}=parseHTML('<html><body></body></html>');
globalThis.document=document;
const {teamVoice}=await import('../twin/voice.js');
const realTimeout=globalThis.setTimeout,realClear=globalThis.clearTimeout;
const pending=new Map();let next=0;
globalThis.setTimeout=fn=>{pending.set(++next,fn);return next;};
globalThis.clearTimeout=id=>pending.delete(id);
let spoken=[],cancels=0,speakers=[];
const setup=()=>{
 spoken=[];cancels=0;speakers=[];
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 globalThis.speechSynthesis={speak:u=>spoken.push(u),cancel:()=>cancels++,getVoices:()=>[{lang:'ko-KR',name:'device'}]};
 return teamVoice('ko',turn=>speakers.push(turn?.role||null));
};
const turns=[{role:'CFO',text:'예산을 확인합니다.'},{role:'CTO',text:'개발 일정을 검토합니다.'}];
try{
 let voice=setup(),p=voice.play(turns,{force:true});
 assert.equal(spoken.length,1);spoken[0].onend();await Promise.resolve();assert.equal(spoken.length,2);spoken[1].onend();assert.equal(await p,true);assert.equal(voice.active,false);assert.equal(speakers.at(-1),null);assert.equal(pending.size,0);
 voice=setup();const first=voice.play(turns,{force:true}),lateEnd=spoken[0].onend;const second=voice.play([turns[1]],{force:true});lateEnd();assert.equal(await first,false);assert.equal(spoken.length,2);assert.equal(voice.active,true);spoken[1].onend();assert.equal(await second,true);
 voice=setup();p=voice.play(turns,{force:true});voice.stop();assert.equal(await p,false);assert.equal(spoken.length,1);assert.equal(pending.size,0);
 voice=setup();p=voice.play(turns,{force:true});const before=cancels;[...pending.values()][0]();assert.equal(await p,false);assert.ok(cancels>before);assert.equal(spoken.length,1);assert.equal(speakers.at(-1),null);assert.equal(voice.active,false);
 voice=setup();speechSynthesis.speak=()=>{throw Error('device error');};assert.equal(await voice.play(turns,{force:true}),false);assert.equal(voice.active,false);assert.equal(pending.size,0);
 voice=setup();delete globalThis.SpeechSynthesisUtterance;assert.equal(await voice.play(turns,{force:true}),false);assert.equal(spoken.length,0);
 console.log(JSON.stringify({voice:'passed',checks:['sequential roles','replacement isolates late callbacks','stop clears queue','watchdog cancels stalled device','synchronous failure','missing utterance support']}));
}finally{globalThis.setTimeout=realTimeout;globalThis.clearTimeout=realClear;}
