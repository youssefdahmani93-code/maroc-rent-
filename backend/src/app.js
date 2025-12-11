const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const vehiculeRoutes = require('./routes/vehiculeRoutes');
const contratRoutes = require('./routes/contratRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const agenceRoutes = require('./routes/agenceRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const gpsRoutes = require('./routes/gpsRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Basic Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'RentMaroc API is running' });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/contrats', contratRoutes);
app.use('/api/contracts', contratRoutes); // Alias for English
app.use('/api/reservations', reservationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/agences', agenceRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/public', publicRoutes);

const agencyRoutes = require('./routes/agencyRoutes');
app.use('/api/agency', agencyRoutes);

module.exports = app;
