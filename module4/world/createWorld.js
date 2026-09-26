import {rooms} from './rooms.js';
import {createAvatars} from './avatars.js';

/** Rendering receives state; it never calculates business outcomes. */
export function createWorld(canvas,onRoom,onArrival=()=>{}) {
  const B=globalThis.BABYLON;
  if(!B || !B.Engine.isSupported()) throw new Error('WebGL unavailable');
  const engine=new B.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
  engine.setHardwareScalingLevel(Math.max(1,globalThis.devicePixelRatio/1.5));
  const scene=new B.Scene(engine); scene.clearColor=new B.Color4(.025,.045,.08,1);
  scene.fogMode=B.Scene.FOGMODE_EXP2;scene.fogDensity=.008;scene.fogColor=new B.Color3(.025,.045,.08);
  const camera=new B.ArcRotateCamera('campus-camera',-Math.PI/2.7,Math.PI/3.2,47,new B.Vector3(0,0,0),scene);
  camera.lowerRadiusLimit=9;camera.upperRadiusLimit=65;camera.upperBetaLimit=Math.PI/2.12;camera.lowerBetaLimit=.15;
  camera.wheelDeltaPercentage=.015;camera.panningSensibility=90;camera.attachControl(canvas,true);
  new B.HemisphericLight('sky',new B.Vector3(0,1,0),scene).intensity=.9;
  const sun=new B.DirectionalLight('key',new B.Vector3(-.4,-1,.5),scene);sun.intensity=1.25;
  const mat=(name,hex,emission=0,alpha=1)=>{const m=new B.StandardMaterial(name,scene);m.diffuseColor=B.Color3.FromHexString(hex);m.emissiveColor=m.diffuseColor.scale(emission);m.specularColor=new B.Color3(.2,.3,.4);m.alpha=alpha;return m;};
  const floorMat=mat('floor','#26364b'),edgeMat=mat('path','#456873',.25),deskMat=mat('desks','#8b7561');
  const leafMat=mat('leaves','#568d70'),potMat=mat('pots','#c2a187'),seatMat=mat('lounge','#b09584');
  const box=(name,w,h,d,x,y,z,material)=>{const mesh=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);mesh.position.set(x,y,z);mesh.material=material;return mesh;};
  box('foundation',40,.6,40,0,-.6,0,mat('foundation','#0a1425'));
  const ground=B.MeshBuilder.CreateGround('ground',{width:110,height:110},scene);ground.position.y=-1;ground.material=mat('ground','#091324');
  for(let i=-17;i<=17;i+=2) {
    const lines=B.MeshBuilder.CreateLines('grid',{points:[new B.Vector3(-17,-.28,i),new B.Vector3(17,-.28,i)]},scene);lines.color=new B.Color3(.09,.16,.23);
    const vertical=B.MeshBuilder.CreateLines('grid',{points:[new B.Vector3(i,-.28,-17),new B.Vector3(i,-.28,17)]},scene);vertical.color=lines.color;
  }
  const markers=[],progressBars=[];
  for(const [index,room] of rooms.entries()) {
    const color=mat(room.id,room.color,.22),glass=mat(room.id+'-glass',room.color,.07,.17);
    const root=new B.TransformNode(room.id+'-root',scene);root.position.set(room.x,0,room.z);
    const local=(mesh)=>{mesh.parent=root;mesh.metadata={roomId:room.id};return mesh;};
    const tile=local(box(room.id+'-floor',7.4,.25,6.6,0,0,0,floorMat));
    local(box('trim',7.5,.06,.09,0,.17,-3.25,color));
    local(box('trim',.09,.06,6.6,-3.68,.17,0,color));
    local(box('glass',7.4,2.3,.10,0,1.25,3.25,glass));
    local(box('glass',.10,2.3,6.6,3.65,1.25,0,glass));
    for(const x of [-3.55,3.55]) local(box('frame',.10,3,.10,x,1.5,3.1,color));
    local(box('frame',7.2,.10,.10,0,3,3.1,color));
    for(const x of (['investor','customer','market'].includes(room.id)?[]:[-1.65,1.65])) {
      local(box('desk',2,.18,.95,x,.95,.7,deskMat));
      local(box('screen',1.15,.7,.06,x,1.42,.94,color));
      local(box('chair',.65,.6,.65,x,.45,-.2,floorMat));
    }
    // Small room-specific props communicate the activity without external assets.
    const pot=local(B.MeshBuilder.CreateCylinder(room.id+'-plant-pot',{diameter:.6,height:.6,tessellation:8},scene));
    pot.position.set(-2.9,.45,2.3);pot.material=potMat;
    const leaves=local(B.MeshBuilder.CreateSphere(room.id+'-plant',{diameter:1,segments:6},scene));leaves.position.set(-2.9,1.2,2.3);leaves.scaling.y=1.5;leaves.material=leafMat;
    if(['investor','customer','market'].includes(room.id)){
      local(box('lounge-sofa',2.1,.55,.8,-1.9,.5,.5,seatMat));
      local(box('lounge-back',2.1,.7,.2,-1.9,.95,.85,seatMat));
      local(box('interview-table',1.1,.12,1.4,0,.75,.7,deskMat));
      local(box('guest-seat',.8,.55,.8,1.65,.5,.5,seatMat));
    }
    if(['market','investor','finance'].includes(room.id)){
      local(box(room.id+'-board',3.3,1.55,.1,.5,2,2.9,deskMat));
      for(let n=0;n<4;n++)local(box('scenario-chart',.45,.35+n*.22,.12,-.6+n*.65,1.65+n*.11,2.8,color));
    }
    if(room.id==='product'){
      const proto=local(B.MeshBuilder.CreatePolyhedron('prototype',{type:1,size:.45},scene));proto.position.set(-1.65,1.55,.7);proto.material=color;
    }
    if(room.id==='ceo')local(box('strategy-rug',5,.02,4,0,.14,0,mat('warm-rug','#6b5c54')));
    if(room.id==='team')local(box('collaboration-board',4.5,1.2,.1,0,2,2.9,deskMat));
    const beacon=B.MeshBuilder.CreateCylinder(room.id+'-beacon',{diameter:.75,height:.16,tessellation:32},scene);beacon.position.set(0,.34,-2.2);beacon.material=color;local(beacon);markers.push(beacon);
    const label=B.MeshBuilder.CreatePlane(room.id+'-label',{width:6,height:.95},scene);label.position.set(0,3.8,0);label.billboardMode=B.Mesh.BILLBOARDMODE_ALL;local(label);
    const texture=new B.DynamicTexture(room.id+'-text',{width:768,height:128},scene,true);
    texture.drawText(room.name,null,82,'bold 44px sans-serif',room.color,'#102035',true);
    const labelMat=new B.StandardMaterial('label',scene);labelMat.diffuseTexture=texture;labelMat.emissiveTexture=texture;labelMat.disableLighting=true;label.material=labelMat;
    const bar=local(box('state-indicator',4,.12,.2,0,.3,-2.85,color));progressBars.push(bar);
    if(index>0) {
      const points=[new B.Vector3(0,-.08,0),new B.Vector3(room.x,-.08,room.z)];
      const tube=B.MeshBuilder.CreateTube('connection',{path:points,radius:.055,tessellation:6},scene);tube.material=edgeMat;
    }
    tile.actionManager=new B.ActionManager(scene);
  }
  scene.onPointerObservable.add(info=>{
    if(info.type===B.PointerEventTypes.POINTERPICK && info.pickInfo?.hit) {
      const id=info.pickInfo.pickedMesh?.metadata?.roomId;if(id) onRoom(id);
    }
  });
  let cameraMove=null;
  const avatars=createAvatars(B,scene,onArrival);
  const smooth=(target,radius)=>{cameraMove={target,radius};};
  const cameraTick=scene.onBeforeRenderObservable.add(()=>{
    if(!cameraMove)return;
    const amount=1-Math.exp(-7*Math.min(.05,engine.getDeltaTime()/1000));
    camera.setTarget(B.Vector3.Lerp(camera.target,cameraMove.target,amount));
    camera.radius+=(cameraMove.radius-camera.radius)*amount;
    if(B.Vector3.Distance(camera.target,cameraMove.target)<.02 && Math.abs(camera.radius-cameraMove.radius)<.02)cameraMove=null;
  });
  const cancelCamera=()=>{cameraMove=null;};
  canvas.addEventListener('pointerdown',cancelCamera);canvas.addEventListener('wheel',cancelCamera,{passive:true});
  const keyHandler=e=>{
    if(document.activeElement!==canvas) return;
    const delta={w:[0,1],s:[0,-1],a:[-1,0],d:[1,0]}[e.key.toLowerCase()];
    if(delta){cameraMove=null;e.preventDefault();camera.target.x=Math.max(-17,Math.min(17,camera.target.x+delta[0]));camera.target.z=Math.max(-17,Math.min(17,camera.target.z+delta[1]));}
  };
  canvas.addEventListener('keydown',keyHandler);
  const renderFrame=()=>scene.render();
  engine.runRenderLoop(renderFrame);
  const resize=new ResizeObserver(()=>engine.resize());resize.observe(canvas);
  canvas.dataset.ready='true';
  return {
    scene,camera,avatars,
    focus(id) {const r=rooms.find(r=>r.id===id);if(r){smooth(new B.Vector3(r.x,1,r.z),20);}},
    goToRoom(id){this.focus(id);avatars.moveToRoom(id);},
    overview(){smooth(B.Vector3.Zero(),47);},
    pause(){engine.stopRenderLoop(renderFrame);},
    resume(){engine.resize();engine.runRenderLoop(renderFrame);},
    update(s){const values=[s.venture.productProgress,s.venture.runway===null?100:Math.min(100,s.venture.runway/12*100),s.market.demand,s.venture.productProgress,s.venture.retention,s.venture.teamCapacity,s.operations.founderEquity];progressBars.forEach((b,i)=>b.scaling.x=Math.max(.02,values[i]/100));markers.forEach((m,i)=>m.scaling.y=1+values[i]/50);},
    dispose(){resize.disconnect();cameraMove=null;scene.onBeforeRenderObservable.remove(cameraTick);avatars.dispose();canvas.removeEventListener('keydown',keyHandler);canvas.removeEventListener('pointerdown',cancelCamera);canvas.removeEventListener('wheel',cancelCamera);engine.stopRenderLoop(renderFrame);scene.dispose();engine.dispose();delete canvas.dataset.ready;}
  };
}
