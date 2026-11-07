# Validation FEACO — 2026-10-02

## Sortie de build Vercel — 2026-11-07

Vercel attend le dossier Next standard `.next`. La configuration FEACO utilisait `.next-feaco` en mode normal ; la sortie normale est maintenant `.next`, tandis que les modes QA gardent leurs répertoires isolés. Le build normal doit être vérifié par la présence de `.next/BUILD_ID`.

## Fiche de ligue et rattachement des clubs — 2026-11-07

La fiche de ligue n'affiche plus la section tableau des athlètes, qui n'est pas raccordée aux données FEACO territoriales. La fiche conserve ses informations, compteurs, ententes et clubs. Le formulaire de club propose uniquement l'entente ; le parent ligue est rempli depuis l'entente choisie, puis toujours contrôlé côté service. Le formulaire a été ouvert dans le navigateur local et vérifié : aucun champ Ligue n'est présenté.

Le test territorial confirme qu'une création avec la seule entente fournie dérive et persiste l'ID ligue correspondant. `npm run test:territory` (6 tests), `npm run typecheck` et `npm run lint` réussissent. Le premier build ne s'est pas lancé car le serveur de développement utilise déjà `.next-feaco` ; le build isolé dans `.next-territory-qa-webpack` réussit. Les entrées temporaires ajoutées automatiquement par Next dans `tsconfig.json` ont été retirées après le build.

## Cadre persistant et chargement des licences — 2026-11-07

Le shell FEACO est maintenant monte par `app/layout.tsx` et conserve la sidebar pendant les transitions entre routes. Les anciens `DashboardLayout` de page/segment reutilisent ce cadre au lieu d'en creer un second. Le fallback de `/licences` conserve le `Header` et son bandeau de statut pendant le chargement.

La regression `npm run test:navigation` passe (2/2) : rendu SSR d'un seul cadre autour d'un ancien wrapper, et rendu du bandeau et du titre durant le fallback licences. Les suites dates (5), domaine FEACO (5) et territoire (6) passent egalement. `npm run typecheck`, `npm run lint` et `npm run build` reussissent. Les routes locales `/athletes` et `/licences` renvoient HTTP 200 avec le declencheur de navigation et une sidebar rendus.

Limite : aucune transition interactive n'a ete verifiee dans un navigateur apres le changement ; la persistance est couverte par le test du shell racine et les rendus HTTP, mais une comparaison visuelle FEBACO reste a faire.

## Lot territorial ? 2026-11-07

Les pages Ligues, Ententes et Clubs, leurs six routes collection/detail et un service Sheets FEACO dedie sont implementes. Mapping et regles dans [FEACO_TERRITORY.md](FEACO_TERRITORY.md). Les formulaires lateraux utilisent seulement les colonnes reelles, les codes sont du texte et les IDs/parents derives sont immuables en modification. Recherche, filtres et pagination sont conserves. Le tableau partage expose une option responsive activee uniquement sur les interfaces territoriales ; les cartes mobiles, la pagination et l'etat vide sont corriges.

Tests cibles executes : 6 tests territoriaux, 5 tests du domaine FEACO, 5 tests de dates et 3 tests des mappers territoriaux, tous reussis (19 au total). Les creations/modifications des trois entites et l'echec de persistance sont testes avec stockage simule. Le diagnostic mobile a confirme une largeur de contenu de 390 px pour 390 px disponibles apres correction.

Verification navigateur realisee en plusieurs passages : liste/recherche/pagination/fiche et modification ligue ; creation/modification entente et club ; verification finale des IDs, codes et noms des parents en memoire ; trois pages a 390 px sans debordement et recherche vide visible. Aucune erreur JavaScript dans le passage final. Rapports dans territory-qa/ligues-first-pass.json et territory-qa/results-final.json. Les delais et selecteurs de la verification ont ete ajustes pour cet environnement lent. Controles finaux reussis : npm run lint, npm run build (Webpack, compilation, TypeScript strict, generation et traces) puis npm run typecheck (exit 0). Build limite a deux workers ; cache normal .next-feaco distinct du cache QA. Le serveur QA a ete arrete apres verification. Les anciennes validations ci-dessous restent historiques.

Limite reelle : le processus local ne peut pas joindre Google (EACCES avant reponse HTTP). Presence et format des variables controles sans imprimer les valeurs ; les deux IDs correspondent aux ressources FEACO. Le connecteur a confirme les 26 ligues 01-26, les statuts vides et les colonnes d'identifiants Ententes/Clubs vides avant et apres les essais simules. Aucune ecriture de test sur les classeurs reels. Les captures QA sont explicitement etiquetees TEST SIMULE et ne constituent pas une connexion Google serveur reussie.

