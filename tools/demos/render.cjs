// Rejoue une session capturée (sessions/*.json) dans xterm.js et encode la vidéo.
// Les sorties du terminal proviennent EXCLUSIVEMENT de la capture : aucun texte de sortie
// n'est écrit à la main ici. Seuls les légendes et les cartons sont ajoutés, hors terminal.
const puppeteer = require('puppeteer-core')
const ffmpeg = require('ffmpeg-static')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const FPS = 30
const TYPE_MS = 22          // frappe animée de la commande (par caractère)
const MAX_GAP = 900         // attente réelle plafonnée entre deux fragments de sortie
const OUT = path.join(__dirname, 'out')
fs.mkdirSync(OUT, { recursive: true })

const PROMPT = '\x1b[36m~/jarvis\x1b[0m \x1b[90m$\x1b[0m '
const card = (eyebrow, title, paras = [], bullets = [], note = '') =>
  `<div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${paras.map(p => `<p>${p}</p>`).join('')}` +
  (bullets.length ? `<ul>${bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '') + (note ? `<div class="note">${note}</div>` : '')

const COMMON = {
  fr: { brand: 'JARVIS · démonstration', badge: 'Session réelle · données fictives', foot: 'Enregistré le 24/10/2026 · JARVIS commit fdcd940', footRight: 'Sans voix off',
    note: '« jarvis » = fonction shell appelant <code>tsx apps/desktop/src/main.ts</code> · sorties réelles non modifiées · frappe animée, attentes plafonnées à 0,9 s' },
  en: { brand: 'JARVIS · demo', badge: 'Real session · fictional data', foot: 'Recorded on 2026-10-24 · JARVIS commit fdcd940', footRight: 'No voice-over',
    note: '“jarvis” = shell function calling <code>tsx apps/desktop/src/main.ts</code> · real, unedited output · animated typing, waits capped at 0.9 s' },
}

const STORY = {
  'demo-a-verify': {
    timing: { intro: 7000, before: 1800, outro: 10000, type: 22 },
    termTitle: { fr: 'verify-demo — client e-mail simulé en mémoire', en: 'verify-demo — in-memory simulated mail client' },
    fr: {
      intro: card('Démo A · exécution et vérification', 'Agir, puis <span>vérifier</span>.',
        ['Mission simulée : envoyer un message de démonstration.', 'JARVIS demande une confirmation, exécute l’action, puis vérifie le résultat.'],
        [], 'Client e-mail simulé en mémoire : aucun service externe n’est appelé.'),
      steps: [
        { before: { chip: '1 · AUTORISÉE', tone: 'ok', text: 'L’utilisateur confirme l’envoi simulé (« oui »).' },
          after: { chip: '2 · VERIFY', tone: 'verify', text: 'Verdict « satisfied » : le résultat est observé dans le client simulé, distinct du statut « executed ».' }, hold: 9000 },
        { before: { chip: '3 · REFUSÉE', tone: 'deny', text: 'Même demande, l’utilisateur répond « non ».' },
          after: { chip: '4 · AUCUN EFFET', tone: 'deny', text: 'Rien n’est exécuté : « zéro effet », code de sortie 1.' }, hold: 7500 },
      ],
      outro: card('Ce que montre cette démo', 'Ce qui est <span>réel</span>, ce qui ne l’est pas',
        [], ['Réel : le code de JARVIS, la confirmation, le verdict de vérification et les codes de sortie.',
          'Simulé : le client e-mail (en mémoire, jetable) et le destinataire demo@example.test.',
          'Limite : aucun envoi Gmail réel n’est démontré ici.'], COMMON.fr.note),
    },
    en: {
      intro: card('Demo A · execution and verification', 'Act, then <span>verify</span>.',
        ['Simulated mission: send a demo message.', 'JARVIS asks for confirmation, executes the action, then verifies the outcome.'],
        [], 'In-memory simulated mail client: no external service is called. Terminal output is in French.'),
      steps: [
        { before: { chip: '1 · ALLOWED', tone: 'ok', text: 'The user confirms the simulated send (“oui” = yes).' },
          after: { chip: '2 · VERIFY', tone: 'verify', text: '“satisfied” verdict: the outcome is observed in the simulated client, separate from the “executed” status.' }, hold: 9000 },
        { before: { chip: '3 · REFUSED', tone: 'deny', text: 'Same request, the user answers “non” (no).' },
          after: { chip: '4 · NO EFFECT', tone: 'deny', text: 'Nothing runs: “zéro effet” (zero effect), exit code 1.' }, hold: 7500 },
      ],
      outro: card('What this demo shows', 'What is <span>real</span>, what is not',
        [], ['Real: JARVIS code, the confirmation, the verification verdict and exit codes.',
          'Simulated: the mail client (in memory, disposable) and the recipient demo@example.test.',
          'Limitation: no real Gmail send is demonstrated here.'], COMMON.en.note),
    },
  },
  'demo-b-product': {
    timing: { intro: 5500, before: 1000, outro: 8500, type: 11 },
    termTitle: { fr: 'project — fiche de cadrage produit (projet fictif)', en: 'project — product scoping brief (fictional project)' },
    fr: {
      intro: card('Démo B · product building', 'Du besoin à la <span>décision validée</span>.',
        ['Projet fictif : un atelier vélo veut proposer la réservation en ligne.', 'JARVIS sépare sources, besoins, faits, hypothèses et décisions — puis protège ce qui est validé.'],
        [], 'Règles déterministes, aucun appel à un modèle de langage, aucune donnée réelle.'),
      steps: [
        { before: { chip: '1 · FICHE', text: 'Créer une fiche projet fictive.' }, hold: 600 },
        { before: { chip: '2 · BESOIN', text: 'Déclarer une source, puis un besoin utilisateur relié à cette source.' }, hold: 500 },
        { hold: 800 },
        { before: { chip: '3 · FAITS', text: 'Distinguer un fait d’une hypothèse.' }, hold: 500 },
        { hold: 700 },
        { before: { chip: '4 · DÉCISION', text: 'Formaliser une décision, puis la justifier par un fait.' }, hold: 500 },
        { hold: 800 },
        { before: { chip: '5 · VALIDATION', tone: 'ok', text: 'Valider la décision : statut « validated ».' }, hold: 1800 },
        { before: { chip: '6 · CONTRÔLE', tone: 'deny', text: 'Tentative : modifier la justification après validation.' },
          after: { chip: '6 · REFUSÉ', tone: 'deny', text: 'Refus « invalid_transition » : une décision validée ne peut plus être modifiée.' }, hold: 3600 },
        { before: { chip: '7 · INCHANGÉ', tone: 'verify', text: 'La fiche n’a pas bougé : toujours la révision 8.' }, hold: 4200 },
      ],
      outro: card('Ce que montre cette démo', 'Une trace de cadrage <span>fiable</span>',
        [], ['Réel : les commandes de JARVIS, la persistance de la fiche et le refus « invalid_transition ».',
          'Fictif : le projet, la source, le besoin, le fait et l’hypothèse.',
          'Limite : les sources sont déclarées, jamais vérifiées par JARVIS ; aucun usage par des tiers.'], COMMON.fr.note),
    },
    en: {
      intro: card('Demo B · product building', 'From need to <span>validated decision</span>.',
        ['Fictional project: a bike workshop wants to offer online booking.', 'JARVIS separates sources, needs, facts, assumptions and decisions — then protects what has been validated.'],
        [], 'Deterministic rules, no language-model call, no real data. Terminal output is in French.'),
      steps: [
        { before: { chip: '1 · BRIEF', text: 'Create a fictional project brief.' }, hold: 600 },
        { before: { chip: '2 · NEED', text: 'Declare a source, then a user need linked to that source.' }, hold: 500 },
        { hold: 800 },
        { before: { chip: '3 · FACTS', text: 'Keep a fact apart from an assumption.' }, hold: 500 },
        { hold: 700 },
        { before: { chip: '4 · DECISION', text: 'Record a decision, then justify it with a fact.' }, hold: 500 },
        { hold: 800 },
        { before: { chip: '5 · VALIDATION', tone: 'ok', text: 'Validate the decision: status “validated”.' }, hold: 1800 },
        { before: { chip: '6 · CONTROL', tone: 'deny', text: 'Attempt: change the justification after validation.' },
          after: { chip: '6 · REFUSED', tone: 'deny', text: '“invalid_transition” refusal: a validated decision can no longer be changed.' }, hold: 3600 },
        { before: { chip: '7 · UNCHANGED', tone: 'verify', text: 'The brief did not change: still revision 8.' }, hold: 4200 },
      ],
      outro: card('What this demo shows', 'A <span>reliable</span> scoping trail',
        [], ['Real: JARVIS commands, brief persistence and the “invalid_transition” refusal.',
          'Fictional: the project, source, need, fact and assumption.',
          'Limitation: sources are declared, never verified by JARVIS; no third-party usage.'], COMMON.en.note),
    },
  },
}

function buildTimeline(session, story, timing) {
  const tl = []
  let t = 0
  const push = (ev) => tl.push({ t: Math.round(t), ...ev })
  push({ type: 'card', html: story.intro }); t += timing.intro
  push({ type: 'card', html: null })
  push({ type: 'write', data: PROMPT }); t += 500
  session.steps.forEach((step, i) => {
    const sb = story.steps[i] || {}
    if (sb.before) { push({ type: 'caption', ...sb.before }); t += timing.before }
    for (const ch of step.cmd) { push({ type: 'write', data: ch }); t += timing.type ?? TYPE_MS }
    t += 250; push({ type: 'write', data: '\r\n' })
    let last = 0
    for (const c of step.chunks) {
      t += Math.min(c.t - last, MAX_GAP); last = c.t
      if (c.stream === 'stdin') {
        t += 500
        for (const ch of c.text) { push({ type: 'write', data: '\x1b[33m' + ch + '\x1b[0m' }); t += 120 }
        t += 250; push({ type: 'write', data: '\r\n' })
      } else push({ type: 'write', data: c.text.replace(/\r?\n/g, '\r\n') })
    }
    t += 300
    if (sb.after) { push({ type: 'caption', ...sb.after }) }
    t += sb.hold ?? 1200
    push({ type: 'write', data: PROMPT }); t += 300
  })
  t += 600
  push({ type: 'card', html: story.outro }); t += timing.outro
  push({ type: 'end' })
  return { timeline: tl, durationMs: t }
}

async function render(page, name, lang) {
  const session = JSON.parse(fs.readFileSync(path.join(__dirname, 'sessions', name + '.json'), 'utf8'))
  if (!session.privacyCheck.ok) throw new Error('Contrôle de confidentialité échoué : ' + name)
  const story = STORY[name][lang]
  const { timeline, durationMs } = buildTimeline(session, story, STORY[name].timing)
  await page.goto('file:///' + path.join(__dirname, 'player.html').replace(/\\/g, '/'))
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate((cfg) => window.setup(cfg), {
    static: { brand: COMMON[lang].brand, badge: COMMON[lang].badge, footLeft: COMMON[lang].foot, footRight: COMMON[lang].footRight, termTitle: STORY[name].termTitle[lang], captionText: '', chip: '' },
    timeline,
  })
  const base = path.join(OUT, `${name}-${lang}`)
  const enc = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', base + '.mp4'])
  const frames = Math.ceil(durationMs / 1000 * FPS)
  let posterSaved = false
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.advanceTo(t), f * 1000 / FPS)
    const buf = await page.screenshot({ type: 'png' })
    if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r))
    if (!posterSaved && f === Math.round(2.5 * FPS)) { fs.writeFileSync(base + '-poster.png', buf); posterSaved = true }
  }
  enc.stdin.end()
  await new Promise((res, rej) => enc.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))))
  // Version WebM (VP9) pour les navigateurs qui la préfèrent ; poster WebP léger.
  await new Promise((res, rej) => spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', base + '.mp4', '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', '-an', base + '.webm']).on('close', c => c === 0 ? res() : rej(new Error('vp9 ' + c))))
  await new Promise((res, rej) => spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', base + '-poster.png', '-c:v', 'libwebp', '-quality', '82', base + '-poster.webp']).on('close', c => c === 0 ? res() : rej(new Error('webp ' + c))))
  fs.rmSync(base + '-poster.png')
  const size = (p) => (fs.statSync(p).size / 1024 / 1024).toFixed(2) + ' Mo'
  console.log(`${name}-${lang} : ${(durationMs / 1000).toFixed(1)} s, ${frames} images — mp4 ${size(base + '.mp4')}, webm ${size(base + '.webm')}, poster ${size(base + '-poster.webp')}`)
}

;(async () => {
  if (process.argv.includes('--dry')) {
    for (const name of Object.keys(STORY)) for (const lang of ['fr', 'en']) {
      const session = JSON.parse(fs.readFileSync(path.join(__dirname, 'sessions', name + '.json'), 'utf8'))
      console.log(name, lang, (buildTimeline(session, STORY[name][lang], STORY[name].timing).durationMs / 1000).toFixed(1) + ' s')
    }
    return
  }
  const only = process.argv.slice(2)
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 })
  for (const name of Object.keys(STORY)) for (const lang of ['fr', 'en']) {
    if (only.length && !only.includes(`${name}-${lang}`)) continue
    await render(page, name, lang)
  }
  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })
