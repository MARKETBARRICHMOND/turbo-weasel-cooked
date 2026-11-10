/* TURBO & WEASEL: COOKED EDITION — menus, campaign flow, save, eggs. */
'use strict';
const SAVE_DEFAULT=()=>({profile:newProfile(),char:'turbo',difficulty:'mission',chapter:0,unlockedChapter:0,fighters:['turbo','weasel'],beaten:false,eggs:{},pages:{},seed:Math.floor(Math.random()*1e6)});
let SAVE=null;
function save(){if(!G.showcaseSave)writeSave(SAVE);}
function unlockFighter(id){if(!SAVE.fighters.includes(id)){SAVE.fighters.push(id);floater('SCRAP MODE: '+(BOSSES[id]||{name:id}).name+' UNLOCKED',W/2,120,TEAL,20);return true;}return false;}

/* ---------- loading ---------- */
function LoadScene(){const S={p:0,t:0,ready:false};
 S.enter=function(){loadSprites(p=>S.p=p).then(()=>{S.ready=true;preloadPages(['cover-01','cover-10']);});};
 S.update=function(dt){S.t+=dt;if(S.ready&&S.t>1.2)setScene(TitleScene());};
 S.draw=function(c){c.fillStyle='#120d0b';c.fillRect(0,0,W,H);text(c,'LOADING THE PUB',W/2,H/2-20,{size:44,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:6,strokeCol:RED});c.fillStyle=INK;c.fillRect(W/2-200,H/2+20,400,20);c.fillStyle=AMBER;c.fillRect(W/2-197,H/2+23,394*S.p,14);text(c,['CHILLING THE SLABS','BRIBING THE JACKS','FINDING WEASEL','CLEANING THE DOOR','IGNORING ROBBIE'][Math.floor(S.t)%5],W/2,H/2+60,{size:16,col:PAPER,align:'center'});};
 return S;}

/* ---------- title ---------- */
function TitleScene(){const S={t:0,sel:0,egg:null,eggT:0,menuT:0,menu:true,cov:0,covT:0,isTitle:true};const COVER_IDS=['cover-01','cover-03','cover-05','cover-07','cover-10','cover-02'];
 const items=()=>[
  {label:'NEW GAME',sub:'Start the Robbie Williams arc',go:()=>setScene(CharScene())},
  {label:'CONTINUE',sub:SAVE.chapter>0?`Chapter ${Math.min(CHAPTERS.length,SAVE.chapter+1)} · ${CHARS[SAVE.char].name} · ${DIFF[SAVE.difficulty].name}`:'No save yet, ya tourist',disabled:SAVE.chapter<=0&&SAVE.profile.level<=1,go:()=>startChapter(Math.min(SAVE.chapter,CHAPTERS.length-1))},
  {label:'TRY THE UPGRADE',sub:'Lennox, North Richmond and Moon Base test drives',go:()=>setScene(ShowcaseScene())},
  {label:'CHAPTER SELECT',sub:'Replay anything you’ve cleared',disabled:SAVE.unlockedChapter<=0,go:()=>setScene(ChapterSelect())},
  {label:'SCRAP MODE',sub:'Street-Fighter duels. Winner buys.',go:()=>setScene(ScrapSelect())},
  {label:'SCOOTER GP',sub:SAVE.scooter?'Stolen scooters only. Winner takes the pot.':'Finish the bike sale in Chapter 2',disabled:!SAVE.scooter,go:()=>setScene(RaceSelect())},
  {label:'GALLERY',sub:`Covers + ${Object.keys(SAVE.pages).length}/${Object.keys(PAGE_FILES).length} comic pages found`,go:()=>setScene(GalleryScene())},
  {label:'DROP MUSIC',sub:Audio.userMusic?'Playing: '+(Audio.nowPlaying||'your tracks'):'Load your own tracks (mp3/wav/m4a)',go:()=>{const d=document.getElementById('musicdrop');if(d)d.click();}},
  {label:'SETTINGS',sub:'Display, crowds, sound and remappable keys',go:()=>setScene(SettingsScene())},
 ];
 S.enter=function(){Audio.playTrack('menu');G.musicHot=null;preloadPages(COVER_IDS);};
 S.update=function(dt){S.t+=dt;updateFx();const list=items();S.covT+=dt;if(S.covT>9){S.covT=0;S.cov=(S.cov+1)%COVER_IDS.length;}
  if(Input.cheat){Input.cheat=false;SAVE.eggs.konami=true;unlockFighter('crowe');unlockFighter('robbie');SAVE.beaten=true;SAVE.scooter=SAVE.scooter||{speed:0,accel:0,grip:0};save();S.egg={title:'KONAMI? IN THIS ECONOMY?',text:EGGS.konami};S.eggT=0;Audio.sfx('special');flash(VIOLET,.5);}
  if(Input.typed.endsWith('BRUGES')){Input.typed='';SAVE.eggs.bruges=true;save();S.egg=EGGS.bruges;S.eggT=0;Audio.sfx('page');}
  if(Input.typed.endsWith('SMOKO')){Input.typed='';unlockFighter('weed');SAVE.eggs.smoko=true;save();S.egg={title:'SMOKO',text:EGGS.smoko};S.eggT=0;Audio.sfx('cone');}
  if(Input.typed.endsWith('BORK')){Input.typed='';unlockFighter('borkmaster');unlockFighter('angus');unlockFighter('fredo');save();S.egg={title:'THE CREW CLOCKS ON',text:'Borkmaster, Wacky Angus and Freddo unlocked in Scrap Mode. Freddo bites. Freddo always bites.'};S.eggT=0;Audio.sfx('bark');}
  if(S.egg){S.eggT+=dt;if(S.eggT>.5&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('back')||Input.hit('click')))S.egg=null;return;}
  if(Input.hit('down')){S.sel=(S.sel+1)%list.length;Audio.sfx('menu');}if(Input.hit('up')){S.sel=(S.sel+list.length-1)%list.length;Audio.sfx('menu');}
  if(Input.hit('confirm')||Input.hit('jump')||Input.hit('attack')){const it=list[S.sel];if(it.disabled)Audio.sfx('lose');else{Audio.sfx('select');it.go();}}
 };
 S.draw=function(c){drawModernTitle(c,S,items());};
 return S;}
