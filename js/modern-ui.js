/* Desktop presentation and input configuration. All coordinates use the game canvas. */
'use strict';
const GAME_VERSION = '2.0.0';

function drawModernCharacterSelect(c, scene) {
  c.fillStyle='#10191e';c.fillRect(0,0,W,H);
  text(c,"WHO’S DRIVING?",42,53,{size:44,font:FONT_TITLE,weight:'400',col:AMBER});
  ['turbo','weasel'].forEach((id,index)=>{
    const character=CHARS[id],x=48+index*456,y=84,selected=scene.sel===index;
    c.fillStyle=selected?'#294449':'#18292e';c.fillRect(x,y,408,408);
    c.strokeStyle=selected?character.col:'#425258';c.lineWidth=selected?3:1;c.strokeRect(x,y,408,408);
    text(c,character.name,x+24,y+42,{size:36,font:FONT_COMIC,weight:'400',col:character.col});
    text(c,character.tag,x+24,y+66,{size:13,col:PAPER});
    drawFighter(c,id,selected&&Math.floor(scene.t*2)%2?1:0,x+100,y+319,1,{scale:1.7});
    wrapText(c,character.blurb,181,`400 17px ${FONT_COMIC}`).forEach((line,lineIndex)=>
      text(c,line,x+202,y+112+lineIndex*20,{size:17,font:FONT_COMIC,weight:'400',col:PAPER}));
    [['HEALTH',character.hp/7],['SPEED',character.speed/215],['FIRE RATE',.2/character.fireRate*.55],['DAMAGE',character.damage/2]].forEach(([label,value],stat)=>{
      const sy=y+219+stat*30;
      text(c,label,x+202,sy,{size:11,col:PAPER});
      c.fillStyle='#0c1b20';c.fillRect(x+202,sy+5,175,4);
      c.fillStyle=character.col;c.fillRect(x+202,sy+5,175*clamp(value,0,1),4);
    });
    text(c,character.special,x+24,y+368,{size:24,font:FONT_COMIC,weight:'400',col:character.col});
    text(c,character.weapon,x+24,y+390,{size:12,col:PAPER});
    const hot=Input.hot(x,y,408,408);
    if(hot.hover)scene.sel=index;
    if(hot.click){SAVE.char=id;setScene(DiffScene());}
  });
  text(c,'← → SELECT · ENTER CONFIRM · BACKSPACE BACK',48,H-18,{size:13,col:TEAL});
}

function drawModernDifficulty(c, scene, locked) {
  c.fillStyle='#10191e';c.fillRect(0,0,W,H);
  text(c,'HOW COOKED ARE WE?',42,53,{size:44,font:FONT_TITLE,weight:'400',col:AMBER});
  DIFF_ORDER.forEach((id,index)=>{
    const diff=DIFF[id],y=90+index*98,color=[TEAL,AMBER,RED,VIOLET][index],disabled=locked(id);
    c.fillStyle=scene.sel===index?'#294449':'#18292e';c.fillRect(46,y,868,87);
    c.fillStyle=disabled?'#67747a':color;c.fillRect(46,y,5,87);
    text(c,(disabled?'LOCKED · ':'')+diff.name,67,y+29,{size:26,font:FONT_COMIC,weight:'400',col:disabled?'#89999c':color});
    text(c,`${diff.lives} LIVES · ${diff.rounds} BOSS ROUND${diff.rounds>1?'S':''}`,891,y+27,{size:13,col:PAPER,align:'right'});
    wrapText(c,disabled?'Finish the story to unlock this difficulty.':diff.desc,809,`400 16px ${FONT_COMIC}`).slice(0,2).forEach((line,lineIndex)=>
      text(c,line,67,y+53+lineIndex*18,{size:16,font:FONT_COMIC,weight:'400',col:PAPER}));
    const hot=Input.hot(46,y,868,87);if(hot.hover)scene.sel=index;
    if(hot.click){scene.sel=index;Input.carry={confirm:true};}
  });
  text(c,'↑ ↓ SELECT · ENTER START · BACKSPACE BACK',48,H-18,{size:13,col:TEAL});
}

