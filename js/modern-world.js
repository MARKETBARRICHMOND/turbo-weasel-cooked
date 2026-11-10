/* Illustrated districts and the people who live in them. */
'use strict';

const DISTRICT_ART = {
  market: [0, 0], lennox: [1, 0], memory: [2, 2], break: [0, 3],
  space: [4, 5], portal: [5, 4], opening: [6, 6], moon: [6, 5], encore: [7, 7]
};
const LOCAL_NAMES = [
  'PUNK', 'GROCER', 'COUNCIL BLOKE', 'BAR WORKER', 'SKATER', 'REGULAR',
  'DOOR CREW', 'STUDENT', 'MECHANIC', 'DRIVER', 'FOOTY BLOKE', 'GOTH',
  'MAGPIE BLOKE', 'COOK', 'COURIER', 'METALHEAD', 'LOCAL', 'SHOPPER',
  'COUCH BLOKE', 'TRACKIE BLOKE', 'POKIES REGULAR', 'BUSKER', 'ANGLER', 'DOG WALKER'
];
const ORBITAL_NAMES = [
  'WELDER', 'CLEANER', 'GREASE MONKEY', 'TRADER', 'BAR DROID', 'MARSHAL',
  'CUSTOMS', 'PORTER', 'SPACER', 'CARD SHARP', 'BOUNCER', 'PIT CREW',
  'CASHIER', 'PILOT', 'LUNCH BREAK', 'POSTIE', 'ENGINEER', 'BARMAN',
  'OLD SPACER', 'TOURIST', 'SWEEPER', 'TYRE BLOKE', 'METALHEAD', 'KETTLE BLOKE'
];
const STREET_CHAT = [
  'Council said they’d fix the drain. Council also said Tuesday.',
  'That tram’s got right of way. It knows it, too.',
  'If you’re after Lucifer, upstairs. If he’s after you, I haven’t seen ya.',
  'I was having a perfectly ordinary shit day before you arrived.',
  'Bork put the price up. Called it a security surcharge. You are the security.',
  'Go on. I’ve already called in sick to watch this.'
];
const ORBITAL_CHAT = [
  'Customs wants three forms for that. Four if it’s still alive.',
  'Same pub, different gravity. My tab made the trip just fine.',
  'Robbie owns the dock. We get charged for standing on it.',
  'Green bag goes in the engine. Cup goes on the counter. We’ve had incidents.',
  'Pit lane’s over there. The queue for compensation goes into orbit.',
  'You’re from Earth? Sorry to hear that, mate.'
];
const SIDE_ENCOUNTERS = {
  market: {cell:3, page:'modern-bar', speaker:'BAR WORKER', lines:[
    ['BAR WORKER', 'Bork said clean up. You’ve mostly redistributed it.'],
    ['WEASEL', 'Less concentrated mess. Better for the environment.'],
    ['BAR WORKER', 'Broom’s there, environmentalist.']
  ]},
  lennox: {cell:18, page:'modern-couch', speaker:'COUCH BLOKE', lines:[
    ['COUCH BLOKE', 'Been on this landing since Tuesday.'],
    ['WEASEL', 'Moving in or moving out?'],
    ['COUCH BLOKE', 'At this point, mate, it’s a furnished landing.']
  ]},
  space: {cell:4, page:'modern-tea', speaker:'BAR DROID', lines:[
    ['BAR DROID', 'Tea?'], ['TURBO', 'What’s in it?'],
    ['BAR DROID', 'Tea. You two are fucking exhausting.']
  ]},
  moon: {cell:21, page:'modern-tyre', speaker:'TYRE BLOKE', lines:[
    ['TYRE BLOKE', 'New tyre. Only done one atmosphere.'],
    ['WEASEL', 'What happened to the old one?'],
    ['TYRE BLOKE', 'Orbit. Don’t look up.']
  ]}
};

function drawDistrict(c, cell, camera, ground, alpha = 1) {
  const full = G.img[({0:'districtRichmond',1:'districtLennox',6:'districtMoon'})[cell]];
  const image = full || G.img.districts;
  if (!image || alpha <= 0) return;
  const sourceWidth = full ? image.width : image.width / 2;
  const sourceHeight = full ? image.height : image.height / 4;
  const height = ground + 42;
  const width = Math.max(W + 80, height * sourceWidth / sourceHeight);
  const offset = (width - W) * clamp(camera, 0, 1);
  c.save();
  c.globalAlpha = alpha;
  c.drawImage(image, (full ? 0 : cell % 2) * sourceWidth + 2, (full ? 0 : Math.floor(cell / 2)) * sourceHeight + 2,
    sourceWidth - 4, sourceHeight - 4, -offset, -8, width, height + 8);
  c.restore();
}

