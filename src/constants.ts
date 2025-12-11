
import { Vehicle, VehicleStatus, VehicleCategory, TransmissionType, FuelType, Reservation, ReservationStatus, KPIData, MonthlyRevenue, Contract, ContractStatus, Client, ClientStatus, MaintenanceRecord, MaintenanceType, MaintenanceStatus, GPSDevice, GPSStatus, GPSAlert, AlertType, GPSTripPoint, MonthlyStats, VehiclePerformance, ExpenseCategory, UserProfile, SystemSettings, UserPermissions, UserRole, AppNotification, NotificationCategory, NotificationPriority, AlertConfig, Invoice, InvoiceStatus } from './types';

export const AGENCIES = ['Casablanca Aéroport', 'Marrakech Centre', 'Tanger Ville', 'Rabat Agdal'];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    brand: 'Dacia',
    model: 'Logan',
    version: 'Laureate',
    year: 2023,
    plate: '12345-A-6',
    vin: 'VF1SD0000123456',
    category: VehicleCategory.ECONOMY,
    status: VehicleStatus.AVAILABLE,
    dailyRate: 250,
    weeklyRate: 1500,
    monthlyRate: 5500,
    purchasePrice: 130000,
    imageUrl: 'https://picsum.photos/400/250?random=1',
    transmission: TransmissionType.MANUAL,
    fuel: FuelType.DIESEL,
    seats: 5,
    color: 'Blanc',
    fiscalPower: 6,
    mileage: 15000,
    agencyId: 'Casablanca Aéroport',
    insuranceExpiry: '2025-01-15',
    techVisitExpiry: '2026-01-15',
    gpsId: 'gps-02'
  },
  {
    id: 'v2',
    brand: 'Renault',
    model: 'Clio 5',
    version: 'Intens',
    year: 2024,
    plate: '88221-B-26',
    vin: 'VF1RJ0000987654',
    category: VehicleCategory.ECONOMY,
    status: VehicleStatus.RENTED,
    dailyRate: 350,
    weeklyRate: 2100,
    monthlyRate: 7500,
    purchasePrice: 180000,
    imageUrl: 'https://picsum.photos/400/250?random=2',
    transmission: TransmissionType.AUTOMATIC,
    fuel: FuelType.DIESEL,
    seats: 5,
    color: 'Gris Argent',
    fiscalPower: 7,
    mileage: 5400,
    agencyId: 'Marrakech Centre',
    insuranceExpiry: '2024-12-01',
    techVisitExpiry: '2026-12-01',
    gpsId: 'gps-01'
  },
  {
    id: 'v3',
    brand: 'Range Rover',
    model: 'Evoque',
    version: 'R-Dynamic',
    year: 2023,
    plate: '99999-H-1',
    vin: 'SALVA0000112233',
    category: VehicleCategory.LUXURY,
    status: VehicleStatus.AVAILABLE,
    dailyRate: 1500,
    weeklyRate: 9000,
    monthlyRate: 30000,
    purchasePrice: 650000,
    imageUrl: 'https://picsum.photos/400/250?random=3',
    transmission: TransmissionType.AUTOMATIC,
    fuel: FuelType.DIESEL,
    seats: 5,
    color: 'Noir',
    fiscalPower: 12,
    mileage: 12000,
    agencyId: 'Casablanca Aéroport',
    insuranceExpiry: '2024-06-15', // Expiring soon logic
    techVisitExpiry: '2025-06-15',
    gpsId: 'gps-03'
  },
  {
    id: 'v4',
    brand: 'Peugeot',
    model: '208',
    version: 'Active',
    year: 2022,
    plate: '44332-A-40',
    vin: 'VF3UP0000554433',
    category: VehicleCategory.ECONOMY,
    status: VehicleStatus.MAINTENANCE,
    dailyRate: 300,
    weeklyRate: 1800,
    monthlyRate: 6000,
    purchasePrice: 160000,
    imageUrl: 'https://picsum.photos/400/250?random=4',
    transmission: TransmissionType.MANUAL,
    fuel: FuelType.PETROL,
    seats: 5,
    color: 'Bleu',
    fiscalPower: 7,
    mileage: 45000,
    agencyId: 'Tanger Ville',
    insuranceExpiry: '2024-09-20',
    techVisitExpiry: '2025-09-20',
    gpsId: 'gps-04'
  },
  {
    id: 'v5',
    brand: 'Hyundai',
    model: 'Tucson',
    version: 'Executive',
    year: 2024,
    plate: '11223-D-1',
    vin: 'KMH000000998877',
    category: VehicleCategory.SUV,
    status: VehicleStatus.AVAILABLE,
    dailyRate: 700,
    weeklyRate: 4200,
    monthlyRate: 15000,
    purchasePrice: 320000,
    imageUrl: 'https://picsum.photos/400/250?random=5',
    transmission: TransmissionType.AUTOMATIC,
    fuel: FuelType.DIESEL,
    seats: 5,
    color: 'Gris Foncé',
    fiscalPower: 9,
    mileage: 2000,
    agencyId: 'Rabat Agdal',
    insuranceExpiry: '2025-03-10',
    techVisitExpiry: '2027-03-10',
    gpsId: 'gps-05'
  }
];

