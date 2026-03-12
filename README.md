# Interface de Contrôle ESP32

Interface web moderne pour contrôler une LED connectée à un ESP32 via ThingSpeak.

## 🚀 Installation

1. Clonez ce dépôt
2. Modifiez les clés API dans `script.js` :
   - `writeApiKey` : Votre Write API Key ThingSpeak
   - `readApiKey` : Votre Read API Key ThingSpeak
   - `channelId` : Votre Channel ID

3. Publiez sur GitHub Pages :
   - Créez un dépôt sur GitHub
   - Uploadez les fichiers
   - Activez GitHub Pages dans Settings

## 🎮 Utilisation

- Cliquez sur **ALLUMER** pour envoyer la commande d'allumage
- Cliquez sur **ÉTEINDRE** pour éteindre la LED
- L'état est automatiquement rafraîchi toutes les 15 secondes
- L'historique et le graphique montrent les commandes récentes

## 📊 Fonctionnalités

- Interface responsive (mobile/desktop)
- LED animée en temps réel
- Graphique d'historique
- Notifications de succès/erreur
- Historique des commandes
- Indicateur de connexion
- Rafraîchissement automatique
- Design moderne avec animations

## 🔧 Personnalisation

Modifiez les variables dans `script.js` pour ajuster :
- `refreshInterval` : Intervalle de rafraîchissement (ms)
- `maxHistoryItems` : Nombre d'éléments dans l'historique
- Couleurs dans `style.css`