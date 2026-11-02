/* Comic cutscene player: real comic pages, Ken Burns panel moves, hand-lettered bubbles, page turns. */
'use strict';
const SPEAKER_COL={LUCIFER:'#ff8a5b','GEAR GUY':'#b8b8b8','PLAGUE DOCTOR':'#9fe8d8',TRIXY:'#ff6ad5',SHAZZA:'#ff9ab8',TRUDY:'#7fb0ff',TURBO:'#efba56',WEASEL:'#68cbbb',BORKMASTER:'#e47f59',ROBBIE:'#c99be0',CROWE:'#d8b25f',CARL:'#df9665','MONK LEADER':'#d395af','MRS WEASEL':'#f0a8c0',ANGUS:'#c489e2',FREDDO:'#c6ab74',OFFICER:'#9aaec1',RADIO:'#bbb','BIG GAZZ':'#82b1b7',BUYER:'#aaa',CARETAKER:'#aaa','FESTIVAL CONTACT':'#f7d96a',REGULAR:'#bbb',CAPTION:'#f7d96a'};
function focusRect(focus,pw,ph){
 if(Array.isArray(focus))return {x:focus[0]*pw,y:focus[1]*ph,w:focus[2]*pw,h:focus[3]*ph};
 const third=ph/3;
 switch(focus){
  case 'top':return {x:0,y:0,w:pw,h:third*1.15};
  case 'mid':return {x:0,y:third*.95,w:pw,h:third*1.15};
  case 'bot':return {x:0,y:ph-third*1.15,w:pw,h:third*1.15};
  case 'full':default:return {x:0,y:0,w:pw,h:ph};
 }
}
function ComicScene(beats,opts={}){
 const S={beats,i:0,line:0,t:0,chars:0,done:false,onDone:opts.onDone,title:opts.title,cover:opts.cover,chapter:opts.chapter,
  from:null,to:null,moveT:1,pageTurn:0,prevPage:null,skipHeld:0,allowSkip:opts.allowSkip!==false,bubbleSide:0};
 function beat(){return S.beats[S.i];}
 function currentFocus(b){const pg=getPage(b.page);if(!pg.ready)return null;const r=focusRect(b.focus||'full',pg.img.width,pg.img.height);return r;}
 S.enter=function(){
  S.beats.forEach(b=>getPage(b.page));
  if(opts.music)Audio.playTrack(opts.music);
  S.t=0;S.line=0;S.chars=0;S.titleT=S.title?0:-1;
  Audio.sfx('page');
 };
 function startBeat(){const b=beat();if(!b){finish();return;}S.line=0;S.chars=0;S.t=0;S.bubbleSide=0;
  if(b.music)Audio.playTrack(b.music);
  if(b.sfx){setTimeout(()=>{comicWord(b.sfx,W*.5+rnd(-200,200),H*.4+rnd(-80,80),pick([AMBER,RED,'#f7d96a',TEAL]),58);Audio.sfx(b.sfx==='WOOF'?'bark':'heavy');shake(6);},250);}
  const prev=S.beats[S.i-1];S.pageTurn=(!prev||prev.page!==b.page)?1:0;if(S.pageTurn)Audio.sfx('page');
  if(S.from&&S.to&&!S.pageTurn){const k=ease(Math.min(1,S.moveT));S.from={x:lerp(S.from.x,S.to.x,k),y:lerp(S.from.y,S.to.y,k),w:lerp(S.from.w,S.to.w,k),h:lerp(S.from.h,S.to.h,k)};}// same-page beat: pan from where the camera actually is
  S.moveT=0;
 }
 function finish(){if(S.done)return;S.done=true;S.onDone&&S.onDone();}
 S.update=function(dt){if(S.done)return;
  if(S.titleT>=0){S.titleT+=dt;if(S.titleT>.6&&(Input.hit('confirm')||Input.hit('jump')||Input.hit('attack'))||S.titleT>4.5){S.titleT=-1;startBeat();}return;}
  const b=beat();if(!b){finish();return;}
  S.t+=dt;S.moveT=Math.min(1,S.moveT+dt*.9);if(S.pageTurn>0)S.pageTurn=Math.max(0,S.pageTurn-dt*2.2);
  const lines=b.lines||[];const cur=lines[S.line];
  if(cur){const full=cur[1].length;if(S.chars<full){S.chars+=dt*48;if(Math.floor(S.chars)%3===0&&G.frame%4===0)Audio.sfx('type');}}
  // hold to skip the whole scene
  if(S.allowSkip&&(Input.held('special')||Input.held('pause'))){S.skipHeld+=dt;if(S.skipHeld>1.1){finish();return;}}else S.skipHeld=0;
  const adv=Input.hit('confirm')||Input.hit('jump')||Input.hit('attack')||(S.t>7&&!cur);
  if(adv){
   if(cur&&S.chars<cur[1].length){S.chars=cur[1].length;}
   else if(S.line<lines.length-1){S.line++;S.chars=0;S.bubbleSide^=1;Audio.sfx('menu');}
   else{S.i++;if(S.i>=S.beats.length)finish();else startBeat();}
  }
 };
 S.draw=function(c){
  c.fillStyle='#1a1512';c.fillRect(0,0,W,H);
  if(S.titleT>=0){drawTitleCard(c,S);return;}
  const b=beat();if(!b)return;
  const pg=getPage(b.page);
  // page area: full-height centred page with ink gutters
  c.save();
  if(pg.ready){
   const img=pg.img,target=focusRect(b.focus||'full',img.width,img.height);
   // Ken Burns: ease from previous focus to this one, with a slow drift
   if(!S.from||S.pageTurn>0&&S.moveT===0)S.from=S.to||target;
   S.to=target;const k=ease(S.moveT);
   const fr={x:lerp(S.from.x,S.to.x,k),y:lerp(S.from.y,S.to.y,k),w:lerp(S.from.w,S.to.w,k),h:lerp(S.from.h,S.to.h,k)};
   const drift=1+.035*Math.sin(S.t*.4);
   const scale=Math.min(W/fr.w,H/fr.h)*.96*drift;const dw=fr.w*scale,dh=fr.h*scale;const dx=(W-dw)/2,dy=(H-dh)/2;
   // ink paper border behind page
   c.fillStyle='#0d0a08';c.fillRect(0,0,W,H);
   halftone(c,0,0,W,H,'rgba(255,255,255,.04)',7);
   c.save();c.beginPath();c.rect(dx-8,dy-8,dw+16,dh+16);c.clip();
   c.fillStyle=PAPER;c.fillRect(dx-8,dy-8,dw+16,dh+16);
   // draw the page region (source rect fr) into the dest rect, slightly oversized to avoid edges
   c.drawImage(img,fr.x,fr.y,fr.w,fr.h,dx,dy,dw,dh);
   c.restore();
   c.lineWidth=6;c.strokeStyle=INK;c.strokeRect(dx-8,dy-8,dw+16,dh+16);
   if(S.moveT<1){c.globalAlpha=(1-S.moveT)*.25;speedLines(c,W/2,H/2,24,1,PAPER);c.globalAlpha=1;}
   S.lastPageRect={dx,dy,dw,dh};
  }else{
   text(c,'LOADING PAGE…',W/2,H/2,{size:28,font:FONT_TITLE,align:'center',base:'middle',col:PAPER,weight:'400'});
  }
  // caption box
  if(b.caption){const lines=wrapText(c,b.caption,560,`400 20px ${FONT_HAND}`);const bh=lines.length*24+18;bubble(c,W/2-290,22,580,bh,undefined,undefined,'caption');lines.forEach((l,i)=>text(c,l,W/2,40+i*24,{size:20,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));}
  // bubbles for lines up to current
  const lines=b.lines||[];
  const shown=lines.slice(Math.max(0,S.line-1),S.line+1);
  shown.forEach((ln,idx)=>{
   const isCur=idx===shown.length-1;const [spk,txtRaw,kind='speech']=ln;
   const txt=isCur?txtRaw.slice(0,Math.floor(S.chars)):txtRaw;
   const side=(S.line-(shown.length-1-idx))%2;// alternate
   drawLineBubble(c,spk,txt,kind,side,idx,shown.length,isCur);
  });
  // page turn flash
  if(S.pageTurn>0){c.fillStyle=PAPER;c.globalAlpha=S.pageTurn*.9;c.fillRect(0,0,W,H);c.globalAlpha=1;}
  // UI hints
  text(c,S.allowSkip?'ENTER / TAP: NEXT   ·   HOLD SPECIAL: SKIP SCENE':'ENTER / TAP: NEXT',W-16,H-12,{size:14,align:'right',col:'rgba(244,230,202,.7)'});
  if(S.chapter)text(c,`ISSUE ${S.chapter.issue} · ${S.chapter.title}`,16,H-12,{size:14,col:'rgba(244,230,202,.7)'});
  if(S.skipHeld>0){c.fillStyle=INK;c.fillRect(W/2-100,H-30,200,10);c.fillStyle=AMBER;c.fillRect(W/2-100,H-30,200*Math.min(1,S.skipHeld/1.1),10);}
  c.restore();
 };
 function drawLineBubble(c,spk,txt,kind,side,idx,count,isCur){
  const col=SPEAKER_COL[spk]||PAPER;
  const maxW=360;const font=`400 21px ${FONT_HAND}`;const lines=wrapText(c,txt||' ',maxW-36,font);
  const bw=Math.max(170,Math.min(maxW,Math.max(...lines.map(l=>{c.font=font;return c.measureText(l).width;}))+40)),bh=lines.length*24+40;
  const px=side?W-bw-30:30;
  const py=count===2&&idx===0?H-bh-150:H-bh-40;
  const alpha=isCur?1:.78;c.save();c.globalAlpha=alpha;
  if(kind==='caption'){bubble(c,px,py,bw,bh,undefined,undefined,'caption');lines.forEach((l,i)=>text(c,l,px+bw/2,py+30+i*24,{size:20,font:FONT_HAND,col:INK,align:'center',base:'middle',weight:'400'}));c.restore();return;}
  if(kind==='radio'){c.fillStyle=INK;c.fillRect(px,py,bw,bh);c.strokeStyle=PAPER;c.lineWidth=2;c.setLineDash([6,4]);c.strokeRect(px+4,py+4,bw-8,bh-8);c.setLineDash([]);}
  else{const tx=side?px+bw-20:px+20,ty=py-26;bubble(c,px,py,bw,bh,tx,ty,kind==='thought'?'thought':kind==='shout'?'shout':'speech');}
  // speaker tag
  const tagW=c.measureText(spk).width+26;c.font=`800 15px ${FONT_UI}`;const tw=c.measureText(spk).width+22;
  c.fillStyle=col;c.fillRect(px+14,py-11,tw,22);c.strokeStyle=INK;c.lineWidth=2.5;c.strokeRect(px+14,py-11,tw,22);
  text(c,spk,px+25,py,{size:15,col:INK,base:'middle'});
  lines.forEach((l,i)=>text(c,l,px+bw/2,py+30+i*24,{size:21,font:FONT_HAND,col:kind==='radio'?PAPER:INK,align:'center',base:'middle',weight:kind==='shout'?'700':'400'}));
  c.restore();
 }
 return S;
}
/* Chapter title card: cover art slides in, big yellow lettering with red drop, issue badge. */
function drawTitleCard(c,S){
 const t=S.titleT;const ch=S.chapter;const cov=S.cover?getPage(S.cover):null;
 c.fillStyle='#0d0a08';c.fillRect(0,0,W,H);
 const slide=easeOut(Math.min(1,t/.6));
 if(cov&&cov.ready){const img=cov.img;const h=H*1.02,w=img.width/img.height*h;const x=lerp(-w,W*.08,slide);c.save();c.globalAlpha=1;c.drawImage(img,x,-H*.01,w,h);c.restore();
  // halftone + angled ink wedge on the right for the title block
  c.fillStyle=INK;c.beginPath();c.moveTo(W*.46,0);c.lineTo(W,0);c.lineTo(W,H);c.lineTo(W*.40,H);c.closePath();c.fill();
  halftone(c,W*.42,0,W*.58,H,'rgba(244,230,202,.06)',6);}
 const tx=W*.72,appear=easeOut(clamp((t-.4)/.5,0,1));
 c.save();c.globalAlpha=appear;c.translate(0,(1-appear)*40);
 text(c,`ISSUE #${ch.issue}`,tx,120,{size:30,font:FONT_TITLE,col:RED,align:'center',weight:'400',stroke:6,strokeCol:INK});
 const words=ch.title.split(' ');let y=190;let line='';const linesOut=[];for(const w of words){if((line+' '+w).trim().length>14){linesOut.push(line.trim());line=w;}else line+=' '+w;}if(line.trim())linesOut.push(line.trim());
 linesOut.forEach((l,i)=>text(c,l,tx,y+i*64,{size:60,font:FONT_TITLE,col:'#f7d96a',align:'center',weight:'400',stroke:9,strokeCol:RED,shadow:0}));
 text(c,ch.sub,tx,y+linesOut.length*64+10,{size:22,col:PAPER,align:'center'});
 c.restore();
 if(t>1.2){text(c,'PRESS START',tx,H-50,{size:22,font:FONT_TITLE,col:(Math.sin(t*6)>0)?AMBER:PAPER,align:'center',weight:'400'});}
}
