const { Setting } = require('../models');

async function seedSettings() {
    const defaultSettings = [
        {
            key: 'caution_percentage',
            value: '30',
            category: 'finance',
            description: 'Pourcentage de caution par défaut (%)',
            type: 'number'
        },
        {
            key: 'tva_percentage',
            value: '20',
            category: 'finance',
            description: 'Taux de TVA (%)',
            type: 'number'
        },
        {
            key: 'company_name',
            value: 'GoRent Maroc',
            category: 'general',
            description: 'Nom de la société',
            type: 'string'
        },
        {
            key: 'contract_prefix',
            value: 'CTR-',
            category: 'contracts',
            description: 'Préfixe des numéros de contrat',
            type: 'string'
        }
    ];

    for (const setting of defaultSettings) {
        await Setting.findOrCreate({
            where: { key: setting.key },
            defaults: setting
        });
    }
    console.log('Settings seeded successfully');
}

module.exports = seedSettings;
