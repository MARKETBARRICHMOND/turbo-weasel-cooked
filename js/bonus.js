/* Bonus rounds: simple, loud, over in a minute. cone = timing bar, pokies = three reels, slab = mash-carry. */
'use strict';
function BonusScene(kind,run,opts={}){
 const S={kind,t:0,done:false,onDone:opts.onDone,cash:0,xp:0,phase:'intro',phaseT:0,msg:null,hero:run.char,profile:run.profile};
 const title={cone:'PULL A CONE',pokies:'THE POKIES',slab:'SLAB RUN'}[kind];
 const blurb={cone:'HIT ATTACK WHEN THE FLAME IS IN THE GREEN. FIVE GOES. DON’T COUGH.',pokies:'THREE SPINS. ATTACK TO STOP EACH REEL. THE HOUSE ALWAYS WINS, BUT THE HOUSE IS BORKMASTER AND HE OWES YOU.',slab:'MASH ATTACK TO CARRY THE SLAB ACROSS VICTORIA STREET BEFORE THE 109 TRAM. DO NOT DROP THE SLAB.'}[kind];
 S.enter=function(){Audio.playTrack('bonus');S.phase='intro';S.phaseT=0;
  if(kind==='cone')S.g={go:0,goes:5,pos:0,dir:1,speed:1.6,zone:[.62,.78],result:null,resT:0,hits:0,bongT:0};
  if(kind==='pokies')S.g={spins:3,reels:[0,0,0],spinning:[false,false,false],stopT:0,syms:['🍺','🌿','🚬','🍕','💀','🎸','🍆'],offsets:[0,0,0],stopped:0,result:null,resT:0,spinT:0};
  if(kind==='slab')S.g={x:0,mash:0,tram:-1000,tramV:150,dropped:false,won:false,wob:0,lastMash:0,endT:0};
 };
 function end(){S.done=true;Audio.sfx(S.cash>0?'cash':'lose');S.onDone({cash:S.cash,xp:S.xp,kind});}
 function pay(amt,why){S.cash+=amt;S.xp+=Math.round(amt/10);floater('+$'+amt+(why?' '+why:''),W/2,220,AMBER,26);Audio.sfx('cash');}
 S.update=function(dt){if(S.done)return;S.t+=dt;S.phaseT+=dt;updateFx();
  if(S.phase==='intro'){if(Input.hit('back')){S.phase='over';S.phaseT=0;S.msg='BAILED';return;}if(S.phaseT>.6&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump'))){S.phase='play';S.phaseT=0;Audio.sfx('select');}return;}
  if(S.phase==='over'){if(S.phaseT>1.3&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump')))end();return;}
  if(Input.hit('back')){S.phase='over';S.phaseT=0;S.msg='BAILED';return;}
  const g=S.g;
  if(kind==='cone'){
   if(g.result){g.resT+=dt;if(g.resT>.9){g.result=null;if(g.go>=g.goes){S.phase='over';S.phaseT=0;S.msg=g.hits>=4?'ABSOLUTELY RIPPED':g.hits>=2?'DECENT RIP':'COUGHED IT UP';if(g.hits>=4){pay(100,'PERFECT LUNGS');S.xp+=40;}}}return;}
   g.pos+=g.dir*g.speed*dt*(1+g.go*.25);if(g.pos>1){g.pos=1;g.dir=-1;}if(g.pos<0){g.pos=0;g.dir=1;}
   if(Input.hit('attack')||Input.hit('confirm')||Input.hit('jump')){g.go++;const inZone=g.pos>=g.zone[0]&&g.pos<=g.zone[1];const perfect=Math.abs(g.pos-(g.zone[0]+g.zone[1])/2)<.03;g.result=perfect?'PERFECT':inZone?'NICE':g.pos>g.zone[1]?'TOO HOT':'TOO WEAK';g.resT=0;
    if(inZone){g.hits++;pay(perfect?80:40,perfect?'PERFECT':'');burst(W/2,300,perfect?TEAL:AMBER,20,250,.6,6);comicWord(perfect?'RIIIIP':'BUBBLE',W/2+rnd(-60,60),260,perfect?TEAL:AMBER,perfect?64:44);Audio.sfx('cone');shake(perfect?6:2);}
    else{comicWord(pick(['COUGH','HACK','WHEEZE']),W/2+rnd(-60,60),260,RED,44);Audio.sfx('hurt');}
    g.zone=[.4+Math.random()*.4,0];g.zone[1]=g.zone[0]+.16-g.go*.015;}
  }
  if(kind==='pokies'){
   if(g.result){g.resT+=dt;if(g.resT>1.4){g.result=null;if(g.spins<=0){S.phase='over';S.phaseT=0;S.msg=S.cash>=200?'GAMBLING PROBLEM UNLOCKED':S.cash>0?'WALKED AWAY. SOMEHOW.':'DONATED TO BORK’S RETIREMENT';}}return;}
   if(!g.spinning.some(x=>x)&&g.stopped===0){if(Input.hit('attack')||Input.hit('confirm')||Input.hit('jump')){g.spinning=[true,true,true];g.spinT=0;g.spins--;Audio.sfx('select');}}
   else{g.spinT+=dt;for(let i=0;i<3;i++)if(g.spinning[i])g.offsets[i]+=dt*(14+i*3);
    if((Input.hit('attack')||Input.hit('confirm')||Input.hit('jump'))&&g.spinT>.3){const i=g.spinning.indexOf(true);if(i>=0){g.spinning[i]=false;g.reels[i]=Math.floor(g.offsets[i])%g.syms.length;g.stopped++;Audio.sfx('tick');shake(2);}}
    if(g.stopped===3){g.stopped=0;const [a,b,c]=g.reels;let win=0,why='';
     if(a===b&&b===c){win=a===4?0:a===6?250:150;why=a===4?'THREE SKULLS. BORK KEEPS IT.':a===6?'ROCK AND ROLL':'TRIPLE!';}
     else if(a===b||b===c||a===c){win=30;why='PAIR';}
     const luck=S.profile.luck||0;if(win===0&&Math.random()<luck){win=20;why='LUCKY DURRY';}
     g.result=win?why:pick(['NOTHING','BORK WINS','CENTRELINK CALLED','TRY YOUR OTHER WALLET']);g.resT=0;
     if(win){pay(win,'');burst(W/2,260,AMBER,30,300,.8,6);comicWord('DING DING',W/2,200,'#f7d96a',56);Audio.sfx('coin');}else Audio.sfx('lose');}}
  }
  if(kind==='slab'){
   if(g.dropped||g.won){g.endT+=dt;if(g.endT>1){S.phase='over';S.phaseT=0;}return;}
   g.tram+=g.tramV*dt;g.tramV+=12*dt;
   g.mash=Math.max(0,g.mash-dt*(1.2+g.mash*.9));
   if(Input.hit('attack')||Input.hit('jump')||Input.hit('confirm')){g.mash+=.5;g.lastMash=S.t;Audio.sfx('tick');}
   g.x+=Math.min(2.2,g.mash)*125*dt;g.wob+=dt*(1+g.mash*2);
   if(g.mash>3.6){g.dropped=true;comicWord('SLAB DOWN',W/2,220,RED,64);Audio.sfx('explode');shake(10);S.msg='TOO KEEN. DROPPED IT.';burst(400,380,AMBER,30,300,.8,6);}
   if(g.tram>g.x-100&&g.x<760){g.dropped=true;comicWord('109 TRAM',W/2,220,RED,64);Audio.sfx('explode');shake(14);S.msg='TRAMMED. SLAB SURVIVED. YOU DIDN’T.';}
   if(g.x>=780){g.won=true;pay(140,'SLAB DELIVERED');S.xp+=40;comicWord('CHEERS',W/2,220,'#f7d96a',64);Audio.sfx('win');S.msg='SLAB ACROSS. HERO OF RICHMOND.';}
  }
 };
 S.draw=function(c){
  c.fillStyle='#1d1715';c.fillRect(0,0,W,H);drawPanorama(c,'street',S.t*20,{groundY:430,parallax:.3,filter:'brightness(.55)'});c.fillStyle='#2b2320';c.fillRect(0,430,W,110);
  // bonus header
  c.fillStyle='#f7d96a';c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,70);c.lineTo(0,90);c.fill();c.fillStyle=INK;c.fillRect(0,88,W,6);
  text(c,'BONUS ROUND — '+title,W/2,44,{size:44,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});
  text(c,'$'+S.cash,W-30-(G.hudR||0),120,{size:30,font:FONT_TITLE,col:AMBER,align:'right',weight:'400',stroke:5});
  if(S.phase==='intro'){const bw=720,bh=150;bubble(c,W/2-bw/2,200,bw,bh,W/2-250,400,'speech');wrapText(c,blurb,bw-50,`400 24px ${FONT_HAND}`).forEach((l,i)=>text(c,l,W/2,235+i*30,{size:24,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));drawCrew(c,'borkmaster',0,W/2-300,470,1,1.1);text(c,'ATTACK TO START · BACKSPACE TO BAIL',W/2,500,{size:20,font:FONT_TITLE,col:PAPER,align:'center',weight:'400'});return;}
  const g=S.g;
  if(kind==='cone'){
   // bong + flame bar
   drawHero(c,S.hero,330,430,{dir:1,crouch:true,scale:1.3});
   c.fillStyle='#3b6b4a';c.fillRect(420,300,40,130);c.fillStyle='#8fd29a';c.fillRect(420,300,40,10);c.fillStyle=INK;c.strokeStyle=INK;c.lineWidth=4;c.strokeRect(420,300,40,130);
   const bx=520,by=180,bw=360,bh=40;c.fillStyle=INK;c.fillRect(bx-6,by-6,bw+12,bh+12);const grd=c.createLinearGradient(bx,0,bx+bw,0);grd.addColorStop(0,'#5a6f8a');grd.addColorStop(1,RED);c.fillStyle=grd;c.fillRect(bx,by,bw,bh);c.fillStyle='#7fe08a';c.fillRect(bx+g.zone[0]*bw,by,(g.zone[1]-g.zone[0])*bw,bh);
   const fx=bx+g.pos*bw;c.fillStyle=AMBER;c.beginPath();c.moveTo(fx,by-14);c.lineTo(fx+10,by+bh+14);c.lineTo(fx-10,by+bh+14);c.fill();c.strokeStyle=INK;c.lineWidth=3;c.stroke();
   text(c,'GO '+Math.min(g.goes,g.go+1)+' / '+g.goes,bx+bw/2,by+bh+40,{size:24,font:FONT_TITLE,col:PAPER,align:'center',weight:'400'});
   text(c,'FLAME: '+Math.round(g.pos*100)+'°',bx+bw/2,by-30,{size:18,col:PAPER,align:'center'});
   if(g.result)text(c,g.result,W/2,330,{size:60,font:FONT_TITLE,col:g.result==='PERFECT'?TEAL:g.result==='NICE'?AMBER:RED,align:'center',base:'middle',weight:'400',stroke:8});
   text(c,'HITS: '+g.hits,W/2,480,{size:22,col:AMBER,align:'center',font:FONT_TITLE,weight:'400'});
  }
  if(kind==='pokies'){
   c.fillStyle='#4a1d2e';roundRect(c,230,120,500,300,18);c.fill();c.strokeStyle='#f7d96a';c.lineWidth=8;c.stroke();text(c,'BORK’S LUCKY ESHAY',480,150,{size:30,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400'});
   for(let i=0;i<3;i++){const rx=270+i*150,ry=180;c.fillStyle=PAPER;c.fillRect(rx,ry,120,170);c.strokeStyle=INK;c.lineWidth=4;c.strokeRect(rx,ry,120,170);const idx=g.spinning[i]?g.offsets[i]:g.reels[i];
    for(let k=-1;k<=1;k++){const sym=g.syms[((Math.floor(idx)+k)%g.syms.length+g.syms.length)%g.syms.length];const fy=ry+85+k*60-(g.spinning[i]?(idx%1)*60:0);c.save();c.beginPath();c.rect(rx,ry,120,170);c.clip();c.globalAlpha=k===0?1:.35;text(c,sym,rx+60,fy,{size:48,align:'center',base:'middle',font:'serif'});c.restore();}
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(rx,ry,120,45);c.fillRect(rx,ry+125,120,45);}
   text(c,'SPINS LEFT: '+g.spins,480,390,{size:22,font:FONT_TITLE,col:PAPER,align:'center',base:'middle',weight:'400'});
   text(c,g.spinning.some(x=>x)?'ATTACK TO STOP A REEL':g.spins>0?'ATTACK TO SPIN':'',480,460,{size:24,font:FONT_TITLE,col:AMBER,align:'center',weight:'400'});
   if(g.result)text(c,g.result,W/2,300,{size:54,font:FONT_TITLE,col:S.cash>0?'#f7d96a':RED,align:'center',base:'middle',weight:'400',stroke:8});
   text(c,'🍺🍺🍺 150 · 🎸🎸🎸 250 · 💀💀💀 0 · PAIR 30',480,110,{size:14,col:PAPER,align:'center'});
  }
  if(kind==='slab'){
   // road
   c.fillStyle='#3a3a3a';c.fillRect(0,350,W,80);c.fillStyle='#d8c47a';for(let x=0;x<W;x+=60)c.fillRect(x,388,30,4);c.fillStyle='#777';c.fillRect(0,340,W,10);c.fillStyle='#8aa0b0';c.fillRect(0,430,W,6);
   text(c,'MARKET BAR →',W-20,330,{size:22,font:FONT_TITLE,col:'#f7d96a',align:'right',weight:'400',stroke:4});
   const hx=100+g.x;const wob=Math.sin(g.wob*6)*Math.min(14,g.mash*8);
   drawHero(c,S.hero,hx,420,{dir:1,moving:g.mash>.2,step:S.t*4,scale:1.2});
   if(!g.dropped){c.save();c.translate(hx+10,330+wob);c.rotate(wob*.03);c.fillStyle='#2d6a9f';c.fillRect(-36,-24,72,48);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(-36,-24,72,48);text(c,'VB',0,0,{size:22,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400'});c.restore();}
   // tram
   const tx=g.tram;c.fillStyle='#2f8f4e';c.fillRect(tx-200,300,220,120);c.fillStyle='#f7d96a';c.fillRect(tx-200,300,220,14);for(let i=0;i<5;i++){c.fillStyle='#bfe9ff';c.fillRect(tx-190+i*42,322,30,36);}c.strokeStyle=INK;c.lineWidth=4;c.strokeRect(tx-200,300,220,120);text(c,'109',tx-90,398,{size:24,font:FONT_TITLE,col:PAPER,align:'center',base:'middle',weight:'400'});
   // mash meter
   c.fillStyle=INK;c.fillRect(W/2-204,120,408,34);c.fillStyle=g.mash>2.9?RED:g.mash>2?AMBER:TEAL;c.fillRect(W/2-200,124,Math.min(400,g.mash/3.6*400),26);text(c,g.mash>2.9?'TOO KEEN!':'MASH ATTACK',W/2,137,{size:20,font:FONT_TITLE,col:PAPER,align:'center',base:'middle',weight:'400',stroke:4});
  }
  if(S.phase==='over'){c.fillStyle='rgba(0,0,0,.65)';c.fillRect(0,0,W,H);text(c,S.msg||'DONE',W/2,220,{size:56,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:8});text(c,'WON $'+S.cash+'  ·  +'+S.xp+' XP',W/2,300,{size:30,font:FONT_TITLE,col:AMBER,align:'center',base:'middle',weight:'400',stroke:5});if(S.phaseT>1.3)text(c,'PRESS ATTACK',W/2,400,{size:22,font:FONT_TITLE,col:PAPER,align:'center',weight:'400'});}
  drawFx(c,0);drawFloaters(c,0);
 };
 return S;
}
