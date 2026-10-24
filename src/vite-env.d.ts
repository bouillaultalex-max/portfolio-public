/// <reference types="vite/client" />

// Coordonnées publiques facultatives (voir .env.example et src/lib/contact.ts).
interface ImportMetaEnv {
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_LINKEDIN_URL?: string
  readonly VITE_CV_URL_FR?: string
  readonly VITE_CV_URL_EN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
