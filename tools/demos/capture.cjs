// Capture une VRAIE session JARVIS : chaque commande est réellement exécutée dans la
// copie isolée (clone GitHub dédié). Les sorties sont enregistrées telles quelles,
// horodatées, sans aucune modification. Le rendu vidéo ne fait que les rejouer.
const { spawn, execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// JARVIS_CLONE : copie isolée et propre du dépôt JARVIS (clone dédié, dépendances installées).
const CLONE = process.env.JARVIS_CLONE
if (!CLONE) throw new Error('Définir JARVIS_CLONE (chemin d’un clone isolé de JARVIS).')
const BRIEFS = fs.mkdtempSync(path.join(require('os').tmpdir(), 'jarvis-demo-briefs-'))
const OUT = process.env.SESSIONS_DIR || path.join(__dirname, 'sessions')
fs.mkdirSync(OUT, { recursive: true })

// La fonction shell « jarvis » est réellement définie dans le bash qui exécute la commande.
const PRELUDE = 'jarvis() { node_modules/.bin/tsx apps/desktop/src/main.ts "$@"; }; '

// Environnement minimal : aucune variable contenant clé, secret ou jeton n'est transmise.
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/KEY|SECRET|TOKEN|PASSWORD|GMAIL|ANTHROPIC|OPENAI|LEGIFRANCE|WHATSAPP/i.test(k)))
env.JARVIS_PROJECT_BRIEFS_DIR = BRIEFS
env.FORCE_COLOR = '0'
env.NO_COLOR = '1'

function run(cmd, input) {
  return new Promise(resolve => {
    const t0 = Date.now()
    const chunks = []
    const child = spawn('bash', ['-c', PRELUDE + cmd], { cwd: CLONE, env })
    let sent = false
    const onData = (stream) => (buf) => {
      const text = buf.toString('utf8')
      chunks.push({ t: Date.now() - t0, stream, text })
      if (input && !sent && /\[y\/N\]\s*$/.test(chunks.map(c => c.text).join(''))) {
        sent = true
        chunks.push({ t: Date.now() - t0, stream: 'stdin', text: input })
        child.stdin.write(input + '\n')
        child.stdin.end()
      }
    }
    child.stdout.on('data', onData('stdout'))
    child.stderr.on('data', onData('stderr'))
    if (!input) child.stdin.end()
    child.on('close', code => resolve({ cmd, input: input ?? null, exitCode: code, durationMs: Date.now() - t0, chunks }))
  })
}

const scenarios = {
  'demo-a-verify': [
    { cmd: 'jarvis verify-demo; echo "exit code: $?"', input: 'oui' },
    { cmd: 'jarvis verify-demo; echo "exit code: $?"', input: 'non' },
  ],
  'demo-b-product': [
    { cmd: 'jarvis project create atelier-velo "Atelier vélo — réservation"' },
    { cmd: 'jarvis project add-source atelier-velo "Entretien fictif avec un gérant"' },
    { cmd: 'jarvis project add-need atelier-velo "Réserver une réparation sans appeler" --source src-1' },
    { cmd: 'jarvis project add-fact atelier-velo "Les appels interrompent les réparations"' },
    { cmd: 'jarvis project add-hypothesis atelier-velo "Les clients réservent surtout le soir"' },
    { cmd: 'jarvis project add-decision atelier-velo "Prototype : réservation en ligne"' },
    { cmd: 'jarvis project justify-decision atelier-velo dec-1 fact-1' },
    { cmd: 'jarvis project validate-decision atelier-velo dec-1' },
    { cmd: 'jarvis project justify-decision atelier-velo dec-1 hyp-1; echo "exit code: $?"' },
    { cmd: 'jarvis project show atelier-velo' },
  ],
}

;(async () => {
  const commit = execFileSync('git', ['-C', CLONE, 'rev-parse', '--short', 'HEAD']).toString().trim()
  const dirty = execFileSync('git', ['-C', CLONE, 'status', '--porcelain']).toString().trim()
  if (dirty) throw new Error('La copie isolée de JARVIS a des modifications locales : arrêt.')
  for (const [name, steps] of Object.entries(scenarios)) {
    fs.rmSync(BRIEFS, { recursive: true, force: true })
    const results = []
    for (const step of steps) results.push(await run(step.cmd, step.input))
    const session = {
      name, recordedAt: new Date().toISOString(), jarvisCommit: commit, node: process.version,
      shellFunction: PRELUDE.trim(), briefsDirIsTemporary: true, steps: results,
    }
    // Contrôle de confidentialité : aucun nom d'utilisateur, chemin personnel ni secret dans les sorties.
    const outputs = results.flatMap(r => r.chunks.map(c => c.text)).join('').toLowerCase()
    const user = require('os').userInfo().username.toLowerCase()
    const leaks = [['<nom d’utilisateur>', user], ['C:\\', 'c:\\'], ['/c/Users', '/c/users'], ['AppData', 'appdata'], ['@gmail', '@gmail'], ['sk-', 'sk-ant']]
      .filter(([, token]) => outputs.includes(token)).map(([label]) => label)
    session.privacyCheck = leaks.length ? { ok: false, leaks } : { ok: true }
    fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(session, null, 2))
    console.log(`${name}: ${results.length} commandes, codes de sortie [${results.map(r => r.exitCode).join(', ')}], confidentialité ${session.privacyCheck.ok ? 'OK' : 'FUITE ' + leaks.join(', ')}`)
  }
  const after = execFileSync('git', ['-C', CLONE, 'status', '--porcelain']).toString().trim()
  console.log('copie JARVIS inchangée après capture :', after === '', '— commit', commit)
})()
