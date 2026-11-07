# Lot territorial — 7 novembre 2026

Racines confirmées : `data/monosport/feaco-managment` et `data/monosport/fevoco-managment`, deux Git indépendants. Seul FEACO est modifié; ses fichiers sont déjà non suivis, conservés sans indexation. FEVOCO sert de référence pour tableaux, recherche, filtres, pagination, fiches et panneaux Sheet. Navigation existante déjà ordonnée Ligues → Ententes → Clubs.

Vérification initiale sans impression des valeurs : compte de service présent, IDs territoire et référentiel égaux aux deux IDs FEACO fournis. OAuth Drive et AUTH_SECRET absents, non nécessaires à la lecture territoriale. Aucune donnée d'acteur ni fichier privé à charger dans ce lot.

Métadonnées puis en-têtes lus sur Google Sheets le 7 novembre :

| Feuille | Colonnes exactes |
|---|---|
| LIGUES | id_ligue, nom_ligue, pseudo_ligue, email_ligue, id_province, statut, observations |
| ENTENTES | id_entente, code_entente, nom_entente, pseudo_entente, id_ligue, id_ville, email_entente, statut, observations |
| CLUBS | id_club, nom_club, id_categorie, id_sexe, date_affiliation, id_ville, id_entente, id_ligue, statut, observations, code_club |

Références disponibles : PROVINCES(id_province, nom_province), CATEGORIES_CLUB(id_categorie_club, nom_categorie_club), SEXES(id_sexe, nom_sexe), FORMATS_ID. Aucun référentiel VILLES fourni : conserver l'identifiant saisi, sans inventer un libellé. Catégorie club stockée dans `id_categorie`, résolue via `id_categorie_club`. Les pseudo/email FEACO remplacent sigle/email FEVOCO. Téléphone, dates de création/reconnaissance, code COC et logos absents : pas de saisie ni d'écriture dans ces colonnes.

FORMATS_ID confirmé : ligue 2 chiffres (26 existantes), entente ligue + code à 2 chiffres, club entente + code à 3 chiffres. Codes et identifiants traités comme texte; statut vide conservé. Modifier ne change jamais l'identifiant ni les codes/parents dont il dépend. Le cas club direct ligue est refusé. Les 26 codes de ligue sont fixes : ajout de ligue possible uniquement pour un code absent de 01–26; aucune 27e ligue inventée.

Plan : domaine et validation testables sans réseau; adaptateur Sheets séparé limité au territoire/référentiel FEACO; trois pages et API branchées au même chargement groupé; formulaires FEACO; contrôles techniques et navigateur en lecture seule. Créations/modifications testées avec adaptateur en mémoire, jamais avec les classeurs réels.

Accès : FEVOCO utilise des comptes et autorisations hébergés dans un autre classeur, absent du périmètre FEACO fourni. Ne pas copier ces comptes ni accepter ses cookies. Ce lot conserve un périmètre local strict, refus hors hôte loopback et contrôle d'origine identique au principe FEVOCO pour les écritures; toutes les autres mutations restent bloquées. Ce contrôle local ne remplace pas l'authentification multiutilisateur, nécessaire avant toute exposition réseau/déploiement. La version de vérification sera liée à 127.0.0.1.

## Réalisation

- `lib/territory-domain.ts` : colonnes exactes, validation serveur, parents existants/cohérents, unicité et IDs immuables ; service avec sérialisation locale des mutations.
- `lib/territory-sheets.ts` : lecteur limité aux deux IDs FEACO validés, deux lectures groupées pour territoire/références, cache partagé de 15 secondes et invalidation après écriture. Relecture fraîche avant validation et vérification des en-têtes avant persistance RAW, pour conserver les zéros et ne pas interpréter une saisie comme formule.
- `lib/territory-view.ts` : noms de parents résolus en mémoire par identifiant ; anomalie d'une ligue de club signalée. Références indisponibles conservées comme IDs, sans libellé inventé.
- `/ligues`, `/ententes`, `/clubs` : sources réelles dédiées, chargement, erreur explicite avec lien de reprise, listes vides, recherche/filtres/pagination, fiches et panneaux latéraux FEVOCO adaptés aux seules colonnes FEACO.
- Six routes API collection/détail : GET, POST et PATCH, réponses privées non mises en cache. Aucun endpoint de suppression ni upload activé.
- Formulaire club : sélection directe de l'entente, dont la ligue est déduite automatiquement ; les identifiants, codes et parents sont verrouillés en modification. La fiche de ligue présente ses ententes et clubs, sans section athlètes non raccordée. Les champs FIVB, équipes, acteurs et licences ne sont pas chargés dans ces pages. Les compteurs d'athlètes restent non renseignés.
- Tableau partagé : option `responsive` activée uniquement dans les composants territoriaux pour les cartes à largeur contrainte, la pagination empilée et l'état vide mobile. Les autres utilisateurs du tableau gardent leur fonctionnement.
- Navigation conservée dans l'ordre Ligues → Ententes → Clubs. Logo FEACO conservé. `.env.example` recréé sans valeurs sensibles : quatre variables actives, variables des lots futurs et options de vérification séparées.

