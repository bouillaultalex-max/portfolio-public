export type Locale = 'fr' | 'en'
export type StatusKey = 'built' | 'tested' | 'planned'

export const statusKeys: StatusKey[] = ['built', 'tested', 'planned']
// Date à laquelle les statuts ci-dessous ont été vérifiés dans les PROJECT_STATE.md des dépôts.
export const statusCheckedOn = '2026-10-24'

type Localized = Record<Locale, string>

export type DecisionCategory = 'security' | 'reliability' | 'scope' | 'transparency' | 'user' | 'business' | 'data'
export type Decision = { category: DecisionCategory, text: Localized, trace?: { label: string, url: string } }
export type UserNeed = { who: Localized, need: Localized }
// runnable : exécutée et vérifiée ; online : consultable en ligne ; preparing : pas encore réalisable publiquement.
// video : fichiers public/demos/{file}-{fr|en}.mp4 et {file}-{fr|en}-poster.webp, à n'ajouter qu'une fois enregistrés et contrôlés.
export type Demo = {
  title: Localized, detail: Localized, objective?: Localized, limits?: Localized, steps?: Record<Locale, string[]>,
  state: 'runnable' | 'online' | 'preparing', filmed: boolean, link?: string,
  video?: { file: string, duration: Localized },
}

export type CaseStudy = {
  id: string
  number: string
  title: string
  category: Record<Locale, string>
  stage: Record<Locale, string>
  description: Record<Locale, string>
  highlights: Record<Locale, string[]>
  problem: Record<Locale, string>
  role: Record<Locale, string>
  users: UserNeed[]
  usersNote?: Localized
  decisions: Decision[]
  demos: Demo[]
  status: Record<StatusKey, Record<Locale, string[]>>
  // Absent pour LCA-MES : aucun lien vers ce dépôt n'est affiché (confidentialité).
  statusSource?: string
  proof: Record<Locale, string>
  limit: Record<Locale, string>
  tags: string[]
  repoUrl?: string
}


