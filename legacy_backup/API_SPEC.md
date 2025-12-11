# Spécifications de l'API RESTful - RentMaroc

Ce document décrit les endpoints de l'API nécessaires pour alimenter l'application frontend **RentMaroc**.
L'API doit respecter les conventions RESTful et retourner des réponses au format JSON.

## 1. Authentification & Sécurité

*   **Méthode** : Bearer Token (JWT).
*   **Header** : `Authorization: Bearer <token>`
*   **Sécurité** : Toutes les routes `/api/` sont protégées, sauf `/api/auth/login`.

### Endpoints Auth

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Connexion utilisateur. Retourne le JWT et le profil utilisateur. |
| `POST` | `/api/auth/refresh` | Rafraîchir le token. |
| `POST` | `/api/auth/logout` | Invalidier le token. |

#### Exemple Réponse Login
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "u1",
    "name": "Ahmed Tazi",
    "email": "admin@gorent.ma",
    "role": "ADMIN",
    "permissions": { ... }
  }
}
```

---

## 2. Véhicules (Fleet)

Gestion de la flotte automobile.

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vehicles` | Liste de tous les véhicules (supporte filtres `?status=AVAILABLE`). |
| `POST` | `/api/vehicles` | Créer un nouveau véhicule. |
| `GET` | `/api/vehicles/{id}` | Détails d'un véhicule. |
| `PUT` | `/api/vehicles/{id}` | Mise à jour complète. |
| `PATCH` | `/api/vehicles/{id}/status` | Mise à jour rapide du statut (ex: "MAINTENANCE"). |
| `DELETE` | `/api/vehicles/{id}` | Suppression (soft delete). |

#### Structure JSON (Vehicle)
*Note : Les clés sont en camelCase pour correspondre au Frontend React.*

```json
{
  "id": "v1",
  "brand": "Dacia",
  "model": "Logan",
  "version": "Laureate",
  "year": 2024,
  "plate": "12345-A-6",
  "vin": "VF1...",
  "category": "ECONOMY",
  "status": "AVAILABLE",
  "dailyRate": 250,
  "fuel": "DIESEL",
  "transmission": "MANUAL",
  "mileage": 15000,
  "agencyId": "Casablanca Aéroport",
  "imageUrl": "https://...",
  "insuranceExpiry": "2025-01-15",
  "techVisitExpiry": "2026-01-15"
}
```

---

## 3. Réservations (Reservations)

Gestion du planning et des locations.

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reservations` | Liste des réservations (filtres `?from=DATE&to=DATE`). |
| `POST` | `/api/reservations` | Créer une réservation. |
| `GET` | `/api/reservations/{id}` | Détails. |
| `PUT` | `/api/reservations/{id}` | Modification (dates, véhicule). |
| `PATCH` | `/api/reservations/{id}/status` | Changer statut (CONFIRMED, CANCELLED, COMPLETED). |

#### Structure JSON (Reservation)
```json
{
  "id": "RES-1001",
  "vehicleId": "v1",
  "clientId": "c1",
  "clientName": "Omar Benjelloun",
  "startDate": "2024-06-01T10:00:00Z",
  "endDate": "2024-06-05T10:00:00Z",
  "pickupLocation": "Casablanca Aéroport",
  "returnLocation": "Casablanca Aéroport",
  "totalPrice": 1250,
  "status": "CONFIRMED"
}
```

---

## 4. Clients (Clients)

Base de données clients (CRM).

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/clients` | Liste des clients (Recherche `?q=name`). |
| `POST` | `/api/clients` | Nouveau client. |
| `GET` | `/api/clients/{id}` | Détail client + historique rapide. |
| `PUT` | `/api/clients/{id}` | Mise à jour. |

#### Structure JSON (Client)
```json
{
  "id": "c1",
  "fullName": "Sophie Martin",
  "phone": "+33612345678",
  "email": "sophie@example.com",
  "docType": "PASSPORT",
  "docNumber": "18AV...",
  "licenseNumber": "FR-...",
  "status": "VIP"
}
```

---

## 5. Contrats & Factures (Finance)

Génération de documents légaux et suivi financier.

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/contracts` | Liste des contrats. |
| `POST` | `/api/contracts` | Créer un contrat (peut être converti depuis réservation). |
| `GET` | `/api/invoices` | Liste des factures. |
| `POST` | `/api/invoices` | Générer une facture. |

---

## 6. Maintenance

Suivi des entretiens véhicules.

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/maintenance` | Historique maintenance. |
| `POST` | `/api/maintenance` | Enregistrer une intervention. |

#### Structure JSON (Maintenance)
```json
{
  "id": "m1",
  "vehicleId": "v2",
  "type": "OIL_CHANGE",
  "description": "Vidange 10k",
  "totalCost": 500,
  "status": "COMPLETED",
  "date": "2024-05-20"
}
```

---

## 7. GPS & Tracking

Données télématiques temps réel.

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/gps` | Dernière position de tous les véhicules actifs. |
| `GET` | `/api/gps/{vehicleId}/history` | Historique de trajet (points lat/lng). |

#### Structure JSON (GPS)
```json
{
  "vehicleId": "v1",
  "lat": 33.5731,
  "lng": -7.5898,
  "speed": 85,
  "engineOn": true,
  "lastUpdate": "2024-05-30T10:05:00Z"
}
```
