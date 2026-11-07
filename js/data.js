/* TURBO & WEASEL: COOKED EDITION — story, chapters, dialogue, RPG data.
   Dialogue marked [C] in comments is lifted from the approved ten-issue comic; the rest is new connective writing in the same voice. */
'use strict';

const CHARS={
 turbo:{name:'TURBO',tag:'THE HEAVY HITTER',hp:7,speed:170,jump:400,fireRate:.2,damage:2,col:'#efba56',special:'BULL RUSH',weapon:'HEAVY BLASTER',blurb:'Burly. Insecure. Thinks force fixes scale. Usually right, which is the problem.',victory:'Last tram, mate. You missed it.'},
 weasel:{name:'WEASEL',tag:'THE SLIPPERY BASTARD',hp:5,speed:215,jump:420,fireRate:.11,damage:1,col:'#68cbbb',special:'SYSTEM HACK',weapon:'PULSE PISTOL',blurb:'Wiry. Cowardly. Negotiates with gods for free gear. Double jump. Wall kick.',victory:'Have you tried turning yourself off?'},
};
const DIFF={
 pissweak:{name:'PISS WEAK',desc:'Six lives, big health, enemies move like they’re on the nod. Bosses go one round. Have a look around, ya tourist.',lives:6,hp:1.6,enemyHP:.6,bossHP:.6,enemySpeed:.7,enemyRate:1.7,dmg:.6,rounds:1,xp:.8,aiReact:.9,aiAggro:.25},
 mission:{name:'BIT OF A MISSION',desc:'Three lives. Fair fights. The regular mess.',lives:3,hp:1,enemyHP:1,bossHP:1,enemySpeed:1,enemyRate:1,dmg:1,rounds:2,xp:1,aiReact:.5,aiAggro:.5},
 cooked:{name:'PRETTY COOKED',desc:'Two lives. Faster volleys, tougher gangs, bosses read your inputs. Bring a mate. You haven’t got one.',lives:2,hp:.85,enemyHP:1.4,bossHP:1.35,enemySpeed:1.2,enemyRate:.75,dmg:1.5,rounds:2,xp:1.4,aiReact:.28,aiAggro:.7},
 absolutely:{name:'ABSOLUTELY COOKED',desc:'One life. Double damage. Robbie is watching and he is bored. Not a difficulty, a cry for help.',lives:1,hp:.7,enemyHP:1.8,bossHP:1.7,enemySpeed:1.35,enemyRate:.6,dmg:2,rounds:3,xp:2,aiReact:.15,aiAggro:.9},
};
const DIFF_ORDER=['pissweak','mission','cooked','absolutely'];

/* Page ids map to assets (hi-res webp when present, else the original low-res jpg). */
const COVERS={1:'cover-01',2:'cover-02',3:'cover-03',4:'cover-04',5:'cover-05',6:'cover-06',7:'cover-07',8:'cover-08',9:'cover-09',10:'cover-10'};

