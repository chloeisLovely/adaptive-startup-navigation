import {fromModule3} from './state/Module3Adapter.js';
import {StateStore} from './state/StateStore.js';
const lang=document.documentElement.lang==='en'?'en':'ko';
const url=new URL(`./index.html?lang=${lang}`,import.meta.url);
let current=null;
const buttons=[...document.querySelectorAll('[data-venture-world]')];
function status(message) {const el=document.getElementById('venture-world-status');if(el) el.textContent=message;}
window.addEventListener('asnm:module3-complete',event=>{
  try {
    current=fromModule3(event.detail);
    new StateStore(localStorage).saveSource(current);
    status(lang==='ko'?'Module 4 초기 상태를 저장했습니다. 가정을 검토하고 시작하세요.':'Module 4 initial state saved. Review assumptions before starting.');
  } catch(error) {
    status((lang==='ko'?'자동 저장 불가: ':'Autosave unavailable: ')+error.message+(lang==='ko'?' 결과 JSON을 내려받아 Module 4에서 가져올 수 있습니다.':' Export the report JSON and import it in Module 4.'));
  }
});
for(const button of buttons) button.addEventListener('click',()=>{
  if(current) {
    // Fragment transfer remains on-device and is removed immediately by Module 4.
    // Works even if the browser blocks localStorage. No personal data in query/server logs.
    const direct=new URL(url); direct.searchParams.set('source','module3');
    direct.hash='state='+encodeURIComponent(JSON.stringify(current));
    location.assign(direct.href);
  } else location.assign(url.href);
});
