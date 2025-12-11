const Agence = require('./Agence');
const Vehicule = require('./Vehicule');
const Client = require('./Client');
const Reservation = require('./Reservation');
const Paiement = require('./Paiement');
const Contrat = require('./Contrat');
const Maintenance = require('./Maintenance');
const GpsPosition = require('./GpsPosition');
const GpsAlerte = require('./GpsAlerte');
const GpsZone = require('./GpsZone');
const User = require('./User');
const Devis = require('./Devis');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Setting = require('./Setting');

// Relations Agence <-> Vehicule
Agence.hasMany(Vehicule, { foreignKey: 'agence_id', as: 'vehicules' });
Vehicule.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });

// Relations Agence <-> User
Agence.hasMany(User, { foreignKey: 'agence_id', as: 'users' });
User.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });

// Relations Agence <-> Contrat
Agence.hasMany(Contrat, { foreignKey: 'agence_id', as: 'contrats' });
Contrat.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });

// Relations Agence <-> GpsZone
Agence.hasMany(GpsZone, { foreignKey: 'agence_id', as: 'gps_zones' });
GpsZone.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });

// Relations Client <-> Reservation
Client.hasMany(Reservation, { foreignKey: 'client_id', as: 'reservations' });
Reservation.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Relations Client <-> Contrat
Client.hasMany(Contrat, { foreignKey: 'client_id', as: 'contrats' });
Contrat.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Relations Vehicule <-> Reservation
Vehicule.hasMany(Reservation, { foreignKey: 'vehicule_id', as: 'reservations' });
Reservation.belongsTo(Vehicule, { foreignKey: 'vehicule_id', as: 'vehicule' });

// Relations Vehicule <-> Contrat
Vehicule.hasMany(Contrat, { foreignKey: 'vehicule_id', as: 'contrats' });
Contrat.belongsTo(Vehicule, { foreignKey: 'vehicule_id', as: 'vehicule' });

// Relations Vehicule <-> Maintenance
Vehicule.hasMany(Maintenance, { foreignKey: 'vehicule_id', as: 'maintenances' });
Maintenance.belongsTo(Vehicule, { foreignKey: 'vehicule_id', as: 'vehicule' });

// Relations Vehicule <-> GpsPosition
Vehicule.hasMany(GpsPosition, { foreignKey: 'vehicule_id', as: 'gps_positions' });
GpsPosition.belongsTo(Vehicule, { foreignKey: 'vehicule_id', as: 'vehicule' });

// Relations Vehicule <-> GpsAlerte
Vehicule.hasMany(GpsAlerte, { foreignKey: 'vehicule_id', as: 'gps_alertes' });
GpsAlerte.belongsTo(Vehicule, { foreignKey: 'vehicule_id', as: 'vehicule' });

// Relations Agence <-> Reservation (retrait)
Agence.hasMany(Reservation, { foreignKey: 'agence_retrait_id', as: 'reservations_retrait' });
Reservation.belongsTo(Agence, { foreignKey: 'agence_retrait_id', as: 'agence_retrait' });

// Relations Agence <-> Reservation (retour)
Agence.hasMany(Reservation, { foreignKey: 'agence_retour_id', as: 'reservations_retour' });
Reservation.belongsTo(Agence, { foreignKey: 'agence_retour_id', as: 'agence_retour' });

// Relations Reservation <-> Paiement
Reservation.hasMany(Paiement, { foreignKey: 'reference_id', as: 'paiements', constraints: false });
Paiement.belongsTo(Reservation, { foreignKey: 'reference_id', as: 'reservation', constraints: false });

// Relations Client <-> Paiement
Client.hasMany(Paiement, { foreignKey: 'client_id', as: 'paiements' });
Paiement.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Relations Contrat <-> Paiement
Contrat.hasMany(Paiement, { foreignKey: 'reference_id', as: 'paiements', constraints: false });
Paiement.belongsTo(Contrat, { foreignKey: 'reference_id', as: 'contrat', constraints: false });

// Relations User <-> Paiement (created_by)
User.hasMany(Paiement, { foreignKey: 'created_by', as: 'paiements_crees' });
Paiement.belongsTo(User, { foreignKey: 'created_by', as: 'createur' });

// Relations Reservation <-> Contrat
Reservation.hasOne(Contrat, { foreignKey: 'reservation_id', as: 'contrat' });
Contrat.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });

// Relations Client <-> Devis
Client.hasMany(Devis, { foreignKey: 'client_id', as: 'devis' });
Devis.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Relations Vehicule <-> Devis
Vehicule.hasMany(Devis, { foreignKey: 'vehicule_id', as: 'devis' });
Devis.belongsTo(Vehicule, { foreignKey: 'vehicule_id', as: 'vehicule' });

// Relations Agence <-> Devis
Agence.hasMany(Devis, { foreignKey: 'agence_id', as: 'devis' });
Devis.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });

// Relations User <-> Devis (created_by)
User.hasMany(Devis, { foreignKey: 'created_by', as: 'devis_crees' });
Devis.belongsTo(User, { foreignKey: 'created_by', as: 'createur' });

// Relations Devis <-> Contrat
Devis.hasOne(Contrat, { foreignKey: 'devis_id', as: 'contrat_genere' });
Contrat.belongsTo(Devis, { foreignKey: 'devis_id', as: 'devis' });

// Relations User <-> Role
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'user_role' });

// Relations Role <-> Permission (Many-to-Many)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id', as: 'roles' });


module.exports = {
    Agence,
    Vehicule,
    Client,
    Reservation,
    Paiement,
    Contrat,
    Maintenance,
    GpsPosition,
    GpsAlerte,
    GpsZone,
    User,
    Devis,
    Role,
    Permission,
    RolePermission,
    Setting
};
