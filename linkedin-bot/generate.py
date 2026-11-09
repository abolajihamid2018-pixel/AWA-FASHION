"""Generate LinkedIn post drafts with Claude, render them as a PDF, and send the PDF to Telegram.

Env vars:
  ANTHROPIC_API_KEY   - Claude API key
  TELEGRAM_BOT_TOKEN  - token from @BotFather
  TELEGRAM_CHAT_ID    - your chat id (see README)
  DRY_RUN=1           - optional: build the PDF but don't send it
"""

import datetime as dt
import json
import os
import re
import sys
from pathlib import Path

import anthropic
import requests
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

HERE = Path(__file__).parent
MODEL = "claude-opus-5-5"

# Content pillars rotate every run so the feed stays varied.
PILLARS = [
    "Build-in-public update: something I built or improved this week (AWA Fashion or an automation)",
    "Security lesson: a vulnerability or security concept explained simply, tied to something I built",
    "AI automation walkthrough: a workflow that saves time, step by step",
    "Cybersecurity learning journey: a lab, CTF, course module or certification I'm working on",
    "Security risks in AI and no-code automation (API keys, permissions, prompt injection)",
    "Career and opportunities: what I'm looking for, lessons for other students, asking the network",
    "Myth vs reality: a common misconception in cybersecurity or AI automation",
    "Tool or resource review: a free tool/resource that helped me learn, and how I use it",
]

SCHEMA = {
    "type": "object",
    "properties": {
        "theme": {"type": "string"},
        "posts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "format": {"type": "string"},
                    "body": {"type": "string"},
                    "hashtags": {"type": "array", "items": {"type": "string"}},
                    "visual_idea": {"type": "string"},
                    "best_time": {"type": "string"},
                },
                "required": ["title", "format", "body", "hashtags", "visual_idea", "best_time"],
                "additionalProperties": False,
            },
        },
        "engagement_tip": {"type": "string"},
    },
    "required": ["theme", "posts", "engagement_tip"],
    "additionalProperties": False,
}


def pick_pillars(today: dt.date) -> list[str]:
    n = today.toordinal() // 2
    return [PILLARS[n % len(PILLARS)], PILLARS[(n + 3) % len(PILLARS)]]


