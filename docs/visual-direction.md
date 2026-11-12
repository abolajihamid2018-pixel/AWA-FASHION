# AWA Fashion: Visual Direction ("The Lit Wall")

This is the design package for the site, adapted from the 10k-websites skill. It is the source the build follows.

## Source-of-truth order

1. Real AWA product and brand photos decide what the clothing looks like.
2. AWA's Instagram and brand posts decide the visual identity.
3. Higgsfield (once it can generate) makes supporting campaign assets, never product shots.
4. The 10k-websites skill is the design and engineering framework.
5. No invented facts: no prices, reviews, customer counts, addresses, hours, fabrics or claims that AWA has not published.

## 1. Premise

**Grace.** In every AWA photo the model stands still and composed in front of the studio's lit wave wall. The site does the same: calm, unhurried, and lit by one warm line.

## 2. Signature element

**The lit wave.** The warm LED wave on the AWA studio wall becomes an SVG line that draws itself across the hero, divides sections, and lights up on the "Make it yours" ticket as the visitor fills in their request. If you took it out, the page would lose the one thing that ties it to the real studio.

## 3. Palette (from the studio and the brand posts)

```css
--canvas:#eceff3;   /* studio wall, cool white */
--panel:#f6f7f9;
--ink:#0f2440;      /* logo navy */
--ink-2:#46546a;    /* secondary text, 6.6:1 on canvas */
--sky:#86acd6;      /* logo light stroke */
--glow:#f0c24a;     /* LED wave, rare: the line, focus rings, small details */
```

## 4. Type

- Display: Bodoni Moda 400/500, italic 400. Fashion-house serif, close in feel to the serif in AWA's "October" post.
- Body: Figtree 400/500/600. Close to the logo's geometric sans.
- Labels: IBM Plex Mono 400/500.

## 5. Page map

| Section | Job | Layout skeleton |
|---|---|---|
| Hero | Tagline, one real piece in an arch frame, two CTAs | Split, type-led |
| The Edit | Five real looks as stacking cards: each card slides up and settles over the last | Sticky card stack |
| Collection | Every real piece, filterable, each opens a piece page | Card grid |
| In the details | Gold jacquard close-up, what to look for | Dark full-bleed band |
| Make it yours | Customisation request that goes to WhatsApp | Form plus sticky ticket |
| The House | Brand line, studio images | Offset editorial grid |
| Contact | WhatsApp, Instagram, TikTok, phone | Centered |

Piece pages are hash routes (`#/piece/<slug>`) so they can be shared and the back button works.

## 6. What was taken from the 10k-websites skill, and what was not

**Used:**
- The design bar: one committed direction, one signature element, a rare accent, a tinted canvas, one fixed environment layer, no two neighbouring sections with the same skeleton.
- Scroll discipline: The Edit stacks with CSS `position: sticky`. One rAF-throttled pass eases covered cards back, writing to the DOM only when a value changes, and only while the section is on screen. (The first version was a pinned scroll-scrub; it felt laggy, so it was replaced.)
- Caption pacing checked with the flick test. Each caption stays fully readable for 7 normal scroll flicks.
- The quality floor: skip link, landmarks, focus-visible, 44px+ touch targets, `overflow-x: clip`, complete reduced-motion support, loops paused off-screen and on hidden tabs, and `transform` and `opacity` used for motion.
- The copy gate: no em dashes, no stock words, no AI tells.
- Image discipline: one clean WebP pass, explicit width and height, lazy loading below the fold.

**Not used, on purpose:**
- **The scroll-scrubbed hero video.** For a fashion label with mostly mobile customers, a 400vh video hero pushes the clothes off the first screen and costs data. Phones would only see a still image anyway. It also needs a generated video, which this Higgsfield connection cannot make. The Edit gives the same cinematic feel using the real photos.
- **Hostinger deploy and the skill's partner links.** The project already deploys on Vercel.
- **AI-generated hero subjects.** Product imagery stays real. Generated assets are kept for atmosphere only (see `higgsfield-workflow.md`).

## 7. Image status

The images in `assets/img/` are **interim**. They were cropped from Instagram screenshots at about 330×397px, with the Instagram icons removed. The clothing is untouched. They look soft on high-density screens. Replace them with the original photos at 1600px or wider, using the same file names, and the whole site upgrades with no code changes.

| File | Garment |
|---|---|
| teal-kaftan-front / -side | Teal long kaftan |
| butter-set-front / -seated | Butter embroidered set |
| pinstripe-set-front / -stride | Black pinstripe set |
| olive-set | Olive embroidered set |
| sky-kaftan | Sky blue kaftan |
| black-kaftan | Black kaftan |
| joggers-rack | Joggers in grey, black, brown |
| gold-jacquard-detail | Gold jacquard top (detail only) |

## 8. Facts used, and where they came from

- Name, tagline "Africa Grace. Global Style.", and logo: brand posts.
- WhatsApp +234 907 375 7945, Instagram and TikTok @fashionwithawa: October post footer.
- "Make it yours" line: October post.
- Garment descriptions: only what is visible in the photos.

**Still needed from AWA** (not invented, left out): prices, sizes, fabrics, delivery areas, turnaround times, a physical address and opening hours, and the official logo file (the site uses a close redraw for now).
