import {el,button} from '../trusted/ui.js';

export function teamVoice(lang,onSpeaker){
 let generation=0,current=null,active=false;
 const t=(k,e)=>lang==='ko'?k:e;
 const status=el('span',{role:'status'});
 const enabled=el('input',{type:'checkbox','aria-label':t('음성 대화 켜기','Enable spoken dialogue')});
 const cancel=()=>{try{globalThis.speechSynthesis?.cancel();}catch{}};
 const stop=()=>{
  generation++;active=false;
  const finish=current;current=null;finish?.(false);cancel();
  onSpeaker?.(null);status.textContent=t('음성 중지','Voice stopped');
 };
 enabled.onchange=()=>{if(!enabled.checked)stop();};
 const node=el('div',{class:'twin-voice'},el('label',{},enabled,t('아바타 음성 대화 · 기기 음성 사용','Spoken avatars · device voices')),button(t('대화 중지','Stop dialogue'),stop),status);
 async function play(turns,{force=false}={}){
  stop();if(force)enabled.checked=true;if(!enabled.checked)return false;
  const synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance;
  if(!synth||!Utterance){status.textContent=t('음성 출력 미지원 · 자막으로 보세요.','Speech unavailable · use captions.');return false;}
  const ticket=generation;active=true;
  for(const [i,turn] of turns.entries()){
   if(ticket!==generation)return false;
   onSpeaker?.(turn);status.textContent=`${turn.role} · ${i+1}/${turns.length}`;
   const completed=await new Promise(resolve=>{
    let timer,u,done=false;
    const finish=ok=>{
     if(done)return;done=true;clearTimeout(timer);
     if(u){u.onend=null;u.onerror=null;}
     if(current===finish)current=null;
     resolve(ok);
    };
    current=finish;
    try{
     u=new Utterance(turn.text);u.lang=lang==='ko'?'ko-KR':'en-US';
     const voices=synth.getVoices().filter(v=>v.lang.startsWith(lang));
     const n=Math.max(0,['CTO','CFO','Growth','HR','Product','Customer','Investor'].indexOf(turn.role));
     if(voices.length)u.voice=voices[n%voices.length];
     u.rate=.98;u.pitch=[1,.88,1.07,1.02,1.12,.93][n]||1;
     u.onend=()=>finish(true);u.onerror=()=>finish(false);
     // Stop a stalled device queue before another role speaks.
     timer=setTimeout(()=>finish(false),Math.max(12000,turn.text.length*240));
     synth.speak(u);
    }catch{finish(false);}
   });
   if(ticket!==generation)return false;
   if(!completed){
    active=false;cancel();onSpeaker?.(null);
    status.textContent=t('음성을 완료하지 못했습니다. 자막을 보거나 다시 재생해 주세요.','Speech could not finish. Use captions or replay.');
    return false;
   }
  }
  if(ticket!==generation)return false;
  active=false;onSpeaker?.(null);status.textContent=t('대화 종료','Conversation finished');return true;
 }
 return {node,play,stop,get active(){return active;},dispose:stop};
}
