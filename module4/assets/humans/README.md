# ASNM human avatar assets

Six textured, rigged business humans from Microsoft's **Microsoft Rocketbox** project, distributed under the MIT License in `ROCKETBOX-LICENSE.md`. Copyright (c) Microsoft Corporation.

Source: https://github.com/microsoft/Microsoft-Rocketbox/tree/master/Assets/Avatars/Professions

- Business_Female_01, Business_Female_02, Business_Female_03
- Business_Male_01, Business_Male_03, Business_Male_04

## Preparation

The original facial FBXs were converted with Blender/bpy 4.5.3 to glTF 2.0 binary. Original skin meshes, 80-joint skeletons and UV texture maps are retained. Textures are resized to at most 1024px, body and head images use JPEG quality 87, and alpha hair/glasses maps use PNG. Seven facial morphs are retained for blinking, jaw opening, mouth rounding and smiles. Other morphs are removed to reduce size. Materials use diffuse textures and a rough, non-metallic PBR surface.

Six lightweight ASNM-authored skeletal loops (`Idle`, `Walk`, `Talk`, `Think`, `Celebrate`, `Concerned`) are baked into every GLB. These are procedural gestures, not motion capture. Mouth movement follows the speaking state with approximate rhythmic motion; it is **not phoneme-aligned lip sync**. The models improve human proportions, clothing, face and hair detail over the primitive fallback, but do not represent photorealistic AAA characters.

`manifest.json` records hashes, source locations, byte sizes, skeleton joint counts, animation names and facial morph names. Models contain embedded textures and make no third-party avatar-service requests.

The vendored `babylonjs.loaders.min.js` is Babylon.js loaders **8.26.0**, matched to `module4/vendor/babylon.js`, from https://cdn.jsdelivr.net/npm/babylonjs-loaders@8.26.0/babylonjs.loaders.min.js . It is Apache-2.0 licensed; see `BABYLON-LICENSE.md`.

## Runtime adapter

`module4/world/human-assets.js` exports `installHumanAvatars(B, scene, avatars, shadows)` and returns `{ready, dispose}`. `ready` resolves to `{loaded, failed}`. It shares six source asset containers and clones skeletons/animation state per gameplay actor. Only successfully replaced actors hide their procedural body; failed assets keep the existing visible fallback.

The actor root retains movement, room picking and gameplay state. Existing `metadata.state` selects the gesture; optional boolean `metadata.speaking` selects speech mouth movement. Dispose the adapter before the existing avatar controller. Respecting `prefers-reduced-motion` pauses the gesture and mouth animation.

Verification performed: glTF JSON/buffer inspection (six clips, embedded images, 80 joints and seven morphs per file), Blender import and offline render of the exported avatar in idle and talk poses. In-browser/WebGL appearance still requires the application's supported preview environment.
