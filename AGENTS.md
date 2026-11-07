# FEACO — instructions d’harmonisation

Modifier uniquement ce projet. Consulter `docs/FEACO_INTERFACE_MATRIX.md` avant de porter une interface et `docs/FEACO_BUSINESS_GAPS.md` avant de concevoir une règle métier.

FEVOCO local est la référence visuelle exclusive. Conserver composants, styles, dimensions, navigation, sections et modalités d’ouverture observés. Ligue → Entente → Club → Athlète; aucune équipe de club, équipes nationales distinctes. Détail ligue en sections. Reprendre les indicateurs réellement présents, sans en ajouter.

Territoire : avant toute intervention sur les ligues, ententes ou clubs, lire `docs/FEACO_TERRITORY.md` pour le mapping Sheets, les validations serveur, les protections locales et les tests. Ce bloc utilise `lib/territory-sheets.ts`, limité aux ressources FEACO validées. Les services encore branchés sur `lib/local-demo.ts` via `lib/google-sheets.ts` restent en démonstration, mutations refusées. Un succès de sauvegarde exige la persistance du service sélectionné ; le stockage simulé est explicitement signalé. Vérifier les classeurs de production en lecture seule et tester les mutations sur stockage simulé. Toute règle volleyball reste isolée du parcours athlétisme et documentée.

Réutiliser `lib/compact-date.ts` pour les dates; date vide conservée, validation calendaire réelle, séparateurs automatiques. Préserver clavier, tactile, responsive et fermeture/annulation des panneaux. Vérifier typage, lint, build, interactions et comparaison visuelle; consigner les limites dans `docs/FEACO_VALIDATION.md`.

Aucun secret, donnée personnelle FEVOCO, configuration production, push, merge ou déploiement. Préserver les changements locaux existants.