function drawEgg(c,egg,t){c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,0,W,H);const k=easeOut(Math.min(1,t/.4));c.save();c.translate(W/2,H/2);c.rotate(-.03);c.scale(k,k);c.fillStyle=INK;c.fillRect(-294,-144,600,300);c.fillStyle=PAPER;c.fillRect(-300,-150,600,300);c.strokeStyle=RED;c.lineWidth=6;c.strokeRect(-300,-150,600,300);halftone(c,-300,-150,600,300,'rgba(222,117,95,.15)',8);
 text(c,egg.title,0,-95,{size:40,font:FONT_TITLE,col:RED,align:'center',base:'middle',weight:'400'});wrapText(c,egg.text,520,`400 22px ${FONT_HAND}`).forEach((l,i)=>text(c,l,0,-40+i*28,{size:22,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));
 c.fillStyle=AMBER;c.fillRect(200,60,80,80);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(200,60,80,80);text(c,'POST',240,92,{size:16,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});text(c,'PAID',240,112,{size:16,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});
 text(c,'ATTACK TO CLOSE',0,125,{size:16,col:INK,align:'center',base:'middle'});c.restore();}

/* ---------- character select ---------- */
function CharScene(){const S={t:0,sel:SAVE.char==='weasel'?1:0,ids:['turbo','weasel'],menu:true};
 S.enter=function(){Audio.playTrack('menu');};
 S.update=function(dt){S.t+=dt;if(Input.hit('left')||Input.hit('right')){S.sel^=1;Audio.sfx('menu');}if(Input.hit('back'))setScene(TitleScene());
  if(Input.hit('confirm')||Input.hit('jump')||Input.hit('attack')){SAVE.char=S.ids[S.sel];Audio.sfx('select');setScene(DiffScene());}};
 S.draw=function(c){drawModernCharacterSelect(c,S);};
 return S;}
function DiffScene(){const S={t:0,sel:DIFF_ORDER.indexOf(SAVE.difficulty),menu:true};
 const locked=id=>id==='absolutely'&&!SAVE.beaten&&!SAVE.eggs.konami;
 S.update=function(dt){S.t+=dt;if(Input.hit('down')){S.sel=(S.sel+1)%4;Audio.sfx('menu');}if(Input.hit('up')){S.sel=(S.sel+3)%4;Audio.sfx('menu');}if(Input.hit('back'))setScene(CharScene());
  if(Input.hit('confirm')||Input.hit('jump')||Input.hit('attack')){const id=DIFF_ORDER[S.sel];if(locked(id)){Audio.sfx('lose');floater('FINISH THE STORY FIRST. OR CHEAT.',W/2,120,RED,22);return;}
   const fresh=SAVE_DEFAULT();fresh.char=SAVE.char;fresh.difficulty=id;fresh.fighters=SAVE.fighters;fresh.beaten=SAVE.beaten;fresh.eggs=SAVE.eggs;fresh.unlockedChapter=SAVE.unlockedChapter;fresh.pages=SAVE.pages||{};if(SAVE.scooter)fresh.scooter=SAVE.scooter;fresh.seenCashHelp=SAVE.seenCashHelp;fresh.gearRaced=SAVE.gearRaced;SAVE=fresh;save();Audio.sfx('select');startChapter(0);}};
 S.draw=function(c){drawModernDifficulty(c,S,locked);};
 return S;}

