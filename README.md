# TURBO & WEASEL: COOKED EDITION

A from-scratch rebuild of *Turbo & Weasel: Arcade Mayhem* that plays like a comic book.
Built alongside the original 0.6.1 build, never over it. Same cast, same art, same ten-issue
Robbie Williams arc. Everything else is new.

## Play it
Open `index.html` in any modern browser (Chrome, Safari, Firefox, Edge). No server, no install.
Works on a phone or iPad too (touch stick + buttons appear automatically). Gamepads work.

## Controls
| Action | Keys | Pad |
|---|---|---|
| Move / aim up / crouch | Arrows or WASD | Stick / D-pad |
| Jump (Weasel: double jump, wall kick) | Space / Z / L | A |
| Attack / shoot | J / X | X |
| Special (Bull Rush / System Hack) | K / C | B or Y |
| Confirm / next panel | Enter, or tap/click | A |
| Pause | Esc / P | Start |
| Skip a cutscene | Hold Special | Hold B |
| Mute music | M | |

**Boss fights (Street Fighter rules):** J jab · forward+J hook · down+J sweep · up+J uppercut ·
J in the air for a flying kick · J+K up close to throw · hold back to block (hold down+back for lows) ·
K special (costs 25 meter) · up+K SUPER with a full meter.

## v1.1 — zoomed, sharpened, cooked harder
- Camera zoomed in 1.6× in levels and a Street Fighter style dynamic zoom in fights. Renders at full Retina.
- New look: sky and light per world, colour grade, drop shadows, Richmond road and kerb, deck plating, foreground bins and bollards.
- **The Plague Doctor** (chapter 3): flamethrower zoner at the servo. Torches his own jeep in the intro. Shoot the beak.
- **Trixy** (chapter 5): a TR-3B black triangle that drains life force. Stand still to shoot up, stay out of the pink beam, hit the core when it opens.
- Riot Command now kicks the door in at the end of chapter 2.
- Mrs Weasel, Shazza (Market Bar) and Trudy in the banter and the shop. Glass billy pickup (+2 health, full special).
- Type **SMOKO** on the title screen for a new Scrap Mode fighter.
- Your music is in: `music/playlist.json` maps the tracks to moods (menu, street, fight, boss, bonus, shop, win, lose).
  Drop more tracks in `music/` and add a line to the playlist, or use DROP MUSIC on the title screen.

## What's in it
- **8 chapters** following the comic: Market Bar → the memory glitch → breaking the game → Dock 69 →
  the ISA portal → the Space Market Bar opening → the Blood Moon of Kraggar VII → Robbie's warship.
- **Cutscenes on the real comic pages** (hi-res), panel-by-panel camera moves, hand-lettered dialogue
  lifted from the approved issues plus new connective lines.
- **Run-and-gun levels** (Metal Slug pacing, Pitfall pits and hazards, Aladdin-style wall kicks for Weasel).
- **Boss duels** on the 16-pose fight sheets: Crazy Carl, Riot Command, Big Gazz, the ISA Interceptor,
  a "friendly" with Space Russell Crowe, the Monk Leader, and Robbie Williams with a Rock DJ phase two.
- **Bonus rounds** that take a minute: Pull a Cone (timing), Bork's Lucky Eshay (pokies), Slab Run (mash).
- **RPG layer:** XP and levels, the crime-credit ledger, and Borkmaster's bar where perks go on tick.
- **Four difficulties:** Piss Weak, Bit of a Mission, Pretty Cooked, Absolutely Cooked (unlocks after the story).
- **Scrap Mode:** any unlocked fighter vs any other. Bosses unlock as you beat them.
- **Gallery** of the ten issue covers.
- Easter eggs: the Konami code on the title, type BRUGES or BORK on the title, watch for the 109 tram.

## Your music
Two ways to put your own tracks in:
1. **In-game:** title menu → DROP MUSIC → pick any audio files. They play straight away.
2. **Permanent:** drop files into the `music/` folder and list them in `music/playlist.json`:
   ```json
   {"tracks":[
     {"file":"my-song.mp3","title":"My Song"},
     {"file":"boss.mp3","title":"Boss Track","mood":"boss"}
   ]}
   ```
   `mood` is optional. If set, that track loops in that part of the game. Moods: menu, street, glitch,
   space, moon, boss, fight, bonus, win, lose. Tracks without a mood rotate everywhere.
