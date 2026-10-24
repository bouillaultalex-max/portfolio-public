// Validation des coordonnées publiques. Module pur (sans import.meta.env) pour être
// utilisable par le site, par vite.config.ts et par les tests Node.
// Règle : une valeur absente ou invalide n'est jamais affichée.

export type ContactConfig = {
  email: string | null
  linkedin: string | null
  cv: { fr: string | null, en: string | null }
}

export type RawContactEnv = {
  VITE_CONTACT_EMAIL?: string
  VITE_LINKEDIN_URL?: string
  VITE_CV_URL_FR?: string
  VITE_CV_URL_EN?: string
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/
const LINKEDIN = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]{3,100}\/?$/
// Le CV doit être un fichier PDF servi par le site lui-même (public/cv/).
const CV_PATH = /^\/cv\/[a-z0-9][a-z0-9-]{0,80}\.pdf$/

const clean = (value: string | undefined) => value?.trim() || null

export const validEmail = (value: string | undefined) => {
  const v = clean(value)
  return v && EMAIL.test(v) ? v : null
}

export const validLinkedIn = (value: string | undefined) => {
  const v = clean(value)
  return v && LINKEDIN.test(v) ? v : null
}

export const validCvPath = (value: string | undefined) => {
  const v = clean(value)
  return v && CV_PATH.test(v) ? v : null
}

export function readContactConfig(env: RawContactEnv): ContactConfig {
  return {
    email: validEmail(env.VITE_CONTACT_EMAIL),
    linkedin: validLinkedIn(env.VITE_LINKEDIN_URL),
    cv: { fr: validCvPath(env.VITE_CV_URL_FR), en: validCvPath(env.VITE_CV_URL_EN) },
  }
}

// Valeurs renseignées mais rejetées : signalées au build plutôt qu'ignorées en silence.
export function invalidContactEntries(env: RawContactEnv): string[] {
  const checks: [keyof RawContactEnv, (v: string | undefined) => string | null][] = [
    ['VITE_CONTACT_EMAIL', validEmail], ['VITE_LINKEDIN_URL', validLinkedIn],
    ['VITE_CV_URL_FR', validCvPath], ['VITE_CV_URL_EN', validCvPath],
  ]
  return checks.filter(([key, check]) => clean(env[key]) && !check(env[key])).map(([key]) => key)
}

// CV dans la langue demandée, sinon dans l'autre langue (signalée par `otherLanguage`).
export function cvFor(config: ContactConfig, locale: 'fr' | 'en') {
  const own = config.cv[locale]
  if (own) return { href: own, otherLanguage: false }
  const other = config.cv[locale === 'fr' ? 'en' : 'fr']
  return other ? { href: other, otherLanguage: true } : null
}
