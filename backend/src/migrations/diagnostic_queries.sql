-- Diagnostic queries to check what data exists in the database
-- Run these in pgAdmin or psql to see what data you have

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check vehicles count
SELECT COUNT(*) as total_vehicles FROM vehicules;
SELECT etat, COUNT(*) FROM vehicules GROUP BY etat;

-- 3. Check clients count
SELECT COUNT(*) as total_clients FROM clients;

-- 4. Check reservations count
SELECT COUNT(*) as total_reservations FROM reservations;
SELECT statut, COUNT(*) FROM reservations GROUP BY statut;

-- 5. Check contracts count
SELECT COUNT(*) as total_contracts FROM contrats;
SELECT statut, COUNT(*) FROM contrats GROUP BY statut;

-- 6. Check payments count and sum
SELECT COUNT(*) as total_payments FROM paiements;
SELECT SUM(montant_paye) as total_revenue FROM paiements;
SELECT 
    DATE_TRUNC('month', date_paiement) as month,
    SUM(montant_paye) as total
FROM paiements
GROUP BY DATE_TRUNC('month', date_paiement)
ORDER BY month DESC;

-- 7. Check if data was inserted in wrong tables
-- Sometimes data goes to 'contracts' instead of 'contrats'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%contract%' OR table_name LIKE '%contrat%';

-- 8. Sample data from each table
SELECT * FROM vehicules LIMIT 5;
SELECT * FROM clients LIMIT 5;
SELECT * FROM reservations LIMIT 5;
SELECT * FROM contrats LIMIT 5;
SELECT * FROM paiements LIMIT 5;
