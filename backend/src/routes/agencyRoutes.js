const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Simple file-based storage for now (since we don't have an Agency model with config field yet)
// In a real app, this would be stored in the database
const CONFIG_FILE = path.join(__dirname, '../data/landing-config.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
}

// GET /api/agency/landing-config
router.get('/landing-config', (req, res) => {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            res.json(config);
        } else {
            res.json({}); // Return empty config if none exists
        }
    } catch (error) {
        console.error('Error reading config:', error);
        res.status(500).json({ message: 'Error reading configuration' });
    }
});

// POST /api/agency/landing-config
router.post('/landing-config', (req, res) => {
    try {
        const config = req.body;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        res.json({ message: 'Configuration saved successfully', config });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ message: 'Error saving configuration' });
    }
});

// GET /api/agency/settings - Return agency settings
router.get('/settings', (req, res) => {
    try {
        // Return default settings for now
        res.json({
            companyName: 'GoRent',
            companyLogo: null,
            primaryColor: '#06b6d4',
            secondaryColor: '#3b82f6'
        });
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ message: 'Error reading settings' });
    }
});

module.exports = router;
