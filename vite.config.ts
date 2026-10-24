import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { invalidContactEntries, readContactConfig } from './src/lib/contact.ts'

// Refuse de construire le site si une coordonnée est renseignée mais invalide,
// ou si le CV configuré n'existe pas dans public/ : jamais de lien cassé en ligne.
function contactGuard(mode: string): Plugin {
  return {
    name: 'contact-guard',
    configResolved() {
      const env = loadEnv(mode, process.cwd(), 'VITE_')
      const invalid = invalidContactEntries(env)
      if (invalid.length) throw new Error(`Coordonnées invalides dans .env : ${invalid.join(', ')} (voir .env.example).`)
      const { cv } = readContactConfig(env)
      for (const path of [cv.fr, cv.en]) {
        if (path && !existsSync(resolve('public', path.slice(1)))) throw new Error(`CV introuvable : public${path}`)
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), contactGuard(mode)],
}))
