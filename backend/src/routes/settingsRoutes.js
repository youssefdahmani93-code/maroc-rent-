const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Setting } = require('../models');
const { Op } = require('sequelize');

// --- Multer Configuration for Logo Upload ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // The destination folder for uploads is backend/uploads/
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        // Create a unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'logo-' + uniqueSuffix + extension);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers image sont autorisés!'), false);
        }
    }
});

// POST /api/settings/upload-logo - Handle logo upload
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier reçu.' });
    }

    try {
        const logoUrl = `/uploads/${req.file.filename}`;
        // Save the URL to the database
        await Setting.upsert({ key: 'company_logo', value: logoUrl, category: 'company', type: 'string' });
        res.json({ url: logoUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la sauvegarde de l'URL du logo." });
    }
});

// GET /api/settings - List all settings as a key-value object
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const settingsMap = settings.reduce((acc, setting) => {
            let value = setting.value;
            try {
                if (setting.type === 'number') value = Number(value);
                if (setting.type === 'boolean') value = value === 'true';
            } catch (e) { /* ignore parse error */ }
            acc[setting.key] = value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/settings/list - List settings with metadata
router.get('/list', async (req, res) => {
    try {
        const { category } = req.query;
        const settings = await Setting.findAll({ where: category ? { category } : {} });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/settings/bulk - Update multiple settings efficiently
router.post('/bulk', async (req, res) => {
    const settingsToUpdate = req.body; // Array of { key, value }
    if (!Array.isArray(settingsToUpdate)) {
        return res.status(400).json({ message: 'Le corps de la requête doit être un tableau.' });
    }

    const transaction = await Setting.sequelize.transaction();
    try {
        const promises = settingsToUpdate.map(item =>
            Setting.upsert(
                { 
                    key: item.key, 
                    value: String(item.value),
                    // Make sure to include category and type if they are new
                    category: item.category || 'general',
                    type: item.type || 'string'
                }, 
                { transaction }
            )
        );
        await Promise.all(promises);
        await transaction.commit();
        res.json({ message: 'Paramètres mis à jour avec succès' });
    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors de la mise à jour en masse:", error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres' });
    }
});

module.exports = router;
