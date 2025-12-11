// src/scripts/run_missing_tables.js
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

const sqlFile = path.join(__dirname, '..', 'migrations', '20251124_add_missing_tables.sql');

(async () => {
    try {
        const sql = fs.readFileSync(sqlFile, 'utf8');
        // Split statements by semicolon that are not within $$ or quotes (simple split)
        const statements = sql
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        for (const stmt of statements) {
            console.log('Executing:', stmt.split('\n')[0].substring(0, 80), '...');
            await sequelize.query(stmt);
        }
        console.log('All migration statements executed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
})();