// Dates used are relative to typical usage, assuming "Current Month" for demo
export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-1001',
    vehicleId: 'v2',
    clientId: 'c1',
    clientName: 'Omar Benjelloun',
    clientPhone: '0661123456',
    startDate: '2024-05-20T10:00',
    endDate: '2024-05-25T10:00',
    pickupLocation: 'Marrakech Centre',
    returnLocation: 'Marrakech Centre',
    totalPrice: 1750,
    status: ReservationStatus.ONGOING,
    createdAt: '2024-05-10'
  },
  {
    id: 'RES-1002',
    vehicleId: 'v4',
    clientId: 'c2',
    clientName: 'Sophie Martin',
    clientPhone: '+33612345678',
    startDate: '2024-05-18T09:00',
    endDate: '2024-05-22T18:00',
    pickupLocation: 'Tanger Ville',
    returnLocation: 'Tanger Ville',
    totalPrice: 1200,
    status: ReservationStatus.COMPLETED,
    createdAt: '2024-05-15'
  },
  {
    id: 'RES-1003',
    vehicleId: 'v1',
    clientId: 'c4',
    clientName: 'Karim El Amrani',
    clientPhone: '0661998877',
    startDate: '2024-06-01T14:00',
    endDate: '2024-06-05T14:00',
    pickupLocation: 'Casablanca Aéroport',
    returnLocation: 'Casablanca Aéroport',
    totalPrice: 1000,
    status: ReservationStatus.CONFIRMED,
    createdAt: '2024-05-25'
  },
  {
    id: 'RES-1004',
    vehicleId: 'v3',
    clientId: 'c1',
    clientName: 'Omar Benjelloun',
    clientPhone: '0661123456',
    startDate: '2024-06-10T10:00',
    endDate: '2024-06-12T10:00',
    pickupLocation: 'Casablanca Aéroport',
    returnLocation: 'Casablanca Aéroport',
    totalPrice: 3000,
    status: ReservationStatus.PENDING,
    createdAt: '2024-05-29'
  }
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    fullName: 'Omar Benjelloun',
    phone: '0661123456',
    email: 'omar.ben@example.com',
    address: '12 Rue des Fleurs, Maarif',
    city: 'Casablanca',
    docType: 'CIN',
    docNumber: 'BK123456',
    licenseNumber: '12/123456',
    status: ClientStatus.VIP,
    notes: 'Client fidèle, toujours proposer une remise.',
    createdAt: '2023-01-15',
    totalBookings: 15
  },
  {
    id: 'c2',
    fullName: 'Sophie Martin',
    phone: '+33612345678',
    email: 'sophie.m@example.com',
    address: '15 Avenue de Paris',
    city: 'Paris',
    docType: 'Passeport',
    docNumber: '18AV12345',
    docExpiry: '2028-05-20',
    licenseNumber: 'FR-998877',
    status: ClientStatus.NORMAL,
    createdAt: '2024-02-10',
    totalBookings: 3
  },
  {
    id: 'c3',
    fullName: 'Ahmed Alami',
    phone: '0663344556',
    email: 'ahmed.a@example.com',
    address: 'Lot Riad',
    city: 'Rabat',
    docType: 'CIN',
    docNumber: 'A456789',
    licenseNumber: '10/654321',
    status: ClientStatus.BLACKLIST,
    notes: 'A rendu le véhicule sale et en retard. Non paiement des frais.',
    createdAt: '2023-11-05',
    totalBookings: 1
  },
  {
    id: 'c4',
    fullName: 'Karim El Amrani',
    phone: '0661998877',
    email: 'karim.elamrani@gmail.com',
    address: 'Bd Zerktouni',
    city: 'Casablanca',
    docType: 'CIN',
    docNumber: 'BE882211',
    licenseNumber: '15/332211',
    status: ClientStatus.NORMAL,
    createdAt: '2024-05-01',
    totalBookings: 0
  }
];

