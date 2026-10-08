import {rooms} from './rooms.js';

export const personas={
  ceo:[['Chief of Staff','비서실장']],finance:[['CFO Advisor','재무 자문']],market:[['Customer Persona','고객 페르소나']],
  product:[['CTO / Product','제품·기술 리드']],customer:[['Customer','고객']],
  team:[['Developer','개발자'],['Marketer','마케터']],investor:[['Investor','투자자']]
};
/** Procedural jointed characters. No downloaded meshes or runtime asset dependencies. */
export function createAvatars(B,scene,onArrival,options={}) {
  const actors=[];let inMeeting=false;let elapsed=0,route=[],destination='ceo',moving=false,manualUntil=0;
  const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function humanoid(name,color,x,z,roomId,style=0) {
    const root=new B.TransformNode(name,scene);root.position.set(x,.15,z);root.metadata={state:'idle',roomId,actor:true};
    const material=(suffix,hex)=>{const m=new B.StandardMaterial(name+'-'+suffix,scene);m.diffuseColor=B.Color3.FromHexString(hex);m.specularColor=new B.Color3(.18,.16,.14);return m;};
    const shirt=material('jacket',color),skin=material('skin',['#bd8667','#e6ba98','#8e5e48','#c99475'][style%4]),dark=material('trousers',['#263a4c','#343338','#524a46'][style%3]),hair=material('hair',['#30251f','#65432a','#141d27','#a17a4e'][style%4]),white=material('shirt','#e9dfca'),shoe=material('shoe','#1b2028');
    const body=new B.TransformNode(name+'-body',scene);body.parent=root;
    const sphere=(id,sx,sy,sz,px,py,pz,mat,parent=body)=>{const m=B.MeshBuilder.CreateSphere(name+'-'+id,{diameter:1,segments:10},scene);m.scaling.set(sx,sy,sz);m.position.set(px,py,pz);m.material=mat;m.parent=parent;m.metadata={roomId,persona:name};return m;};
    const taper=(id,top,bottom,height,px,py,pz,mat,parent=body)=>{const m=B.MeshBuilder.CreateCylinder(name+'-'+id,{diameterTop:top,diameterBottom:bottom,height,tessellation:10},scene);m.position.set(px,py,pz);m.material=mat;m.parent=parent;m.metadata={roomId,persona:name};return m;};
    const broad=style%2?.9:1.06;
    const torso=taper('tailored-torso',.61*broad,.45, .64,0,1.37,0,shirt);torso.scaling.z=.65;
    sphere('hips',.46,.27,.3,0,.99,0,dark);
    taper('neck',.17,.2,.2,0,1.8,0,skin);
    const headPivot=new B.TransformNode(name+'-head-joint',scene);headPivot.parent=body;headPivot.position.y=2.03;
    const head=sphere('head',.39,.49,.36,0,0,0,skin,headPivot);
    sphere('hair-cap',.41,.26,.38,0,.18,-.025,hair,headPivot);
    sphere('hair-sweep',.28,.12,.21,-.08,.24,.07,hair,headPivot);
    if(style%3===1)sphere('hair-bun',.25,.27,.23,0,.07,-.24,hair,headPivot);
    for(const side of [-1,1]){sphere('ear',.065,.12,.07,side*.2,0,0,skin,headPivot);sphere('eye',.038,.028,.023,side*.085,.025,.169,shoe,headPivot);}
    sphere('nose',.065,.10,.065,0,-.025,.18,skin,headPivot);
    sphere('mouth',.09,.018,.02,0,-.115,.165,hair,headPivot);
    const front=taper('shirt-front',.23,.18,.53,0,1.4,.195,white);front.scaling.z=.13;
    for(const side of [-1,1]){const lapel=sphere('lapel',.1,.46,.045,side*.14,1.46,.21,shirt);lapel.rotation.z=side*.22;}
    if([0,1,7].includes(style)){const tie=taper('tie',.055,.095,.36,0,1.48,.225,hair);tie.scaling.z=.2;}
    const arms=[],legs=[],elbows=[],knees=[];
    for(const side of [-1,1]){
      const arm=new B.TransformNode(name+'-shoulder-'+side,scene);arm.parent=body;arm.position.set(side*.35*broad,1.62,0);arms.push(arm);
      sphere('shoulder',.25,.24,.27,0,0,0,shirt,arm);taper('upper-arm',.21,.16,.36,0,-.2,0,shirt,arm);
      const elbow=new B.TransformNode(name+'-elbow-'+side,scene);elbow.parent=arm;elbow.position.y=-.39;elbows.push(elbow);
      taper('forearm',.16,.115,.32,0,-.14,0,shirt,elbow);taper('cuff',.13,.13,.055,0,-.31,0,white,elbow);sphere('hand',.13,.18,.105,0,-.41,0,skin,elbow);
      const leg=new B.TransformNode(name+'-hip-'+side,scene);leg.parent=body;leg.position.set(side*.135,.95,0);legs.push(leg);
      taper('thigh',.235,.17,.43,0,-.2,0,dark,leg);
      const knee=new B.TransformNode(name+'-knee-'+side,scene);knee.parent=leg;knee.position.y=-.42;knees.push(knee);
      sphere('knee',.175,.16,.175,0,0,0,dark,knee);taper('calf',.17,.125,.38,0,-.19,0,dark,knee);sphere('shoe',.19,.13,.35,0,-.41,.07,shoe,knee);
    }
    if([1,3,4].includes(style))for(const side of [-1,1]){const glasses=B.MeshBuilder.CreateTorus(name+'-glasses',{diameter:.14,thickness:.016,tessellation:14},scene);glasses.parent=headPivot;glasses.rotation.x=Math.PI/2;glasses.position.set(side*.086,.03,.18);glasses.material=shoe;glasses.metadata={roomId};}
    if(style===4){const phones=B.MeshBuilder.CreateTorus(name+'-headphones',{diameter:.44,thickness:.045,tessellation:12},scene);phones.parent=headPivot;phones.rotation.x=Math.PI/2;phones.position.z=-.04;phones.material=shirt;}
    const actor={root,body,arms,legs,elbows,knees,head:headPivot,phase:actors.length*.9,materials:[shirt,skin,dark,hair,white,shoe],roomId,baseZ:z};actors.push(actor);root.scaling.setAll(style===7?1.08:style===5?.94:1);
    return actor;
  }
  const founder=humanoid('founder','#d6ae76',0,-2.1,'ceo',0);founder.root.metadata.role='founder';
  for(const [i,room] of rooms.entries())personas[room.id].forEach(([name],j)=>humanoid(`npc-${room.id}-${j}-${name}`,room.color,room.x+(j?1.3:-1.3),room.z-1,room.id,i+j+1));
  if(options.productExperience){
    const mapping={ceo:'CEO',finance:'CFO',market:'Growth',product:'CTO',customer:'Customer',investor:'Investor'};
    for(const a of actors)a.role=a===founder?'Founder':mapping[a.roomId]||'Team';
    const p=rooms.find(r=>r.id==='product');const lead=humanoid('npc-product-lead','#d7b788',p.x+1.5,p.z-1,'product',5);lead.role='Product';
  }
  for(const a of actors)a.home=a.root.position.clone();
  const staff=[];const team=rooms.find(r=>r.id==='team');
  for(let i=0;i<6;i++){const a=humanoid('team-member-'+i,['#819ca7','#b79583','#97ad91'][i%3],team.x-2.5+i%3*2,team.z+1.4+Math.floor(i/3)*.8,'team',4+i);a.root.scaling.setAll(.86);a.root.setEnabled(false);staff.push(a);}
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
      if(!actor.root.isEnabled())continue;
      if(actor.meetingTarget){const delta=actor.meetingTarget.subtract(actor.root.position);if(delta.length()>.05){actor.root.position.addInPlace(delta.scale(Math.min(1,dt*3)));actor.root.rotation.y=Math.atan2(-actor.root.position.x,-actor.root.position.z);}else actor.meetingTarget=null;}
      const walk=(actor===founder&&(moving||elapsed<manualUntil))||!!actor.meetingTarget,state=walk?'walk':actor.root.metadata.state;
      const wave=Math.sin(elapsed*(walk?11:2)+actor.phase),motion=reduced?0:1;
      actor.body.position.y=motion*(walk?Math.abs(wave)*.045:wave*.014);
      actor.body.rotation.z=motion*(state==='concerned'?.045:wave*.012);
      actor.head.rotation.x=motion*(state==='concerned'?.18:state==='think'?.1:wave*.025);
      actor.head.rotation.z=motion*(state==='think'?.16:wave*.02);
      actor.arms.forEach((joint,i)=>{joint.rotation.x=motion*(walk?wave*.55*(i?1:-1):state==='celebrate'?-.9+wave*.12:state==='talk'&&i===1?-.45+wave*.15:state==='think'&&i===1?-.7:state==='concerned'?.18:wave*.025);joint.rotation.z=motion*(state==='celebrate'?(i?-1:1)*.6:(i?-.07:.07));});
      actor.elbows.forEach((joint,i)=>joint.rotation.x=motion*(state==='think'&&i===1?-1.3:state==='talk'?-.45:walk?-.18:0));
      actor.legs.forEach((joint,i)=>joint.rotation.x=motion*(walk?wave*.5*(i?-1:1):0));
      actor.knees.forEach((joint,i)=>joint.rotation.x=motion*(walk?Math.max(0,wave*(i?-1:1))*.55:0));
      if(!inMeeting&&actor.roomId==='investor'&&actor!==founder){const target=actor.baseZ-(actor.offer?.75:0);actor.root.position.z+=(target-actor.root.position.z)*Math.min(1,dt*3);}
    }
  });
  return {founder:founder.root,actors,moveToRoom,
    meeting(active){inMeeting=active;const advisors=actors.filter(a=>a!==founder&&!staff.includes(a));advisors.forEach((a,i)=>{a.meetingTarget=active?new B.Vector3(Math.cos(i/advisors.length*Math.PI*2)*2.8,.15,Math.sin(i/advisors.length*Math.PI*2)*2.8):a.home.clone();if(reduced){a.root.position.copyFrom(a.meetingTarget);a.meetingTarget=null;}});},
    converse(id,mood='talk'){for(const a of actors)if(a!==founder){a.root.metadata.state=a.roomId===id?mood:(a.mood||'idle');if(a.roomId===id)a.root.rotation.y=Math.atan2(founder.root.position.x-a.root.position.x,founder.root.position.z-a.root.position.z);}if(!moving){founder.root.metadata.state=mood==='think'?'think':'idle';const r=rooms.find(r=>r.id===id);founder.root.rotation.y=Math.atan2(-1.3,1.1);}},
    update(s,log){staff.forEach((a,i)=>a.root.setEnabled(i<Math.min(6,Math.max(0,s.venture.teamSize-1))));for(const a of actors){const risk=(a.roomId==='finance'&&s.venture.runway!==null&&s.venture.runway<6)||(a.roomId==='customer'&&s.venture.retention<60);const before=log?.stateBefore.venture;const down=before&&(a.roomId==='customer'?s.venture.retention<before.retention:a.roomId==='finance'?s.venture.runway!==null&&(before.runway===null||s.venture.runway<before.runway):a.roomId==='team'?s.venture.teamSize<before.teamSize:false);const up=before&&(a.roomId==='product'?s.venture.productProgress>before.productProgress:a.roomId==='team'?s.venture.teamSize>before.teamSize:s.venture.mrr>before.mrr);a.mood=risk||down?'concerned':up?'celebrate':'idle';if(a!==founder||!moving)a.root.metadata.state=a.mood;a.offer=!!s.operations.offer;}},
    nudge(dx,dz){if(moving)return;const p=founder.root.position,q=p.add(new B.Vector3(dx,0,dz));if(Math.abs(q.x)>19||Math.abs(q.z)>19)return;for(const r of rooms){const crosses=(Math.abs(q.x-r.x)<3.9&&Math.abs(q.z-r.z)<3.5);if(crosses&&(q.z>r.z+2.9||q.x>r.x+3.3))return;}p.copyFrom(q);founder.root.rotation.y=Math.atan2(dx,dz);manualUntil=elapsed+.25;const inside=rooms.find(r=>Math.abs(q.x-r.x)<3&&Math.abs(q.z-r.z)<2.8);if(inside&&destination!==inside.id){destination=inside.id;founder.root.metadata.roomId=inside.id;onArrival(inside.id);}},
    dispose(){scene.onBeforeRenderObservable.remove(observer);for(const a of actors){a.root.dispose();a.materials.forEach(m=>m.dispose());}}
  };
}
