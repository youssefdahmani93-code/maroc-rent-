-- Migration to add missing tables for GoRent application
-- Contracts table
CREATE TABLE IF NOT EXISTS contrats (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    devis_id INTEGER,
    reservation_id INTEGER,
    client_id INTEGER NOT NULL,
    vehicule_id INTEGER NOT NULL,
    agence_id INTEGER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    lieu_remise VARCHAR(200),
    lieu_restitution VARCHAR(200),
    prix_journalier DECIMAL(10,2) NOT NULL,
    nombre_jours INTEGER NOT NULL,
    reduction DECIMAL(10,2) DEFAULT 0,
    frais_chauffeur DECIMAL(10,2) DEFAULT 0,
    frais_livraison DECIMAL(10,2) DEFAULT 0,
    frais_carburant DECIMAL(10,2) DEFAULT 0,
    frais_depassement_km DECIMAL(10,2) DEFAULT 0,
    extras JSON,
    montant_total DECIMAL(10,2) NOT NULL,
    caution DECIMAL(10,2) NOT NULL DEFAULT 0,
    acompte DECIMAL(10,2) NOT NULL DEFAULT 0,
    reste_a_payer DECIMAL(10,2) NOT NULL DEFAULT 0,
    statut VARCHAR(50) NOT NULL DEFAULT 'devis',
    km_depart INTEGER,
    km_retour INTEGER,
    niveau_carburant_depart VARCHAR(20),
    niveau_carburant_retour VARCHAR(20),
    etat_vehicule_depart JSON,
    etat_vehicule_retour JSON,
    photos_depart JSON,
    photos_retour JSON,
    conditions_generales TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    signature_client TEXT,
    signature_agence TEXT,
    date_signature DATE,
    pdf_path VARCHAR(500),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS paiements (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    type_paiement VARCHAR(50) NOT NULL,
    reference_id INTEGER,
    montant_total DECIMAL(10,2) NOT NULL,
    montant_paye DECIMAL(10,2) NOT NULL,
    reste_a_payer DECIMAL(10,2) NOT NULL,
    methode_paiement VARCHAR(50),
    statut VARCHAR(20) NOT NULL,
    date_paiement DATE NOT NULL,
    notes TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance table
CREATE TABLE IF NOT EXISTS maintenances (
    id SERIAL PRIMARY KEY,
    vehicule_id INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    garage VARCHAR(200),
    date_entree DATE NOT NULL,
    date_sortie_prevue DATE,
    date_sortie_reelle DATE,
    km_actuel INTEGER,
    pieces_remplacees JSON,
    photos JSON,
    cout_pieces DECIMAL(10,2) NOT NULL DEFAULT 0,
    cout_main_oeuvre DECIMAL(10,2) NOT NULL DEFAULT 0,
    cout_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    statut VARCHAR(50) NOT NULL DEFAULT 'a_faire',
    prochaine_vidange_km INTEGER,
    prochain_changement_pneus_km INTEGER,
    prochaine_visite_technique DATE,
    prochaine_assurance DATE,
    notes_internes TEXT,
    facture_path VARCHAR(500),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agencies table (if not existing)
CREATE TABLE IF NOT EXISTS agences (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(100),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (if not existing)
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value VARCHAR(255),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
