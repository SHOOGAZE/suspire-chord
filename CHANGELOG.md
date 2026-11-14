# Changelog

## Unreleased
- Landscape play mode: no big screen; the header is the portrait one (mini scene, chord name, knobs, transport) and the freed room goes to the joystick and pads. With the panels open, the line-art scene shrinks into the header the same way.
- Landscape with the extra panels open: slim display strip, tabs and panel on the left (they scroll on their own), big pads on the right, no page scroll.
- Phone upright (compact layout): the bar under the header (key / Edit / arrow / Dice / Undo) has one height and one centre line, spans the full width and lines up with the pads; the mini display drops its tiny captions.
- Landscape: on very low screens (phone sideways under preview or browser bars) the left column is tightened, so Latch, Drums and Hold are no longer cut off.
- Fonts: DM Mono, Pixelify Sans and JetBrains Mono (Latin + Cyrillic subsets, SIL OFL) are now embedded in the file (about 125 KB), so the display, pad labels and the pixel chord name look right offline. Sora and Inter, the main UI faces, still come from Google Fonts when online and fall back to the system font offline.
- Display: the Synthwave/Ember animations are replaced by our own thin-line scenes in a pink / violet / coral palette, each drawing the chord itself: breathing rings, the circle of fifths with the previous chord as a ghost, voice threads that glide on chord changes, interval arcs over a semitone ruler, voice leading from the previous chord to the new one, a twelve-petal bloom and Lissajous figures of the interval ratios. A scene is picked by the chord degree; when nothing is played the display wanders through them. The display draws at 30 fps and steps down on slow phones. The Display button switches Chords ↔ Lines.
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