export const MOCK_KPI: KPIData = {
  totalRevenue: 145000,
  activeBookings: 12,
  availableVehicles: 24,
  maintenanceCount: 3
};

export const REVENUE_DATA: MonthlyRevenue[] = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Fév', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Avr', revenue: 61000 },
  { name: 'Mai', revenue: 55000 },
  { name: 'Juin', revenue: 75000 },
];

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'D-2024-001',
    type: 'DEVIS',
    client: {
      fullName: 'Karim El Amrani',
      phone: '0661123456',
      email: 'karim@example.com',
      cinPassport: 'AB123456',
      licenseNumber: '12/345678',
      address: '12 Bd Zerktouni, Casablanca'
    },
    vehicleId: 'v3',
    vehicleSnapshot: 'Range Rover Evoque (99999-H-1)',
    startDate: '2024-06-01T10:00',
    endDate: '2024-06-05T10:00',
    pickupLocation: 'Casablanca Aéroport',
    returnLocation: 'Casablanca Aéroport',
    dailyRate: 1500,
    totalDays: 4,
    discount: 0,
    extraFees: 0,
    totalAmount: 6000,
    deposit: 10000,
    paidAmount: 0,
    status: ContractStatus.DRAFT,
    createdAt: '2024-05-28'
  },
  {
    id: 'C-2024-892',
    type: 'CONTRAT',
    client: {
      fullName: 'Sophie Dubois',
      phone: '+33612345678',
      email: 'sophie.d@gmail.com',
      cinPassport: 'P987654321',
      licenseNumber: 'FR-987654',
      address: 'Paris, France'
    },
    vehicleId: 'v2',
    vehicleSnapshot: 'Renault Clio 5 (88221-B-26)',
    startDate: '2024-05-20T14:00',
    endDate: '2024-05-27T14:00',
    pickupLocation: 'Marrakech Centre',
    returnLocation: 'Marrakech Centre',
    dailyRate: 350,
    totalDays: 7,
    discount: 100,
    extraFees: 0,
    totalAmount: 2350,
    deposit: 5000,
    paidAmount: 2350,
    status: ContractStatus.ACTIVE,
    startMileage: 5200,
    createdAt: '2024-05-19'
  }
];

export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'm1',
    vehicleId: 'v4',
    type: MaintenanceType.MECHANICAL,
    description: 'Bruit suspect moteur + changement plaquettes',
    garage: 'Garage AutoFix Tanger',
    entryDate: '2024-05-15',
    currentMileage: 45000,
    partsCost: 1200,
    laborCost: 500,
    totalCost: 1700,
    status: MaintenanceStatus.IN_PROGRESS,
    notes: 'Attente livraison pièce pour le turbo.'
  },
  {
    id: 'm2',
    vehicleId: 'v1',
    type: MaintenanceType.OIL_CHANGE,
    description: 'Vidange 15000km + Filtres',
    garage: 'Atelier Interne',
    entryDate: '2024-05-10',
    exitDate: '2024-05-10',
    currentMileage: 15000,
    partsCost: 400,
    laborCost: 0,
    totalCost: 400,
    status: MaintenanceStatus.COMPLETED,
    nextServiceMileage: 25000
  },
  {
    id: 'm3',
    vehicleId: 'v3',
    type: MaintenanceType.INSURANCE,
    description: 'Renouvellement Assurance Tous Risques',
    garage: 'AXA Assurance',
    entryDate: '2024-05-01',
    exitDate: '2024-05-01',
    currentMileage: 12000,
    partsCost: 5000,
    laborCost: 0,
    totalCost: 5000,
    status: MaintenanceStatus.COMPLETED,
    nextServiceDate: '2025-05-01'
  },
  {
    id: 'm4',
    vehicleId: 'v2',
    type: MaintenanceType.TIRES,
    description: 'Changement 2 pneus avant',
    garage: 'Pneu Service',
    entryDate: '2024-06-01', // Future date for planning
    currentMileage: 5400,
    partsCost: 1600,
    laborCost: 200,
    totalCost: 1800,
    status: MaintenanceStatus.TODO,
    nextServiceMileage: 45000
  }
];

