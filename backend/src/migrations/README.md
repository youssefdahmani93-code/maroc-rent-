-- Quick fix: Run this migration manually using Sequelize sync
-- This will create/update tables based on the models

-- Alternative 1: Use Sequelize CLI
-- npx sequelize-cli db:migrate

-- Alternative 2: Use the sync script below
-- node -e "require('./src/models'); require('./src/config/database').sync({ alter: true }).then(() => console.log('Done')).catch(console.error)"

-- Alternative 3: Manual SQL (if you have direct access to PostgreSQL)
-- Copy the contents of 20251124_add_missing_tables.sql and run them directly in pgAdmin or psql

-- For now, let's use Sequelize's built-in sync which is already configured in server.js
-- The server.js file has: await sequelize.sync({ force: false, alter: true });
-- This means when you start the backend server, it will automatically create/update tables

-- SOLUTION: Just restart your backend server
-- cd d:/go-rent/backend
-- npm run dev

-- The tables will be created automatically on server start
