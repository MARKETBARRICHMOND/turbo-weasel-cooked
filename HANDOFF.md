# Turbo & Weasel — local Codex handoff

Owner: Keean Alavi. Repository: MARKETBARRICHMOND/turbo-weasel-cooked. The release branch is main. Start here, then read README.md for controls and version history.

## Current work

Keean approved v1.7.0 on 7 November 2026. The approved scope covers both Scooter GP tracks, visual variety, the nine-chapter adaptation of the ten-issue Robbie Williams arc, distinctive hero and boss art, and dedicated comic panels for game-only encounters. Implementation and the creative extras are documented under v1.7.0 in README.md. The original 0.6.1 Build 20261020 lives separately in Keean’s Claude project. Never overwrite or delete it.

The v1.7.0 chapter table in README.md maps the adaptation. Game art was checked against the comic pages shipped here, the supplied handoff and recovered enhanced-edition dialogue drafts and visual inventory. The final Mac story bible was unavailable in the development environment. Compare any future plot change against the owner’s canon folder. The bike is sold to cover the gear debt. The game interlude explains Lucifer withholding payment over three parts, settling with the dealer and supplying a stolen Ninebot.

## Creative rules

- Adult, NSFW, dark Australian humour. Keep the Richmond grit, swearing, bong and gear references. Preserve the canon cast, places, plot and names (Freddo, Carl). New filler characters are welcome when they serve the comic. No custom player characters.
- Gear comes in clip-seal bags of white/clear crystals. Space gear glows green and functions as currency, recreational smoke, spaceship fuel and ammunition.
- Lucifer is a tiny Arab bloke in a black singlet and jeans. The dealer lives across the road. Lucifer’s workshop is the top flat at 106 Lennox Street. Space racing uses ragtag, improvised karts.
- Design for phones in landscape. Aim for sharp 90s arcade action or the feel of playing the comic. Bonus rounds should be simple. Easy modes should be accessible and hard modes brutal.
- Use Boogaloo for speech and menus, Bangers for HUD numbers, and Turbo Weasel Tag for impact lettering: logos, chapter titles, Scrap Mode and fight calls. Keep the retired handwriting face out of ordinary text.
- Illustrate new story material with matching comic panels. Keep the principal characters recognisable and avoid reusing another boss’s skin.
- Keean supplies the music. Sound samples are parked. Show the brief before major new work. For each release bump the version, list fixes and every creative extra in README.md for veto, push main and check Pages.

## Local development

Plain HTML5 canvas and vanilla JavaScript; the scripts share globals. No dependency installation or build step for the game. Run from this directory:

    python3 -m http.server 8000 --bind 127.0.0.1

Open http://127.0.0.1:8000. The live site is https://marketbarrichmond.github.io/turbo-weasel-cooked/. Pushing main triggers the existing GitHub Pages action.

The script ordering is defined in index.html. js/data.js owns story beats, js/comic.js handles camera framing, js/course-art.js defines landmark and rider mappings, js/race.js runs Scooter GP, js/fight.js handles duels, js/boss.js handles Trixy, and js/platformer.js handles the levels. Generated WebP assets ship in assets/pages and assets/sprites. Frame bounds and foot anchors are in js/atlas.js. js/pages.js registers cutscene image IDs.

Use transitionTo for scene changes with a wipe/page turn. Guard completion callbacks so they fire once. Menu rows need Input.hot for touch. Respect G.hudR, G.hudL and G.hudB around the DOM controls. Do not shadow platformer length L. Maintain compatibility with tw_cooked_save_v1 and tw_cooked_settings.

## Continue on the owner’s Mac

Use a fresh checkout in a development folder and open that folder as a local Codex project. The iCloud backup of older builds is separate. Comic references on the Mac are under Documents/ChatGPT/TURBO AND WEASEL/TURBO_AND_WEASEL_MASTER, particularly 01_CANON_AND_STORY_BIBLE, 02_COMIC_SCRIPTS/Robbie_Williams_Arc and 04_VISUAL_DEVELOPMENT/VISUAL_STYLE_BIBLE.md.

The first local QA task is a physical iPhone Safari landscape playtest: clear Lennox, verify its comic-to-GP transition, race both courses with touch controls, check cornering legibility and HUD coverage, and inspect the Plague Doctor, Trixy and Rock DJ scenes. Headless Chromium checks at 844×390 and 667×375 exercised the two races through payouts, scene rendering, image loading and save persistence. A full unaided campaign playthrough and physical iPhone testing remain open. Keep any owner changes made after this handoff.
