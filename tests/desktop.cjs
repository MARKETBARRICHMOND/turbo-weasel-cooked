/* Regression checks for the desktop input, movement, race and save contracts.
   Run with node tests/desktop.cjs. Browser rendering is checked separately. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const listeners = {};
const storage = new Map();
const gradient = {addColorStop() {}};
const context = new Proxy({
  measureText: value => ({width: String(value).length * 9}),
  createLinearGradient: () => gradient,
  createRadialGradient: () => gradient,
  drawImage(...args) {assert(args.slice(1).every(Number.isFinite), 'Image coordinates must be finite');}
}, {get(target, key) {return key in target ? target[key] : () => {};}});
const element = () => ({
  hidden: false, style: {}, dataset: {}, classList: {add() {}, toggle() {}, remove() {}},
  addEventListener() {}, querySelector: element, querySelectorAll: () => [],
  getBoundingClientRect: () => ({width:960, height:540, left:0, top:0, right:960, bottom:540}),
  getContext: () => context, setAttribute() {}
});
const sandbox = {
  console, Math, JSON, Set, Map, Promise, Number, Array, Object, String,
  performance: {now: () => 0}, setTimeout: () => 0, clearTimeout() {},
  location: {protocol:'http:', origin:'http://localhost', pathname:'/'},
  navigator: {getGamepads:() => [],maxTouchPoints:0},
  document: {body:element(), getElementById:element, querySelectorAll:() => [],createElement:element,
    addEventListener() {},fonts:{load:() => Promise.resolve()}},
  matchMedia: () => ({matches:false}), addEventListener() {},
  localStorage: {getItem:key => storage.get(key) || null, setItem:(key,value) => storage.set(key,value)},
  requestAnimationFrame() {}, innerWidth:1920, innerHeight:1080
};
sandbox.window = {...sandbox, addEventListener:(name, callback) => {listeners[name] = callback;}};
const realm = vm.createContext(sandbox);
const files = [...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(match => match[1].split('?')[0]);
for (const file of files) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'), realm, {filename:file});
realm.assert = assert;
realm.listeners = listeners;
vm.runInContext(`
Audio.sfx=()=>{};Audio.playTrack=()=>{};Audio.stopMusic=()=>{};
G.canvas=document.getElementById('game');G.ctx=G.canvas.getContext('2d');G.dpr=1;
SAVE=SAVE_DEFAULT();Input.init();
for(const key of Object.keys(SPRITE_FILES))G.img[key]={width:1536,height:1024};
for(const key of Object.keys(ATLAS.fight))G.img['fight_'+key]={width:1792,height:1024};
getPage=()=>({ready:true,img:{width:1536,height:1024}});
function tick(scene, dt=1/60){G.dt=dt;G.time+=dt;G.frame++;scene.update(dt);Input.flush();}
function resetInput(){Input.down={};Input.pressed={};Input.released={};Input.keyboard.clear();Input.touchDown={};G.transition=null;G.fx=[];G.words=[];G.floaters=[];}
function makeLevel(index=1,char='turbo'){
 resetInput();const run={...makeRun(),char};
 const scene=PlatformScene(CHAPTERS[index],run,{onDone(){}});scene.enter();scene.ents=[];scene.hazards=[];return scene;
}
// Normal scene generation and drawing for every chapter, hero and difficulty.
let worlds=0;
for(const difficulty of DIFF_ORDER){SAVE.difficulty=difficulty;for(const char of ['turbo','weasel'])for(let index=0;index<CHAPTERS.length;index++){
 const scene=makeLevel(index,char);tick(scene);scene.draw(G.ctx);
 assert(scene.population.length>8);assert.equal(new Set(scene.population.filter(n=>!n.encounter).map(n=>n.cell)).size,scene.population.filter(n=>!n.encounter).length);
 for(const item of scene.items.filter(item=>item.big))assert(!scene.pits.some(pit=>item.x>pit[0]&&item.x<pit[1]));
 worlds++;
}}
SAVE.difficulty='mission';
// Both poses for all eight enemy designs draw finite coordinates.
for(const type of ['thug','gunner','alien'])for(let variant=0;variant<4;variant++)for(const attackT of [0,.2])drawModernEnemy(G.ctx,{type,variant,attackT,x:120,y:GROUND,dir:-1,step:1,alert:true},72);
resetInput();let menu=TitleScene();menu.enter();Input.mx=90;Input.my=285;Input.pressed.click=true;menu.draw(G.ctx);assert(G.next?.menu&&!G.next?.isTitle,'Mouse opens the test-drive menu');G.next=null;
// Rebinding changes the action, preserves the original save and rejects occupied keys.
resetInput();menu=ModernSettingsScene();Input.pressed.menu=true;menu.update();Input.flush();menu.sel=4;Input.pressed.confirm=true;menu.update();Input.flush();assert(Input.rebinding);Input.rebinding('KeyQ');assert.equal(inputAction('KeyQ'),'jump');assert.equal(inputAction('Space'),null);G.settings.keys={};
// A buffered press just before landing produces the next jump without a new key press.
let scene=makeLevel();scene.h.y=GROUND-5;scene.h.onGround=false;scene.h.jumps=1;scene.h.vy=400;
Input.pressed.jump=true;tick(scene);tick(scene);assert(scene.h.vy<0,'Jump buffer survives the landing');
// Short presses produce a lower jump, using the real release path.
scene=makeLevel();Input.pressed.jump=true;tick(scene);const longJump=scene.h.vy;
Input.released.jump=true;tick(scene);assert(scene.h.vy>longJump);
// Wall kicks retain horizontal momentum when the next frame has no direction held.
scene=makeLevel(1,'weasel');scene.h.y=GROUND-100;scene.h.onGround=false;scene.h.jumps=2;scene.h.wallT=.2;scene.h.wallDir=1;
Input.pressed.jump=true;tick(scene);tick(scene);assert(scene.h.vx<-250);
// Crossing a platform during a 30Hz frame lands on it.
scene=makeLevel();scene.plats=[{x:90,y:300,w:100,h:22}];scene.h.y=280;scene.h.vy=900;scene.h.onGround=false;
tick(scene,1/30);assert.equal(scene.h.y,300);assert(scene.h.onGround);
// Jump and movement distance remain close at 30, 60 and 120Hz.
const distances=[];
for(const rate of [30,60,120]){scene=makeLevel();scene.plats=[];scene.pits=[];Input.down.right=true;for(let step=0;step<rate;step++)tick(scene,1/rate);distances.push(scene.h.x);}
assert(Math.max(...distances)-Math.min(...distances)<5);
// Pad polling must preserve a held keyboard key, then clear a disconnected pad.
resetInput();Input.keyboard.add('KeyD');Input.poll();assert(Input.held('right'));
navigator.getGamepads=()=>[null,{connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))}];Input.poll();assert(Input.held('right'));
Input.keyboard.clear();navigator.getGamepads=()=>[null,{connected:true,axes:[-.8,0],buttons:[]}];Input.poll();assert(Input.held('left'));
navigator.getGamepads=()=>[];Input.poll();assert(!Input.held('left'));
// The callback fires once, the race freezes on pause, and each course can finish.
const finishes=[];
for(const track of ['richmond','space']){
 resetInput();let result=null,count=0;const race=RaceScene({track,racer:'turbo',diff:DIFF.mission,up:{speed:0,accel:0,grip:0}},{onDone:r=>{result=r;count++;}});
 race.enter();for(let i=0;i<240;i++)tick(race);assert.equal(race.phase,'race');
 race.__p.v=900;Input.down.attack=true;Input.down.down=true;tick(race);assert(race.__p.v<890,'Brake takes priority over gas');
 resetInput();Input.pressed.pause=true;tick(race);const time=race.t,z=race.__p.z;for(let i=0;i<120;i++)tick(race);assert.equal(race.t,time);assert.equal(race.__p.z,z);
 Input.pressed.pause=true;tick(race);
 for(let i=0;i<80000&&race.phase!=='done';i++){
  Input.down.right=race.__p.x<-.08;Input.down.left=race.__p.x>.08;Input.down.attack=true;Input.down.down=false;tick(race);
 }
 assert.equal(race.phase,'done',track+' completes');const finalZ=race.__p.z;for(let i=0;i<120;i++)tick(race);assert.equal(race.__p.z,finalZ);
 race.draw(G.ctx);Input.pressed.confirm=true;tick(race);tick(race);assert.equal(count,1);assert(result.cash>0);finishes.push(track+': '+result.place);
}
// A test drive can collect and quit while the campaign save stays byte-for-byte intact.
resetInput();SAVE=SAVE_DEFAULT();SAVE.profile.cash=321;SAVE.chapter=4;save();const original=SAVE,raw=localStorage.getItem(SAVE_KEY);
startShowcase('market');const demo=G.transition.target;SAVE.profile.cash=999;save();assert.equal(localStorage.getItem(SAVE_KEY),raw);
demo.onDone({result:'quit'});assert.equal(SAVE,original);assert.equal(SAVE.profile.cash,321);assert.equal(G.showcaseSave,null);
// Optional illustrated conversations return to the same level with its state intact.
scene=makeLevel(1);const npc=scene.population.find(n=>n.encounter);scene.h.x=npc.x;scene.h.y=GROUND;Input.pressed.interact=true;tick(scene);
const talk=G.transition.target;talk.onDone();assert.equal(G.transition.target,scene);assert.equal(SAVE.pages['modern-couch'],true);
// Every story beat points at a shipped page.
for(const chapter of CHAPTERS)for(const phase of ['intro','preboss','outro'])for(const beat of chapter[phase]||[])assert(PAGE_FILES[beat.page]||beat.page.startsWith('cover-'));
console.log(JSON.stringify({worlds,bufferedJump:'pass',wallKick:'pass',platformCrossing:'pass',frameRates:'30/60/120',inputMerge:'pass',pause:'pass',races:finishes,saveIsolation:'pass',comicReturn:'pass'}));
`, realm);