/* Cutscene beats: {page, focus:'top'|'mid'|'bot'|'full', lines:[[SPEAKER, text, kind?, side?]], caption, sfx, music} */
const CHAPTERS=[
 {id:'market',n:1,issue:1,title:'MARKET BAR MAYHEM',sub:'VICTORIA STREET, RICHMOND',theme:'street',music:'street',length:3400,
  enemies:['thug','thug','gunner'],boss:'karl',bossName:'CRAZY CARL',bossTag:'CUMTHIEVES · HEAD OFFICE',arena:'street',bonus:'cone',
  objective:'GET TO THE MARKET BAR · SMASH THE CUMTHIEVES',
  intro:[
   {page:'I01-P01',focus:'top',caption:'VICTORIA STREET, RICHMOND. A TUESDAY. PROBABLY.',music:'glitch'},
   {page:'I01-P01',focus:'mid',lines:[['RADIO','…armed robbery in progress. Market Bar, Victoria Street…','radio'],['WEASEL','That’s our fucking pub.']]},
   {page:'I01-P02',focus:'top',lines:[['TURBO','Weasel, you little cunt, grab your shit! We’ve got a bar to save!','shout'],['WEASEL','Jesus, Turbo, do we have to? Can’t the jacks handle it?']]},
   {page:'I01-P02',focus:'bot',lines:[['TURBO','The jacks? The jacks took forty minutes to find our flat and it’s above a kebab shop with our names on the bin.'],['WEASEL','That was one time. And the bin was on fire.']]},
   {page:'I01-P04',focus:'mid',lines:[['TURBO','No cunt fucks around with our bar but us!','shout'],['WEASEL','That’s not a licence, Turbz.'],['TURBO','It’s a philosophy. Crimes we stop go in the bank. Crimes we do come out of it.'],['WEASEL','We’re so far in the red the bank’s sent a bloke.']]},
  ],
  preboss:[
   {page:'I01-P05',focus:'top',lines:[['CARL','Well, if it isn’t Turbo and Weasel. The neighbourhood’s biggest psychos.'],['TURBO','Hand it all over and get the fuck on the ground!','shout']]},
   {page:'I01-P05',focus:'bot',lines:[['CARL','You’re out of your league, arseholes!'],['WEASEL','Yeah. I’ll take the other league.'],['WEASEL','(Round the back. Cut off the exit. Not die.)','thought']]},
  ],
  outro:[
   {page:'I01-P12',focus:'mid',sfx:'KRUNCH',lines:[['TURBO','We did it, you cowardly little shit.'],['WEASEL','Yeah, yeah, Turbo. But next time, let’s leave the heroics to the cops, you absolute psycho.']]},
   {page:'I01-P13',focus:'top',lines:[['TURBO','We saved your fucking pub.'],['BORKMASTER','Yeah. Robbers only broke the door.']]},
   {page:'I01-P13',focus:'bot',lines:[['WEASEL','That could’ve been pre-existing.'],['BORKMASTER','So could your tab.'],['BORKMASTER','Clean-up’s six hundred. Put it on the slate with the rest of your life.']]},
  ]},
 {id:'lennox',n:2,issue:1,title:'LENNOX STREET REPO',sub:'106 LENNOX ST, NORTH RICHMOND · THE TOP FLAT',theme:'street',music:'street',length:3600,race:true,
  enemies:['thug','thug','gunner'],boss:'lucifer',bossName:'LUCIFER',bossTag:'106 LENNOX ST · TOP FLAT · “MECHANIC”',arena:'lennox',bonus:null,collect:{label:'BIKE PARTS',singular:'BIKE PART',need:3,item:'part'},
  objective:'FIND THE THREE PARTS · FINISH THE BIKE SALE AT 106',
  intro:[
   {page:'extra-sale',focus:'full',caption:'106 LENNOX STREET. THE TOP FLAT.',lines:[['TURBO','Sold the bike. Reckon that’ll get the gear bloke off our backs?'],['WEASEL','Once Lucifer actually pays us.']]},
   {page:'extra-parts',focus:'full',lines:[['LUCIFER','Three bits missing, habibi. Whole bike price is for a whole bike.'],['TURBO','They were on it when I sold it.'],['WEASEL','There’s your pedal. Holding his bloody window open.']]}
  ],
  preboss:[
   {page:'extra-parts',focus:[0,.03,1,.9],lines:[['WEASEL','Three bits. Count ’em.'],['LUCIFER','Parts and labour, boys. You still owe me labour.'],['TURBO','I’ll give you some fucking labour.']]}
  ],
  outro:[
   {page:'extra-scooter',focus:'full',lines:[['LUCIFER','Sale money went across the road. Ask your dealer. Take the Ninebot for the trouble.'],['WEASEL','Got a receipt?'],['LUCIFER','For that scooter? Fuck, no.']]},
   {page:'extra-grid',focus:'full',caption:'SUNDAY. NORTH RICHMOND SCOOTER GP.',lines:[['WEASEL','What’s first prize?'],['TURBO','Cash.'],['WEASEL','Christ. An actual business plan.']]}
  ]},
 {id:'memory',n:2,issue:3,covers:[2,3,4],title:'FIRST THING YOU REMEMBER',sub:'THE FLAT · THE BAR · 3AM',theme:'glitch',music:'glitch',length:3000,
  enemies:['thug','gunner','drone'],boss:'riot',bossName:'RIOT COMMAND',bossTag:'VICTORIA POLICE · 3AM NOISE COMPLAINT',arena:'street',bonus:'pokies',collect:{label:'MEMORIES',singular:'MEMORY',need:3,item:'memory'},
  objective:'FIND 3 LOST MEMORIES · DON’T LOOK AT THE SKY TOO LONG',
  intro:[
   {page:'I02-P14',focus:'top',caption:'LATER. THE FLAT. MRS WEASEL WAKES UP FROM HER FIRST HIBERNATION.'},
   {page:'I02-P14',focus:'mid',lines:[['MRS WEASEL','Had that Robbie Williams song stuck in my head since I woke up.'],['MRS WEASEL','Rock DJ. First thing I remember.']]},
   {page:'I02-P14',focus:'bot',lines:[['WEASEL','Tonight?'],['MRS WEASEL','No. Ever.'],['WEASEL','…Right. Fuck.']]},
   {page:'I03-P01',focus:'mid',lines:[['WEASEL','What happened before the song?'],['TURBO','Dunno. Old shitbox. Radio on. Can’t remember getting in the thing.']]},
   {page:'I03-P02',focus:'mid',lines:[['WEASEL','Same fucking song.'],['TURBO','Everyone? Bork? The bloke at the servo? The dog?'],['WEASEL','The dog hums it.']]},
   {page:'I03-P10',focus:'mid',lines:[['WEASEL','It’s not the song. It’s that there’s nothing before it.'],['TURBO','If something’s fucked, I’d rather you noticed it than me.'],['TURBO','Right. We go round the street and we ask every cunt what they remember. Like detectives. Cooked detectives.']]},
  ],
  preboss:[
   {page:'I03-P15',focus:'bot',sfx:'VZZZT',lines:[['BORKMASTER','Tell me that’s the window.'],['TURBO','That’s not the window.']]},
   {page:'I03-P16',focus:'mid',lines:[['BORKMASTER','Nobody fucking move.']]},
   {page:'I04-P01',focus:'full',sfx:'TA-DAA',music:'boss',lines:[['ROBBIE','G’day, you pack of fuckin’ degenerates!','shout']]},
   {page:'I04-P03',focus:'mid',lines:[['ROBBIE','The booze, the cones, the gear—it’s all just a game.'],['ROBBIE','My game.']]},
   {page:'I04-P05',focus:'top',lines:[['ROBBIE','Victoria Street, Richmond—all of it’s just my little simulation.'],['TURBO','Our whole life?'],['ROBBIE','And you two? My favourite toys.']]},
   {page:'I04-P09',focus:'mid',lines:[['WEASEL','My missus. She part of the joke too?'],['ROBBIE','She’s in the world, isn’t she?'],['WEASEL','That wasn’t what I asked.'],['WEASEL','…Also, if this is your game, the servo pies are fucking shithouse. Fix that. And free gear. Obviously.']]},
   {page:'I04-P16',focus:'bot',lines:[['WEASEL','What if breaking it is what he wants?'],['TURBO','Then we’ll break it wrong.'],['TURBO','Let’s break the fuckin’ game.','shout']]},
   {page:'extra-riot',focus:'full',sfx:'BANG BANG',lines:[['OFFICER','POLICE! Noise complaint. Also the bong on the windowsill. Also everything else.','shout'],['WEASEL','That’s a vase.'],['OFFICER','It’s bubbling, mate.']]},
   {page:'extra-riot',focus:'full',lines:[['MRS WEASEL','If you two get nicked before the servo run I’m selling your gear and keeping the glass.'],['TURBO','She’s a keeper, Weas.'],['WEASEL','She’s a fucking liability with great legs. Shields up.']]},
  ],
  outro:[
   {page:'extra-riot-after',focus:'full',lines:[['TURBO','Public Order Response. Over a billy.'],['WEASEL','Over a billy and a simulated pub, in fairness.'],['MRS WEASEL','You left the cone piece in the cop’s pocket. He’ll be back.']]},
  ]},
 {id:'break',n:3,issue:5,title:'LET’S BREAK THE GAME',sub:'THE SERVO · THE FOOTY CLUB · THE CELLS',theme:'street',music:'street',length:3800,
  enemies:['thug','gunner','cop','cop'],boss:'plague',bossName:'THE PLAGUE DOCTOR',bossTag:'SERVO FORECOURT · SELF-APPOINTED',arena:'servo',bonus:'slab',
  objective:'COVER THE AWNING BILL · REACH THE SERVO · GET BACK TO BORK',
  intro:[
   {page:'I05-P01',focus:'top',lines:[['TURBO','Right, Robbie. Watch this.'],['WEASEL','We don’t actually know where he’s watching from.'],['TURBO','Start local.']]},
   {page:'I05-P04',focus:'bot',sfx:'WHOOMP',lines:[['BORKMASTER','That’s my fucking awning.','shout'],['TURBO','It’s only a simulation!'],['BORKMASTER','Then simulate a fucking hose!']]},
   {page:'I05-P06',focus:'mid',lines:[['WEASEL','So we save the pub by robbing the neighbour?'],['TURBO','The neighbour’s a servo. The servo is a corporation. We’re basically a union.'],['WEASEL','Our accountant’s going to be a magistrate.']]},
  ],
  preboss:[
   {page:'extra-beak',focus:'full',caption:'SERVO FORECOURT. THE MAN BESIDE THE JEEP HAS A PILOT LIGHT.',lines:[['PLAGUE DOCTOR','Put the bag down. Quarantine zone.'],['TURBO','Mate, it’s a servo.']]},
   {page:'extra-jeep',focus:'full',lines:[['WEASEL','That your Jeep?'],['PLAGUE DOCTOR','Was. Stand clear.'],['TURBO','Bit fucking late for that.']]}
  ],
  outro:[
   {page:'I05-P13',focus:'mid',caption:'THE POLICE VAN. TURBO CAN STILL SMELL THE JEEP.',lines:[['TURBO','This is temporary.'],['WEASEL','Everything is. That’s what makes prison annoying.'],['TURBO','Shazza from the Market Bar bailed Angus out once with a tray of pots and a look. We need Shazza.']]},
   {page:'I05-P15',focus:'bot',sfx:'CLANK',lines:[['ROBBIE','They’re with me.'],['WEASEL','Oh, good. Our other problem.']]},
   {page:'I05-P17',focus:'mid',lines:[['WEASEL','You getting us off?'],['ROBBIE','I’m getting you out. Different thing.'],['WEASEL','Bork’s still in there.'],['ROBBIE','We’re taking the talent.']]},
   {page:'I05-P19',focus:'mid',music:'space',lines:[['WEASEL','Where’s the other end?'],['ROBBIE','Somewhere with room to grow.'],['WEASEL','That’s not an address!','shout']]},
   {page:'I05-P20',focus:'full',sfx:'FWOOOM',lines:[['TURBO','Right. Bit bigger than Richmond.']]},
  ]},
 {id:'space',n:4,issue:6,title:'WELCOME TO THE REAL SHITHOLE',sub:'QUADRANT DOCK 69 · ISA CUSTOMS',theme:'space',music:'space',length:4000,
  enemies:['alien','alien','monk','drone'],boss:'alienking',bossName:'BIG GAZZ',bossTag:'DOCK 69 · LOCALS ONLY',arena:'space',bonus:'cone',lowGrav:.85,
  objective:'GET THROUGH CUSTOMS · DON’T DECLARE ANYTHING · FIND THE DOCK',
  intro:[
   {page:'I06-P01',focus:'top',lines:[['TURBO','There’s our spaceship.'],['WEASEL','Looks like it’s had three owners and a fire.'],['TURBO','Character.']]},
   {page:'I06-P04',focus:'mid',lines:[['ROBBIE','Welcome to the real world, you absolute cunts!','shout'],['WEASEL','Different uniform. Same fucking bloke.']]},
   {page:'I06-P06',focus:'top',lines:[['TURBO','What the fuck is this, Robbie? Some kind of space wankfest?'],['ROBBIE','Big leagues, boys.'],['WEASEL','Sell space gear?'],['ROBBIE','Exactly!']]},
   {page:'I06-P08',focus:'mid',sfx:'DOOM',music:'moon',lines:[['MONK LEADER','Robbie Williams. Intergalactic Space Authority. You will remain here.'],['MONK LEADER','Unauthorised simulations. Illegal space gear. Galactic Code violations.'],['WEASEL','We just got here!']]},
   {page:'I06-P11',focus:'bot',lines:[['CROWE','Am I interrupting?'],['ROBBIE','Space Russell Crowe. Perfect timing.'],['CROWE','I don’t work for free, cunt.']]},
   {page:'I06-P13',focus:'mid',sfx:'BLAM',lines:[['CROWE','Eyes down.'],['CROWE','Time to go!','shout'],['TURBO','We could take them here.'],['WEASEL','Good. Take them somewhere we aren’t.']]},
  ],
  preboss:[
   {page:'extra-gazz',focus:'full',lines:[['CROWE','Dock’s through there. Past the bouncer.'],['TURBO','Space has bouncers?'],['CROWE','Space is mostly bouncers.']]},
   {page:'extra-gazz-fight',focus:'full',lines:[['BIG GAZZ','Locals only, earth dickhead.'],['TURBO','Mate, I’ve been a local everywhere I’ve been barred from.']]},
  ],
  outro:[
   {page:'I06-P17',focus:'mid',lines:[['ROBBIE','I’ll make sure you’re compensated.'],['CROWE','Oh, I know you will, you fuckin’ dickhead.'],['WEASEL','His rescue. His bill.'],['CROWE','You’re learning.']]},
   {page:'I06-P21',focus:'mid',lines:[['ROBBIE','Your first consignment. On tick.'],['WEASEL','So every bit we take still gets paid for?'],['ROBBIE','Use it, lose it, give it away. Same account.']]},
   {page:'I06-P22',focus:'top',lines:[['ROBBIE','I’m off to Bruges. Don’t make me come back early.'],['TURBO','What the fuck is a Bruges?'],['WEASEL','Belgium. Chocolate. Canals. Blokes who own simulations go there to feel something.']]},
   {page:'I06-P24',focus:'bot',lines:[['WEASEL','Bork’s still back there.'],['TURBO','We’re getting Bork.'],['WEASEL','He’ll want something. This isn’t ours to spend.'],['TURBO','Then we’ll owe something.'],['WEASEL','Right. Let’s owe it properly.']]},
  ]},
 {id:'portal',n:5,issue:7,title:'ONE ADDRESS. ONE OPENING.',sub:'ISA TRANSIT RING · THE PORTAL',theme:'isa',music:'space',length:4200,
  enemies:['monk','drone','alien','cop'],boss:'trixy',bossKind:'craft',unlock:'walker',bossName:'TRIXY',bossTag:'ISA BLACK PROJECT · TR-3B',arena:'isa',bonus:'slab',collect:{label:'PORTAL ANCHORS',singular:'PORTAL ANCHOR',need:3,item:'anchor'},
  objective:'PLANT 3 PORTAL ANCHORS · OUTRUN THE ISA · BRING EVERYONE THROUGH',
  intro:[
   {page:'I07-P01',focus:'top',lines:[['WEASEL','Crowe. Need another job done.'],['WEASEL','Our mate. Borkmaster. He’s still in there. We’re starting up Space Market Bar, and we need him to run the joint.']]},
   {page:'I07-P01',focus:'bot',lines:[['TURBO','We’re not leaving him there because the invoice is awkward.'],['CROWE','Everything you own is an invoice, mate. You just haven’t opened it.']]},
   {page:'I07-P08',focus:'mid',lines:[['CROWE','One address. One opening. Bring whoever’s with him through together.'],['WEASEL','The Market Bar. Not a copy of him. Him.'],['CROWE','People through a door. You still have to convince them.']]},
  ],
  preboss:[
   {page:'I07-P12',focus:'top',sfx:'VWORP',lines:[['BORKMASTER','If that’s a portal for a delivery, you’re fucking late.'],['TURBO','Bork! We’re in space.'],['BORKMASTER','I’m in work. What d’you want?']]},
   {page:'I07-P13',focus:'bot',lines:[['TURBO','That was us. Come with us, mate.'],['BORKMASTER','Not without Angus and the dog.'],['WEASEL','ISA’s tracked the opening. Something big is coming down the ring.']]},
   {page:'extra-triangle',focus:'full',sfx:'HMMMMMM',lines:[['TURBO','Why’s it so quiet. Why’s me chest gone funny.'],['WEASEL','Black triangle. No sound. Three lights. That’s a TR-3B, Turbz. That’s the one off the forums.'],['TURBO','Which forums?'],['WEASEL','The ones Mrs Weasel told me to stop reading at 4am.']]},
   {page:'extra-drain',focus:'full',lines:[['TRIXY','DESIGNATION: TRIXY. LIFE FORCE RECOVERY VEHICLE. YOUR ACCOUNTS ARE OVERDRAWN. COMMENCING WITHDRAWAL.','radio'],['WEASEL','It’s a repo Dorito.'],['TURBO','Nobody repos my life force. It’s ninety percent VB.']]},
  ],
  outro:[
   {page:'I07-P18',focus:'mid',lines:[['BORKMASTER','You came back.'],['TURBO','Who else knows where you keep the clean glasses?']]},
   {page:'I07-P20',focus:'top',lines:[['BORKMASTER','Meet Wacky Angus—local hooligan, drunken jollyman, and the only cunt who can keep up with me on a bender.'],['ANGUS','I brought a bottle. It’s empty. It’s a weapon now.']]},
   {page:'I07-P20',focus:'bot',lines:[['BORKMASTER','And me dog Freddo. Sir Borkius, Frederick the Second, Baron of the Smashponds.'],['FREDDO','A door is only an escape if you choose where to walk next.','thought'],['BORKMASTER','He says g’day.']]},
   {page:'I07-P21',focus:'mid',lines:[['CROWE','Permanent seat. Free pints. Free gear. We clear?'],['WEASEL','Clear’s a strong word. Agreed.'],['BORKMASTER','You gave him a free tab at my pub?'],['TURBO','Cheer up. You haven’t got a pub yet.']]},
  ]},
 {id:'opening',n:6,issue:8,title:'GRAND OPENING, OUTSTANDING BALANCE',sub:'SPACE MARKET BAR · DELIVERY RUN',theme:'space',music:'space',length:3800,
  enemies:['alien','thug','drone','monk'],boss:'crowe',bossName:'SPACE RUSSELL CROWE',bossTag:'VIP SEAT · FRIENDLY (HIS WORDS)',arena:'space',bonus:'pokies',friendly:true,
  objective:'DELIVER THE SEALED LOT · GET PAID · PAY ROBBIE · OPEN THE PUB',
  intro:[
   {page:'I08-P01',focus:'top',lines:[['WEASEL','Is the leak included?'],['CARETAKER','That’s the water feature.'],['TURBO','We’ll turn this into an institution.'],['BORKMASTER','It’s already condemned. Halfway there.']]},
   {page:'I08-P01',focus:'bot',lines:[['TURBO','Feels like home.'],['WEASEL','Smells like the bloke who died in it.'],['BORKMASTER','Pipe first. Monument to yourself later.']]},
   {page:'I08-P05',focus:'mid',lines:[['BUYER','Whole sealed lot. Deliver it today.'],['WEASEL','Full price. No mates’ rates.'],['TURBO','We’re not mates yet.'],['WEASEL','If we get this home, Robbie’s cleared.']]},
  ],
  preboss:[
   {page:'I08-P12',focus:'top',lines:[['TURBO','We actually sold all of it.'],['WEASEL','Mad system. Give them something. They pay.']]},
   {page:'extra-vip',focus:'full',lines:[['CROWE','Opening night. Permanent seat’s taken. Who wants to test the floor?'],['TURBO','Is this a fight or a housewarming?'],['CROWE','In space, mate, same thing.']]},
  ],
  outro:[
   {page:'extra-spar',focus:'full',lines:[['BORKMASTER','Floor held. You break the chair, you buy it.'],['CROWE','Chair’s part of my deal, mate.']]},
   {page:'I08-P16',focus:'mid',sfx:'KA-CHING',lines:[['WEASEL','Paying the initial consignment. All of it. Confirm it.'],['ROBBIE','Received in full. Original gear account settled.'],['WEASEL','Beautiful. Got that saved.']]},
   {page:'I08-P22',focus:'top',music:'moon',lines:[['WEASEL','If it’s Robbie, we’re square.'],['MONK LEADER','Your private account is irrelevant.']]},
   {page:'I08-P24',focus:'bot',lines:[['WEASEL','They’re following.'],['BORKMASTER','Old temple. Blood Moon of Kraggar Seven. Just need somewhere to breathe.']]},
  ]},
 {id:'moon',n:7,issue:9,title:'BLOOD MOON, LAST DRINKS',sub:'KRAGGAR VII · THE TEMPLE RUINS',theme:'moon',music:'moon',length:4400,
  enemies:['monk','monk','drone','alien'],boss:'abbess',bossName:'THE MONK LEADER',bossTag:'ISA ENFORCEMENT · HIGH MONK',arena:'moon',bonus:'cone',lowGrav:.8,
  objective:'HOLD THE TEMPLE · FOLLOW THE DIRT · FIND THE HIGH MONK',
  intro:[
   {page:'I09-P01',focus:'top',lines:[['TURBO','Lovely. No neighbours.'],['WEASEL','No exits either.']]},
   {page:'I09-P04',focus:'mid',sfx:'DOOM',lines:[['MONK LEADER','Come out. Leave your weapons.'],['WEASEL','The fucking debt is paid.'],['MONK LEADER','The ISA requires your surrender.'],['BORKMASTER','Manager says get fucked.']]},
   {page:'I09-P08',focus:'mid',caption:'THE MONKS GET INSIDE WEASEL’S HEAD. IT IS NOT A BIG ROOM.',lines:[['WEASEL','Get out of my head.'],['TURBO','Weasel. I’m here.'],['TURBO','You did nothing wrong. Well. Legally, heaps. But not this.']]},
   {page:'I09-P11',focus:'bot',lines:[['TURBO','Can I help you up?'],['WEASEL','Just the hand.'],['WEASEL','Don’t tell me I’m all right.'],['TURBO','Wasn’t going to.']]},
  ],
  preboss:[
   {page:'I09-P17',focus:'top',lines:[['BORKMASTER','You want this quiet. So do I.'],['MONK LEADER','You have nothing to offer.'],['BORKMASTER','I’ve got a truce and a bottle. One of them’s real.']]},
  ],
  outro:[
   {page:'I09-P17',focus:'bot',sfx:'KRAK',lines:[['TURBO','The leader?'],['BORKMASTER','Dead.'],['WEASEL','I want out of here.'],['TURBO','Then we go.']]},
   {page:'I09-P18',focus:'mid',music:'boss',lines:[['ROBBIE','You’ve absolutely fucked this.','shout']]},
   {page:'I09-P19',focus:'mid',lines:[['TURBO','We paid you.'],['ROBBIE','Yes. Then you killed my protection.'],['WEASEL','The Monks?'],['ROBBIE','They kept the ISA off my back. That was the fucking arrangement.']]},
   {page:'I09-P20',focus:'bot',sfx:'ZZARK',lines:[['BORKMASTER','They hurt my mate.'],['ROBBIE','I’ve arranged a lift.'],['CAPTION','ROBBIE TAKES TURBO AND WEASEL. THE WARSHIP LEAVES ORBIT. THE SONG STARTS.','caption']]},
   {page:'I09-P24',focus:'mid',lines:[['REGULAR','Crowe’s got your dog. Space crimes, apparently.'],['BORKMASTER','Right. Let’s make the cunt an offer.']]},
  ]},
 {id:'encore',n:8,issue:10,title:'ROCK DJ RECKONING',sub:'ROBBIE’S WARSHIP · THE BRIDGE',theme:'ship',music:'boss',length:4600,
  enemies:['cop','drone','monk','gunner'],boss:'robbie',bossName:'ROBBIE WILLIAMS',bossTag:'OWNER · OPERATOR · ENCORE',arena:'ship',bonus:null,final:true,
  objective:'ESCAPE THE CELLS · REACH THE BRIDGE · RELEASE THE PODS',
  intro:[
   {page:'I10-P02',focus:'top',caption:'MEANWHILE. CROWE’S LAIR. A NEGOTIATION.',lines:[['CROWE','You want the dog. I want supply.'],['BORKMASTER','Exclusive rights. Best gear we bring in.'],['ANGUS','We haven’t got any.'],['BORKMASTER','Then it’s a very exclusive arrangement.']]},
   {page:'I10-P08',focus:'mid',sfx:'WOOF',lines:[['WEASEL','Good dog. Exceptionally weird dog.'],['TURBO','You came back.'],['BORKMASTER','You opened a pub without checking the exits. Course I did.']]},
   {page:'I10-P09',focus:'bot',lines:[['WEASEL','Pods. Locked.'],['BORKMASTER','Bridge has the release.'],['WEASEL','Forward, then back here. Remember that.'],['TURBO','I’ll remember the first half.']]},
  ],
  preboss:[
   {page:'I10-P12',focus:'top',lines:[['ROBBIE','Took your time.'],['WEASEL','Just want the release.'],['TURBO','Mate, we’re missing the fucking exit.']]},
   {page:'I10-P13',focus:'mid',lines:[['ROBBIE','I gave you a world.'],['WEASEL','Then you gave us a bill. We paid it.'],['ROBBIE','You think that makes you free?'],['TURBO','Makes you a paid cunt. Start there.']]},
  ],
  outro:[
   {page:'I10-P21',focus:'top',sfx:'KRA-KOOM',lines:[['FREDDO','The lifeboats are open. The ship is falling.','thought'],['BORKMASTER','Escape pods! Dog says they’re open. This whole thing’s going down.']]},
   {page:'I10-P27',focus:'mid',lines:[['WEASEL','They’re not sealed.'],['TURBO','We wait.'],['ANGUS','Found the problem. Usually me.'],['WEASEL','Now.']]},
   {page:'I10-P29',focus:'mid',lines:[['WEASEL','Is he gone?'],['TURBO','We are.'],['BORKMASTER','Don’t know what he can survive. Not finding out today.']]},
   {page:'I10-P30',focus:'bot',music:'win',lines:[['FESTIVAL CONTACT','Take the old festival ambulance. It’s ours to give.'],['TURBO','The Scambulance.'],['WEASEL','Finally. Honest branding.'],['CROWE','You owe me another one. That rescue was extra.']]},
   {page:'I10-P31',focus:'mid',lines:[['WEASEL','Robbie’s settled. Crowe owns the supply. You own the tab.'],['TURBO','You got us out.'],['WEASEL','We all got out.']]},
   {page:'I10-P32',focus:'full',lines:[['TURBO','Where to, mate?'],['WEASEL','Dunno. Wanna get a bag?'],['FREDDO','A song can end before its echo does.','thought']]},
  ]},
];

