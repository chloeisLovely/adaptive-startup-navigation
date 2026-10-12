import {el,button} from '../trusted/ui.js';
let activeStop=null;
/** Voice starts only from user gestures. Late results from stopped fields are discarded. */
export function voiceControls(input,lang='ko',onTranscript=()=>{}){
 const t=(k,e)=>lang==='ko'?k:e,Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
 const status=el('span',{role:'status'});let recognition=null,disposed=false;
 const stop=()=>{const old=recognition;recognition=null;if(activeStop===stop)activeStop=null;try{old?.abort();}catch{}status.textContent=t('음성 입력을 중지했습니다.','Voice input stopped.');};
 const speak=button(t('말하기','Speak'),()=>{if(disposed)return;if(recognition){stop();return;}if(input.disabled||input.readOnly)return;activeStop?.();try{
  const current=new Recognition();recognition=current;activeStop=stop;const live=()=>!disposed&&recognition===current;
  current.lang=lang==='ko'?'ko-KR':'en-US';current.interimResults=false;
  current.onresult=e=>{if(!live())return;if(input.disabled||input.readOnly){stop();return;}const value=e.results?.[0]?.[0]?.transcript;if(typeof value!=='string')return;input.value=value.slice(0,input.maxLength>0?input.maxLength:600);input.dispatchEvent(new Event('input',{bubbles:true}));onTranscript(input.value);status.textContent=t('인식한 문장을 확인하고 필요하면 수정하세요.','Review and edit the recognized text.');};
  current.onerror=()=>{if(live()){stop();status.textContent=t('마이크를 사용할 수 없습니다. 텍스트로 입력하세요.','Microphone unavailable. Please type instead.');}};
  current.onend=()=>{if(!live())return;recognition=null;if(activeStop===stop)activeStop=null;};
  current.start();status.textContent=t('듣는 중… 다시 누르면 중지','Listening… press again to stop');
 }catch{stop();status.textContent=t('텍스트 입력으로 계속하세요.','Continue with text input.');}},{disabled:!Recognition||input.disabled||input.readOnly});
 const node=el('div',{class:'v6-voice'},speak,status);if(!Recognition)status.textContent=t('이 브라우저에서는 텍스트 입력을 사용하세요.','Use text input in this browser.');
 node.dispose=()=>{disposed=true;stop();};return node;
}
export function narration(lang='ko'){
 const input=el('input',{type:'checkbox'}),label=el('label',{},input,lang==='ko'?'음성으로 듣기 · 기기의 음성 서비스 사용':'Read aloud · uses device speech service');
 return {node:label,say(text){if(!input.checked||!globalThis.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text).slice(0,1200));u.lang=lang==='ko'?'ko-KR':'en-US';speechSynthesis.speak(u);},dispose(){if(input.checked)globalThis.speechSynthesis?.cancel();}};
}
