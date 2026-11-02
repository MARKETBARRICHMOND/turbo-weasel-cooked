/* Set-piece boss: TRIXY, a TR-3B style black triangle craft that hovers over the deck and drains the boys' life force.
   Not a duel. A shoot-up-and-stay-out-of-the-beam fight with phases. */
'use strict';
function TrixyScene(chapter,run,opts={}){
 const diff=DIFF[run.difficulty],hero=CHARS[run.char],P=run.profile;
 const Z=1.25,VW=W/Z,VH=H/Z,GY=430,GRAVB=1500;
 const S={t:0,done:false,onDone:opts.onDone,phase:'intro',phaseT:0,camX:0,camY:GY-470/Z,shots:[],bolts:[],bubble:null,bubbleT:0,banter:0,drained:0,won:false,lost:false,endT:0,shock:[],paused:false,pauseAct:null};
 const maxHp=Math.round((hero.hp+P.hpBonus)*diff.hp);
 const h={x:300,y:GY,vx:0,vy:0,dir:1,hp:maxHp,maxHp,inv:0,onGround:true,jumps:0,step:0,fireT:0,shootT:0,hurtT:0,special:1,aimUp:false,crouch:false,dead:false,rush:0,hack:0,kevlar:P.kevlar,power:null,inBeam:false};
 S.h=h;
 const T={x:600,y:150,vx:0,hp:Math.round(70*diff.bossHP),maxHp:Math.round(70*diff.bossHP),state:'hover',t:0,open:0,beam:0,beamX:600,tilt:0,phase:1,glow:0,hurtT:0,dead:false,deadT:0};
 S.T=T;
 const sx=x=>(x-S.camX)*Z,sy=y=>(y-S.camY)*Z;
 const M=()=>({speed:1+P.speedBonus,dmg:(hero.damage+P.dmgBonus),fireRate:hero.fireRate});
 const LINES=[['WEASEL','That is a big black fucking Dorito.'],['TURBO','It’s drinking us, Weasel. I can feel it in me tab.'],['WEASEL','Shoot the lights! The lights are the bit!'],['TURBO','Everything on it is a bit.'],['WEASEL','Trixy. It’s got a name. Someone NAMED it.'],['TURBO','Someone named you, mate. Didn’t help.'],['WEASEL','My life force is mostly bong water, good luck to it.']];
 function say(i){S.bubble=LINES[i%LINES.length];S.bubbleT=3.6;}
 S.enter=function(){Audio.playTrack('boss');say(0);};
 function drained(){h.hp=0;h.dead=true;S.lost=true;S.endT=0;Audio.sfx('die');Audio.stopMusic();comicWord('DRAINED',W/2,H/2-40,VIOLET,70);}
  function hurtHero(dmg,dir=1){if(h.inv>0||h.dead)return;if(h.kevlar){h.kevlar=false;h.inv=1.2;comicWord('NAN’S KEVLAR!',sx(h.x),sy(h.y-110),TEAL,30);Audio.sfx('block');return;}
  h.hp-=Math.max(1,Math.round(dmg*diff.dmg));h.inv=1.1;h.hurtT=.3;h.vx=dir*200;h.vy=-220;h.onGround=false;Audio.sfx('hurt');shake(6);burst(h.x,h.y-40,RED,8);comicWord(pick(['OOF','ARGH','FUCK']),sx(h.x)+rnd(-30,30),sy(h.y-120),RED,34);
  if(h.hp<=0)drained();}
 function hitTrixy(dmg,x,y){const open=T.open>0;const d=open?dmg:dmg*.25;T.hp-=d;T.hurtT=.1;burst(x,y,open?'#ff6ad5':'#9fe8d8',open?8:3,open?200:90,.4,open?5:3,0);Audio.sfx(open?'hit':'block');if(!open&&G.frame%10===0)floater('ARMOURED · WAIT FOR THE PINK',x,y-20,'#9fe8d8',12);
  if(T.hp<=0&&!T.dead){T.hp=0;T.dead=true;T.deadT=0;S.won=true;S.endT=0;S.phase='dead';Audio.sfx('ko');hitstop(.2);shake(16);flash(PAPER,.6);comicWord('TRIXY DOWN',W/2,H/2-60,'#f7d96a',72);}}
 function pattern(){// choose next move
  const p2=T.phase===2;const r=Math.random();
  if(r<.42){T.state='drain';T.t=0;T.beamX=h.x;}
  else if(r<.75){T.state='sweep';T.t=0;T.shotsLeft=p2?6:4;}
  else if(Math.abs(T.x-h.x)>140){T.state='slam';T.t=0;Audio.sfx('select');}else{T.state='sweep';T.t=0;T.shotsLeft=p2?6:4;}
 }
 S.autoPause=function(){if(S.phase==='fight'&&!S.paused&&!S.won&&!S.lost){S.paused=true;S.pauseAct=null;}};
 S.update=function(dt){if(S.done)return;
   if(S.paused){if(Input.hit('pause')||S.pauseAct==='resume'){S.paused=false;S.pauseAct=null;}else if(Input.hit('back')||Input.hit('special')&&Input.hit('attack')||S.pauseAct==='quit'){S.done=true;S.onDone({result:'quit'});}return;}
   S.t+=dt;S.phaseT+=dt;
  if(S.phase==='intro'){if(S.phaseT>2.4||Input.hit('confirm')&&S.phaseT>.6){S.phase='fight';S.phaseT=0;Audio.sfx('round');comicWord('FIGHT!',W/2,H/2-40,RED,90);}}
  if(S.won){S.endT+=dt;T.deadT+=dt;T.y+=120*dt;T.tilt+=dt*1.5;if(G.frame%3===0)burst(T.x+rnd(-120,120),T.y+rnd(-30,30),pick(['#ff7a1a','#ffd04a',PAPER]),3,160,.6,7);if(S.endT>2.8){S.done=true;S.onDone({result:'win',p1hp:h.hp,rounds:1,wins:[1,0]});}return;}
  if(S.lost){S.endT+=dt;h.vy+=GRAVB*dt;h.y+=h.vy*dt;if(S.endT>2.2&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump'))){S.done=true;S.onDone({result:'lose'});}return;}
  if(S.phase!=='fight')return;
  if(Input.hit('pause')){S.paused=true;S.pauseAct=null;return;}
  const m=M();
  // ---- hero ----
  h.inv=Math.max(0,h.inv-dt);h.hurtT=Math.max(0,h.hurtT-dt);h.fireT=Math.max(0,h.fireT-dt);h.shootT=Math.max(0,h.shootT-dt);h.special=Math.min(1,h.special+dt/(7/(1+P.specialBonus)));
  const L=Input.held('left'),R=Input.held('right'),U=Input.held('up'),D=Input.held('down');
  h.crouch=D&&h.onGround;h.aimUp=U&&!h.crouch;const spd=hero.speed*m.speed*(h.crouch?.45:1)*(h.inBeam?.55:1);
  if(h.rush>0){h.rush-=dt;h.vx=h.dir*620;}else if(h.hurtT<=0){if(L){h.vx=-spd;h.dir=-1;}else if(R){h.vx=spd;h.dir=1;}else h.vx=0;}else h.vx*=.9;
  const maxJumps=run.char==='weasel'?2:1;
  if(Input.hit('jump')){if(h.onGround){h.vy=-hero.jump*1.72;h.onGround=false;h.jumps=1;Audio.sfx('jump');}else if(h.jumps<maxJumps){h.vy=-hero.jump*1.72*.85;h.jumps++;Audio.sfx('jump');burst(h.x,h.y,TEAL,8,120,.35,3,0);}}
  if(Input.released.jump&&h.vy<-150)h.vy=-150;
  if(Input.hit('special')&&h.special>=1){h.special=0;Audio.sfx('special');if(run.char==='turbo'){h.rush=.5;comicWord('BULL RUSH!',sx(h.x),sy(h.y-130),AMBER,36);}else{comicWord('SYSTEM HACK!',sx(h.x),sy(h.y-130),TEAL,36);flash(TEAL,.4);T.open=Math.max(T.open,2.2);T.state='stunned';T.t=0;T.beam=0;S.bolts=[];floater('TRIXY: SYSTEMS OPEN',T.x,T.y-60,'#ff6ad5',16);}}
  if(Input.held('attack')&&h.fireT<=0){h.fireT=m.fireRate;h.shootT=.15;Audio.sfx('shoot');const oy=h.crouch?-28:-56;const up=h.aimUp||(!L&&!R&&!D);// standing still aims up at the craft
   S.shots.push({x:h.x+(up?0:h.dir*20),y:h.y+oy-(up?30:0),vx:up?0:h.dir*640,vy:up?-640:0,dmg:m.dmg,t:0});burst(h.x+(up?0:h.dir*28),h.y+oy-(up?30:0),AMBER,3,80,.15,3,0);}
  h.vy+=GRAVB*dt*(h.inBeam?.35:1);if(h.inBeam)h.vy-=90*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.x=clamp(h.x,40,W-40);
  h.onGround=false;if(h.y>=GY){h.y=GY;h.vy=0;h.onGround=true;h.jumps=0;}
  if(h.vx!==0&&h.onGround)h.step+=dt*9;
  // ---- Trixy ----
  T.hurtT=Math.max(0,T.hurtT-dt);T.open=Math.max(0,T.open-dt);T.glow=lerp(T.glow,T.open>0?1:0,.1);T.t+=dt;const p2=T.phase===2;const sp=(p2?1.5:1)*diff.enemySpeed;
  if(T.phase===1&&T.hp<T.maxHp*.5){T.phase=2;comicWord('TRIXY IS HUNGRY',W/2,H*.3,'#ff6ad5',56);Audio.sfx('glitch');flash('#ff6ad5',.5);say(4);}
  h.inBeam=false;
  switch(T.state){
   case 'hover':{T.beam=lerp(T.beam,0,.2);T.x=lerp(T.x,h.x+Math.sin(S.t*.9)*220,.02*sp);T.y=lerp(T.y,150+Math.sin(S.t*1.7)*18,.05);if(T.t>(p2?1.1:1.8)/diff.enemySpeed)pattern();break;}
   case 'drain':{// telegraph, then drop a beam cone onto the deck; standing in it drains health + special and feeds Trixy
    T.x=lerp(T.x,T.beamX,.08*sp);T.y=lerp(T.y,190,.06);
    if(T.t<.8){T.beam=lerp(T.beam,0,.2);}
    else if(T.t<.8+(p2?3.2:2.6)){T.beam=lerp(T.beam,1,.15);const bw=70+T.beam*40;if(Math.abs(h.x-T.x)<bw&&h.y>T.y){h.inBeam=true;S.drained+=dt;if(G.frame%10===0){h.special=Math.max(0,h.special-.06);T.hp=Math.min(T.maxHp,T.hp+(p2?.9:.5));if(G.frame%30===0){if(h.kevlar){h.kevlar=false;h.inv=1.2;comicWord('NAN’S KEVLAR!',sx(h.x),sy(h.y-110),TEAL,30);Audio.sfx('block');}else if(h.inv<=0){h.hp-=1;floater('-1 LIFE FORCE',h.x,h.y-90,VIOLET,15);Audio.sfx('hurt');if(h.hp<=0)drained();}}}}
     if(T.t>.8+(p2?1.2:1.6)&&T.t<.8+(p2?1.3:1.7))say(1+(S.banter++%2)+(p2?4:0));}
    else{T.beam=lerp(T.beam,0,.2);if(T.t>.8+(p2?3.2:2.6)+.4){T.state='vuln';T.t=0;T.open=p2?2.2:3;Audio.sfx('select');floater('CORE OPEN · HIT IT',T.x,T.y+60,'#ff6ad5',16);}}
    break;}
   case 'vuln':{T.y=lerp(T.y,200,.05);T.x+=Math.sin(S.t*2)*20*dt;if(T.open<=0){T.state='hover';T.t=0;}break;}
   case 'stunned':{T.beam=lerp(T.beam,0,.2);T.y+=Math.sin(S.t*20)*1.5;if(T.open<=0){T.state='hover';T.t=0;}break;}
   case 'sweep':{T.y=lerp(T.y,130,.05);T.x=lerp(T.x,h.x,.03*sp);
    if(T.t>.5&&T.shotsLeft>0&&G.frame%Math.round((p2?16:26)/diff.enemySpeed)===0){T.shotsLeft--;Audio.sfx('shoot');const corners=[[-120,22],[120,22],[0,-30]];const cnr=corners[T.shotsLeft%3];const ang=Math.atan2((h.y-40)-(T.y+cnr[1]),h.x-(T.x+cnr[0]))+rnd(-.12,.12);const bs=(p2?360:290)*diff.enemySpeed;S.bolts.push({x:T.x+cnr[0],y:T.y+cnr[1],vx:Math.cos(ang)*bs,vy:Math.sin(ang)*bs,t:0});}
    if(T.shotsLeft<=0&&T.t>1.6){T.state='hover';T.t=0;}break;}
   case 'slam':{// drops to deck height and sends a shockwave along the floor; jump it
    if(T.t<1.05){T.y=lerp(T.y,110,.1);T.tilt=Math.sin(T.t*30)*.06;T.glow=Math.max(T.glow,.5+Math.sin(T.t*25)*.5);}
    else if(T.t<1.35){T.y=lerp(T.y,GY-70,.35);if(T.y>GY-80&&!T.slammed){T.slammed=true;shake(12);Audio.sfx('heavy');burst(T.x,GY,'#9fe8d8',20,300,.5,6);S.shock.push({x:T.x,dir:-1,t:0},{x:T.x,dir:1,t:0});comicWord('WHUMP',sx(T.x),sy(GY-40),'#9fe8d8',50);}}
    else{T.y=lerp(T.y,150,.06);if(T.t>2.25){T.state='hover';T.t=0;T.slammed=false;T.tilt=0;}}
    break;}
  }
  // shockwaves
  for(const w of S.shock){w.t+=dt;w.x+=w.dir*520*dt;if(Math.abs(w.x-h.x)<24&&h.y>GY-30)hurtHero(1,w.dir);}S.shock=S.shock.filter(w=>w.t<1.4);
  // hero contact with the craft body
  if(!h.dead&&Math.abs(h.x-T.x)<120&&h.y-60<T.y+30&&h.y>T.y-30&&T.state==='slam')hurtHero(2,Math.sign(h.x-T.x)||1);
  // shots vs Trixy (triangle body ~ 260 wide, 70 tall)
  for(const s of S.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.t+=dt;const dx=s.x-T.x,dy=s.y-T.y;if(Math.abs(dx)<130-Math.max(0,-dy)*1.4&&dy>-40&&dy<40&&!T.dead){hitTrixy(s.dmg,s.x,s.y);s.t=99;}}
  S.shots=S.shots.filter(s=>s.t<1.5&&s.y>-100);
  for(const b of S.bolts){b.x+=b.vx*dt;b.y+=b.vy*dt;b.t+=dt;if(!h.dead&&Math.abs(b.x-h.x)<16&&b.y>h.y-(h.crouch?40:66)&&b.y<h.y){hurtHero(1,Math.sign(b.vx)||1);b.t=99;}if(b.y>GY){b.t=99;burst(b.x,GY,'#9fe8d8',4,80,.3,3,0);}}
  S.bolts=S.bolts.filter(b=>b.t<3);
  if(S.bubbleT>0)S.bubbleT-=dt;
  // camera
  S.camX=lerp(S.camX,clamp((h.x*.6+T.x*.4)-VW/2,0,W-VW),.08);
  updateFx();
 };
 S.draw=function(c){
  const groundScr=(GY-S.camY)*Z;drawSky(c,'isa',groundScr,S.t);drawPanorama(c,'isa',S.camX*Z,{groundY:470,oy:groundScr-470,parallax:.4});
  c.save();c.scale(Z,Z);c.translate(-S.camX,-S.camY);
  // deck
  const col=THEME_COL.isa;const GB=S.camY+VH+40;c.fillStyle=col.ground;c.fillRect(-100,GY,W+200,GB-GY);c.fillStyle=INK;c.fillRect(-100,GY-2,W+200,4);c.fillStyle=col.top;c.fillRect(-100,GY,W+200,10);c.fillStyle='rgba(255,255,255,.06)';for(let x=-100;x<W+100;x+=80)c.fillRect(x,GY+10,78,GB-GY-10);c.fillStyle=col.accent;c.globalAlpha=.5;c.fillRect(-100,GY+28,W+200,3);c.globalAlpha=1;
  // beam
  if(T.beam>.02){const bw=(70+T.beam*40);c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,T.y,0,GY);g.addColorStop(0,`rgba(255,106,213,${.55*T.beam})`);g.addColorStop(1,`rgba(159,232,216,${.12*T.beam})`);c.fillStyle=g;c.beginPath();c.moveTo(T.x-20,T.y+20);c.lineTo(T.x+20,T.y+20);c.lineTo(T.x+bw,GY+6);c.lineTo(T.x-bw,GY+6);c.closePath();c.fill();
   for(let i=0;i<10;i++){const yy=GY-((S.t*120+i*40)%(GY-T.y));const ww=lerp(bw,20,(GY-yy)/(GY-T.y));c.fillStyle=`rgba(255,255,255,${.25*T.beam})`;c.fillRect(T.x-ww,yy,ww*2,2);}c.restore();}
  for(const w of S.shock){c.fillStyle='#9fe8d8';c.globalAlpha=1-w.t/1.4;c.fillRect(w.x-12,GY-26,24,26);c.fillRect(w.x-26,GY-12,52,12);c.globalAlpha=1;}
  // hero
  dropShadow(c,h.x,GY,Math.max(10,22-(GY-h.y)*.06),.35);
  drawHero(c,run.char,h.x,h.y,{dir:h.dir,moving:Math.abs(h.vx)>10&&h.onGround,step:h.step,crouch:h.crouch,air:!h.onGround,aimUp:h.aimUp||(h.shootT>0&&!h.vx&&!h.crouch),shoot:h.shootT>0,inv:h.inv,hurt:h.hurtT>0||h.dead,tint:h.inBeam?'hue-rotate(-60deg) saturate(1.6)':undefined});
  if(h.rush>0){c.globalAlpha=.5;for(let i=1;i<4;i++)drawHero(c,run.char,h.x-h.dir*i*18,h.y,{dir:h.dir,moving:true,step:h.step});c.globalAlpha=1;}
  for(const s of S.shots){c.fillStyle=run.char==='turbo'?AMBER:TEAL;c.save();c.translate(s.x,s.y);c.rotate(Math.atan2(s.vy,s.vx));c.fillRect(-8,-3,16,6);c.fillStyle=PAPER;c.fillRect(-3,-1,6,2);c.restore();}
  for(const b of S.bolts){c.fillStyle='#9fe8d8';c.beginPath();c.arc(b.x,b.y,6,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=2;c.stroke();}
  drawTrixy(c);
  drawFx(c,0);drawFloaters(c,0);
  c.restore();
  colourGrade(c,'isa');
  // banter
  if(S.bubbleT>0&&S.bubble){const [spk,txt]=S.bubble;const font=`400 18px ${FONT_HAND}`;const lines=wrapText(c,txt,320,font);const bw=Math.min(360,Math.max(...lines.map(l=>{c.font=font;return c.measureText(l).width;}))+36),bh=lines.length*22+30;let bx=clamp(sx(h.x)-bw/2,10,W-bw-10),by=clamp(sy(h.y-120)-bh,120,H-bh-80);bubble(c,bx,by,bw,bh,sx(h.x),sy(h.y-80),'speech');c.font=`800 13px ${FONT_UI}`;const tw=c.measureText(spk).width+18;c.fillStyle=SPEAKER_COL[spk]||PAPER;c.fillRect(bx+10,by-9,tw,18);c.strokeStyle=INK;c.lineWidth=2;c.strokeRect(bx+10,by-9,tw,18);text(c,spk,bx+19,by,{size:13,col:INK,base:'middle'});lines.forEach((l,i)=>text(c,l,bx+bw/2,by+22+i*22,{size:18,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));}
  drawHUD(c);
  if(S.paused)drawPauseMenu(c,S,'STAND STILL TO SHOOT UP · JUMP THE SHOCKWAVE · STAY OUT OF THE PINK · HIT THE CORE WHEN IT OPENS');
  if(S.phase==='intro'){c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,0,W,H);const p=S.phaseT;if(p>.3){text(c,'TRIXY',W/2,H/2-40,{size:120,font:FONT_TITLE,col:'#ff6ad5',align:'center',base:'middle',weight:'400',stroke:12});text(c,'ISA BLACK PROJECT · TR-3B · LIFE FORCE RECOVERY VEHICLE',W/2,H/2+40,{size:18,col:PAPER,align:'center'});text(c,'STAND STILL TO SHOOT UP · STAY OUT OF THE PINK · HIT THE CORE WHEN IT OPENS',W/2,H/2+70,{size:14,col:AMBER,align:'center'});}}
  if(S.lost){c.fillStyle='rgba(20,0,30,.7)';c.fillRect(0,0,W,H);text(c,'LIFE FORCE: NIL',W/2,H/2-20,{size:80,font:FONT_TITLE,col:'#ff6ad5',align:'center',base:'middle',weight:'400',stroke:10});if(S.endT>2.2)text(c,'PRESS ATTACK',W/2,H/2+60,{size:24,font:FONT_TITLE,col:AMBER,align:'center',weight:'400'});}
 };
 function drawTrixy(c){c.save();c.translate(T.x,T.y);c.rotate(T.tilt+Math.sin(S.t*1.3)*.03);const open=T.glow;
  // under-glow
  c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(0,30,10,0,30,170);g.addColorStop(0,`rgba(159,232,216,${.35+open*.3})`);g.addColorStop(1,'rgba(159,232,216,0)');c.fillStyle=g;c.fillRect(-200,-60,400,260);c.restore();
  // body: flat black triangle seen slightly from below
  const tri=(w,hh,yy)=>{c.beginPath();c.moveTo(-w,yy+hh*.35);c.lineTo(w,yy+hh*.35);c.lineTo(0,yy-hh*.65);c.closePath();};
  c.fillStyle='#05070a';tri(140,80,0);c.fill();c.strokeStyle=INK;c.lineWidth=4;c.stroke();
  c.fillStyle='#141a22';tri(118,62,0);c.fill();c.fillStyle='#05070a';tri(96,44,4);c.fill();
  if(T.hurtT>0){c.fillStyle='rgba(255,255,255,.5)';tri(140,80,0);c.fill();}
  // corner lights
  for(const [lx,ly] of [[-118,22],[118,22],[0,-40]]){c.fillStyle='#e8fbff';c.beginPath();c.arc(lx,ly,8+Math.sin(S.t*10+lx)*1.5,0,7);c.fill();c.fillStyle='rgba(159,232,216,.5)';c.beginPath();c.arc(lx,ly,16,0,7);c.fill();}
  // core
  const r=14+open*10;c.fillStyle=open>.3?'#ff6ad5':'#3a1a33';c.beginPath();c.arc(0,10,r,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=3;c.stroke();if(open>.3){c.fillStyle='rgba(255,106,213,.4)';c.beginPath();c.arc(0,10,r+10+Math.sin(S.t*12)*4,0,7);c.fill();}
  // decal
  text(c,'TR-3B',70,32,{size:10,col:'rgba(244,230,202,.5)',align:'center'});
  if(T.state==='drain'&&T.t<.8){text(c,'▼',0,-70,{size:26,col:'#ff6ad5',align:'center',base:'middle'});}
  c.restore();}
 function drawHUD(c){
  c.fillStyle=INK;c.fillRect(14,14,250,66);c.fillStyle=hero.col;c.fillRect(14,14,6,66);text(c,hero.name,30,40,{size:26,font:FONT_TITLE,weight:'400',col:hero.col});
  for(let i=0;i<h.maxHp;i++){const x=30+i*18;c.fillStyle=i<h.hp?'#f7d96a':'#3a3a3a';c.fillRect(x,50,12,20);c.fillStyle=i<h.hp?PAPER:'#555';c.fillRect(x,50,12,5);c.strokeStyle='#000';c.lineWidth=1.5;c.strokeRect(x,50,12,20);}
  c.fillStyle=INK;c.fillRect(14,86,250,18);c.fillStyle=h.special>=1?TEAL:'#4a8a80';c.fillRect(16,88,246*h.special,14);text(c,h.special>=1?hero.special+' READY  (K)':hero.special,139,95,{size:12,col:INK,align:'center',base:'middle'});
  // Trixy bar
  const w=420,x=W-w-30;c.fillStyle=INK;c.fillRect(x-4,30,w+8,30);c.fillStyle='#2a1030';c.fillRect(x,34,w,22);const p=clamp(T.hp/T.maxHp,0,1);c.fillStyle=T.open>0?'#ff6ad5':'#9fe8d8';c.fillRect(x+w-w*p,34,w*p,22);
  text(c,'TRIXY',x+w,24,{size:22,font:FONT_TITLE,col:'#ff6ad5',align:'right',weight:'400',stroke:4});text(c,'LIFE FORCE DRAINED: '+Math.round(S.drained*10)/10+'s',x+w,74,{size:12,col:'rgba(244,230,202,.7)',align:'right'});
 }
 return S;
}
