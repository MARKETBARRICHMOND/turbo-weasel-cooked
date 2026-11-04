/* TURBO & WEASEL: COOKED EDITION — core engine
   Canvas 960x540 logical. Plain scripts (no modules) so it runs from file:// too. */
'use strict';
const W=960,H=540;
const G={
 canvas:null,ctx:null,time:0,dt:0,frame:0,scene:null,next:null,
 shake:0,shakeX:0,shakeY:0,flash:0,flashCol:'#fff',hitstop:0,
 fx:[],words:[],floaters:[],
 img:{},pages:{},pageMeta:{},
 touch:false,reduced:false,
 settings:{sfx:.8,music:.7,shake:true,blood:true,subtitles:true},
};
const hexA=(h,a)=>`rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?2*t*t:-1+(4-2*t)*t;
const easeOut=t=>1-Math.pow(1-t,3);
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;
function seeded(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

/* ---------- assets ---------- */
const SPRITE_FILES={heroes:'heroes-v2.webp',enemies:'enemies-v2.webp',environments:'environments-v2.webp',expansion:'expansion-v3.webp',crew:'crew-v1.webp'};
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('load '+src));i.src=src;});}
async function loadSprites(progress){
 const files={...SPRITE_FILES};
 for(const [k,v] of Object.entries(ATLAS.fight))files['fight_'+k]=v.file;
 const keys=Object.keys(files);let n=0;
 await Promise.all(keys.map(async k=>{try{G.img[k]=await loadImage('assets/sprites/'+files[k]);}catch(e){console.warn(e.message);}n++;progress&&progress(n/keys.length);}));
}
// Comic pages: hi-res (assets/pages/*.webp) preferred, low-res fallback (assets/comic/*.jpg)
const pageCache={};
function pageSrc(id){return (typeof PAGE_FILES!=='undefined'&&PAGE_FILES[id])?'assets/pages/'+PAGE_FILES[id]:'assets/comic/'+id+'.jpg';}
function getPage(id){
 if(pageCache[id])return pageCache[id];
 const entry={img:null,ready:false};pageCache[id]=entry;
 loadImage(pageSrc(id)).then(i=>{entry.img=i;entry.ready=true;}).catch(()=>{if(pageSrc(id).includes('pages/'))loadImage('assets/comic/'+id+'.jpg').then(i=>{entry.img=i;entry.ready=true;}).catch(()=>{});});
 return entry;
}
function preloadPages(ids){ids.forEach(getPage);}

/* ---------- input ---------- */
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',KeyL:'jump',KeyZ:'jump',KeyJ:'attack',KeyX:'attack',KeyK:'special',KeyC:'special',Enter:'confirm',Escape:'pause',KeyP:'pause',Backspace:'back',KeyM:'mute',Tab:'menu'};
const Input={
 down:{},pressed:{},released:{},axisX:0,axisY:0,typed:'',konami:0,history:[],
 init(){
  window.addEventListener('keydown',e=>{
   if(e.repeat)return;const k=KEYMAP[e.code];
   Input.typed=(Input.typed+e.key.toUpperCase()).slice(-12);
   const KON=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
   Input.konami=e.code===KON[Input.konami]?Input.konami+1:(e.code===KON[0]?1:0);
   if(Input.konami>=KON.length){Input.konami=0;Input.cheat=true;}
   if(k){Input.down[k]=true;Input.pressed[k]=true;if(['jump','attack','special','up','down','left','right','confirm','pause','back','menu'].includes(k))e.preventDefault();}
   Input.any=true;
  });
  window.addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k){Input.down[k]=false;Input.released[k]=true;}});
  window.addEventListener('blur',()=>{for(const k in Input.down)Input.down[k]=false;});
  // touch
  const touch=document.getElementById('touch');
  const isTouch=matchMedia('(pointer:coarse)').matches||'ontouchstart'in window&&navigator.maxTouchPoints>0;
  // fullscreen button (all devices): real fullscreen when allowed, else say why not
  const fsb=document.getElementById('fsbtn');if(fsb)fsb.addEventListener('click',e=>{e.stopPropagation();goFullscreen(true);});
  const fsSync=()=>document.body.classList.toggle('fs',!!(document.fullscreenElement||document.webkitFullscreenElement));document.addEventListener('fullscreenchange',fsSync);document.addEventListener('webkitfullscreenchange',fsSync);
  if(isTouch){G.touch=true;touch.hidden=false;document.body.classList.add('touch');
   const orient=()=>{document.body.classList.toggle('portrait',innerHeight>innerWidth);setTimeout(measureTouchHud,60);};orient();addEventListener('resize',orient);addEventListener('orientationchange',()=>setTimeout(orient,150));
   document.getElementById('rotate').addEventListener('pointerdown',()=>document.body.classList.add('dismissed'));
   // first tap: go fullscreen + try to lock landscape (Android; iOS ignores quietly)
   const fs=()=>{goFullscreen(false);removeEventListener('pointerdown',fs);};
   addEventListener('pointerdown',fs);}
  // Phones: kill double-tap zoom and pinch zoom-in in script too (iPhone Safari ignores the viewport flags); when zoomed anyway, allow the pinch-out.
  Input.lastTouchEnd=-1e9;
  document.addEventListener('touchend',e=>{const n=performance.now();if(n-Input.lastTouchEnd<350&&!G.zoomed&&e.cancelable)e.preventDefault();Input.lastTouchEnd=n;},{passive:false});
  document.addEventListener('touchmove',e=>{if(e.touches.length>1&&!G.zoomed&&e.cancelable)e.preventDefault();},{passive:false});
  ['gesturestart','gesturechange'].forEach(t=>document.addEventListener(t,e=>{if(!G.zoomed)e.preventDefault();}));
  if(window.visualViewport){const vv=window.visualViewport;const zc=()=>zoomCheck(vv.scale||1);vv.addEventListener('resize',zc);vv.addEventListener('scroll',zc);setTimeout(zc,500);}
  const stick=document.getElementById('stick'),knob=stick.querySelector('.knob');let sid=null,sc=null;
  const stickMove=(x,y)=>{const r=stick.getBoundingClientRect();let dx=(x-(r.left+r.width/2))/(r.width/2),dy=(y-(r.top+r.height/2))/(r.height/2);const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}knob.style.transform=`translate(${dx*r.width*.3}px,${dy*r.height*.3}px)`;const L=dx<-.35,R=dx>.35,U=dy<-.5,D=dy>.5;for(const [k,v] of [['left',L],['right',R],['up',U],['down',D]]){if(v&&!Input.down[k])Input.pressed[k]=true;Input.down[k]=v;}};
  stick.addEventListener('pointerdown',e=>{sid=e.pointerId;stick.setPointerCapture(sid);stickMove(e.clientX,e.clientY);});
  stick.addEventListener('pointermove',e=>{if(e.pointerId===sid)stickMove(e.clientX,e.clientY);});
  const stickEnd=e=>{if(e.pointerId===sid){sid=null;knob.style.transform='';['left','right','up','down'].forEach(k=>Input.down[k]=false);}};
  stick.addEventListener('pointerup',stickEnd);stick.addEventListener('pointercancel',stickEnd);
  touch.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();Input.down[k]=true;Input.pressed[k]=true;if(k==='jump'||k==='attack')Input.pressed.confirm=true;Input.any=true;});const up=()=>{Input.down[k]=false;Input.released[k]=true;};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);});
  // canvas clicks = confirm/advance
  G.canvas.addEventListener('pointerdown',e=>{if(!(G.scene&&G.scene.menu))Input.pressed.confirm=true;Input.pressed.click=true;Input.any=true;const r=G.canvas.getBoundingClientRect();Input.mx=(e.clientX-r.left)/r.width*W;Input.my=(e.clientY-r.top)/r.height*H;});
  G.canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')Input.moved=true;const r=G.canvas.getBoundingClientRect();Input.mx=(e.clientX-r.left)/r.width*W;Input.my=(e.clientY-r.top)/r.height*H;});
 },
 poll(){
  const gp=navigator.getGamepads?navigator.getGamepads()[0]:null;
  if(gp){const ax=gp.axes[0]||0,ay=gp.axes[1]||0;const map={left:ax<-.4||gp.buttons[14]?.pressed,right:ax>.4||gp.buttons[15]?.pressed,up:ay<-.5||gp.buttons[12]?.pressed,down:ay>.5||gp.buttons[13]?.pressed,jump:gp.buttons[0]?.pressed,attack:gp.buttons[2]?.pressed,special:gp.buttons[1]?.pressed||gp.buttons[3]?.pressed,pause:gp.buttons[9]?.pressed,back:gp.buttons[8]?.pressed||(gp.buttons[1]?.pressed&&!!(G.scene&&G.scene.menu)),confirm:gp.buttons[0]?.pressed};
   for(const k in map){const v=!!map[k];if(v&&!Input.gp?.[k])Input.pressed[k]=true;if(!v&&Input.gp?.[k])Input.released[k]=true;}
   Input.gp=map;for(const k in map)if(map[k])Input.down[k]=true;else if(Input.gpPrev?.[k])Input.down[k]=false;Input.gpPrev=map;}
 },
 flush(){Input.pressed=Input.carry||{};Input.carry=null;Input.released={};Input.moved=false;},
 hot(x,y,w,h){const inside=Input.mx>=x&&Input.mx<=x+w&&Input.my>=y&&Input.my<=y+h;return {hover:inside&&Input.moved,click:inside&&!!Input.pressed.click};},
 hit(k){return !!Input.pressed[k];},
 held(k){return !!Input.down[k];}
};

const SHARE_URL='https://marketbarrichmond.github.io/turbo-weasel-cooked/';// the full-fat hosted copy (GitHub Pages): fullscreen + Add to Home Screen work there
function fsHelp(){
 let d=document.getElementById('fshelp');if(d){d.hidden=false;return;}
 d=document.createElement('div');d.id='fshelp';
 d.innerHTML='<h2>FULLSCREEN IS BLOCKED IN HERE</h2><p>This page keeps the game in a little frame. The full-fat version lives at its own address below: open it in Safari or Chrome, then Share → Add to Home Screen and it runs fullscreen like an app.</p><input readonly value="'+SHARE_URL+'"><div class="row"><button id="fscopy">COPY LINK</button><button id="fsopen">OPEN IN BROWSER</button><button id="fsclose">NAH, PLAY SMALL</button></div>';
 document.body.appendChild(d);
 d.querySelector('#fscopy').onclick=async e=>{e.stopPropagation();try{await navigator.clipboard.writeText(SHARE_URL);e.target.textContent='COPIED';}catch(err){const i=d.querySelector('input');i.focus();i.select();}};
 d.querySelector('#fsopen').onclick=e=>{e.stopPropagation();try{window.open(SHARE_URL,'_blank');}catch(err){}try{top.location.href=SHARE_URL;}catch(err){}};
 d.querySelector('#fsclose').onclick=e=>{e.stopPropagation();d.hidden=true;};
 d.addEventListener('pointerdown',e=>e.stopPropagation());
}
// no fullscreen API here (iPhone Safari): a quick toast instead of opening a duplicate tab
function fsTip(msg,ms){let d=document.getElementById('fstip');if(!d){d=document.createElement('div');d.id='fstip';document.body.appendChild(d);}const ios=/iPhone|iPod/.test(navigator.userAgent);d.textContent=msg||(ios?'IPHONE SAFARI HAS NO FULLSCREEN. SHARE → ADD TO HOME SCREEN FOR THE FULL-FAT VERSION.':'FULLSCREEN IS NOT SUPPORTED IN THIS BROWSER. TRY CHROME OR SAFARI.');d.hidden=false;clearTimeout(fsTip.t);fsTip.t=setTimeout(()=>{d.hidden=true;},ms||5000);}
function hideTip(){const d=document.getElementById('fstip');if(d)d.hidden=true;clearTimeout(fsTip.t);}
// If the page still gets zoomed (iPhone Safari ignores user-scalable=no), flag it, let a pinch-out through, and tell the player.
function zoomCheck(scale){const z=scale>1.04;if(z===!!G.zoomed)return;G.zoomed=z;document.body.classList.toggle('zoomed',z);if(z)fsTip('ZOOMED IN BY ACCIDENT? PINCH OUT TO RESET',8000);else hideTip();}
// how much of the canvas the phone's DOM buttons cover (canvas px): right column (pause/fullscreen), bottom (action buttons), left (stick). HUDs lean away from them.
function measureTouchHud(){G.hudR=0;G.hudB=0;G.hudL=0;if(!G.touch||!G.canvas)return;try{const r=G.canvas.getBoundingClientRect();if(!r.width)return;const s=W/r.width;let left=Infinity,top=Infinity,right=-Infinity;['tpause','fsbtn'].forEach(id=>{const b=document.getElementById(id);if(!b)return;const q=b.getBoundingClientRect();if(q.width&&q.top<r.top+r.height*.4)left=Math.min(left,q.left);});document.querySelectorAll('#btns button').forEach(b=>{const q=b.getBoundingClientRect();if(q.width)top=Math.min(top,q.top);});const st=document.getElementById('stick');if(st){const q=st.getBoundingClientRect();if(q.width)right=q.right;}if(left<r.right)G.hudR=Math.ceil((r.right-left)*s)+8;if(top<r.bottom)G.hudB=Math.ceil((r.bottom-top)*s)+8;if(right>r.left)G.hudL=Math.ceil((right-r.left)*s)+8;}catch(e){}}
function goFullscreen(popOut){
 const el=document.documentElement;const inFrame=window.self!==window.top;
 const lock=()=>{try{screen.orientation?.lock?.('landscape').catch(()=>{});}catch(e){}};
 const fail=()=>{if(!popOut)return;if(inFrame)fsHelp();else fsTip();};
 let p=null;try{p=(el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen)?.call(el);}catch(e){}
 if(p&&p.then){p.then(lock).catch(fail);}
 else if(document.fullscreenElement||document.webkitFullscreenElement)lock();
 else fail();
}
/* ---------- audio ---------- */
const Audio={
 ctx:null,master:null,sfxGain:null,musicGain:null,music:null,playlist:[],trackIndex:0,userMusic:false,chip:null,
 init(){
  const unlock=()=>{if(Audio.ctx)return;try{Audio.ctx=new (window.AudioContext||window.webkitAudioContext)();Audio.master=Audio.ctx.createGain();Audio.master.connect(Audio.ctx.destination);Audio.sfxGain=Audio.ctx.createGain();Audio.sfxGain.gain.value=G.settings.sfx;Audio.sfxGain.connect(Audio.master);Audio.musicGain=Audio.ctx.createGain();Audio.musicGain.gain.value=G.settings.music;Audio.musicGain.connect(Audio.master);}catch(e){}
   window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);Audio.resume();Audio.loadSamples();Audio.wake();};
  window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);
  // phones suspend the audio context after a lock screen / silent switch / call: any tap or key wakes it again
  const nudge=()=>{if(Audio.ctx&&Audio.ctx.state!=='running')Audio.wake();};window.addEventListener('pointerdown',nudge);window.addEventListener('keydown',nudge);
  // tab/app switch: pause whatever's running so nobody dies while the phone is in a pocket, park the music, bring it back on return
  document.addEventListener('visibilitychange',()=>{if(document.hidden){const sc=G.scene;if(sc&&sc.autoPause&&!sc.done)sc.autoPause();Audio.sleep();}else Audio.wake();});
  fetch('sfx/manifest.json').then(r=>r.ok?r.json():null).then(j=>{if(j){Audio.sampleFiles=j.sounds||j;Audio.loadSamples();}}).catch(()=>{});
  fetch('music/playlist.json').then(r=>r.ok?r.json():null).then(j=>{if(j&&j.tracks&&j.tracks.length){Audio.playlist=j.tracks.map(t=>typeof t==='string'?{file:t,title:t}:t);Audio.userMusic=true;}}).catch(()=>{});
  const drop=document.getElementById('musicdrop');drop.addEventListener('change',()=>{const files=[...drop.files];if(!files.length)return;Audio.playlist=files.map(f=>({file:URL.createObjectURL(f),title:f.name.replace(/\.[^.]+$/,'')}));Audio.userMusic=true;Audio.trackIndex=0;Audio.playTrack('menu',true);});
 },
 resume(){if(Audio.ctx&&Audio.ctx.state!=='running'){try{const p=Audio.ctx.resume();if(p&&p.catch)p.catch(()=>{});}catch(e){}}},
 sleep(){if(Audio.music)Audio.music.pause();Audio.stopChip();},
 wake(){Audio.resume();if(Audio.music){if(Audio.music.paused)Audio.music.play().catch(()=>{});}else if(Audio.mood&&!Audio.chip)Audio.startChip(Audio.mood);},
 tone(f,dur,type='square',vol=.3,slide=0,delay=0){if(!Audio.ctx)return;const c=Audio.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,c.currentTime+delay);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),c.currentTime+delay+dur);g.gain.setValueAtTime(vol,c.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+delay+dur);o.connect(g);g.connect(Audio.sfxGain);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+dur+.02);},
 noise(dur,vol=.3,delay=0,hp=400){if(!Audio.ctx)return;const c=Audio.ctx,b=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=hp;const g=c.createGain();g.gain.value=vol;s.connect(f);f.connect(g);g.connect(Audio.sfxGain);s.start(c.currentTime+delay);},
 samples:{},sampleFiles:null,
 loadSamples(){if(!Audio.ctx||Audio.sampleFiles===null)return;const files=Audio.sampleFiles;Audio.sampleFiles=null;for(const name in files){const list=[].concat(files[name]);Audio.samples[name]=[];list.forEach(f=>fetch('sfx/'+f).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>Audio.ctx.decodeAudioData(b)).then(buf=>Audio.samples[name].push(buf)).catch(()=>{}));}},
 playSample(name){const l=Audio.samples[name];if(!l||!l.length||!Audio.ctx)return false;const c=Audio.ctx,s=c.createBufferSource();s.buffer=pick(l);const g=c.createGain();g.gain.value=1;s.connect(g);g.connect(Audio.sfxGain);s.start();return true;},
 sfx(name){
  if(Audio.playSample(name))return;
  switch(name){
   case 'jump':Audio.tone(300,.15,'square',.15,300);break;
   case 'shoot':Audio.tone(900,.08,'sawtooth',.12,-600);Audio.noise(.05,.1,0,2000);break;
   case 'heavy':Audio.tone(200,.2,'sawtooth',.2,-120);Audio.noise(.12,.2,0,300);break;
   case 'hit':Audio.noise(.1,.3,0,800);Audio.tone(140,.1,'square',.2,-80);break;
   case 'punch':Audio.noise(.08,.35,0,600);Audio.tone(110,.12,'triangle',.3,-60);break;
   case 'block':Audio.tone(500,.06,'square',.12);break;
   case 'hurt':Audio.tone(220,.25,'sawtooth',.25,-150);break;
   case 'die':Audio.tone(300,.6,'sawtooth',.3,-280);Audio.noise(.4,.3,.1,200);break;
   case 'pickup':Audio.tone(700,.08,'square',.15);Audio.tone(1050,.12,'square',.15,0,.07);break;
   case 'cash':Audio.tone(1200,.06,'square',.12);Audio.tone(1600,.1,'square',.12,0,.06);Audio.tone(2000,.14,'square',.1,0,.12);break;
   case 'explode':Audio.noise(.5,.5,0,80);Audio.tone(60,.5,'sawtooth',.4,-40);break;
   case 'ko':Audio.tone(80,.8,'sawtooth',.5,-60);Audio.noise(.6,.5,0,100);break;
   case 'menu':Audio.tone(600,.05,'square',.1);break;
   case 'select':Audio.tone(500,.08,'square',.12);Audio.tone(750,.12,'square',.12,0,.08);break;
   case 'bark':Audio.tone(400,.08,'sawtooth',.25,-200);Audio.tone(350,.1,'sawtooth',.2,-200,.1);break;
   case 'level':[523,659,784,1046].forEach((f,i)=>Audio.tone(f,.25,'square',.15,0,i*.09));break;
   case 'round':Audio.tone(220,.3,'square',.2);Audio.tone(330,.3,'square',.2,0,.25);Audio.tone(440,.5,'square',.25,0,.5);break;
   case 'special':Audio.tone(200,.4,'sawtooth',.3,900);Audio.noise(.3,.2,0,1500);break;
   case 'page':Audio.noise(.18,.12,0,1200);break;
   case 'type':Audio.tone(1800,.02,'square',.04);break;
   case 'tick':Audio.tone(1000,.03,'square',.1);break;
   case 'win':[392,523,659,784,1046].forEach((f,i)=>Audio.tone(f,.3,'square',.2,0,i*.12));break;
   case 'lose':[400,350,300,200].forEach((f,i)=>Audio.tone(f,.35,'sawtooth',.2,0,i*.2));break;
   case 'glitch':for(let i=0;i<6;i++)Audio.tone(rnd(200,2000),.05,'square',.1,0,i*.04);break;
   case 'cone':Audio.noise(.6,.15,0,300);Audio.tone(90,.5,'sine',.2,30);break;
   case 'coin':Audio.tone(1500,.05,'square',.1);Audio.tone(2200,.15,'square',.1,0,.05);break;
  }
 },
 setVolumes(){if(Audio.sfxGain)Audio.sfxGain.gain.value=G.settings.sfx;if(Audio.musicGain)Audio.musicGain.gain.value=G.settings.music;if(Audio.music)Audio.music.volume=G.settings.music;},
 // Music: user tracks (HTMLAudio) when supplied, otherwise a small procedural chip-tune per mood.
 playTrack(mood='menu',force=false){
  if(Audio.mood===mood&&!force)return;Audio.mood=mood;
  if(Audio.userMusic&&Audio.playlist.length){
   const moods=t=>String(Array.isArray(t.mood)?t.mood.join(','):(t.mood||'')).toLowerCase().split(/[,\s]+/).filter(Boolean);
   const pref=Audio.playlist.find(t=>moods(t).includes(mood));
   const t=pref||Audio.playlist[Audio.trackIndex%Audio.playlist.length];if(!pref)Audio.trackIndex++;
   if(Audio.music&&Audio.currentFile===t.file&&!Audio.music.paused&&!force)return;// same song for this mood: let it ride
   Audio.stopChip();if(Audio.music){Audio.music.pause();}
   const a=new window.Audio(t.file);a.loop=!!pref;a.volume=G.settings.music;a.onended=()=>{if(!a.loop)Audio.playTrack(mood,true);};a.play().catch(()=>{});Audio.music=a;Audio.currentFile=t.file;Audio.nowPlaying=t.title;return;
  }
  Audio.nowPlaying=null;Audio.startChip(mood);
 },
 stopMusic(){if(Audio.music){Audio.music.pause();Audio.music=null;}Audio.stopChip();Audio.mood=null;},
 // tiny sequencer: bass + lead + hat
 CHIP:{
  menu:{bpm:118,bass:[0,0,7,0,5,5,3,3],lead:[12,15,19,15,12,10,7,10, 12,15,19,22,19,15,12,10],root:41.2},
  street:{bpm:150,bass:[0,0,0,12,0,0,10,0],lead:[7,7,10,12,10,7,5,7, 3,3,7,10,7,5,3,5],root:55},
  space:{bpm:132,bass:[0,7,0,7,5,12,3,10],lead:[0,3,7,12,7,3,15,12, 10,7,5,3,7,10,12,15],root:49},
  moon:{bpm:128,bass:[0,0,1,1,0,0,3,3],lead:[12,11,12,15,12,11,8,7, 12,11,12,15,19,18,15,12],root:46.2},
  boss:{bpm:170,bass:[0,0,3,0,5,0,3,0],lead:[12,12,15,12,17,15,12,10, 12,12,15,19,17,15,12,10],root:43.6},
  fight:{bpm:160,bass:[0,0,7,0,0,0,10,8],lead:[7,10,12,10,7,10,15,12, 7,10,12,14,15,14,12,10],root:55},
  glitch:{bpm:110,bass:[0,0,6,6,0,0,1,1],lead:[12,13,12,18,12,13,6,7, 12,13,12,18,24,13,6,7],root:46.2},
  win:{bpm:140,bass:[0,0,5,5,7,7,5,5],lead:[12,16,19,24,19,16,12,16, 14,17,21,26,21,17,14,17],root:65.4},
  bonus:{bpm:165,bass:[0,0,5,5,7,7,0,0],lead:[12,14,16,19,16,14,12,14, 12,14,16,19,21,19,16,14],root:65.4},
 },
 startChip(mood){
  Audio.stopChip();if(!Audio.ctx)return;const def=Audio.CHIP[mood]||Audio.CHIP.menu;const c=Audio.ctx;
  const g=c.createGain();g.gain.value=.22;g.connect(Audio.musicGain);
  const state={step:0,timer:null,gain:g};Audio.chip=state;
  const stepTime=60/def.bpm/2;
  const note=(semi,dur,type,vol,t)=>{const o=c.createOscillator(),e=c.createGain();o.type=type;o.frequency.value=def.root*Math.pow(2,semi/12);e.gain.setValueAtTime(vol,t);e.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(e);e.connect(g);o.start(t);o.stop(t+dur+.01);};
  const hat=(t,vol)=>{const b=c.createBuffer(1,c.sampleRate*.03,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=6000;const e=c.createGain();e.gain.value=vol;s.connect(f);f.connect(e);e.connect(g);s.start(t);};
  let nextTime=c.currentTime+.05;
  const tick=()=>{while(nextTime<c.currentTime+.25){const s=state.step;const b=def.bass[s%def.bass.length],l=def.lead[s%def.lead.length];
    if(s%2===0)note(b,stepTime*1.8,'triangle',.5,nextTime);
    note(l+12,stepTime*.9,'square',.18,nextTime);
    hat(nextTime,s%4===2?.25:.08);
    if(s%8===0){const b2=c.createOscillator(),e=c.createGain();b2.type='sine';b2.frequency.setValueAtTime(120,nextTime);b2.frequency.exponentialRampToValueAtTime(40,nextTime+.15);e.gain.setValueAtTime(.7,nextTime);e.gain.exponentialRampToValueAtTime(.001,nextTime+.2);b2.connect(e);e.connect(g);b2.start(nextTime);b2.stop(nextTime+.22);}
    state.step++;nextTime+=stepTime;}
   state.timer=setTimeout(tick,100);};
  tick();
 },
 stopChip(){if(Audio.chip){clearTimeout(Audio.chip.timer);try{Audio.chip.gain.gain.setTargetAtTime(0,Audio.ctx.currentTime,.05);}catch(e){}Audio.chip=null;}},
};

/* ---------- drawing helpers ---------- */
const FONT_TITLE="'Turbo Weasel Tag','Bangers','Impact','Arial Black',sans-serif";
const FONT_TITLE_UI="'Bangers','Impact','Arial Black',sans-serif";
const FONT_COMIC="'Boogaloo','Bangers','Impact',sans-serif"; // modern printed-comic lettering: dialogue, menus, mid-size UI
const FONT_HAND=FONT_COMIC;
const FONT_UI="'Barlow Condensed','Arial Narrow',sans-serif";
const INK='#17242b',PAPER='#f4e6ca',AMBER='#efba56',TEAL='#68cbbb',RED='#de755f',GREEN='#365c4a',VIOLET='#9974aa';
function text(c,s,x,y,o={}){
 const {size=20,font=FONT_UI,col=PAPER,align='left',base='alphabetic',stroke=0,strokeCol=INK,weight='800',alpha=1,shadow=0,maxW}=o;
 s=String(s);
 const fnt=(font===FONT_TITLE&&/^[\d\s:$×.%+\-\/]+$/.test(s))?FONT_TITLE_UI:(font===FONT_TITLE&&size<34)?FONT_COMIC:font;
 // graffiti titles with digits in them: digits are drawn in Bangers so a 1 never reads as a 2
 if(fnt===FONT_TITLE&&/\d/.test(s)&&!maxW){const runs=s.match(/\d+|\D+/g);c.save();c.font=`${weight} ${size}px ${FONT_TITLE}`;let tot=0;const ws=runs.map(r=>{c.font=`${weight} ${size}px ${/^\d/.test(r)?FONT_TITLE_UI:FONT_TITLE}`;const w=c.measureText(r).width;tot+=w;return w;});c.restore();
  let cx=align==='center'?x-tot/2:align==='right'?x-tot:x;runs.forEach((r,i)=>{text(c,r,cx,y,{...o,align:'left',font:/^\d/.test(r)?FONT_TITLE_UI:FONT_TITLE});cx+=ws[i];});return;}
 c.save();c.globalAlpha=alpha;c.font=`${weight} ${size}px ${fnt}`;c.textAlign=align;c.textBaseline=base;
 if(shadow){c.fillStyle=strokeCol;c.fillText(s,x+shadow,y+shadow,maxW);}
 if(stroke){c.lineJoin='round';c.lineWidth=stroke;c.strokeStyle=strokeCol;c.strokeText(s,x,y,maxW);}
 c.fillStyle=col;c.fillText(s,x,y,maxW);c.restore();
}
// Shared pause overlay with tappable buttons (sets S.pauseAct='resume'|'quit' for the scene's update to act on)
function drawPauseMenu(c,S,hint){c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,0,W,H);text(c,'PAUSED',W/2,H/2-80,{size:64,font:FONT_TITLE,col:'#f7d96a',align:'center',base:'middle',weight:'400',stroke:8});
 [['KEEP GOING','resume'],['QUIT','quit']].forEach(([l,k],i)=>{const x=W/2-180+i*200,y=H/2-20,w=160,h=46;const hb=Input.hot(x,y,w,h);c.fillStyle=hb.hover?AMBER:PAPER;c.fillRect(x,y,w,h);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(x,y,w,h);text(c,l,x+w/2,y+h/2,{size:24,font:FONT_COMIC,weight:'400',col:INK,align:'center',base:'middle'});if(hb.click)S.pauseAct=k;});
 text(c,G.touch?'TAP A BUTTON · II RESUMES':'ESC: RESUME · BACKSPACE: QUIT',W/2,H/2+52,{size:16,col:PAPER,align:'center',base:'middle'});if(hint)text(c,hint,W/2,H/2+84,{size:13,col:PAPER,align:'center',base:'middle',maxW:W-80});}
function wrapText(c,s,maxW,font){c.font=font;const words=s.split(' '),lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(c.measureText(t).width>maxW&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);return lines;}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function panelFrame(c,x,y,w,h,lw=6){c.save();c.lineWidth=lw;c.strokeStyle=INK;c.strokeRect(x,y,w,h);c.restore();}
// Speech bubble: ellipse-ish rounded box with tail toward (tx,ty). kind: 'speech'|'thought'|'shout'|'caption'
function bubble(c,x,y,w,h,tx,ty,kind='speech',fill=PAPER){
 c.save();c.lineWidth=3;c.strokeStyle=INK;c.fillStyle=fill;
 if(kind==='shout'){c.beginPath();const cx=x+w/2,cy=y+h/2,n=18;for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2,r=i%2?1:1.18;const px=cx+Math.cos(a)*(w/2)*r,py=cy+Math.sin(a)*(h/2)*r;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fill();c.stroke();}
 else if(kind==='caption'){c.fillStyle='#f7d96a';c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h);}
 else{
  if(kind==='speech'&&tx!==undefined){const cx=x+w/2,cy=y+h/2;const ang=Math.atan2(ty-cy,tx-cx);const bx=cx+Math.cos(ang)*w*.42,by=cy+Math.sin(ang)*h*.42;const px=-Math.sin(ang)*10,py=Math.cos(ang)*10;c.beginPath();c.moveTo(bx+px,by+py);c.lineTo(tx,ty);c.lineTo(bx-px,by-py);c.closePath();c.fill();c.stroke();}
  roundRect(c,x,y,w,h,Math.min(22,h/2));c.fill();c.stroke();
  if(kind==='speech'&&tx!==undefined){const cx=x+w/2,cy=y+h/2;const ang=Math.atan2(ty-cy,tx-cx);const bx=cx+Math.cos(ang)*w*.42,by=cy+Math.sin(ang)*h*.42;const px=-Math.sin(ang)*10,py=Math.cos(ang)*10;c.beginPath();c.moveTo(bx+px,by+py);c.lineTo(tx,ty);c.lineTo(bx-px,by-py);c.fill();}
  if(kind==='thought'){for(let i=1;i<=3;i++){const t=i/4;const px=lerp(x+w/2,tx,t),py=lerp(y+h,ty,t);c.beginPath();c.arc(px,py,8-i*2,0,Math.PI*2);c.fill();c.stroke();}}
 }
 c.restore();
}
function halftone(c,x,y,w,h,col='rgba(0,0,0,.25)',step=6){c.save();c.fillStyle=col;for(let yy=y;yy<y+h;yy+=step)for(let xx=x+(((yy-y)/step)%2)*step/2;xx<x+w;xx+=step){c.beginPath();c.arc(xx,yy,1.2,0,Math.PI*2);c.fill();}c.restore();}
function speedLines(c,cx,cy,n=40,alpha=.5,col=INK){c.save();c.globalAlpha=alpha;c.strokeStyle=col;c.lineWidth=2;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+Math.sin(G.time+i)*.02,r0=rnd(180,260),r1=700;c.beginPath();c.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);c.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);c.stroke();}c.restore();}
function vignette(c,a=.55){const g=c.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${a})`);c.fillStyle=g;c.fillRect(0,0,W,H);}
function drawCover(c,img,x,y,w,h){// cover-fit draw
 const s=Math.max(w/img.width,h/img.height),dw=img.width*s,dh=img.height*s;c.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);}
