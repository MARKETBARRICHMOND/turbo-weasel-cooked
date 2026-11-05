# HANDOFF: Turbo & Weasel — Cooked Edition

This file is everything a new AI assistant (or developer) needs to keep building this game.
Read it top to bottom before touching any code. Written 5 Nov 2026.

---

## 1. Prompt to paste into the new AI

> You're taking over development of **Turbo & Weasel: Cooked Edition**, a browser game I own
> (characters, comic and world © Keean Alavi). The code is in the GitHub repo
> https://github.com/MARKETBARRICHMOND/turbo-weasel-cooked and it's live at
> https://marketbarrichmond.github.io/turbo-weasel-cooked/ . Read `HANDOFF.md` first, then
> `README.md` (release notes for every version). Follow the creative rules in HANDOFF.md section 4
> exactly: they're my standing instructions. It's an adult, NSFW, dark Aussie-humour game and that
> is intentional; don't soften it. Don't overwrite or delete the original 0.6.1 build. Before you
> change anything, tell me in a few lines what you understood and what you plan to do first.
> Every release: bump the version, add a section to README.md, list any creative extras you added
> so I can veto them, and push to `main` (that redeploys the site).

---

## 2. What the game is

A from-scratch rebuild of Keean's original *Turbo & Weasel: Arcade Mayhem 0.6.1* that plays like a
90s arcade game drawn as a comic book. It follows the ten-issue **Robbie Williams arc** of the comic
(Market Bar, Victoria St / Richmond, Melbourne → space → Robbie Williams' warship).

- **Story mode, 9 chapters** (`js/data.js`, `CHAPTERS`): Market Bar Mayhem · Lennox Street Repo ·
  First Thing You Remember · Let's Break the Game · Welcome to the Real Shithole · One Address. One
  Opening. · Grand Opening, Outstanding Balance · Blood Moon, Last Drinks · Rock DJ Reckoning
  (+ a "Greetings from Bruges" egg).
- **Run-and-gun platformer levels** (Metal Slug pacing, Pitfall pits, Aladdin-style wall kicks for Weasel).
- **Street Fighter-style boss duels** on 16-pose fight sheets: Crazy Carl, Lucifer, Riot Command,
  Space Russell Crowe, the Abbess/Monk Leader, the Alien King, Robbie Williams (Rock DJ phase two).
- **Special bosses** (`js/boss.js`): **The Plague Doctor** (flamethrower, torches his own jeep) and
  **Trixy** (TR-3B black triangle craft that drains the boys' life force).
- **Cutscenes** built from the real hi-res comic pages with panel-by-panel camera moves.
- **Bonus rounds** (`js/bonus.js`): Pull a Cone, Bork's Lucky Eshay (pokies), Slab Run.
- **Light RPG layer** (`js/rpg.js`): XP/levels, WALLET (cash) vs TAB (credit at Borkmaster's bar), perks.
- **Scooter GP** (`js/race.js`): Cruis'n USA-style pseudo-3D racer. North Richmond GP and Moon Base
  Kart Cup; Lucifer's Chop Shop sells stolen parts; gear bags = speed boost.
- **Scrap Mode** (versus fights), **Gallery** (covers + hidden comic pages found in levels),
  **4 difficulties**: Piss Weak, Bit of a Mission, Pretty Cooked, Absolutely Cooked.
- Easter eggs: Konami code, type SMOKO / BRUGES / BORK on the title, the 109 tram.

Controls are in README.md.

---

## 3. Where everything lives

| What | Where |
|---|---|
| **Source of truth (code)** | GitHub repo `MARKETBARRICHMOND/turbo-weasel-cooked`, branch `main` (public) |
| **Live game (best for phones)** | https://marketbarrichmond.github.io/turbo-weasel-cooked/ — on iPhone: Safari → Share → Add to Home Screen for real fullscreen |
| Claude share link (same game, older host) | https://claude.ai/artifact/XvTpnHvcarFwB2pmZyeBJV — fullscreen is blocked inside this page; it only exists inside Claude |
| Mac backup copy | `~/Library/Mobile Documents/com~apple~CloudDocs/Documents/ChatGPT/TURBO AND WEASEL/TURBO_AND_WEASEL_MASTER/10_ENHANCED_EDITIONS/GAME_Turbo-Weasel-Cooked-Edition/` (iCloud, on the kza.work Mac) |
| Custom fonts (source + builder) | Mac: `.../10_ENHANCED_EDITIONS/FONTS_Turbo-Weasel/`; built fonts in repo `assets/fonts/` |
| **Story bible / canon** | Mac: `.../TURBO_AND_WEASEL_MASTER/01_CANON_AND_STORY_BIBLE/*.md`, `02_COMIC_SCRIPTS/Robbie_Williams_Arc`, `04_VISUAL_DEVELOPMENT/VISUAL_STYLE_BIBLE.md` (Keean can upload these to you) |
| Original game 0.6.1 (Build 20261020) | Keean's Claude project files: `Turbo-Weasel-Arcade-Mayhem-0.6.1-Build-20261020/` (web game in an Xcode wrapper + source zip). **Never overwrite it.** The Cooked Edition sits beside it. |

**Current version: v1.6.4** (4 Nov 2026) = game content from v1.6.3 (27 Oct) + GitHub Pages hosting
and the phone zoom fix. Full history is in README.md.

---

## 4. Creative direction and standing rules (from Keean — follow these)

**Tone**
- Very NSFW, 18+. Dark humour and Aussie humour pushed to the max. Heavy swearing is in-voice.
  Bong and "gear" (drug) references cranked up; sheilas; lots of Easter eggs and nods to the comic.
- **Never soften the plot.** Canon cast, places and plot stay as in the ten-issue comic (spellings:
  Freddo, Carl). No create-your-own-character. New *filler* characters (e.g. aliens) are allowed.
- Gear lore: "gear" is a clip-seal bag of white/clear crystals; in space it glows bright green.
  Space gear is currency, a recreational smoke, the best spaceship fuel and the deadliest ammo.
- Lucifer: tiny Arab guy, black wife-beater and jeans. The boys owe their gear dealer across the
  road and Turbo's bike had to be sold. 106 Lennox St, top flat.
- Space racing: ragtag Jar Jar Binks / Mad Max go-karts.

**Look and feel**
- 90s arcade / 16-bit console feel (Metal Slug, Aladdin, Pitfall, a bit of Street Fighter), OR a
  modern "playing a comic book / cartoon" look if it's done well. Visuals are a top priority.
- Cutscenes must never look glitchy. Keean hates anything "lame".
- Bonus / mini games: simple and fun.
- Difficulty: easy and enjoyable on low modes, genuinely brutal on hard.
- Built for phones in landscape first.

**FONT RULE (standing)**
- Default text (dialogue, menus, HUD, cutscenes) = a modern printed-comic face sized for phones:
  **Boogaloo** for dialogue/menus, **Bangers** for HUD numbers. Never Comic Sans.
- Keean's graffiti font **Turbo Weasel Tag** is for *impact only*: title logo, chapter titles, Scrap
  Mode screens, fight callouts, WHAM/BOOM words. Overuse loses impact. The handwriting font
  (Turbo Weasel Hand) is retired from general use.

**CREATIVE LICENCE (standing)**
- You may add or tweak anything that serves a legible comic-book, 90s-arcade phone game, within canon
  and the humour. **Every extra must be called out in the README release notes so Keean can veto it.**

**Working with Keean**
- He writes in a casual, voice-note style and gives broad licence.
- He likes his brief rewritten and shown back for approval before big work starts
  ("optimise my prompt, then I approve").
- **Music:** Keean supplies his own original tracks. Four are in `music/`. Ask him when he's ready to
  drop more; don't generate or source music yourself.
- **Sound samples:** parked by Keean (27 Oct). The `sfx/` hook exists; don't work on it unless asked.

---

## 5. Tech stack and file layout

Plain HTML5 canvas + vanilla JavaScript. **No build step, no framework, no npm.** Open `index.html`
and it runs. Logical resolution 960×540, rendered at device pixel ratio. Google Fonts (Bangers,
Boogaloo, Patrick Hand, Barlow Condensed) + two custom OTFs.

```
index.html              page shell: canvas, touch stick/buttons, rotate overlay, script tags
css/style.css           layout, touch controls, overlays
js/  (loaded in this order — order matters, they share globals)
  atlas.js              sprite atlas coordinates (generated data)
  pages.js              comic page index (generated data)
  engine.js             core: G (game state), loop, Input (keys/touch/gamepad), Audio + music
                        playlist, save/load, text()/fonts, transitions, pause menu, fullscreen help,
                        SHARE_URL, phone HUD insets
  data.js               ALL content: CHAPTERS, dialogue, bosses, perks, DIFF / DIFF_ORDER.
                        Edit this to change story, lines, stats.
  comic.js              cutscene player on comic pages
  platformer.js         run-and-gun levels (procedural layout + reachability pass)
  fight.js              Street Fighter-style duel engine (+ Scrap Mode)
  boss.js               Plague Doctor and Trixy
  race.js               Scooter GP (RaceSelect, RaceScene, ChopShopScene)
  bonus.js              bonus rounds
  rpg.js                ResultsScene (ledger, XP), ShopScene (Bork's bar)
  main.js               scenes: Load, Title, Char, Diff, ChapterSelect, Gallery, Settings,
                        GameOver, FightLoss, End, ScrapSelect; boot
assets/pages/           hi-res comic pages (cutscenes)
assets/comic/           low-res fallbacks + covers
assets/sprites/         original sprite sheets as WebP (heroes, enemies, environments, 16-pose fight sheets)
assets/fonts/           TurboWeaselTag.otf (graffiti), TurboWeaselHand.otf
music/                  Keean's tracks + playlist.json (maps tracks to moods)
sfx/manifest.json       optional sample mapping (parked)
manifest.webmanifest, icon-180.png, icon-512.png, .nojekyll   home-screen / Pages support
.github/workflows/pages.yml   deploys to GitHub Pages
```

**Engine conventions (learned the hard way)**
- `setScene()` only queues `G.next`; use `transitionTo(scene,'wipe')` to change scenes.
- Every scene needs an `if(S.done)return` guard so its `onDone` fires once.
- Scenes with `menu:true` get canvas `click` but not `confirm`; use `Input.hot(x,y,w,h)` for tappable rows.
- Phone: `G.hudR / G.hudB / G.hudL` = canvas pixels covered by DOM buttons; HUDs must lean away.
  The `#tback` BACK button shows only on menu scenes. Scenes define `autoPause()` for tab/app switches.
- In the platformer update, never shadow the level-length variable `L`.
- Saves: `localStorage` keys `tw_cooked_save_v1` and `tw_cooked_settings`. A bad save is repaired at boot.
  Keep new fields backward-compatible.
- Music: `music/playlist.json` → `{"tracks":[{"file":"music/x.mp3","title":"...","mood":"menu, fight"}]}`.
  Moods: menu, street, glitch, space, moon, isa, ship, boss, fight, bonus, shop, win, lose, credits.
  Players can also use DROP MUSIC on the title screen.

---

## 6. Run, test, deploy

- **Run locally:** open `index.html` in Chrome/Safari, or `python3 -m http.server` in the repo and
  visit `http://localhost:8000` (needed for `music/playlist.json` to load in some browsers).
- **Test:** there's no test suite in the repo. Previous work used Playwright headless Chromium,
  driving scenes with `G.scene.update(1/60)` and `Input.down/pressed`, plus phone viewports
  844×390 and 667×375. Always check phone landscape.
- **Deploy:** push to `main`. The GitHub Action (`pages.yml`: configure-pages → upload-pages-artifact
  → deploy-pages) republishes the live site in about a minute. It can also be run by hand from the
  repo's Actions tab ("Deploy to GitHub Pages" → Run workflow). Pages source is already set to
  GitHub Actions.
- **Release checklist:** bump version, add a `## vX.Y.Z (date)` section to README.md listing fixes
  and any creative extras, push to `main`, check the live URL on a phone, then (optionally) copy the
  changed files to the Mac backup folder.

---

## 7. Open loose ends

- **Mac backup is behind:** the Mac folder is missing the v1.6.4 files (`index.html`,
  `css/style.css`, `js/engine.js`, `manifest.webmanifest`, `icon-180.png`, `icon-512.png`).
  The GitHub repo is complete and is the real copy; the Mac folder is only a backup.
- **Sound samples:** parked by Keean. Don't start without him asking.
- **More music:** waiting on Keean's tracks.
- **Old saves:** saves from the very first build (v1.1, eight chapters) aren't shifted to the
  nine-chapter layout; Chapter Select fixes it.
- The claude.ai share link is a copy hosted inside Claude. A different AI can't update it; just use
  the GitHub Pages URL from now on.

---

Original comic, characters and world © Keean Alavi.