/* ---------- chapter select / gallery / settings ---------- */
function ChapterSelect(){const S={sel:Math.min(SAVE.chapter,SAVE.unlockedChapter),menu:true};
 S.update=function(dt){const n=SAVE.unlockedChapter+1;if(Input.hit('down')||Input.hit('right')){S.sel=(S.sel+1)%n;Audio.sfx('menu');}if(Input.hit('up')||Input.hit('left')){S.sel=(S.sel+n-1)%n;Audio.sfx('menu');}if(Input.hit('back'))setScene(TitleScene());if(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump')){Audio.sfx('select');startChapter(S.sel);}};
 S.draw=function(c){c.fillStyle='#120d0b';c.fillRect(0,0,W,H);text(c,'CHAPTER SELECT',W/2,44,{size:44,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:7,strokeCol:RED});
  CHAPTERS.forEach((ch,i)=>{const col=i%5,row=Math.floor(i/5);const x=24+col*184,y=72+row*204;const un=i<=SAVE.unlockedChapter;const sel=i===S.sel;const cov=getPage(COVERS[ch.issue]);c.fillStyle=INK;c.fillRect(x+5,y+5,172,186);c.fillStyle=sel?AMBER:'#2a2220';c.fillRect(x,y,172,186);
   if(cov.ready){c.save();c.beginPath();c.rect(x+6,y+6,160,136);c.clip();if(!un)c.filter='grayscale(1) brightness(.4)';drawCover(c,cov.img,x+6,y+6,160,136);c.restore();}
   text(c,un?`${ch.n}. ${ch.title}`:`${ch.n}. ???`,x+86,y+158,{size:15,font:FONT_TITLE,col:sel?INK:PAPER,align:'center',base:'middle',weight:'400',maxW:160});text(c,un?ch.sub:'LOCKED',x+86,y+176,{size:11,col:sel?INK:'#aaa',align:'center',base:'middle',maxW:160});
   const hb=Input.hot(x,y,172,186);if(hb.hover&&un)S.sel=i;if(hb.click&&un){S.sel=i;Audio.sfx('select');startChapter(i);}});
  text(c,G.touch?'TAP A CHAPTER · BACK TO LEAVE':'ATTACK PLAY · BACKSPACE BACK',W/2,H-14,{size:14,col:PAPER,align:'center',base:'middle'});};
 return S;}
function GalleryScene(){const S={sel:0,view:null,t:0,tab:0,pg:0,menu:true};const ids=Object.values(COVERS);const allPages=Object.keys(PAGE_FILES);const PER=24;
 const found=()=>allPages.filter(id=>SAVE.pages[id]);
 S.update=function(dt){S.t+=dt;S.justClosed=false;if(S.view){if(Input.hit('back')||Input.hit('confirm')||Input.hit('attack')||Input.hit('click')){S.view=null;S.justClosed=true;}return;}
  if(Input.hit('special')){S.tab^=1;S.sel=0;Audio.sfx('menu');}
  if(S.tab===0){const n=ids.length;if(Input.hit('right')){S.sel=(S.sel+1)%n;Audio.sfx('menu');}if(Input.hit('left')){S.sel=(S.sel+n-1)%n;Audio.sfx('menu');}if(Input.hit('down'))S.sel=Math.min(n-1,S.sel+5);if(Input.hit('up'))S.sel=Math.max(0,S.sel-5);if(Input.hit('confirm')||Input.hit('attack')){if(unlocked(S.sel))S.view=ids[S.sel];else Audio.sfx('lose');}}
  else{const n=allPages.length;if(Input.hit('right')){S.sel=Math.min(n-1,S.sel+1);}if(Input.hit('left')){S.sel=Math.max(0,S.sel-1);}if(Input.hit('down'))S.sel=Math.min(n-1,S.sel+8);if(Input.hit('up'))S.sel=Math.max(0,S.sel-8);S.pg=Math.floor(S.sel/PER);if(Input.hit('confirm')||Input.hit('attack')){const id=allPages[S.sel];if(SAVE.pages[id])S.view=id;else Audio.sfx('lose');}}
  if(Input.hit('back'))setScene(TitleScene());};
 const unlocked=i=>SAVE.beaten||SAVE.eggs.konami||CHAPTERS.some((ch,k)=>k<=SAVE.unlockedChapter&&ch.issue>=i+1)||i<=1;
 S.draw=function(c){c.fillStyle='#120d0b';c.fillRect(0,0,W,H);halftone(c,0,0,W,H,'rgba(244,230,202,.04)',8);
  // tabs
  [['THE TEN ISSUES',0],[`PAGES FOUND ${found().length}/${allPages.length}`,1]].forEach(([l,k])=>{const x=k?W/2+10:W/2-330,on=S.tab===k;c.fillStyle=on?AMBER:INK;c.fillRect(x,16,320,40);c.strokeStyle=on?INK:'#5a524a';c.lineWidth=3;c.strokeRect(x,16,320,40);text(c,l,x+160,37,{size:24,font:FONT_TITLE,col:on?INK:PAPER,align:'center',base:'middle',weight:'400'});const hb=Input.hot(x,16,320,40);if(hb.click&&S.tab!==k){S.tab=k;S.sel=0;Audio.sfx('menu');}});
  if(S.tab===0){ids.forEach((id,i)=>{const x=50+(i%5)*176,y=70+Math.floor(i/5)*230;const pg=getPage(id);const un=unlocked(i);c.fillStyle=i===S.sel?AMBER:INK;c.fillRect(x-4,y-4,152,218);if(pg.ready){c.save();if(!un)c.filter='grayscale(1) brightness(.35)';drawCover(c,pg.img,x,y,144,210);c.restore();}else{c.fillStyle='#333';c.fillRect(x,y,144,210);}
   if(!un)text(c,'LOCKED',x+72,y+105,{size:22,font:FONT_TITLE,col:PAPER,align:'center',base:'middle',weight:'400',stroke:4});
   const hb=Input.hot(x,y,144,210);if(hb.hover)S.sel=i;if(hb.click&&!S.justClosed){S.sel=i;if(un)S.view=id;else Audio.sfx('lose');}});}
  else{const start=S.pg*PER;for(let k=0;k<PER&&start+k<allPages.length;k++){const i=start+k,id=allPages[i];const x=40+(k%8)*112,y=72+Math.floor(k/8)*140;const got=!!SAVE.pages[id];c.fillStyle=i===S.sel?AMBER:INK;c.fillRect(x-3,y-3,102,134);
    if(got){const pg=getPage(id);if(pg.ready){c.save();c.beginPath();c.rect(x,y,96,128);c.clip();drawCover(c,pg.img,x,y,96,128);c.restore();}else{c.fillStyle='#333';c.fillRect(x,y,96,128);}}
    else{c.fillStyle='#241c18';c.fillRect(x,y,96,128);text(c,'?',x+48,y+60,{size:40,font:FONT_TITLE,col:'#5a524a',align:'center',base:'middle',weight:'400'});}
    text(c,id,x+48,y+118,{size:10,col:got?PAPER:'#6a6058',align:'center',base:'middle',stroke:got?2:0});
    const hb=Input.hot(x,y,96,128);if(hb.hover)S.sel=i;if(hb.click&&!S.justClosed){S.sel=i;if(got)S.view=id;else Audio.sfx('lose');}}
   text(c,`PAGE ${S.pg+1}/${Math.ceil(allPages.length/PER)} · pages hide in the levels, usually up high or behind something`,W/2,H-34,{size:14,col:TEAL,align:'center',base:'middle'});}
  if(S.view){const pg=getPage(S.view);c.fillStyle='rgba(0,0,0,.88)';c.fillRect(0,0,W,H);if(pg.ready){const h=H-20,w=pg.img.width/pg.img.height*h;c.drawImage(pg.img,W/2-w/2,10,w,h);}}
  text(c,'ARROWS BROWSE · ATTACK VIEW · K/SPECIAL SWAP TAB · BACKSPACE BACK',W/2,H-14,{size:14,col:PAPER,align:'center',base:'middle'});};
 return S;}
function SettingsScene(){return ModernSettingsScene();}

/* ---------- campaign flow ---------- */
function makeRun(){return {difficulty:SAVE.difficulty,char:SAVE.char,profile:SAVE.profile,seed:SAVE.seed};}
function startChapter(i){const ch=CHAPTERS[i];SAVE.chapter=Math.max(SAVE.chapter||0,i);save();const run=makeRun();
 const key=ch.id+':intro';
 if(SAVE.seenScenes?.[key]){playLevel(i,run);return;}
 const intro=ComicScene(ch.intro||[],{title:true,cover:COVERS[ch.issue],chapter:ch,music:ch.music,onDone:()=>{SAVE.seenScenes=SAVE.seenScenes||{};SAVE.seenScenes[key]=true;save();playLevel(i,run);}});transitionTo(intro,'page');}
function playLevel(i,run){const ch=CHAPTERS[i];
 const lvl=PlatformScene(ch,run,{onDone:r=>{
  if(r.result==='win'){const res={...r,fightWin:false};afterLevel(i,run,res);}
  else if(r.result==='retry'){transitionTo(playLevelScene(i,run),'wipe');}
  else if(r.result==='dead'){transitionTo(GameOverScene(i,run),'wipe');}
  else {transitionTo(TitleScene(),'wipe');}
 }});transitionTo(lvl,'wipe');}
function playLevelScene(i,run){const ch=CHAPTERS[i];return PlatformScene(ch,run,{onDone:r=>{if(r.result==='win')afterLevel(i,run,{...r,fightWin:false});else if(r.result==='retry')transitionTo(playLevelScene(i,run),'wipe');else if(r.result==='dead')transitionTo(GameOverScene(i,run),'wipe');else transitionTo(TitleScene(),'wipe');}});}
function afterLevel(i,run,res){const ch=CHAPTERS[i];
 const next=()=>preboss(i,run,res);
 if(ch.bonus){transitionTo(BonusScene(ch.bonus,run,{onDone:b=>{res.bonusCash=b.cash;res.bonusXp=b.xp;next();}}),'wipe');}else next();}
function preboss(i,run,res){const ch=CHAPTERS[i];
 const go=()=>ch.boss?fight(i,run,res):outro(i,run,res);
 if(ch.preboss&&ch.preboss.length)transitionTo(ComicScene(ch.preboss,{music:ch.boss?'boss':ch.music,onDone:go}),'page');else go();}
function fight(i,run,res){const ch=CHAPTERS[i];
 const won=()=>{res.fightWin=true;res.unlocked=[];if(BOSSES[ch.boss]&&unlockFighter(ch.boss))res.unlocked.push(BOSSES[ch.boss].name);if(ch.unlock&&unlockFighter(ch.unlock))res.unlocked.push((BOSSES[ch.unlock]||{name:ch.unlock.toUpperCase()}).name);save();outro(i,run,res);};
 if(ch.bossKind==='craft'){transitionTo(TrixyScene(ch,run,{onDone:r=>{if(r.result==='win')won();else if(r.result==='quit')transitionTo(TitleScene(),'wipe');else transitionTo(FightLossScene(i,run,res),'wipe');}}),'wipe');return;}
 const f=FightScene({p1:run.char,p2:ch.boss,diff:DIFF[run.difficulty],arena:ch.arena||ch.theme,tag:ch.bossTag,friendly:ch.friendly,profile:run.profile,p2phase2:!!ch.final,music:ch.final?'boss':'fight',rounds:ch.friendly?1:undefined},{onDone:r=>{
  if(r.result==='win')won();
  else if(r.result==='quit')transitionTo(TitleScene(),'wipe');
  else transitionTo(FightLossScene(i,run,res),'wipe');}});
 transitionTo(f,'wipe');}
function outro(i,run,res){const ch=CHAPTERS[i];
 const go=()=>{if(ch.race){SAVE.scooter=SAVE.scooter||{speed:0,accel:0,grip:0};save();floater('SCOOTER GP UNLOCKED ON THE TITLE SCREEN',W/2,120,TEAL,20);transitionTo(RaceScene({track:'richmond',diff:DIFF[run.difficulty],racer:run.char,up:SAVE.scooter},{onDone:r=>{res.bonusCash=(res.bonusCash||0)+(r.cash||0);res.bonusXp=(res.bonusXp||0)+(r.xp||0);res.race=r.place;results(i,run,res);}}),'wipe');}else results(i,run,res);};
 if(ch.outro&&ch.outro.length)transitionTo(ComicScene(ch.outro,{music:ch.final?'win':ch.music,onDone:go}),'page');else go();}
function results(i,run,res){const ch=CHAPTERS[i];
 SAVE.unlockedChapter=Math.max(SAVE.unlockedChapter,Math.min(CHAPTERS.length-1,i+1));SAVE.chapter=Math.max(SAVE.chapter||0,Math.min(CHAPTERS.length-1,i+1));if(ch.final){SAVE.beaten=true;}save();
 transitionTo(ResultsScene(res,run,ch,{onDone:()=>{save();if(ch.final){transitionTo(EndScene(run),'page');return;}transitionTo(ShopScene(run,{onDone:()=>{save();startChapter(i+1);}}),'wipe');}}),'wipe');}
function GameOverScene(i,run){const S={t:0,sel:0,menu:true,q:pick(['“You died how you lived: loudly, and in someone else’s pub.” — Borkmaster','“Skill issue.” — Weasel','“Have you tried not getting hit?” — Turbo','“That’s coming out of the bank.” — The Bank','“WOOF.” — Freddo','“Cowards never started, the weak died along the way, and that leaves us.” — Carl, misquoting a shirt','“I’m keeping the bong.” — Mrs Weasel','“Tab’s still open, love.” — Shazza','“Sterilised.” — The Plague Doctor','“WITHDRAWAL COMPLETE.” — Trixy'])};
 S.enter=function(){Audio.playTrack('lose');};
 S.update=function(dt){S.t+=dt;if(Input.hit('up')||Input.hit('down')){S.sel^=1;Audio.sfx('menu');}if(S.t>1&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump'))){Audio.sfx('select');if(S.sel===0)transitionTo(playLevelScene(i,run),'wipe');else transitionTo(TitleScene(),'wipe');}};
 S.draw=function(c){c.fillStyle='#1a0a0a';c.fillRect(0,0,W,H);speedLines(c,W/2,200,50,.15,RED);c.save();c.translate(W/2,180);c.rotate(-.06);text(c,'COOKED',0,0,{size:150,font:FONT_TITLE,col:RED,align:'center',base:'middle',weight:'400',stroke:16,strokeCol:INK});c.restore();
  drawHero(c,run.char,W/2,400,{hurt:true,scale:2.4,dir:1});wrapText(c,S.q,700,`400 22px ${FONT_HAND}`).forEach((l,k)=>text(c,l,W/2,270+k*26,{size:22,font:FONT_HAND,col:PAPER,align:'center',base:'middle',weight:'400'}));
  ['RETRY CHAPTER','BACK TO THE BAR'].forEach((l,k)=>{text(c,(S.sel===k?'▶ ':'')+l,W/2,440+k*36,{size:28,font:FONT_TITLE,col:S.sel===k?AMBER:PAPER,align:'center',base:'middle',weight:'400',stroke:4});const hb=Input.hot(W/2-160,422+k*36,320,36);if(hb.hover)S.sel=k;if(hb.click&&S.t>1){S.sel=k;Input.carry={confirm:true};}});};
 return S;}
function drawCraftIcon(c,x,y,t){c.save();c.translate(x,y);c.rotate(Math.sin(t*1.3)*.05);c.fillStyle='#07080c';c.strokeStyle='#2a2f3a';c.lineWidth=4;c.beginPath();c.moveTo(0,-70);c.lineTo(150,70);c.lineTo(-150,70);c.closePath();c.fill();c.stroke();const g=.6+Math.sin(t*4)*.3;[[0,-40],[112,52],[-112,52]].forEach(([px,py])=>{c.fillStyle=`rgba(255,106,213,${g})`;c.beginPath();c.arc(px,py,9,0,Math.PI*2);c.fill();});c.fillStyle=`rgba(104,203,187,${g*.8})`;c.beginPath();c.arc(0,28,18,0,Math.PI*2);c.fill();c.restore();}
 function FightLossScene(i,run,res){const ch=CHAPTERS[i];const S={t:0,sel:0,menu:true};S.enter=function(){Audio.playTrack('lose');};
 S.update=function(dt){S.t+=dt;if(Input.hit('up')||Input.hit('down')){S.sel^=1;Audio.sfx('menu');}if(S.t>.8&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump'))){Audio.sfx('select');if(S.sel===0)fight(i,run,res);else transitionTo(TitleScene(),'wipe');}};
 S.draw=function(c){c.fillStyle='#1a0a0a';c.fillRect(0,0,W,H);text(c,'FLATTENED BY',W/2,120,{size:40,font:FONT_TITLE,col:PAPER,align:'center',base:'middle',weight:'400',stroke:6});text(c,ch.bossName,W/2,190,{size:70,font:FONT_TITLE,col:RED,align:'center',base:'middle',weight:'400',stroke:10});
  if(ch.bossKind==='craft'){drawCraftIcon(c,W/2,340,S.t);}else drawFighter(c,ch.boss,15,W/2,420,1,{scale:1.3});text(c,'“'+(((BOSSES[ch.boss]||{}).taunt)||ch.bossTaunt||'Commencing withdrawal.')+'”',W/2,250,{size:24,font:FONT_HAND,col:PAPER,align:'center',base:'middle',weight:'400'});
  ['REMATCH','BACK TO THE BAR'].forEach((l,k)=>{text(c,(S.sel===k?'▶ ':'')+l,W/2,450+k*36,{size:28,font:FONT_TITLE,col:S.sel===k?AMBER:PAPER,align:'center',base:'middle',weight:'400',stroke:4});const hb=Input.hot(W/2-160,432+k*36,320,36);if(hb.hover)S.sel=k;if(hb.click&&S.t>.8){S.sel=k;Input.carry={confirm:true};}});};
 return S;}
function EndScene(run){const P=run.profile;const S={t:0};const lines=['TURBO & WEASEL: COOKED EDITION','','STARRING','TURBO · WEASEL · BORKMASTER · WACKY ANGUS · FREDDO','CRAZY CARL · SPACE RUSSELL CROWE · THE MONK LEADER · BIG GAZZ','AND ROBBIE WILLIAMS AS HIMSELF (ALLEGEDLY)','','FINAL LEDGER',`DEEDS ${P.deeds} · CRIMES ${P.crimes} · NET ${P.deeds-P.crimes>=0?'+':''}${P.deeds-P.crimes}`,`TAB AT THE MARKET BAR: $${P.tab}`,P.tab>0?'(BORKMASTER WOULD LIKE A WORD)':'(BORKMASTER IS SUSPICIOUS OF YOU)',`LEVEL ${P.level} · ${P.kills} ENEMIES FLOGGED · $${P.cash} IN HAND`,'','THE 109 TRAM STILL RUNS.','THE DOOR IS STILL BROKEN.','THE TAB IS STILL OPEN.','','NO AI CHARACTERS WERE HARMED. ONLY THEIR FEELINGS.','','ABSOLUTELY COOKED DIFFICULTY UNLOCKED','ALL BOSSES UNLOCKED IN SCRAP MODE','','ORIGINAL COMIC, CHARACTERS AND WORLD © KEEAN ALAVI','','ROCK AND ROLL.'];
 S.enter=function(){Audio.playTrack('win');Object.keys(BOSSES).forEach(unlockFighter);SAVE.beaten=true;save();};
 S.update=function(dt){S.t+=dt;if(S.t>3&&(Input.hit('confirm')||Input.hit('attack')||Input.hit('back')))transitionTo(TitleScene(),'page');};
 S.draw=function(c){c.fillStyle='#0d0a08';c.fillRect(0,0,W,H);const cov=getPage('cover-10');if(cov.ready){c.save();c.globalAlpha=.3;drawCover(c,cov.img,0,0,W,H);c.restore();}
  drawHero(c,'turbo',200,500,{dir:1,moving:true,step:S.t*5,scale:2});drawHero(c,'weasel',300,500,{dir:1,moving:true,step:S.t*5+1,scale:2});drawCrew(c,'borkmaster',Math.floor(S.t*4)%2+1,420,500,1,1.2);drawCrew(c,'angus',Math.floor(S.t*4)%2+1,520,500,1,1.2);drawCrew(c,'fredo',Math.floor(S.t*6)%2+1,600,500,1,1.2);
  const y0=H+40-S.t*40;lines.forEach((l,i)=>{const y=y0+i*34;if(y<-40||y>H+40)return;text(c,l,W/2,y,{size:i===0?46:22,font:i===0?FONT_TITLE:FONT_UI,col:i===0?'#f7d96a':PAPER,align:'center',base:'middle',weight:i===0?'400':'800',stroke:i===0?8:3,strokeCol:i===0?RED:INK});});
  if(y0+lines.length*34<H/2)text(c,'PRESS ATTACK',W/2,H/2,{size:30,font:FONT_TITLE,col:AMBER,align:'center',base:'middle',weight:'400'});};
 return S;}

/* ---------- scrap mode ---------- */
function ScrapSelect(){const S={t:0,step:0,p1:0,p2:1,diffI:1,arenaI:0,roster:SAVE.fighters.slice(),menu:true};const arenas=['street','servo','space','isa','moon'];
 S.update=function(dt){S.t+=dt;const n=S.roster.length;if(Input.hit('back')){if(S.step===0)setScene(TitleScene());else S.step--;return;}
  if(S.step<2){const k=S.step?'p2':'p1';if(Input.hit('right')){S[k]=(S[k]+1)%n;Audio.sfx('menu');}if(Input.hit('left')){S[k]=(S[k]+n-1)%n;Audio.sfx('menu');}}
  else{if(Input.hit('right')){S.diffI=(S.diffI+1)%4;}if(Input.hit('left')){S.diffI=(S.diffI+3)%4;}if(Input.hit('up')||Input.hit('down')){S.arenaI=(S.arenaI+1)%arenas.length;}}
  if(Input.hit('confirm')||Input.hit('attack')||Input.hit('jump')){Audio.sfx('select');if(S.step<2)S.step++;else{const id1=S.roster[S.p1],id2=S.roster[S.p2];const diff=DIFF[DIFF_ORDER[S.diffI]];
   const f=FightScene({p1:id1,p2:id2,diff,arena:arenas[S.arenaI],tag:'SCRAP MODE · '+diff.name,profile:SAVE.profile,music:'fight',timer:60},{onDone:r=>{transitionTo(ScrapSelect(),'wipe');}});transitionTo(f,'wipe');}}};
 S.draw=function(c){c.fillStyle='#120d0b';c.fillRect(0,0,W,H);halftone(c,0,0,W,H,'rgba(244,230,202,.05)',8);text(c,'SCRAP MODE',W/2,44,{size:50,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:8,strokeCol:RED});
  text(c,['PICK YOUR FIGHTER','PICK THE OTHER BASTARD','PICK THE MESS'][S.step],W/2,90,{size:22,col:PAPER,align:'center',base:'middle'});
  const id1=S.roster[S.p1],id2=S.roster[S.p2];drawFighter(c,id1,S.step===0?(Math.floor(S.t*3)%2?1:2):0,220,440,1,{scale:1.6});drawFighter(c,id2,S.step===1?(Math.floor(S.t*3)%2?1:2):0,740,440,-1,{scale:1.6});
  text(c,BOSSES[id1].name,220,470,{size:30,font:FONT_TITLE,col:TEAL,align:'center',base:'middle',weight:'400',stroke:5});text(c,BOSSES[id2].name,740,470,{size:30,font:FONT_TITLE,col:RED,align:'center',base:'middle',weight:'400',stroke:5});
  text(c,'VS',W/2,300,{size:90,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:10,strokeCol:RED});
  S.roster.forEach((id,i)=>{const x=W/2-S.roster.length*22+i*44;c.fillStyle=(S.step===0&&i===S.p1)?TEAL:(S.step===1&&i===S.p2)?RED:INK;c.fillRect(x-18,130,36,36);c.strokeStyle=PAPER;c.lineWidth=2;c.strokeRect(x-18,130,36,36);text(c,BOSSES[id].name.split(' ').pop().slice(0,3),x,148,{size:13,col:PAPER,align:'center',base:'middle'});const hb=Input.hot(x-18,130,36,36);if(hb.click&&S.step<2){S[S.step?'p2':'p1']=i;Audio.sfx('menu');}});
  // big NEXT / FIGHT button
  {const bx=W/2-110,by=H-70;c.fillStyle=AMBER;c.fillRect(bx,by,220,42);c.strokeStyle=INK;c.lineWidth=4;c.strokeRect(bx,by,220,42);text(c,S.step<2?'NEXT ▶':'FIGHT!',W/2,by+21,{size:26,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});const hb=Input.hot(bx,by,220,42);if(hb.click)Input.carry={confirm:true};}
  if(S.step===2){const hd=Input.hot(W/2-160,360,320,40);if(hd.click){if(Input.mx<W/2)S.diffI=(S.diffI+3)%4;else S.diffI=(S.diffI+1)%4;}const ha=Input.hot(W/2-160,400,320,30);if(ha.click)S.arenaI=(S.arenaI+1)%arenas.length;}
  if(S.step===2){text(c,'◀ '+DIFF[DIFF_ORDER[S.diffI]].name+' ▶',W/2,380,{size:28,font:FONT_TITLE,col:AMBER,align:'center',base:'middle',weight:'400',stroke:4});text(c,'ARENA (↑↓): '+arenas[S.arenaI].toUpperCase(),W/2,415,{size:20,col:PAPER,align:'center',base:'middle'});}
  text(c,'← → PICK · ATTACK NEXT · BACKSPACE BACK   ·   MORE FIGHTERS UNLOCK AS YOU BEAT THEM (OR TYPE BORK)',W/2,H-16,{size:14,col:PAPER,align:'center',base:'middle'});};
 return S;}

/* ---------- boot ---------- */
window.addEventListener('DOMContentLoaded',()=>{
 SAVE=loadSave()||SAVE_DEFAULT();if(!SAVE.profile)SAVE=SAVE_DEFAULT();if(!SAVE.fighters)SAVE.fighters=['turbo','weasel'];if(!SAVE.eggs)SAVE.eggs={};if(!SAVE.pages)SAVE.pages={};{const d=SAVE_DEFAULT();for(const k in d)if(SAVE[k]===undefined||SAVE[k]===null)SAVE[k]=d[k];const np=newProfile();for(const k in np)if(SAVE.profile[k]===undefined||SAVE.profile[k]===null)SAVE.profile[k]=np[k];if(typeof SAVE.profile.cash!=='number'||isNaN(SAVE.profile.cash))SAVE.profile.cash=0;}
  if(SAVE.unlockedChapter>=2&&!SAVE.scooter)SAVE.scooter={speed:0,accel:0,grip:0};
 try{const s=JSON.parse(localStorage.getItem('tw_cooked_settings'));if(s)Object.assign(G.settings,s);}catch(e){}
 if(!G.settings.keys||typeof G.settings.keys!=='object')G.settings.keys={};
 if(!['auto','high','low'].includes(G.settings.detail))G.settings.detail='auto';
 if(!['full','low'].includes(G.settings.crowds))G.settings.crowds='full';
 if(matchMedia('(prefers-reduced-motion: reduce)').matches&&localStorage.getItem('tw_cooked_settings')===null){G.settings.motion=false;G.settings.shake=false;}
 boot();
 const cv=document.getElementById('game'),drop=document.getElementById('musicdrop');
 cv.addEventListener('pointerdown',e=>{const h=G.musicHot;if(!h||!(G.scene&&G.scene.isTitle))return;const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h)drop.click();});
 window.addEventListener('keydown',e=>{if(e.code==='KeyM'){G.settings.music=G.settings.music?0:.7;if(Audio.musicGain)Audio.musicGain.gain.value=G.settings.music;if(Audio.music)Audio.music.volume=G.settings.music;}});
 setScene(LoadScene());
});
