# LinkedIn content bot

Every 2 days, a GitHub Action asks Claude to write 2 LinkedIn post drafts based on
`profile.md`, turns them into a PDF and sends the PDF to you on Telegram. You review it,
fill in any highlighted `[placeholders]` and post it yourself. Nothing is posted automatically.

## One-time setup

1. **Create the bot.** In Telegram, message **@BotFather**, send `/newbot` and follow the steps.
   Copy the token it gives you. Treat this token like a password.
2. **Start a chat with your bot.** Open your new bot and send it any message (e.g. `hi`).
3. **Get your chat ID.** In a browser, open
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` and copy the number after `"chat":{"id":`.
4. **Get a Claude API key** at https://console.anthropic.com (Settings → API Keys).
   Each run costs a few cents.
5. **Add 3 repository secrets.** On GitHub go to Settings → Secrets and variables → Actions →
   New repository secret, and add:
   - `ANTHROPIC_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
6. **Merge this into `main`.** GitHub only runs scheduled workflows from the default branch.
7. **Test it now.** Go to Actions → *LinkedIn content drafts* → Run workflow.
   A PDF should arrive in Telegram within about a minute.

## Making the posts better

Edit `profile.md`, especially **Recent wins**. The bot only writes about what's in that file,
so real details from your week give you better posts. The topics rotate through the 8 themes
in `PILLARS` in `generate.py`.

## Changing the schedule

Edit the `cron` line in `.github/workflows/linkedin-content.yml`. Times are in UTC.

## Local test without sending

```bash
pip install -r linkedin-bot/requirements.txt
```

```bash
ANTHROPIC_API_KEY=... DRY_RUN=1 python linkedin-bot/generate.py
```
