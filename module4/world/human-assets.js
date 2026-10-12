/** Real rigged Microsoft Rocketbox humans. Models are MIT; loader is Apache-2.0.
 * All assets are served from this application, with no external avatar service.
 * Existing gameplay roots, picking metadata and routes remain authoritative.
 */
const BASE = new URL('../assets/humans/', import.meta.url).href;
const MODELS = ['business_female_01.glb','business_male_04.glb','business_female_02.glb','business_male_03.glb','business_female_03.glb','business_male_01.glb'];
let loaderPromise;
function ensureLoader(B) {
  if (B.SceneLoader.IsPluginForExtensionAvailable('.glb')) return Promise.resolve();
  if (!loaderPromise) loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = BASE + 'babylonjs.loaders.min.js'; script.async = true;
    script.onload = () => B.SceneLoader.IsPluginForExtensionAvailable('.glb') ? resolve() : reject(new Error('glTF loader unavailable'));
    script.onerror = () => reject(new Error('Could not load local glTF loader'));
    document.head.appendChild(script);
  }).catch(error => { loaderPromise = null; throw error; });
  return loaderPromise;
}
/**
 * @returns {{ready: Promise<{loaded:number,failed:number}>, dispose:Function}}
 * Optional voice integration: actor.root.metadata.speaking = true/false.
 * The flag drives jaw movement; speech synthesis and consent stay in the UI.
 * No phoneme recognition is claimed: this is speech-state mouth animation.
 */