Acces : controle d'origine et perimetre local, scripts lies a 127.0.0.1 ; sessions et permissions multiutilisateurs FEACO restent a porter avant tout acces reseau partage. Les comptes FEVOCO ne sont jamais utilises. Tous les autres blocs et uploads restent en demonstration/bloques.

Fichiers : nouveaux modules territory-domain/sheets/view/access/api, tests et scripts QA, trois pages et loading.tsx, six routes API, trois ensembles clients/fiches/formulaires et formulaire partage, mappers ligues/ententes, tableau et header, configurations npm/Next/env, documentation et captures. Les types generes Next/tsconfig peuvent etre ajustes par les serveurs de verification. Les sources FEVOCO sont consultees uniquement. Aucun fichier prive, secret, push ou deploiement.

Git : fichiers FEACO deja non suivis a l'etat initial ; git diff --stat est vide pour cette raison, sans indexation ni commit. Aucun reset/nettoyage des changements utilisateur. Un dossier .actors-qa est apparu pendant ce lot sans etre cree ou modifie par cette intervention ; il est conserve et hors perimetre du rapport.

Prochaine action exacte : relancer le serveur FEACO normal avec npm run dev (Webpack), hors des options QA/test et dans un environnement autorisant Google, puis verifier en GET les API ligues (26), ententes et clubs (vides). Ne pas tester les creations sur les classeurs de production.


## Logo et modèle d'environnement — 2026-11-07

Contrôles exécutés sur ce lot : `npm run typecheck`, `npm run lint` et `npm run build` réussis. Aucun test distant dépendant de variables ni écriture de production.

Logo fourni inspecté : `public/WhatsApp Image 2026-09-21 at 13.58.46.jpeg`. Original conservé et copie stable `public/logo-feaco.jpeg` utilisée par la sidebar (40 × 40, object-contain) et les trois icônes de métadonnées (navigateur, raccourci, Apple). Aucun changement des dimensions de navigation. Vérification visuelle de l'image source effectuée, rendu navigateur non contrôlé dans ce lot.

`.env.example` complété : compte de service Sheets, sept IDs de classeurs FEACO, OAuth Drive, dossiers avatars/documents/logos, option de script Playwright. Valeurs vides, rôles et IDs attendus en commentaires. Distinction explicite entre variables déjà lues et contrat prévu : `lib/env.ts` et le lecteur local ne sont pas activés par ce changement. Aucun secret consulté ni test Google exécuté. Contrairement à la version précédente du modèle, les variables Sheets et dossiers futurs sont désormais listées pour préparation.

Prochaine action : copier `.env.example` vers `.env.local`, compléter uniquement avec des ressources FEACO et confirmer leur ajout avant les tests distants dépendants. Le raccordement et les permissions restent à implémenter.

## Lot 1 raccordement — 2026-11-07

Modifications : snapshot des en-têtes réels des sept classeurs, audit et tâches dans `FEACO_CONNECTION_GAP_2026-11-07.md`, domaine `lib/feaco-domain.ts`, cinq tests dédiés et script `test:feaco`; mappers des cinq acteurs avec idWa distinct et dates/lieu FEACO, mapper club avec id_categorie, types étendus, `.env.example` des variables effectivement consommées par les services médias historiques. Aucun TSX modifié et aucune interface nouvelle revendiquée.

Contrôles exécutés : `npm run test:feaco` (5/5), `npm run test:dates` (5/5), tests territoriaux (3/3), `npm run typecheck`, `npm run lint` et `npm run build` réussis. Avertissement Node MODULE_TYPELESS_PACKAGE_JSON sans échec. Le test de domaine couvre 100 m, hauteur, poids sans marque, 83,45 secondes, rang indépendant, isolation d'édition/épreuve et rejet des relais. Données entièrement locales et fictives; aucune écriture Sheets.

Limites : aucun test navigateur effectué dans ce lot, aucun test d'authentification ni de connexion Google serveur; le nouveau domaine n'est pas encore branché aux écrans. Le build utilise toujours le lecteur local existant. Activités/Documents restent en démonstration. Les anciennes validations ci-dessous sont historiques et n'attestent pas les nouvelles fonctions.

Prochaine action exacte : porter les sessions et permissions depuis FEVOCO avant le lecteur distant FEACO, puis brancher territoires, acteurs, affiliations et écrans d'épreuve/résultat. Les tests OAuth médias attendront l'ajout des variables de `.env.local` et la confirmation de l'utilisateur.