## Tests sans production

`npm run test:territory` vérifie les règles de ligue/entente/club, dont la dérivation de ligue depuis l'unique entente choisie, les références, dates, statuts vides, doublons, modifications, persistance simulée, échec de persistance et concurrence locale. Les autres tests ciblés sont `npm run test:feaco`, `npm run test:dates` et `node --experimental-strip-types --test lib/mappers/territorial.test.mjs`.

Le test navigateur `scripts/verify-territory.cjs` utilise l'installation Playwright existante de FEVOCO en lecture seule. Le serveur de test utilise un instantané public des 26 ligues et des références dans `docs/territory-qa/fixture.json`, puis un stockage en mémoire. Il ne peut pas écrire dans Google Sheets. Ce mode exige les trois conditions `NODE_ENV=development`, `FEACO_TERRITORY_QA=1` et `FEACO_TERRITORY_TEST_FIXTURE=1`. Une bannière TEST SIMULE et `source: test` dans les API le distinguent explicitement ; aucun repli sur ces données n'a lieu après un échec Google.

Lancer un serveur neuf avant chaque passage (la mémoire contient ensuite les créations simulées) :

```powershell
$env:FEACO_TERRITORY_QA = '1'
$env:FEACO_TERRITORY_TEST_FIXTURE = '1'
npm run dev -- --port 3016
```

Dans un autre terminal : `node scripts/verify-territory.cjs`. Captures et résultats : `docs/territory-qa/`. Le répertoire de compilation QA est ignoré par Git. Les scripts dev/start écoutent exclusivement sur 127.0.0.1.

## Limite de connexion réelle constatée

La lecture depuis le processus local de test rencontre `EACCES` avant réponse HTTP de Google : l'environnement d'exécution bloque l'accès réseau. Les deux IDs et les formats email/clé ont été contrôlés sans impression des valeurs. Le connecteur Google a confirmé en lecture seule les 26 ligues et l'absence d'ententes/clubs sur toute la colonne d'identifiants. Ne pas confondre cette lecture du connecteur avec une connexion serveur Google réussie. Aucun droit d'écriture réel n'a été testé.

Prochaine action exacte pour le mode réel : depuis un terminal ayant accès à Google, retirer les deux options QA/test du processus, lancer `npm run dev`, puis vérifier en GET `/api/ligues` (26 codes 01–26), `/api/ententes` et `/api/clubs` (vides). Aucune nouvelle variable n'est nécessaire à ce contrôle. Ne pas lancer de création/modification de test sur les classeurs réels. Avant un déploiement ou un accès réseau partagé, porter les sessions et permissions FEACO ; le contrôle local de ce lot n'est pas une authentification multiutilisateur.

La sérialisation garantit l'unicité dans le processus local et relit les données avant mutation ; Google Sheets ne fournit pas de transaction d'unicité face à un éditeur externe concurrent. Aucun changement de schéma ni appel de formatage des classeurs.
Les scripts dev et build utilisent explicitement Webpack : lors de la verification sous Windows, un redemarrage Turbopack ne decouvrait plus les routes dynamiques pourtant presentes. Un cache QA neuf et Webpack reconnaissent /api/ligues/[id]. Aucun cache du serveur initial n’a ete supprime.

Les caches de compilation restent distincts : `.next-feaco` en usage normal, `.next-territory-qa-webpack` en QA ; les anciens caches sont conserves. Le build est limite a deux workers pour cette machine de 8 Go. Les validations navigateur sont realisees en plusieurs passages, avec verification finale des donnees simulees et des trois ecrans mobiles dans `territory-qa/results-final.json`.

## Resultats finaux du lot

19 tests cibles reussis, lint reussi, build Webpack reussi (compilation, TypeScript strict, generation et traces), puis npm run typecheck reussi. Les interactions territoriales desktop sont validees en plusieurs passages ; la derniere verification confirme les trois entites modifiees en memoire, leurs IDs/codes/parents et les trois pages mobiles sans debordement ni erreur JavaScript. Les etats vides sont visibles sur mobile. Captures inspectees : liste ligues desktop, clubs mobile et clubs mobile vide. Le serveur QA est arrete. Les limites de connexion reelle et la prochaine action restent celles indiquees ci-dessus.