export const cases: CaseStudy[] = [
  {
    id: 'jarvis',
    number: '01',
    title: 'JARVIS',
    category: { fr: 'Agents IA · Orchestration', en: 'AI Agents · Orchestration' },
    stage: { fr: 'Prototype personnel · non livré', en: 'Personal prototype · not released' },
    description: {
      fr: 'Un assistant personnel orienté missions qui explore la coordination d’agents, les permissions, les outils et la vérification des résultats.',
      en: 'A mission-driven personal assistant exploring agent coordination, permissions, tools and outcome verification.',
    },
    highlights: {
      fr: ['Permissions refusées par défaut, confirmation explicite', 'Vérification du résultat démontrée sur un envoi simulé', '3 298 tests · CI Linux verte · 61 échecs sous Windows'],
      en: ['Deny-by-default permissions, explicit confirmation', 'Outcome verification demonstrated on a simulated send', '3,298 tests · Linux CI passing · 61 failures on Windows'],
    },
    problem: {
      fr: 'Les assistants IA peuvent produire une réponse convaincante sans démontrer que l’action demandée a réellement réussi, ni qu’elle était autorisée.',
      en: 'AI assistants can produce a convincing answer without proving that the requested action actually succeeded, or that it was authorized.',
    },
    role: {
      fr: 'J’ai cadré les besoins, défini les fonctionnalités, priorisé la roadmap et piloté leur implémentation avec l’assistance de Claude Code. Les vérifications documentées sont des tests automatisés et des essais sur données simulées : JARVIS est mon assistant personnel, il n’a pas d’utilisateurs externes.',
      en: 'I scoped the needs, defined the features, prioritized the roadmap and led their implementation with Claude Code’s assistance. The documented checks are automated tests and trials on simulated data: JARVIS is my personal assistant and has no external users.',
    },
    users: [
      {
        who: { fr: 'Moi, au quotidien', en: 'Myself, day to day' },
        need: {
          fr: 'Trier et résumer ma boîte de réception, préparer une réponse, et ne rien envoyer sans mon accord explicite.',
          en: 'Triage and summarize my inbox, draft a reply, and send nothing without my explicit approval.',
        },
      },
      {
        who: { fr: 'Moi, en cadrage produit', en: 'Myself, when scoping a product' },
        need: {
          fr: 'Structurer faits, hypothèses, questions et décisions avec leurs sources, sans qu’une réponse devienne une décision par accident.',
          en: 'Structure facts, assumptions, questions and decisions with their sources, without an answer silently becoming a decision.',
        },
      },
    ],
    usersNote: {
      fr: 'JARVIS est un assistant personnel : il n’a pas d’utilisateurs externes.',
      en: 'JARVIS is a personal assistant: it has no external users.',
    },
    decisions: [
      {
        category: 'security',
        text: { fr: 'Faire passer chaque action par un point de contrôle unique, avec refus par défaut.', en: 'Route every action through a single checkpoint, denied by default.' },
        trace: { label: 'ADR 0005', url: 'https://github.com/bouillaultalex-max/Jarvis/blob/main/docs/adr/0005-tool-executor-and-confirmation.md' },
      },
      {
        category: 'security',
        text: { fr: 'Lier une confirmation à un seul outil et au contenu exact de l’action.', en: 'Bind a confirmation to one tool and to the exact content of the action.' },
        trace: { label: 'ADR 0006', url: 'https://github.com/bouillaultalex-max/Jarvis/blob/main/docs/adr/0006-confirmation-fingerprint-for-execute-actions.md' },
      },
      {
        category: 'security',
        text: { fr: 'Conserver les secrets dans le trousseau du système, jamais dans la configuration ni dans les échanges avec le modèle.', en: 'Keep secrets in the OS keychain, never in configuration or in exchanges with the model.' },
        trace: { label: 'ADR 0002', url: 'https://github.com/bouillaultalex-max/Jarvis/blob/main/docs/adr/0002-secret-store-separation.md' },
      },
      {
        category: 'reliability',
        text: { fr: 'Distinguer le statut technique « exécuté » du verdict « résultat vérifié ».', en: 'Separate the technical “executed” status from the “outcome verified” verdict.' },
        trace: { label: 'run-verify-demo.ts', url: 'https://github.com/bouillaultalex-max/Jarvis/blob/main/apps/desktop/src/run-verify-demo.ts' },
      },
      {
        category: 'scope',
        text: { fr: 'Recherche juridique limitée : budget fixe de requêtes, aucune source présentée comme droit applicable.', en: 'Limited legal search: fixed query budget, no source presented as applicable law.' },
        trace: { label: 'ADR 0016', url: 'https://github.com/bouillaultalex-max/Jarvis/blob/main/docs/adr/0016-legal-retrieval-budget.md' },
      },
      {
        category: 'transparency',
        text: { fr: 'Documenter l’état réel du produit plutôt que présenter la roadmap comme déjà livrée.', en: 'Document actual implementation status instead of presenting the roadmap as delivered.' },
        trace: { label: 'PROJECT_STATE.md', url: 'https://github.com/bouillaultalex-max/Jarvis/blob/main/PROJECT_STATE.md' },
      },
    ],
    demos: [
      {
        title: { fr: 'Démo A — Exécution et vérification', en: 'Demo A — Execution and verification' },
        objective: {
          fr: 'Montrer qu’une action n’est exécutée qu’après confirmation, puis que son résultat est vérifié.',
          en: 'Show that an action only runs after confirmation, and that its outcome is then verified.',
        },
        detail: {
          fr: 'Une session réelle de la commande verify-demo : envoi simulé confirmé, verdict de vérification « satisfied », puis même demande refusée, sans aucun effet (code de sortie 1).',
          en: 'A real session of the verify-demo command: a confirmed simulated send, a “satisfied” verification verdict, then the same request refused with no effect (exit code 1).',
        },
        limits: {
          fr: 'Le client e-mail est simulé en mémoire : aucun service externe n’est appelé et aucun envoi Gmail réel n’est démontré. Les sorties du terminal sont en français.',
          en: 'The mail client is simulated in memory: no external service is called and no real Gmail send is demonstrated. Terminal output is in French.',
        },
        steps: {
          fr: ['Mission simulée : envoyer un message de démonstration.', 'Action autorisée : l’utilisateur confirme ; résultat technique « executed ».', 'VERIFY : verdict « satisfied », observé dans le client simulé.', 'Action refusée : « zéro effet », code de sortie 1.'],
          en: ['Simulated mission: send a demo message.', 'Allowed action: the user confirms; technical result “executed”.', 'VERIFY: “satisfied” verdict, observed in the simulated client.', 'Refused action: “zéro effet” (zero effect), exit code 1.'],
        },
        state: 'runnable', filmed: true,
        link: 'https://github.com/bouillaultalex-max/Jarvis/blob/main/apps/desktop/src/run-verify-demo.ts',
        video: { file: 'jarvis-demo-a-verify', duration: { fr: '45 s', en: '45 s' } },
      },
      {
        title: { fr: 'Démo B — Du besoin à la décision validée', en: 'Demo B — From need to validated decision' },
        objective: {
          fr: 'Montrer comment JARVIS structure un cadrage produit et protège une décision validée.',
          en: 'Show how JARVIS structures product scoping and protects a validated decision.',
        },
        detail: {
          fr: 'Une session réelle sur un projet fictif : fiche, source, besoin utilisateur, fait, hypothèse, décision justifiée puis validée. La modification ultérieure de sa justification est refusée et la fiche reste à la révision 8.',
          en: 'A real session on a fictional project: brief, source, user need, fact, assumption, a decision justified then validated. A later change to its justification is refused and the brief stays at revision 8.',
        },
        limits: {
          fr: 'Aucune action externe : la fiche est enregistrée localement, dans un dossier temporaire. Règles déterministes, sans modèle de langage. Les sources sont déclarées, jamais vérifiées par JARVIS. Aucun usage par des tiers. Les sorties du terminal sont en français.',
          en: 'No external action: the brief is stored locally, in a temporary folder. Deterministic rules, no language model. Sources are declared, never verified by JARVIS. No third-party usage. Terminal output is in French.',
        },
        steps: {
          fr: ['Créer une fiche projet fictive.', 'Déclarer une source, puis un besoin utilisateur relié à cette source.', 'Distinguer un fait d’une hypothèse.', 'Formaliser une décision et la justifier par un fait.', 'Valider la décision.', 'Tenter de modifier sa justification : refus « invalid_transition ».', 'Vérifier que la fiche est inchangée (révision 8).'],
          en: ['Create a fictional project brief.', 'Declare a source, then a user need linked to it.', 'Keep a fact apart from an assumption.', 'Record a decision and justify it with a fact.', 'Validate the decision.', 'Try to change its justification: “invalid_transition” refusal.', 'Check that the brief is unchanged (revision 8).'],
        },
        state: 'runnable', filmed: true,
        link: 'https://github.com/bouillaultalex-max/Jarvis/tree/main/packages/project-briefs',
        video: { file: 'jarvis-demo-b-product', duration: { fr: '60 s', en: '60 s' } },
      },
      {
        title: { fr: 'Tests et intégration continue', en: 'Tests and continuous integration' },
        detail: {
          fr: 'Historique public des exécutions de la CI sur GitHub (Linux).',
          en: 'Public history of CI runs on GitHub (Linux).',
        },
        state: 'online', filmed: false,
        link: 'https://github.com/bouillaultalex-max/Jarvis/actions/workflows/ci.yml',
      },
    ],
    status: {
      built: {
        fr: [
          'Boucle d’agent bornée : chaque outil passe par un point de contrôle unique des permissions.',
          'Connecteur Gmail : lecture, classification de la boîte de réception, envoi uniquement après confirmation.',
          'Commandes terminal : chat local, fiches projet persistantes, recherche Légifrance en lecture seule.',
          'Démonstration locale de vérification du résultat après exécution d’une action.',
        ],
        en: [
          'Bounded agent loop: every tool goes through a single permission checkpoint.',
          'Gmail connector: reading, inbox classification, sending only after confirmation.',
          'Terminal commands: local chat, persistent project briefs, read-only Légifrance search.',
          'Local demo verifying the outcome after an action is executed.',
        ],
      },
      tested: {
        fr: [
          '3 298 tests exécutés le 24/10/2026 sous Windows : 3 234 réussis, 61 échecs, 3 ignorés. Les échecs sont des problèmes de portabilité Windows (chemins, permissions de fichiers).',
          'Intégration continue GitHub sous Linux verte les 22 et 23/10/2026 ; typage strict validé.',
          'Démonstration de vérification exécutée sans clé ni donnée réelle : action confirmée vérifiée, action refusée sans effet.',
          'Invariants de sécurité couverts par les tests : un outil refusé n’est jamais exécuté, une confirmation ne contourne pas un refus.',
        ],
        en: [
          '3,298 tests run on 2026-10-24 on Windows: 3,234 passed, 61 failed, 3 skipped. The failures are Windows portability issues (paths, file permissions).',
          'GitHub continuous integration on Linux passing on 2026-10-22 and 2026-10-23; strict type-checking passes.',
          'Verification demo run with no key and no real data: a confirmed action is verified, a refused action has no effect.',
          'Security invariants covered by tests: a denied tool never runs, a confirmation never overrides a denial.',
        ],
      },
      planned: {
        fr: [
          'Gmail : testé avec des doubles ; aucun usage réel documenté dans le dépôt.',
          'Mémoire contrôlée et appel d’outils par le modèle : modules non branchés dans une application.',
          'Légifrance : essai réel rapporté mais non archivé. WhatsApp : mode réel non validé.',
          'Suite de tests non portable sous Windows (61 échecs à corriger).',
        ],
        en: [
          'Gmail: tested with test doubles; no real usage documented in the repository.',
          'Controlled memory and model-driven tool calling: modules not wired into an application.',
          'Légifrance: real trial reported but not archived. WhatsApp: real mode not validated.',
          'Test suite not portable to Windows (61 failures to fix).',
        ],
      },
    },
    statusSource: 'https://github.com/bouillaultalex-max/Jarvis/blob/main/PROJECT_STATE.md',
    proof: {
      fr: 'Monorepo TypeScript strict (npm workspaces) : serveur Fastify, client terminal, abstraction LLM, connecteurs, classification d’e-mails et fiches projet. Décisions d’architecture (ADR) et état réel documentés dans le dépôt.',
      en: 'Strict TypeScript monorepo (npm workspaces): Fastify server, terminal client, LLM abstraction, connectors, email classification and project briefs. Architecture decisions (ADRs) and actual status are documented in the repository.',
    },
    limit: {
      fr: 'Prototype personnel, sans utilisateurs externes ni mesure d’impact. Plusieurs intégrations restent simulées ou non vérifiées en conditions réelles. Il ne s’agit pas d’un assistant commercialisé.',
      en: 'Personal prototype, with no external users and no impact measurement. Several integrations remain simulated or unverified in real conditions. This is not a commercial assistant.',
    },
    tags: ['TypeScript', 'AI Agents', 'Claude Code', 'Workflows'],
    repoUrl: 'https://github.com/bouillaultalex-max/Jarvis',
  },
  {
    id: 'lca-mes',
    number: '02',
    title: 'LCA-MES',
    category: { fr: 'Produit métier · Industrie', en: 'B2B Product · Manufacturing' },
    stage: { fr: 'Prototype personnel V0.9 · non déployé', en: 'Personal V0.9 prototype · not deployed' },
    description: {
      fr: 'Une application métier conçue autour des besoins réels d’un laboratoire de production : stocks, préparation, production et traçabilité.',
      en: 'A business application designed around the real needs of a production laboratory: inventory, preparation, production and traceability.',
    },
    highlights: {
      fr: ['Faisabilité vérifiée avant chaque lot', 'Traçabilité des lots finis', 'Testée par deux utilisateurs métier'],
      en: ['Feasibility checked before each batch', 'Finished-lot traceability', 'Tested by two business users'],
    },
    problem: {
      fr: 'Des processus de préparation basés sur des tableurs rendent plus difficile l’anticipation des ruptures et la traçabilité des lots.',
      en: 'Spreadsheet-based preparation workflows make stock shortage anticipation and lot traceability harder.',
    },
    role: {
      fr: 'J’ai cadré les besoins à partir de ma connaissance du laboratoire, défini les fonctionnalités et les règles métier, priorisé la roadmap et piloté leur implémentation avec l’assistance de Claude Code. J’ai assuré les vérifications fonctionnelles documentées et intégré les retours des deux premiers utilisateurs métier.',
      en: 'I scoped the needs from my knowledge of the laboratory, defined the features and business rules, prioritized the roadmap and led their implementation with Claude Code’s assistance. I carried out the documented functional checks and incorporated feedback from the first two business users.',
    },
    users: [
      {
        who: { fr: 'Responsable de laboratoire', en: 'Laboratory manager' },
        need: {
          fr: 'Préparer et lancer des lots sans mauvaise surprise de stock, et retrouver rapidement un article ou un ingrédient.',
          en: 'Prepare and launch batches without stock surprises, and quickly find an item or ingredient.',
        },
      },
      {
        who: { fr: 'Responsable adjoint et administrateur (mon rôle)', en: 'Assistant manager and administrator (my role)' },
        need: {
          fr: 'Fiabiliser recettes, stocks et imports, et gérer les comptes et leurs droits.',
          en: 'Make recipes, inventory and imports reliable, and manage accounts and permissions.',
        },
      },
      {
        who: { fr: 'Direction des opérations', en: 'Operations management' },
        need: {
          fr: 'Consulter, en lecture seule, l’état des stocks, les rapports et les tableaux de bord, sans accès aux écrans de saisie.',
          en: 'Consult stock status, reports and dashboards in read-only mode, with no access to data-entry screens.',
        },
      },
    ],
    decisions: [
      {
        category: 'user',
        text: { fr: 'Bloquer côté serveur le lancement d’un lot si le stock est insuffisant, en indiquant le composant limitant.', en: 'Block a batch launch server-side when stock is insufficient, showing the limiting component.' },
      },
      {
        category: 'user',
        text: { fr: 'Sauvegarder automatiquement les brouillons de recette, sans jamais les publier seuls.', en: 'Autosave recipe drafts without ever publishing them automatically.' },
      },
      {
        category: 'user',
        text: { fr: 'Rendre la recherche d’articles instantanée et insensible aux accents avant la montée en volume du catalogue.', en: 'Make item search instant and accent-insensitive before the catalogue grows.' },
      },
      {
        category: 'business',
        text: { fr: 'Relier chaque lot fini aux lots de matières consommés.', en: 'Link each finished lot to the material lots it consumed.' },
      },
      {
        category: 'data',
        text: { fr: 'Prévisualiser puis confirmer les imports, avec une seconde vérification côté serveur.', en: 'Preview then confirm imports, with a second server-side check.' },
      },
      {
        category: 'security',
        text: { fr: 'Limiter l’assistant IA à la lecture : aucune écriture dans les données métier.', en: 'Restrict the AI assistant to read-only access: no writes to business data.' },
      },
    ],
    demos: [
      {
        title: { fr: 'Démonstration en préparation', en: 'Demo in preparation' },
        detail: {
          fr: 'Parcours prévu : contrôle de faisabilité avant le lancement d’un lot, import avec aperçu, traçabilité d’un lot. Elle sera réalisée avec un thème neutre et des données fictives, après validation des droits de diffusion. Aucune capture n’est publiée d’ici là.',
          en: 'Planned walkthrough: feasibility check before a batch launch, import with preview, lot traceability. It will use a neutral theme and fictional data, once distribution rights are confirmed. No screenshot is published until then.',
        },
        state: 'preparing', filmed: false,
      },
    ],
    status: {
      built: {
        fr: [
          'Catalogue, recettes versionnées, stocks, préparation des lots et suivi de production.',
          'Lancement d’un lot bloqué côté serveur si le stock est insuffisant, avec le composant limitant indiqué.',
          'Traçabilité : généalogie des lots finis et recherche inverse par lot fournisseur.',
          'Imports de tableurs avec aperçu et confirmation ; comptes et rôles ; assistant IA en lecture seule.',
        ],
        en: [
          'Catalogue, versioned recipes, inventory, batch preparation and production tracking.',
          'Batch launch blocked server-side when stock is insufficient, with the limiting component shown.',
          'Traceability: finished-lot genealogy and reverse lookup by supplier lot.',
          'Spreadsheet imports with preview and confirmation; accounts and roles; read-only AI assistant.',
        ],
      },
      tested: {
        fr: [
          '868 tests unitaires de l’API et 124 tests frontend réussis, exécutés le 24/10/2026. Une suite n’a pas pu s’exécuter faute de configuration locale.',
          '171 tests de bout en bout documentés au 11/08/2026, non relancés depuis (base de test requise).',
          'Testée par deux utilisateurs métier en juillet 2026 : quatre évolutions documentées en découlent, dont le blocage d’un lot en cas de stock insuffisant.',
        ],
        en: [
          '868 API unit tests and 124 frontend tests passed, run on 2026-10-24. One suite could not run without local configuration.',
          '171 end-to-end tests documented on 2026-08-11, not re-run since (test database required).',
          'Tested by two business users in July 2026: four documented changes resulted, including blocking a batch when stock is insufficient.',
        ],
      },
      planned: {
        fr: [
          'Aucun déploiement en production validé ; configuration Docker non testée en conditions réelles.',
          'Qualité et coûts : implémentés côté serveur, sans écran dédié.',
          'Sauvegardes automatiques testées en développement uniquement.',
          'Assistant IA : premier essai complet non réalisé.',
          'Pas d’intégration continue ; compte rendu des tests utilisateurs non formalisé.',
        ],
        en: [
          'No validated production deployment; Docker setup not tested in real conditions.',
          'Quality and costing: implemented server-side, no dedicated screen.',
          'Automatic backups tested in development only.',
          'AI assistant: first complete trial not carried out.',
          'No continuous integration; user test report not formalized.',
        ],
      },
    },
    proof: {
      fr: 'Monolithe modulaire : application React/Vite, API NestJS, PostgreSQL et Prisma, contrats TypeScript partagés. Décisions d’architecture et état de livraison documentés et datés.',
      en: 'Modular monolith: React/Vite app, NestJS API, PostgreSQL and Prisma, shared TypeScript contracts. Architecture decisions and delivery status documented and dated.',
    },
    limit: {
      fr: 'Prototype personnel, testé par deux utilisateurs métier en juillet 2026, non déployé en production. Ces essais ne constituent pas un usage opérationnel par l’employeur. Aucun gain chiffré n’est revendiqué faute de mesure. L’identité de l’entreprise et des personnes concernées n’est volontairement pas présentée.',
      en: 'Personal prototype, tested by two business users in July 2026, not deployed in production. These trials do not constitute operational use by the employer. No quantified gains are claimed, as none were measured. The identity of the company and the people involved is deliberately not disclosed.',
    },
    tags: ['React', 'NestJS', 'PostgreSQL', 'Product Discovery'],
  },
]