function button(c,label,x,y,w,h,o={}){
 const {sel=false,col=AMBER,size=22,sub,disabled=false}=o;
 c.save();c.translate(x,y);if(sel){c.translate(0,-2);}
 c.fillStyle=INK;c.fillRect(4,4,w,h);c.fillStyle=disabled?'#6b6459':sel?col:PAPER;c.fillRect(0,0,w,h);c.lineWidth=3;c.strokeStyle=INK;c.strokeRect(0,0,w,h);
 text(c,label,w/2,sub?h/2-6:h/2,{size,align:'center',base:'middle',col:INK,font:FONT_TITLE,weight:'400'});
 if(sub)text(c,sub,w/2,h/2+14,{size:13,align:'center',base:'middle',col:'#4b4035',font:FONT_UI});
 c.restore();
 return Input.pressed.click&&Input.mx>=x&&Input.mx<=x+w&&Input.my>=y&&Input.my<=y+h;
}
// Comic impact word
function comicWord(word,x,y,col=AMBER,size=48){G.words.push({word,x,y,col,size,t:0,rot:rnd(-.25,.25)});}
function drawWords(c){
 for(const w of G.words){w.t+=G.dt;const p=w.t/1.0;const sc=p<.15?easeOut(p/.15)*1.3:lerp(1.3,1,Math.min(1,(p-.15)/.2));c.save();c.translate(w.x,w.y-p*20);c.rotate(w.rot);c.scale(sc,sc);c.globalAlpha=p>.75?1-(p-.75)/.25:1;
  c.fillStyle=w.col;c.strokeStyle=INK;c.lineWidth=4;c.beginPath();const n=14;for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2,r=(i%2?.7:1)*(w.size*.5+w.word.length*w.size*.22);const px=Math.cos(a)*r*1.4,py=Math.sin(a)*r*.6;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fill();c.stroke();
  text(c,w.word,0,0,{size:w.size,font:FONT_TITLE,col:INK,align:'center',base:'middle',weight:'400'});c.restore();}
 G.words=G.words.filter(w=>w.t<1);
}
function drawBongMeter(c,x,y,w,p,ready,label,t=G.time||0){
 // plate
 c.fillStyle=INK;c.fillRect(x,y,w,34);c.fillStyle=ready?'rgba(104,203,187,.25)':'rgba(0,0,0,0)';c.fillRect(x+2,y+2,w-4,30);
 const cx=x+w-30,cy=y+17;            // bong seen from above: chamber ring + cone on the left side
 c.save();c.translate(cx,cy);
 // smoke when ready
 if(ready){for(let i=0;i<4;i++){const k=(t*.6+i*.27)%1;c.fillStyle=`rgba(230,230,230,${.35*(1-k)})`;c.beginPath();c.arc(-6+Math.sin(t*3+i)*5*k,-k*14,4+k*9,0,7);c.fill();}}
 c.fillStyle='#2a6f6a';c.beginPath();c.arc(0,0,13,0,7);c.fill();c.strokeStyle='#9fe8d8';c.lineWidth=2;c.stroke();
 c.fillStyle='#0d1a1d';c.beginPath();c.arc(0,0,7,0,7);c.fill();c.fillStyle='rgba(159,232,216,.35)';c.beginPath();c.arc(-3,-3,3,0,7);c.fill();
 // stem + cone
 c.strokeStyle='#9fe8d8';c.lineWidth=4;c.beginPath();c.moveTo(-11,4);c.lineTo(-26,10);c.stroke();
 c.fillStyle=ready?'#ff9d3a':'#5a4a3a';c.beginPath();c.arc(-30,11,6,0,7);c.fill();c.strokeStyle='#17242b';c.lineWidth=1.5;c.stroke();
 if(ready){c.fillStyle='#ffd27a';c.beginPath();c.arc(-30,11,3,0,7);c.fill();}
 c.restore();
 // fill track
 const tx=x+8,tw=w-62;c.fillStyle='#0d1a1d';c.fillRect(tx,y+22,tw,6);c.fillStyle=ready?TEAL:'#4a8a80';c.fillRect(tx,y+22,tw*clamp(p,0,1),6);
 // lighter slides toward the cone as the meter fills
 const lx=tx+tw*clamp(p,0,1)-6;c.save();c.translate(lx,y+9);c.fillStyle='#de755f';c.fillRect(-5,-2,10,16);c.strokeStyle=INK;c.lineWidth=1.5;c.strokeRect(-5,-2,10,16);c.fillStyle='#bbb';c.fillRect(-4,-5,8,4);
 const fl=ready?1:Math.max(0,p-.6)/.4;if(fl>0){const h=6+fl*8+Math.sin(t*25)*2*fl;c.fillStyle='#ffb347';c.beginPath();c.moveTo(-3,-5);c.quadraticCurveTo(0,-5-h,3,-5);c.fill();c.fillStyle='#fff3b0';c.beginPath();c.moveTo(-1.5,-5);c.quadraticCurveTo(0,-5-h*.5,1.5,-5);c.fill();}
 c.restore();
 text(c,label,tx,y+9,{size:11,col:ready?'#9fe8d8':PAPER,base:'middle',weight:'800'});
}
function floater(txt,x,y,col=PAPER,size=18){G.floaters.push({txt,x,y,col,size,t:0});}
function drawFloaters(c,camX=0){for(const f of G.floaters){f.t+=G.dt;text(c,f.txt,f.x-camX,f.y-f.t*40,{size:f.size,col:f.col,align:'center',stroke:3,font:FONT_TITLE,weight:'400',alpha:1-f.t/1.2});}G.floaters=G.floaters.filter(f=>f.t<1.2);}
// particles
function burst(x,y,col,n=10,spd=180,life=.5,size=4,gravity=400){for(let i=0;i<n;i++){const a=rnd(Math.PI*2),s=rnd(spd*.3,spd);G.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,col,life,t:0,size:rnd(size*.5,size),g:gravity});}}
function updateFx(){for(const p of G.fx){p.t+=G.dt;p.x+=p.vx*G.dt;p.y+=p.vy*G.dt;p.vy+=p.g*G.dt;}G.fx=G.fx.filter(p=>p.t<p.life);}
function drawFx(c,camX=0){for(const p of G.fx){c.globalAlpha=1-p.t/p.life;c.fillStyle=p.col;c.fillRect(p.x-camX-p.size/2,p.y-p.size/2,p.size,p.size);}c.globalAlpha=1;}
function shake(a){if(G.settings.shake)G.shake=Math.max(G.shake,a);}
function flash(col='#fff',a=.6){G.flash=a;G.flashCol=col;}
function hitstop(t){G.hitstop=Math.max(G.hitstop,t);}

