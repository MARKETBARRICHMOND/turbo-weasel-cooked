/* Street-Fighter-style duels on the 16-pose sheets. Shared by campaign bosses and Scrap Mode. */
'use strict';
const POSE={idle:0,walkA:1,walkB:2,crouch:3,windup:4,jab:5,hook:6,sweep:7,uppercut:8,airKick:9,throw:10,special:11,block:12,hurt:13,knockdown:14,victory:15};
const FGROUND=440,FGRAV=1700;
const MOVES={
 jab:{pose:5,start:.07,active:.08,rec:.16,dmg:6,range:70,y:70,h:40,level:'mid',kb:60,stun:.22,meter:8,next:'hook'},
 hook:{pose:6,start:.11,active:.1,rec:.24,dmg:9,range:82,y:72,h:50,level:'mid',kb:110,stun:.3,meter:10},
 sweep:{pose:7,start:.14,active:.12,rec:.3,dmg:8,range:88,y:22,h:28,level:'low',kb:80,stun:.3,knockdown:true,meter:8},
 uppercut:{pose:8,start:.16,active:.14,rec:.34,dmg:11,range:66,y:90,h:100,level:'mid',kb:90,stun:.4,launch:-420,meter:12},
 airKick:{pose:9,start:.06,active:.2,rec:.1,dmg:9,range:78,y:40,h:70,level:'overhead',kb:120,stun:.3,meter:8},
 throw:{pose:10,start:.12,active:.08,rec:.36,dmg:14,range:52,y:50,h:80,level:'throw',kb:260,stun:.5,knockdown:true,meter:6},
 special:{pose:11,start:.18,active:.18,rec:.36,dmg:16,range:110,y:70,h:70,level:'mid',kb:200,stun:.45,knockdown:true,cost:25,meter:0},
 super:{pose:11,start:.3,active:.26,rec:.5,dmg:28,range:150,y:70,h:110,level:'mid',kb:300,stun:.6,knockdown:true,cost:100,meter:0,armor:true},
};
const STYLE_SPECIAL={turbo:{rush:520,name:'BULL RUSH'},weasel:{proj:460,name:'SYSTEM HACK'},borkmaster:{quake:true,name:'BORKQUAKE'},angus:{proj:380,bounce:true,name:'BIN LID'},fredo:{rush:600,name:'ZOOMIES'},crowe:{counter:true,name:'RETURN TO SENDER'},
 karl:{rush:420,name:'BARRED'},lucifer:{rush:560,stab:true,name:'SHANK'},plague:{proj:330,flame:true,name:'TORCH'},riot:{rush:300,armor:true,name:'CORDON'},alienking:{air:true,name:'DOCK 69'},walker:{proj:380,name:'INTERCEPT'},abbess:{proj:420,name:'COSMIC PENANCE'},robbie:{proj:400,rush:420,name:'ENCORE'},weed:{proj:300,name:'BAD TRIP'}};
