import {rooms} from './rooms.js';

export const personas={
  ceo:[['Founder','창업자']],finance:[['CFO Advisor','재무 자문']],market:[['Customer Persona','고객 페르소나']],
  product:[['CTO / Product','제품·기술 리드']],customer:[['Customer','고객']],
  team:[['Developer','개발자'],['Marketer','마케터']],investor:[['Investor','투자자']]
};
/** Primitive humanoids: no downloads, no finance logic, a single disposable tick. */
export function createAvatars(B,scene,onArrival) {
  const actors=[];let elapsed=0,route=[],destination='ceo',moving=false;
  const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function humanoid(name,color,x,z,roomId) {
    const root=new B.TransformNode(name,scene);root.position.set(x,.15,z);
    const shirt=new B.StandardMaterial(name+'-shirt',scene);shirt.diffuseColor=B.Color3.FromHexString(color);
    const skin=new B.StandardMaterial(name+'-skin',scene);skin.diffuseColor=B.Color3.FromHexString('#dab396');
    const dark=new B.StandardMaterial(name+'-trousers',scene);dark.diffuseColor=B.Color3.FromHexString('#24344b');
    const part=(id,w,h,d,y,material,px=0)=>{const mesh=B.MeshBuilder.CreateBox(name+'-'+id,{width:w,height:h,depth:d},scene);mesh.parent=root;mesh.position.set(px,y,0);mesh.material=material;mesh.metadata={roomId,persona:name};return mesh;};
    const head=B.MeshBuilder.CreateSphere(name+'-head',{diameter:.44,segments:8},scene);head.parent=root;head.position.y=1.67;head.material=skin;head.metadata={roomId,persona:name};
    part('body',.56,.65,.3,1.1,shirt);
    const arms=[part('left-arm',.16,.6,.17,1.05,shirt,-.38),part('right-arm',.16,.6,.17,1.05,shirt,.38)];
    const legs=[part('left-leg',.2,.65,.23,.4,dark,-.16),part('right-leg',.2,.65,.23,.4,dark,.16)];
    const actor={root,arms,legs,head,phase:actors.length*.9,materials:[shirt,skin,dark]};actors.push(actor);return actor;
  }
  const founder=humanoid('founder','#f2c078',0,-2.1,'ceo');
  founder.root.metadata={state:'idle',roomId:'ceo',role:'founder'};
  for(const room of rooms.filter(r=>r.id!=='ceo')) {
    personas[room.id].forEach(([name],i)=>humanoid(`npc-${room.id}-${i}-${name}`,room.color,room.x+(i?1.3:-1.3),room.z-1.0,room.id));
  }
  // A small walkable grid routes around room footprints. Interior movement uses the south doorway.
  const entrance=r=>new B.Vector3(r.x,.15,r.z-5);
  const blocked=(x,z)=>rooms.some(r=>Math.abs(x-r.x)<4.2 && Math.abs(z-r.z)<3.9);
  function exteriorPath(start,end){
    const key=(x,z)=>`${x},${z}`,queue=[[Math.round(start.x),Math.round(start.z)]],parents=new Map([[key(...queue[0]),null]]);
    const goal=key(Math.round(end.x),Math.round(end.z));let cursor=0;
    while(cursor<queue.length){
      const [x,z]=queue[cursor++],k=key(x,z);if(k===goal)break;
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx,nz=z+dz,nk=key(nx,nz);
        if(Math.abs(nx)>19||Math.abs(nz)>19||blocked(nx,nz)||parents.has(nk))continue;
        parents.set(nk,k);queue.push([nx,nz]);
      }
    }
    if(!parents.has(goal))return [];
    const path=[];for(let k=goal;k!==null;k=parents.get(k)){const[x,z]=k.split(',').map(Number);path.unshift(new B.Vector3(x,.15,z));}
    return path;
  }
  function moveToRoom(id) {
    const room=rooms.find(r=>r.id===id);if(!room)return;
    if(!moving && destination===id){onArrival(id);return;}
    const p=founder.root.position.clone();
    const inside=rooms.find(r=>Math.abs(p.x-r.x)<4.2&&Math.abs(p.z-r.z)<3.9);
    const exit=inside?entrance(inside):new B.Vector3(Math.round(p.x),.15,Math.round(p.z));
    const entry=entrance(room);
    route=[exit,...exteriorPath(exit,entry),new B.Vector3(room.x,.15,room.z-2.1)];
    destination=id;moving=true;founder.root.metadata.state='walking';
  }
  const observer=scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.min(scene.getEngine().getDeltaTime()/1000,.05);elapsed+=dt;
    if(moving) {
      let distance=dt*12;
      while(route.length && distance>0) {
        const delta=route[0].subtract(founder.root.position),length=delta.length();
        if(length<=distance){founder.root.position.copyFrom(route.shift());distance-=length;}
        else {founder.root.rotation.y=Math.atan2(delta.x,delta.z);founder.root.position.addInPlace(delta.scale(distance/length));distance=0;}
      }
      if(!route.length){moving=false;founder.root.metadata={state:'idle',roomId:destination,role:'founder'};onArrival(destination);}
    }
    for(const actor of actors) {
      const walk=actor===founder&&moving;
      const swing=reduced?0:Math.sin(elapsed*(walk?12:1.8)+actor.phase)*(walk?.5:.025);
      actor.arms.forEach((mesh,i)=>mesh.rotation.x=swing*(i?1:-1));
      actor.legs.forEach((mesh,i)=>mesh.rotation.x=walk?swing*(i?-1:1):0);
      actor.head.position.y=1.67+(reduced?0:Math.sin(elapsed*1.8+actor.phase)*.015);
    }
  });
  return {founder:founder.root,moveToRoom,dispose(){scene.onBeforeRenderObservable.remove(observer);for(const a of actors){a.root.dispose();a.materials.forEach(m=>m.dispose());}}};
}
