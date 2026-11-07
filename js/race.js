/* TURBO & WEASEL: COOKED EDITION — SCOOTER GRAND PRIX.
   Pseudo-3D racing modelled on Cruis'n USA: low camera, high horizon, long fogged draw distance, big scaled roadside
   sprites cut from the game's own panoramas, throttle + brake + power slides, off-road crashes, rubber-banded AI, items. */
'use strict';
const RACE_TRACKS={
 richmond:{name:'NORTH RICHMOND SCOOTER GP',sub:'LENNOX ST → VICTORIA ST → THE COMMISSION FLATS → BACK',sky:'street',pano:'street',fog:'#d9956a',lane:'rgba(244,230,202,.8)',road:['#3b3b40','#45454b'],edge:['#f4e6ca','#de755f'],grass:['#2d2722','#262019'],laps:3,
  layout:[[28,0,0],[22,2,0],[20,0,0],[28,-3,2],[14,0,0],[22,4,0],[20,0,-2],[28,-2,0],[14,0,3],[22,3,0],[26,0,0],[22,-4,-2],[20,0,0]],props:['tree','bin','crowd','tram'],vehicle:'scooter',music:'street'},
 space:{name:'MOON BASE KART CUP',sub:'TR-3B TEST RANGE · RAGTAG KARTS · NO RULES, NO AIR',sky:'moon',pano:'moon',fog:'#4a1620',lane:'rgba(104,203,187,.7)',road:['#2a2c3a','#30334a'],edge:['#68cbbb','#9974aa'],grass:['#17161f','#121119'],laps:3,
  layout:[[22,0,0],[28,3,2],[20,0,0],[22,-4,0],[14,0,-3],[28,5,0],[20,0,0],[22,-3,3],[28,0,0],[14,4,-2],[22,-4,0],[20,0,0]],props:['rock','crater','fans','dome'],vehicle:'kart',music:'space'},
};
function drawGearBag(c,space,t){
 const g=space?'#5dff5a':'#ffffff';
 if(space){c.shadowColor=g;c.shadowBlur=18;}
 c.fillStyle='rgba(235,240,255,.55)';c.strokeStyle=INK;c.lineWidth=1.6;
 c.beginPath();c.moveTo(-9,-16);c.lineTo(9,-16);c.lineTo(10,4);c.lineTo(-10,4);c.closePath();c.fill();c.stroke();
 c.fillStyle='#d94c6a';c.fillRect(-9,-16,18,3);// clip seal strip
 c.fillStyle=g;for(let i=0;i<7;i++){const a=t*2+i*1.1;const x=-5+(i%4)*3.2+Math.sin(a)*.6,y=-9+Math.floor(i/4)*5+Math.cos(a)*.6;c.beginPath();c.moveTo(x,y-2.6);c.lineTo(x+2.2,y);c.lineTo(x,y+2.6);c.lineTo(x-2.2,y);c.closePath();c.fill();}
 c.shadowBlur=0;}