Git : fichiers applicatifs FEACO déjà tous non suivis avant intervention; `git diff --stat` vide pour cette raison, sans indexation ni commit. Groupes modifiés : `.env.example`, `README.md`, `package.json`, `docs/`, `lib/types.ts`, `lib/mappers/{athletes,coachs,medecins,officiels,arbitres,clubs}.ts`; nouveaux fichiers domaine/tests/snapshot/rapport. FEVOCO consulté uniquement, ses changements locaux préexistants n'ont pas été manipulés. Aucun push, déploiement ou changement des classeurs.

## Contrôles techniques
- Installation npm depuis le lockfile : 516 dépendances; aucune version mise à niveau. Les avertissements de dépréciation appartiennent au lockfile source.
- TypeScript strict : réussi; `ignoreBuildErrors` désactivé.
- ESLint : réussi après les derniers changements.
- Premier build de production : réussi, routes listées. Build final après validation des dates : réussi (compilation, TypeScript strict et génération des routes).
- 18 tests existants pertinents passent : 5 dates, 6 navigation, 3 mapping territorial, 3 paramètres, 1 unicité des lignes de tableaux. Aucun test écrit sur Google Sheets.

## Navigateur Chromium local
- 21 parcours en HTTP 200, titre présent et un seul bandeau de démonstration.
- 15 ouvertures de formulaires et fermetures par Échap vérifiées.
- 9 fiches territoriales/acteurs : détail, modification et annulation vérifiés.
- Ligue : aucun onglet dans le détail.
- Club : liste d’athlètes directement rattachés, aucune équipe intermédiaire.
- Recherche : état vide puis retour aux données après remise à zéro.
- Dates : saisie de `31022024` → `31/02/2024` invalide, erreur près du champ; `29022024` valide; date vide reste vide.
- Sauvegarde fictive : POST retourne 409, message explicite, formulaire reste ouvert; aucun succès.
- Cinq écritures API (création acteur, modification club, suppression document, résultat compétition, licence) refusées en HTTP 409.
- Historique d’affiliation d’un athlète : lecture locale 200, deux relations historiques distinctes.
- Équipe nationale : détail et onglets Athlètes/Staff/Compétitions/Résultats accessibles.
- Résultats compétition : état d’adaptation explicite; aucune action de saisie de sets.
- Mobile 390×844 : Clubs, Athlètes, Compétitions, Documents sans débordement horizontal. Navigation mobile, fermeture par Échap et focus clavier vérifiés.
- Desktop 1440×900 : aucun débordement horizontal sur les parcours testés.
- Aucune erreur JavaScript ni requête externe sur les 21 parcours.

Résultats détaillés : `browser-results.json`, `interaction-results.json`. Reproduire avec `node scripts/verify-local.cjs` et `node scripts/verify-interactions.cjs` après démarrage sur le port 3006. Ces scripts utilisent le Playwright déjà présent dans le workspace en lecture seule; `PLAYWRIGHT_MODULE` permet d’indiquer une autre installation.

## Comparaison visuelle et limites
29 captures FEACO sont conservées dans `screenshots/`. La liste des clubs, le détail club et le mobile ont été inspectés à l’écran. La capture FEVOCO disponible `docs/design-qa-assets/fevoco-club-detail-after-1440.png` a été inspectée à la même largeur; elle montre une ancienne navigation et une densité de données différente. Il ne s’agit donc pas d’une comparaison exhaustive entre deux applications actuelles dans des états équivalents.

Les styles globaux, layout, tableaux, panneaux, modales, détail ligue et détail club sont identiques au code local FEVOCO après substitution d’identité. Le rendu observé conserve les fonds, largeur 256px, header, marges, cartes, boutons dorés et tables. Écarts volontaires : logo neutre, bandeau de démonstration (+33px environ sur desktop), retrait FIVB/poste volleyball, modules de compétition non applicables explicitement isolés. La fidélité de toutes les vues actuelles FEVOCO n’est pas certifiée par captures comparatives faute de serveur référence actif; seul CNAC était actif sur le port 3000 et il n’a pas été modifié.

Aucune connexion réelle FEACO disponible : tous les exemples sont locaux. Les grades/spécialités/disciplines/catégories officielles restent vides, pas inventés. Les règles de licences, résultats athlétisme, activations/campagnes nationales et complétude restent à confirmer. Aucune fonctionnalité absente de la référence présentée comme copiée.

