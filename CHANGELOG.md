# Changelog

## Unreleased
- Display: Synthwave shapes plus a new Abstract mode with 14 line-art figures (rose, nested polygons, ribbons, moire, hex ripple, galaxy, pulse, string, pendulums, spirograph, warped grid, tree, atom, scope); two per pad, chosen by chord and random seed.
- Four light new sounds: Choir, Bell, Tape Keys, Pluck.
- 5 more chord sets (progressions) in the chord-set menu.
- Fewer audio nodes at once: voice budget on top of the voice count; the loop and settings autosave and come back after a page reload.

## 1.1.0 (2026-11-13)

- Smooth chord morph: moving the joystick reshapes the sounding chord instead of playing it again.
- Phone held sideways: Filter and Reso knobs sit in the header; Latch is no longer cut off on low screens; Undo stays on screen on small phones.
- Filter and Reso knobs sit a little lower in portrait.
- Audio also wakes up on the next touch after an interruption.
- Larger captions on the tiles and around the joystick; the "?" button answers to a 44px area.
- Tests: audio fuzz test in the browser; a safety limiter keeps the output below full scale. Runs in CI.
