# Higgsfield Workflow for AWA Fashion

## What the connected Higgsfield MCP can do (checked 2026-10-23)

| Tool | Available | Use |
|---|---|---|
| `balance` | Yes | 10 credits, free plan |
| `list_workspaces` / `workspace_select` | Yes | One private workspace |
| `models_list` / `models_get` | Yes | Read the model catalog |
| `show_generations` | Yes | Browse past results (none yet) |
| `import-claude-motion-from-url` | Yes | Import a Claude Motion MP4 into Higgsfield media |
| Image or video **generation** | **No** | The connector's own instructions say it "cannot generate media, upload arbitrary files, or make purchases" |
| Media upload (for reference images) | **No** | Same restriction |

So this session can plan and price work against the real model catalog, but cannot generate or upload. Generation needs either a Higgsfield connector with generation tools, or running the prompts below in the Higgsfield app.

10 free credits cover a few still images at most. They do not cover a hero video.

## Relevant models in the catalog

| Job | Model id | Why |
|---|---|---|
| Faithful edit of a real product photo (cleanup, background, light) | `nano_banana_pro`, `nano_banana_2` | Image-to-image with references; `nano_banana_2` supports masked inpainting, so the garment can stay untouched |
| Editorial and atmosphere stills | `soul_2`, `soul_cinematic`, `cinematic_studio_2_5` | Fashion editorial and cinematic stills |
| Empty sets and backgrounds | `soul_location` | Environments with no people |
| Motion from a still (subtle) | `cinematic_studio_3_0`, `seedance_2_0`, `minimax_hailuo` | Image-to-video with start and end frames |

## Garment-fidelity rules (every job)

1. A real AWA garment is never generated. It can only be **kept** (masked or referenced) inside an edit.
2. Every edit is checked against the source photo side by side: colour, embroidery pattern and placement, pinstripe spacing, pocket shape, length, sleeve length. Any drift means the edit is rejected.
3. Generated images never show a garment presented as an AWA product. Atmosphere assets show no clothing, or only out-of-focus silhouettes.
4. Every prompt includes: "no text, no logos, no lettering anywhere".
5. No generated faces presented as customers. Only people who have agreed to appear (the models already in AWA's photos) may appear in edited product images.

## Prototype set (run these first, small and cheap)

Four stills, one direction. Inspect them before making anything else.

**1. Hero atmosphere (`soul_location` or `cinematic_studio_2_5`, 16:9, 2k)**
> A clean minimalist fashion studio wall in cool white plaster, with one soft warm LED strip running across it in a slow, uneven wave, glowing pale gold. The wall fills the frame edge to edge, softly lit from the left, with gentle shadow falling toward the right. A single tall green palm leaf at the lower left edge. Calm, premium, quiet. Photorealistic, 16:9. No people, no clothing, no text, no logos, no lettering anywhere.

**2. Detail texture (`soul_cinematic`, 3:2)**
> Extreme close-up of navy cotton fabric with a fine raised tonal embroidery thread pattern, soft raking warm light from the top right, shallow depth of field, the weave filling the frame edge to edge. Photorealistic. No text, no logos, no lettering anywhere.

(This is an abstract fabric texture, not an AWA garment. Use it only as a background behind real content.)

**3. Section transition (`soul_location`, 21:9)**
> A long empty clothing rail in a bright studio, light wooden hangers spaced evenly, cool white wall behind with a faint warm glow line, soft morning light, generous calm space across the frame. Photorealistic, 21:9. No clothing, no text, no logos, no lettering anywhere.

**4. Product presentation test (`nano_banana_2` with the real photo as reference, masked)**
> Keep the person and the garment exactly as they are: same colour, same embroidery, same proportions, same pose. Only clean the background wall, even out the lighting, and remove small distractions at the edges. Do not change the clothing in any way. No added text or logos.

Use the original full-resolution photo for this one, never the Instagram crops.

## Motion (later, only if it earns its place)

One subtle loop for The Edit or the hero background: image-to-video from prototype 1, the light on the wall breathing slowly, camera still, 5 seconds, no people. Re-encode with the skill's settings (`-g 8 -keyint_min 8 -crf 20 -an`) and load it only behind the same five static gates the page already uses.

## Where Nano Banana fits

When AWA supplies original product photos: run prototype 4's prompt (cleanup, background, light), check against the source, then drop the result into `assets/img/` with the same file name. See `visual-direction.md` for the file list.