## Version locale servie

Build final lancé avec `npm run start -- --port 3006`. Contrôle de production réussi : liste/détail clubs, historique local des affiliations (200), refus de création de licence (409). Capture `screenshots/club-detail-production.png`. URL locale : http://localhost:3006.

## Git et fichiers
Nouveau dépôt FEACO indépendant sur `main`, aucun commit et aucun remote. Tous les fichiers sont nouveaux/non suivis; `git diff --stat` est donc vide. Les groupes créés sont `app/`, `components/`, `hooks/`, `lib/`, `styles/`, `public/`, `docs/`, `scripts/`, configurations npm/Next/TypeScript/ESLint, README, AGENTS et `.env.example` sans secrets. 366 fichiers applicatifs portés. La matrice détaille les fichiers de chaque interface et ses services.

L’état Git FEVOCO avant/après est inchangé. Aucun fichier CNAC, COC, FEBACO ou FEHAND modifié. Aucun push, merge, déploiement, compte, session ou secret copié.

## Lot Acteurs — listes et identité (2026-11-07)

Périmètre : `/athletes`, `/coachs`, `/arbitres`, `/medecins`, `/officiels`, `/autres-acteurs`. Référence : fichiers locaux courants FEVOCO consultés en lecture seule. Aucun classeur ni donnée personnelle FEVOCO importé.

- Tableaux et filtres repris de FEVOCO, avec ID fédéral en première colonne. ID national séparé pour les cinq familles qui disposent de cet en-tête. ID WA facultatif affiché uniquement pour l’athlète ; valeurs conservées en lecture pour les autres professions, sans présumer leur pertinence. Aucune colonne Licence vide, aucun remplacement général de FIVB par WA.
- Pagination 10/25/50/100 centralisée dans les clients ; recherche et filtres conservés au retour de la fiche. Retour par bouton et événement de navigation FEACO. Autres acteurs : retrait des indicateurs et filtres absents de la référence courante.
- Formulaires d’identité latéraux conservés. Avis explicite de création/modification indisponibles en démonstration locale. Aucun changement du refus serveur des mutations et aucun succès simulé ajouté.
- Lecture des en-têtes vérifiée contre `docs/feaco-sheets-schema.json` (relevé enregistré, sans lecture distante). Grade : priorité à `id_grade_arbitre`, alias `id_niveau` conservé. Enrichissement propre aux Acteurs dans `lib/actor-identity-reads.ts`, sans modifier le service territorial partagé.
- Athlète : `lieu_naissance` prioritaire, alias `lieu_de_naissance` conservé ; même principe pour la date. Validation de naissance via `compact-date.ts`, date vide conservée. Autres acteurs : `date_naissance`, `lieu_naissance` et libellé direct `type_autre_acteur` acceptés en lecture.

Tests effectivement exécutés : `node --experimental-strip-types --test lib/actor-identity.test.mjs lib/compact-date.test.mjs lib/mappers/autres-acteurs.test.mjs` : **12 réussis, 0 échec**. Le contrôle TypeScript complet initial a été interrompu sans résultat ; contrôle ciblé Acteurs et lint en cours à cette étape. Les résultats complémentaires doivent être consignés ci-dessous après exécution.

Limites et raccordements futurs : services de mutation d’identité non validés, aucune création/modification persistée ni écriture dans les classeurs. Les anciens services de mutation ne doivent pas être activés avant adaptation aux en-têtes FEACO (dont WA, dates et lieu de naissance). Les types directs d’AUTRES ne prouvent pas l’existence d’un référentiel officiel de types. Affiliations, mandats et transferts inchangés ; leurs futures entités devront être résolues par **type + ID**. Authentification, médias et licences hors périmètre. `lib/data.ts`, `lib/types.ts`, `lib/local-demo.ts` et `proxy.ts` non modifiés par ce lot. Aucun build, push ou déploiement.
### Résultats finaux du lot Acteurs

Les six parcours ont été vérifiés : Athlètes, entraîneurs (`coachs`), arbitres, médecins, officiels et autres acteurs.