// --- Mock GPS Data (Coordinates roughly around Casablanca) ---
// Center approx: Lat 33.5731, Lng -7.5898
export const MOCK_GPS_DATA: GPSDevice[] = [
  {
    id: 'gps-01',
    vehicleId: 'v2', // Clio 5 (Rented)
    imei: '864209123456789',
    lat: 33.5951,
    lng: -7.6188,
    speed: 85,
    heading: 45,
    status: GPSStatus.MOVING,
    lastUpdate: 'À l\'instant',
    batteryLevel: 85,
    address: 'Autoroute A3, Casablanca',
    engineOn: true
  },
  {
    id: 'gps-02',
    vehicleId: 'v1', // Logan (Available)
    imei: '864209987654321',
    lat: 33.5731,
    lng: -7.5898,
    speed: 0,
    heading: 0,
    status: GPSStatus.IDLE,
    lastUpdate: 'Il y a 10 min',
    batteryLevel: 98,
    address: 'Parking Agence, Centre Ville',
    engineOn: false
  },
  {
    id: 'gps-03',
    vehicleId: 'v3', // Range Rover (Available)
    imei: '864209112233445',
    lat: 33.5880,
    lng: -7.6500,
    speed: 0,
    heading: 0,
    status: GPSStatus.OFFLINE,
    lastUpdate: 'Il y a 2 heures',
    batteryLevel: 12,
    address: 'Maarif, Casablanca',
    engineOn: false
  },
  {
    id: 'gps-04',
    vehicleId: 'v4', // Peugeot 208 (Maintenance)
    imei: '864209556677889',
    lat: 35.7595, // Tanger
    lng: -5.8340,
    speed: 0,
    heading: 0,
    status: GPSStatus.IDLE,
    lastUpdate: 'Il y a 30 min',
    batteryLevel: 92,
    address: 'Garage AutoFix, Tanger',
    engineOn: false
  },
  {
    id: 'gps-05',
    vehicleId: 'v5', // Tucson (Available)
    imei: '864209998877665',
    lat: 33.9716, // Rabat
    lng: -6.8498,
    speed: 120,
    heading: 180,
    status: GPSStatus.ALERT,
    lastUpdate: 'À l\'instant',
    batteryLevel: 76,
    address: 'Autoroute A1, Bouznika',
    engineOn: true
  }
];

export const MOCK_GPS_ALERTS: GPSAlert[] = [
  {
    id: 'al-01',
    vehicleId: 'v5',
    type: AlertType.OVERSPEED,
    message: 'Vitesse détectée: 145 km/h (Limite 120)',
    timestamp: '2024-05-28 10:15:00',
    severity: 'HIGH',
    status: 'NEW'
  },
  {
    id: 'al-02',
    vehicleId: 'v3',
    type: AlertType.BATTERY_LOW,
    message: 'Batterie tracker < 15%',
    timestamp: '2024-05-28 08:30:00',
    severity: 'MEDIUM',
    status: 'NEW'
  }
];

export const MOCK_TRIP_HISTORY: GPSTripPoint[] = [
  { lat: 33.5731, lng: -7.5898, timestamp: '09:00', speed: 0 },
  { lat: 33.5740, lng: -7.5910, timestamp: '09:05', speed: 30 },
  { lat: 33.5780, lng: -7.6000, timestamp: '09:15', speed: 50 },
  { lat: 33.5850, lng: -7.6100, timestamp: '09:30', speed: 60 },
  { lat: 33.5900, lng: -7.6150, timestamp: '09:45', speed: 45 },
  { lat: 33.5951, lng: -7.6188, timestamp: '10:00', speed: 0 }
];

// --- Report & Analytics Data ---