/* ---------- sprite draw ---------- */
// Platform hero sprite (heroes-v2 sheet). o: {dir,moving,step,crouch,air,aimUp,shoot,scale,inv}
function drawHero(c,type,x,y,o={}){
 const img=G.img.heroes;if(!img)return;let row=type==='turbo'?0:2,col=0;
 if(o.moving&&!o.crouch&&!o.air&&!o.aimUp)col=Math.floor(o.step*1.4)%8;else{row++;col=o.crouch?(o.shoot?5:4):o.air?6:o.aimUp?3:o.shoot?1:0;}
 if(o.hurt){row=(type==='turbo'?1:3);col=7;}
 const f=ATLAS.heroes[row*8+col];if(o.inv>0&&Math.floor(o.inv*14)%2===0)return;
 const s=.34*(o.scale||1);c.save();c.translate(Math.round(x),Math.round(y));c.scale(o.dir||1,1);
 if(o.tint){c.filter=o.tint;}
 c.drawImage(img,f.x,f.y,f.w,f.h,Math.round(-f.anchor*s),Math.round(-f.h*s),Math.round(f.w*s),Math.round(f.h*s));c.restore();
}
// enemies-v2 by index; height in px
function drawEnemySprite(c,index,x,y,height,dir=1,alpha=1){const img=G.img.enemies;if(!img)return;const f=ATLAS.enemies[index],s=height/f.h;c.save();c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y));c.scale(dir,1);c.drawImage(img,f.x,f.y,f.w,f.h,Math.round(-f.w*s/2),-height,Math.round(f.w*s),height);c.restore();}
function drawExpansion(c,index,x,y,height,dir=1,alpha=1){const img=G.img.expansion;if(!img)return;const f=ATLAS.expansion[index],s=height/f.h;c.save();c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y));c.scale(dir,1);c.drawImage(img,f.x,f.y,f.w,f.h,Math.round(-f.w*s/2),-height,Math.round(f.w*s),height);c.restore();}
// crew (borkmaster/angus/fredo) pose 0 idle,1-2 walk,3 attack,4 block,5 hurt
function drawCrew(c,id,pose,x,y,dir=1,scale=1){const img=G.img.crew;if(!img)return;const f=ATLAS.crew[id][pose];const S={borkmaster:137/313,angus:127/313,fredo:78/157}[id]*scale;c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir*S,S);c.translate(f[0]-f[4],f[1]-f[5]);if(f[6]){c.beginPath();f[6].forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip();}c.drawImage(img,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);c.restore();}
// Fighter pose sheet (16 poses). Draw with feet at (x,y).
function drawFighter(c,id,pose,x,y,dir=1,o={}){
 const sheet=ATLAS.fight[id],img=G.img['fight_'+id];if(!sheet||!img)return;
 const f=sheet.frames[clamp(pose,0,15)];const s=sheet.targetHeight/sheet.sourceHeight*(o.scale||1);
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir*s,s);if(o.alpha!==undefined)c.globalAlpha=o.alpha;if(o.filter)c.filter=o.filter;
 c.translate(-(f.anchor-f.x),-(f.baseline-f.y));
 if(f.clip){c.beginPath();f.clip.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip();}
 c.drawImage(img,f.x,f.y,f.w,f.h,0,0,f.w,f.h);c.restore();
}
// Parallax panorama from environments sheet. theme row: street 0, space 1, isa 2, moon 3
function drawPanorama(c,theme,camX,o={}){
 const img=G.img.environments;if(!img)return;const row={street:0,glitch:0,bar:0,space:1,port:1,isa:2,ship:2,moon:3}[theme]??0;
 const ys=[0,335,634,916,1254],grounds=[288,590,873,1183],sy=ys[row],sh=ys[row+1]-sy;const groundY=o.groundY||430;const scale=groundY/(grounds[row]-sy),width=img.width*scale;const oy=o.oy||0;
 let off=-(camX*(o.parallax||.55))%width;c.save();if(o.filter)c.filter=o.filter;for(let x=off-width;x<W+width;x+=width)c.drawImage(img,0,sy,img.width,sh,Math.round(x),Math.round(oy),Math.ceil(width)+1,Math.ceil(sh*scale));c.restore();
}
// Theme sky: gradient + celestial body + distant haze, drawn before the panorama
const SKY={street:['#1b2b44','#6a4a3a','#ffb066'],glitch:['#0d0820','#3a1a5a','#9974aa'],space:['#03060c','#0c1a2a','#1f3a4a'],port:['#03060c','#0c1a2a','#1f3a4a'],isa:['#05070b','#121a24','#2a3642'],ship:['#05070b','#121a24','#2a3642'],moon:['#120408','#3a0c14','#7a2020'],bar:['#1b2b44','#6a4a3a','#ffb066']};
function drawSky(c,theme,groundY,t=0){
 const k=SKY[theme]||SKY.street;const g=c.createLinearGradient(0,0,0,groundY);g.addColorStop(0,k[0]);g.addColorStop(.6,k[1]);g.addColorStop(1,k[2]);c.fillStyle=g;c.fillRect(0,0,W,groundY);
 c.save();
 if(theme==='street'||theme==='bar'){const sg=c.createRadialGradient(W*.78,groundY*.5,10,W*.78,groundY*.5,260);sg.addColorStop(0,'rgba(255,214,140,.85)');sg.addColorStop(.12,'rgba(255,190,110,.5)');sg.addColorStop(1,'rgba(255,160,80,0)');c.fillStyle=sg;c.fillRect(0,0,W,groundY);}
 else if(theme==='moon'){c.fillStyle='#ff6a4a';c.globalAlpha=.9;c.beginPath();c.arc(W*.22,groundY*.42,70,0,7);c.fill();c.globalAlpha=.35;c.beginPath();c.arc(W*.22,groundY*.42,95,0,7);c.fill();}
 else if(theme==='glitch'){for(let i=0;i<5;i++){c.fillStyle=i%2?'rgba(153,116,170,.25)':'rgba(104,203,187,.18)';const y=(i*97+Math.floor(t*40))%groundY;c.fillRect(0,y,W,2+(i%3));}}
 else{// stars
  const r=seeded(theme.length*131);c.fillStyle='#fff';for(let i=0;i<120;i++){const x=r()*W,y=r()*groundY*.8,a=r();c.globalAlpha=.25+a*.6*(0.6+0.4*Math.sin(t*2+i));c.fillRect(x,y,a>.9?2:1,a>.9?2:1);}c.globalAlpha=1;
  if(theme==='space'||theme==='port'){c.fillStyle='#6fb6c9';c.globalAlpha=.9;c.beginPath();c.arc(W*.8,groundY*.35,48,0,7);c.fill();c.fillStyle='#2a4a5a';c.globalAlpha=.6;c.beginPath();c.arc(W*.8-14,groundY*.35+10,30,0,7);c.fill();}}
 c.restore();
}
// Per-theme colour grade + film vignette, drawn over the world and under the HUD
const GRADE={street:'rgba(255,170,90,.18)',bar:'rgba(255,170,90,.18)',glitch:'rgba(150,90,220,.22)',space:'rgba(90,170,220,.16)',port:'rgba(90,170,220,.16)',isa:'rgba(120,150,190,.14)',ship:'rgba(160,120,220,.14)',moon:'rgba(255,80,60,.2)'};
function colourGrade(c,theme){G.grades=G.grades||{};let cv=G.grades[theme];
 if(!cv){cv=G.grades[theme]=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.globalAlpha=.6;g.fillStyle=GRADE[theme]||GRADE.street;g.fillRect(0,0,W,H);g.globalAlpha=1;vignette(g,.55);}
 c.drawImage(cv,0,0);}