- **Tests ciblés : 13 réussis, 0 échec** avec `node --experimental-strip-types --test lib/actor-identity.test.mjs lib/compact-date.test.mjs lib/mappers/autres-acteurs.test.mjs`. Couverture : identifiants fédéral/national/WA distincts, en-têtes FEACO et alias, lieu de naissance de l’athlète, grade d’arbitre, type direct AUTRES, calendrier, dates vides et limites de pagination.
- **TypeScript Acteurs : code 0**, commande `node --max-old-space-size=768 node_modules/typescript/bin/tsc --project .actors-qa/tsconfig.json --noEmit`. Ce contrôle couvre les six pages, leurs composants et leurs dépendances importées. Il ne remplace pas le contrôle global interrompu précédemment.
- **Lint ciblé : code 0**, sur les composants des six familles, le tableau et la pagination communs Acteurs, les mappers modifiés, le service de lecture propre aux Acteurs et la page Arbitres.
- **Navigateur : six parcours réussis**, via `scripts/verify-actors.cjs` : ID fédéral en première colonne, absence de colonne Licence/FIVB, recherche vide puis par ID, choix de 25 lignes, ouverture de fiche, panneau d’identité, refus PATCH et POST, retour conservant recherche et nombre de lignes, annulation, fermeture Échap et absence de débordement à 390 px. Le 31 février est bloqué par la validation native avant l’envoi ; le 29 février valide et la date vide sont acceptés.
- **Tactile : réussi**, via `scripts/verify-actors-touch.cjs` : contexte mobile avec `hasTouch`, choix de pagination par toucher, fiche, ouverture du panneau, annulation et retour avec état conservé, sans débordement.

Les quatre premiers parcours ont été contrôlés sur le serveur local FEACO disponible ; les deux derniers sur une copie de prévisualisation isolée après arrêt du serveur partagé. Les requêtes d’écriture ont été interceptées dans le navigateur et renvoyées en 409 ; le contrôle tactile les interdit. Il s’agit d’une validation des formulaires et des refus, pas d’une validation de persistance positive. Aucun classeur n’a reçu d’écriture de test.

Captures des six listes, formulaires et vues mobiles dans `docs/actors-qa/`. Les six listes desktop ainsi que le formulaire et les cartes mobiles Athlètes ont été examinés visuellement ; la référence FEVOCO a été comparée par lecture de ses composants, classes, dimensions et modalités, sans importer ses données personnelles. Le test attend l’hydratation des menus avant interaction.

Le modèle local conserve les mutations indisponibles et l’indique dans chaque panneau d’identité. Restent à valider avant activation : services persistants FEACO, schémas d’écriture d’identité (WA, dates, lieu de naissance et type direct AUTRES), référentiels métier officiels et consolidation du raccordement partagé des grades. Pour le futur lot affiliations/mandats/transferts, résolution obligatoire des entités par **type + ID**. Ces parcours métier, l’authentification, les médias et les licences n’ont pas été modifiés par ce lot.

Aucun `next build`, push, merge ni déploiement. Les répertoires de prévisualisation sont isolés sous `.actors-qa/` ; les fichiers territoriaux partagés n’ont pas été recopiés ou remplacés.

## Lot Affiliations FEACO — 7 novembre 2026

Périmètre : athlètes, entraîneurs et médecins rattachés à un club. FEVOCO reste en lecture seule. Son panneau générique (historique, tableau, consultation, formulaire latéral) sert de référence ; le panneau Transferts et ses fermetures automatiques ne sont pas repris. Les mandats, autres rattachements, authentification et médias sont exclus.

### Mapping réel et sources

Lecture du connecteur Google Drive, plages A1:H1000, après inspection des métadonnées : les trois feuilles contiennent uniquement les en-têtes (0 affiliation). Aucun remplissage de démonstration.

| Feuille | Clé immuable | Acteur | Autres colonnes exactes |
| --- | --- | --- | --- |
| ATHLETE_AFFILIATIONS | id_affiliation_athlete | id_athlete | id_saison, id_club, date_debut, date_fin, id_statut_affiliation, observations |
| COACH_AFFILIATIONS | id_affiliation_coach | id_coach | mêmes colonnes |
| MEDECIN_AFFILIATIONS | id_affiliation_medecin | id_medecin | mêmes colonnes |

SAISON : id_saison, nom_saison, observation. STATUTS_AFFILIATION : id_statut_affiliation, nom_statut_affiliation, observations ; SAF001 ACTIF, SAF002 TERMINE, SAF003 SUSPENDU, SAF004 ANNULE, SAF099 AUTRE (observations obligatoires). Une saison est une référence, jamais une borne de dates implicite. Résolution territoriale par id_club → id_entente → id_ligue ; noms actuels résolus par identifiant, codes préservés comme texte, anomalies signalées. Un club introuvable conserve son code dans l'historique ; un club inactif reste visible.