/* Mid-level banter (platformer) — pops as a bubble above the hero at set points */
const BANTER={
 street:[['WEASEL','Why is saving a pub a fucking parkour qualification?'],['TURBO','Keeon’s bong has more frequent-flyer points than us.'],['WEASEL','Because you keep leaving it on the 109, cunt.'],['TURBO','That cop’s got a Hawthorn tattoo. Shoot him twice.'],['WEASEL','I’ve got four bucks, a dead lighter and your emergency cone piece.'],['TURBO','Diversified portfolio.'],['SHAZZA','Oi! If you two die before the bar tab’s paid I’m putting your faces on the pokies.'],['TURBO','Shazza’s been pouring pots at the Market Bar since before the bar had a floor.'],['WEASEL','She once knocked Carl out with a tray. Then charged him for the tray.'],['MRS WEASEL','Pick up milk. And a lighter. And don’t get shot in the face, I like the face.'],['TURBO','Did Trudy text back?'],['WEASEL','She sent a photo of her staff. Her ACTUAL staff. The glowing one.'],['TURBO','Still a yes, mate.']],
 glitch:[['WEASEL','The sky’s doing the thing again.'],['TURBO','Don’t look at it. It’s like a magistrate.'],['WEASEL','That bloke just walked through a wall and apologised.'],['TURBO','Richmond’s always been like that.'],['WEASEL','Rock DJ. Rock DJ. ROCK fucking DJ.'],['MRS WEASEL','The sky’s loading again. Come to bed or come to the bong, pick one.'],['TURBO','Your missus runs a tight ship.'],['WEASEL','She runs the whole fleet, mate.']],
 space:[['TURBO','Three-eyed cunt looked at me funny. All three.'],['WEASEL','We’re in space and there’s still a bloke selling knock-off Nike TNs.'],['TURBO','Space customs asked if I had anything to declare. I said “yeah, nah.” They wrote it down.'],['WEASEL','Still got a draught.'],['TURBO','Somebody’s paying rent on all this.'],['WEASEL','That alien sheila with the three… everything. She winked.'],['TURBO','Which eye.'],['WEASEL','Yes.'],['TURBO','Can’t lose your gear out here. Glows through your fucking pockets.']],
 isa:[['WEASEL','ISA stands for Intergalactic Space Authority. Or Agency. They couldn’t decide either.'],['TURBO','Every door here needs a permit. I’ve never had a permit.'],['WEASEL','Forward, then back. Forward, then back.'],['TURBO','I know what forward is, Weasel.'],['WEASEL','Permit for the bong. Permit for the cone piece. Permit for the permit.'],['TURBO','Trudy’s got a cousin in ISA admin. Big blue eyes. Terrifying filing.']],
 moon:[['TURBO','Lovely. No neighbours.'],['WEASEL','No exits either.'],['TURBO','Follow the dirt. That’s our level.'],['WEASEL','That monk just said my name in my dad’s voice. I never met my dad.'],['TURBO','Red sky at night, shepherd’s cooked.'],['WEASEL','The High Monk’s a sheila, Turbz. Mind the hands.'],['TURBO','I mind everyone’s hands. It’s why I’m single.']],
 ship:[['WEASEL','He’s playing the song. He’s playing the fucking song on loop.'],['TURBO','I actually quite like the song.'],['WEASEL','Never say that again.'],['TURBO','Bridge. Pods. Leave. In that order.'],['WEASEL','That’s the first plan you’ve had with an order in it.'],['TURBO','If we live, Shazza said the first slab’s on the house.'],['WEASEL','If we live, I’m marrying my missus again. Properly. With a bong under the arch.']],
};

