# 🧠 L'Arène des Esprits — v2.0

Jeu d'énigmes en temps réel pour communauté WhatsApp.  
Stack : **React 18 + Vite + Tailwind CSS + Firebase + Framer Motion**

---

## 🚀 Installation rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer Firebase
cp .env.example .env.local
# → Remplis les valeurs Firebase dans .env.local

# 3. Lancer en développement
npm run dev

# 4. Build production
npm run build
```

---

## 🔥 Configuration Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
2. Crée un projet → Active **Authentication → Connexion anonyme**
3. Active **Firestore Database**
4. Copie les clés SDK dans `.env.local`

### Firestore Security Rules

Colle ces règles dans **Firestore → Rules** :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{questionCollection}/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow create: if request.auth != null
                    && request.auth.uid == uid
                    && !exists(/databases/$(database)/documents/artifacts/$(appId)/public/data/$(questionCollection)/$(uid))
                    && request.resource.data.uid == request.auth.uid
                    && request.resource.data.joueur is string
                    && request.resource.data.joueur.size() > 0
                    && request.resource.data.reponse is string
                    && request.resource.data.reponse.size() > 0
                    && request.resource.data.questionId is int
                    && request.resource.data.timestamp is int;
      allow update, delete: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🎮 Fonctionnement

| Créneau    | Énigme | Difficulté  | Points |
|------------|--------|-------------|--------|
| 08h – 10h  | Q1     | Facile      | 1 pt   |
| 10h – 12h  | Q2     | Moyen       | 2 pts  |
| 12h – 14h  | Q3     | Difficile   | 3 pts  |
| 14h – 16h  | Q4     | Expert      | 5 pts  |
| 16h – 18h  | Q5     | Moyen       | 2 pts  |

---

## 🔒 Anti-triche

- Chaque réponse est liée à l'**UID Firebase anonyme** de l'appareil
- L'UID persiste via **IndexedDB** — vider le cache ne suffit pas
- Les **Firestore Rules** bloquent tout doublon côté serveur
- La réponse est masquée par défaut (champ password) pour éviter l'espionnage

---

## 🛡️ Admin

Accès discret : champ invisible en bas de page → tape `admin123`

---

## 📁 Structure

```
src/
├── App.jsx              # Orchestrateur principal
├── firebase.js          # Config Firebase
├── questions.js         # Données des énigmes
├── index.css            # Styles globaux + utilitaires
└── components/
    ├── BackgroundFX.jsx  # Effets visuels de fond
    ├── Countdown.jsx     # Compte à rebours animé
    ├── ClosedScreen.jsx  # Écran "Arène fermée"
    ├── QuestionCard.jsx  # Carte d'énigme + formulaire
    ├── SuccessScreen.jsx # Confirmation de soumission
    └── AdminPanel.jsx    # Dashboard admin temps réel
```

---

## ☁️ Déploiement Vercel

```bash
# Option 1 : via CLI
npm i -g vercel
vercel --prod

# Option 2 : connecte ton repo GitHub à vercel.com
# → Ajoute les variables d'env dans Settings → Environment Variables
```
