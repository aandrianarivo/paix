# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Paix" — a French-language 3D fighting game: a solo story **campaign** (3 fights, cutscenes, behind a password) and an **online 1v1 multiplayer** mode. Flow: home (`#home`) → Campagne (`#pwd` → `#menu`) or Multijoueur (`#lobby` → `#select` → duel). No build step, no tests, no linter, not a git repo. All UI/narrative text is French; keep it that way.

The game is `index.html` (CSS, screens, one inline `<script>` IIFE) plus static assets in `assets/`. `server.js` (Node + `ws`) serves `/` and `/assets/*` only, exposes `POST /api/campaign-auth`, and relays WebSocket messages between the two players of a room.

## Running

```
npm install
CAMPAIGN_PASSWORD=secret PORT=8000 npm start   # random password (printed) if CAMPAIGN_PASSWORD is unset
```
Friends connect to the same server (LAN IP, or a tunnel such as ngrok/cloudflared). Three.js r128 + loaders and Google Fonts come from CDNs; keep Three.js pinned at r128 (global `THREE`, no ES modules).

The campaign password is only a light barrier: the campaign code ships inside the public `index.html`.

Debug hook `window.__lmt` (end of script): `step(n, dt)` advances `tick` manually (essential in headless Chrome, where software rendering runs ~3 FPS), `key`, `p`/`o` (player/opponent Fighter), `s` (state). Multiplayer was tested by driving two headless Chrome instances over CDP and calling `__lmt.step` on both.

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

## Multiplayer (section `/* ---------- Multijoueur en ligne ---------- */`)

Host-authoritative: the room creator runs the whole existing simulation (`Fighter.update`, `tryHit`, `tryGrab`, `updateGrapple`). `vs` (non-null during a duel) switches behaviours: no AI, no AI grapple meter, no pause, `onKO` → `versusEnd`. The remote player's intent comes from `remoteIntent`, fed by guest messages `m` (movement in world space), `q` (buffered J/K/E/dodge) and `mash`. The host sends snapshots (`s`, ~30 Hz, `snapF`) plus an event list (`ev(...)` hooks in `sparks/popup/callout/sfx/showCombo/impulse`); the guest only applies them (`applySnap`, `applyEvents`, `guestFollow`) and animates. `player`/`opp` are always local/remote perspective (the guest's `player` is `vs.f2`). `Fighter.set` bumps `setN` so the guest restarts animations. Playable characters are the `CHARS` table (Mixamo `ch31`/`ch08` looks + clothes-colour variants). `NET.role` is `'host' | 'guest' | null`.