Configuration : GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, FEACO_ACTEURS_SPREADSHEET_ID, FEACO_AFFILIATIONS_SPREADSHEET_ID, FEACO_REFERENTIELS_SPREADSHEET_ID, FEACO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID présentes (contrôle booléen sans valeur sensible). Le service refuse les identifiants de classeurs différents des ressources FEACO validées. Variables documentées dans .env.example.

### Implémentation et protections

- lib/feaco-affiliations-domain.ts : mapping, validation des références, calendrier, ordre début/fin, propriété de la ligne et ID immuable. Identifiant technique neuf par UUID pour un ajout ; aucune numérotation de licence.
- lib/feaco-affiliations-sheets.ts : lectures groupées sur les quatre classeurs, cache court et mutualisation des lectures ; relecture fraîche avant mutation et détection d'un changement de ligne avant écriture RAW. Lecture minimale des acteurs (A:A et C:D), sans id_national, passeport ou média. Erreurs Google assainies, jamais remplacées par la démo.
- API /api/affiliations/{athlete|coach|medecin} : GET, POST (ajout), PUT (correction), PATCH (fin). Accès limité à la boucle locale et contrôle d'origine JSON pour mutation, protections territoriales existantes réutilisées sans changement d'authentification. Anciennes lectures imbriquées des trois catégories redirigées vers ce service réel.
- Terminer : change seulement date_fin et id_statut_affiliation=SAF002 dans la même ligne. Aucun autre historique n'est modifié. Une relecture est demandée si une écriture n'est pas confirmée.
- Fiche Athlète réelle existante conservée et onglets activés. Entrées Entraîneurs et Médecins : consultation réelle minimale (ID fédéral, nom, ID WA), recherche, pagination et fiche avec le même panneau. Les anciens formulaires d'identité ne sont pas activés dans ces deux entrées ; leur enrichissement relève du lot Acteurs.
- Licences : pages et section partagée affichent uniquement « Le module Licences FEACO sera disponible prochainement. ». Les getters hérités ne lisent aucune licence ; les API licences renvoient 410. Aucun classeur ni règle de licence créé.

### Règles ouvertes

Chevauchements et nouveaux rattachements à un club inactif : aucune règle FEACO validée. Le panneau l'indique ; il n'applique ni interdiction issue du volley, ni clôture d'une autre ligne. La sélection doit référencer un club existant ; une correction peut conserver le code historique d'un club disparu. Les conditions métier d'autorisation restent à confirmer. Aucune date de saison n'est inventée. Les fiches ne lisent et n'exposent pas id_national dans ce parcours ; la colonne existante n'est pas supprimée.

### Vérifications réellement exécutées

- Lecture réelle par connecteur : en-têtes et trois historiques vides confirmés ; SAISON et STATUTS_AFFILIATION lus. Aucune écriture de test dans Sheets.
- Tests métier : node --experimental-strip-types --test lib/feaco-affiliations-domain.test.mjs : 30 réussis après correction de la syntaxe de classe pour le runner Node. Création/correction/fin pour les trois catégories, conservation d'ID/saison/autres lignes, club disparu, club inactif, absence de bornes saisonnières, références invalides, calendrier, dates inversées, ID absent/dupliqué, statut AUTRE. Stockage simulé uniquement.
- TypeScript global et lint : passés après correction de l'API onValueChange du champ date et des paramètres volontairement inutilisés ; contrôle final ci-dessous.
- Premier essai navigateur interrompu : compilation très lente sur poste à mémoire limitée ; aucun résultat positif revendiqué. Serveur de test arrêté. scripts/verify-affiliations.cjs intercepte toutes les requêtes API et conserve les mutations uniquement dans un objet simulé. La page /affiliations-qa est inaccessible hors développement avec FEACO_AFFILIATIONS_QA=1 ; elle ne remplace aucune source réelle.

Prochaine action exacte : terminer la vérification navigateur simulée, puis contrôler la connexion SDK en lecture seule dans un environnement réseau autorisé avant une validation métier des créations réelles. Aucun push ni déploiement.

Contrôles complémentaires : 31 tests ciblés réussis (ajout du refus des hôtes/origines externes et des écritures non JSON). Lint global final : code 0. Test SDK Google en lecture seule sur ATHLETE_AFFILIATIONS!A1:H1 : échec EACCES dans le bac à sable ; la connexion applicative réelle n'est pas validée ici, malgré les lectures réussies par connecteur. Ne pas confondre ce refus réseau avec une feuille vide. Le message d'erreur explicite est conservé.