function drawModernTitle(c, scene, items) {
  const time = G.settings.motion === false ? 0 : scene.t;
  c.fillStyle = '#11191d';
  c.fillRect(0, 0, W, H);
  drawDistrict(c, 0, .55 + Math.sin(time * .025) * .12, 480);
  const wash = c.createLinearGradient(0, 0, W, 0);
  wash.addColorStop(0, 'rgba(7,15,19,.99)');
  wash.addColorStop(.42, 'rgba(7,15,19,.93)');
  wash.addColorStop(.67, 'rgba(7,15,19,.24)');
  wash.addColorStop(1, 'rgba(7,15,19,.12)');
  c.fillStyle = wash;
  c.fillRect(0, 0, W, H);
  const floor = c.createLinearGradient(0, 360, 0, H);
  floor.addColorStop(0, 'rgba(7,15,19,0)');
  floor.addColorStop(1, 'rgba(7,15,19,.96)');
  c.fillStyle = floor;
  c.fillRect(0, 360, W, H - 360);

  text(c, 'KEEAN ALAVI’S', 42, 32, {size:14, font:FONT_COMIC, weight:'400', col:TEAL});
  text(c, 'TURBO &', 40, 95, {size:73, font:FONT_TITLE, weight:'400', col:AMBER, stroke:5, maxW:400});
  text(c, 'WEASEL', 40, 156, {size:85, font:FONT_TITLE, weight:'400', col:AMBER, stroke:5, maxW:400});
  text(c, 'COOKED EDITION', 45, 184, {size:25, font:FONT_COMIC, weight:'400', col:PAPER});

  // Portraits are the existing canonical fight drawings at their native proportions.
  dropShadow(c, 632, 495, 110, .5);
  dropShadow(c, 805, 498, 84, .5);
  drawFighter(c, 'turbo', Math.floor(time * 1.5) % 2, 637, 502, 1, {scale:2.1});
  drawFighter(c, 'weasel', Math.floor(time * 1.5 + 1) % 2, 818, 502, -1, {scale:1.85});
  c.strokeStyle = 'rgba(244,230,202,.18)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(43, 203); c.lineTo(420, 203); c.stroke();

  const top = 230, rowHeight = 29;
  items.forEach((item, index) => {
    const y = top + index * rowHeight;
    const selected = scene.sel === index;
    const hot = Input.hot(32, y - 19, 395, 29);
    if (selected) {
      c.fillStyle = AMBER;
      c.fillRect(34, y - 18, 385, 27);
      c.fillStyle = TEAL;
      c.fillRect(26, y - 18, 4, 27);
    }
    text(c, item.label, 49, y, {size:23, font:FONT_COMIC, weight:'400',
      col:item.disabled ? '#627176' : selected ? '#102028' : PAPER});
    if (hot.hover && !scene.egg) scene.sel = index;
    if (hot.click && !scene.egg) {
      scene.sel = index;
      Audio.sfx(item.disabled ? 'lose' : 'select');
      if (!item.disabled) item.go();
    }
    if (item.label === 'DROP MUSIC') G.musicHot = {x:32, y:y-19, w:395, h:29};
  });
  const selected = items[scene.sel];
  if (selected) text(c, selected.sub, 464, 42, {size:14, font:FONT_COMIC, weight:'400', col:PAPER, maxW:465});
  text(c, 'VICTORIA STREET, RICHMOND', 464, 69, {size:12, col:AMBER});
  text(c, 'STORY · SCRAPS · SCOOTER GP', 464, 88, {size:11, col:'rgba(244,230,202,.7)'});
  text(c, 'v' + GAME_VERSION, W - 26, H - 16, {size:13, font:FONT_TITLE_UI, weight:'400', col:TEAL, align:'right'});
  text(c, G.touch ? 'TAP A MODE TO PLAY' : 'ARROWS SELECT   ·   ENTER PLAY   ·   CONTROLLER SUPPORTED',
    42, H - 16, {size:11, col:'rgba(244,230,202,.65)'});
  text(c, '18+  ·  © KEEAN ALAVI', 464, H - 16, {size:10, col:'rgba(244,230,202,.45)'});
  if (Audio.nowPlaying) text(c, '♪ ' + Audio.nowPlaying, 464, H - 38, {size:12, col:TEAL, maxW:440});
  if (scene.egg) drawEgg(c, scene.egg, scene.eggT);
}