/* Enemy archetypes for the platformer (sprite indices refer to enemies-v2 / expansion-v3 sheets) */
const ENEMY_TYPES={
 thug:{name:'CUMTHIEF',hp:3,speed:70,w:34,h:64,melee:true,sprite:{sheet:'enemies',idle:0,walk:[0,1],attack:2},score:100,xp:6,drops:.25},
 gunner:{name:'GUNNER',hp:3,speed:40,w:34,h:64,shoot:{rate:1.9,speed:260},sprite:{sheet:'enemies',idle:0,walk:[0,1],attack:3},score:150,xp:8,drops:.3},
 monk:{name:'SPACE MONK',hp:4,speed:55,w:34,h:66,shoot:{rate:2.3,speed:200,orb:true},sprite:{sheet:'enemies',idle:4,walk:[4,4],attack:5},float:true,score:220,xp:12,drops:.3},
 drone:{name:'ISA DRONE',hp:2,speed:95,w:36,h:40,fly:true,shoot:{rate:2.6,speed:300},sprite:{sheet:'enemies',idle:6,walk:[6,6],attack:7},score:120,xp:7,drops:.2},
 cop:{name:'RIOT COP',hp:5,speed:50,w:36,h:66,shield:true,shoot:{rate:2.2,speed:280},sprite:{sheet:'expansion',idle:4,walk:[4,4],attack:4},score:200,xp:12,drops:.35},
 alien:{name:'SPACE ESHAY',hp:3,speed:80,w:34,h:66,shoot:{rate:2.0,speed:240},sprite:{sheet:'expansion',idle:5,walk:[5,5],attack:5},score:160,xp:9,drops:.3},
};
/* Bosses: fight sheet id → display */
const BOSSES={
 plague:{name:'THE PLAGUE DOCTOR',hp:130,speed:150,style:'zoner',victory:'Sterilised. Next.',taunt:'Breathe in.'},
 karl:{name:'CRAZY CARL',hp:100,speed:222,style:'brawler',victory:'You’re barred. Again.',taunt:'Hand it over!'},
 lucifer:{name:'LUCIFER',hp:95,speed:250,style:'brawler',victory:'Habibi. It’s a workshop.',taunt:'Shoes off, bro.'},
 riot:{name:'RIOT COMMAND',hp:120,speed:163,style:'turtle',victory:'Nothing to see here.',taunt:'Move along.'},
 alienking:{name:'BIG GAZZ',hp:115,speed:204,style:'air',victory:'Locals only, earth dickhead.',taunt:'Three eyes. All on you.'},
 walker:{name:'ISA INTERCEPTOR',hp:140,speed:144,style:'zoner',victory:'Permit denied.',taunt:'Halt.'},
 crowe:{name:'SPACE RUSSELL CROWE',hp:130,speed:207,style:'counter',victory:'Consider the matter supplied.',taunt:'Don’t switch it on.'},
 abbess:{name:'THE MONK LEADER',hp:135,speed:242,style:'mixup',victory:'Silence. Finally.',taunt:'Leave your weapons.'},
 robbie:{name:'ROBBIE WILLIAMS',hp:160,speed:233,style:'spectacle',victory:'One more song, you bastards.',taunt:'Let me entertain you.'},
 turbo:{name:'TURBO',hp:110,speed:255,style:'brawler',victory:'Last tram, mate.'},
 weasel:{name:'WEASEL',hp:95,speed:238,style:'zoner',victory:'Turn yourself off.'},
 borkmaster:{name:'BORKMASTER',hp:150,speed:173,style:'turtle',victory:'Structurally fucked.'},
 angus:{name:'WACKY ANGUS',hp:105,speed:228,style:'mixup',victory:'That went exactly how I didn’t plan it.'},
 fredo:{name:'FREDDO',hp:90,speed:283,style:'air',victory:'WOOF. (And stay out.)'},
 weed:{name:'THE GREEN BASTARD',hp:125,speed:166,style:'zoner',victory:'READ THE LABEL.'},
};