function RaceScene(cfg,opts={}){
 const T=RACE_TRACKS[cfg.track||'richmond'];const diff=cfg.diff||DIFF.mission;const up=cfg.up||{speed:0,accel:0,grip:0};
 const SPACE=T.vehicle==='kart';
 // Cruis'n USA camera: low behind the bike, high horizon, long draw distance with fog, big scaled roadside sprites.
 const SEG=200,DRAW=120,ROADW=1320,CAMH=380,FOCAL=.9,HOR=H*.44;
 const districts = COURSE_DISTRICTS[SPACE ? 'space' : 'richmond'];
 const segmentCount = T.layout.reduce((total, part) => total + part[0], 0);
 const districtAt = i => districts[Math.min(districts.length - 1, Math.floor(i * districts.length / segmentCount))];
 const rng=seeded((SPACE?77:31)+(cfg.seed||0));
 const segs=[];T.layout.forEach(([n,curve,hill],si)=>{for(let i=0;i<n;i++){const k=i/n;const ease=k<.3?k/.3:k>.7?(1-k)/.3:1;const h=Math.sin(k*Math.PI)*hill*140;
  const idx=segs.length;let scen=null;if(idx%3===1){const side=rng()<.5?-1:1;const landmark = idx % 12 === 1;
    const district = districtAt(idx);
    scen = {side, kind:landmark ? 'landmark' : T.props[Math.floor(rng()*T.props.length)],
      cell:district[1 + Math.floor(idx / 12) % 2], dist:landmark ? 1.95 : 1.6 + rng()*.45};}
  segs.push({curve:curve*ease,y:h,i:idx,scen,item:(si%2===0&&i===Math.floor(n/2)),lamp:idx%5===2?(rng()<.5?-1:1):0});}});
 const N=segs.length,LEN=N*SEG;
 const player={z:0,x:0,v:0,lap:1,boost:0,gear:0,spin:0,spinDir:1,slide:0,item:null,id:cfg.racer||'turbo',name:(CHARS[cfg.racer]||CHARS.turbo).name,col:(CHARS[cfg.racer]||CHARS.turbo).col,human:true,total:0,finished:false,place:0,steer:0};
 const maxV0=(diff===DIFF.pissweak?1500:1700),maxV=maxV0*(1+up.speed*.06),accel=(1150+up.accel*80),accel0=1150;// chop-shop parts only help the player
 const ai=RACERS.filter(r=>['lucifer','karl','borkmaster','angus','fredo',SPACE?'crowe':'courier'].includes(r.id)).map((r,i)=>({...r,i,z:(i+1)*SEG*1.4,x:(i%3-1)*.55,v:0,lap:1,boost:0,gear:0,spin:0,spinDir:1,slide:0,item:null,ai:true,skill:(diff===DIFF.pissweak?.74:diff===DIFF.absolutely?1.02:diff===DIFF.cooked?.95:.87)+Math.random()*.07,total:(i+1)*SEG*1.4,finished:false,place:0,wob:Math.random()*9,steer:0}));
 const racers=[player,...ai];racers.slice().sort((p,q)=>q.total-p.total).forEach((r,i)=>r.place=i+1);const top0=maxV*1.9;const items=segs.filter(s=>s.item).map(s=>({z:s.i*SEG+SEG/2,x:0,taken:0}));
 const gears=segs.filter((s,i)=>i%23===11).map((s,i)=>({z:s.i*SEG+SEG/2,x:(i%3-1)*.55,taken:0}));
 const GEARQUIPS=SPACE?['SPACE GEAR!','GREEN AS, BROTHER','FUEL, AMMO, SMOKO','CURRENCY OF THE COSMOS','SUCK IT UP, BROTHER']:['GEAR!','CLIP SEAL CHRISTMAS','SHARDS OF GLORY','OFF YA CHOPS','YEAH THE BOYS'];
 const S={t:0,done:false,onDone:opts.onDone,phase:'count',phaseT:0,count:3,msgs:[],hazards:[],results:null,endT:0,cash:0,xp:0,__p:player,bg:0,pitch:0,lapT:0,best:0,smoke:[],assist:true,paused:false};
 S.autoPause=function(){if(S.phase==='race')S.paused=true;};
 const ITEMS=['cone','slab','bong','battery'];
 const msg=(txt,col=AMBER,size=48,life=1)=>S.msgs.push({txt,col,size,t:0,life});
 S.enter=function(){Audio.playTrack(T.music||'bonus');msg(T.name,'#f7d96a',44,2);};
 function segAt(z){return segs[Math.floor(((z%LEN)+LEN)%LEN/SEG)];}
 function useItem(r){const it=r.item;if(!it)return;r.item=null;Audio.sfx('special');
  if(it==='cone'){r.boost=1.6;if(r.human){rword('RIIIP',W/2,H*.4,'#98ef87',52);shake(3);}}
  if(it==='battery'){r.boost=2.6;if(r.human)rword('FULL CHARGE',W/2,H*.4,TEAL,46);}
  if(it==='bong'){S.hazards.push({z:r.z-SEG*.6,x:r.x,t:0,kind:'bong',owner:r});if(r.human)rword('SMOKE SCREEN',W/2,H*.4,'#98ef87',44);}
  if(it==='slab'){S.hazards.push({z:r.z+SEG*.8,x:r.x,t:0,kind:'slab',v:maxV*1.4,owner:r});if(r.human)rword('SLAB!',W/2,H*.4,RED,52);}}
 function rword(word,x,y,col,size,soft){if(soft&&S.wordT>0)return;G.words=G.words.filter(w=>w.t>.7);S.wordT=soft?1.6:1.1;comicWord(word,x,y,col,size);}
 function crash(r,what){r.spin=.9;r.spinDir=-Math.sign(r.x)||1;r.v*=.22;r.x=Math.sign(r.x)*1.08;if(r.human){Audio.sfx('hurt');shake(9);rword(pick(['WHACK','OOF','ME BIKE!','STACKED IT']),W/2,H*.4,RED,54);burst(W/2,H*.8,'#f7d96a',14,260,.5,4);}}
 function stepRacer(r,dt){
  const seg=segAt(r.z),next=segAt(r.z+SEG);const base=r.human?maxV:maxV0;const top=base*(r.gear>0?1.9:r.boost>0?1.35:1)*(r.ai?r.skill*(1+(r.band||0)):1);
  if(r.spin>0){r.spin-=dt;r.v=Math.max(0,r.v-2400*dt);r.x+=r.spinDir*dt*.5;r.steer=0;}
  else{let steer=0,gas=false,brake=false;
   if(r.human){steer=(Input.held('right')?1:0)-(Input.held('left')?1:0);gas=Input.held('attack')||Input.held('jump')||Input.held('up');brake=Input.held('down');if(Input.hit('special'))useItem(r);if(gas||brake)S.assist=false;if(S.assist)gas=true;}
   else{// AI: inside line, brake into sharp bends, dodge hazards, rubber-band to the player
    const ahead=segAt(r.z+SEG*6);const want=clamp(-ahead.curve*.2+Math.sin(S.t*.7+r.wob)*.3,-.8,.8);steer=clamp((want-r.x)*3.5,-1,1);gas=true;
    const far=segAt(r.z+SEG*9);brake=Math.abs(far.curve)>3.4&&r.v>top*.86;
    for(const h of S.hazards)if(h.z>r.z&&h.z-r.z<SEG*5&&Math.abs(h.x-r.x)<.3)steer=h.x>r.x?-1:1;
    if(r.item&&Math.random()<.01)useItem(r);
    const gap=player.total-r.total;r.band=clamp(gap/(SEG*40),-.16,.16);}
   r.steer=lerp(r.steer,steer,.25);
   const g=r.human?1+up.grip*.08:1;const off=Math.abs(r.x)>1.02;const sp=r.v/base;
   // throttle: hard off the line, tapering toward top speed; coasting bleeds speed; brakes bite
   let a=gas?(r.human?accel:accel0)*(1.3-Math.min(1.2,r.v/top)):brake?(r.ai?-1300:-2600):-380;
   if(off){a-=900;if(r.v>base*.45)a-=(r.v-base*.45)*2.5;}
   r.v=clamp(r.v+a*dt,0,top);
   r.v-=(next.y-seg.y)*.5*dt;// hills
   // steering gets twitchier with speed; bends throw you out with the square of speed
   r.x+=steer*dt*2.2*Math.min(1,sp+.3);
   r.x-=seg.curve*dt*sp*sp*.78/g;
   // power slide: hard lock at speed
   r.slide=(Math.abs(steer)>.5&&sp>.7)?Math.min(1,r.slide+dt*4):Math.max(0,r.slide-dt*3);
   if(r.slide>0){r.x+=steer*dt*.8*r.slide;r.v-=r.v*.05*r.slide*dt;if(r.human&&G.frame%4===0)S.smoke.push({z:r.z,x:r.x-steer*.12,t:0});}
   if(off&&r.human&&Math.floor(S.t*10)%2===0)shake(1.2);
   if(off&&seg.scen&&Math.sign(r.x)===seg.scen.side&&Math.abs(r.x)>seg.scen.dist-.4&&r.v>maxV*.2&&(r.human||Math.abs(r.x)>1.4))crash(r);
   r.x=clamp(r.x,-2.3,2.3);}
  if(r.boost>0)r.boost-=dt;if(r.gear>0)r.gear-=dt;if(r.bumpT>0)r.bumpT-=dt;
  const prevZ=r.z;r.z+=r.v*dt;r.total+=r.v*dt;
  if(Math.floor(prevZ/LEN)<Math.floor(r.z/LEN)){r.lap++;if(r.human){if(S.best===0||S.lapT<S.best)S.best=S.lapT;S.lapT=0;if(r.lap<=T.laps){msg(r.lap===T.laps?'FINAL LAP':'LAP '+r.lap,'#f7d96a',56,1);Audio.sfx('round');}}if(r.lap>T.laps&&!r.finished){r.finished=true;r.place=racers.filter(x=>x.finished).length;if(r.human)finish();}}
  for(const it of items){if(it.taken>0)continue;const dz=((it.z-r.z)%LEN+LEN)%LEN;if(dz<SEG*.7&&Math.abs(it.x-r.x)<.45&&!r.item){it.taken=3;r.item=pick(ITEMS);if(r.human){Audio.sfx('pickup');floater(r.item.toUpperCase()+' · SPECIAL TO USE',W/2,H*.3,'#f7d96a',22);}}}
  for(const gb of gears){if(gb.taken>0)continue;const dz=((gb.z-r.z)%LEN+LEN)%LEN;if(dz<SEG*.7&&Math.abs(gb.x-r.x)<.4&&r.spin<=0){gb.taken=6;r.gear=2.4;r.v=Math.max(r.v,maxV*1.4);if(r.human){Audio.sfx('special');shake(5);rword(pick(GEARQUIPS),W/2,H*.36,SPACE?'#5dff5a':'#ffffff',54);SAVE.gearRaced=(SAVE.gearRaced||0)+1;}}}
  for(const h of S.hazards){if(h.owner===r&&(h.t<.4||h.kind==='slab'))continue;const dz=((h.z-r.z)%LEN+LEN)%LEN;const near=Math.min(dz,LEN-dz);if(near<SEG*.6&&Math.abs(h.x-r.x)<.35&&r.spin<=0){r.spin=h.kind==='bong'?1.1:.8;r.spinDir=Math.random()<.5?-1:1;h.dead=h.kind==='slab';if(r.human){Audio.sfx('hurt');rword(h.kind==='bong'?'COUGHING':'OOF',W/2,H*.45,RED,48);shake(5);}}}
 }
 function finish(){S.phase='done';S.phaseT=0;const place=player.place;const pot=[320,180,110,60,40,30,20][place-1]||20;const mul=diff===DIFF.absolutely?1.6:diff===DIFF.cooked?1.3:1;S.cash=Math.round(pot*mul);S.xp=Math.round((place===1?90:place<=3?50:25)*diff.xp);Audio.sfx(place===1?'win':'lose');msg(place===1?'WINNER WINNER':place<=3?'PODIUM':'GOT SMOKED',place===1?'#f7d96a':PAPER,64,3);if(place===1&&cfg.track==='richmond')SAVE.eggs.gp=true;}
 S.update=function(dt){if(S.done)return;S.t+=dt;S.phaseT+=dt;updateFx();for(const m of S.msgs)m.t+=dt;S.msgs=S.msgs.filter(m=>m.t<m.life);for(const it of items)if(it.taken>0)it.taken-=dt;for(const gb of gears)if(gb.taken>0)gb.taken-=dt;
  for(const h of S.hazards){h.t+=dt;if(h.kind==='slab')h.z+=h.v*dt;}S.hazards=S.hazards.filter(h=>!h.dead&&h.t<(h.kind==='bong'?9:4));
  for(const s of S.smoke)s.t+=dt;S.smoke=S.smoke.filter(s=>s.t<1.1);if(S.wordT>0)S.wordT-=dt;
  if(Input.hit('pause')&&S.phase==='race'){S.paused=!S.paused;}if(S.paused){if(Input.hit('back')){S.done=true;S.onDone({result:'quit',cash:0,xp:0});}return;}
  if(S.phase==='count'){if(S.phaseT>1){S.phaseT=0;S.count--;Audio.sfx('tick');if(S.count<=0){S.phase='race';msg('GO YA MONGRELS','#98ef87',70,.9);Audio.sfx('round');}}return;}
  if(S.phase==='race')S.lapT+=dt;
  for(const r of racers)stepRacer(r,dt);
  // racer-vs-racer bumps: the faster one eats the hit and gets shoved sideways
  for(const a of racers)for(const b of racers){if(a===b)continue;const dz=b.z-a.z;if(dz>-SEG*.2&&dz<SEG*.5&&Math.abs(a.x-b.x)<.3&&a.v>b.v&&!(a.bumpT>0)){const side=a.x>b.x?1:-1;a.bumpT=.45;a.v=Math.max(b.v*.9,a.v*.6);a.x+=side*.28;b.x-=side*.1;b.v=Math.min(top0,b.v+a.v*.08);if(a.human){Audio.sfx('block');shake(3);rword(pick(['BUMP','OI!','WATCH IT']),W/2+side*120,H*.5,PAPER,26,true);}}}
  const order=racers.slice().sort((p,q)=>q.total-p.total);order.forEach((r,i)=>{if(!r.finished)r.place=i+1;});
  // camera feel: background pans through bends, horizon pitches with the hills
  {const seg=segAt(player.z);const nx=segAt(player.z+SEG);S.bg+=seg.curve*(player.v/maxV)*dt*120+player.v*dt*.004;S.pitch=lerp(S.pitch,clamp((nx.y-seg.y)*.9,-40,40),.1);}
  if(S.phase==='done'){if(S.phaseT>3.2&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump')||Input.hit('click'))){S.done=true;S.onDone({result:'win',place:player.place,cash:S.cash,xp:S.xp});}}
 };
 // ---------- drawing ----------
 const PANO={street:0,space:1,isa:2,moon:3};const YS=[0,335,634,916,1254],GROUNDS=[288,590,873,1183];
 function project(p,camX,camY,camZ,hor){const dz=Math.max(1,p.z-camZ);const sc=FOCAL*600/dz;return {x:W/2+sc*(p.x-camX),y:hor-sc*(p.y-camY),w:sc*ROADW,sc};}
 function drawVehicle(c,r,x,y,sc,me){const s=clamp(sc*2.1,.05,1.7);
  // ground shadow
  c.save();c.globalAlpha=.35;c.fillStyle='#000';c.beginPath();c.ellipse(x,y+2*s,34*s,7*s,0,0,7);c.fill();c.restore();
  c.save();c.translate(x,y);c.scale(s,s);
  const lean=clamp(r.steer*.22+(r.spin>0?Math.sin(S.t*30)*.5:0),-.6,.6);c.rotate(lean);
  if(r.spin>0)c.rotate(S.t*20);
  const cell = RIDER_CELLS[r.id] + (SPACE ? 8 : 0);
  const height = SPACE ? 85 : 100;
  c.transform(1, 0, -r.steer * .11, 1, 0, 0);
  drawAtlasCell(c, G.img.riders, 4, 4, cell, 0, 3, height, height);
  if(r.gear>0){c.save();c.globalAlpha=.55+Math.random()*.4;c.fillStyle=SPACE?'#5dff5a':'#ffffff';c.beginPath();c.moveTo(-30,-10);c.lineTo(-90-Math.random()*30,-4+Math.random()*8);c.lineTo(-30,6);c.fill();c.restore();}
  if(r.boost>0&&T.vehicle==='scooter'){c.fillStyle=`rgba(104,203,187,${.5+Math.random()*.4})`;c.beginPath();c.moveTo(-26,-2);c.lineTo(-56-Math.random()*16,0);c.lineTo(-26,6);c.fill();}
  c.restore();
  if(!me&&y-70*s<H-40){text(c,r.name,x,y-(70+(r.i%2)*22)*s,{size:clamp(11*s,8,15),font:FONT_COMIC,weight:'400',col:r.col,align:'center',base:'middle',stroke:3});}}
 const propArt = {
   tree:[0,410], bin:[1,175], crowd:[2,335], pole:[3,510],
   rock:[4,155], crater:[5,230], fans:[6,320], antenna:[7,450]
 };
 function drawProp(c, kind, x, y, scale) {
   if (kind === 'tram' || kind === 'dome') {
     const size = scale * (kind === 'tram' ? 530 : 360);
     drawAtlasCell(c, G.img.landmarks, 4, 3, kind === 'tram' ? 2 : 7, x, y, size, size);
     return;
   }
   const [cell, worldSize] = propArt[kind];
   const size = worldSize * scale;
   drawAtlasCell(c, G.img.courseProps, 4, 2, cell, x, y, size, size);
 }
 S.draw=function(c){
  const camZ=player.z-SEG*2.2;const base=segAt(camZ),nextB=segAt(camZ+SEG);const basePct=((camZ%SEG)+SEG)%SEG/SEG;const camY=CAMH+lerp(base.y,nextB.y,basePct);const hor=HOR+S.pitch;
  // sky + distant skyline panning through the bends
  drawSky(c,T.sky,hor+40,S.t);
  drawPanorama(c,T.pano,S.bg,{groundY:hor+6,parallax:1});c.fillStyle=SPACE?'rgba(10,4,8,.3)':'rgba(30,20,16,.22)';c.fillRect(0,0,W,hor+6);
  c.fillStyle=T.grass[0];c.fillRect(0,hor,W,H-hor);
  // road, near to far
  let maxy=H;const start=Math.floor(camZ/SEG);const frames=[];
  let cx=-(player.x*ROADW*.5),cdx=-base.curve*basePct*6;
  const fogCol=T.fog;
  for(let n=0;n<DRAW;n++){const seg=segs[((start+n)%N+N)%N];const nxt=segs[((start+n+1)%N+N)%N];const z1=(start+n)*SEG,z2=z1+SEG;
   const p1=project({x:cx,y:seg.y,z:z1},0,camY,camZ,hor),p2=project({x:cx+cdx,y:nxt.y,z:z2},0,camY,camZ,hor);
   cx+=cdx;cdx+=seg.curve*6;
   const clip=maxy;
   if(p2.y>=maxy||p1.y<p2.y)continue;
   const k=Math.floor((start+n)/2)%2;const rows=p1.y-p2.y+1;
   c.fillStyle=T.grass[k];c.fillRect(0,p2.y,W,rows);
   const quad=(a1,a2,col,off1=0,off2=0)=>{c.fillStyle=col;c.beginPath();c.moveTo(p1.x+off1-a1,p1.y);c.lineTo(p1.x+off1+a1,p1.y);c.lineTo(p2.x+off2+a2,p2.y);c.lineTo(p2.x+off2-a2,p2.y);c.closePath();c.fill();};
   const hw1=p1.w/2,hw2=p2.w/2;
   quad(hw1*1.07,hw2*1.07,T.edge[k]);// rumble strips
   quad(hw1,hw2,T.road[k]);// bitumen
   if(k===0){quad(hw1*.012,hw2*.012,T.lane,hw1*.34,hw2*.34);quad(hw1*.012,hw2*.012,T.lane,-hw1*.34,-hw2*.34);}// lane dashes
   if(seg.i===0){c.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<12;i++)if(i%2)c.fillRect(p1.x-hw1+p1.w*i/12,p2.y,p1.w/12,Math.max(2,rows));}
   // fog with distance
   const fog=Math.pow(clamp((n-DRAW*.28)/(DRAW*.72),0,1),1.25);if(fog>0){c.fillStyle=fogCol;c.globalAlpha=fog*.92;c.fillRect(0,p2.y,W,rows);c.globalAlpha=1;}
   maxy=p2.y;frames.push({seg,p1,p2,z1,clip,n});}
  // sprites far -> near, clipped behind crests
  for(let i=frames.length-1;i>=0;i--){const f=frames[i];const {seg,p1,z1,clip,n}=f;const sc=p1.sc;const fog=Math.pow(clamp((n-DRAW*.28)/(DRAW*.72),0,1),1.25);
   c.save();if(p1.y>clip+1){c.beginPath();c.rect(0,0,W,clip);c.clip();}c.globalAlpha=1-fog*.92;
   if(seg.scen){const px=p1.x+p1.w/2*seg.scen.side*seg.scen.dist;if(seg.scen.kind==='landmark')drawAtlasCell(c,G.img.landmarks,4,3,seg.scen.cell,px+seg.scen.side*sc*160,p1.y,sc*660,sc*480);else drawProp(c,seg.scen.kind,px,p1.y,sc,seg.scen.side);}
   if(seg.lamp)drawProp(c,SPACE?'antenna':'pole',p1.x+p1.w/2*seg.lamp*1.22,p1.y,sc,seg.lamp);
   for(const it of items){if(it.taken>0)continue;if(Math.floor(it.z/SEG)===seg.i){const px=p1.x+p1.w/2*it.x;const s=sc*8;c.save();c.translate(px,p1.y-s*14);c.scale(s,s);c.rotate(S.t*2);c.fillStyle='#f7d96a';c.fillRect(-10,-10,20,20);c.strokeStyle=INK;c.lineWidth=2;c.strokeRect(-10,-10,20,20);c.restore();text(c,'?',px,p1.y-s*14,{size:Math.max(8,s*16),font:FONT_TITLE_UI,weight:'400',col:INK,align:'center',base:'middle'});}}
   for(const gb of gears){if(gb.taken>0)continue;if(Math.floor(gb.z/SEG)===seg.i){const px=p1.x+p1.w/2*gb.x;const s=sc*6;c.save();c.translate(px,p1.y-s*10);c.scale(s,s);drawGearBag(c,SPACE,S.t);c.restore();}}
   for(const h of S.hazards){if(Math.floor(((h.z%LEN)+LEN)%LEN/SEG)===seg.i){const px=p1.x+p1.w/2*h.x;const s=sc*8;c.save();c.translate(px,p1.y);c.scale(s,s);if(h.kind==='bong'){c.fillStyle=`rgba(200,230,200,${.6-Math.min(.5,h.t*.05)})`;for(let q=0;q<4;q++){c.beginPath();c.arc(Math.sin(h.t*2+q)*12,-10-q*8-h.t*2,12+q*3,0,7);c.fill();}}else{c.fillStyle='#de755f';c.fillRect(-14,-12,28,14);c.fillStyle=PAPER;c.fillRect(-10,-9,20,4);}c.restore();}}
   for(const sm of S.smoke){if(Math.floor(((sm.z%LEN)+LEN)%LEN/SEG)===seg.i){const px=p1.x+p1.w/2*sm.x;const s=sc*8;c.fillStyle=`rgba(230,230,230,${.5*(1-sm.t)})`;c.beginPath();c.arc(px,p1.y-s*4-sm.t*20,s*(6+sm.t*14),0,7);c.fill();}}
   for(const r of racers){if(r.human)continue;const rz=((r.z%LEN)+LEN)%LEN;if(Math.floor(rz/SEG)===seg.i){const px=p1.x+p1.w/2*r.x;drawVehicle(c,r,px,p1.y,sc,false);}}
   c.restore();}
  // player's bike: bobs with speed, leans into the steer, smokes in a slide
  const sp=player.v/maxV;const bob=Math.sin(S.t*22)*(sp>.85?2:sp>.4?1:0);
  if(player.slide>0){c.fillStyle=`rgba(230,230,230,${.35*player.slide})`;for(let q=0;q<3;q++){c.beginPath();c.arc(W/2-player.steer*30+rnd(-30,30),H*.86+rnd(-6,6),18+q*8,0,7);c.fill();}}
  drawVehicle(c,player,W/2+player.steer*6,H*.86+bob,1.6/2.1,true);
  // speed lines at the edges when flat out
  if(sp>.8){c.strokeStyle=`rgba(244,230,202,${(sp-.8)*2})`;c.lineWidth=2;for(let i=0;i<8;i++){const y=hor+rnd(0,H-hor);const len=rnd(40,140)*(sp);c.beginPath();if(i%2){c.moveTo(0,y);c.lineTo(len,y+rnd(-4,4));}else{c.moveTo(W,y);c.lineTo(W-len,y+rnd(-4,4));}c.stroke();}}
  colourGrade(c,SPACE?'moon':'street');
  // HUD: Cruis'n style
  const place=player.place;const ord=['ST','ND','RD','TH','TH','TH','TH'][place-1]||'TH';
  c.fillStyle=INK;c.fillRect(14,14,150,74);text(c,place+ord,30,50,{size:52,font:FONT_TITLE_UI,weight:'400',col:place===1?'#f7d96a':PAPER,base:'middle'});text(c,`LAP ${Math.min(player.lap,T.laps)}/${T.laps}`,150,74,{size:14,col:PAPER,align:'right',base:'middle'});
  const fmt=t=>{const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2);};
  c.fillStyle='rgba(23,36,43,.75)';c.fillRect(W/2-150,12,300,46);text(c,'TIME '+fmt(S.lapT),W/2,26,{size:18,font:FONT_TITLE_UI,weight:'400',col:'#f7d96a',align:'center',base:'middle'});text(c,(S.best?'BEST '+fmt(S.best)+'  ·  ':'')+racers.slice().sort((p,q)=>p.place-q.place).slice(0,4).map(r=>r.name.split(' ').pop()).join(' · '),W/2,46,{size:11,col:PAPER,align:'center',base:'middle'});
  // speedo
  const SX=G.touch?Math.min((G.hudL||0)+10,W/2-290):W-200;  c.fillStyle=INK;c.fillRect(SX,H-78,186,64);text(c,String(Math.round(player.v/10)).padStart(3,'0'),SX+130,H-46,{size:46,font:FONT_TITLE_UI,weight:'400',col:player.gear>0?(SPACE?'#5dff5a':'#fff'):player.boost>0?TEAL:'#f7d96a',align:'right',base:'middle'});text(c,'KM/H',SX+176,H-26,{size:12,col:PAPER,align:'right',base:'middle'});
  {const k=clamp(sp/1.9,0,1);c.fillStyle='#3a3230';c.fillRect(SX+10,H-24,100,8);c.fillStyle=k>.8?RED:'#f7d96a';c.fillRect(SX+10,H-24,100*k,8);}
  const WR=W-(G.hudR||0);  c.fillStyle=INK;c.fillRect(WR-124,14,110,56);text(c,'ITEM · K',WR-69,28,{size:11,col:PAPER,align:'center',base:'middle'});text(c,player.item?player.item.toUpperCase():'—',WR-69,50,{size:20,font:FONT_TITLE,weight:'400',col:player.item?'#f7d96a':'#6a6058',align:'center',base:'middle'});
  text(c,districtAt(segAt(player.z).i)[0],W/2,H-14,{size:11,col:'rgba(244,230,202,.6)',align:'center',base:'middle'});
  if(S.phase==='count'){text(c,S.count>0?String(S.count):'GO',W/2,H*.42,{size:150,font:FONT_TITLE,weight:'400',col:S.count>0?'#f7d96a':'#98ef87',align:'center',base:'middle',stroke:14});text(c,G.touch?'STICK STEERS · HOLD ATTACK FOR GAS · SPECIAL USES ITEM · STICK DOWN BRAKES':'← → STEER · HOLD J OR SPACE FOR GAS · K USES ITEM · ↓ BRAKES',W/2,H*.62,{size:16,col:PAPER,align:'center',base:'middle',stroke:3});text(c,SPACE?'GRAB THE GLOWING GREEN GEAR: CURRENCY, FUEL, AMMO, AND THE BOYS SMOKE IT':'GRAB THE CLIP-SEAL BAGS OF GEAR FOR SUPER SPEED · STAY ON THE ROAD OR EAT A POLE',W/2,H*.70,{size:15,col:SPACE?'#5dff5a':'#f7d96a',align:'center',base:'middle',stroke:3});}
  for(const m of S.msgs){const k=m.t/m.life;c.save();c.globalAlpha=k>.8?(1-k)/.2:1;text(c,m.txt,W/2,H*.3,{size:m.size,font:FONT_TITLE,weight:'400',col:m.col,align:'center',base:'middle',stroke:8});c.restore();}
  drawFx(c,0);drawFloaters(c,0);
  if(S.phase==='done'){c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,H*.45,W,H*.55);text(c,`${player.place}${ord} PLACE · $${S.cash} · +${S.xp} XP`,W/2,H*.58,{size:34,font:FONT_TITLE_UI,weight:'400',col:'#f7d96a',align:'center',base:'middle',stroke:6});
   const q=S.finishQuote ||= player.place===1?pick(['Lucifer wants a rematch. And his scooter back.','The Gear Guy lost money on that. Lovely.','Stolen scooter, honest win.']):pick([(RACERS.find(r=>r.id===racers.find(v=>v.place===1)?.id)||RACERS[0]).quip,'Sunday’s a long week.','Weasel blames the tyres. The tyres are also stolen.']);text(c,q,W/2,H*.7,{size:20,font:FONT_HAND,weight:'400',col:PAPER,align:'center',base:'middle'});
   if(S.best)text(c,'BEST LAP '+fmt(S.best),W/2,H*.78,{size:16,col:'#f7d96a',align:'center',base:'middle'});
   if(S.phaseT>3.2)text(c,'ATTACK TO CONTINUE',W/2,H*.88,{size:20,font:FONT_TITLE,weight:'400',col:AMBER,align:'center',base:'middle'});}
  if(S.paused){c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,0,W,H);text(c,'PAUSED',W/2,H/2-30,{size:64,font:FONT_TITLE,weight:'400',col:'#f7d96a',align:'center',base:'middle',stroke:8});text(c,'ESC RESUME · BACKSPACE QUIT',W/2,H/2+30,{size:18,col:PAPER,align:'center',base:'middle'});}
 };
 return S;
}

