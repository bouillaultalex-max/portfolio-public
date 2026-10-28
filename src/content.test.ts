import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { cases, copy } from './content.ts'

// Forme d'une valeur : mêmes clés et mêmes longueurs de tableaux, textes ignorés.
const shape = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(shape)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, shape(v)]))
  return typeof value
}

test('FR/EN : les textes de l’interface ont exactement la même structure', () => {
  assert.deepEqual(shape(copy.en), shape(copy.fr))
})

test('FR/EN : chaque texte localisé des études de cas existe dans les deux langues, non vide', () => {
  const walk = (value: unknown, path: string) => {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`))
    if (!value || typeof value !== 'object') return
    const obj = value as Record<string, unknown>
    if ('fr' in obj && 'en' in obj) {
      assert.deepEqual(shape(obj.en), shape(obj.fr), `structure FR/EN différente : ${path}`)
      for (const lang of ['fr', 'en'] as const) {
        const v = obj[lang]
        if (typeof v === 'string') assert.ok(v.trim(), `texte vide : ${path}.${lang}`)
        if (Array.isArray(v)) v.forEach((s, i) => assert.ok(String(s).trim(), `texte vide : ${path}.${lang}[${i}]`))
      }
      return
    }
    for (const [k, v] of Object.entries(obj)) walk(v, `${path}.${k}`)
  }
  cases.forEach(item => walk(item, item.id))
})

test('vidéos : chaque démo filmée a ses fichiers MP4 et poster dans les deux langues', () => {
  const videos = cases.flatMap(item => item.demos).filter(demo => demo.video)
  assert.ok(videos.length > 0)
  for (const demo of videos) {
    assert.equal(demo.filmed, true)
    for (const lang of ['fr', 'en']) {
      for (const file of [`public/demos/${demo.video!.file}-${lang}.mp4`, `public/demos/${demo.video!.file}-${lang}-poster.webp`]) {
        assert.ok(existsSync(file), `fichier manquant : ${file}`)
        assert.ok(statSync(file).size < 3 * 1024 * 1024, `fichier trop lourd (> 3 Mo) : ${file}`)
      }
    }
  }
})

test('confidentialité : aucun lien vers le dépôt MES et aucun lien non HTTPS', () => {
  const text = JSON.stringify(cases) + JSON.stringify(copy)
  assert.doesNotMatch(text, /lca-platform/i)
  const mes = cases.find(item => item.id === 'mes')!
  assert.equal(mes.repoUrl, undefined)
  assert.equal(mes.statusSource, undefined)
  for (const url of text.match(/https?:\/\/[^\s"']+/g) ?? []) assert.ok(url.startsWith('https://'), url)
})

test('confidentialité : aucun lien vers le profil GitHub (il expose des dépôts hors portfolio)', () => {
  for (const file of ['src/App.tsx', 'src/config.ts', 'src/content.ts', 'index.html']) {
    // Seuls les liens vers des dépôts précis (ex. JARVIS) sont autorisés, jamais la racine du profil.
    assert.doesNotMatch(readFileSync(file, 'utf8'), /github\.com\/bouillaultalex-max\/?["'`]/, file)
  }
})