export const copy = {
  fr: {
    meta: {
      title: 'Alexandre Bouillault — Product Builder IA',
      description: 'Portfolio d’Alexandre Bouillault, Product Builder spécialisé dans les produits numériques et les agents IA. Découvrez JARVIS, LCA-MES et son approche produit.',
    },
    skip: 'Aller au contenu', brandLabel: 'Alexandre Bouillault — accueil', navLabel: 'Navigation principale', languageLabel: 'Langue',
    nav: { projects: 'Projets', approach: 'Méthode', about: 'À propos', contact: 'Contact' },
    openMenu: 'Ouvrir la navigation', closeMenu: 'Fermer la navigation',
    status: 'En recherche de poste · Product Builder IA',
    heroEyebrow: 'PRODUCT BUILDER · IA APPLIQUÉE',
    heroTitleA: 'Du problème métier', heroTitleB: 'au produit qui fonctionne.',
    heroText: 'Je relie la réalité du terrain, la réflexion produit et les outils d’intelligence artificielle pour concevoir des solutions utiles, testables et évolutives.',
    heroPrimary: 'Explorer mes projets', heroSecondary: 'Découvrir ma méthode',
    heroVisualCaption: 'Schéma de méthode — pas une capture de produit',
    location: 'Basé à Marseille · Ouvert au remote',
    proofLabel: 'Une approche ancrée dans la pratique',
    proofTitle: 'Des besoins réels. Des choix expliqués. Des prototypes vérifiables.',
    proofText: 'Ma valeur ne se limite pas à utiliser des outils d’IA : elle est dans le choix du problème, la définition du bon périmètre et l’évaluation du résultat.',
    projectsEyebrow: '01 / TRAVAUX SÉLECTIONNÉS', projectsTitle: 'Deux projets, deux angles complémentaires.',
    projectsText: 'Une architecture d’agents d’un côté, un logiciel métier industriel de l’autre. Chaque étude de cas distingue ce qui existe de ce qui reste à construire.',
    seeCase: 'Voir l’étude de cas', source: 'Voir le dépôt', sourceAria: 'Dépôt GitHub de',
    statusLegend: 'Légende des études de cas',
    statusLabels: { built: 'Implémenté', tested: 'Testé', planned: 'Non livré / à vérifier' },
    statusHelp: 'Implémenté : présent dans le code, au stade de prototype. Testé : résultat vérifié, avec sa date. Non livré / à vérifier : absent, partiel ou non vérifié en conditions réelles.',
    statusTitle: 'État réel du projet',
    statusSourceLabel: 'Sources : tests exécutés et PROJECT_STATE.md du dépôt, vérifiés le',
    statusSourceInternal: 'Sources : tests exécutés et documentation interne du projet, vérifiés le',
    usersTitle: 'Pour qui, quel besoin',
    decisionCategories: { security: 'Sécurité', reliability: 'Fiabilité', scope: 'Périmètre', transparency: 'Transparence', user: 'Retour utilisateur', business: 'Règle métier', data: 'Intégrité des données' },
    traceLabel: 'Trace publique :',
    demosTitle: 'Démonstrations',
    demoStates: { runnable: 'Exécutable · vérifiée le 24/10/2026', online: 'Consultable en ligne', preparing: 'En préparation' },
    demoNotFilmed: 'Pas encore filmée',
    demoFilmed: 'Vidéo du 24/10/2026',
    colon: ' : ',
    demoObjective: 'Objectif', demoShows: 'Ce qu’elle montre réellement', demoLimits: 'Limites',
    demoSteps: 'Déroulé de la vidéo (sans son)',
    demoVideoLabel: 'Vidéo de démonstration sans son',
    demoVideoFallback: 'Votre navigateur ne lit pas cette vidéo :',
    demoDownload: 'télécharger le fichier MP4',
    demoOpen: 'Voir le code',
    demoOpenOnline: 'Ouvrir',
    projectNote: 'Visualisations conceptuelles, pas des captures d’écran des applications.',
    approachEyebrow: '02 / MA MÉTHODE', approachTitle: 'Penser produit avant de penser outil.',
    approachText: 'Une méthode qui privilégie la clarté, les petits incréments et les preuves de fonctionnement.',
    steps: [
      { number:'01', label:'Comprendre', detail:'Identifier l’utilisateur, son besoin et ses contraintes.' },
      { number:'02', label:'Cadrer', detail:'Transformer le problème en périmètre, critères et roadmap.' },
      { number:'03', label:'Construire', detail:'Prototyper et orchestrer le développement avec l’IA.' },
      { number:'04', label:'Vérifier', detail:'Tester les comportements et leurs résultats réels.' },
      { number:'05', label:'Améliorer', detail:'Itérer à partir des retours et des limites observées.' },
    ],
    aboutEyebrow: '03 / PARCOURS', aboutTitle: 'Le terrain d’abord. La technologie ensuite.',
    aboutP1: 'Mon parcours s’est construit en laboratoire de production, comme responsable adjoint : gestion du laboratoire, coordination d’équipe, préparation et production, au plus près des contraintes opérationnelles. J’y ai appris à partir des irritants concrets plutôt que d’une technologie à placer.',
    aboutP2: 'J’ai engagé une reconversion vers le Product Building et je me forme avec Uncode School. Je mets cette méthode en pratique sur des projets concrets : un outil métier pour un laboratoire et un assistant IA personnel.',
    aboutP3: 'J’utilise Claude Code pour piloter les réalisations techniques : je cadre, je priorise, je fais implémenter et je vérifie. Les choix produit et les validations restent sous ma responsabilité.',
    pathTitle: 'Parcours en trois étapes',
    path: [
      { label: 'Gestion de laboratoire', detail: 'Responsable adjoint d’un laboratoire de production : coordination d’équipe, préparation, stocks et traçabilité.' },
      { label: 'Reconversion Product Building', detail: 'Formation Uncode School : cadrage métier, roadmap, prototypage et IA appliquée.' },
      { label: 'Réalisations pilotées avec Claude Code', detail: 'Deux projets personnels : LCA-MES, prototype d’outil métier testé par deux utilisateurs, et JARVIS, assistant IA (voir Projets).' },
    ],
    skillsTitle: 'Compétences',
    skills: ['Cadrage métier & discovery', 'Roadmap & priorisation', 'Prototypage IA & agents', 'Automatisation de workflows', 'Pilotage de Claude Code', 'Coordination d’équipe', 'React / TypeScript (assisté par IA)'],
    transparencyTitle: 'Ma façon de travailler', transparency: 'Je distingue les prototypes des fonctionnalités livrées et documente les limites. Je ne revendique pas une maîtrise autonome de toutes les technologies utilisées dans mes projets.',
    contactEyebrow: '04 / ÉCHANGEONS', contactTitle: 'Un défi produit à résoudre ?',
    contactText: 'Je recherche des opportunités de Product Building et de conception de solutions IA, dans une équipe qui valorise la compréhension métier et l’expérimentation concrète.',
    contactEmail: 'Me contacter', contactLinkedin: 'Mon LinkedIn',
    cvDownload: 'Télécharger mon CV (PDF)', cvOtherLanguage: '(version anglaise)',
    newTab: '(nouvel onglet)',
    demoMethod: 'Méthode : commandes réellement exécutées sur une copie isolée de JARVIS (commit fdcd940), sorties enregistrées sans modification puis rejouées dans un émulateur de terminal (xterm.js). Seules la frappe animée et les légendes sont ajoutées.',
    demoMethodLabel: 'Enregistrement',
    demosCta: 'Voir les démos vidéo',
    footer: 'Conçu comme un produit : clair, itératif et vérifiable.', backTop: 'Retour en haut',
    caseEyebrow: 'ÉTUDE DE CAS', problem: 'Le problème', role: 'Mon rôle', decisions: 'Décisions produit', evidence: 'Stack & architecture', boundaries: 'Limites & transparence',
    caseClose: 'Fermer l’étude de cas',
  },
  en: {
    meta: {
      title: 'Alexandre Bouillault — AI Product Builder',
      description: 'Portfolio of Alexandre Bouillault, Product Builder focused on digital products and AI agents. Explore JARVIS, LCA-MES and his product approach.',
    },
    skip: 'Skip to content', brandLabel: 'Alexandre Bouillault — home', navLabel: 'Primary navigation', languageLabel: 'Language',
    nav: { projects: 'Projects', approach: 'Method', about: 'About', contact: 'Contact' },
    openMenu: 'Open navigation', closeMenu: 'Close navigation',
    status: 'Open to roles · AI Product Builder',
    heroEyebrow: 'PRODUCT BUILDER · APPLIED AI',
    heroTitleA: 'From business problem', heroTitleB: 'to working product.',
    heroText: 'I connect field reality, product thinking and AI tools to design solutions that are useful, testable and built to evolve.',
    heroPrimary: 'Explore my projects', heroSecondary: 'Discover my method',
    heroVisualCaption: 'Method diagram — not a product screenshot',
    location: 'Based in Marseille · Open to remote',
    proofLabel: 'A practical approach',
    proofTitle: 'Real needs. Explicit decisions. Verifiable prototypes.',
    proofText: 'My value goes beyond using AI tools: it lies in selecting the right problem, defining the right scope, and evaluating outcomes.',
    projectsEyebrow: '01 / SELECTED PROJECTS', projectsTitle: 'Two projects, two complementary perspectives.',
    projectsText: 'An agent architecture on one side, an industrial business application on the other. Each case study separates what exists from what still needs to be built.',
    seeCase: 'Read case study', source: 'View repository', sourceAria: 'GitHub repository for',
    statusLegend: 'Case study legend',
    statusLabels: { built: 'Implemented', tested: 'Tested', planned: 'Not delivered / to verify' },
    statusHelp: 'Implemented: present in the code, at prototype stage. Tested: verified result, with its date. Not delivered / to verify: missing, partial or not verified in real conditions.',
    statusTitle: 'Actual project status',
    statusSourceLabel: 'Sources: tests run and repository PROJECT_STATE.md, checked on',
    statusSourceInternal: 'Sources: tests run and internal project documentation, checked on',
    usersTitle: 'Who it is for, what they need',
    decisionCategories: { security: 'Security', reliability: 'Reliability', scope: 'Scope', transparency: 'Transparency', user: 'User feedback', business: 'Business rule', data: 'Data integrity' },
    traceLabel: 'Public trace:',
    demosTitle: 'Demos',
    demoStates: { runnable: 'Runnable · verified on 2026-10-24', online: 'Available online', preparing: 'In preparation' },
    demoNotFilmed: 'Not filmed yet',
    demoFilmed: 'Video from 2026-10-24',
    colon: ': ',
    demoObjective: 'Goal', demoShows: 'What it actually shows', demoLimits: 'Limitations',
    demoSteps: 'Video walkthrough (no sound)',
    demoVideoLabel: 'Silent demo video',
    demoVideoFallback: 'Your browser cannot play this video:',
    demoDownload: 'download the MP4 file',
    demoOpen: 'View code',
    demoOpenOnline: 'Open',
    projectNote: 'Concept illustrations, not screenshots of the actual products.',
    approachEyebrow: '02 / MY METHOD', approachTitle: 'Product thinking before tooling.',
    approachText: 'A process built around clarity, small increments and evidence of working behavior.',
    steps: [
      { number:'01', label:'Discover', detail:'Understand users, needs and constraints.' },
      { number:'02', label:'Scope', detail:'Turn problems into requirements, success criteria and roadmap.' },
      { number:'03', label:'Build', detail:'Prototype and orchestrate AI-assisted development.' },
      { number:'04', label:'Verify', detail:'Test behavior and actual outcomes.' },
      { number:'05', label:'Improve', detail:'Iterate on feedback and known limitations.' },
    ],
    aboutEyebrow: '03 / BACKGROUND', aboutTitle: 'Business reality first. Technology second.',
    aboutP1: 'My background was built in a production laboratory, as assistant manager: running the lab, coordinating a team, preparation and production, close to operational constraints. It taught me to start from real friction, not from a technology looking for a use case.',
    aboutP2: 'I am transitioning into Product Building and training with Uncode School. I apply this method to concrete projects: a business tool for a laboratory and a personal AI assistant.',
    aboutP3: 'I use Claude Code to lead technical delivery: I scope, prioritize, have it implemented and verify. Product choices and validation remain my responsibility.',
    pathTitle: 'My path in three steps',
    path: [
      { label: 'Laboratory management', detail: 'Assistant manager of a production laboratory: team coordination, preparation, inventory and traceability.' },
      { label: 'Transition to Product Building', detail: 'Uncode School training: business scoping, roadmapping, prototyping and applied AI.' },
      { label: 'Delivery led with Claude Code', detail: 'Two personal projects: LCA-MES, a business-tool prototype tested by two users, and JARVIS, an AI assistant (see Projects).' },
    ],
    skillsTitle: 'Skills',
    skills: ['Business scoping & discovery', 'Roadmapping & prioritization', 'AI prototyping & agents', 'Workflow automation', 'Leading Claude Code', 'Team coordination', 'React / TypeScript (AI-assisted)'],
    transparencyTitle: 'How I approach delivery', transparency: 'I distinguish prototypes from delivered features and document limitations. I do not claim independent mastery of every technology used in my projects.',
    contactEyebrow: '04 / GET IN TOUCH', contactTitle: 'Have a product challenge?',
    contactText: 'I am exploring opportunities in Product Building and AI solutions, with teams that value business understanding and hands-on experimentation.',
    contactEmail: 'Contact me', contactLinkedin: 'My LinkedIn',
    cvDownload: 'Download my résumé (PDF)', cvOtherLanguage: '(French version)',
    newTab: '(opens in a new tab)',
    demoMethod: 'Method: commands actually run on an isolated copy of JARVIS (commit fdcd940), output recorded unedited then replayed in a terminal emulator (xterm.js). Only the animated typing and captions are added.',
    demoMethodLabel: 'Recording',
    demosCta: 'Watch the video demos',
    footer: 'Designed as a product: clear, iterative and verifiable.', backTop: 'Back to top',
    caseEyebrow: 'CASE STUDY', problem: 'The problem', role: 'My role', decisions: 'Product decisions', evidence: 'Stack & architecture', boundaries: 'Limitations & transparency',
    caseClose: 'Close case study',
  },
} as const