export function installHumanAvatars(B, scene, avatars, shadows) {
  let disposed = false, elapsed = 0;
  const records = [], containers = new Map();
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const actors = avatars.actors || [];
  const load = file => {
    if (!containers.has(file)) containers.set(file, B.SceneLoader.LoadAssetContainerAsync(BASE, file, scene));
    return containers.get(file);
  };
  function attach(actor, container) {
    if (disposed || actor.root.isDisposed()) return;
    const instance = container.instantiateModelsToScene(name => `${actor.root.name}-human-${name}`, false, {doNotInstantiate:true});
    const holder = new B.TransformNode(`${actor.root.name}-human`, scene);
    for (const root of instance.rootNodes) root.parent = holder;
    const meshes = holder.getChildMeshes();
    let minY = Infinity, maxY = -Infinity;
    for (const mesh of meshes) {
      mesh.computeWorldMatrix(true);
      if (mesh.getTotalVertices()) { const box = mesh.getBoundingInfo().boundingBox; minY = Math.min(minY,box.minimumWorld.y); maxY = Math.max(maxY,box.maximumWorld.y); }
      mesh.metadata = {...mesh.metadata, roomId:actor.roomId, persona:actor.root.name, actor:true, advisorRole:actor.role, humanAvatar:true};
      mesh.isPickable = true; mesh.receiveShadows = true;
    }
    const scale = Number.isFinite(maxY-minY) && maxY>minY ? 2.10/(maxY-minY) : 1.2;
    holder.scaling.setAll(scale); holder.position.y = Number.isFinite(minY) ? -minY*scale : 0;
    holder.parent = actor.root;
    // Source humans face glTF +Z; Babylon's LH conversion flips that direction.
    holder.rotation.y = Math.PI;
    // Hide fallback geometry only after a fully loaded skin is attached.
    actor.body.setEnabled(false);
    for(const mesh of meshes) if(mesh.getTotalVertices()) shadows?.addShadowCaster?.(mesh, false);
    const groups = new Map();
    for (const group of instance.animationGroups) {
      group.stop();
      const match = group.name.match(/(Idle|Walk|Talk|Think|Celebrate|Concerned)/i);
      if(match) groups.set(match[1].toLowerCase(),group);
      for(const target of group.targetedAnimations){target.animation.enableBlending=true;target.animation.blendingSpeed=.08;}
    }
    const morphs = [];
    for (const mesh of meshes) if(mesh.morphTargetManager) {
      for(let i=0;i<mesh.morphTargetManager.numTargets;i++) {
        const target=mesh.morphTargetManager.getTarget(i);
        if(/JawOpen|MouthFunnel|EyeBlinkLeft|EyeBlinkRight|MouthSmile/.test(target.name)) morphs.push(target);
      }
    }
    const record = {actor,holder,instance,groups,morphs,mode:null,lastPosition:actor.root.position.clone(),movingUntil:0};
    records.push(record); actor.human = {loaded:true, source:'Microsoft Rocketbox', holder};
    actor.root.metadata = {...actor.root.metadata,humanAvatar:true};
    play(record,'idle');
  }
  function play(record,mode) {
    const group=record.groups.get(mode)||record.groups.get('idle');
    if(!group||record.mode===mode)return;
    for(const candidate of record.groups.values())candidate.stop();
    group.start(true, mode==='walk'?1.25:mode==='talk'?.85:.55);
    if(reduced)group.pause();
    record.mode=mode;
  }
  const observer=scene.onBeforeRenderObservable.add(()=>{
    elapsed+=Math.min(scene.getEngine().getDeltaTime()/1000,.08);
    for(const record of records){
      const {actor,morphs,holder}=record;
      if(!actor.root.isEnabled())continue;
      const distance=B.Vector3.DistanceSquared(actor.root.position,record.lastPosition);
      if(distance>.000002)record.movingUntil=elapsed+.15;
      record.lastPosition.copyFrom(actor.root.position);
      const state=actor.root.metadata?.state||'idle';
      const speaking=typeof actor.root.metadata?.speaking==='boolean'?actor.root.metadata.speaking:state==='talk';
      const walking=record.movingUntil>elapsed||state==='walking'||!!actor.meetingTarget;
      const mode=walking?'walk':speaking?'talk':['think','celebrate','concerned'].includes(state)?state:'idle';
      play(record,mode);
      holder.position.x=0;holder.position.z=0;
      const phase=elapsed+(actor.phase||0);
      const blink=(phase%4.7)>4.55?Math.sin(((phase%4.7)-4.55)/.15*Math.PI):0;
      for(const morph of morphs){
        if(/JawOpen/.test(morph.name))morph.influence=speaking&&!reduced?.10+Math.abs(Math.sin(phase*13))*.30:0;
        else if(/MouthFunnel/.test(morph.name))morph.influence=speaking&&!reduced?Math.max(0,Math.sin(phase*7))*.18:0;
        else if(/EyeBlink/.test(morph.name))morph.influence=reduced?0:blink;
        else if(/MouthSmile/.test(morph.name))morph.influence=state==='celebrate'?.45:.06;
      }
    }
  });
  // At most two concurrent model requests, sharing source assets for all clones.
  const ready=ensureLoader(B).then(async()=>{
    let next=0,loaded=0,failed=0;
    const jobs=MODELS.map((file,index)=>({file,actors:actors.filter((_,i)=>i%MODELS.length===index)}));
    async function worker(){
      while(next<jobs.length&&!disposed){
        const job=jobs[next++];if(!job.actors.length)continue;
        try{const container=await load(job.file);for(const actor of job.actors){attach(actor,container);loaded++;}}
        catch(error){failed+=job.actors.length;for(const actor of job.actors)actor.human={loaded:false,error:String(error?.message||error)};}
      }
    }
    await Promise.all([worker(),worker()]);
    return {loaded,failed};
  }).catch(error=>{for(const actor of actors)actor.human={loaded:false,error:String(error?.message||error)};return {loaded:0,failed:actors.length};});
  return {ready,dispose(){
    disposed=true;scene.onBeforeRenderObservable.remove(observer);
    for(const record of records){record.instance.dispose();record.holder.dispose();}
    for(const promise of containers.values())promise.then(container=>container.dispose()).catch(()=>{});
    records.length=0;
  }};
}