Until then the game plays its own chip-tune.

## Files
- `index.html`, `css/`, `js/` — the game. Plain scripts, no build step.
- `assets/pages/` — hi-res comic pages used in cutscenes. `assets/comic/` — low-res fallbacks.
- `assets/sprites/` — the original sprite sheets, converted to WebP.
- `js/data.js` — every chapter, line of dialogue, perk and boss stat. Edit this to change the story.

Original comic, characters and world © Keean Alavi.


## v1.1.1 (27 Oct 2026) — phone pass
- Touch devices get a 'turn ya phone sideways' overlay in portrait (tap to play small anyway).
- First tap goes fullscreen and tries to lock landscape (Android; iOS Safari just hides the URL bar when you rotate).
- Touch stick and buttons respect notch safe areas; bigger in portrait.
- Share link: anyone with the artifact URL can play, no login.

## Sound samples (sfx/)
Put your own samples in `sfx/` and map them in `sfx/manifest.json` under `"sounds"`, e.g.
`"punch": ["punch1.wav","punch2.wav"], "cone": "bong-rip.mp3"`. One file or a list (random pick). Names: jump, shoot, heavy, hit, punch, block, hurt, die, pickup, cash, explode, ko, menu, select, bark, level, round, special, page, type, tick, win, lose, glitch, cone, coin. Anything unmapped keeps the chip sound.

## v1.2 (27 Oct 2026) — round 3
- Title menu fixed: click/tap an option to pick it (no more falling into Scrap Mode). Hover highlights. Every menu is clickable.
- Fullscreen button (⛶) bottom-left; on a phone it pops the game into its own tab if the page blocks fullscreen.
- New title screen: comic covers drifting behind the logo, the boys poster-posed.
- Special meter is now a bird's-eye bong: the lighter slides to the cone as it fills, flame when it's ready.
- WALLET panel with +$ pops; XP and level shown under it. Comic pages hide in every level (up high) — Gallery → PAGES FOUND tab.
- Chapter 2 "LENNOX STREET REPO": Turbo's bike is on Lucifer's balcony at 106 Lennox St. Collect the bike parts, brawl Lucifer in his flat (he shanks, his goons lob longnecks from the windows), win a stolen Ninebot.
- SCOOTER GP on the title: North Richmond Scooter GP (stolen scooters only) and Moon Base Kart Cup (unlocks when the story reaches space). Items: cone boost, slab throw, bong smoke, battery. Lucifer's Chop Shop sells stolen parts (speed/accel/grip) and a HP fix.
- `sfx/` folder for Keean's own samples (see above).

## v1.3 (27 Oct 2026) — Keean's lettering
- `assets/fonts/TurboWeaselTag.otf` (graffiti) is now the title/heading font and `TurboWeaselHand.otf` the speech/hand font, both traced from Keean's paint-marker sheets. Small UI text and pure numbers stay on Bangers for readability.

## v1.4 (27 Oct 2026)
- Fonts rebuilt for legibility: the graffiti "Turbo Weasel Tag" now uses the cleanest version of each letter from Keean's sheets, smoothed outlines, tighter spacing. "Turbo Weasel Hand" smoothed too. Small HUD text stays in Bangers.
- Fullscreen: when the game runs inside Claude's share page the browser blocks fullscreen, so the ⛶ button now shows the direct link with COPY LINK / OPEN IN BROWSER. Open that link in Safari/Chrome (or Add to Home Screen) and fullscreen works.
- Scooter GP: clip-seal bags of gear on the track = super speed. White crystals in North Richmond, glowing green space gear on the Moon (currency, fuel, ammo, and the boys smoke it).