function makeFighter(id,x,dir,hpMul=1,o={}){const b=BOSSES[id]||BOSSES.turbo;return {id,name:b.name,x,y:FGROUND,vx:0,vy:0,dir,hp:Math.round(b.hp*hpMul),maxHp:Math.round(b.hp*hpMul),speed:b.speed,meter:o.meter||0,maxMeter:100*(1+(o.meterBonus||0)),state:'idle',t:0,move:null,hit:false,stun:0,kd:0,block:false,crouch:false,grounded:true,w:46,h:104,combo:0,ai:o.ai||null,style:b.style,inv:0,phase:1,walkT:0,armor:false,counterT:0,lastHitBy:null,winQuote:b.victory,anim:0};}
function FightScene(cfg,opts={}){
 // cfg: {p1:id, p2:id, diff, arena theme, rounds, friendly, title, tag, profile, p2ai:true}
 const diff=cfg.diff||DIFF.mission;const S={cfg,t:0,done:false,onDone:opts.onDone,round:1,wins:[0,0],phase:'intro',phaseT:0,timer:cfg.timer||75,projs:[],msgs:[],slow:1,quote:null,camX:0,camY:0,zoom:1.5,cheerT:0,jeep:cfg.arena==='servo'?{lit:0,t:0}:null,goons:cfg.arena==='lennox'?{t:3,list:[]}:null};
 const fsx=x=>(x-S.camX)*S.zoom,fsy=y=>(y-S.camY)*S.zoom;
 const theme=cfg.arena||'street';
 function reset(){S.p1=makeFighter(cfg.p1,330,1,1+(cfg.profile?cfg.profile.hpBonus*.08:0),{meterBonus:cfg.profile?cfg.profile.meterBonus:0,meter:S.p1?S.p1.meter:0});S.p2=makeFighter(cfg.p2,630,-1,cfg.p2hp||diff.bossHP,{ai:cfg.p2ai!==false?{react:diff.aiReact,aggro:diff.aiAggro,t:0,plan:null}:null});if(cfg.p2phase2&&S.p2.phase===1){}S.projs=[];S.timer=cfg.timer||75;}
 reset();
 S.enter=function(){Audio.playTrack(cfg.music||'fight');S.phase='intro';S.phaseT=0;};
 function announce(txt,col='#f7d96a',size=86,life=1.1){S.msgs.push({txt,col,size,t:0,life});}
 function startRound(){S.phase='round';S.phaseT=0;announce(`ROUND ${S.round}`,PAPER,70,.9);setTimeout(()=>{if(S.phase==='round'){announce('FIGHT!',RED,110,.8);Audio.sfx('round');}},900);}
 function input(f){// returns intent for a fighter (player or AI)
  if(!f.ai)return {left:Input.held('left'),right:Input.held('right'),up:Input.held('up'),down:Input.held('down'),jump:Input.hit('jump'),attack:Input.hit('attack'),special:Input.hit('special'),attackHeld:Input.held('attack'),specialHeld:Input.held('special')};
  return aiThink(f,f===S.p1?S.p2:S.p1);
 }
 function aiThink(f,o){
  const a=f.ai;a.t-=G.dt;const dist=Math.abs(o.x-f.x);const facing=Math.sign(o.x-f.x)||1;const r={left:false,right:false,up:false,down:false,jump:false,attack:false,special:false};
  if(a.t>0&&a.plan){Object.assign(r,a.plan);return r;}
  a.t=a.react*(0.6+Math.random()*.8);a.plan=null;
  const aggro=a.aggro*(f.phase===2?1.3:1);const style=f.style;const oAttacking=o.state==='attack'&&o.move&&o.t<o.move.start+o.move.active;
  const toward=facing>0?'right':'left',away=facing>0?'left':'right';
  // defend when opponent attacks in range
  if(oAttacking&&dist<140&&Math.random()<(.35+aggro*.2+(style==='turtle'||style==='counter'?.35:0))){const low=o.move.level==='low';r[away]=true;if(low)r.down=true;if(style==='counter'&&Math.random()<.5&&f.meter>=25){r.special=true;}a.plan={...r};a.t=.25;return r;}
  if(dist>170){// approach / zone
   if((style==='zoner'||style==='spectacle')&&f.meter>=25&&Math.random()<.45){r.special=true;}
   else if(style==='air'&&Math.random()<.4){r.jump=true;r[toward]=true;a.plan={[toward]:true,attack:true};a.t=.35;}
   else{r[toward]=true;if(Math.random()<.15)r.jump=true;a.plan={[toward]:true};a.t=.2+Math.random()*.2;}
  }else if(dist>95){if(Math.random()<aggro){r[toward]=true;if(Math.random()<.4)r.attack=true;}else if(Math.random()<.3){r[away]=true;a.plan={[away]:true};a.t=.3;}else r.down=Math.random()<.2;}
  else{// close
   const roll=Math.random();
   if(f.meter>=f.maxMeter&&roll<.25+aggro*.3){r.up=true;r.special=true;}
   else if(f.meter>=25&&roll<.3+aggro*.2){r.special=true;}
   else if(roll<.3+aggro*.4){r.attack=true;if(style==='mixup'&&Math.random()<.5)r.down=true;else if(Math.random()<.25)r.up=true;else if(Math.random()<.2){r.attack=true;r.special=true;}}
   else if(roll<.75){r[away]=true;a.plan={[away]:true};a.t=.25;}
   else if(style==='air'||Math.random()<.2){r.jump=true;a.plan={attack:true,[toward]:true};a.t=.3;}
   else{r.down=true;r.attack=Math.random()<.5;}
  }
  return r;
 }
 function startMove(f,name,o){
  const base=MOVES[name];if(!base)return;
  if(base.cost){if(f.meter<base.cost)return;f.meter-=base.cost;Audio.sfx('special');}
  f.state='attack';f.move={...base,name};f.t=0;f.hit=false;f.crouch=name==='sweep';
  const sp=STYLE_SPECIAL[f.id]||{};
  if(name==='special'||name==='super'){const isS=name==='super';
   if(sp.rush){f.vx=f.dir*sp.rush*(isS?1.2:1);f.move.travel=true;if(sp.stab){f.move.dmg=(f.move.dmg||10)+4;f.move.active=Math.min(f.move.active||.2,.14);comicWord(pick(['SHANK','STAB','OI']),fsx(f.x),fsy(f.y-150),RED,40);}}
   if(sp.proj){S.projs.push({x:f.x+f.dir*30,y:f.y-70,vx:f.dir*sp.proj*(isS?1.25:1),owner:f,dmg:isS?22:12,t:0,big:isS,bounce:sp.bounce,col:f.id==='weasel'?TEAL:f.id==='robbie'?'#c99be0':f.id==='abbess'?VIOLET:sp.flame?'#ff7a1a':AMBER,flame:!!sp.flame});f.move.active=.01;}
   if(sp.quake){f.move.range=200;f.move.level='low';f.move.y=20;f.move.h=50;shake(10);}
   if(sp.air){f.vy=-520;f.grounded=false;f.move.pose=9;f.move.active=.5;f.move.level='overhead';}
   if(sp.counter){f.counterT=.45;f.move.active=.01;f.move.dmg=0;}
   if(sp.armor||isS)f.armor=true;
   comicWord(isS?(sp.name+'!!'):sp.name+'!',fsx(f.x),fsy(f.y-150),f===S.p1?TEAL:RED,isS?44:30);
  }
 }
 function hurt(v,a,move,fromProj){
  if(S.phase!=='fight')return;/* the round is frozen the moment a K.O. lands */if(v.inv>0||v.state==='knockdown')return;
  const low=move.level==='low',oh=move.level==='overhead',thr=move.level==='throw';
  const blocked=v.block&&!thr&&!(low&&!v.crouch)&&!(oh&&v.crouch);
  if(v.counterT>0&&!fromProj){v.counterT=0;v.state='attack';v.move={...MOVES.throw,name:'throw',dmg:18};v.t=.12;v.hit=false;comicWord('RETURN TO SENDER!',fsx(v.x),fsy(v.y-150),AMBER,30);Audio.sfx('special');return;}
  if(blocked){v.stun=.2;v.state='block';v.t=0;v.meter=Math.min(v.maxMeter,v.meter+3);Audio.sfx('block');burst(v.x+v.dir*-20,v.y-60,'#9aaec1',5,100,.25,3,0);v.x-=v.dir*-1*move.kb*.15;const chip=Math.max(0,Math.round(move.dmg*.1));v.hp-=chip;comicWord('BLOCK',fsx(v.x),fsy(v.y-130),'#9aaec1',22);if(v.hp<=0){v.hp=0;ko(v,a);}return;}
  if(v.armor&&!thr&&!fromProj){v.hp-=Math.round(move.dmg*.6);burst(v.x,v.y-60,AMBER,8,150,.3,4);Audio.sfx('hit');comicWord('ARMOUR',fsx(v.x),fsy(v.y-130),AMBER,22);if(v.hp<=0){v.hp=0;ko(v,a);}return;}
  const scale=(a===S.p2?diff.dmg:1)*(a.combo>0?Math.max(.4,1-a.combo*.12):1);
  v.hp-=Math.round(move.dmg*scale);v.stun=move.stun;v.state='hurt';v.t=0;v.block=false;v.vx=-v.dir*move.kb*1.8;v.meter=Math.min(v.maxMeter,v.meter+5);a.meter=Math.min(a.maxMeter,a.meter+(move.meter||6));a.combo++;v.lastHitBy=a;
  if(move.launch){v.vy=move.launch;v.grounded=false;}
  if(move.knockdown){v.state='knockdown';v.kd=.9;v.vy=-200;v.grounded=false;v.vx=-v.dir*move.kb*2;}
  hitstop(move.knockdown?.09:.05);shake(move.knockdown?7:3);Audio.sfx(move.knockdown?'heavy':'punch');
  burst(v.x,v.y-70,pick([AMBER,RED,PAPER]),10,200,.4,5);comicWord(pick(['POW','WHAM','KRAK','BIFF','SMACK','THWACK','OOF','DOOF']),fsx(v.x)+rnd(-20,20),fsy(v.y-140),pick([AMBER,RED,'#f7d96a']),move.knockdown?48:34);
  if(a.combo>=3)floater(a.combo+' HIT COMBO',a.x,a.y-170,TEAL,16);
  if(v.hp<=0){v.hp=0;ko(v,a);}
 }
 function ko(v,a){S.phase='ko';S.phaseT=0;S.projs=[];if(S.goons)S.goons.list=[];v.state='knockdown';v.kd=3;v.vy=-300;v.grounded=false;v.vx=-v.dir*260;announce('K.O.',RED,140,1.6);Audio.sfx('ko');hitstop(.25);shake(14);flash(PAPER,.5);
  const winner=a===S.p1?0:1;S.wins[winner]++;S.lastWinner=winner;}
 function updateFighter(f,o,dt){
  const inp=S.phase==='fight'?input(f):{};
  f.inv=Math.max(0,f.inv-dt);f.counterT=Math.max(0,f.counterT-dt);f.anim+=dt;
  if(f.phase===1&&cfg.p2phase2&&f===S.p2&&f.hp<f.maxHp*.5){f.phase=2;f.speed*=1.25;f.meter=f.maxMeter;announce('ROCK DJ MODE',VIOLET,70,1.4);Audio.sfx('glitch');flash(VIOLET,.6);f.hp=Math.round(f.maxHp*.5);}
  // facing
  if(f.state!=='attack'&&f.state!=='hurt'&&f.state!=='knockdown'&&f.grounded)f.dir=o.x>f.x?1:-1;
  // physics
  f.vy+=FGRAV*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;
  if(f.y>=FGROUND){f.y=FGROUND;f.vy=0;if(!f.grounded){f.grounded=true;if(f.state==='attack'&&f.move&&f.move.name==='airKick')f.state='idle';}}
  if(f.grounded){f.vx*=f.state==='attack'&&f.move&&f.move.travel?.92:.78;}
  f.x=clamp(f.x,Math.max(30,S.camX+34),Math.min(W-30,S.camX+W/S.zoom-34));
  // push apart
  const dx=o.x-f.x;if(Math.abs(dx)<44&&f.grounded&&o.grounded){const push=(44-Math.abs(dx))/2;f.x-=Math.sign(dx||1)*push;}
  switch(f.state){
   case 'hurt':f.t+=dt;if(f.t>=f.stun){f.state='idle';}break;
   case 'knockdown':f.kd-=dt;if(f.kd<=0&&f.grounded&&S.phase==='fight'){f.state='idle';f.inv=.5;f.combo=0;}break;
   case 'block':f.t+=dt;if(f.t>=f.stun)f.state='idle';break;
   case 'attack':{f.t+=dt;const m=f.move;
    if(f.t>=m.start&&f.t<m.start+m.active&&!f.hit){
     const bx=f.dir>0?f.x+10:f.x-10-m.range;const box={x:bx,y:f.y-m.y-m.h/2,w:m.range,h:m.h};
     const oh=o.crouch?o.h*.6:o.h;const vb={x:o.x-o.w/2,y:o.y-oh,w:o.w,h:oh};
     if(box.x<vb.x+vb.w&&box.x+box.w>vb.x&&box.y<vb.y+vb.h&&box.y+box.h>vb.y&&o.state!=='knockdown'){f.hit=true;hurt(o,f,m,false);}
    }
    if(f.t>=m.start+m.active+m.rec){f.state='idle';f.move=null;f.armor=false;f.crouch=false;if(f.hit&&m.next&&(inp.attackHeld||inp.attack)){startMove(f,m.next);}else if(!f.hit)f.combo=0;}
    break;}
   default:{
    f.block=false;f.crouch=false;
    if(S.phase!=='fight')break;
    const fwd=f.dir>0?inp.right:inp.left,back=f.dir>0?inp.left:inp.right;
    if(f.grounded){
     if(inp.down){f.crouch=true;f.vx=0;if(back)f.block=true;}
     else if(back){f.block=true;f.vx=-f.dir*f.speed*.55;f.state='walk';}
     else if(fwd){f.vx=f.dir*f.speed;f.state='walk';}
     else f.state='idle';
     if(inp.jump){f.vy=-620;f.grounded=false;f.vx=fwd?f.dir*f.speed*.9:back?-f.dir*f.speed*.7:0;Audio.sfx('jump');}
     if(inp.attack&&inp.special){const dist=Math.abs(o.x-f.x);if(dist<70)startMove(f,'throw');else startMove(f,'jab');}
     else if(inp.special){if(inp.up&&f.meter>=f.maxMeter)startMove(f,'super');else if(f.meter>=25)startMove(f,'special');else{floater('NEED METER',f.x,f.y-150,PAPER,14);}}
     else if(inp.attack){if(inp.down)startMove(f,'sweep');else if(inp.up)startMove(f,'uppercut');else if(fwd)startMove(f,'hook');else startMove(f,'jab');}
    }else{if(inp.attack)startMove(f,'airKick');}
   }
  }
 }
 function pose(f){
  if(f.state==='knockdown')return f.grounded?14:13;
  if(f.state==='hurt')return 13;if(f.state==='block')return 12;
  if(f.state==='attack'&&f.move){const m=f.move;return f.t<m.start?(m.name==='airKick'?9:4):m.pose;}
  if(S.phase==='win'&&f===S.winnerF)return 15;
  if(!f.grounded)return 9;
  if(f.crouch||f.block&&f.crouch)return 3;
  if(f.block)return 12;
  if(f.state==='walk')return 1+Math.floor(f.anim*7)%2;
  return 0;
 }
 S.autoPause=function(){if(S.phase==='fight'&&!S.paused){S.paused=true;S.pauseAct=null;}};
 S.update=function(dt){if(S.done)return;
  if(S.paused){if(Input.hit('pause')||S.pauseAct==='resume'){S.paused=false;S.pauseAct=null;}else if(Input.hit('back')||Input.hit('special')&&Input.hit('attack')||S.pauseAct==='quit'){S.done=true;S.onDone({result:'quit'});}return;}
  S.t+=dt;S.phaseT+=dt;for(const m of S.msgs)m.t+=dt;S.msgs=S.msgs.filter(m=>m.t<m.life);
  if(Input.hit('pause')&&(S.phase==='fight')){S.paused=true;S.pauseAct=null;return;}
  if(S.phase==='intro'){if(S.phaseT>2.2||Input.hit('confirm')&&S.phaseT>.5)startRound();}
  else if(S.phase==='round'){if(S.phaseT>1.7){S.phase='fight';S.phaseT=0;}}
  else if(S.phase==='fight'){S.timer-=dt;if(S.timer<=0){S.timer=0;const v=S.p1.hp/S.p1.maxHp>=S.p2.hp/S.p2.maxHp?S.p2:S.p1;ko(v,v===S.p1?S.p2:S.p1);S.msgs=S.msgs.filter(m=>m.txt!=='K.O.');announce('TIME',PAPER,110,1.4);}}
  else if(S.phase==='ko'){if(S.phaseT>2.2){const need=cfg.rounds||diff.rounds;if(S.wins[S.lastWinner]>=need){S.phase='win';S.phaseT=0;S.winnerF=S.lastWinner===0?S.p1:S.p2;S.winnerF.state='idle';S.quote=S.winnerF.winQuote;Audio.sfx(S.lastWinner===0?'win':'lose');}else{S.round++;const m1=S.p1.meter,m2=S.p2.meter;reset();S.p1.meter=m1*.5;S.p2.meter=m2*.5;startRound();}}}
  else if(S.phase==='win'){if(S.phaseT>1.2&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump'))||S.phaseT>7){S.done=true;S.onDone({result:S.lastWinner===0?'win':'lose',p1hp:S.p1.hp,rounds:S.round,wins:S.wins});}}
  if(S.phase==='fight'||S.phase==='ko'){updateFighter(S.p1,S.p2,dt);updateFighter(S.p2,S.p1,dt);}
  // projectiles
  for(const p of S.projs){p.t+=dt;p.x+=p.vx*dt;if(p.bottle){p.vy+=900*dt;p.y+=p.vy*dt;if(p.y>FGROUND-10){p.t=99;burst(p.x,FGROUND-10,'#8fd18f',8,160,.4,3);Audio.sfx('hit');}}const o=p.owner===S.p1?S.p2:S.p1;if(p.bounce&&(p.x<10||p.x>W-10)){p.vx*=-1;p.bounced=true;}
   if(Math.abs(p.x-o.x)<o.w/2+(p.big?26:12)&&p.y>o.y-o.h&&p.y<o.y&&o.state!=='knockdown'&&!p.hitDone){p.hitDone=true;p.t=99;hurt(o,p.owner,{...MOVES.special,dmg:p.dmg,kb:p.big?220:120,stun:p.big?.5:.3,knockdown:p.big,level:'mid',meter:10},true);}
   if(G.frame%3===0)burst(p.x,p.y,p.col,1,40,.3,p.big?6:4,0);if(p.flame&&G.frame%2===0)burst(p.x-p.vx*.02,p.y+rnd(-14,14),pick(['#ff7a1a','#ffd04a','#ff3a1a']),2,60,.4,7,-120);}
  S.projs=S.projs.filter(p=>p.t<2.2&&(p.bounce||p.x>-60&&p.x<W+60));
  // camera: Street Fighter style, tightens when the fighters close in
  {const mid=(S.p1.x+S.p2.x)/2,dist=Math.abs(S.p1.x-S.p2.x);S.zoom=lerp(S.zoom,clamp(1.98-dist/640,1.4,1.78),.06);const vw=W/S.zoom;S.camX=lerp(S.camX,clamp(mid-vw/2,0,W-vw),.14);const topY=Math.min(S.p1.y,S.p2.y)-150;S.camY=Math.max(Math.min(FGROUND-492/S.zoom,topY-100/S.zoom),FGROUND-(H-24)/S.zoom);}
  if(S.goons&&S.phase==='fight'){S.goons.t-=dt;for(const g of S.goons.list){g.t+=dt;if(g.t>.5&&!g.thrown){g.thrown=true;const tx=S.p1.x;S.projs.push({x:g.x,y:FGROUND-235,vx:(tx-g.x)*.9,vy:60,owner:S.p2,dmg:7,t:0,big:false,col:'#8fd18f',bottle:true});Audio.sfx('shoot');}}S.goons.list=S.goons.list.filter(g=>g.t<1.6);if(S.goons.t<=0){S.goons.t=(diff===DIFF.pissweak?6:diff===DIFF.absolutely?2.4:3.8)+Math.random()*2;S.goons.list.push({x:pick([W*.36,W*.5,W*.64]),t:0,thrown:false,face:Math.floor(Math.random()*3)});comicWord(pick(['OI!','WHO’S THIS?','BOYS!','CATCH!']),W/2,120,AMBER,30);}}
  if(S.jeep){S.jeep.t+=dt;if(S.phase==='intro'&&S.phaseT>1.1&&!S.jeep.lit){S.jeep.lit=1;shake(10);flash('#ff7a1a',.5);Audio.sfx('explode');comicWord('WHOOMP',W*.72,H*.45,'#ff7a1a',64);}if(S.jeep.lit&&G.frame%2===0){burst(S.jeepX+rnd(-70,70),FGROUND-40-rnd(0,40),pick(['#ff7a1a','#ffd04a','#ff3a1a']),2,90,.6,9,-260);if(G.frame%6===0)burst(S.jeepX+rnd(-50,50),FGROUND-120,'rgba(30,30,30,.7)',1,40,1.6,16,-90);}}
  updateFx();
 };
 S.draw=function(c){
  const pano=(theme==='servo'||theme==='lennox')?'street':theme;const groundScr=(FGROUND-S.camY)*S.zoom;
  drawSky(c,pano,groundScr,S.t);
  drawPanorama(c,pano,S.camX*S.zoom+400,{groundY:492,oy:groundScr-492,parallax:.35});
  {const hz=c.createLinearGradient(0,groundScr-240,0,groundScr);hz.addColorStop(0,'rgba(0,0,0,0)');hz.addColorStop(1,hexA((SKY[pano]||SKY.street)[2],.18));c.fillStyle=hz;c.fillRect(0,groundScr-240,W,240);}
  c.save();c.scale(S.zoom,S.zoom);c.translate(-S.camX,-S.camY);
  // floor
  const col=THEME_COL[pano]||THEME_COL.street;const GB=S.camY+H/S.zoom+40;c.fillStyle=col.ground;c.fillRect(-200,FGROUND,W+400,GB-FGROUND);c.fillStyle=INK;c.fillRect(-200,FGROUND-3,W+400,5);c.fillStyle=col.top;c.fillRect(-200,FGROUND+2,W+400,6);
  if(pano==='street'){c.fillStyle='#2a2522';c.fillRect(-200,FGROUND+16,W+400,GB-FGROUND-16);c.fillStyle='rgba(247,217,106,.5)';for(let x=-200;x<W+200;x+=90)c.fillRect(x,FGROUND+44,44,4);}
  else{c.fillStyle='rgba(255,255,255,.06)';for(let x=-200;x<W+200;x+=80)c.fillRect(x,FGROUND+8,78,GB-FGROUND-8);}
  if(S.jeep)drawJeep(c);if(S.goons)drawFlat(c);
  // shadows
  for(const f of [S.p1,S.p2]){dropShadow(c,f.x,FGROUND+2,Math.max(16,34-(FGROUND-f.y)*.08),.4);}
  // draw fighters (hurt one drawn last)
  const order=[S.p1,S.p2].sort((a,b)=>(a.state==='hurt'||a.state==='knockdown')?1:-1);
  for(const f of order){const o={filter:f.inv>0&&Math.floor(G.time*20)%2?'brightness(2)':f.phase===2?'hue-rotate(260deg) saturate(1.6)':f.armor?'sepia(.6) saturate(2)':f.id==='plague'?'hue-rotate(80deg) saturate(.45) brightness(.72)':f.id==='lucifer'?'hue-rotate(-35deg) saturate(.6) brightness(.9)':undefined};drawFighter(c,f.id,pose(f),f.x,f.y,f.dir,o);if(f.id==='plague')drawPlagueMask(c,f);
   if(f.state==='attack'&&f.move&&f.t>=f.move.start&&f.t<f.move.start+f.move.active&&f.move.name!=='special'){c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=3;c.beginPath();c.arc(f.x+f.dir*(f.move.range*.6),f.y-f.move.y,f.move.h*.5,0,7);c.stroke();}}
  for(const p of S.projs){c.save();c.translate(p.x,p.y);c.fillStyle=p.col;c.strokeStyle=INK;c.lineWidth=3;if(p.bottle){c.rotate(p.t*9);c.fillRect(-5,-14,10,28);c.strokeRect(-5,-14,10,28);c.fillStyle=PAPER;c.fillRect(-4,-4,8,8);c.restore();continue;}c.beginPath();const r=p.big?30:16;
   if(p.flame){const d=Math.sign(p.vx)||1;c.scale(d,1);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,rr=(i%2?r*.5:r)*(1+Math.sin(p.t*30+i)*.25);c.lineTo(Math.cos(a)*rr*(Math.cos(a)<0?2.2:1.1),Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();c.fillStyle='#ffd04a';c.beginPath();c.arc(4,0,r*.45,0,7);c.fill();}
   else{for(let i=0;i<10;i++){const a=i/10*Math.PI*2+p.t*8,rr=i%2?r*.6:r;c.lineTo(Math.cos(a)*rr*1.5,Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();}
   c.restore();}
  drawFx(c,0);drawFloaters(c,0);
  c.restore();
  colourGrade(c,pano);
  drawFightHUD(c);
  for(const m of S.msgs){const p=m.t/m.life;const sc=p<.15?easeOut(p/.15)*1.4:lerp(1.4,1,Math.min(1,(p-.15)/.25));c.save();c.translate(W/2,H/2-40);c.scale(sc,sc);c.globalAlpha=p>.8?1-(p-.8)/.2:1;if(m.txt==='K.O.'||m.txt==='FIGHT!')speedLines(c,0,0,40,.35,PAPER);text(c,m.txt,0,0,{size:m.size,font:FONT_TITLE,col:m.col,align:'center',base:'middle',weight:'400',stroke:10});c.restore();}
  if(S.phase==='intro')drawVersus(c);
  if(S.phase==='win')drawWin(c);
  if(S.paused)drawPauseMenu(c,S,G.touch?'ATTACK: jab · stick+ATTACK: hook/sweep/uppercut · SPECIAL: special · up+SPECIAL: super · hold back to block':'JAB: J · HOOK: →+J · SWEEP: ↓+J · UPPERCUT: ↑+J · AIR KICK: J in air · THROW: J+K close · BLOCK: hold back (↓ for lows) · SPECIAL: K (25 meter) · SUPER: ↑+K (full meter)');
 };
 // The Plague Doctor's own jeep, parked at the servo. He torches it himself during the intro. Nobody asked him to.
 S.jeepX=W*.74;
 function drawFlat(c){// 106 Lennox St, the top flat: brick, three windows, balcony rail with Turbo's chain still on it
  const y=FGROUND-235,x0=W*.28,x1=W*.72;c.save();c.fillStyle='#5a3a30';c.fillRect(x0,y-46,x1-x0,80);c.fillStyle='rgba(0,0,0,.18)';for(let r=0;r<8;r++)for(let k=0;k<14;k++)if((r+k)%2)c.fillRect(x0+k*((x1-x0)/14),y-46+r*10,(x1-x0)/14,10);
  c.fillStyle='#2a1d18';c.fillRect(x0-10,y+30,x1-x0+20,14);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(x0,y-46,x1-x0,80);
  [W*.36,W*.5,W*.64].forEach((x,i)=>{const g=S.goons.list.find(g=>Math.abs(g.x-x)<2);c.fillStyle=g?'#f3d9a0':'#1a2630';c.fillRect(x-30,y-36,60,56);c.strokeRect(x-30,y-36,60,56);c.fillStyle='rgba(255,255,255,.08)';c.fillRect(x-28,y-34,26,24);if(g){const k=Math.min(1,g.t/.3);c.save();c.beginPath();c.rect(x-30,y-36,60,56);c.clip();c.translate(x,y+22-k*36);c.fillStyle=['#5a3a2a','#3a2a4a','#2a3a2a'][g.face];c.fillRect(-14,-18,28,30);c.fillStyle='#c98a63';c.fillRect(-10,-30,20,18);c.fillStyle=INK;c.fillRect(-6,-26,3,3);c.fillRect(3,-26,3,3);c.fillRect(-7,-20,14,2);c.fillStyle='#8fd18f';c.fillRect(12,-24,5,14);c.restore();}});
  c.strokeStyle='#999';c.lineWidth=3;for(let k=0;k<=10;k++){const x=x0-10+k*((x1-x0+20)/10);c.beginPath();c.moveTo(x,y+30);c.lineTo(x,y+14);c.stroke();}c.beginPath();c.moveTo(x0-10,y+14);c.lineTo(x1+10,y+14);c.stroke();
  c.strokeStyle='#bbb';c.lineWidth=4;c.beginPath();c.moveTo(x1-40,y+16);c.lineTo(x1-28,y+34);c.lineTo(x1-16,y+16);c.stroke();
  text(c,'106',W*.5,y-58,{size:22,font:FONT_TITLE,weight:'400',col:'#f7d96a',align:'center',base:'middle',stroke:4});text(c,'LUCIFER’S MECHANIC · NOT A CHOP SHOP',W*.5,y+52,{size:11,col:'#f7d96a',align:'center',base:'middle',stroke:3});c.restore();}
 function drawJeep(c){const x=S.jeepX,y=FGROUND;c.save();c.translate(x,y);
  c.fillStyle=INK;c.fillRect(-84,-62,168,52);c.fillStyle='#4f5b3a';c.fillRect(-80,-58,160,44);c.fillStyle='#3a4428';c.fillRect(-80,-58,160,10);
  c.fillStyle=INK;c.fillRect(-30,-96,4,40);c.fillRect(26,-96,4,40);c.fillRect(-34,-98,64,5);// roll bar
  c.fillStyle='#9fc4d8';c.fillRect(-26,-90,52,28);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(-26,-90,52,28);// windscreen
  for(const wx of [-50,50]){c.fillStyle=INK;c.beginPath();c.arc(wx,-8,20,0,7);c.fill();c.fillStyle='#777';c.beginPath();c.arc(wx,-8,10,0,7);c.fill();}
  c.fillStyle='#f7d96a';c.fillRect(-84,-40,8,8);c.fillStyle=RED;c.fillRect(76,-40,8,8);
  text(c,'PLAGUE RESPONSE',0,-30,{size:11,col:PAPER,align:'center',base:'middle'});
  if(S.jeep.lit){const t=S.jeep.t;c.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const fx=-70+i*17.5,fh=40+Math.sin(t*14+i*1.7)*16+(i%3)*10;const g=c.createLinearGradient(0,-58,0,-58-fh);g.addColorStop(0,'rgba(255,220,80,.95)');g.addColorStop(.5,'rgba(255,120,20,.8)');g.addColorStop(1,'rgba(255,40,0,0)');c.fillStyle=g;c.beginPath();c.moveTo(fx-12,-58);c.quadraticCurveTo(fx-10,-58-fh*.6,fx+Math.sin(t*9+i)*6,-58-fh);c.quadraticCurveTo(fx+12,-58-fh*.6,fx+12,-58);c.closePath();c.fill();}
   c.globalCompositeOperation='source-over';c.fillStyle='rgba(255,140,40,.25)';c.beginPath();c.arc(0,-70,120+Math.sin(t*20)*8,0,7);c.fill();}
  c.restore();}
 // Beak mask, goggles and brim drawn over the hazmat sheet so the Plague Doctor reads at a glance.
 function drawPlagueMask(c,f){const ps=pose(f);if(ps===14)return;const th=ATLAS.fight.plague.targetHeight;const hy=f.y-(ps===3?th*.62:th)+24;const hx=f.x+f.dir*6;c.save();c.translate(hx,hy);c.scale(f.dir,1);
  c.fillStyle=INK;c.fillRect(-26,-22,52,8);c.fillRect(-16,-40,32,20);// hat
  c.fillStyle='#2b2520';c.beginPath();c.moveTo(-10,-6);c.lineTo(34,6);c.lineTo(-6,16);c.closePath();c.fill();c.strokeStyle=INK;c.lineWidth=3;c.stroke();// beak
  c.fillStyle='#1a1a1a';c.beginPath();c.arc(-6,-8,8,0,7);c.arc(8,-6,8,0,7);c.fill();c.fillStyle=f.state==='attack'?'#ff7a1a':'#9fe8d8';c.beginPath();c.arc(-6,-8,5,0,7);c.arc(8,-6,5,0,7);c.fill();// goggles
  c.restore();}
 function drawFightHUD(c){
  const bar=(x,f,flip)=>{const w=360-(flip?(G.hudR||0):0);c.fillStyle=INK;c.fillRect(x-4,30,w+8,30);c.fillStyle='#3a1a1a';c.fillRect(x,34,w,22);const p=clamp(f.hp/f.maxHp,0,1);const fw=w*p;c.fillStyle=p>.5?'#f7d96a':p>.25?AMBER:RED;c.fillRect(flip?x+w-fw:x,34,fw,22);
   c.fillStyle=INK;c.fillRect(x-4,66,w*.6+8,12);c.fillStyle=f.meter>=f.maxMeter?TEAL:'#4a8a80';const mw=w*.6*clamp(f.meter/f.maxMeter,0,1);c.fillRect(flip?x+w-mw:x,68,mw,8);
   text(c,f.name,flip?x+w:x,24,{size:22,font:FONT_TITLE,col:PAPER,align:flip?'right':'left',weight:'400',stroke:4});
   if(f.meter>=f.maxMeter)text(c,'SUPER READY ↑+K',flip?x+w:x,90,{size:12,col:TEAL,align:flip?'right':'left',stroke:3});};
  bar(30,S.p1,false);bar(W-390,S.p2,true);
  // timer + rounds
  c.fillStyle=INK;c.fillRect(W/2-44,14,88,44);text(c,String(Math.ceil(S.timer)),W/2,38,{size:34,font:FONT_TITLE,col:S.timer<10?RED:'#f7d96a',align:'center',base:'middle',weight:'400'});
  const need=cfg.rounds||diff.rounds;for(let i=0;i<need;i++){c.fillStyle=i<S.wins[0]?AMBER:'#333';c.beginPath();c.arc(W/2-60-i*18,70,6,0,7);c.fill();c.fillStyle=i<S.wins[1]?AMBER:'#333';c.beginPath();c.arc(W/2+60+i*18,70,6,0,7);c.fill();}
  if(cfg.tag)text(c,cfg.tag,W-30,100,{size:12,col:'rgba(244,230,202,.7)',align:'right'});
 }
 function drawVersus(c){const p=S.phaseT;c.fillStyle='rgba(0,0,0,.5)';c.fillRect(0,0,W,H);
  const sl=easeOut(Math.min(1,p/.5));c.save();c.fillStyle=TEAL;c.beginPath();c.moveTo(-W+sl*W,100);c.lineTo(sl*W*.55,100);c.lineTo(sl*W*.45,260);c.lineTo(-W+sl*W,260);c.fill();c.fillStyle=RED;c.beginPath();c.moveTo(W*2-sl*W,300);c.lineTo(W-sl*W*.45,300);c.lineTo(W-sl*W*.55,460);c.lineTo(W*2-sl*W,460);c.fill();c.restore();
  if(p>.4){text(c,S.p1.name,W*.27,180,{size:58,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});text(c,(BOSSES[S.p1.id]||{}).style?.toUpperCase()||'',W*.27,222,{size:16,col:INK,align:'center'});text(c,S.p2.name,W*.73,380,{size:58,font:FONT_TITLE,col:PAPER,align:'center',base:'middle',weight:'400'});text(c,cfg.tag||'',W*.73,422,{size:16,col:PAPER,align:'center'});}
  if(p>.7){c.save();c.translate(W/2,H/2);c.rotate(-.1);text(c,'VS',0,0,{size:140,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:12,strokeCol:RED});c.restore();}
  drawFighter(c,S.p1.id,0,W*.2,H-30,1,{scale:1.9});drawFighter(c,S.p2.id,0,W*.8,H-30,-1,{scale:1.9});
  if(cfg.friendly)text(c,'FRIENDLY (HIS WORDS)',W/2,H-24,{size:16,col:TEAL,align:'center'});}
 function drawWin(c){const f=S.winnerF;const q=S.quote||'';const font=`400 24px ${FONT_HAND}`;const lines=wrapText(c,q,420,font);const bw=460,bh=lines.length*28+40;const bx=clamp(fsx(f.x)-bw/2,20,W-bw-20),by=clamp(fsy(f.y-f.h)-bh-30,100,232-bh);bubble(c,bx,by,bw,bh,fsx(f.x),fsy(f.y-f.h+10),'speech');lines.forEach((l,i)=>text(c,l,bx+bw/2,by+30+i*28,{size:24,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));
  text(c,S.lastWinner===0?'YOU WIN':'YOU LOSE',W/2,H/2+36,{size:90,font:FONT_TITLE,col:S.lastWinner===0?'#f7d96a':RED,align:'center',base:'middle',weight:'400',stroke:10});
  if(S.phaseT>1.2)text(c,'PRESS ATTACK',W/2,H-30,{size:22,font:FONT_TITLE,col:AMBER,align:'center',weight:'400'});}
 return S;
}
