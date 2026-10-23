# AWA Fashion · Africa Grace. Global Style.

The AWA Fashion website. Plain HTML, CSS and vanilla JavaScript: one `index.html` plus `assets/`, with no build step.

## What is on the site

- **Hero**: the brand line and a real AWA look.
- **The Edit**: a scroll-linked lookbook of five real pieces on desktop, and a swipe track on phones and with reduced motion.
- **Collection**: every real piece, filterable. Each piece has its own shareable page at `#/piece/<slug>`.
- **Make it yours**: a customisation request (piece, colour, shape, fit, embroidery, measurements) that opens WhatsApp with the request already written out.
- **The House** and **Contact**: WhatsApp, Instagram and TikTok (@fashionwithawa).

Prices show as "Price on request" until AWA confirms real prices. The old demo cart and Paystack checkout used invented products and prices, so they were removed. They can come back once real prices exist.

## Edit the basics

- WhatsApp number: `WHATSAPP_NUMBER` near the top of the script in `index.html`.
- Pieces: the `pieces` array in the same script. Describe only what is real.
- Images: replace files in `assets/img/` with higher-resolution originals, keeping the same names.

## Docs

- `docs/visual-direction.md`: the design direction, the 10k-websites techniques used and not used, image status, and the facts still needed from AWA.
- `docs/higgsfield-workflow.md`: what the Higgsfield connection can do, garment-fidelity rules, and the first prompts to run.

## Preview locally

```
npx http-server -p 8080
```

## Deploy

Vercel, with no build settings. `vercel.json` serves the files as they are and caches `assets/`.
