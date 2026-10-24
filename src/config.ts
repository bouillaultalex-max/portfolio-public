import { readContactConfig } from './lib/contact.ts'

// Seul point de lecture des variables d'environnement du site.
// Les variables VITE_* sont publiques après compilation : n'y placer que des valeurs validées pour diffusion.
export const contact = readContactConfig(import.meta.env)

// Pas de lien vers le profil GitHub : il donne accès à des dépôts non destinés au portfolio.
