# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Laisse-moi tranquille" — a French-language, offline 3D fighting-game/narrative prototype (3 fights, cutscenes, synthesized SFX, system TTS voices). Not a git repository, no build system, no package manager, no tests, no linter.

The whole game is a single file, `index.html` (~1160 lines: CSS, HTML screens, one big inline `<script>`), plus static JSON/texture assets in `assets/`. All UI text and narrative copy is in French; keep it that way.

## Running

Serve the directory over HTTP (assets are loaded with `fetch`/loaders, so `file://` will fail):

```
python3 -m http.server 8000   # then open http://localhost:8000/
```

Three.js r128, GLTFLoader and SkeletonUtils are loaded from CDNs (cdnjs / jsDelivr), and Google Fonts too — so first load needs network. Keep Three.js pinned at r128 (globals-style `THREE.*`, `examples/js` loaders; no ES modules).

Debug hook: `window.__lmt` (end of the script) exposes `ai`, `M` (MOVES), `g` (grapple), `step(n, dt)` to advance the simulation headlessly, and `key(code, down)` to inject key events — use it for scripted checks in a browser/headless driver.

## Architecture (inside index.html's script)

Sections are marked with `/* ---------- Name ---------- */` comments; search for them to navigate.

- **Data tables** (top): `FIGHTS` (per-fight arena, opponent key, AI params, loss text), `LOOKS` (character model/texture variants), `POSES`, `MOVES` (attack timing/hit data per move), `COMBOS` (input sequences like `J J J K` → named combo; mirrored in the pause-screen controls table in the HTML), `LABEL`.
- **Arenas**: `buildArena(kind)` dispatches to `buildStreet/Courtyard/Court`; geometry is procedural (boxes, canvas-generated facade textures via `facadeMat`/`canvasTex`) plus Kenney building GLTFs cloned via `kenneyClone`. `disposeGroup` skips objects flagged `userData.shared`.
- **Characters**: Mixamo rigs (`ch08`, `ch31`) stored as glTF-in-JSON under `assets/chars/`. Animations in `assets/anims/*.json` are custom-serialized clips (`{name,duration,tracks}`) registered through the `ANIM` table (with `from/to/hit` windows in seconds) and `CLIP_LIB`. `Fighter` is the central class: kinematic control, combat state machine, plus a procedural layer on top of the clips (spring-driven `Spr`/`Spr3`, world-space bone helpers `applyQ/rotW/aimW`) for hits, guard, grapples.
- **Combat rules**: `tryHit`, `tryGrab`, `updateGrapple` (throws and submissions; `mash` handles button-mashing to escape/tighten), `AI` class (driven by the per-fight `ai` params), `playerIntent` (keyboard/mouse/touch input buffered via `queue`).
- **Game flow / state machine**: global `state` (`menu`, `cine`, `fight`, `over`, `transition`, `pause`…). `INTRO[i]`, `AFTER[i]`, `LOSS(i)` are arrays of cutscene steps consumed by `playScene` → `nextStep`/`updateCine` (camera helpers `cClose/cOTS/cTwo/follow/push`, subtitle + voice via `speak`). `setupScene(i)` builds the arena for fight `i`; `startFight`, `onKO`, `afterFight`, `showEnd` advance the story. `loop` → `tick(dt)` is the main update; `boot()` at the bottom preloads clips, characters and Kenney models before enabling the Start button.
- **Audio**: all SFX are synthesized with WebAudio (`sfx`), no audio files. Voices use `speechSynthesis` with per-speaker `VOICE_STYLE`.

## Assets

`assets/chars` (character glTF JSON + diffuse/normal textures), `assets/anims` (clip JSON), `assets/kenney` (building glTF JSON + `Textures/colormap.png`), `assets/tex` (ground textures). Credits shown in the menu: Mixamo (Adobe) characters/animations, Kenney (CC0) buildings, Poly Haven (CC0) ground textures — preserve this note if editing the menu.