## v1.5 (27 Oct 2026)
- Lettering system: Boogaloo (modern printed-comic lettering) for dialogue, menus and mid-size UI; Bangers for HUD numbers; Keean's graffiti "Turbo Weasel Tag" for impact only (logo, chapter titles, Scrap Mode, fight callouts, comic words).
- Lennox Street Repo soft-lock fixed: the camera only scrolled forward, so a missed bike part was unreachable. You can now walk back anywhere in a level; required parts always sit on solid ground; an arrow points back to a missed part; the gate says GO BACK.
- Title screen rebuilt as a comic cover: issue box, masthead, cover line, INSERT COIN, menu on a paper panel.
- Pickup flash + shake on required collectibles. Standalone web-app meta tags for Add to Home Screen (works once hosted outside Claude's page).
- Fullscreen on iPhone/Safari: blocked by the Claude share-page frame, not the game. Needs its own hosting (GitHub Pages) for a real fix.

## v1.6 (27 Oct 2026)
- Levels: real jumps (about two and a half heroes high), stair-stepped platforms and a reachability pass so every platform can be reached by Turbo on every difficulty. Pits never wider than a jump. Required pickups always sit on solid ground.
- Scrap Mode: camera sits ~20% closer and tracks the gap between fighters (tight when you're in their face, wider as you back off), heads stay in frame on jumps.
- Cash explained: a one-time HOW CASH WORKS card on your first pickup, wallet/tab notes on the results screen, a "how the slate works" note at Bork's bar, cash-only warning at Lucifer's.
- Scooter GP rebuilt on a Cruis'n USA model: low camera, high horizon, long fogged draw distance, big roadside shopfronts cut from the game's own Richmond and moon panoramas, skyline that pans through bends, horizon that pitches over hills. Physics: hold gas (J/Space/ATTACK), brake (down), bends throw you out with the square of your speed, power slides with tyre smoke, off-road crashes into scenery, one-hit bumps with traffic, AI that brakes for hairpins and rubber-bands. Lap timer and best lap. Items now on K/SPECIAL.
- Graffiti titles draw their digits in Bangers (a tagged "1" read as a "2").

## v1.6.1 (27 Oct 2026)
Bug sweep, round one (level geometry). Every item below was reproduced in a 324-level generation sweep, fixed, and re-tested.
- Checkpoint flags are never planted over an open drain any more. Before, a flag standing over a pit meant every respawn fell straight back in until game over.
- Respawns land on solid ground, and the enemies shoved aside on respawn are moved to solid ground too (no thugs twitching in mid-air over a drain).
- Drains actually kill now. The kerb walls are solid below street level, so you can't sink through a pit and pop up alive on the far side. A running jump still clears every drain in the game (81/81 tested).
- Loose items (cash, slabs, cones, gear, deeds) are never generated floating over a drain.
- DOWN + JUMP drops you through an awning, as the pause screen always claimed.
- Coyote time: you get a tenth of a second after walking off a ledge to still jump.
- Wall cling and wall kick are Weasel's moves only, as advertised. Turbo no longer gets dragged down a platform's side into the drain beneath it.
- Race HUD: the place badge and finish line read in the comic face, shout words no longer stack on top of each other, and name tags of close racers are staggered.
- Round two (level flow): keg crates get a 3-second cooldown and never spawn a keg on top of you, and no crate is placed where its keg would roll out over a drain.
- Lives mean lives now: BIT OF A MISSION gives three goes, ABSOLUTELY COOKED gives one, and the counter never reads × 0 while you're still standing.
- The COOKED game-over line is picked once instead of flickering between four lines every frame.
- The name plate grows with your health bar, so the lives counter no longer hides behind the eleventh pip on PISS WEAK.
- HOW CASH WORKS card moved to the bottom of the screen, slightly see-through, closes after 6 seconds, and now tells the truth: the chapter's haul is only lost when you lose all your lives.
- "MISSED A MEMORIE" is now "MISSED A MEMORY" (same for BIKE PART and PORTAL ANCHOR).
- Losing to Trixy no longer shows "undefined" and a blank portrait: the craft is drawn and she says "Commencing withdrawal."

## v1.6.2 (27 Oct 2026)
Bug sweep, round three: Scrap Mode, Trixy, bonus rounds, cutscenes, Scooter GP, the bar, menus and saves. Every item reproduced, fixed and re-tested.

Scrap Mode
- Chip damage through a block (and damage through super armour) now knocks a fighter out at zero. Turtling bosses can no longer stand there with an empty bar.
- The round is frozen the instant a K.O. lands: a stray bottle or bolt can't re-K.O. the winner and hand the round to the loser.
- Camera no longer drops the floor off the bottom of the screen when you jump close to the opponent.
- YOU WIN / YOU LOSE banner moved so it no longer sits on top of the winner's quote bubble.
- Timer running out now reads TIME instead of TIME scrawled over K.O.
- Pause menu has tappable KEEP GOING / QUIT buttons, so phones can leave a fight.
- Lucifer's SHANK / STAB / OI pops over his head instead of drifting away from him.

Trixy
- Pause (ESC, P or the II button) now pauses with a menu instead of silently quitting the whole chapter.
- The slam is never picked while the craft is directly over you, and it telegraphs for longer with flashing lights before it drops.
- Hero jump matches the platformer (about 155px) instead of a 50px hop.
- SYSTEM HACK now kills the drain beam instead of leaving a harmless pink cone following you around.
- The beam can't leave you alive at zero health; Nan's kevlar and invulnerability frames block the drain tick properly.

Bonus rounds
- Slab Run retuned: 4 to 9 taps a second gets the slab across, faster drops it, slower gets you trammed. It was an eight-to-nine-taps-only window before.
- MASH ATTACK label is readable from the first frame.
- BACKSPACE TO BAIL works on the intro card as advertised.

Cutscenes
- Same-page beats pan from where the camera actually is instead of snapping to a stale panel first.
- A skipped cutscene stops taking input, so taps during the wipe no longer turn pages or fire sound effects into the next scene.

Scooter GP
- Standings count the grid head-start, so the HUD place and the place you're paid for finally agree. No more "4TH" on screen and "7TH PLACE" at the line.
- Chop Shop parts (speed, pickup, grip) only make YOUR scooter faster. They were being handed to the whole field.
- HUD shows your grid slot (7TH) during the countdown instead of 0TH.
- Your own slab can't spin you out, and a gear bag can't be grabbed mid-spin.
- The FIX price can't go NaN on an older profile.

The bar, menus and saves
- Tapping or clicking in Bork's bar selects a row, then buys it on a second tap. One tap no longer buys whatever was highlighted, double-buys, or puts a perk on the tab when you meant to leave.
- The DROP MUSIC click zone only works on the title screen, so taps mid-game can't pop a file picker.
- DROP MUSIC also works from the keyboard and gamepad.
- NEW GAME keeps your found comic pages, your scooter and its parts.
- Chapter Select fits all nine chapters (five across).
- Replaying an earlier chapter no longer moves your CONTINUE point backwards.
- CONTINUE label counts to chapter 9.
- Gallery: closing a page no longer instantly opens the page under your finger.
- Scrap Mode unlocks are listed on the chapter results ledger.
- A damaged or old-shaped save is repaired at boot instead of crashing the title screen.

Not changed: saves written by the very first build (v1.1, eight chapters) can't be told apart from newer ones, so they aren't shifted. If a CONTINUE lands on the wrong chapter, use Chapter Select once.

## v1.6.3 (27 Oct 2026)
Final sweep: engine, input, phone. All fixes, no new creative-licence extras this round.
- Phone: "NAH, PLAY SMALL" on the fullscreen help overlay now actually closes it (it was stuck on screen).
- Phone: a BACK button appears on menu screens (Chapter Select, Gallery, Scrap Mode, Scooter GP, Settings, the shops) so you can leave them without a keyboard. It hides during play so it can't bail you out of a mini-game by accident.
- Gamepad: Select/Back (button 8) is BACK everywhere; B is BACK on menus and still SPECIAL in play.
- Phone HUDs lean away from the on-screen buttons: score, wallet, XP, race item box, P2 health bar, bonus cash and the race speedo (now bottom-left, above the stick) are no longer hidden under the pause/fullscreen/attack buttons on 16:9 phones. The fullscreen button sits beside pause instead of under it.
- Title screen and Chapter Select on phones: menu rows and chapter cards no longer sit under JUMP/ATTACK; the gaps between buttons pass taps through to the game.
- Tab or app switch: the game pauses itself (platformer, Scrap Mode, Trixy, races) and parks the music, then brings it back when you return. Audio also wakes up after a lock screen, a call or the silent switch.
- Music cued before the first tap now starts on that tap (it used to stay silent until the next scene).
- Desktop: the fullscreen button works on mouse/keyboard devices too (its handler was only wired on touch).
- No fullscreen API (iPhone Safari outside the frame): a short on-screen tip instead of opening a duplicate tab.
- 30Hz screens / low-power mode no longer trigger the blurry 1x fallback; it only drops resolution when frames are ragged or the draw itself is heavy.

## v1.6.4 (4 Nov 2026)
Hosted copy + phone zoom fix.
- The game now also lives at https://marketbarrichmond.github.io/turbo-weasel-cooked/ (GitHub Pages, deployed from the `turbo-weasel-cooked` repo by Actions). Safari → Share → Add to Home Screen runs it fullscreen; a web manifest and home-screen icon were added for that. The claude.ai link's fullscreen help now points there.
- Phones: double-tap no longer zooms the page and a pinch can't zoom in (iPhone Safari ignores the viewport flags, so it's done in script too). If the page still ends up zoomed, a pinch-out is let through and a hint says so.

## v1.7.0 (7 Nov 2026)

Scooter GP now has rear-view rider art for both heroes and every opponent. The Moon Cup uses eight different kart bodies. Each course has six ordered sectors with illustrated landmarks, and the sector name follows your position. In Richmond the local night courier takes the seventh grid slot so Crowe first appears in the space storyline. The race menu previews the actual grids and the workshop. A finish-line quip stays on screen long enough to read.

**Comic continuity and creative extras for veto**

| Chapter | Comic connection and game material |
|---|---|
| Market Bar Mayhem | Issue 1 establishes the robbery, Carl and Bork’s damage bill. The approach passes the grocer, tram and market frontage. |
| Lennox Street Repo | Game interlude. Turbo sells his bike to cover the dealer debt. Lucifer holds the payment over three parts, then settles with the dealer and hands over a stolen Ninebot. Four illustrated beats cover the sale, parts, scooter and Sunday GP. |
| First Thing You Remember | Issues 2–4. Turbo remembers the old car radio. The street interviews lead to Robbie’s claim about the simulation. Two new panels depict the noise-complaint raid and its aftermath. |
| Let’s Break the Game | Issue 5. The burnt awning motivates the cash run. Two new servo panels show Plague Doctor and his burning Jeep before the police van and Robbie’s intervention. |
| Welcome to the Real Shithole | Issue 6. Crowe helps the boys reach the dock. Big Gazz gets two illustrated beats at the hatch. Robbie fronts the consignment on tick. |
| One Address. One Opening. | Issue 7. The boys come back for Bork, who insists on bringing Angus and Freddo. Trixy’s interception gets two separate panels of the craft and its drain beam. |
| Grand Opening, Outstanding Balance | Issue 8. The delivery pays Robbie’s original gear account. Crowe’s permanent seat is a separate deal. Two new pub panels cover the friendly spar and the furniture bill gag. |
| Blood Moon, Last Drinks | Issue 9. The ISA pursues the crew despite the settled account. The temple approach gains lunar industrial scenery and basalt gates. |
| Rock DJ Reckoning | Issue 10. The crew needs the bridge release to reach the pods. Robbie transforms into a crimson, mechanical-armed second form during the fight. His fate after the escape stays open. |

Additional artwork includes the Moon starting-grid panel, twelve roadside landmarks, eight scenery sprites including spectator groups, gum trees, bins and lunar telemetry, the sixteen mounted rider/vehicle combinations, separate eight-pose sheets for Lucifer and Plague Doctor mapped to the existing fight moves, and a sixteen-pose Rock DJ sheet. Turbo and Weasel have distinct scooter and kart stances that lean through turns. Chapter backgrounds use illustrated landmarks at fixed positions. The comic camera starts each new page from that page’s own framing.

The new panels use the supplied handoff and existing comic art as references. The recovered dialogue and visual inventory were used as adaptation references.
