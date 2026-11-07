/* Run-and-gun platformer: Metal Slug pace, Pitfall pits and hazards, Aladdin-style double jump / wall kick for Weasel. */
'use strict';
const GROUND=430,GRAV=1500;
// Camera zoom: the world is drawn at ZOOM× so the heroes read big and the action fills the screen.
const ZOOM=1.6,VW=W/ZOOM,VH=H/ZOOM,CAMY0=GROUND-480/ZOOM;
const THEME_COL={
 street:{ground:'#3a2f29',top:'#8a6a4a',plat:'#365c4a',platTop:'#5c8a6a',ink:INK,accent:'#efba56',sky:'#1c2a3a'},
 glitch:{ground:'#2a2638',top:'#6a5a8a',plat:'#3b2f55',platTop:'#8a6fb0',ink:INK,accent:'#9974aa',sky:'#1a1428'},
 space:{ground:'#2b3136',top:'#6e7f8a',plat:'#3d4a55',platTop:'#8aa0b0',ink:INK,accent:'#68cbbb',sky:'#0e1a24'},
 isa:{ground:'#242a2e',top:'#5e6a70',plat:'#36424a',platTop:'#9aaec1',ink:INK,accent:'#de755f',sky:'#0b1016'},
 moon:{ground:'#3a1a1e',top:'#8a3a3a',plat:'#4a2228',platTop:'#b04a4a',ink:INK,accent:'#ff6a4a',sky:'#200a10'},
 ship:{ground:'#20242c',top:'#55606e',plat:'#2d3440',platTop:'#7a8aa0',ink:INK,accent:'#c99be0',sky:'#0a0c14'},
};
function PlatformScene(chapter,run,opts={}){
 const diff=DIFF[run.difficulty],hero=CHARS[run.char],P=run.profile;
 const S={chapter,run,t:0,cam:0,done:false,onDone:opts.onDone,theme:chapter.theme,col:THEME_COL[chapter.theme]||THEME_COL.street,
  ents:[],shots:[],eshots:[],items:[],plats:[],pits:[],hazards:[],checkpoints:[],banterIdx:0,bubble:null,bubbleT:0,
  score:0,xp:0,cash:0,pagesFound:0,pageToast:null,cashPop:null,collected:0,deeds:0,crimes:0,kills:0,paused:false,pauseSel:0,gameOver:false,won:false,endT:0,tram:null,camY:CAMY0};
 const sx=x=>(x-S.cam)*ZOOM,sy=y=>(y-S.camY)*ZOOM;
 const rng=seeded(chapter.n*7919+run.seed);
 const lowG=chapter.lowGrav||1;
 // Jump: tuned so a single jump clears ~155px (about two and a half heroes) and every platform tier is reachable.
 const JUMPV=hero.jump*1.72,JUMPH=(JUMPV*JUMPV)/(2*GRAV*lowG),AIRT=2*JUMPV/(GRAV*lowG),REACHX=AIRT*hero.speed*.9;
 /* --- hero --- */
 const maxHp=Math.round((hero.hp+P.hpBonus)*diff.hp);
 S.h={x:120,y:GROUND,vx:0,vy:0,dir:1,hp:maxHp,maxHp,lives:diff.lives,inv:0,onGround:true,jumps:0,step:0,fireT:0,special:1,specialT:0,rush:0,hack:0,crouch:false,aimUp:false,shootT:0,hurtT:0,dead:false,deadT:0,kevlar:P.kevlar,wallT:0,dropT:0,coyote:0,pit:null,power:null,powerT:0,gear:0};
 const h=S.h;
 /* --- build level --- */
 const L=chapter.length;
 {let x=0;const groundSpans=[];while(x<L){let span=500+rng()*700;if(x+span>L-500)span=L-x;groundSpans.push([x,x+span]);x+=span;if(x<L-600){const pit=70+rng()*55*(diff===DIFF.pissweak?.6:1);S.pits.push([x,x+pit]);x+=pit;}}
  S.ground=groundSpans;
  // platforms (awnings / gantries / ledges)
  for(let px=350;px<L-400;px+=rng()*260+200){const w=120+rng()*180;const high=rng()<.45;const y=GROUND-(high?190+rng()*40:105+rng()*35);
   if(high){S.plats.push({x:px-150,y:GROUND-(110+rng()*25),w:120,h:22,moving:null,step:true});}
   S.plats.push({x:px,y,w,h:22,moving:chapter.n>=4&&!high&&rng()<.25?{dy:60,t:rng()*6}:null});}
  // reachability guarantee: every platform must be a single jump from the ground or from a reachable platform; lower any that isn't
  {const JH=JUMPH-12;const reach=new Set();let changed=true;while(changed){changed=false;for(const p of S.plats){if(reach.has(p))continue;if(GROUND-p.y<=JH){reach.add(p);changed=true;continue;}
    for(const q of S.plats){if(!reach.has(q)||q===p)continue;const gap=Math.max(0,Math.max(p.x-(q.x+q.w),q.x-(p.x+p.w)));if(q.y-p.y<=JH&&gap<=REACHX-20){reach.add(p);changed=true;break;}}}}
   for(const p of S.plats)if(!reach.has(p)){p.y=GROUND-(JH-10);p.moving=null;}}
  S.plats.sort((a,b)=>a.x-b.x);
  // hazards
  const hz={street:'keg',glitch:'glitch',space:'vent',isa:'laser',moon:'rock',ship:'crusher'}[chapter.theme];
  for(let hx=700;hx<L-500;hx+=rng()*500+450){if(S.pits.some(p=>hx>p[0]-120&&hx<p[1]+60))continue;if(hz==='keg'&&S.pits.some(p=>hx+330>p[0]&&hx+190<p[1]))continue;S.hazards.push({type:hz,x:hx,t:rng()*3,on:false});}
  // enemies
  const count=Math.round((L/230)*(diff===DIFF.pissweak?.7:diff===DIFF.absolutely?1.3:1));
  for(let i=0;i<count;i++){const ex=400+rng()*(L-900);if(S.pits.some(p=>ex>p[0]-40&&ex<p[1]+40))continue;const type=pick(chapter.enemies);S.ents.push(makeEnemy(type,ex));}
  // items
  for(let ix=250;ix<L-300;ix+=rng()*300+220){const r=rng();const type=r<.42?'cash':r<.6?'slab':r<.74?'cone':r<.84?'gear':r<.9?'billy':'deed';const onPlat=S.plats.find(p=>ix>p.x&&ix<p.x+p.w);if(!onPlat&&S.pits.some(p=>ix>p[0]-30&&ix<p[1]+30))continue;S.items.push({type,x:ix,y:onPlat?onPlat.y-10:GROUND-14,t:rng()*6,got:false});}
  {const issue=String(chapter.issue).padStart(2,'0');let pool=Object.keys(PAGE_FILES).filter(id=>id.startsWith('I'+issue));if(!pool.length)pool=Object.keys(PAGE_FILES);const fresh=pool.filter(id=>!SAVE.pages[id]);const use=(fresh.length?fresh:pool);const high=S.plats.slice().filter(p=>p.x>300&&p.x<L-400).sort((a,b)=>a.y-b.y).slice(0,2);high.forEach((p,i)=>{const pid=use[(Math.floor(rng()*use.length)+i)%use.length];S.items.push({type:'page',pid,x:p.x+p.w/2,y:p.y-14,t:0,got:false});});}
  if(chapter.collect){for(let i=0;i<chapter.collect.need;i++){let cx=L*(i+1)/(chapter.collect.need+1);let guard=0;while(guard++<40&&S.pits.some(p=>cx>p[0]-60&&cx<p[1]+60))cx+=70;S.items.push({type:chapter.collect.item,x:cx,y:GROUND-14,t:0,got:false,big:true});}}
  for(let cx=900;cx<L-600;cx+=900){let x=cx,guard=0;while(guard++<60&&S.pits.some(p=>x>p[0]-70&&x<p[1]+70))x+=40;S.checkpoints.push({x,hit:false});}
  S.gateX=L-180;
 }
 function makeEnemy(type,x){const d=ENEMY_TYPES[type];return {type,d,x,y:d.fly?GROUND-150-Math.random()*60:GROUND,hp:Math.max(1,Math.round(d.hp*diff.enemyHP)),dir:-1,x0:x,step:0,timer:Math.random()*2,flash:0,dead:false,deadT:0,stun:0,baseY:GROUND-150,alert:false,hurtT:0};}
 function groundAt(x){if(S.pits.some(p=>x>p[0]&&x<p[1]))return 9999;return GROUND;}
 function platUnder(x,y,vy){for(const p of S.plats){if(x>p.x-6&&x<p.x+p.w+6&&vy>=0&&y>=p.y-2&&y<=p.y+18)return p;}return null;}
 const mods=()=>({speed:1+P.speedBonus+(h.power==='gear'?.2:0),dmg:(hero.damage+P.dmgBonus)*(h.power==='superbong'?2:1),fireRate:hero.fireRate*(h.power==='gear'?.7:1)});
 S.enter=function(){Audio.playTrack(chapter.music||'street');S.cam=0;};
 function hurtHero(dmg,dir=1){
  if(h.inv>0||h.dead||h.rush>0)return;
  if(h.kevlar){h.kevlar=false;h.inv=1.2;comicWord('NAN’S KEVLAR!',sx(h.x),sy(h.y-110),TEAL,30);Audio.sfx('block');return;}
  h.hp-=Math.max(1,Math.round(dmg*diff.dmg));h.inv=1.3;h.hurtT=.35;h.vx=dir*220;h.vy=-260;h.onGround=false;Audio.sfx('hurt');shake(6);burst(h.x,h.y-40,RED,8);comicWord(pick(['OOF','ARGH','FUCK','OW']),sx(h.x)+rnd(-30,30),sy(h.y-120),RED,34);
  if(h.hp<=0)killHero();
 }
 function killHero(){h.dead=true;h.deadT=0;h.vy=-400;Audio.sfx('die');comicWord(pick(['COOKED','DEAD','RIP']),sx(h.x),sy(h.y-120),RED,46);S.crimes++;}
 function respawn(){h.lives--;if(h.lives<=0){h.lives=0;S.gameOver=true;S.endT=0;S.goLine=pick(['The bank sent a bloke.','Weasel would like it noted that he said this would happen.','Robbie laughed. Then he rewound it. Then he laughed again.','Borkmaster has added the funeral to your tab.']);Audio.sfx('lose');Audio.stopMusic();return;}
  const cp=[...S.checkpoints].reverse().find(c=>c.hit);h.x=cp?cp.x:120;{let g=0;while(g++<80&&S.pits.some(p=>h.x>p[0]-40&&h.x<p[1]+40))h.x+=20;}h.y=GROUND;h.vx=h.vy=0;h.hp=h.maxHp;h.dead=false;h.inv=2;h.kevlar=P.kevlar;h.power=null;h.pit=null;h.dropT=0;h.coyote=0;h.wallT=0;S.eshots=[];S.ents.forEach(e=>{if(!e.dead&&Math.abs(e.x-h.x)<500){let nx=e.x+420,g=0;while(g++<40&&S.pits.some(p=>nx>p[0]-40&&nx<p[1]+40))nx+=40;e.x=Math.min(nx,L-200);e.x0=e.x;}});}
 function spawnShot(x,y,vx,vy,dmg,owner='hero',kind='bolt'){(owner==='hero'?S.shots:S.eshots).push({x,y,vx,vy,dmg,t:0,kind});}
 function addScore(n){S.score+=Math.round(n*(S.combo>1?1+S.combo*.1:1));}
 function ledger(kind,x,y){const txt=pick(LEDGER_LINES[kind]);floater(txt,x,y-60,kind==='deed'?TEAL:RED,15);if(kind==='deed')S.deeds++;else S.crimes++;}
 S.autoPause=function(){if(!S.paused&&!S.gameOver&&!S.won){S.paused=true;S.pauseSel=0;}};
 S.update=function(dt){if(S.done)return;if(S.pageToast){S.pageToast.t+=dt;if(S.pageToast.t>3.6)S.pageToast=null;}if(S.cashPop){S.cashPop.t+=dt;if(S.cashPop.t>.9)S.cashPop=null;}if(S.help){S.help.t+=dt;if(S.help.t>6||(S.help.t>1&&(Input.hit('confirm')||Input.hit('click'))))S.help=null;}
  if(S.paused){if(Input.hit('pause')||Input.hit('back')){S.paused=false;Audio.resume();}if(Input.hit('down'))S.pauseSel=(S.pauseSel+1)%3;if(Input.hit('up'))S.pauseSel=(S.pauseSel+2)%3;if(Input.hit('confirm')||Input.hit('jump')){if(S.pauseSel===0)S.paused=false;else if(S.pauseSel===1){S.done=true;S.onDone({result:'retry'});}else{S.done=true;S.onDone({result:'quit'});}}return;}
  if(S.gameOver){S.endT+=dt;if(S.endT>1.2&&(Input.hit('confirm')||Input.hit('jump')||Input.hit('attack'))){S.done=true;S.onDone({result:'dead',score:S.score});}return;}
  if(S.won){S.endT+=dt;if(S.endT>1.6){S.done=true;S.onDone({result:'win',score:S.score,xp:S.xp,cash:S.cash,pages:S.pagesFound,deeds:S.deeds,crimes:S.crimes,kills:S.kills,lives:h.lives,collected:S.collected});}return;}
  if(Input.hit('pause')){S.paused=true;S.pauseSel=0;return;}
  S.t+=dt;const M=mods();
  // ---- hero ----
  if(h.dead){h.deadT+=dt;h.vy+=GRAV*dt;h.y+=h.vy*dt;if(h.deadT>1.6)respawn();}
  else{
   h.inv=Math.max(0,h.inv-dt);h.hurtT=Math.max(0,h.hurtT-dt);h.fireT=Math.max(0,h.fireT-dt);h.shootT=Math.max(0,h.shootT-dt);
   if(h.power){h.powerT-=dt;if(h.powerT<=0){h.power=null;floater('POWER GONE',h.x,h.y-80,PAPER,14);}}
   h.special=Math.min(1,h.special+dt/(6/(1+P.specialBonus)));
   const LH=Input.held('left'),R=Input.held('right'),U=Input.held('up'),D=Input.held('down');
   h.crouch=D&&h.onGround&&h.rush<=0;h.aimUp=U&&!h.crouch;
   const spd=hero.speed*M.speed*(h.crouch?.45:1);
   if(h.rush>0){h.rush-=dt;h.vx=h.dir*620;if(G.frame%3===0)burst(h.x,h.y-40,AMBER,2,60,.3,5,0);}
   else if(h.hurtT<=0){if(LH){h.vx=-spd;h.dir=-1;}else if(R){h.vx=spd;h.dir=1;}else h.vx=0;}
   else h.vx*=.9;
   // jump
   const maxJumps=run.char==='weasel'?2:1;
   if(Input.hit('jump')&&h.rush<=0){
    if((h.onGround||h.coyote>0)&&D&&(h.onGround?platUnder(h.x,h.y,1):null)){h.dropT=.22;h.onGround=false;h.coyote=0;h.jumps=1;h.y+=6;}
     else if(h.onGround||h.coyote>0){h.vy=-JUMPV;h.onGround=false;h.coyote=0;h.jumps=1;Audio.sfx('jump');}
    else if(h.wallT>0&&run.char==='weasel'){h.vy=-JUMPV*.95;h.vx=-h.wallDir*320;h.dir=-h.wallDir;h.jumps=1;h.wallT=0;Audio.sfx('jump');burst(h.x,h.y-30,PAPER,6,120,.3,3,0);}
    else if(h.jumps<maxJumps){h.vy=-JUMPV*.85;h.jumps++;Audio.sfx('jump');burst(h.x,h.y,TEAL,8,120,.35,3,0);comicWord('BOING',sx(h.x),sy(h.y-90),TEAL,22);}
   }
   if(Input.released.jump&&h.vy<-150)h.vy=-150;
   // special
   if(Input.hit('special')&&h.special>=1&&h.rush<=0){h.special=0;Audio.sfx('special');
    if(run.char==='turbo'){h.rush=.55*(1+P.specialLen);comicWord('BULL RUSH!',sx(h.x),sy(h.y-130),AMBER,36);shake(4);}
    else{h.hack=1;comicWord('SYSTEM HACK!',sx(h.x),sy(h.y-130),TEAL,36);flash(TEAL,.4);S.ents.forEach(e=>{if(!e.dead&&Math.abs(e.x-h.x)<560){e.stun=2.2*(1+P.specialLen);if(e.d.fly||e.type==='monk')hitEnemy(e,3,0);}});S.eshots=[];}
   }
   // shoot
   if(Input.held('attack')&&h.fireT<=0&&h.rush<=0){h.fireT=M.fireRate;h.shootT=.15;Audio.sfx('shoot');
    const oy=h.crouch?-28:-56;const spread=h.power==='superbong';
    const dirs=h.aimUp?[[0,-1]]:spread?[[1,0],[1,-.2],[1,.2]]:[[1,0]];
    dirs.forEach(([dx,dy])=>spawnShot(h.x+h.dir*20,h.y+oy-(h.aimUp?30:0),h.aimUp?0:h.dir*640,h.aimUp?-640:dy*640,M.dmg));
    burst(h.x+h.dir*28,h.y+oy,AMBER,3,80,.15,3,0);
   }
   // physics
   h.vy+=GRAV*lowG*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.x=clamp(h.x,16,L-30);
    if(h.pit&&h.y>GROUND+6)h.x=clamp(h.x,h.pit[0]+10,h.pit[1]-10);else h.pit=null;
    if(!h.pit&&h.y>GROUND+6&&!platUnder(h.x,h.y,h.vy))h.pit=S.pits.find(p=>h.x>p[0]&&h.x<p[1])||null;
    h.dropT=Math.max(0,h.dropT-dt);const wasGround=h.onGround;
   const gy=groundAt(h.x);const pl=h.dropT>0?null:platUnder(h.x,h.y,h.vy);
   h.onGround=false;h.wallT=Math.max(0,h.wallT-dt);
   if(pl){h.y=pl.y;h.vy=0;h.onGround=true;h.jumps=0;if(pl.moving)h.x+=pl.vx||0;}
   else if(h.y>=gy&&h.y<=gy+30&&gy<9000){h.y=gy;h.vy=0;h.onGround=true;h.jumps=0;}
    h.coyote=h.onGround?.1:(wasGround&&h.vy>=0?.1:Math.max(0,h.coyote-dt));
   // wall kick: next to a platform's side while airborne
   if(!h.onGround&&run.char==='weasel'){for(const p of S.plats){if(h.y>p.y+10&&h.y<p.y+90){if(Math.abs(h.x-(p.x-4))<12&&R){h.wallT=.25;h.wallDir=1;h.vy=Math.min(h.vy,60);}if(Math.abs(h.x-(p.x+p.w+4))<12&&LH){h.wallT=.25;h.wallDir=-1;h.vy=Math.min(h.vy,60);}}}}
   if(h.y>H+80&&!h.dead){h.hp=0;comicWord('PITFALL!',sx(h.x),H-120,RED,40);killHero();}
   if(h.vx!==0&&h.onGround)h.step+=dt*9;
   // checkpoints
   for(const c of S.checkpoints)if(!c.hit&&h.x>c.x){c.hit=true;floater('CHECKPOINT · SAVED',h.x,h.y-90,TEAL,16);Audio.sfx('select');}
   // banter
   const prog=h.x/L;const thresholds=[.2,.45,.7];if(S.banterIdx<thresholds.length&&prog>thresholds[S.banterIdx]){const lines=BANTER[chapter.theme]||BANTER.street;S.bubble=lines[(S.banterIdx*2+chapter.n)%lines.length];S.bubbleT=4;S.banterIdx++;}
   if(S.bubbleT>0)S.bubbleT-=dt;
   // gate
   if(h.x>S.gateX&&!S.won){if(chapter.collect&&S.collected<chapter.collect.need){if(G.frame%90===0)floater(`NEED ${chapter.collect.need-S.collected} MORE ${chapter.collect.label} · GO BACK ←`,h.x,h.y-100,AMBER,16);h.x=S.gateX-2;}
    else{S.won=true;S.endT=0;Audio.sfx('win');comicWord('GATE OPEN!',W/2,H/2-60,'#f7d96a',52);}}
  }
  // camera
  const target=h.x-VW*(h.dir<0?.6:.4);S.cam=clamp(lerp(S.cam,target,.12),0,L-VW);
  const ty=h.y<CAMY0+150?clamp(h.y-170,CAMY0-220,CAMY0):CAMY0;S.camY=lerp(S.camY,ty,.08);
  // ---- moving platforms ----
  for(const p of S.plats)if(p.moving){p.moving.t+=dt;const ny=p.baseY===undefined?(p.baseY=p.y):p.baseY+Math.sin(p.moving.t)*p.moving.dy;p.vy=ny-p.y;p.y=ny;}
  // ---- hazards ----
  for(const z of S.hazards){z.t+=dt;const d=Math.abs(z.x-h.x);
   if(z.type==='keg'){if(!z.rolling&&d<520&&z.t>=0&&Math.abs(h.x-(z.x+260))>90){z.rolling=true;z.rx=z.x+260;z.rv=-170*diff.enemySpeed;}if(z.rolling){z.rx+=z.rv*dt;if(groundAt(z.rx)>9000||z.rx<S.cam-200){z.rolling=false;z.rx=undefined;z.t=-3;}else if(Math.abs(z.rx-h.x)<26&&h.y>GROUND-40&&!h.crouch)hurtHero(1,Math.sign(h.x-z.rx)||1);}}
   else{z.on=(z.t%3)>1.7;if(z.on&&d<22&&h.y>GROUND-80)hurtHero(1,h.dir*-1);}
  }
  // ---- enemies ----
  for(const e of S.ents){
   if(e.dead){e.deadT+=dt;continue;}
   e.flash=Math.max(0,e.flash-dt);e.hurtT=Math.max(0,e.hurtT-dt);if(Math.abs(e.x-h.x)>VW*.9)continue;
   if(e.stun>0){e.stun-=dt;if(G.frame%6===0)burst(e.x,e.y-50,TEAL,1,40,.3,3,0);continue;}
   const dx=h.x-e.x;const d=e.d;const sp=d.speed*diff.enemySpeed;
   if(!e.alert){if(Math.abs(dx)<(d.shoot?420:360)||e.hurtT>0||e.flash>0){e.alert=true;e.timer=Math.max(e.timer,.5);}else{if(!d.fly&&!d.float){e.pt=(e.pt||0)+dt;if(e.pt>2.2){e.pt=0;e.dir*=-1;}const ahead=e.x+e.dir*24;if(groundAt(ahead)<9000&&Math.abs(e.x-e.x0)<160)e.x+=e.dir*sp*.35*dt;else e.dir*=-1;e.step+=dt*3;}continue;}}
   e.dir=dx<0?-1:1;
   e.timer-=dt;
   if(d.fly){e.baseY=lerp(e.baseY,h.y-140,.02);e.y=e.baseY+Math.sin(S.t*3+e.x)*20;e.x+=Math.sign(dx)*sp*dt*(Math.abs(dx)>160?1:-.5);}
   else if(d.float){e.y=GROUND-30+Math.sin(S.t*2+e.x)*18;if(Math.abs(dx)>220)e.x+=Math.sign(dx)*sp*dt;}
   else{const ahead=e.x+Math.sign(dx)*20;const canWalk=groundAt(ahead)<9000;if(Math.abs(dx)>(d.shoot?260:34)&&canWalk){e.x+=Math.sign(dx)*sp*dt;e.step+=dt*6;}else if(d.melee&&Math.abs(dx)<40&&e.timer<=0){e.timer=1.1/diff.enemySpeed;e.attackT=.3;if(Math.abs(h.y-e.y)<60)hurtHero(1,Math.sign(dx));}}
   if(d.shoot&&e.timer<=0&&Math.abs(dx)<620){e.timer=d.shoot.rate*diff.enemyRate*(.8+Math.random()*.4);e.attackT=.3;const ang=Math.atan2((h.y-50)-(e.y-45),dx);const sp2=d.shoot.speed*diff.enemySpeed;spawnShot(e.x+e.dir*18,e.y-45,Math.cos(ang)*sp2,Math.sin(ang)*sp2,1,'enemy',d.shoot.orb?'orb':'bolt');Audio.sfx('shoot');}
   if(e.attackT>0)e.attackT-=dt;
   // contact
   if(!h.dead&&Math.abs(dx)<(d.w/2+14)&&h.y>e.y-d.h&&h.y-60<e.y){if(h.rush>0){hitEnemy(e,4,h.dir);}else if(!d.melee||e.attackT>0)hurtHero(1,Math.sign(dx)||1);}
  }
  // ---- projectiles ----
  for(const s of S.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.t+=dt;
   for(const e of S.ents){if(e.dead||Math.abs(s.x-e.x)>e.d.w/2+8||s.y<e.y-e.d.h||s.y>e.y+6)continue;
    if(e.d.shield&&Math.sign(s.vx)===-e.dir&&s.y<e.y-30){s.t=99;burst(s.x,s.y,'#9aaec1',4,80,.2,3,0);Audio.sfx('block');floater('SHIELD · GO LOW',e.x,e.y-90,'#9aaec1',13);break;}
    hitEnemy(e,s.dmg,Math.sign(s.vx)||1);s.t=99;break;}
  }
  S.shots=S.shots.filter(s=>s.t<1.4&&s.x>S.cam-50&&s.x<S.cam+VW+50);
  for(const s of S.eshots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.t+=dt;if(!h.dead&&Math.abs(s.x-h.x)<16&&s.y>h.y-(h.crouch?40:66)&&s.y<h.y){hurtHero(s.kind==='orb'?2:1,Math.sign(s.vx)||1);s.t=99;}if(s.y>GROUND)s.t=99;}
  S.eshots=S.eshots.filter(s=>s.t<2.5);
  // ---- items ----
  for(const it of S.items){if(it.got)continue;it.t+=dt;if(Math.abs(it.x-h.x)<26&&Math.abs(it.y-(h.y-30))<40&&!h.dead){it.got=true;collect(it);}}
  // tram easter egg (street only)
  if(chapter.theme==='street'&&!S.tram&&chance(.0003)&&!S.tramSeen){S.tramSeen=true;S.tram={x:S.cam+VW+100,t:0};floater(EGGS.tram,h.x,h.y-120,'#f7d96a',14);}
  if(S.tram){S.tram.x-=260*dt;if(S.tram.x<S.cam-500)S.tram=null;}
  updateFx();
 };
 function hitEnemy(e,dmg,dir){e.hp-=dmg;e.flash=.12;e.hurtT=.25;hitstop(.03);burst(e.x,e.y-40,pick([AMBER,PAPER,RED]),6,160,.35,4);
  if(e.hp<=0){e.dead=true;e.deadT=0;S.kills++;addScore(e.d.score);S.xp+=Math.round(e.d.xp*diff.xp);Audio.sfx('explode');shake(3);comicWord(pick(['WHACK','KRAK','SMACK','DONE','BIFF','POW']),sx(e.x),sy(e.y-90),pick([AMBER,RED,'#f7d96a']),36);burst(e.x,e.y-40,RED,14,220,.6,5);
   if(chance(e.d.drops+P.luck)){S.items.push({type:pick(['cash','slab','gear','cone']),x:e.x,y:e.y-14,t:0,got:false});}
   if(chance(.35))ledger(chance(.5)?'deed':'crime',e.x,e.y);
  }else Audio.sfx('hit');}
 function collect(it){
  switch(it.type){
   case 'cash':{const n=Math.round(20+Math.random()*40);S.cash+=n;addScore(50);floater('+$'+n,it.x,it.y-10,'#8fd18f',22);S.cashPop={n,t:0};Audio.sfx('cash');if(!SAVE.seenCashHelp){SAVE.seenCashHelp=true;save();S.help={t:0,title:'HOW CASH WORKS',lines:['Cash goes in ya WALLET (top right): what\'s banked plus this chapter\'s haul.','It banks when the chapter is done. Lose ALL your lives first and the chapter\'s haul is gone.','Spend it at BORK\'S BAR after each chapter (perks) or at LUCIFER\'S for scooter parts.','Short? Bork puts it on the TAB. Open tab = dearer prices. Pay it down when you can.']};}break;}
   case 'slab':h.hp=Math.min(h.maxHp,h.hp+2);floater('SLAB · +2',it.x,it.y,TEAL);Audio.sfx('pickup');break;
   case 'cone':h.special=1;S.xp+=4;floater('CONE · SPECIAL READY',it.x,it.y,'#98ef87');Audio.sfx('cone');break;
   case 'billy':h.hp=Math.min(h.maxHp,h.hp+2);h.special=1;S.xp+=12;S.score+=150;comicWord('RIIIIP',sx(it.x),sy(it.y-70),'#98ef87',40);floater(pick(['GLASS BILLY · FULL CONE','SHAZZA’S BILLY · +2 · SPECIAL','BONG WATER’S FRESH FOR ONCE']),it.x,it.y,'#98ef87',15);Audio.sfx('cone');flash('#98ef87',.25);shake(2);break;
   case 'gear':h.power=chance(.5)?'superbong':'gear';h.powerT=12;floater(h.power==='superbong'?'SUPER BONG · DOUBLE DAMAGE':'BAG OF GEAR · SPEED',it.x,it.y,AMBER,16);Audio.sfx('level');flash(h.power==='superbong'?'#98ef87':AMBER,.35);break;
   case 'deed':ledger('deed',it.x,it.y);addScore(200);Audio.sfx('select');break;
   case 'page':{const fresh=!SAVE.pages[it.pid];SAVE.pages[it.pid]=true;save();S.pagesFound++;const n=Math.round(fresh?80:30);S.cash+=n;S.xp+=fresh?25:5;addScore(fresh?800:200);S.pageToast={id:it.pid,t:0,fresh};comicWord(fresh?'PAGE FOUND!':'DUPLICATE PAGE',sx(it.x),sy(it.y-70),'#f7d96a',38);S.cashPop={n,t:0};Audio.sfx('page');Audio.sfx('level');flash('#f7d96a',.2);break;}
   default:S.collected++;addScore(500);S.xp+=15;flash('#f7d96a',.25);shake(4);comicWord((chapter.collect.singular||chapter.collect.label.replace(/S$/,''))+' '+S.collected+'/'+chapter.collect.need,sx(it.x),sy(it.y-60),'#f7d96a',30);Audio.sfx('level');
  }
 }
 /* ---------- drawing ---------- */
 S.draw=function(c){
  const col=S.col;const cam=S.cam;const camY=S.camY;const groundScr=(GROUND-camY)*ZOOM;
  drawSky(c,chapter.theme,groundScr,S.t);
  drawPanorama(c,chapter.theme,cam*ZOOM,{groundY:480,oy:groundScr-480,parallax:.5,filter:chapter.theme==='glitch'?'hue-rotate(40deg) saturate(1.3)':undefined});
  drawChapterLandmarks(c, chapter, cam * ZOOM, groundScr);
  // distance haze so the backdrop sits behind the action
  {const hz=c.createLinearGradient(0,groundScr-260,0,groundScr);hz.addColorStop(0,'rgba(0,0,0,0)');hz.addColorStop(1,hexA((SKY[chapter.theme]||SKY.street)[2],.2));c.fillStyle=hz;c.fillRect(0,groundScr-260,W,260);}
  if(chapter.theme==='glitch'){c.fillStyle='rgba(60,40,120,.28)';c.fillRect(0,0,W,H);if(G.frame%47<3){c.fillStyle='rgba(255,255,255,.08)';c.fillRect(0,rnd(H),W,rnd(10,40));}}
  // ---- world (zoomed) ----
  c.save();c.scale(ZOOM,ZOOM);c.translate(-cam,-camY);
  // tram
  if(S.tram){const tx=S.tram.x;c.fillStyle='#2f7a4a';c.fillRect(tx,GROUND-150,420,90);c.fillStyle='#f4e6ca';for(let i=0;i<7;i++)c.fillRect(tx+14+i*58,GROUND-140,44,40);text(c,'109',tx+16,GROUND-66,{size:18,col:'#f7d96a',font:FONT_TITLE,weight:'400'});c.strokeStyle=INK;c.lineWidth=4;c.strokeRect(tx,GROUND-150,420,90);}
  // ground
  const GB=camY+VH+40;// bottom of the visible world
  for(const [a,b] of S.ground)drawGround(c,a,b,GB);
  for(const [a,b] of S.pits){c.fillStyle='#000';c.fillRect(a,GROUND+10,b-a,GB-GROUND);c.fillStyle=INK;c.fillRect(a-4,GROUND-2,6,GB-GROUND);c.fillRect(b-2,GROUND-2,6,GB-GROUND);const lbl=chapter.theme==='street'?'OPEN DRAIN':chapter.theme==='moon'?'CHASM':'VOID';text(c,lbl,(a+b)/2,GROUND+50,{size:11,col:'rgba(244,230,202,.5)',align:'center'});}
  for(const p of S.plats){c.fillStyle=INK;c.fillRect(p.x-3,p.y-3,p.w+6,p.h+6);c.fillStyle=col.plat;c.fillRect(p.x,p.y,p.w,p.h);c.fillStyle=col.platTop;c.fillRect(p.x,p.y,p.w,6);if(p.moving){c.fillStyle='rgba(0,0,0,.3)';c.fillRect(p.x+p.w/2-2,p.y+p.h,4,GROUND-p.y-p.h);}
   if(chapter.theme==='street'){c.fillStyle=col.accent;for(let x=p.x;x<p.x+p.w;x+=24)c.fillRect(x,p.y-8,12,8);}}
  // hazards
  for(const z of S.hazards){
   if(z.type==='keg'){if(z.rolling){c.save();c.translate(z.rx,GROUND-18);c.rotate(z.rx*.05);c.fillStyle='#9aa3a8';c.fillRect(-18,-18,36,36);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(-18,-18,36,36);c.fillStyle=INK;c.fillRect(-18,-6,36,4);c.fillRect(-18,2,36,4);c.restore();}
    else{c.fillStyle='#6b5a3a';c.fillRect(z.x+230,GROUND-40,60,40);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(z.x+230,GROUND-40,60,40);text(c,'KEGS',z.x+260,GROUND-14,{size:12,col:PAPER,align:'center'});}}
   else{const on=z.on;const colz={glitch:VIOLET,vent:'#ff8a3a',laser:'#ff4040',rock:'#c05a3a',crusher:'#9aaec1'}[z.type]||RED;
    c.fillStyle=INK;c.fillRect(z.x-16,GROUND-6,32,8);
    if(z.type==='crusher'){const yy=on?GROUND-70:GROUND-230;c.fillStyle='#55606e';c.fillRect(z.x-24,yy-120,48,120);c.fillStyle=INK;c.fillRect(z.x-26,yy-4,52,8);}
    else if(on){c.fillStyle=colz;const hh=z.type==='laser'?230:90+Math.sin(S.t*30)*20;c.fillRect(z.x-8,GROUND-hh,16,hh);c.globalAlpha=.4;c.fillRect(z.x-16,GROUND-hh,32,hh);c.globalAlpha=1;}
    else{c.fillStyle=colz;c.globalAlpha=.5+Math.sin(z.t*8)*.3;c.fillRect(z.x-10,GROUND-8,20,6);c.globalAlpha=1;}}
  }
  // checkpoints & gate
  for(const cp of S.checkpoints){c.fillStyle=INK;c.fillRect(cp.x-3,GROUND-120,6,120);c.fillStyle=cp.hit?TEAL:'#777';c.fillRect(cp.x,GROUND-120,44,28);text(c,cp.hit?'SAVED':'FLAG',cp.x+22,GROUND-100,{size:12,col:INK,align:'center',base:'middle'});}
  {const gx=S.gateX;c.fillStyle=INK;c.fillRect(gx-6,GROUND-170,12,170);c.fillRect(gx+80,GROUND-170,12,170);c.fillRect(gx-6,GROUND-180,98,14);const open=S.won||!chapter.collect||S.collected>=chapter.collect.need;c.fillStyle=open?'#f7d96a':'#6b6459';c.fillRect(gx+6,GROUND-166,74,166);text(c,open?(chapter.boss?'BOSS':'EXIT'):'LOCKED',gx+43,GROUND-80,{size:18,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});}
  // items
  for(const it of S.items){if(it.got)continue;const bob=Math.sin(it.t*4)*4;dropShadow(c,it.x,it.y+12,10,.25);drawItem(c,it,bob);}
  // enemies
  for(const e of S.ents){if(e.dead){if(e.deadT<.5){c.globalAlpha=1-e.deadT*2;drawEnemy(c,e,true);c.globalAlpha=1;}continue;}if(!e.d.fly)dropShadow(c,e.x,GROUND,e.d.w*.6);drawEnemy(c,e,false);}
  // hero
  {const gy=groundAt(h.x);if(gy<9000)dropShadow(c,h.x,gy,Math.max(10,22-(gy-h.y)*.06),.35);}
  if(!h.dead)drawHero(c,run.char,h.x,h.y,{dir:h.dir,moving:Math.abs(h.vx)>10&&h.onGround,step:h.step,crouch:h.crouch,air:!h.onGround,aimUp:h.aimUp,shoot:h.shootT>0,inv:h.inv,hurt:h.hurtT>0,tint:h.power==='superbong'?'hue-rotate(-30deg) saturate(2) brightness(1.1)':undefined});
  else drawHero(c,run.char,h.x,h.y,{dir:h.dir,hurt:true,scale:1});
  if(h.rush>0){c.globalAlpha=.5;for(let i=1;i<4;i++)drawHero(c,run.char,h.x-h.dir*i*18,h.y,{dir:h.dir,moving:true,step:h.step});c.globalAlpha=1;}
  // shots
  for(const s of S.shots){c.fillStyle=run.char==='turbo'?AMBER:TEAL;c.fillRect(s.x-8,s.y-3,16,6);c.fillStyle=PAPER;c.fillRect(s.x-3,s.y-1,6,2);}
  for(const s of S.eshots){c.fillStyle=s.kind==='orb'?VIOLET:RED;c.beginPath();c.arc(s.x,s.y,s.kind==='orb'?9:5,0,Math.PI*2);c.fill();c.strokeStyle=INK;c.lineWidth=2;c.stroke();}
  drawFx(c,0);drawFloaters(c,0);
  c.restore();
  drawForeground(c);
  colourGrade(c,chapter.theme);
  // arrow to a missed required pickup (only once you're past it)
  if(chapter.collect&&S.collected<chapter.collect.need){const missed=S.items.filter(it=>it.big&&!it.got&&it.x<h.x-VW*.3);if(missed.length){const m=missed[missed.length-1];const bob=Math.sin(S.t*6)*6;const ax=40+bob,ay=sy(h.y-150);c.save();c.fillStyle='#f7d96a';c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.moveTo(ax,ay);c.lineTo(ax+34,ay-22);c.lineTo(ax+34,ay-8);c.lineTo(ax+90,ay-8);c.lineTo(ax+90,ay+8);c.lineTo(ax+34,ay+8);c.lineTo(ax+34,ay+22);c.closePath();c.fill();c.stroke();c.restore();text(c,'MISSED A '+(chapter.collect.singular||chapter.collect.label.replace(/S$/,'')),ax+48,ay+26,{size:13,font:FONT_COMIC,weight:'400',col:'#f7d96a',stroke:3,align:'center',base:'middle'});}}
  // banter bubble
  if(S.bubbleT>0&&S.bubble){const [spk,txt]=S.bubble;const font=`400 18px ${FONT_HAND}`;const lines=wrapText(c,txt,300,font);const bw=Math.min(340,Math.max(...lines.map(l=>{c.font=font;return c.measureText(l).width;}))+36),bh=lines.length*22+30;let bx=clamp(sx(h.x)-bw/2,10,W-bw-10),by=clamp(sy(h.y-120)-bh,70,H-bh-80);bubble(c,bx,by,bw,bh,sx(h.x),sy(h.y-80),'speech');c.font=`800 13px ${FONT_UI}`;const tw=c.measureText(spk).width+18;c.fillStyle=SPEAKER_COL[spk]||PAPER;c.fillRect(bx+10,by-9,tw,18);c.strokeStyle=INK;c.lineWidth=2;c.strokeRect(bx+10,by-9,tw,18);text(c,spk,bx+19,by,{size:13,col:INK,base:'middle'});lines.forEach((l,i)=>text(c,l,bx+bw/2,by+22+i*22,{size:18,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));}
  drawHUD(c);
  if(S.paused)drawPause(c);
  if(S.gameOver)drawGameOver(c);
  if(S.won){c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,0,W,H);text(c,chapter.boss?'BOSS AHEAD':'CHAPTER CLEAR',W/2,H/2,{size:64,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:8});}
 };
 // Themed ground: road + bluestone kerb for Richmond, plating for space, rock for the moon.
 function drawGround(c,a,b,GB){
  const th=chapter.theme,col=S.col;c.fillStyle=col.ground;c.fillRect(a,GROUND,b-a,GB-GROUND);
  c.fillStyle=col.top;c.fillRect(a,GROUND,b-a,10);c.fillStyle=INK;c.fillRect(a,GROUND-2,b-a,4);
  if(th==='street'||th==='glitch'){// kerb, gutter, asphalt with painted line
   c.fillStyle='#5a5550';c.fillRect(a,GROUND+10,b-a,8);c.fillStyle='#2a2522';c.fillRect(a,GROUND+18,b-a,GB-GROUND-18);
   c.fillStyle='rgba(255,255,255,.08)';for(let x=a;x<b;x+=38)c.fillRect(x,GROUND+10,34,8);
   c.fillStyle='rgba(247,217,106,.55)';for(let x=a+20;x<b;x+=90)c.fillRect(x,GROUND+46,44,4);
   c.fillStyle='rgba(0,0,0,.35)';for(let x=a+6;x<b;x+=64)c.fillRect(x+((x/64)%2)*20,GROUND+26+((x/64)%3)*9,22,3);
  }else if(th==='space'||th==='isa'||th==='ship'){// deck plating with rivets and a light strip
   c.fillStyle='rgba(255,255,255,.06)';for(let x=a;x<b;x+=80)c.fillRect(x,GROUND+10,78,GB-GROUND-10);c.fillStyle='rgba(0,0,0,.5)';for(let x=a;x<b;x+=80)c.fillRect(x+78,GROUND+10,2,GB-GROUND-10);
   c.fillStyle=col.accent;c.globalAlpha=.5+Math.sin(S.t*3)*.2;c.fillRect(a,GROUND+28,b-a,3);c.globalAlpha=1;
   c.fillStyle='rgba(255,255,255,.25)';for(let x=a+8;x<b;x+=40){c.fillRect(x,GROUND+16,3,3);c.fillRect(x,GROUND+44,3,3);}
  }else{// moon: cracked red rock
   c.fillStyle='rgba(0,0,0,.35)';for(let x=a+10;x<b;x+=52){c.fillRect(x,GROUND+14+((x/52)%4)*7,30,3);c.fillRect(x+18,GROUND+22+((x/52)%3)*11,3,14);}
   c.fillStyle='rgba(255,106,74,.18)';for(let x=a+30;x<b;x+=130)c.fillRect(x,GROUND+10,6,GB-GROUND);
  }
 }
 // Foreground clutter in front of the action (parallax > 1): bins, bollards, poles. Kept low so it never hides the hero.
 function drawForeground(c){
  const th=chapter.theme;const par=1.35;const base=(GROUND-S.camY)*ZOOM;const r=seeded(chapter.n*31);const items=[];for(let i=0;i<40;i++)items.push({x:i*520+r()*300,k:Math.floor(r()*4)});
  c.save();c.globalAlpha=.92;c.fillStyle='#0c1114';
  for(const it of items){const x=(it.x-S.cam*par)%(40*520);const X=x-200;if(X<-120||X>W+120)continue;
   if(th==='street'||th==='glitch'){
    if(it.k===0){roundRect(c,X,base-8,44,54,6);c.fill();c.fillRect(X-4,base-14,52,8);}// wheelie bin
    else if(it.k===1){c.fillRect(X,base-30,10,80);c.beginPath();c.arc(X+5,base-34,9,0,7);c.fill();}// bollard
    else if(it.k===2){c.fillRect(X,base-20,70,8);c.fillRect(X+4,base-12,8,40);c.fillRect(X+58,base-12,8,40);}// milk crate / bench
    else{c.fillRect(X,base-2,56,34);c.fillRect(X+8,base-10,40,8);}// slab carton
   }else if(th==='moon'){c.beginPath();c.moveTo(X,base+30);c.lineTo(X+30+it.k*10,base-22-it.k*8);c.lineTo(X+70+it.k*14,base+30);c.closePath();c.fill();}
   else{c.fillRect(X,base-6,12+it.k*6,50);c.fillRect(X-6,base-12,24+it.k*6,8);}
  }
  c.restore();
 }
 function drawItem(c,it,bob){const x=it.x,y=it.y+bob;c.save();c.translate(x,y);c.lineWidth=2.5;c.strokeStyle=INK;
  switch(it.type){
   case 'cash':c.fillStyle='#8fd18f';c.fillRect(-14,-9,28,18);c.strokeRect(-14,-9,28,18);text(c,'$',0,1,{size:16,col:INK,align:'center',base:'middle',font:FONT_TITLE,weight:'400'});break;
   case 'slab':c.fillStyle='#de755f';c.fillRect(-16,-10,32,20);c.strokeRect(-16,-10,32,20);c.fillStyle=PAPER;c.fillRect(-12,-6,24,5);text(c,'VB',0,5,{size:10,col:INK,align:'center',base:'middle'});break;
   case 'cone':c.fillStyle='#98ef87';c.beginPath();c.moveTo(-8,10);c.lineTo(8,10);c.lineTo(3,-12);c.lineTo(-3,-12);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.arc(0,-18-Math.sin(it.t*5)*3,4,0,7);c.fill();break;
   case 'gear':c.fillStyle='#f8d38a';roundRect(c,-13,-12,26,24,5);c.fill();c.stroke();text(c,'?',0,2,{size:18,col:INK,align:'center',base:'middle',font:FONT_TITLE,weight:'400'});break;
   case 'billy':c.fillStyle='rgba(120,220,200,.85)';c.beginPath();c.moveTo(-9,10);c.lineTo(9,10);c.lineTo(7,-6);c.lineTo(4,-8);c.lineTo(4,-22);c.lineTo(-4,-22);c.lineTo(-4,-8);c.lineTo(-7,-6);c.closePath();c.fill();c.stroke();c.fillStyle='#3aa0b8';c.fillRect(-7,2,14,7);c.fillStyle='#8a6a3a';c.fillRect(4,-14,12,4);c.fillStyle='#98ef87';c.beginPath();c.arc(14,-14,4,0,7);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(0,-28-Math.sin(it.t*5)*3,3,0,7);c.fill();break;
   case 'deed':c.fillStyle=TEAL;c.beginPath();c.arc(0,0,12,0,7);c.fill();c.stroke();text(c,'+1',0,1,{size:12,col:INK,align:'center',base:'middle'});break;
   case 'page':{c.save();c.rotate(Math.sin(G.time*3)*.15);c.fillStyle='#fff8e6';c.fillRect(-11,-15,22,30);c.strokeRect(-11,-15,22,30);c.fillStyle=RED;c.fillRect(-8,-11,16,7);c.fillStyle=INK;c.fillRect(-8,-1,7,6);c.fillRect(1,-1,7,6);c.fillRect(-8,7,16,4);c.restore();c.fillStyle=`rgba(247,217,106,${.25+.2*Math.sin(G.time*6)})`;c.beginPath();c.arc(0,0,22,0,7);c.fill();break;}
   case 'memory':c.fillStyle=VIOLET;c.beginPath();for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=i%2?8:18;c.lineTo(Math.cos(a+it.t)*r,Math.sin(a+it.t)*r);}c.closePath();c.fill();c.stroke();text(c,'♪',0,1,{size:16,col:PAPER,align:'center',base:'middle'});break;
   case 'part':c.fillStyle='#555';c.beginPath();c.arc(0,0,15,0,7);c.fill();c.stroke();c.fillStyle='#ccc';c.beginPath();c.arc(0,0,9,0,7);c.fill();c.strokeStyle='#333';c.lineWidth=2;for(let q=0;q<6;q++){c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(q+it.t)*13,Math.sin(q+it.t)*13);c.stroke();}c.lineWidth=2.5;c.strokeStyle=INK;break;
   case 'anchor':c.fillStyle='#9aaec1';c.beginPath();c.arc(0,0,16,0,7);c.fill();c.stroke();c.fillStyle=TEAL;c.beginPath();c.arc(0,0,8+Math.sin(it.t*6)*2,0,7);c.fill();break;
  }c.restore();}
 function drawEnemy(c,e,dead){const d=e.d,sp=d.sprite;const idx=e.attackT>0?sp.attack:(d.shoot||d.float||d.fly)?sp.idle:sp.walk[Math.floor(e.step)%2];
  const hgt=d.fly?44:d.h+6;if(e.flash>0)c.globalAlpha=.6;
  if(sp.sheet==='expansion')drawExpansion(c,idx,e.x,e.y,hgt,-e.dir);else drawEnemySprite(c,idx,e.x,e.y,hgt,-e.dir);
  c.globalAlpha=1;if(e.stun>0){text(c,'✶ ✶ ✶',e.x,e.y-d.h-14,{size:16,col:TEAL,align:'center'});}
  if(e.hp<e.d.hp*diff.enemyHP&&!dead){c.fillStyle=INK;c.fillRect(e.x-18,e.y-d.h-10,36,6);c.fillStyle=RED;c.fillRect(e.x-17,e.y-d.h-9,34*clamp(e.hp/(e.d.hp*diff.enemyHP),0,1),4);}}
 function drawHUD(c){
  // name plate
  const plateW=Math.max(250,30+h.maxHp*18+58);c.fillStyle=INK;c.fillRect(14,14,plateW,66);c.fillStyle=hero.col;c.fillRect(14,14,6,66);
  text(c,hero.name,30,40,{size:26,font:FONT_TITLE,weight:'400',col:hero.col});
  for(let i=0;i<h.maxHp;i++){const x=30+i*18;c.fillStyle=i<h.hp?'#f7d96a':'#3a3a3a';c.fillRect(x,50,12,20);c.fillStyle=i<h.hp?PAPER:'#555';c.fillRect(x,50,12,5);c.strokeStyle='#000';c.lineWidth=1.5;c.strokeRect(x,50,12,20);}
  text(c,`× ${Math.max(0,h.lives)}`,plateW-6,70,{size:16,col:PAPER,align:'right'});
  // special meter
  drawBongMeter(c,14,86,250,h.special,h.special>=1,h.special>=1?hero.special+' READY · '+(G.touch?'SPECIAL':'K'):'PACKING THE CONE…',S.t);
  if(h.power){text(c,(h.power==='superbong'?'SUPER BONG ':'BAG OF GEAR ')+Math.ceil(h.powerT)+'s',14,122,{size:14,col:h.power==='superbong'?'#98ef87':AMBER,stroke:3});}
  // first-cash help card
  if(S.help){const k=easeOut(Math.min(1,S.help.t/.35));const bw=520,bh=22+S.help.lines.length*19+34;const bx=W/2-bw/2,by=H-bh-30+(1-k)*30;c.save();c.globalAlpha=.92*k*(S.help.t>5?Math.max(0,6-S.help.t):1);c.fillStyle=INK;c.fillRect(bx+6,by+6,bw,bh);c.fillStyle=PAPER;c.fillRect(bx,by,bw,bh);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(bx,by,bw,bh);c.fillStyle='#8fd18f';c.fillRect(bx,by,bw,26);text(c,S.help.title,bx+bw/2,by+13,{size:20,font:FONT_COMIC,weight:'400',col:INK,align:'center',base:'middle'});S.help.lines.forEach((l,i)=>text(c,l,bx+14,by+42+i*19,{size:14,font:FONT_COMIC,weight:'400',col:INK,base:'middle'}));text(c,'ENTER / TAP TO CLOSE',bx+bw-12,by+bh-10,{size:10,col:'#6a6058',align:'right',base:'middle'});c.restore();}
  // objective
  c.fillStyle='rgba(23,36,43,.85)';c.fillRect(W/2-230,12,460,44);text(c,chapter.title,W/2,28,{size:16,font:FONT_TITLE,weight:'400',col:'#f7d96a',align:'center',base:'middle'});
  text(c,chapter.collect?`${chapter.collect.label} ${S.collected}/${chapter.collect.need} · ${chapter.objective}`:chapter.objective,W/2,45,{size:11,col:PAPER,align:'center',base:'middle'});
  // score
  const WR=W-(G.hudR||0);  text(c,String(S.score).padStart(6,'0'),WR-18,38,{size:28,font:FONT_TITLE,weight:'400',col:PAPER,align:'right',stroke:4});
  {const pop=S.cashPop?Math.max(0,1-S.cashPop.t/.8):0;const sc=1+pop*.25;c.save();c.translate(WR-18,76);c.scale(sc,sc);c.fillStyle=INK;c.fillRect(-150,-12,150,24);c.fillStyle='#8fd18f';c.fillRect(-150,-12,5,24);
   text(c,'WALLET',-138,0,{size:11,col:PAPER,base:'middle'});text(c,'$'+(S.cash+run.profile.cash),-8,0,{size:18,font:FONT_TITLE,weight:'400',col:pop?'#c8ffc0':'#8fd18f',align:'right',base:'middle'});c.restore();
   if(S.cashPop&&pop>0)text(c,'+$'+S.cashPop.n,WR-18,100+(1-pop)*14,{size:16,font:FONT_TITLE,weight:'400',col:'#8fd18f',align:'right',base:'middle',stroke:3});
   text(c,`XP ${S.xp}  ·  LV ${run.profile.level}`,WR-18,108+(S.cashPop&&pop>0?16:0),{size:12,col:AMBER,align:'right',stroke:3});}
  if(S.pageToast){const k=S.pageToast.t;const a=k<.3?k/.3:k>3?Math.max(0,1-(k-3)/.5):1;if(a>0){const pg=getPage(S.pageToast.id);c.save();c.globalAlpha=a;c.translate(W/2,H-150+(1-a)*30);c.rotate(-.03);c.fillStyle=INK;c.fillRect(-154,-64,308,128);c.fillStyle='#fff8e6';c.fillRect(-150,-60,300,120);if(pg.ready){c.save();c.beginPath();c.rect(-142,-52,76,104);c.clip();drawCover(c,pg.img,-142,-52,76,104);c.restore();}
   text(c,S.pageToast.fresh?'COMIC PAGE FOUND':'ALREADY HAD THIS ONE',-54,-36,{size:18,font:FONT_TITLE,weight:'400',col:S.pageToast.fresh?RED:'#6a6058'});text(c,S.pageToast.id.replace('I','ISSUE ').replace('-P',' · PAGE '),-54,-12,{size:14,col:INK});text(c,`${Object.keys(SAVE.pages).length}/${Object.keys(PAGE_FILES).length} in the gallery`,-54,10,{size:13,col:INK});text(c,S.pageToast.fresh?'+$80 · +25 XP':'+$30',-54,34,{size:14,col:'#2f8f3a',weight:'800'});c.restore();}}
  // progress bar
  c.fillStyle=INK;c.fillRect(W/2-150,H-16,300,8);c.fillStyle='#f7d96a';c.fillRect(W/2-150,H-16,300*clamp(h.x/chapter.length,0,1),8);
  if(Audio.nowPlaying){if(G.touch)text(c,'♪ '+Audio.nowPlaying,W/2,H-28,{size:12,col:'rgba(244,230,202,.6)',align:'center'});else text(c,'♪ '+Audio.nowPlaying,W-18,H-10,{size:12,col:'rgba(244,230,202,.6)',align:'right'});}
 }
 function drawPause(c){c.fillStyle='rgba(0,0,0,.65)';c.fillRect(0,0,W,H);text(c,'PAUSED',W/2,150,{size:64,font:FONT_TITLE,col:'#f7d96a',align:'center',weight:'400',stroke:8});['KEEP GOING','RESTART CHAPTER','BACK TO THE BAR'].forEach((l,i)=>{text(c,(S.pauseSel===i?'▶ ':'')+l,W/2,240+i*48,{size:30,font:FONT_TITLE,col:S.pauseSel===i?AMBER:PAPER,align:'center',weight:'400'});});text(c,'MOVE: A/D or arrows · JUMP: Space · ATTACK: J (hold) · SPECIAL: K · DOWN+JUMP: drop · UP: aim up · WEASEL: double jump + wall kick',W/2,H-40,{size:13,col:PAPER,align:'center'});}
 function drawGameOver(c){c.fillStyle='rgba(20,0,0,.75)';c.fillRect(0,0,W,H);speedLines(c,W/2,H/2,50,.3,RED);text(c,'COOKED',W/2,H/2-30,{size:110,font:FONT_TITLE,col:RED,align:'center',base:'middle',weight:'400',stroke:10});text(c,S.goLine||'The bank sent a bloke.',W/2,H/2+50,{size:22,font:FONT_HAND,col:PAPER,align:'center',weight:'400'});if(S.endT>1.2)text(c,'PRESS ATTACK',W/2,H/2+110,{size:24,font:FONT_TITLE,col:AMBER,align:'center',weight:'400'});}
 return S;
}
