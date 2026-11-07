// Records the CareRoute AI promo footage: motion-graphic cards + live app flows.
// Frames come from the Chrome DevTools screencast (crisp 1920x1080 JPEGs) and are
// stitched into constant-frame-rate clips by build.py.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = process.argv[2]
const BASE = 'https://careroute-ai.vercel.app'
const CARDS = 'file://' + path.join(__dirname, 'cards.html')
const VIEW = { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 }

const PATIENT_NOTE = "Booking my flu jab before flu season books me first. Mornings please, after lunch I'm basically a sleepy potato."
const STAFF_APPROVE_MSG = "See you at 10:30! Wear short sleeves: our nurse is fast, but not 'through-a-hoodie' fast."
const STAFF_EXTRA_MSG = 'PS: free parking out back, and yes, the office cat is friendly. Mostly.'

// ---------- overlay injected into every app page (cursor, click ripple, captions, zoom) ----------
const OVERLAY = () => {
  const css = `
  #__cur{position:fixed;left:0;top:0;width:30px;height:30px;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))}
  .__rip{position:fixed;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:3px solid #14b8a6;background:rgba(20,184,166,.18);pointer-events:none;z-index:2147483646;animation:__rip .65s ease-out forwards}
  @keyframes __rip{to{transform:scale(4.2);opacity:0}}
  #__cap{position:fixed;left:36px;bottom:36px;z-index:2147483645;display:flex;align-items:center;gap:16px;padding:16px 28px 16px 16px;border-radius:20px;
    background:rgba(6,18,43,.9);color:#fff;font-family:Inter,sans-serif;box-shadow:0 24px 60px rgba(2,6,23,.45);transform:translateX(-130%);transition:transform .6s cubic-bezier(.2,1.25,.3,1)}
  #__cap.show{transform:none}
  #__cap .ic{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#2563eb,#14b8a6);display:grid;place-items:center;font-size:22px;font-weight:800;flex:none}
  #__cap .t{font-size:25px;font-weight:800;letter-spacing:-.01em}
  #__cap .s{font-size:16px;color:#cbd5e1;margin-top:3px}
  #root{transition:transform 1s cubic-bezier(.3,.8,.25,1)}`
  const boot = () => {
    if (document.getElementById('__cur')) return
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st)
    const cur = document.createElement('div'); cur.id = '__cur'
    cur.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.6-6.7L4 20z" fill="#0f172a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    cur.style.transform = `translate(${window.__cx || 760}px, ${window.__cy || 420}px)`
    document.body.appendChild(cur)
    const cap = document.createElement('div'); cap.id = '__cap'; cap.innerHTML = '<div class="ic"></div><div><div class="t"></div><div class="s"></div></div>'
    document.body.appendChild(cap)
    addEventListener('mousemove', (e) => { window.__cx = e.clientX; window.__cy = e.clientY; cur.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 2}px)` }, true)
    addEventListener('mousedown', (e) => { const r = document.createElement('div'); r.className = '__rip'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700) }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot()
  window.__cap = (icon, title, sub = '') => {
    const c = document.getElementById('__cap'); if (!c) return
    c.classList.remove('show')
    setTimeout(() => { c.querySelector('.ic').textContent = icon; c.querySelector('.t').textContent = title; c.querySelector('.s').textContent = sub; c.querySelector('.s').style.display = sub ? '' : 'none'; c.classList.add('show') }, c.classList.contains('show') ? 350 : 0)
  }
  window.__capHide = () => document.getElementById('__cap')?.classList.remove('show')
  window.__zoomTo = (text, scale) => {
    const root = document.getElementById('root')
    const el = [...document.querySelectorAll('section, div.rounded-xl, div.rounded-2xl')].find((s) => s.textContent.trim().toUpperCase().startsWith(text.toUpperCase()))
    if (!root || !el) return false
    const r = el.getBoundingClientRect(), rr = root.getBoundingClientRect()
    root.style.transformOrigin = `${r.left + r.width / 2 - rr.left}px ${r.top + r.height / 2 - rr.top}px`
    root.style.transform = `scale(${scale})`
    return true
  }
  window.__unzoom = () => { const root = document.getElementById('root'); if (root) root.style.transform = 'none' }
}

// ---------- screencast recorder ----------
class Recorder {
  constructor() { this.segments = [] }
  async start(page, name) {
    this.page = page
    this.cdp = await page.context().newCDPSession(page)
    this.cur = { name, frames: [], events: [], t0: Date.now() / 1000 }
    this.cdp.on('Page.screencastFrame', async (f) => {
      if (this.cur) this.cur.frames.push({ t: f.metadata.timestamp, data: f.data })
      try { await this.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {}
    })
    await this.cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
  }
  ev(type) { if (this.cur) this.cur.events.push({ type, t: Date.now() / 1000 }) }
  async stop() {
    await sleep(250)
    this.cur.t1 = Date.now() / 1000
    await this.cdp.send('Page.stopScreencast')
    this.segments.push(this.cur); this.cur = null
    await this.cdp.detach()
  }
  save() {
    const meta = []
    for (const [i, s] of this.segments.entries()) {
      const dir = path.join(OUT, `${String(i).padStart(2, '0')}-${s.name}`)
      fs.mkdirSync(dir, { recursive: true })
      const start = s.frames[0].t
      const lines = []
      s.frames.forEach((f, j) => {
        const file = path.join(dir, `${String(j).padStart(5, '0')}.jpg`)
        fs.writeFileSync(file, Buffer.from(f.data, 'base64'))
        const next = j + 1 < s.frames.length ? s.frames[j + 1].t : s.t1
        lines.push(`file '${file}'`, `duration ${Math.max(0.001, next - f.t).toFixed(4)}`)
      })
      lines.push(`file '${path.join(dir, `${String(s.frames.length - 1).padStart(5, '0')}.jpg`)}'`)
      fs.writeFileSync(path.join(dir, 'list.txt'), lines.join('\n'))
      meta.push({ name: s.name, dir, frames: s.frames.length, duration: s.t1 - start, events: s.events.map((e) => ({ type: e.type, t: Math.max(0, e.t - start) })) })
    }
    fs.writeFileSync(path.join(OUT, 'segments.json'), JSON.stringify(meta, null, 2))
    return meta
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const rec = new Recorder()

// ---------- human-like helpers ----------
async function moveTo(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  const b = await locator.boundingBox()
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  await page.mouse.move(x, y, { steps: 28 })
  await sleep(120)
}
async function click(page, locator) {
  await moveTo(page, locator)
  rec.ev('click')
  await page.mouse.down(); await sleep(70); await page.mouse.up()
  await sleep(250)
}
async function typeInto(page, locator, text, delay = 32) {
  await click(page, locator)
  rec.ev('typing')
  await page.keyboard.type(text, { delay })
  await sleep(250)
}
const cap = (page, icon, title, sub) => { rec.ev('caption'); return page.evaluate(([i, t, s]) => window.__cap(i, t, s), [icon, title, sub]) }
const capHide = (page) => page.evaluate(() => window.__capHide())
const zoom = async (page, text, scale) => { rec.ev('zoom'); return page.evaluate(([t, s]) => window.__zoomTo(t, s), [text, scale]) }
const unzoom = (page) => page.evaluate(() => window.__unzoom())

async function card(browser, scene, seconds) {
  const ctx = await browser.newContext(VIEW)
  const page = await ctx.newPage()
  await page.goto(`${CARDS}?scene=${scene}`)
  await rec.start(page, `card-${scene}`)
  rec.ev('whoosh')
  await sleep(seconds * 1000)
  await rec.stop()
  await ctx.close()
}

;(async () => {
  const browser = await chromium.launch()
  await card(browser, 'intro', 5.6)

  // ================= PATIENT =================
  const pctx = await browser.newContext(VIEW)
  await pctx.addInitScript(OVERLAY)
  const p = await pctx.newPage()
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  await p.mouse.move(980, 520)
  await rec.start(p, 'patient-request')
  await sleep(500)
  await cap(p, '1', 'Meet CareRoute AI', 'Clinic requests, minus the chaos')
  await sleep(2400)
  await click(p, p.getByRole('link', { name: 'Browse clinic services' }).first())
  await p.waitForURL('**/services'); await p.locator('h2', { hasText: 'Vaccination appointment' }).waitFor()
  await cap(p, '1', 'Pick a service', 'No hold music. No guesswork.')
  await sleep(1300)
  await click(p, p.locator('a', { has: p.locator('h2', { hasText: 'Vaccination appointment' }) }))
  await p.locator('form').waitFor()
  await capHide(p)
  await typeInto(p, p.locator('#name'), 'Sam Rivera', 45)
  await typeInto(p, p.locator('#email'), 'sam.rivera@example.com', 28)
  const d = new Date(); d.setDate(d.getDate() + 6)
  await click(p, p.locator('#date')); await p.locator('#date').fill(d.toISOString().slice(0, 10)); await sleep(300)
  await click(p, p.locator('#time')); await p.selectOption('#time', 'morning'); await sleep(300)
  await cap(p, '✎', 'Add a quick note', 'Admin details only. Potatoes allowed.')
  await typeInto(p, p.locator('#enquiry'), PATIENT_NOTE, 26)
  await click(p, p.locator('input[type=checkbox]'))
  await click(p, p.getByRole('button', { name: 'Send request' }))
  await p.waitForURL('**/request/submitted')
  rec.ev('success')
  const ref = await p.locator('p.text-xl').innerText()
  const statusLink = await p.inputValue('input[aria-label="Private status link"]')
  await p.mouse.move(900, 300, { steps: 15 })
  await cap(p, '✓', 'Request received', '…but NOT confirmed yet. A human decides.')
  await sleep(2800)
  await rec.stop()

  await card(browser, 'mid', 3.4)

  // ================= STAFF =================
  const sctx = await browser.newContext(VIEW)
  await sctx.addInitScript(OVERLAY)
  const s = await sctx.newPage()
  await s.goto(BASE + '/staff/login', { waitUntil: 'networkidle' })
  await s.mouse.move(980, 300)
  await rec.start(s, 'staff')
  await cap(s, '2', 'Front desk sign-in', 'Staff only. Patients never see the queue.')
  await typeInto(s, s.locator('#email'), 'jordan.frontdesk@example.com', 24)
  await typeInto(s, s.locator('#password'), process.env.PROMO_STAFF_PASSWORD, 18)
  await click(s, s.getByRole('button', { name: 'Sign in' }))
  await s.waitForURL(BASE + '/staff')
  await s.getByRole('link', { name: ref }).first().waitFor()
  rec.ev('ding')
  await cap(s, '!', 'New request alert', 'Fresh requests are highlighted instantly')
  await sleep(2300)
  await click(s, s.getByRole('link', { name: ref }).first())
  await s.getByRole('heading', { name: ref }).waitFor()
  for (let i = 0; i < 10 && !(await s.getByText('Suggested service').isVisible()); i++) { await sleep(1500); await s.reload({ waitUntil: 'networkidle' }) }
  await sleep(600)
  await zoom(s, 'AI summary', 1.45)
  await cap(s, 'AI', 'AI reads the note in seconds', 'Summary + suggested service. Never medical advice.')
  await sleep(3600)
  await unzoom(s); await sleep(900)
  await cap(s, '✓', 'A human approves', '…and picks the exact time')
  await click(s, s.getByRole('button', { name: 'Approve' }))
  await click(s, s.locator('#appt-time')); await s.locator('#appt-time').fill('10:30'); await sleep(400)
  await typeInto(s, s.locator('#status-msg'), STAFF_APPROVE_MSG, 22)
  await click(s, s.getByRole('button', { name: 'Confirm' }))
  await s.locator('[role=status]').filter({ hasText: 'Status changed' }).waitFor()
  rec.ev('success')
  await cap(s, '@', 'Patient emailed automatically', 'Status + time + message, delivered')
  await sleep(1800)
  await typeInto(s, s.locator('textarea[aria-label="Message to patient"]'), STAFF_EXTRA_MSG, 22)
  await click(s, s.getByRole('button', { name: 'Send message' }))
  await s.locator('[role=status]').filter({ hasText: 'Message sent' }).waitFor()
  rec.ev('success')
  await sleep(500)
  await s.locator('ol').last().scrollIntoViewIfNeeded()
  await cap(s, '✓', 'Every step is logged', 'Who did what, and when')
  await sleep(2600)
  await rec.stop()

  // ================= PATIENT RESULT =================
  await p.goto(statusLink, { waitUntil: 'networkidle' })
  await p.mouse.move(1200, 260)
  await rec.start(p, 'patient-result')
  await cap(p, '3', "Back on Sam's screen…", 'Confirmed time + notes from the clinic')
  await sleep(1400)
  await zoom(p, 'Your appointment', 1.5)
  rec.ev('ding')
  await sleep(2600)
  await unzoom(p); await sleep(800)
  await p.evaluate(() => window.scrollTo({ top: 520, behavior: 'smooth' }))
  await cap(p, '☺', 'Clear, friendly, human', 'And yes, the cat is mostly friendly.')
  await sleep(3200)
  await rec.stop()

  await card(browser, 'outro', 6.5)
  await browser.close()
  const meta = rec.save()
  console.log('reference', ref)
  for (const m of meta) console.log(m.name.padEnd(18), `${m.duration.toFixed(1)}s`.padStart(7), `${m.frames} frames`, m.events.length, 'events')
})().catch((e) => { console.error('RECORDING FAILED', e); process.exit(1) })
