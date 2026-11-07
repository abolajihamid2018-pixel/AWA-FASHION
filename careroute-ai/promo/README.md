# CareRoute AI promo video

Regenerates the ~72s promo (1920x1080 + 1080x1080) from the live site, with motion-graphic cards,
captions, cursor/zoom effects, and an original synthesized soundtrack + SFX (no third-party audio).

1. Create a temporary staff user `jordan.frontdesk@example.com` (allow-listed as "Jordan (Front desk)").
2. `PROMO_STAFF_PASSWORD=... node record.cjs ./raw` — records cards + app flows (Playwright, Chromium).
3. `python3 build.py ./raw ./CareRoute-AI-promo.mp4` — clips, transitions, music, SFX, loudness (-14 LUFS).
4. Delete the temporary staff user.

Requires ffmpeg, numpy and the Inter font.
