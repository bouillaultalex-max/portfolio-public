# Démonstrations JARVIS — capture et rendu reproductibles

Ce dossier produit les vidéos `public/demos/jarvis-demo-*.mp4` du portfolio. Il ne fait pas partie du build du site : ses dépendances s'installent à part.

## Principe : aucune sortie fabriquée

1. **Capture** (`capture.cjs`) : chaque commande est **réellement exécutée** dans une copie isolée de JARVIS.
   - Une fonction shell `jarvis` est définie dans le bash qui l'exécute.
   - Les sorties sont enregistrées **telles quelles**, horodatées, dans `sessions/*.json`.
   - Le script refuse de s'exécuter si la copie de JARVIS a des modifications locales.
   - Il retire de l'environnement toute variable de type clé, secret ou jeton.
   - Il écrit les fiches projet dans un répertoire temporaire.
   - Il vérifie l'absence de nom d'utilisateur, de chemin personnel ou de secret dans les sorties.
2. **Rendu** (`render.cjs` + `player.html`) : les sorties capturées sont rejouées dans l'émulateur de terminal [xterm.js](https://xtermjs.org/), puis encodées image par image (MP4 H.264, WebM VP9, poster WebP).
   - Le rendu ajoute seulement des **légendes et des cartons hors du terminal**, la **frappe animée** des commandes et l'**écho** de la saisie `oui`/`non` envoyée sur l'entrée standard (affiché en jaune).
   - Les attentes réelles entre deux sorties sont plafonnées à 0,9 s. Sur les sessions du 24/10/2026, l'écart maximal mesuré est de 0,76 s : **aucune attente n'a été raccourcie**.

Le contrôle d'authenticité consiste à relancer la capture et à comparer les sorties : elles doivent être identiques, aux horodatages près. Ce contrôle a été fait le 24/10/2026.

## Procédure sous Windows

Prérequis : Node.js 24, Git for Windows (bash), Google Chrome.

```bash
# 1. Copie isolée de JARVIS, hors de tout dépôt de travail
git clone https://github.com/bouillaultalex-max/Jarvis.git jarvis-demo-clone
cd jarvis-demo-clone && git checkout fdcd940 && npm ci --ignore-scripts && cd ..

# 2. Outils d'enregistrement (dans ce dossier)
cd tools/demos
npm install

# 3. Capture des sessions réelles (sessions/*.json)
JARVIS_CLONE=/chemin/vers/jarvis-demo-clone npm run capture

# 4. Rendu des vidéos FR et EN (out/, non versionné) — environ 3 minutes par vidéo
npm run durations   # contrôle des durées : 45 à 60 s
npm run render

# 5. Contrôle visuel, puis copie dans le site
cp out/demo-a-verify-fr.mp4 ../../public/demos/jarvis-demo-a-verify-fr.mp4   # etc.
```

Variables utiles :

- `SESSIONS_DIR` : capture vers un autre dossier (par exemple pour le contrôle d'authenticité) ;
- `CHROME_PATH` : chemin de Chrome s'il n'est pas à l'emplacement par défaut.

**Ne jamais** lancer la capture avec de vraies variables Gmail, Anthropic, Légifrance ou WhatsApp. Le script les filtre, mais la prudence reste de mise.

## Storyboards

| Démo | Durée | Étapes |
| --- | --- | --- |
| A — Exécution et vérification | 45 s | Carton (mission simulée) → `verify-demo` confirmé : « executed » puis verdict « satisfied » → même commande refusée : « zéro effet », code 1 → carton « ce qui est réel / simulé » |
| B — Du besoin à la décision validée | 59 s | Carton (projet fictif) → fiche → source + besoin relié → fait + hypothèse → décision + justification → validation → tentative de modification refusée (`invalid_transition`, code 1) → `show` : révision 8 inchangée → carton |

Format : 1280 × 720, 30 images/s, sans piste audio. **Publié : MP4 (H.264, `+faststart`)**, lisible par tous les navigateurs, et poster WebP. Le rendu produit aussi un WebM (VP9), non publié car il n'est pas plus léger ici. Les sorties de JARVIS restent en français dans les deux versions ; la version EN le signale.
