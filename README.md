# FEACO — Fédération d’Athlétisme du Congo

Dépôt indépendant dans SNDS-RDC. FEVOCO est la référence en lecture seule des interfaces.

Les pages **Ligues, Ententes et Clubs** utilisent un service Google Sheets limité aux ressources FEACO validées. Les autres blocs restent en démonstration locale ; leurs mutations et les uploads restent bloqués. L'accès territorial de ce lot est local uniquement, sans reprise des comptes FEVOCO. Une authentification multiutilisateur reste nécessaire avant toute exposition réseau.

```powershell
npm ci
npm run dev
```

Application sur http://127.0.0.1:3006. Les scripts dev/start écoutent sur la boucle locale. Préparer `.env.local` à partir de `.env.example` sans écraser un fichier existant. Les quatre variables actives du territoire sont `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `FEACO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID` et `FEACO_REFERENTIELS_SPREADSHEET_ID`. La lecture nécessite le partage des classeurs avec le compte de service ; les enregistrements réels nécessitent ses droits d'écriture.

Voir [mapping, règles, tests et limites du territoire](docs/FEACO_TERRITORY.md), [validation](docs/FEACO_VALIDATION.md), [matrice historique](docs/FEACO_INTERFACE_MATRIX.md) et [écarts](docs/FEACO_BUSINESS_GAPS.md).

Contrôles : `npm run test:territory`, `npm run test:feaco`, `npm run test:dates`, `npm run typecheck`, `npm run lint`, `npm run build`. Aucun push, déploiement ou écriture de test dans les classeurs de production.