export const MOCK_MONTHLY_STATS: MonthlyStats[] = [
  { month: 'Jan', revenue: 45000, expenses: 12000, profit: 33000, bookings: 15 },
  { month: 'Fév', revenue: 52000, expenses: 15000, profit: 37000, bookings: 18 },
  { month: 'Mar', revenue: 48000, expenses: 11000, profit: 37000, bookings: 16 },
  { month: 'Avr', revenue: 61000, expenses: 18000, profit: 43000, bookings: 22 },
  { month: 'Mai', revenue: 55000, expenses: 14000, profit: 41000, bookings: 20 },
  { month: 'Juin', revenue: 75000, expenses: 21000, profit: 54000, bookings: 28 },
];

export const VEHICLE_PERFORMANCE_DATA: VehiclePerformance[] = [
  { vehicleId: 'v1', vehicleName: 'Dacia Logan', plate: '12345-A-6', daysRented: 22, revenue: 5500, maintenanceCost: 400, roi: 150, occupancyRate: 73 },
  { vehicleId: 'v2', vehicleName: 'Renault Clio 5', plate: '88221-B-26', daysRented: 18, revenue: 6300, maintenanceCost: 1800, roi: 110, occupancyRate: 60 },
  { vehicleId: 'v3', vehicleName: 'Range Rover Evoque', plate: '99999-H-1', daysRented: 8, revenue: 12000, maintenanceCost: 5000, roi: 85, occupancyRate: 26 },
  { vehicleId: 'v4', vehicleName: 'Peugeot 208', plate: '44332-A-40', daysRented: 5, revenue: 1500, maintenanceCost: 1700, roi: -10, occupancyRate: 16 },
  { vehicleId: 'v5', vehicleName: 'Hyundai Tucson', plate: '11223-D-1', daysRented: 25, revenue: 17500, maintenanceCost: 0, roi: 200, occupancyRate: 83 },
];

export const EXPENSE_BREAKDOWN: ExpenseCategory[] = [
  { name: 'Mécanique', value: 4500, color: '#3b82f6' },
  { name: 'Pneumatiques', value: 2200, color: '#10b981' },
  { name: 'Assurances', value: 12000, color: '#8b5cf6' },
  { name: 'Carrosserie', value: 1500, color: '#f59e0b' },
  { name: 'Vidanges', value: 900, color: '#ef4444' },
];


export const formatCurrency = (amount: number, compact: boolean = false) => {
  if (compact) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M MAD';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'k MAD';
    }
  }
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
};

// --- Settings & Users Data ---

export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  ADMIN: {
    manageReservations: true,
    manageContracts: true,
    viewFinancials: true,
    manageFleet: true,
    manageMaintenance: true,
    manageUsers: true,
    downloadReports: true
  },
  MANAGER: {
    manageReservations: true,
    manageContracts: true,
    viewFinancials: true,
    manageFleet: true,
    manageMaintenance: true,
    manageUsers: false,
    downloadReports: true
  },
  AGENT: {
    manageReservations: true,
    manageContracts: true,
    viewFinancials: false,
    manageFleet: false,
    manageMaintenance: false,
    manageUsers: false,
    downloadReports: false
  },
  ACCOUNTANT: {
    manageReservations: false,
    manageContracts: false,
    viewFinancials: true,
    manageFleet: false,
    manageMaintenance: false,
    manageUsers: false,
    downloadReports: true
  },
  MECHANIC: {
    manageReservations: false,
    manageContracts: false,
    viewFinancials: false,
    manageFleet: true,
    manageMaintenance: true,
    manageUsers: false,
    downloadReports: false
  },
  CONSULTANT: {
    manageReservations: false,
    manageContracts: false,
    viewFinancials: false,
    manageFleet: false,
    manageMaintenance: false,
    manageUsers: false,
    downloadReports: false
  }
};

