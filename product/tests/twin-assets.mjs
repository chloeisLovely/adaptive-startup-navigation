// Uses the real bundled Babylon glTF loader and GLBs with NullEngine.
// Only file IO is adapted; materials/textures and WebGL pixels are outside this check.
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),B=require('../../module4/vendor/babylon.js');
globalThis.BABYLON=B;
vm.runInThisContext(readFileSync(new URL('../../module4/assets/humans/babylonjs.loaders.min.js',import.meta.url),'utf8'));
const {installHumanAvatars}=await import('../../module4/world/human-assets.js');
const engine=new B.NullEngine(),scene=new B.Scene(engine);
B.SceneLoader.OnPluginActivatedObservable.add(plugin=>{plugin.skipMaterials=true;});
const original=B.SceneLoader.LoadAssetContainerAsync;
const requested=[];
B.SceneLoader.LoadAssetContainerAsync=(base,file,scene)=>{requested.push(file);const bytes=readFileSync(new URL(file,base));return original.call(B.SceneLoader,'','data:;base64,'+bytes.toString('base64'),scene,undefined,'.glb');};
const roles=['CTO','CFO','Growth','HR','Product','Customer','Investor'];
const actors=roles.map((role,i)=>{const root=new B.TransformNode('test-'+i,scene),body=B.MeshBuilder.CreateBox('fallback-'+i,{},scene);body.parent=root;root.metadata={state:'idle',speaking:false};return {root,body,role,roomId:'test',phase:i};});
const runtime=installHumanAvatars(B,scene,{actors});
try{
 assert.deepEqual(await runtime.ready,{loaded:7,failed:0});assert.equal(new Set(requested).size,6);
 for(const actor of actors){assert.equal(actor.body.isEnabled(),false);assert.ok(actor.human.loaded);const meshes=actor.human.holder.getChildMeshes().filter(m=>m.getTotalVertices());assert.ok(meshes.length);assert.ok(meshes.every(m=>m.metadata.advisorRole===actor.role));assert.ok(meshes.some(m=>m.skeleton?.bones.length===80));assert.ok(actor.human.holder.scaling.y>0);}
 const skeleton=i=>actors[i].human.holder.getChildMeshes().find(m=>m.skeleton).skeleton;
 assert.notEqual(skeleton(0),skeleton(6));
 actors[0].root.metadata.speaking=true;scene.onBeforeRenderObservable.notifyObservers(scene);
 const jaw=i=>actors[i].human.holder.getChildMeshes().flatMap(m=>m.morphTargetManager?Array.from({length:m.morphTargetManager.numTargets},(_,n)=>m.morphTargetManager.getTarget(n)):[]).find(t=>/JawOpen/.test(t.name));
 assert.ok(jaw(0).influence>0);assert.equal(jaw(6).influence,0);
 actors[0].root.metadata.speaking=false;scene.onBeforeRenderObservable.notifyObservers(scene);assert.equal(jaw(0).influence,0);
 console.log(JSON.stringify({assets:'passed',sourceModels:6,attachedHumans:7,checks:['real glTF import','80-joint skin','independent cloned skeletons','fallback hidden','role picking metadata','isolated speech morphs']}));
}finally{runtime.dispose();await Promise.resolve();B.SceneLoader.LoadAssetContainerAsync=original;scene.dispose();engine.dispose();}