/* RPG: perks bought on tick at the bar */
const PERKS=[
 {id:'slab',name:'EMERGENCY SLAB',cost:150,desc:'+1 max health. Carbs are a stat. So is shame.',apply:p=>p.hpBonus+=1,max:4},
 {id:'tns',name:'KNOCK-OFF TNs',cost:200,desc:'+8% move speed. They were cheap because they fell off a truck.',apply:p=>p.speedBonus+=.08,max:3},
 {id:'cone',name:'BIGGER CONE PIECE',cost:180,desc:'Special recharges 20% faster. Brass. Stolen off a Hawthorn supporter.',apply:p=>p.specialBonus+=.2,max:3},
 {id:'bmx',name:'BMX TATTOO TOUCH-UP',cost:220,desc:'+1 blaster damage. The tattoo is load-bearing.',apply:p=>p.dmgBonus+=1,max:2},
 {id:'lucky',name:'LUCKY DURRY',cost:120,desc:'Better drops. Worse lungs. Shazza lit it for you.',apply:p=>p.luck+=.1,max:3},
 {id:'kevlar',name:'OP SHOP KEVLAR',cost:300,desc:'First hit each life does nothing. Smells like someone’s nan.',apply:p=>p.kevlar=true,max:1},
 {id:'bork',name:'BORK’S STANDING ORDER',cost:260,desc:'+25% max super meter in fights.',apply:p=>p.meterBonus+=.25,max:2},
 {id:'wifi',name:'MRS WEASEL’S WIFI PASSWORD',cost:90,desc:'Weasel hack / Turbo rush lasts longer. Password is “bongwater69”.',apply:p=>p.specialLen+=.25,max:2},
];
const BORK_SHOP=['What’ll it be. And before you ask: no, you can’t pay in exposure.','Your tab has its own postcode now.','I accept cash, cards, and lies I haven’t heard before.','That one’s not for sale. That one’s mine. That one’s also mine.','Buy something or get out. Actually, don’t get out, it’s raining and you’ll track it in.','The interest rate is “whatever I feel like when you walk in.”','Angus tried to pay with a fish once. The fish is still here. Say hello.','If Crowe asks, the VIP seat is a chair with a towel on it.','Shazza’s on tonight. Tip her or she’ll tell your missus what you ordered.','The billy behind the bar is for staff. Staff is me. And Shazza. And Freddo, somehow.','Trudy came in asking about you. Glowing eyes, staff, the lot. I said you were dead. Keep it that way, it’s working for you.','Gear’s under the counter, bongs are above it, and the magistrate is across the road. Plan accordingly.','A bloke paid his tab in frozen pies once. We still call that week The Famine.'];
const LEDGER_LINES={deed:['DEED BANKED','COMMUNITY WORK','ONE FOR THE BANK','CRIME CREDIT +1','TRUDY APPROVES'],crime:['CRIME DEBITED','THAT ONE’S COMING OUT','MAGISTRATE NOTED','BANK SENT A BLOKE','SHAZZA SAW THAT','MRS WEASEL WILL HEAR ABOUT THIS']};

