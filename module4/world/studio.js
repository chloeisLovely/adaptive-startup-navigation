/** Architectural layer: a continuous workplace with daylight, joinery and contextual props. */
export function createStudio(B,scene,shadows){
 const material=(name,color,roughness=.8)=>{const m=new B.PBRMaterial(name,scene);m.albedoColor=B.Color3.FromHexString(color);m.metallic=0;m.roughness=roughness;return m;};
 const cream=material('studio-plaster','#e6ddd0'),wood=material('studio-oak','#b79265'),dark=material('studio-bronze','#3b4f52',.35),linen=material('studio-linen','#c9ac8c'),green=material('studio-foliage','#537e65');
 const floor=material('studio-floor','#dac7ad');const tex=new B.DynamicTexture('woodgrain',{width:1024,height:1024},scene,false);const ctx=tex.getContext();ctx.fillStyle='#d4bd9c';ctx.fillRect(0,0,1024,1024);for(let i=0;i<32;i++){ctx.fillStyle=i%2?'#cfb795':'#dbc7a8';ctx.fillRect(0,i*32,1024,31);for(let j=0;j<6;j++){ctx.strokeStyle='rgba(108,80,48,.11)';ctx.beginPath();ctx.moveTo(j*173+(i%2)*70,i*32);ctx.lineTo(j*173+(i%2)*70,i*32+31);ctx.stroke();}}tex.update();tex.uScale=5;tex.vScale=5;floor.albedoTexture=tex;
 const box=(name,size,pos,mat,parent)=>{const m=B.MeshBuilder.CreateBox(name,{width:size[0],height:size[1],depth:size[2]},scene);m.position.set(...pos);m.material=mat;m.parent=parent||null;m.isPickable=false;m.receiveShadows=true;shadows?.addShadowCaster(m);return m;};
 box('continuous-oak-floor',[40,.12,40],[0,-.15,0],floor);
 const rounded=(name,w,h,d,pos,mat,parent)=>{const m=B.MeshBuilder.CreateCylinder(name,{height:h,diameter:1,tessellation:48},scene);m.scaling.x=w;m.scaling.z=d;m.position.set(...pos);m.material=mat;m.parent=parent||null;m.isPickable=false;shadows?.addShadowCaster(m);return m;};
 const wall=box('north-feature-wall',[40,5,.25],[0,2.5,19.8],cream);
 for(let x=-18;x<=18;x+=6){const glass=new B.PBRMaterial('window-glass-'+x,scene);glass.albedoColor=new B.Color3(.69,.85,.9);glass.alpha=.14;glass.metallic=.05;glass.roughness=.15;box('window',[5.6,3.5,.08],[x,3,19.62],glass);box('window-mullion',[.1,5,.2],[x-3,2.5,19.5],dark);box('window-sill',[5.8,.1,.5],[x,1.24,19.5],wood);}
 wall.visibility=.2;for(let z=-16;z<=16;z+=8)box('ceiling-slat',[40,.15,.35],[0,5.3,z],wood);
 // Skyline remains beyond the playable space.
 for(let i=0;i<20;i++){const height=4+((i*7)%13);box('city-building',[3+((i*3)%4),height,5],[-44+i*4.5,height/2-1,32+(i%3)*4],material('city-'+i,i%2?'#9fb9bf':'#b7c9ca'));}
 function plant(x,z){rounded('ceramic-planter',.65,.65,.65,[x,.25,z],cream);for(let i=0;i<7;i++){const leaf=B.MeshBuilder.CreateSphere('large-leaf',{diameter:1,segments:10},scene);leaf.scaling.set(.25,.7,.1);leaf.position.set(x+Math.sin(i*2)*.3,1+i*.09,z+Math.cos(i*2)*.3);leaf.rotation.z=Math.sin(i*2)*.6;leaf.rotation.y=i;leaf.material=green;leaf.isPickable=false;}}
 for(const [x,z] of [[-18,-18],[18,-18],[-18,17],[18,17],[-5,4],[5,4]])plant(x,z);
 for(const x of [-5,5]){rounded('soft-ottoman',1.3,.6,1.1,[x,.45,5.5],linen);rounded('side-table',.9,.12,.9,[x,1,4.1],wood);box('table-base',[.12,.85,.12],[x,.5,4.1],dark);}
 const groups={};for(const name of ['retail','lab','classroom'])groups[name]=new B.TransformNode('sector-'+name,scene);
 for(let x=-2;x<=2;x+=2){for(let h=1;h<=3;h++){box('retail-shelf',[1.7,.08,.8],[x,h,15.5],wood,groups.retail);for(let i=0;i<4;i++)box('display-package',[.3,.35,.4],[x-.6+i*.4,h+.22,15.5],i%2?linen:dark,groups.retail);}}
 box('maker-bench',[5,.18,1.5],[11,1,10.2],wood,groups.lab);for(let i=0;i<3;i++){rounded('sample-vessel',.4,.65,.4,[9.5+i*1.4,1.4,10.2],cream,groups.lab);box('instrument',[.7,.7,.7],[9.5+i*1.4,1.45,11.2],dark,groups.lab);}
 for(let i=0;i<6;i++){const x=(i%3)*1.6-1.6,z=13+Math.floor(i/3)*1.8;box('learning-desk',[1.2,.1,.7],[x,1,z],wood,groups.classroom);rounded('learning-seat',.55,.5,.55,[x,.4,z-1],linen,groups.classroom);}
 const label=B.MeshBuilder.CreatePlane('venture-brand',{width:5,height:1.2},scene);label.position.set(0,4,3.2);label.rotation.y=Math.PI;label.isPickable=false;const brand=new B.DynamicTexture('venture-brand-text',{width:1024,height:256},scene,false);const bm=new B.StandardMaterial('venture-brand-ink',scene);bm.diffuseTexture=brand;bm.emissiveTexture=brand;bm.disableLighting=true;label.material=bm;
 function update(name){const c=brand.getContext();c.fillStyle='#28484d';c.fillRect(0,0,1024,256);c.fillStyle='#ead7b6';c.font='bold 56px sans-serif';c.textAlign='center';c.fillText(String(name).slice(0,24),512,112);c.font='24px sans-serif';c.fillText('YOUR VENTURE / LIVE DECISIONS',512,175);brand.update();}
 return {update,setEnvironment(kind){for(const [k,v] of Object.entries(groups))v.setEnabled(k===kind);scene.metadata={...scene.metadata,environment:kind};}};
}
