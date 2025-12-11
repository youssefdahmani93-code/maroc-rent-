# RentMaroc - Application de Gestion de Location de Voitures

Application professionnelle complète pour la gestion d'agences de location de voitures au Maroc.

## 🏗 Architecture Technique

Le projet est conçu comme une Single Page Application (SPA) moderne.

*   **Frontend** : React 18 (Hooks, Context API), TypeScript, Tailwind CSS, Recharts (Data Viz), Lucide React (Icons).
*   **Backend (Cible)** : Node.js (Express) ou Python (Django/FastAPI).
*   **Base de Données (Cible)** : PostgreSQL.

## 🚀 Installation & Démarrage (Frontend)

1.  **Pré-requis** : Node.js v18+ installé.
2.  **Installation des dépendances** :
    ```bash
    npm install
    ```
3.  **Lancer le serveur de développement** :
    ```bash
    npm start
    ```
    L'application sera accessible sur `http://localhost:3000`.

## 🐳 Déploiement (Docker & Nginx)

L'application est prête pour un déploiement conteneurisé.

### 1. Dockerfile
Créez un fichier `Dockerfile` à la racine :

```dockerfile
# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Copier la config Nginx personnalisée si besoin
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Docker Compose
Pour orchestrer avec le backend et la base de données :

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    image: rentmaroc-api:latest
    environment:
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASS=secret
    ports:
      - "5000:5000"

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: rentmaroc_db
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## 🔐 Gestion des Rôles (RBAC)

L'application gère nativement les rôles suivants :
*   **ADMIN** : Accès total.
*   **MANAGER** : Gestion opérationnelle (pas d'accès aux paramètres système avancés).
*   **AGENT** : Gestion des réservations et clients uniquement.
*   **COMPTABLE** : Accès aux factures et rapports financiers.
*   **MÉCANICIEN** : Accès module maintenance et flotte uniquement.

Pour tester, utilisez les boutons "Connexion Rapide" sur la page de login.