function ShowcaseScene() {
  const scene = {menu:true, sel:0, t:0};
  const entries = [
    ['LENNOX → THE GRID', 'Workshop, bike sale, Lucifer and the North Richmond GP.', 1, 'lennox'],
    ['RICHMOND GP', 'Jump straight onto the scooter. Three laps through North Richmond.', 0, 'richmond'],
    ['MOON BASE KART CUP', 'Try the lunar course in an improvised space kart.', 6, 'space'],
    ['MARKET BAR', 'Meet the locals and take the street back from Carl’s crew.', 0, 'market']
  ];
  const launch = index => startShowcase(entries[index][3]);
  scene.enter = () => Audio.playTrack('menu');
  scene.update = dt => {
    scene.t += dt;
    if (Input.hit('back')) setScene(TitleScene());
    if (Input.hit('down')) scene.sel = (scene.sel + 1) % entries.length;
    if (Input.hit('up')) scene.sel = (scene.sel + entries.length - 1) % entries.length;
    if (Input.hit('confirm') || Input.hit('attack') || Input.hit('jump')) launch(scene.sel);
  };
  scene.draw = c => {
    c.fillStyle = '#10191e'; c.fillRect(0, 0, W, H);
    text(c, 'TAKE IT FOR A SPIN', 44, 52, {size:44, font:FONT_TITLE, weight:'400', col:AMBER});
    text(c, 'A fresh loan character. Return to your campaign afterwards.', 46, 80, {size:18, font:FONT_COMIC, weight:'400', col:PAPER});
    entries.forEach(([label, description, cell], index) => {
      const x = 42, y = 105 + index * 91;
      c.fillStyle = scene.sel === index ? '#294449' : '#19292e';
      c.fillRect(x, y, 876, 79);
      c.save(); c.beginPath(); c.rect(x, y, 170, 79); c.clip();
      drawDistrict(c, cell, .5, 125);
      // Crop the same atlas explicitly into each card.
      const image = G.img.districts;
      if (image) c.drawImage(image, (cell % 2) * image.width / 2, Math.floor(cell / 2) * image.height / 4,
        image.width / 2, image.height / 4, x, y, 170, 79);
      c.restore();
      text(c, label, x + 193, y + 30, {size:25, font:FONT_COMIC, weight:'400', col:scene.sel === index ? AMBER : PAPER});
      text(c, description, x + 193, y + 56, {size:16, font:FONT_COMIC, weight:'400', col:PAPER, maxW:650});
      const hot = Input.hot(x, y, 876, 79);
      if (hot.hover) scene.sel = index;
      if (hot.click) launch(index);
    });
    text(c, 'ENTER PLAY · BACKSPACE BACK', W / 2, H - 24, {size:16, align:'center', col:TEAL});
  };
  return scene;
}

function startShowcase(mode) {
  if (!G.showcaseSave) G.showcaseSave = SAVE;
  SAVE = SAVE_DEFAULT();
  SAVE.profile.cash = 400;
  SAVE.scooter = {speed:0, accel:0, grip:0};
  const run = makeRun();
  run.demo = true;
  const finish = () => {
    SAVE = G.showcaseSave;
    G.showcaseSave = null;
    G.fx = []; G.words = []; G.floaters = [];
    transitionTo(ShowcaseScene(), 'page');
  };
  const race = track => transitionTo(RaceScene({track, diff:DIFF.mission, racer:SAVE.char, up:SAVE.scooter}, {onDone:finish}), 'wipe');
  if (mode === 'richmond' || mode === 'space') { race(mode); return; }
  const chapter = CHAPTERS[mode === 'lennox' ? 1 : 0];
  const level = PlatformScene(chapter, run, {onDone:result => {
    if (result.result !== 'win') { finish(); return; }
    const duel = () => transitionTo(FightScene({p1:run.char, p2:chapter.boss, diff:DIFF.pissweak,
      arena:chapter.arena || chapter.theme, profile:run.profile, rounds:1}, {onDone:result => {
      if (result.result !== 'win') { finish(); return; }
      transitionTo(ComicScene(chapter.outro, {onDone:() => mode === 'lennox' ? race('richmond') : finish()}), 'page');
    }}), 'wipe');
    transitionTo(ComicScene(chapter.preboss, {onDone:duel}), 'page');
  }});
  transitionTo(level, 'wipe');
}