Un premier build avec une limite de tas de 768 Mo a quitté avec le code 134 ; le build standard est relancé séparément. La vérification navigateur et le build ne doivent pas être exécutés simultanément sur ce poste à mémoire limitée.

### Bilan final des contrôles

32 tests métier/projection/confidentialité/accès réussis, 0 échec. Le build standard a terminé avec code 0 (compilation, TypeScript global, 17 pages statiques, traces). Un dernier passage est lancé après le raccordement des anciens getters d'affiliation, qui ne lisent plus la démonstration pour ces trois catégories.

Les trois tentatives de préchargement navigateur ont été interrompues lors de la compilation du serveur de développement, face à la saturation mémoire (avant interactions). Aucun succès navigateur, aucune capture ni validation de persistance Sheets ne sont revendiqués. Tous les serveurs de contrôle démarrés pour ce lot sont arrêtés. Le scénario scripts/verify-affiliations.cjs reste disponible : les GET, POST, PUT et PATCH sont interceptés, avec erreurs simulées, stockage en mémoire et aucune transmission à Google. Pour le rejouer sur un poste disposant de mémoire : FEACO_AFFILIATIONS_QA=1, serveur développement sur 127.0.0.1:3026, puis node --experimental-strip-types scripts/verify-affiliations.cjs.

Prochaine action exacte : rejouer ce scénario navigateur sur un poste suffisamment disponible, puis vérifier la connexion SDK en lecture seule hors du refus réseau EACCES du bac à sable. Faire valider les règles de chevauchement et de nouveau rattachement à un club inactif avant de les transformer en contraintes métier. Aucun changement de schéma, aucune donnée supprimée, aucun push, déploiement ou test d'écriture en production.

Résultat du dernier passage sur le code final : **32 tests réussis, lint global code 0, build global code 0**. Le build inclut le TypeScript global (réussi en 91 s), la génération des 17 pages statiques et la collecte des traces. Correspondance des quatre variables de classeur avec les IDs FEACO fournis : confirmée par comparaison booléenne, sans affichage de valeurs sensibles. Les limites SDK EACCES et navigateur/mémoire ci-dessus restent ouvertes.

## Correction du raccordement réel Athlètes — 7 novembre 2026

Cette section remplace, pour `/athletes` uniquement, les constats de démonstration du lot Acteurs précédent. Le lot précédent validait les interfaces avec des fixtures, pas leur raccordement réel aux données des acteurs.

### Cause reproduite et parcours corrigé

Avant : `app/athletes/page.tsx` → `getAthletes` dans `lib/data.ts` → `getSheetDataFrom` dans `lib/google-sheets.ts` → `readDemoSheet` dans `lib/local-demo.ts`. L’identifiant du classeur était ignoré par cet adaptateur ; les données fictives étaient donc systématiques. `lib/env.ts` exposait en outre une configuration locale factice pour ces anciens services. Il ne s’agissait pas d’un repli après erreur Google : aucune lecture Google n’était effectuée sur ce parcours. Le contrôle HTTP initial détectait effectivement les athlètes de démonstration.

Après : page et GET collection/détail → `getAthleteReadSnapshot` dans `lib/athletes-sheets-read.ts` → configuration existante chargée côté serveur → contrôle des ressources FEACO validées et des titres → lecture de `ATHLETES` dans `02_FEACO_ACTEURS`, et de `SEXES` dans le référentiel FEACO → projection publique explicite → liste et fiche en lecture seule. L’authentification demande exclusivement le scope Google Sheets readonly. Aucun identifiant de classeur provenant d’une requête utilisateur n’est accepté. Les valeurs de `.env.local` n’ont pas été affichées ni modifiées.

`id_athlete` demeure l’identifiant fédéral, traité comme du texte avec ses zéros initiaux. `id_wa` est facultatif. **`id_national` est exclu de la projection serveur : absent des réponses GET, des props client, des colonnes, de la fiche et de la recherche.** Aucun objet de ligne brute n’est renvoyé au navigateur. Les alias utiles des dates et du lieu de naissance sont conservés. Les médias restent non raccordés.

Une feuille vide ou ne contenant que les en-têtes produit `Aucun athlète enregistré`. Une configuration absente, une ressource incorrecte, des en-têtes incompatibles ou une erreur Google produisent une erreur explicite, jamais des fixtures ou une fausse liste vide. Les erreurs SDK sont assainies avant affichage pour ne pas divulguer de configuration. Les GET utilisent `Cache-Control: private, no-store`.

### Fichiers corrigés

