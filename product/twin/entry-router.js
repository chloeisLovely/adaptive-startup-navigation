// Same editable world for Module 3, direct entry and the quick trial. Originals stay on-device.
const params=new URLSearchParams(location.search),root=new URL('../../',import.meta.url);
if(params.get('legacy')==='1')await import('../world-app.js');
else {
 const workspace=await import('../trusted/workspace.js');const {getActiveProject,adoptLegacy,store,mountWorkspace}=workspace;let p=getActiveProject();
 if(params.get('source')==='module3'){
  try{const {SOURCE_KEY}=await import('../../module4/state/StateStore.js');const hash=location.hash;const raw=hash.startsWith('#state=')?JSON.parse(decodeURIComponent(hash.slice(7))):JSON.parse(localStorage.getItem(SOURCE_KEY)||'null');if(!raw)throw Error('Missing source');p=adoptLegacy(raw);}
  catch{document.getElementById('app').textContent=params.get('lang')==='en'?'Could not import Module 3. Return to Module 3 and try again.':'Module 3 정보를 가져오지 못했습니다. 원본 화면에서 다시 연결해 주세요.';throw Error('Module 3 import failed');}
 }
 if(params.get('mode')==='demo'){
  const {newProject}=await import('../trusted/model.js');p=newProject(crypto.randomUUID());p.company={...p.company,name:'My Venture',idea:'',industry:''};p.worldEntry=null;p.entryKind='demo';store.save(p);
 }
 const url=new URL('product/trusted/index.html',root);url.searchParams.set('mode','world');url.searchParams.set('lang',params.get('lang')==='en'?'en':'ko');url.searchParams.set('project',p.id);
 if(store.volatile){document.head.append(Object.assign(document.createElement('link'),{rel:'stylesheet',href:new URL('product/trusted/trusted.css',root)}));document.getElementById('app').textContent='';if(p.entryKind==='demo'){// adopt via public import path without losing the full project
   workspace.setActiveProject(p); // volatile trial remains exportable
  }
  // mountWorkspace uses the active project; selected module source was adopted above.
  mountWorkspace(document.getElementById('app'),'world',params.get('lang')==='en'?'en':'ko');
 }else location.replace(url.href);
}