function drawModernBackdrop(c, chapter, camera, ground) {
  if (!G.img.districts) return false;
  const cells = DISTRICT_ART[chapter.id] || [0, 0];
  const progress = clamp(camera / Math.max(1, chapter.length - W / 1.45), 0, 1);
  drawDistrict(c, cells[0], progress, ground);
  drawDistrict(c, cells[1], progress, ground, clamp((progress - .52) / .24, 0, 1));
  return true;
}

function drawCitizen(c, space, cell, x, feet, height, options = {}) {
  const image = G.img[space ? 'orbitalNPCs' : 'localNPCs'];
  const bounds = NPC_FRAMES[space ? 'orbital' : 'locals'][cell % 24];
  if (!image || !bounds) return;
  const [sx, sy, sw, sh] = bounds;
  const scale = height / sh;
  const breath = G.settings.motion === false ? 0 : Math.sin((options.time || 0) * 2 + cell) * .008;
  const duck = options.alert ? .87 : 1;
  c.save();
  c.translate(x, feet);
  c.scale(options.dir || 1, duck + breath);
  c.globalAlpha = options.alpha === undefined ? 1 : options.alpha;
  c.drawImage(image, sx, sy, sw, sh, -sw * scale / 2, -height, sw * scale, height);
  c.restore();
}

function makePopulation(chapter, groundAt) {
  const space = !['street', 'glitch'].includes(chapter.theme);
  const roster = [];
  const rng = seeded(chapter.id.length * 327 + chapter.length);
  const start = space ? (chapter.n * 5) % 24 : (chapter.n * 7) % 24;
  for (let i = 0; i < 18; i++) {
    const x = 200 + i * (chapter.length - 480) / 18;
    if (groundAt(x) > 9000) continue;
    roster.push({cell:(start + i * 5) % 24, x, home:x, dir:i % 2 ? 1 : -1,
      height:64 + rng() * 17, phase:rng() * 6, walk:i % 4 === 1, space, alert:false});
  }
  const encounter = SIDE_ENCOUNTERS[chapter.id];
  if (encounter) {
    let x = 320;
    while (groundAt(x) > 9000) x += 30;
    roster.push({cell:encounter.cell, x, home:x, dir:1, height:82, phase:0, walk:false,
      space, alert:false, encounter, name:encounter.speaker});
  }
  return roster;
}

function updatePopulation(scene, dt) {
  const h = scene.h;
  for (const npc of scene.population) {
    npc.alert = Math.abs(npc.x - h.x) < 220 && (h.shootT > 0 || h.rush > 0 || h.hurtT > 0);
    npc.phase += dt;
    if (npc.walk && !npc.alert && G.settings.motion !== false) {
      npc.x = npc.home + Math.sin(npc.phase * .45) * 20;
      npc.dir = Math.cos(npc.phase * .45) > 0 ? 1 : -1;
    }
  }
  const near = scene.population.find(npc => Math.abs(npc.x - h.x) < 58 && Math.abs(h.y - GROUND) < 30);
  scene.nearNPC = near || null;
  if (!near || !Input.hit('interact') || h.dead) return;
  if (near.encounter) {
    const page = near.encounter.page;
    const comic = ComicScene([{page, focus:'full', lines:near.encounter.lines}], {
      onDone:() => {SAVE.pages[page]=true;save();transitionTo(scene,'page');}
    });
    transitionTo(comic, 'page');
    return;
  }
  scene.bubble = [(near.space ? ORBITAL_NAMES : LOCAL_NAMES)[near.cell],
    (near.space ? ORBITAL_CHAT : STREET_CHAT)[near.cell % 6]];
  scene.bubbleT = 4;
}

function drawPopulation(c, scene) {
  const density = G.settings.crowds === 'low' ? 2 : 1;
  scene.population.forEach((npc, index) => {
    if (index % density && !npc.encounter) return;
    if (npc.x < scene.cam - 90 || npc.x > scene.cam + W / 1.35 + 90) return;
    dropShadow(c, npc.x, GROUND - 2, 18, .18);
    drawCitizen(c, npc.space, npc.cell, npc.x, GROUND - 3, npc.height,
      {time:scene.t, dir:npc.dir, alert:npc.alert, alpha:.92});
  });
}