def generate(today: dt.date) -> dict:
    profile = (HERE / "profile.md").read_text(encoding="utf-8")
    pillars = pick_pillars(today)
    prompt = f"""You are my LinkedIn ghostwriter. Write 2 ready-to-post LinkedIn drafts for me.

About me:
{profile}

Post 1 pillar: {pillars[0]}
Post 2 pillar: {pillars[1]}

Requirements:
- Write in first person, in my voice: a curious, honest cybersecurity student who builds things.
- Open with a strong one-line hook. Short paragraphs (1-3 lines). 120-220 words per post.
- Be specific and practical; teach one clear thing per post. End with a question to drive comments.
- Only claim things that are in "About me". Where a post needs a detail I haven't given,
  put a placeholder in square brackets like [result] so I can fill it in before posting.
- Defensive, educational security content only. No exploit instructions.
- Plain text only: no emojis, no markdown, no special symbols. Use "1." style lists if needed.
- 3-5 relevant hashtags per post, each starting with #.
- "format" is e.g. text post, carousel, short video, poll. "best_time" is a day and time (WAT).
- "theme" is a 3-6 word name for this batch.
Today's date: {today.isoformat()}."""

    client = anthropic.Anthropic()
    # Server-side fallback re-runs the request on another model if a safety classifier
    # declines (security topics can occasionally trip the "cyber" classifier).
    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        output_config={"effort": "medium", "format": {"type": "json_schema", "schema": SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError(f"Model declined: {response.stop_details}")
    if response.stop_reason == "max_tokens":
        raise RuntimeError("Response was cut off (max_tokens)")
    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text)


def clean(s: str) -> str:
    # Drop emoji / characters outside the Basic Multilingual Plane the PDF font can't draw,
    # then escape for reportlab's mini-markup.
    s = "".join(ch for ch in s if ord(ch) < 0x10000 and not 0xFE00 <= ord(ch) <= 0xFE0F)
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return re.sub(r"(\[[^\]]+\])", r'<font backColor="#fff3cd">\1</font>', s)


def register_font() -> tuple[str, str]:
    for regular, bold in [
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ]:
        if os.path.exists(regular) and os.path.exists(bold):
            pdfmetrics.registerFont(TTFont("Body", regular))
            pdfmetrics.registerFont(TTFont("Body-Bold", bold))
            return "Body", "Body-Bold"
    return "Helvetica", "Helvetica-Bold"


def build_pdf(data: dict, today: dt.date, out: Path) -> None:
    font, bold = register_font()
    blue, navy, grey = colors.HexColor("#0a66c2"), colors.HexColor("#0a1f44"), colors.HexColor("#5a6780")
    st = {
        "h1": ParagraphStyle("h1", fontName=bold, fontSize=20, leading=24, textColor=colors.white),
        "sub": ParagraphStyle("sub", fontName=font, fontSize=10, leading=14, textColor=colors.HexColor("#b9c8e8")),
        "h2": ParagraphStyle("h2", fontName=bold, fontSize=14, leading=18, textColor=blue, spaceBefore=10, spaceAfter=4),
        "meta": ParagraphStyle("meta", fontName=font, fontSize=8.5, leading=12, textColor=grey),
        "body": ParagraphStyle("body", fontName=font, fontSize=10.5, leading=15, alignment=TA_LEFT),
        "tags": ParagraphStyle("tags", fontName=font, fontSize=10, leading=14, textColor=blue),
        "label": ParagraphStyle("label", fontName=bold, fontSize=8.5, leading=12, textColor=grey),
    }
    width = A4[0] - 32 * mm

    def boxed(flows, bg="#ffffff", border="#d5dde9"):
        t = Table([[flows]], colWidths=[width])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg)),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor(border)),
            ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ]))
        return t

    story = []
    header = Table([[[Paragraph("LinkedIn Content Drafts", st["h1"]), Spacer(1, 4),
                      Paragraph(f"{today.strftime('%A %d %B %Y')} &middot; {clean(data['theme'])}", st["sub"])]]],
                   colWidths=[width])
    header.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), navy),
                                ("LEFTPADDING", (0, 0), (-1, -1), 16), ("TOPPADDING", (0, 0), (-1, -1), 14),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 14)]))
    story += [header, Spacer(1, 6),
              Paragraph("Review, fill in any highlighted [placeholders], then copy-paste to LinkedIn.", st["meta"])]

    for i, post in enumerate(data["posts"], 1):
        body = [Paragraph(clean(p), st["body"]) for p in post["body"].split("\n") if p.strip()]
        flows = []
        for p in body:
            flows += [p, Spacer(1, 6)]
        flows.append(Paragraph(clean(" ".join(post["hashtags"])), st["tags"]))
        story.append(KeepTogether([
            Paragraph(f"Post {i}: {clean(post['title'])}", st["h2"]),
            Paragraph(f"Format: {clean(post['format'])} &middot; Best time: {clean(post['best_time'])}", st["meta"]),
            Spacer(1, 6),
            boxed(flows),
            Spacer(1, 6),
            boxed([Paragraph("VISUAL IDEA", st["label"]), Paragraph(clean(post["visual_idea"]), st["body"])],
                  bg="#f5f8fc"),
        ]))

    story += [Spacer(1, 12), boxed([Paragraph("ENGAGEMENT TIP", st["label"]),
                                    Paragraph(clean(data["engagement_tip"]), st["body"])],
                                   bg="#eefaf3", border="#bfe5cf")]

    SimpleDocTemplate(str(out), pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm,
                      topMargin=16 * mm, bottomMargin=16 * mm,
                      title="LinkedIn Content Drafts").build(story)


def send_to_telegram(pdf: Path, data: dict) -> None:
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    titles = "\n".join(f"{i}. {p['title']}" for i, p in enumerate(data["posts"], 1))
    caption = f"New LinkedIn drafts ready for review\nTheme: {data['theme']}\n\n{titles}"[:1000]
    with pdf.open("rb") as f:
        r = requests.post(f"https://api.telegram.org/bot{token}/sendDocument",
                          data={"chat_id": chat_id, "caption": caption},
                          files={"document": (pdf.name, f, "application/pdf")}, timeout=60)
    if not r.ok:
        # Don't print the URL: it contains the bot token.
        raise RuntimeError(f"Telegram error {r.status_code}: {r.text[:300]}")


def main() -> int:
    today = dt.date.today()
    data = generate(today)
    out = HERE / f"LinkedIn-Drafts-{today.isoformat()}.pdf"
    build_pdf(data, today, out)
    print(f"Built {out.name}: {data['theme']}")
    if os.environ.get("DRY_RUN") == "1":
        print("DRY_RUN set, not sending to Telegram")
        return 0
    send_to_telegram(out, data)
    print("Sent to Telegram")
    return 0


if __name__ == "__main__":
    sys.exit(main())