function ModernSettingsScene() {
  const scene = {menu:true, tab:0, sel:0};
  const persist = () => { try { localStorage.setItem('tw_cooked_settings', JSON.stringify(G.settings)); } catch (e) {} };
  const resize = () => { G.lowPerf=false; if (G.resize) G.resize(); };
  const cycle = (key, values, delta) => {
    G.settings[key] = values[(values.indexOf(G.settings[key]) + values.length + delta) % values.length];
    resize();
  };
  const audio = (key, delta) => {
    G.settings[key] = clamp(G.settings[key] + delta * .1, 0, 1);
    if (Audio[key + 'Gain']) Audio[key + 'Gain'].gain.value = G.settings[key];
    if (key === 'music' && Audio.music) Audio.music.volume = G.settings.music;
  };
  const rows = () => scene.tab === 0 ? [
    ['RENDER DETAIL', () => G.settings.detail.toUpperCase(), delta => cycle('detail', ['auto','high','low'], delta)],
    ['CROWD DENSITY', () => G.settings.crowds.toUpperCase(), delta => cycle('crowds', ['full','low'], delta)],
    ['AMBIENT MOTION', () => G.settings.motion ? 'ON' : 'OFF', () => G.settings.motion = !G.settings.motion],
    ['SCREEN SHAKE', () => G.settings.shake ? 'ON' : 'OFF', () => G.settings.shake = !G.settings.shake],
    ['MUSIC', () => Math.round(G.settings.music * 100) + '%', delta => audio('music', delta)],
    ['SFX', () => Math.round(G.settings.sfx * 100) + '%', delta => audio('sfx', delta)]
  ] : [
    ...['left','right','up','down','jump','attack','special','interact'].map(action => [
      action.toUpperCase(), () => actionLabel(action), () => bind(action)
    ]),
    ['RESTORE DEFAULT KEYS', () => 'ENTER', () => {G.settings.keys={}; persist();}]
  ];
  function bind(action) {
    scene.binding = action;scene.bindError=null;
    Input.keyboard.clear(); Input.down={};
    Input.rebinding = code => {
      if (['Escape','Backspace'].includes(code)) {scene.binding=null;Input.rebinding=null;return;}
      // Reserve navigation and system keys so the settings always remain reachable.
      if (['Enter','Tab','KeyM','KeyP'].includes(code)) return;
      const assigned = inputAction(code);
      if (assigned && assigned !== action) {scene.bindError=code+' IS USED FOR '+assigned.toUpperCase();return;}
      const map = G.settings.keys || (G.settings.keys = {});
      for (const key of Object.keys(KEYMAP)) if (KEYMAP[key] === action) map[key] = null;
      for (const key of Object.keys(map)) if (map[key] === action) map[key] = null;
      map[code] = action;
      scene.binding = null; Input.rebinding = null; Input.pressed = {}; persist();
    };
  }
  scene.update = () => {
    if (scene.binding) return;
    const list = rows();
    if (Input.hit('back')) { persist(); setScene(TitleScene()); return; }
    if (Input.hit('menu') || Input.hit('special')) {scene.tab^=1;scene.sel=0;return;}
    if (Input.hit('down')) scene.sel = (scene.sel + 1) % list.length;
    if (Input.hit('up')) scene.sel = (scene.sel + list.length - 1) % list.length;
    if (Input.hit('left')) { list[scene.sel][2](-1); persist(); }
    if (Input.hit('right') || Input.hit('confirm')) { list[scene.sel][2](1); persist(); }
  };
  scene.draw = c => {
    c.fillStyle='#10191e';c.fillRect(0,0,W,H);
    text(c, 'MAKE YOURSELF AT HOME', 44, 50, {size:42,font:FONT_TITLE,weight:'400',col:AMBER});
    ['DISPLAY & SOUND','CONTROLS'].forEach((label,index) => {
      const x=46+index*230;
      c.fillStyle=scene.tab===index?TEAL:'#283b41';c.fillRect(x,75,214,35);
      text(c,label,x+107,98,{size:20,font:FONT_COMIC,weight:'400',align:'center',col:scene.tab===index?INK:PAPER});
      if(Input.hot(x,75,214,35).click&&!scene.binding){scene.tab=index;scene.sel=0;}
    });
    const list=rows(),height=scene.tab?34:49;
    list.forEach(([label,value,change],index) => {
      const y=139+index*height;
      if(scene.sel===index){c.fillStyle='#294449';c.fillRect(45,y-22,870,height-3);}
      text(c,label,62,y,{size:22,font:FONT_COMIC,weight:'400',col:PAPER});
      text(c,value(),884,y,{size:22,font:FONT_COMIC,weight:'400',col:AMBER,align:'right'});
      const hot=Input.hot(45,y-22,870,height-3);
      if(hot.hover&&!scene.binding)scene.sel=index;
      if(hot.click&&!scene.binding){scene.sel=index;change(Input.mx<560?-1:1);persist();}
    });
    text(c,scene.tab?'LB TALKS · A JUMPS / CONFIRMS · X / RT ATTACKS · B SPECIAL · START PAUSES':'AUTO ADJUSTS RESOLUTION · LOW REDUCES LOAD · HIGH KEEPS FULL DETAIL',48,472,{size:13,col:TEAL,maxW:860});
    text(c,'TAB SWAPS PAGE · ENTER CHANGE · BACKSPACE BACK',48,504,{size:14,col:PAPER});
    if(Input.hot(40,484,850,37).click&&!scene.binding){persist();setScene(TitleScene());}
    if(scene.binding){
      c.fillStyle='rgba(4,10,14,.94)';c.fillRect(0,0,W,H);
      text(c,'PRESS A KEY FOR '+scene.binding.toUpperCase(),W/2,250,{size:38,font:FONT_COMIC,weight:'400',col:AMBER,align:'center'});
      if(scene.bindError)text(c,scene.bindError,W/2,330,{size:16,col:RED,align:'center'});
      text(c,'ESC CANCEL · ENTER, TAB, M AND P ARE RESERVED',W/2,294,{size:18,col:PAPER,align:'center'});
    }
  };
  return scene;
}