function dropShadow(c,x,y,w,a=.35){c.save();c.fillStyle=`rgba(0,0,0,${a})`;c.beginPath();c.ellipse(x,y+3,w,w*.28,0,0,7);c.fill();c.restore();}

/* ---------- scene management ---------- */
function setScene(s){G.next=s;}
function transitionTo(s,kind='wipe'){G.transition={kind,t:0,target:s,done:false};}
function drawTransition(c){
 const tr=G.transition;if(!tr)return;tr.t+=G.dt*2.2;
 const p=Math.min(1,tr.t);
 if(tr.kind==='wipe'){// ink wipe diagonal
  c.save();c.fillStyle=INK;const prog=tr.t<1?p:2-tr.t;const x=easeOut(clamp(prog,0,1))*(W+300);c.beginPath();c.moveTo(0,0);c.lineTo(x,0);c.lineTo(x-300,H);c.lineTo(0,H);c.closePath();c.fill();c.restore();}
 else if(tr.kind==='page'){c.save();const prog=tr.t<1?p:2-tr.t;c.fillStyle=PAPER;c.globalAlpha=clamp(prog,0,1);c.fillRect(0,0,W,H);c.restore();}
 if(tr.t>=1&&!tr.done){tr.done=true;G.scene=tr.target;G.scene.enter&&G.scene.enter();Input.flush();}
 if(tr.t>=2)G.transition=null;
}

