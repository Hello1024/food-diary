# Journal Alimentaire - Roxane

Une application web mobile pour enregistrer et suivre un journal alimentaire détaillé.

## 🌟 Fonctionnalités

- **Interface mobile responsive** - Optimisée pour smartphones et tablettes
- **Formulaire complet** - Capture tous les aspects requis des repas
- **Stockage local** - Données sauvegardées sur l'appareil
- **Export Excel/CSV** - Format compatible avec le modèle fourni
- **Application Progressive Web App (PWA)** - Installation possible sur mobile
- **Mode hors ligne** - Fonctionne sans connexion internet
- **Historique** - Consultation et modification des repas passés

## 📋 Champs enregistrés

Le formulaire capture toutes les informations requises :

- **Identification** : Nom, Date, Période du repas
- **Contexte** : Heure/durée, Lieu, Compagnie, Préparation, Activités
- **Contenu** : Composition détaillée, Repas terminé ou non  
- **Pensées** : Avant/pendant/après le repas (avec intensité 1-10)
- **Sensations** : Sensations physiques (avec intensité 1-10)
- **Comportements** : Vomissements/laxatifs, Accès boulimique, Exercice
- **Remarques** : Observations supplémentaires

## 🚀 Installation et utilisation

### Option 1 : Serveur local simple

```bash
# Naviguer vers le dossier
cd roxane-food-diary

# Démarrer un serveur HTTP local (Python 3)
python3 -m http.server 8000

# Ou avec Python 2
python -m SimpleHTTPServer 8000

# Ou avec Node.js (si npx est installé)
npx http-server

# Ouvrir dans le navigateur
# http://localhost:8000
```

### Option 2 : Serveur de développement

```bash
# Avec Live Server (VS Code extension)
# Clic droit sur index.html > "Open with Live Server"

# Ou avec autres serveurs web locaux
```

### Option 3 : Installation PWA

1. Ouvrir l'application dans un navigateur mobile
2. Ajouter à l'écran d'accueil quand proposé
3. Utiliser comme application native

## 📱 Utilisation

1. **Nouveau repas** : Remplir le formulaire et enregistrer
2. **Historique** : Consulter, modifier ou supprimer les repas
3. **Export** : Télécharger les données au format CSV/Excel

## 📊 Format d'export

L'export génère un fichier avec les colonnes exactes du format demandé :

- Colonnes par période : Matin, Matinée, Midi, Après-Midi, Soir
- Informations détaillées sur chaque repas
- Échelles d'intensité pour les pensées et sensations
- Format compatible avec Excel et autres tableurs

## 🛠️ Structure technique

```
roxane-food-diary/
├── index.html          # Interface principale
├── styles.css          # Styles responsive
├── app.js             # Logique application
├── manifest.json      # Configuration PWA
├── sw.js             # Service Worker (offline)
└── README.md         # Documentation
```

## 💾 Stockage des données

- **Local** : Données stockées dans le navigateur (localStorage)
- **Persistant** : Les données restent même après fermeture
- **Exportable** : Sauvegarde possible via export CSV/Excel
- **Privé** : Aucune donnée envoyée sur internet

## 🔧 Personnalisation

Pour adapter l'application :

1. **Champs** : Modifier le formulaire dans `index.html`
2. **Style** : Personnaliser l'apparence dans `styles.css`
3. **Logique** : Adapter les fonctionnalités dans `app.js`
4. **Export** : Modifier le format d'export si nécessaire

## 🌐 Compatibilité

- **Navigateurs** : Chrome, Firefox, Safari, Edge (modernes)
- **Appareils** : Smartphones, tablettes, ordinateurs
- **Systèmes** : iOS, Android, Windows, macOS, Linux
- **Offline** : Fonctionne sans connexion internet

## 🔒 Confidentialité

- Toutes les données restent sur l'appareil
- Aucune transmission vers des serveurs externes
- Contrôle total de l'utilisateur sur ses données
- Export possible pour sauvegarde personnelle

## 🆘 Dépannage

**L'application ne se charge pas :**
- Vérifier que le serveur web fonctionne
- Tester dans un autre navigateur
- Vider le cache du navigateur

**Les données disparaissent :**
- Éviter le mode navigation privée
- Ne pas vider les données du navigateur
- Exporter régulièrement pour sauvegarde

**L'export ne fonctionne pas :**
- Vérifier que des données sont enregistrées
- Autoriser les téléchargements dans le navigateur
- Tester dans un autre navigateur

## 📈 Améliorations futures possibles

- Synchronisation cloud optionnelle
- Graphiques et statistiques
- Rappels et notifications
- Export PDF avec mise en forme
- Sauvegarde automatique

---

*Application développée pour un usage personnel de suivi alimentaire.*