function drawAtmosphere(c, theme, time) {
  if (G.settings.motion === false || G.settings.detail === 'low') return;
  c.save();
  c.globalAlpha = .18;
  c.fillStyle = theme === 'street' ? '#ffd495' : '#a5dedd';
  for (let i = 0; i < 20; i++) {
    const x = (i * 197 + time * (8 + i % 5)) % W;
    const y = (i * 73 + Math.sin(time * .4 + i) * 12) % H;
    c.fillRect(x, y, 1.4 + i % 2, 1.4 + i % 2);
  }
  c.restore();
}

function drawModernPlatform(c, platform, theme) {
  const street = theme === 'street' || theme === 'glitch';
  const {x,y,w,h} = platform;
  const fill = c.createLinearGradient(0,y,0,y+h);
  fill.addColorStop(0,street?'#567264':'#687986');
  fill.addColorStop(.2,street?'#304d42':'#354654');
  fill.addColorStop(1,street?'#152d29':'#182732');
  c.fillStyle='#101d23';c.fillRect(x-3,y-3,w+6,h+7);
  c.fillStyle=fill;c.fillRect(x,y,w,h);
  c.fillStyle=street?'#b9c39a':'#b0cad1';c.fillRect(x,y,w,3);
  c.strokeStyle=street?'#203a30':'#142632';c.lineWidth=1;
  for(let joint=x+28;joint<x+w;joint+=36){
    c.beginPath();c.moveTo(joint,y+5);c.lineTo(joint+3,y+h-3);c.stroke();
    c.fillStyle='#9bada5';c.fillRect(joint+4,y+5,2,2);
  }
  c.fillStyle=street?'#bb8a52':TEAL;
  for(let stripe=x+5;stripe<x+w-6;stripe+=28)c.fillRect(stripe,y+h-4,13,2);
  if(street){
    c.fillStyle='#3d5f4e';
    for(let fringe=x;fringe<x+w;fringe+=14){
      c.beginPath();c.moveTo(fringe,y+h);c.lineTo(Math.min(fringe+14,x+w),y+h);
      c.lineTo(Math.min(fringe+7,x+w),y+h+6);c.closePath();c.fill();
    }
    c.strokeStyle='#26352f';c.lineWidth=2;
    c.beginPath();c.moveTo(x+8,y+h+5);c.lineTo(x+8,y+h+22);c.lineTo(x+29,y+h+5);c.stroke();
  }
  if(platform.moving){c.fillStyle='#34464c';c.fillRect(x+w/2-2,y+h,4,GROUND-y-h);}
}

function drawModernEnemy(c, enemy, height) {
  const first=enemy.type==='thug'?0:enemy.type==='gunner'?2:4;
  const variants=enemy.type==='alien'?4:2;
  const person=first+enemy.variant%variants;
  const attack=enemy.attackT>0?1:0;
  const [x,y,width,sourceHeight,anchor]=OPPONENT_FRAMES[person*2+attack];
  const scale=height/sourceHeight;
  c.save();c.translate(enemy.x,enemy.y);c.scale(enemy.dir,1);
  const motion=G.settings.motion===false?0:Math.sin(enemy.step*2)*.015;
  c.transform(1,motion,enemy.alert ? .025 : 0,1,0,0);
  c.drawImage(G.img.opponents,x,y,width,sourceHeight,-anchor*scale,-height,width*scale,height);
  c.restore();
}

function drawRouteHUD(c, scene) {
  const chapter = scene.chapter;
  const h = scene.h;
  const panelX = W / 2 - 148;
  const percent = clamp(h.x / chapter.length, 0, 1);
  c.fillStyle = 'rgba(10,17,22,.86)';
  c.fillRect(panelX - 8, H - 43, 312, 31);
  c.fillStyle = '#43505a';
  c.fillRect(panelX, H - 23, 296, 3);
  c.fillStyle = TEAL;
  c.fillRect(panelX, H - 23, 296 * percent, 3);
  text(c, chapter.sub, W / 2, H - 30, {size:10, font:FONT_COMIC, weight:'400', align:'center', col:PAPER, maxW:280});
  for (const cp of scene.checkpoints) {
    c.fillStyle = cp.hit ? TEAL : PAPER;
    c.fillRect(panelX + cp.x / chapter.length * 296, H - 25, 2, 7);
  }
  if (scene.nearNPC) {
    const key = actionLabel('interact');
    text(c, key + ' · HAVE A WORD', W / 2, H - 62,
      {size:15, font:FONT_COMIC, weight:'400', col:AMBER, align:'center', stroke:4});
  }
}
