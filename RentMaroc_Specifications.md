# Spécifications Techniques - RentMaroc

## 1. Présentation du Projet
**Nom du projet** : RentMaroc
**Description** : Plateforme web professionnelle de gestion pour agences de location de voitures au Maroc.
**Langue** : Français (Support internationalisation prévu).
**Objectifs** :
- Centraliser la gestion de la flotte, des réservations, des clients et des contrats.
- Offrir une interface moderne, intuitive et responsive.
- Automatiser la génération de documents (contrats, factures).
- Fournir des outils d'analyse et de reporting.

## 2. Types d'Utilisateurs & Permissions

| Rôle | Permissions |
| :--- | :--- |
| **Super Admin** | Accès total, gestion multi-agences, configuration système, rapports globaux. |
| **Gestionnaire d'Agence** | Gestion flotte locale, personnel, prix, disponibilités. |
| **Agent de Réservation** | Création/Modification réservations, gestion clients, contrats. |
| **Comptable** | Gestion paiements, factures, exports financiers. |
| **Mécanicien** | Suivi maintenance, mise à jour état véhicules. |
| **Client** | Portail public : recherche, réservation, upload documents, paiement. |

## 3. Fonctionnalités Principales

### A. Gestion de Flotte
- **CRUD Véhicule** : Marque, modèle, matricule, VIN, catégorie, photos, état, km, carburant, boîte, assurance.
- **Suivi** : État en temps réel (Disponible, Loué, Maintenance).
- **Organisation** : Filtrage par agence et ville.

### B. Réservations & Contrats
- **Moteur de Réservation** : Dates, lieux (retrait/retour), options (chauffeur, siège bébé).
- **Tarification Dynamique** : Calcul auto (jour/semaine/mois), promotions, frais (retard, km).
- **Contrats** : Génération PDF (Infos, Permis, Caution, CGV). Signature numérique.

### C. Paiements & Cautions
- **Méthodes** : Espèces, Carte, Virement, En ligne (CMI/Stripe).
- **Cautions** : Gestion des empreintes bancaires (Blocage/Release).
- **Documents** : Reçus et Factures PDF.

### D. Maintenance & Assurance
- **Suivi** : Historique entretiens, coûts, kilométrage.
- **Alertes** : Expiration assurance/visite technique, maintenance périodique.

### E. Rapports & KPI
- **Dashboard** : Taux d'occupation, Revenus, Véhicules disponibles.
- **Exports** : Rapports financiers et opérationnels (PDF/Excel).

### F. Notifications
- **Canaux** : Email, SMS, In-App.
- **Triggers** : Confirmation résa, Rappel retour, Alertes maintenance.

## 4. Architecture & Stack Technique

### Choix Technologiques
- **Frontend** : **React (Vite)**
    - *Justification* : Performance, écosystème riche (PDF, Charts), composants réutilisables, forte communauté.
- **Backend** : **Node.js (Express)**
    - *Justification* : Non-bloquant (I/O), même langage que le front (JS/TS), excellent pour API REST.
- **Base de Données** : **PostgreSQL**
    - *Justification* : Robuste, relationnel, supporte JSONB, standard industriel.
- **Authentification** : **JWT** (Access/Refresh Tokens).
- **Déploiement** : **Docker Compose** + **NGINX** (Reverse Proxy & SSL).

### Architecture Globale
```mermaid
graph TD
    Client[Client Browser] -->|HTTPS| NGINX[NGINX Reverse Proxy]
    NGINX -->|Static| React[React App (Frontend)]
    NGINX -->|API /api| Node[Node.js Express (Backend)]
    Node -->|SQL| DB[(PostgreSQL)]
    Node -->|Storage| FileStore[Local/S3 (Images/PDF)]
```

## 5. Interface Utilisateur (UI/UX) - Liste des Pages

### Espace Administration (Back-office)
1.  **Login** : Authentification sécurisée.
2.  **Dashboard** : Vue d'ensemble (KPIs, Graphiques, Alertes).
3.  **Flotte** :
    - *Liste* : Tableau filtrable des véhicules.
    - *Détail/Édition* : Fiche complète véhicule + Maintenance.
4.  **Planning** : Vue calendrier des réservations (Gantt/Calendrier).
5.  **Réservations** :
    - *Liste* : Statuts (En attente, Confirmé, En cours, Terminé).
    - *Création* : Wizard de réservation (Client -> Véhicule -> Options -> Paiement).
6.  **Clients** : Base de données clients (CRM léger).
7.  **Contrats & Factures** : Historique et génération PDF.
8.  **Maintenance** : Suivi des interventions et alertes.
9.  **Paramètres** : Gestion utilisateurs, agences, tarifs.

### Espace Client (Front-office)
1.  **Accueil** : Recherche véhicule (Dates/Lieux).
2.  **Résultats** : Liste véhicules disponibles avec filtres.
3.  **Détail Véhicule** : Photos, caractéristiques, prix.
4.  **Tunnel Réservation** : Options, Infos conducteur, Paiement.
5.  **Espace Perso** : Mes réservations, Documents.

## 6. API Endpoints (Exemples)

### Auth
- `POST /api/auth/login` : Connexion.
- `POST /api/auth/refresh` : Rafraîchir token.

### Véhicules
- `GET /api/vehicles` : Liste (filtres: agence, dispo).
- `POST /api/vehicles` : Créer véhicule.
- `GET /api/vehicles/{id}` : Détails.
- `PUT /api/vehicles/{id}/status` : Mise à jour état.
    ```json
    { "status": "maintenance", "reason": "Vidange" }
    ```

### Réservations
- `POST /api/reservations` : Créer réservation.
    ```json
    {
      "client_id": 12,
      "vehicle_id": 45,
      "start_date": "2023-11-25T10:00:00Z",
      "end_date": "2023-11-28T10:00:00Z",
      "pickup_agency": 1,
      "return_agency": 2
    }
    ```
- `GET /api/reservations/{id}` : Détails + Contrat.

### Rapports
- `GET /api/reports/occupation?from=...&to=...` : Stats occupation.

## 7. Modèle de Données (Schéma Simplifié)

- **users** : `id, email, password_hash, role, agency_id`
- **agencies** : `id, name, city, address, phone`
- **vehicles** : `id, agency_id, make, model, year, plate, vin, status, category, daily_rate`
- **clients** : `id, first_name, last_name, phone, email, license_number`
- **reservations** : `id, client_id, vehicle_id, start_date, end_date, status, total_price`
- **payments** : `id, reservation_id, amount, method, status`
- **maintenances** : `id, vehicle_id, type, cost, date, description`

## 8. Instructions de Déploiement

### Pré-requis
- Docker & Docker Compose installés.

### Structure Docker
- **frontend/** : `Dockerfile` (Build React -> Nginx static).
- **backend/** : `Dockerfile` (Node.js).
- **nginx/** : `nginx.conf` (Reverse proxy global).
- **docker-compose.yml** : Orchestration.

### Commandes
1.  **Build & Start** :
    ```bash
    docker-compose up --build -d
    ```
2.  **Logs** :
    ```bash
    docker-compose logs -f
    ```
3.  **Migration DB** :
    ```bash
    docker-compose exec backend npm run migrate
    ```

---
*Généré par Antigravity pour RentMaroc*