/* ---------- save ---------- */
const SAVE_KEY='tw_cooked_save_v1';
function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||null;}catch(e){return null;}}
function writeSave(data){try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));}catch(e){}}

/* ---------- main loop ---------- */
function boot(){
 if(document.fonts){["40px 'Turbo Weasel Tag'","40px 'Turbo Weasel Hand'","40px 'Bangers'","40px 'Patrick Hand'","40px 'Boogaloo'","800 20px 'Barlow Condensed'"].forEach(f=>document.fonts.load(f).catch(()=>{}));}
 G.canvas=document.getElementById('game');G.ctx=G.canvas.getContext('2d');
 const fitDPR=()=>{G.dpr=G.lowPerf?1:Math.min(2,window.devicePixelRatio||1);G.canvas.width=Math.round(W*G.dpr);G.canvas.height=Math.round(H*G.dpr);G.ctx.imageSmoothingEnabled=true;G.ctx.imageSmoothingQuality='high';};
 fitDPR();window.addEventListener('resize',fitDPR);
 Input.init();Audio.init();
 let last=performance.now();
 function frame(now){
   requestAnimationFrame(frame);
   const raw=(now-last)/1000;let dt=Math.min(.05,raw);last=now;Input.poll();
   if(G.hitstop>0){G.hitstop-=dt;dt=0;}
   G.dt=dt;G.time+=dt;G.frame++;
   if(G.next){G.scene=G.next;G.next=null;G.scene.enter&&G.scene.enter();Input.flush();}
   // phones: show the BACK button on menu screens only (in play, BACK would bail out of mini-games)
   const ms=!!(G.scene&&G.scene.menu&&!G.scene.isTitle);if(ms!==G.menuDom){G.menuDom=ms;document.body.classList.toggle('menuscene',ms);}
   if(G.touch&&G.frame%120===0)measureTouchHud();
   const t0=performance.now();
   const c=G.ctx;c.setTransform(G.dpr,0,0,G.dpr,0,0);c.save();
   if(G.shake>0){G.shake=Math.max(0,G.shake-dt*30);c.translate(rnd(-G.shake,G.shake),rnd(-G.shake,G.shake));}
   if(G.scene){G.scene.update&&G.scene.update(dt);G.scene.draw&&G.scene.draw(c);}
   drawWords(c);
   c.restore();
   if(G.flash>0){c.fillStyle=G.flashCol;c.globalAlpha=G.flash;c.fillRect(0,0,W,H);c.globalAlpha=1;G.flash-=dt*3;}
   drawTransition(c);
   Input.flush();Input.any=false;
   // adaptive resolution: if a weak GPU can't hold the Retina canvas, drop to 1x after a few seconds.
   // A steady 30Hz screen (low-power mode, 30Hz display) is NOT a weak GPU: only drop when the frame gaps are ragged or the draw itself is heavy.
   if(G.dpr>1&&!G.lowPerf&&now>6000){const work=performance.now()-t0;G.perfAcc=(G.perfAcc||0)+(raw>.028?1:0);G.perfSteady=(G.perfSteady||0)+(Math.abs(raw-1/30)<.004?1:0);G.perfHeavy=(G.perfHeavy||0)+(work>12?1:0);G.perfN=(G.perfN||0)+1;
   if(G.perfN>=60){if(G.perfAcc>36&&(G.perfSteady<40||G.perfHeavy>30)){G.lowPerf=true;G.canvas.width=W;G.canvas.height=H;G.dpr=1;G.ctx.imageSmoothingEnabled=true;console.warn('Cooked Edition: dropped to 1x rendering for frame rate');}G.perfN=0;G.perfAcc=0;G.perfSteady=0;G.perfHeavy=0;}}
 }
 requestAnimationFrame(frame);
}