/* Race menu: pick a track, and Lucifer's chop shop for scooter parts. */
function RaceSelect(){const S={t:0,sel:0,menu:true};const tracks=['richmond','space'];
 const up=()=>SAVE.scooter||(SAVE.scooter={speed:0,accel:0,grip:0});
 const unlockedSpace=()=>SAVE.unlockedChapter>=4||SAVE.beaten||SAVE.eggs.konami;
 const go=(i)=>{if(i===1&&!unlockedSpace()){Audio.sfx('lose');floater('GET TO SPACE FIRST, YA TOURIST',W/2,420,RED,22);return;}Audio.sfx('select');const r=RaceScene({track:tracks[i],diff:DIFF[SAVE.difficulty],racer:SAVE.char,up:up()},{onDone:res=>{if(res.result==='win'){SAVE.profile.cash+=res.cash;addXP(SAVE.profile,res.xp);save();}transitionTo(RaceSelect(),'wipe');}});transitionTo(r,'wipe');};
 S.enter=function(){Audio.playTrack('menu');up();preloadPages(['extra-grid','extra-moon-grid','extra-parts']);};
 S.update=function(dt){S.t+=dt;updateFx();if(Input.hit('back'))setScene(TitleScene());if(Input.hit('left')||Input.hit('right')){S.sel=(S.sel+1)%3;Audio.sfx('menu');}if(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump')){if(S.sel<2)go(S.sel);else setScene(ChopShopScene(()=>setScene(RaceSelect())));}};
 S.draw=function(c){c.fillStyle='#120d0b';c.fillRect(0,0,W,H);halftone(c,0,0,W,H,'rgba(244,230,202,.05)',8);text(c,'SCOOTER GRAND PRIX',W/2,46,{size:50,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:8,strokeCol:RED});text(c,'STOLEN SCOOTERS ONLY · SCUMBAGS ONLY · WINNER TAKES THE POT',W/2,84,{size:15,col:PAPER,align:'center',base:'middle'});
  const cards=[{t:'NORTH RICHMOND GP',s:'Lennox St loop. 3 laps. Lucifer, Carl, Bork and the boys.',col:AMBER,ok:true},{t:'MOON BASE KART CUP',s:unlockedSpace()?'Mad Max karts on the TR-3B range. Faster. Nastier.':'LOCKED · reach space in the story',col:VIOLET,ok:unlockedSpace()},{t:'LUCIFER’S CHOP SHOP',s:`Swap stolen parts for cash. SPD ${up().speed} · ACC ${up().accel} · GRIP ${up().grip}`,col:TEAL,ok:true}];
  cards.forEach((k,i)=>{const x=60+i*290,y=120,w=260,h=330;const sel=S.sel===i;c.fillStyle=INK;c.fillRect(x+6,y+6,w,h);c.fillStyle=sel?k.col:'#3a3230';c.fillRect(x,y,w,h);c.strokeStyle=INK;c.lineWidth=4;c.strokeRect(x,y,w,h);
   text(c,k.t,x+w/2,y+34,{size:24,font:FONT_TITLE,weight:'400',col:INK,align:'center',base:'middle',maxW:w-20});wrapText(c,k.s,w-30,`400 17px ${FONT_HAND}`).forEach((l,j)=>text(c,l,x+w/2,y+70+j*20,{size:17,font:FONT_HAND,weight:'400',col:INK,align:'center',base:'middle'}));
   const preview = getPage(['extra-grid', 'extra-moon-grid', 'extra-parts'][i]);
   if (preview.ready) {
     c.save();
     c.beginPath(); c.rect(x+5,y+122,w-10,128); c.clip();
     drawCover(c,preview.img,x+5,y+122,w-10,128);
     c.restore();
   }
   c.save();c.translate(x+w/2,y+320);if(!k.ok)c.filter='grayscale(1) brightness(.5)';if(i<2){
    drawAtlasCell(c,G.img.riders,4,4,RIDER_CELLS[SAVE.char]+(i?8:0),0,0,112,112);
   }
   else{drawFighter(c,'lucifer',Math.floor(S.t*3)%2?1:0,0,20,1,{scale:.9});}c.restore();
   const hb=Input.hot(x,y,w,h);if(hb.hover)S.sel=i;if(hb.click){S.sel=i;if(i<2)go(i);else setScene(ChopShopScene(()=>setScene(RaceSelect())));}});
  drawFloaters(c,0);text(c,'← → PICK · ATTACK GO · BACKSPACE BACK',W/2,H-16,{size:14,col:PAPER,align:'center',base:'middle'});};
 return S;}

/* Lucifer's chop shop: the whole top flat of 106 is a "mechanic". Everything's stolen, so the prices are good. */
function ChopShopScene(onDone){const S={t:0,sel:0,menu:true,say:pick(['Habibi! Shoes off. It’s a workshop.','Everything here fell off a truck. Some of it fell off two.','Don’t ask where the battery came from. Don’t ask where YOU came from.','I fix anything. I also un-fix anything. Depends who’s paying.'])};
 const P=()=>SAVE.profile;const up=()=>SAVE.scooter||(SAVE.scooter={speed:0,accel:0,grip:0});
 const parts=[{k:'speed',name:'HOT MOTOR (STOLEN)',desc:'+6% top speed. Came off a Deliveroo bike. Allegedly.',cost:220},{k:'accel',name:'FAT BATTERY (STOLEN)',desc:'+8% pickup. Warm to the touch. Normal.',cost:180},{k:'grip',name:'TRAM-TYRE GRIP (STOLEN)',desc:'Corners stop throwing you into the bins.',cost:160},{k:'fix',name:'FIX WHATEVER THAT NOISE IS',desc:'+1 HP bonus for the story. He hits it with a spanner.',cost:260}];
 const price=p=>Math.round(p.cost*(1+(p.k==='fix'?(P().hpBonus||0):(up()[p.k]||0))*.6));
 const buy=i=>{const p=parts[i];const cost=price(p);if(P().cash<cost){Audio.sfx('lose');S.say=pick(['Habibi. Money first. Then parts.','No cash, no parts. This isn’t Centrelink.','Come back after the Grand Prix, bro.']);return;}P().cash-=cost;if(p.k==='fix')P().hpBonus=(P().hpBonus||0)+1;else up()[p.k]++;save();Audio.sfx('cash');burst(640,330,AMBER,16,220,.6,5);S.say=pick(['Beautiful. Stolen. Yours.','Don’t show the cops that one.','I’ll put it on your file. I keep files.']);};
 S.update=function(dt){S.t+=dt;updateFx();if(Input.hit('back')){Audio.sfx('menu');onDone();}if(Input.hit('down')){S.sel=(S.sel+1)%parts.length;}if(Input.hit('up')){S.sel=(S.sel+parts.length-1)%parts.length;}if(Input.hit('confirm')||Input.hit('attack'))buy(S.sel);};
 S.draw=function(c){c.fillStyle='#1b1512';c.fillRect(0,0,W,H);drawPanorama(c,'street',S.t*8,{groundY:470,parallax:.3,filter:'brightness(.45) saturate(.8)'});c.fillStyle='rgba(23,36,43,.85)';c.fillRect(0,0,W,H);
  text(c,'LUCIFER’S MECHANIC',W/2,40,{size:46,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:8,strokeCol:RED});text(c,'106 LENNOX ST · TOP FLAT · “NOT A CHOP SHOP”',W/2,74,{size:14,col:PAPER,align:'center',base:'middle'});
  drawFighter(c,'lucifer',Math.floor(S.t*2)%2?1:0,150,420,1,{scale:1.2});
  c.fillStyle=PAPER;c.fillRect(230,110,300,70);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(230,110,300,70);wrapText(c,S.say,280,`400 16px ${FONT_HAND}`).forEach((l,i)=>text(c,l,380,130+i*18,{size:16,font:FONT_HAND,weight:'400',col:INK,align:'center',base:'middle'}));
  const lx=560,ly=100;c.fillStyle=INK;c.fillRect(lx+5,ly+5,380,360);c.fillStyle=PAPER;c.fillRect(lx,ly,380,360);c.strokeStyle=INK;c.strokeRect(lx,ly,380,360);text(c,'PARTS BIN',lx+190,ly+24,{size:26,font:FONT_TITLE,weight:'400',col:INK,align:'center',base:'middle'});text(c,`CASH $${P().cash}  ·  SPD ${up().speed} ACC ${up().accel} GRIP ${up().grip}`,lx+190,ly+48,{size:13,col:INK,align:'center',base:'middle'});text(c,'CASH ONLY. NO TICK HERE, HABIBI. WIN THE GP FOR MORE.',lx+190,ly+63,{size:11,col:RED,align:'center',base:'middle'});
  parts.forEach((p,i)=>{const y=ly+80+i*68;const sel=S.sel===i;if(sel){c.fillStyle=AMBER;c.fillRect(lx+8,y-18,364,62);}text(c,p.name,lx+18,y,{size:18,font:FONT_TITLE,weight:'400',col:INK,base:'middle'});text(c,'$'+price(p),lx+360,y,{size:18,font:FONT_TITLE,weight:'400',col:P().cash<price(p)?RED:'#2f8f3a',align:'right',base:'middle'});wrapText(c,p.desc,340,`400 14px ${FONT_HAND}`).forEach((l,j)=>text(c,l,lx+18,y+20+j*15,{size:14,font:FONT_HAND,weight:'400',col:INK,base:'middle'}));const hb=Input.hot(lx+8,y-18,364,62);if(hb.hover)S.sel=i;if(hb.click){S.sel=i;buy(i);}});
  const bk=Input.hot(W/2-120,H-40,240,36);c.fillStyle=bk.hover?AMBER:INK;c.fillRect(W/2-120,H-40,240,32);text(c,'LEAVE (BACKSPACE)',W/2,H-24,{size:18,font:FONT_TITLE,weight:'400',col:bk.hover?INK:PAPER,align:'center',base:'middle'});if(bk.click)onDone();
  drawFx(c,0);drawFloaters(c,0);};
 return S;}
