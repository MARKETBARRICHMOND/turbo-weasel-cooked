/* RPG layer: profile, XP, the crime-credit ledger, and Borkmaster's tab. */
'use strict';
function newProfile(){return {level:1,xp:0,xpNext:120,cash:0,tab:0,hpBonus:0,speedBonus:0,specialBonus:0,dmgBonus:0,luck:0,kevlar:false,meterBonus:0,specialLen:0,perks:{},deeds:0,crimes:0,kills:0,score:0,bought:0};}
const LEVEL_GIFTS=[
 {txt:'+1 MAX HEALTH (PIE AND A CHOCKY MILK)',apply:p=>p.hpBonus+=1},
 {txt:'+5% SPEED (NEW LACES)',apply:p=>p.speedBonus+=.05},
 {txt:'SPECIAL +10% RECHARGE (DEEPER LUNGS)',apply:p=>p.specialBonus+=.1},
 {txt:'+$80 FOUND IN THE COUCH',apply:p=>p.cash+=80},
 {txt:'+10% SUPER METER (ANGER ISSUES)',apply:p=>p.meterBonus+=.1},
 {txt:'+1 MAX HEALTH (BORK SLIPPED YOU A PARMA)',apply:p=>p.hpBonus+=1},
];
function addXP(p,amount){const ups=[];p.xp+=Math.round(amount);while(p.xp>=p.xpNext){p.xp-=p.xpNext;p.level++;p.xpNext=Math.round(p.xpNext*1.35);const g=LEVEL_GIFTS[(p.level-2)%LEVEL_GIFTS.length];g.apply(p);ups.push(g.txt);}return ups;}
const VERDICTS=[
 [v=>v>=4,'NET POSITIVE. THE BANK IS CONFUSED BUT GRATEFUL.'],
 [v=>v>=1,'SLIGHTLY IN CREDIT. DON’T SPEND IT ALL AT ONCE.'],
 [v=>v===0,'DEAD EVEN. LIKE A MAGISTRATE WHO’S GIVEN UP.'],
 [v=>v>=-3,'IN THE RED. THE BANK HAS SENT A BLOKE.'],
 [v=>true,'DEEPLY, STRUCTURALLY FUCKED. ROBBIE WOULD BE PROUD.'],
];
/* Results after a chapter: the tally, the ledger, the XP bar, level ups. */
function ResultsScene(res,run,chapter,opts={}){
 const P=run.profile;const diff=DIFF[run.difficulty];
 const S={t:0,done:false,onDone:opts.onDone,rows:[],shown:0,ups:[],xpStart:P.xp,xpNextStart:P.xpNext,levelStart:P.level,barT:0,phase:'tally'};
 const xpGain=Math.round(((res.xp||0)+(res.bonusXp||0)+(res.fightWin?120:0)+chapter.n*40)*diff.xp);
 const cashGain=(res.cash||0)+(res.bonusCash||0)+(res.fightWin?150:0);
 S.rows=[['ENEMIES FLOGGED',res.kills||0],['SCORE',res.score||0],['DEEDS BANKED',res.deeds||0],['CRIMES COMMITTED',res.crimes||0],['BONUS ROUND','$'+(res.bonusCash||0)],...(res.race?[['GRAND PRIX',['1ST','2ND','3RD'][res.race-1]||res.race+'TH']]:[]),...(res.unlocked&&res.unlocked.length?[['SCRAP MODE',res.unlocked.join(' + ')+' UNLOCKED']]:[]),['BOSS',res.fightWin?(chapter.friendly?'HUGGED IT OUT':'FLATTENED'):'N/A'],['CASH','$'+cashGain],['XP','+'+xpGain]];
 S.enter=function(){if(S.applied)return;S.applied=true;Audio.playTrack('win');P.cash+=cashGain;P.deeds+=res.deeds||0;P.crimes+=res.crimes||0;P.kills+=res.kills||0;P.score+=res.score||0;S.ups=addXP(P,xpGain);save();};
 S.update=function(dt){if(S.done)return;S.t+=dt;updateFx();
  if(S.shown<S.rows.length&&S.t>.3+S.shown*.28){S.shown++;Audio.sfx('tick');if(S.shown===S.rows.length)Audio.sfx('cash');}
  if(S.shown>=S.rows.length){S.barT=Math.min(1,S.barT+dt*.8);}
  if(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump')){if(S.shown<S.rows.length){S.shown=S.rows.length;S.barT=1;}else if(S.barT>=1){S.done=true;S.onDone();}}
 };
 S.draw=function(c){
  c.fillStyle='#120d0b';c.fillRect(0,0,W,H);const cov=getPage(COVERS[chapter.issue]);if(cov.ready){c.save();c.globalAlpha=.22;drawCover(c,cov.img,0,0,W,H);c.restore();}halftone(c,0,0,W,H,'rgba(0,0,0,.25)',7);
  text(c,'CHAPTER '+chapter.n+' — '+chapter.title,W/2,56,{size:38,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:7,strokeCol:RED});
  text(c,'DONE AND DUSTED',W/2,96,{size:20,col:PAPER,align:'center',base:'middle'});
  // ledger paper
  c.save();c.translate(70,130);c.rotate(-.015);c.fillStyle=INK;c.fillRect(6,6,400,330);c.fillStyle=PAPER;c.fillRect(0,0,400,330);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(0,0,400,330);
  text(c,'CRIME-CREDIT LEDGER',200,30,{size:26,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});c.fillStyle=INK;c.fillRect(20,48,360,2);
  for(let i=0;i<S.shown;i++){const [k,v]=S.rows[i];text(c,k,24,66+i*Math.min(26,230/S.rows.length),{size:16,font:FONT_HAND,col:INK,weight:'400'});text(c,String(v),376,66+i*Math.min(26,230/S.rows.length),{size:16,font:FONT_HAND,col:i===3?RED:i===2?GREEN:INK,align:'right',weight:'400'});}
  if(S.shown>=S.rows.length){const net=P.deeds-P.crimes;const vd=VERDICTS.find(v=>v[0](net))[1];c.save();c.translate(200,300);c.rotate(-.08);text(c,'NET '+(net>=0?'+':'')+net,0,-10,{size:34,font:FONT_TITLE,col:net>=0?GREEN:RED,align:'center',base:'middle',weight:'400',stroke:3,strokeCol:PAPER});c.restore();}
  c.restore();
  if(S.shown>=S.rows.length){const net=P.deeds-P.crimes;const vd=VERDICTS.find(v=>v[0](net))[1];wrapText(c,vd,380,`400 20px ${FONT_HAND}`).forEach((l,i)=>text(c,l,700,470+i*24,{size:20,font:FONT_HAND,col:PAPER,align:'center',base:'middle',weight:'400'}));}
  // hero + xp
  drawHero(c,run.char,700,420,{dir:1,scale:2.2});
  const bx=520,by=150,bw=380;text(c,CHARS[run.char].name+'  ·  LEVEL '+P.level,bx,by,{size:26,font:FONT_TITLE,col:AMBER,weight:'400',stroke:4});
  c.fillStyle=INK;c.fillRect(bx,by+14,bw,22);let frac;if(S.ups.length){frac=S.barT<1?S.barT:P.xp/P.xpNext;}else{frac=lerp(S.xpStart/S.xpNextStart,P.xp/P.xpNext,S.barT);}
  c.fillStyle=TEAL;c.fillRect(bx+3,by+17,(bw-6)*clamp(frac,0,1),16);text(c,`XP ${P.xp} / ${P.xpNext}`,bx+bw/2,by+25,{size:13,col:INK,align:'center',base:'middle'});
  if(S.barT>=1)S.ups.forEach((u,i)=>{text(c,'LEVEL UP! '+u,bx,by+70+i*26,{size:17,col:'#f7d96a',stroke:3});if(i===0&&G.frame%40===0){burst(bx+rnd(0,bw),by+60,'#f7d96a',4,120,.6,4,200);}});
  {const yy=by+170+S.ups.length*26;text(c,'WALLET $'+P.cash+'   ·   TAB $'+P.tab,bx,yy,{size:24,font:FONT_TITLE,col:PAPER,weight:'400',stroke:4});text(c,P.tab>0?'TAB = WHAT YOU OWE BORK. IT MAKES HIS PRICES DEARER. PAY IT DOWN AT THE BAR.':'CASH BANKED. SPEND IT AT BORK\'S BAR NEXT. NO TAB. BORK IS SUSPICIOUS.',bx,yy+26,{size:12,col:AMBER,stroke:3});}
  if(S.barT>=1)text(c,'PRESS ATTACK',W/2,H-24,{size:22,font:FONT_TITLE,col:(Math.sin(S.t*6)>0)?AMBER:PAPER,align:'center',weight:'400'});
  drawFx(c,0);
 };
 return S;
}
/* Borkmaster's bar: buy perks with cash, or put them on the tab. Everything's on tick in this town. */
function ShopScene(run,opts={}){
 const P=run.profile;const S={t:0,done:false,onDone:opts.onDone,sel:0,quote:pick(BORK_SHOP),quoteT:0,bork:'idle',borkT:0,menu:true};
 const items=()=>[...PERKS.map(p=>({...p,owned:P.perks[p.id]||0,price:Math.round(p.cost*(1+(P.perks[p.id]||0)*.5)*(1+Math.min(.5,P.tab/2000))),kind:'perk'})),{id:'pay',name:'PAY DOWN THE TAB',cost:0,desc:'Give Bork what you’ve got. He’ll frame the receipt.',kind:'pay',price:Math.min(P.cash,P.tab)},{id:'leave',name:'LEAVE THE BAR',cost:0,desc:'Back out into it.',kind:'leave',price:0}];
 function say(q){S.quote=q;S.quoteT=0;S.bork='attack';S.borkT=0;}
 S.enter=function(){Audio.playTrack('shop');};
 S.update=function(dt){if(S.done)return;S.t+=dt;S.quoteT+=dt;S.borkT+=dt;if(S.borkT>.5)S.bork='idle';updateFx();
  const list=items();
  if(Input.hit('down')){S.sel=(S.sel+1)%list.length;Audio.sfx('menu');}if(Input.hit('up')){S.sel=(S.sel+list.length-1)%list.length;Audio.sfx('menu');}
  if(Input.hit('back')){S.done=true;S.onDone();return;}
  let act=Input.hit('confirm')||Input.hit('attack')||Input.hit('jump');
  if(act)buy(list[S.sel]);
 };
 function buy(it){
  if(it.kind==='leave'){Audio.sfx('select');S.done=true;S.onDone();return;}
  if(it.kind==='pay'){if(P.tab<=0){say('You don’t owe me anything. Say that again, it felt weird.');return;}const amt=Math.min(P.cash,P.tab);if(amt<=0){say('Pay with what? Vibes? I don’t take vibes. Angus tried.');Audio.sfx('lose');return;}P.cash-=amt;P.tab-=amt;Audio.sfx('cash');say(P.tab<=0?'Paid in full. I’m going to need a minute. Nobody has ever done that.':'Lovely. That covers the interest on the interest.');return;}
  if(it.owned>=it.max){say('You’ve had enough of those. I’m not your mum, but I am the bloke with the key to the fridge.');Audio.sfx('lose');return;}
  const onTick=P.cash<it.price;
  if(onTick){P.tab+=it.price;say(pick(['On the tab. Of course it’s on the tab. The tab has a tab.','Sure. Tick. I’ll just write it under “TURBO AND WEASEL — LOL.”','Ask me what the interest rate is. Go on.','Tick it is. If you die, Angus inherits the debt. He doesn’t know yet.']));}
  else{P.cash-=it.price;say(pick(['Cash?! Who did you rob?','I’ll give you a receipt. It’s a coaster. Don’t lose it.','Paying up front. Weasel, are you feeling alright?']));}
  P.perks[it.id]=(P.perks[it.id]||0)+1;it.apply(P);P.bought++;Audio.sfx('cash');burst(640,330,AMBER,16,220,.6,5);floater(it.name,640,300,'#f7d96a',22);
 }
 S.draw=function(c){
  c.fillStyle='#1a120e';c.fillRect(0,0,W,H);drawPanorama(c,'bar',200,{groundY:470,parallax:0,filter:'brightness(.6) sepia(.3)'});
  c.fillStyle='rgba(20,12,8,.55)';c.fillRect(0,0,W,H);
  // bar counter
  c.fillStyle='#5a3a24';c.fillRect(520,380,440,30);c.fillStyle='#3b2416';c.fillRect(520,410,440,130);c.fillStyle=INK;c.fillRect(520,376,440,6);
  drawCrew(c,'borkmaster',S.bork==='attack'?3:0,780,380,-1,1.25);
  text(c,'THE MARKET BAR',740,60,{size:44,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:7,strokeCol:RED});
  text(c,'GEAR ON TICK · ABSOLUTELY NO REFUNDS · NO CROWE',740,92,{size:14,col:PAPER,align:'center'});
  // Bork bubble
  const lines=wrapText(c,S.quote,330,`400 20px ${FONT_HAND}`);const bh=lines.length*24+30,bw=360;const bx=560,by=120;bubble(c,bx,by,bw,bh,760,372,'speech');lines.forEach((l,i)=>text(c,l,bx+bw/2,by+24+i*24,{size:20,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));
  // list
  const list=items();const lx=40,ly=40;c.fillStyle=INK;c.fillRect(lx+6,ly+6,460,470);c.fillStyle=PAPER;c.fillRect(lx,ly,460,470);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(lx,ly,460,470);
  text(c,'THE SLATE',lx+230,ly+26,{size:28,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});text(c,`CASH $${P.cash}   ·   TAB $${P.tab}`,lx+230,ly+52,{size:16,col:P.tab>0?RED:GREEN,align:'center',base:'middle'});
  list.forEach((it,i)=>{const y=ly+78+i*34;const sel=i===S.sel;if(sel){c.fillStyle=AMBER;c.fillRect(lx+8,y-15,444,32);}
   const maxed=it.kind==='perk'&&it.owned>=it.max;text(c,(sel?'▶ ':'')+it.name+(it.kind==='perk'?' '+'●'.repeat(it.owned)+'○'.repeat(it.max-it.owned):''),lx+20,y,{size:19,font:FONT_TITLE,col:maxed?'#8a7f70':INK,base:'middle',weight:'400'});
   if(it.kind==='perk')text(c,maxed?'MAXED':'$'+it.price+(P.cash<it.price?' (TICK)':''),lx+440,y,{size:17,col:maxed?'#8a7f70':P.cash<it.price?RED:GREEN,align:'right',base:'middle'});
   if(it.kind==='pay'&&P.tab>0)text(c,'-$'+Math.min(P.cash,P.tab),lx+440,y,{size:17,col:GREEN,align:'right',base:'middle'});
   if(!S.done&&Input.pressed.click&&Input.mx>=lx&&Input.mx<=lx+460&&Input.my>=y-16&&Input.my<=y+16){if(S.sel===i)buy(it);else{S.sel=i;Audio.sfx('menu');}}
  });
  c.fillStyle=INK;c.fillRect(lx+20,ly+418,420,2);const cur=list[S.sel];wrapText(c,cur.desc,420,`400 17px ${FONT_HAND}`).forEach((l,i)=>text(c,l,lx+230,ly+438+i*19,{size:18,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));
  // how it works: sticky note on the bar
  {const nx=575,ny=418,nw=360,nh=112;c.save();c.translate(nx+nw/2,ny+nh/2);c.rotate(-.015);c.fillStyle='#f7d96a';c.fillRect(-nw/2,-nh/2,nw,nh);c.strokeStyle=INK;c.lineWidth=2;c.strokeRect(-nw/2,-nh/2,nw,nh);text(c,'HOW THE SLATE WORKS',0,-nh/2+14,{size:16,font:FONT_COMIC,weight:'400',col:INK,align:'center',base:'middle'});['CASH: found in levels, won at the pokies and the GP. Banks at chapter end.','TAB: short on cash? Bork sells it on tick and adds it to the tab.','Open tab = dearer prices. PAY DOWN THE TAB whenever you can.','Perks stack. Dots show how many you own.'].forEach((l,i)=>text(c,l,-nw/2+10,-nh/2+34+i*19,{size:12,font:FONT_COMIC,weight:'400',col:INK,base:'middle'}));c.restore();}
  text(c,'↑↓ PICK · ATTACK BUY · BACKSPACE LEAVE',lx+230,H-14,{size:14,col:PAPER,align:'center',base:'middle'});
  drawFx(c,0);drawFloaters(c,0);
 };
 return S;
}
