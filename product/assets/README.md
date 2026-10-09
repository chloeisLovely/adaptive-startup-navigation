# Approved space landing artwork

Created with the built-in image-generation tool from the ASNM visual proposal approved by the founder on 2026-10-09. These are visual assets, not rendered UI: the real page uses selectable Korean/English text, native buttons and an HTML maker credit. No new company or trademark identity is asserted.

- `space-background.webp`: 1536 × 1024, 56,328 bytes. Background only; no embedded UI text.
- `entry-symbols.webp`: 2172 × 724, 447,302 bytes, transparent alpha. Three equal sprite cells: rocket, compass, robot. CSS presents each below its corresponding choice. Images are decorative and excluded from the accessible name; the entire choice remains keyboard/click operable.
- Original generated PNGs were encoded as WebP without changing their dimensions. The combined artwork payload is 503,630 bytes. No 3D runtime is loaded on the landing.

## Final prompts

### Three-symbol transparent sprite

Production website asset, derived from the approved ASNM screenshot. Extract/recreate ONLY the three beautiful 3D illustrations from the bottom of the reference into ONE wide transparent horizontal sprite sheet, aspect ratio 3:1. Three equal square cells side by side: left cell rocket with small orbital trail and glowing waypoint dots; center cell silver/cyan navigation compass with delicate route markers; right cell friendly small white/silver AI astronaut robot waving, glossy black faceplate, two cyan eyes, cyan holographic circular platform. Match the reference subjects faithfully, colors, polish and perspective. Each complete illustration fits entirely within its own equal-width cell with at least 10% transparent padding on every side. Center all three at precisely 1/6, 1/2, 5/6 of total width, with consistent apparent size and baseline. True transparent alpha background, no stars, no sky, no planets, no UI, no text except tiny incidental compass markings. The three illustrations must not overlap their neighboring cell. Premium polished silver-white/cyan 3D, delicate restrained glow, not excessively cartoonish. This asset will be displayed as three independently clipped CSS sprites below buttons.

### Space background

Use case: precise-object-edit. Production website background asset based on this approved ASNM reference. Remove ALL interface/text/letters/header/buttons, ALL rocket/compass/robot foreground illustrations, footer and divider. Output ONLY the subtle deep navy outer-space environment, wide landscape roughly 3:2. Preserve the reference's restrained delicate blue-teal nebula at the left and right outer edges, scattered small white/cyan stars, faint orbit arc and the cropped Earth-like planet crescent at lower left with cyan rim light. Keep the entire central 65% near-solid midnight navy #020818, very dark and calm, so real HTML text and buttons can be overlaid legibly. No bright bloom behind the center, no purple gradients, no giant extra planets. No text, logos, symbols, characters, UI, objects, or watermarks. A continuous high-quality space background with generous quiet negative space, not a poster.

## Verification

The separate `art-browser.cjs` suite checks KO/EN at 1440, 1280, 390 and 320 pixels; equal native button widths; sprite positions and loading; maker credit; light theme and reduced motion; clicks on illustrations; and keyboard navigation when artwork requests fail. No changes to engine state, research evidence or LLM behavior are part of this artwork addition.