export const MOCK_USERS: UserProfile[] = [
  { 
    id: 'u1', 
    name: 'Ahmed Tazi', 
    email: 'ahmed.tazi@gorent.ma', 
    phone: '0600000001', 
    role: 'ADMIN', 
    active: true, 
    lastLogin: '2024-05-29 09:15',
    password: '123456', // Mock password for testing
    permissions: DEFAULT_PERMISSIONS.ADMIN
  },
  { 
    id: 'u2', 
    name: 'Sara Idrissi', 
    email: 'sara.id@gorent.ma', 
    phone: '0600000002', 
    role: 'MANAGER', 
    active: true, 
    lastLogin: '2024-05-28 14:30',
    agencyId: 'Casablanca Aéroport',
    password: '123456',
    permissions: DEFAULT_PERMISSIONS.MANAGER
  },
  { 
    id: 'u3', 
    name: 'Karim Mechanico', 
    email: 'tech@gorent.ma', 
    phone: '0600000003', 
    role: 'MECHANIC', 
    active: true, 
    lastLogin: '2024-05-25 10:00',
    password: '123456',
    permissions: DEFAULT_PERMISSIONS.MECHANIC
  },
  { 
    id: 'u4', 
    name: 'Yassine Agent', 
    email: 'agent@gorent.ma', 
    phone: '0600000004', 
    role: 'AGENT', 
    active: true, 
    lastLogin: '2024-05-29 08:30',
    password: '123456',
    permissions: DEFAULT_PERMISSIONS.AGENT
  },
  { 
    id: 'u5', 
    name: 'Sofia Compta', 
    email: 'compta@gorent.ma', 
    phone: '0600000005', 
    role: 'ACCOUNTANT', 
    active: true, 
    lastLogin: '2024-05-29 09:00',
    password: '123456',
    permissions: DEFAULT_PERMISSIONS.ACCOUNTANT
  }
];

export const MOCK_SETTINGS: SystemSettings = {
  agencyName: 'Go Rent Location',
  address: '123 Avenue Mohammed V, Casablanca, Maroc',
  phone: '+212 5 22 00 11 22',
  email: 'contact@gorent.ma',
  website: 'www.gorent.ma',
  ice: '000123456789000',
  vatRate: 20,
  currency: 'MAD',
  defaultDeposit: 5000,
  kmOverageCost: 2, // 2 DH per extra KM
  
  maintenanceInterval: 10000, // 10k km
  maintenanceAlertThreshold: 500,
  maintenanceTypes: ['Vidange', 'Freins', 'Pneumatiques', 'Batterie', 'Filtres'],

  smsEnabled: true,
  smsProvider: 'Hisms',
  emailEnabled: true,
  whatsappEnabled: false,
  
  termsAndConditions: `1. Le locataire doit être âgé d'au moins 21 ans.
2. Le véhicule est remis en parfait état de marche.
3. Le carburant est à la charge du locataire.
4. En cas d'accident, prévenir l'agence immédiatement.
...`,

  gpsProvider: 'Traccar',
  gpsUpdateFrequency: 10,
  gpsAlertSpeed: 120,
  gpsGeofencing: true,

  language: 'fr',
  twoFactorAuth: false,
  backupFrequency: 'DAILY',
  darkMode: false,

  paymentMethods: ['Espèces', 'Carte Bancaire (TPE)', 'Virement'],
  invoicePrefix: 'FACT',
  autoInvoiceNumber: true
};

// --- Mock Notifications ---

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    category: NotificationCategory.VEHICLE,
    priority: NotificationPriority.WARNING,
    title: 'Assurance expire bientôt',
    message: 'Range Rover Evoque (99999-H-1) : Assurance expire dans 15 jours.',
    timestamp: 'Il y a 2 heures',
    isRead: false,
    linkTo: 'vehicles'
  },
  {
    id: 'n2',
    category: NotificationCategory.GPS,
    priority: NotificationPriority.CRITICAL,
    title: 'Excès de vitesse détecté',
    message: 'Hyundai Tucson (11223-D-1) roule à 145 km/h (Zone 100).',
    timestamp: 'Il y a 10 min',
    isRead: false,
    linkTo: 'gps'
  },
  {
    id: 'n3',
    category: NotificationCategory.RESERVATION,
    priority: NotificationPriority.INFO,
    title: 'Nouvelle réservation en ligne',
    message: 'Client: Omar Benjelloun, Départ demain 10:00.',
    timestamp: 'Il y a 30 min',
    isRead: false,
    linkTo: 'reservations'
  },
  {
    id: 'n4',
    category: NotificationCategory.MAINTENANCE,
    priority: NotificationPriority.WARNING,
    title: 'Vidange nécessaire',
    message: 'Dacia Logan approche des 15,000 km.',
    timestamp: 'Hier',
    isRead: true,
    linkTo: 'maintenance'
  },
  {
    id: 'n5',
    category: NotificationCategory.CLIENT,
    priority: NotificationPriority.INFO,
    title: 'Paiement reçu',
    message: 'Acompte reçu pour la réservation RES-1004.',
    timestamp: 'Hier',
    isRead: true,
    linkTo: 'reservations'
  }
];

