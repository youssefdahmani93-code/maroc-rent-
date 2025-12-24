# Guide d'Installation de GoRent avec Docker

Ce guide vous explique comment installer et lancer l'application GoRent sur votre machine en utilisant Docker. Docker permet de lancer l'application dans un environnement isolé et pré-configuré, ce qui simplifie grandement l'installation.

---

## Prérequis

Avant de commencer, vous devez installer **Docker Desktop** sur votre machine.

1.  **Téléchargez Docker Desktop** depuis le site officiel : [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2.  Suivez les instructions d'installation pour votre système d'exploitation (Windows ou macOS).
3.  Après l'installation, lancez Docker Desktop. Attendez que l'icône de Docker dans la barre des tâches devienne stable (verte ou blanche), indiquant que le service est en cours d'exécution.

---

## Installation de GoRent

Suivez ces étapes pour configurer et lancer l'application.

### Étape 1 : Préparer le fichier de configuration

Dans le dossier du projet que vous avez reçu, vous trouverez un fichier nommé `.env.example`.

1.  Faites une copie de ce fichier et renommez la copie en `.env`.
2.  Ouvrez le fichier `.env` avec un éditeur de texte (comme le Bloc-notes).
3.  **(Important)** Modifiez la ligne `JWT_SECRET`. Remplacez la valeur par défaut par une phrase secrète longue et aléatoire. Vous pouvez utiliser un générateur de mots de passe en ligne pour créer une clé sécurisée.

    Exemple :
    `JWT_SECRET=MaSuperPhraseSecretePourGoRent_!@#%^&*()_2025`

    *Note : Vous pouvez également changer les mots de passe de la base de données si vous le souhaitez, mais ce n'est pas obligatoire pour une installation locale.*

### Étape 2 : Lancer l'application

1.  Ouvrez un terminal ou une invite de commande sur votre machine :
    *   **Sur Windows :** Tapez `cmd` ou `PowerShell` dans le menu Démarrer.
    *   **Sur macOS :** Ouvrez l'application `Terminal`.

2.  Naviguez jusqu'au dossier du projet GoRent en utilisant la commande `cd`. 

    Exemple :
    ```sh
    cd C:\Users\VotreNom\Desktop\gorent
    ```

3.  Une fois que vous êtes dans le bon dossier, exécutez la commande suivante. Cette commande va construire et démarrer toutes les composantes de l'application (Base de données, Backend, Frontend). Cela peut prendre quelques minutes la première fois.

    ```sh
    docker-compose up -d --build
    ```

    L'option `-d` permet de lancer l'application en arrière-plan.

### Étape 3 : Accéder à l'application

C'est tout ! L'application est maintenant en cours d'exécution.

Ouvrez votre navigateur web (Chrome, Firefox, etc.) et allez à l'adresse suivante :

[http://localhost](http://localhost)

Vous devriez voir la page de connexion de GoRent. Vous pouvez vous connecter avec les identifiants par défaut et commencer à utiliser l'application.

---

## Commandes Utiles

*   **Pour arrêter l'application :**
    Naviguez jusqu'au dossier du projet dans un terminal et exécutez :
    ```sh
    docker-compose down
    ```

*   **Pour redémarrer l'application (si elle est déjà en cours d'exécution) :**
    ```sh
    docker-compose restart
    ```
*   **Pour redémarrer l'application (si elle est déjà en cours d'exécution) :**
    ```sh
    docker-compose restart
    ```

---

## 🚀 Déploiement en Production

Pour déployer GoRent sur GitHub et Vercel, consultez le guide complet de déploiement :

📖 **[Guide de Déploiement](DEPLOYMENT.md)**

Le guide couvre :
- Configuration de la base de données Neon (PostgreSQL)
- Déploiement du frontend sur Vercel
- Déploiement du backend sur Railway
- Configuration des variables d'environnement
- Dépannage et support

### Démarrage Rapide

1. **Base de données** : Créez un compte sur [Neon](https://neon.tech)
2. **GitHub** : Poussez votre code sur GitHub
3. **Frontend** : Déployez sur [Vercel](https://vercel.com)
4. **Backend** : Déployez sur [Railway](https://railway.app)

---

## 📁 Structure du Projet

```
go-rent/
├── frontend/          # Application React/Vite
├── backend/           # API Node.js/Express
├── docker/            # Configuration Docker
├── docs/              # Documentation
├── DEPLOYMENT.md      # Guide de déploiement
└── README.md          # Ce fichier
```

---

## 🛠️ Technologies Utilisées

- **Frontend** : React, Vite, TailwindCSS
- **Backend** : Node.js, Express, Sequelize
- **Base de données** : PostgreSQL
- **Déploiement** : Vercel (Frontend), Railway (Backend), Neon (Database)
