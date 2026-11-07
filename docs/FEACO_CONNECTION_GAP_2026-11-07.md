# Raccordement FEACO — état et tâches

## Audit initial

Racines Git vérifiées : `C:/Projets/SNDS-RDC/data/monosport/feaco-managment` et `C:/Projets/SNDS-RDC/data/monosport/fevoco-managment`. FEACO : aucun remote, tous les fichiers applicatifs préexistants non suivis, aucun nettoyage ni indexation. Absence de `.env.local` et `.vercel`; `lib/env.ts` contient uniquement des identifiants locaux. FEVOCO : remote `https://github.com/Rodanyoca/saas_fevoco.git`, consulté en lecture seule. Git exécuté avec `-c safe.directory=<racine exacte>` sans changer la configuration globale.

Consignes et sources : AGENTS et README des deux dépôts, matrice, écarts, suivi, validation FEACO; pages, composants, mappers, actor-records, google-sheets, proxy et services médias des deux dépôts. Les anciennes mentions SNDS-HARMONISATION dans les documents historiques ne sont pas les chemins actuels.

## Rapport d'écart

| Domaine | Reprendre | Adapter / risque |
|---|---|---|
| Pages, composants, formulaires | Listes/fiches territoriales, six acteurs, recherche, filtres, panneaux et composants UI déjà portés | Données de démonstration et anciens champs FEVOCO; dates FEACO `date_naissance`, `lieu_naissance`; club `id_categorie` |
| Territoire | Ligues → ententes → clubs | Codes texte 01–26 confirmés; `FORMATS_ID` : entente 4 chiffres + `code_club` 3 chiffres. Club direct ligue à confirmer |
| Acteurs | ATHLETES, COACHS, OFFICIELS, ARBITRES, MEDECINS, AUTRES | Identifiant fédéral, id_wa, id_national distincts; anciens idFivb encore présents dans des contrats historiques, à retirer dans le lot formulaires; jamais une licence déduite de id_national |
| Affiliations | Affichage d'historiques | Clés `id_affiliation_athlete/coach/medecin`, `id_saison`, `id_statut_affiliation`; pas de transfert/compteur automatique. Officiels via MANDATS, pas OFFICIELS_AFFILIATIONS |
| Compétitions | Conteneurs/tableaux de l'interface | Nouveau domaine édition → épreuve → participant et phase → résultat. Aucun modèle match/set/poule à brancher |
| Routes API/services | Organisation serveur, batchGet et filtrage avant enrichissement observés dans FEVOCO | FEACO lit local-demo; mutations refusées par proxy ET services. Ne pas remplacer globalement le lecteur par Sheets avant adaptation de tous les consommateurs |
| Permissions | FEVOCO dispose désormais de sessions, activation et autorisation de routes dans proxy.ts | La copie FEACO n'a pas ce socle. Bloquant pour données personnelles réelles, documents et pièces d'identité; pas de lecture privée via URL publique |
| Activités/Documents | Écrans et relations présents | En-têtes réels archivés; raccorder après validation du premier parcours et protections |

Hors périmètre de ce lot : relais, homologation des records, équipes nationales, licences, transfert automatique, publication et déploiement.

## Lecture réelle des classeurs

Les sept IDs fournis ont été vérifiés via le connecteur, métadonnées puis ligne d'en-tête de chaque onglet. Snapshot sans données personnelles : `feaco-sheets-schema.json` (IDs, noms exacts, sheetId, en-têtes, FORMATS_ID, EPREUVES et 26 ligues). Toutes les lectures sont bornées, aucune écriture. `TABLEAU_DE_BORD!A1` est un titre, pas une table métier.

Écarts à documenter sans changer le schéma : `CLUBS.id_categorie` face à `CATEGORIES_CLUB.id_categorie_club`; aucun onglet VILLES, NIVEAUX_COACHS ou SPECIALITES_MEDECINS dans le référentiel fourni malgré des clés correspondantes dans les acteurs/structures. Préserver ces IDs et signaler l'absence de libellés, sans inventer de référentiels. AUTRES ne possède pas id_wa/id_national. Les statuts sans marque ne sont pas du texte à stocker dans performance : statut séparé et performance vide.

## Tâches ordonnées

- [x] Audit des racines, isolation et en-têtes réels des sept classeurs.
- [x] Lot 1 : contrats locaux FEACO, projection publique des listes, identités distinctes, clés d'affiliation, format club, résultats individuels et formatage selon unité; tests de parcours locaux sans I/O.
- [x] Corrections initiales des mappers existants : idWa distinct, dates/lieu FEACO, catégorie club.
- [ ] Lot 2 : porter les protections FEVOCO sessions/permissions vers les ressources FEACO, puis lecteur Sheets groupé strictement limité aux sept IDs, mode distant explicite sans repli silencieux vers la démo.
- [ ] Lot 3 : brancher listes/fiches/formulaires territoriaux et six acteurs, affiliations par saison/statut; retirer les contrats FIVB et les dépendances licences/transferts du parcours actif.
- [ ] Lot 4 : brancher le domaine individuel aux écrans compétition et saisies validées côté serveur; validation navigateur 100 m, hauteur, poids et sans marque sur stockage de test isolé.
- [ ] Après validation métier du parcours : Activités et Documents, autorisation des fichiers et confidentialité vérifiées.

Les tests du domaine ne constituent pas une validation du parcours en interface ni une connexion distante. Les mutations restent interdites. Prochaine action exacte : concevoir et porter le contrôle d'accès FEACO depuis `FEVOCO/proxy.ts` et `lib/auth`, avant d'exposer les acteurs réels.

## Variables et configuration

`.env.example` décrit les variables réellement lues par les anciens services médias. Aucun secret présent; aucune variable nécessaire aux tests locaux. Les IDs Sheets vérifiés sont archivés dans le snapshot et ne sont pas encore consommés par `lib/env.ts`. Ne pas faire croire que définir des variables suffit à raccorder la démo.

Pour un futur test OAuth médias, renseigner dans `.env.local` FEACO : `GOOGLE_CLIENT_ID` (client OAuth), `GOOGLE_CLIENT_SECRET` (secret du client), `GOOGLE_REFRESH_TOKEN` (jeton d'un compte autorisé uniquement aux ressources FEACO), `GOOGLE_DRIVE_ROOT_FOLDER_ID` (racine avatars FEACO). Les dossiers optionnels par catégorie sont détaillés dans `.env.example`. Documents et logos restent désactivés dans env.ts; leurs paramètres de dossiers devront être raccordés après autorisation d'accès. Attendre confirmation explicite de l'utilisateur après ajout avant tout test dépendant. Aucun test distant de ce type exécuté dans le lot 1.
