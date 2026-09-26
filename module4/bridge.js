import {fromModule3} from './state/Module3Adapter.js';
import {StateStore,SOURCE_KEY} from './state/StateStore.js';
const lang=document.documentElement.lang==='en'?'en':'ko';
const t=(ko,en)=>lang==='ko'?ko:en;
const url=new URL(`./index.html?lang=${lang}`,import.meta.url);
let current=null;
function status(message) {const node=document.getElementById('venture-world-status');if(node)node.textContent=message;}
function updateHub() {
  document.querySelectorAll('[data-requires-module3]').forEach(b=>b.disabled=!current);
  const node=document.getElementById('hub-source-status');
  if(node)node.textContent=current?t(`${current.venture.ventureName} · 준비됨`,`${current.venture.ventureName} · Ready`):t('먼저 Venture Simulator를 완료해주세요.','Complete the Venture Simulator first.');
}
try {current=new StateStore(localStorage).readSource();}catch{/* In-memory completion still works. */}
updateHub();
window.addEventListener('asnm:module3-complete',event=>{
  try {
    current=fromModule3(event.detail);
    updateHub();
    new StateStore(localStorage).saveSource(current);
    status(t('Venture World로 전달할 결과가 준비되었습니다.','Your results are ready for Venture World.'));
  }catch(error){status(t('자동 저장 불가. 현재 결과는 연결 버튼으로 전달됩니다. ','Autosave unavailable. The entry button can still transfer current results. ')+error.message);}
});
document.querySelectorAll('[data-venture-world]').forEach(button=>button.addEventListener('click',()=>{
  if(!current){status(t('먼저 Venture Simulator를 완료해주세요.','Complete the Venture Simulator first.'));return;}
  const direct=new URL(url);direct.searchParams.set('source','module3');
  direct.hash='state='+encodeURIComponent(JSON.stringify(current));
  location.assign(direct.href);
}));
window.addEventListener('storage',event=>{
  if(event.key===SOURCE_KEY || event.key===null){try{current=new StateStore(localStorage).readSource();}catch{current=null;}updateHub();}
});
// The original report is restored through a small hook in the original app.
// The source stays on-device. A fragment also works when localStorage is blocked.
if(new URLSearchParams(location.search).get('view')==='module3-report') {
  try {
    const hash=location.hash;
    history.replaceState(null,'',location.pathname);
    const raw=hash.startsWith('#report=')?JSON.parse(decodeURIComponent(hash.slice(8))):current?.provenance?.module3;
    if(raw)window.dispatchEvent(new CustomEvent('asnm:restore-report',{detail:raw}));
    else {window.showPage('m3a');status(t('완료된 Module 3 결과가 없습니다.','No completed Module 3 result is available.'));}
  }catch(error){status(error.message);}
}
