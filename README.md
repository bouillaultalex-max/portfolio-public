# Alexandre Bouillault — Portfolio Product Builder IA

Site portfolio bilingue (FR/EN) orienté recrutement : Product Builder IA, AI Builder, Product Owner IA.

**Stack :** React 19, TypeScript, Vite 7, Tailwind CSS 4 et CSS personnalisé. Site statique : aucune API ni base de données.

## Démarrage en local

Prérequis : Node.js 22.12+ (24 recommandé pour les tests), npm.

```bash
npm install
npm run dev        # serveur de développement
npm run check      # typage TypeScript
npm test           # tests (validation des coordonnées, parité FR/EN, médias des démos)
npm run build      # build de production dans dist/
npm run preview    # prévisualisation du build
```

## Coordonnées, CV et LinkedIn

Copier `.env.example` en `.env.local` (non versionné) et renseigner les valeurs **validées pour diffusion** :

| Variable | Effet | Format |
| --- | --- | --- |
| `VITE_CONTACT_EMAIL` | Bouton « Me contacter » / « Contact me » | adresse e-mail |
| `VITE_LINKEDIN_URL` | Bouton LinkedIn | `https://www.linkedin.com/in/…` |
| `VITE_CV_URL_FR` / `VITE_CV_URL_EN` | Bouton « Télécharger mon CV » (accueil et contact) | `/cv/nom.pdf`, fichier placé dans `public/cv/` |

- Une variable vide **masque** l'élément correspondant.
- Une valeur renseignée mais invalide, ou un CV introuvable, **fait échouer le build** : aucun lien cassé n'est mis en ligne.
- Si le CV n'existe que dans une langue, il est proposé dans les deux, avec la mention de sa langue.
- Les variables `VITE_*` sont publiques après compilation : jamais de secret ni de clé API.

## Architecture

- `src/App.tsx` : sections, navigation bilingue (`?lang=fr|en`, choix mémorisé, sinon langue du navigateur), études de cas en fenêtre modale, démonstrations vidéo.
- `src/content.ts` : contenus FR/EN et études de cas (statuts Implémenté / Testé / Non livré, décisions, démonstrations).
- `src/config.ts` et `src/lib/contact.ts` : lecture et validation des coordonnées publiques.
- `src/style.css` : design system, responsive de 320 px à l'écran large, animations réduites si l'utilisateur le demande.
- `public/demos/` : vidéos des démonstrations JARVIS (MP4 sans son, posters WebP), chargées seulement à la demande.
- `tools/demos/` : capture et rendu reproductibles de ces vidéos (voir son README).

## Démonstrations vidéo

Les vidéos de JARVIS montrent des **commandes réellement exécutées** sur une copie isolée du projet. Les sorties sont enregistrées sans modification puis rejouées dans un émulateur de terminal (xterm.js). Les actions externes sont simulées : client e-mail en mémoire, données fictives. La méthode, les scripts et les sessions brutes sont dans `tools/demos/`.

## Honnêteté des contenus

- Chaque étude de cas sépare ce qui est implémenté, ce qui est testé (avec sa date) et ce qui n'est pas livré.
- Aucun chiffre d'usage ni gain de productivité non mesuré n'est revendiqué.
- Les illustrations des cartes de projet sont des schémas conceptuels, signalés comme tels.
- Les démonstrations n'utilisent que des données fictives.

## Licence

Projet personnel : contenu et identité visuelle non librement réutilisables sans permission. Les outils et dépendances conservent leurs licences propres.

## CV Product Builder IA et déploiement

Le CV français d’origine est conservé dans `public/cv/cv-alexandre-bouillault-product-builder-ia-fr.pdf`. Il est proposé sur les pages FR et EN ; la page EN indique « French version ».

Dans Vercel, définir `VITE_CV_URL_FR=/cv/cv-alexandre-bouillault-product-builder-ia-fr.pdf` et laisser `VITE_CV_URL_EN` vide (supprimer toute ancienne valeur EN), puis reconstruire le site. Les variables VITE_ sont intégrées à la compilation. Le PDF doit être inclus dans la copie filtrée déployée ; `.env.local` reste local et hors Git. Les anciens PDF ne sont pas utilisés par cette configuration.

La publication continue de passer par la copie filtrée existante ; aucune publication depuis le dépôt de travail.