- `lib/athlete-read-domain.ts`, `lib/athletes-sheets-read.ts` : contrat public, projection, erreurs et lecture réelle dédiée ; aucun import du lecteur de démonstration.
- `app/athletes/page.tsx`, `app/api/athletes/route.ts`, `app/api/athletes/[id]/route.ts` : source réelle commune à la page et aux lectures API. Les imports des anciens services de mutation sont différés dans les méthodes d’écriture déjà bloquées ; ils ne font pas partie de l’exécution GET.
- `components/athletes/athletes-read-client.tsx`, `components/athletes/athlete-read-detail.tsx` : recherche et fiche publiques, sans formulaire de mutation ni chargement automatique d’affiliations/licences. Les onglets non raccordés sont désactivés.
- `components/athletes/athletes-table.tsx`, `components/athletes/athletes-filters.tsx`, `components/actors/actor-table.tsx` : sous-ensemble public des champs, suppression de la colonne et de la recherche d’identifiant national sur Athlètes ; option de tableau conservant le comportement des autres familles.
- `components/dashboard/header.tsx` : possibilité d’indiquer le statut réel du parcours sans imposer la bannière de démonstration aux lectures réelles.

Les fixtures existantes restent disponibles pour les autres tests ; aucune option de démonstration ne peut remplacer les données du nouveau lecteur normal. `lib/data.ts`, `lib/local-demo.ts`, `lib/google-sheets.ts`, `lib/env.ts` et les services d’affiliation n’ont pas été réécrits par ce correctif. Les indicateurs qui verrouillent les mutations existantes n’ont pas été activés.

### Résultats effectivement observés

- Vérification Google réelle en lecture seule, via `node --experimental-strip-types scripts/check-athletes-live.mjs` : classeur `02_FEACO_ACTEURS`, feuille `ATHLETES`, **0 athlète**. Configuration FEACO vérifiée sans impression de ses valeurs. Une exécution hors sandbox a été nécessaire pour la connexion Google.
- `node --experimental-strip-types --test lib/athlete-read-domain.test.mjs` : **6 tests réussis** (vide, projection privée/publique, WA facultatif, alias, échec sans repli, configuration FEACO et schéma/IDs invalides).
- `node scripts/test-athlete-read-render.cjs` : **réussi**, rendu effectif de la liste et de la fiche sur une fixture uniquement en mémoire, avec ID fédéral et WA ; identifiant national et sa valeur sentinelle absents du HTML.
- TypeScript ciblé : **réussi**, `node --max-old-space-size=2048 node_modules/typescript/bin/tsc --project .actors-qa/tsconfig.athletes-read.json --noEmit`. Lint des fichiers corrigés : **réussi**. Le contrôle global n’est pas déclaré réussi : une tentative limitée à 1 Go a épuisé le heap, puis le contrôle global a rencontré des types Next générés en cours de remplacement (`TS6053`). La configuration ciblée ne modifie pas le `tsconfig.json` partagé et évite ces caches générés.
- Navigateur réel, `scripts/verify-athletes-live.cjs` avec URL locale 3037 et nombre attendu 0 : **réussi après hydratation**. Page et API concordent : `source: FEACO_ATHLETES`, **0 ligne**, aucun athlète fictif, aucun identifiant national dans le HTML/RSC ou JSON, GET d’une fiche absente en 404, création désactivée, zéro écriture, zéro requête d’affiliation et aucun débordement mobile. Captures desktop/mobile et résultat : `docs/actors-live/` ; captures examinées visuellement.

La feuille étant réellement vide, aucune fiche de personne réelle n’a pu être ouverte. La fiche est vérifiée par le rendu sur fixture isolée et par le contrat public ; aucune personne fictive n’a été ajoutée au classeur pour rendre ce contrôle possible.

Le serveur partagé sur 3006 renvoie bien la liste vide réelle, mais sa connexion WebSocket Next/HMR échoue et bloque l’initialisation des menus. Il n’a pas été arrêté ou remplacé. Une prévisualisation CLI séparée, avec son propre projet/cache sous `.actors-qa/athletes-read-preview`, lit les mêmes ressources réelles ; aucune `.env` n’y est copiée et toutes les méthodes d’écriture API y sont refusées. Le script `scripts/serve-athletes-read.cjs` permet de la relancer avec la configuration existante. Ce serveur reste disponible pour la vérification utilisateur.

**URL à ouvrir : http://127.0.0.1:3037/athletes**

Aucune affiliation commencée, aucune écriture activée, aucune donnée de test ajoutée aux classeurs, aucun push, merge, build ou déploiement.