/* Easter eggs & flavour */
const EGGS={
 bruges:{title:'GREETINGS FROM BRUGES',text:'Robbie is here. He is feeling something. It is not remorse. Wish you were here (he doesn’t).'},
 tram:'THE 109 TRAM PASSES. SOMEONE’S BONG IS ON IT.',
 konami:'ABSOLUTELY COOKED unlocked early + Crowe playable in Scrap Mode. You absolute degenerate.',
 smoko:'THE GREEN BASTARD clocks on in Scrap Mode. Shazza has left a billy on the bar. Don’t tell the magistrate.',
};

CHAPTERS.forEach((ch,i)=>ch.n=i+1);
/* scooter grand prix roster: stolen scooters only, scumbags only */
const RACERS=[{id:'courier',name:'NIGHT COURIER',col:'#88c8ea',quip:'Only one star? I was racing, mate.'},{id:'lucifer',name:'LUCIFER',col:'#de755f',quip:'Habibi, it’s a race.'},{id:'karl',name:'CRAZY CARL',col:'#df9665',quip:'Barred from the track too.'},{id:'borkmaster',name:'BORKMASTER',col:'#e47f59',quip:'Pub’s closed. For this.'},{id:'angus',name:'WACKY ANGUS',col:'#9bd36c',quip:'Took the bin lids off for weight.'},{id:'fredo',name:'FREDDO',col:'#c9a37a',quip:'WOOF.'},{id:'crowe',name:'SPACE RUSSELL CROWE',col:'#d8b25f',quip:'Are you not entertained.'},{id:'weed',name:'THE GREEN BASTARD',col:'#98ef87',quip:'Where am I.'},{id:'riot',name:'RIOT COMMAND',col:'#7fb0ff',quip:'Move along. Fast.'}];
