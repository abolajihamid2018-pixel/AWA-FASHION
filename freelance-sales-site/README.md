# The Freelance Client Acquisition System: Sales Site

A static sales page (plain HTML, CSS and JavaScript). No framework, no dependencies and no build step.

## Deploy on Netlify

- **Folder to deploy:** `freelance-sales-site`
- **Build command:** none (leave empty)
- **Publish directory:** `.` (this folder). When deploying from Git, set **Base directory** to `freelance-sales-site`.

Manual option: drag this whole folder onto https://app.netlify.com/drop

## Selar checkout link

Every purchase button links to `https://selar.com/0h79r38793`.
To change it, search `index.html` for that URL and replace every occurrence (3 buttons plus the `SELAR_URL` line).

## Files

| File | Purpose |
|---|---|
| `index.html` | The sales page (styles and script included) |
| `img-*.webp` | Sample-page images |
| `cormorant-*.woff2`, `inter-*.woff2` | Self-hosted fonts |
| `favicon.svg` | Browser tab icon |
| `404.html` | Page-not-found page |
| `robots.txt` | Search engine access |
| `netlify.toml` | Netlify settings (no build, caching headers) |