export const DEFAULT_ALERT_CONFIGS: AlertConfig[] = [
  {
    id: 'ac1',
    enabled: true,
    name: 'Expiration Assurance',
    category: NotificationCategory.VEHICLE,
    threshold: 7,
    thresholdUnit: 'DAYS',
    channels: { system: true, email: true, sms: false, whatsapp: false },
    recipients: ['ADMIN', 'MANAGER']
  },
  {
    id: 'ac2',
    enabled: true,
    name: 'Expiration Visite Technique',
    category: NotificationCategory.VEHICLE,
    threshold: 15,
    thresholdUnit: 'DAYS',
    channels: { system: true, email: true, sms: false, whatsapp: false },
    recipients: ['ADMIN', 'MANAGER']
  },
  {
    id: 'ac3',
    enabled: true,
    name: 'Vidange / Entretien Périodique',
    category: NotificationCategory.MAINTENANCE,
    threshold: 500,
    thresholdUnit: 'KM',
    channels: { system: true, email: false, sms: false, whatsapp: false },
    recipients: ['ADMIN', 'MECHANIC']
  },
  {
    id: 'ac4',
    enabled: true,
    name: 'Retard Retour Véhicule',
    category: NotificationCategory.RESERVATION,
    threshold: 1, // hours
    thresholdUnit: 'DAYS',
    channels: { system: true, email: true, sms: true, whatsapp: true },
    recipients: ['ADMIN', 'MANAGER', 'AGENT']
  },
  {
    id: 'ac5',
    enabled: true,
    name: 'Alerte GPS (Vitesse/Zone)',
    category: NotificationCategory.GPS,
    threshold: 0,
    thresholdUnit: 'KM',
    channels: { system: true, email: true, sms: true, whatsapp: false },
    recipients: ['ADMIN', 'MANAGER']
  }
];

// --- Mock Invoices ---

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-001',
    ref: 'FACT-2024-102',
    date: '2024-05-20',
    dueDate: '2024-05-27',
    clientId: 'c2',
    clientName: 'Sophie Martin',
    clientAddress: '15 Avenue de Paris, Paris',
    vehicleId: 'v4',
    vehicleSnapshot: 'Peugeot 208 (44332-A-40)',
    contractId: 'C-2024-892',
    items: [
      { description: 'Location Peugeot 208 (5 jours)', quantity: 5, unitPrice: 240, total: 1200 },
      { description: 'Siège Bébé', quantity: 1, unitPrice: 150, total: 150 }
    ],
    subTotal: 1350,
    taxRate: 20,
    taxAmount: 270,
    totalAmount: 1620,
    paidAmount: 1620,
    balance: 0,
    status: InvoiceStatus.PAID
  },
  {
    id: 'INV-002',
    ref: 'FACT-2024-103',
    date: '2024-05-25',
    dueDate: '2024-06-01',
    clientId: 'c1',
    clientName: 'Omar Benjelloun',
    clientAddress: '12 Rue des Fleurs, Maarif, Casablanca',
    clientIce: '001548796',
    vehicleId: 'v2',
    vehicleSnapshot: 'Renault Clio 5 (88221-B-26)',
    items: [
      { description: 'Location Renault Clio 5 (3 jours)', quantity: 3, unitPrice: 350, total: 1050 },
      { description: 'Livraison Aéroport', quantity: 1, unitPrice: 200, total: 200 },
      { description: 'GPS Navigation', quantity: 1, unitPrice: 100, total: 100 }
    ],
    subTotal: 1350,
    taxRate: 20,
    taxAmount: 270,
    totalAmount: 1620,
    paidAmount: 500,
    balance: 1120,
    status: InvoiceStatus.PENDING
  }
];