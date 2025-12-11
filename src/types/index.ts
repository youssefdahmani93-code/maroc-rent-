
export enum VehicleStatus {
  AVAILABLE = 'Disponible',
  RENTED = 'Loué',
  MAINTENANCE = 'Maintenance',
  RESERVED = 'Réservé',
  OUT_OF_SERVICE = 'Hors Service'
}

export enum VehicleCategory {
  ECONOMY = 'Économique',
  SEDAN = 'Berline',
  SUV = 'SUV / 4x4',
  LUXURY = 'Luxe',
  VAN = 'Utilitaire / Van'
}

export enum TransmissionType {
  MANUAL = 'Manuelle',
  AUTOMATIC = 'Automatique'
}

export enum FuelType {
  DIESEL = 'Diesel',
  PETROL = 'Essence',
  HYBRID = 'Hybride',
  ELECTRIC = 'Électrique'
}

export interface Vehicle {
  id: string;
  // General
  brand: string;
  model: string;
  version?: string;
  year: number;
  plate: string;
  vin?: string;
  category: VehicleCategory;
  status: VehicleStatus;

  // Specs
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  purchasePrice?: number;
  currentValue?: number;
  imageUrl: string;
  images?: string[];
  transmission: TransmissionType;
  fuel: FuelType;
  seats: number;
  mileage: number;
  agencyId: string;
  insuranceExpiry?: string;
  techVisitExpiry?: string;
  vignetteYear?: number;
  gpsId?: string;
  color?: string;
  fiscalPower?: number;

  // Computed/Dashboard stats (optional)
  availableVehicles?: number;
  maintenanceCount?: number;
}

export interface MonthlyRevenue {
  name: string;
  revenue: number;
}

// --- New Types for Reservations Module ---

export enum ReservationStatus {
  PENDING = 'En attente',
  CONFIRMED = 'Confirmée',
  ONGOING = 'En cours',
  COMPLETED = 'Terminée',
  CANCELLED = 'Annulée'
}

export interface Reservation {
  id: string;
  vehicleId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;

  // Optional helpers
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
}

// --- New Types for Contracts Module ---

export enum ContractStatus {
  DRAFT = 'Devis / Brouillon',
  PENDING_SIGNATURE = 'À signer',
  SIGNED = 'Signé',
  ACTIVE = 'En cours',
  COMPLETED = 'Terminé',
  CANCELLED = 'Annulé'
}

export interface ClientInfo {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  docNumber: string; // Was cinPassport
  licenseNumber: string;
  address: string;
}

export interface Contract {
  id: string;
  type: 'DEVIS' | 'CONTRAT';
  client: ClientInfo;
  clientId?: string; // For Supabase FK
  vehicleId: string; // Link to vehicle
  vehicle?: { // Joined vehicle data
    id: string;
    brand: string;
    model: string;
    plate: string;
  };
  vehicleSnapshot: string; // e.g., "Dacia Logan - 12345-A-6"
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation: string;

  // Financials
  dailyRate: number;
  totalDays: number;
  discount: number;
  extraFees: number; // Driver, baby seat, etc.
  totalAmount: number;
  deposit: number; // Caution
  paidAmount: number; // Acompte
  contractNumber?: string;

  status: ContractStatus;
  createdAt: string;

  // Contract specific
  startMileage?: number;
  endMileage?: number;
  vehicleChecklist?: {
    body: boolean;
    tires: boolean;
    fuelLevel: string;
  };
  notes?: string;
}

// --- New Types for Client Module ---

export enum ClientStatus {
  NORMAL = 'Normal',
  VIP = 'VIP',
  RISKY = 'À Risque',
  BLOCKED = 'Bloqué',
  BLACKLIST = 'Blacklist'
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;

  // Documents
  docType: 'CIN' | 'Passeport';
  docNumber: string;
  docExpiry?: string;
  licenseNumber: string;

  // Files (mocked URLs)
  docRectoUrl?: string;
  docVersoUrl?: string;
  licenseUrl?: string;

  status: ClientStatus;
  notes?: string;
  createdAt: string;
  totalBookings: number;
}

// --- New Types for Maintenance Module ---

export enum MaintenanceType {
  OIL_CHANGE = 'Vidange',
  TIRES = 'Pneus',
  BRAKES = 'Freins',
  BATTERY = 'Batterie',
  MECHANICAL = 'Mécanique',
  BODYWORK = 'Carrosserie',
  INSURANCE = 'Assurance',
  TECHNICAL_VISIT = 'Visite Technique',
  CLEANING = 'Nettoyage Profond',
  OTHER = 'Autre'
}

export enum MaintenanceStatus {
  TODO = 'À faire',
  IN_PROGRESS = 'En cours',
  COMPLETED = 'Terminé',
  URGENT = 'Urgent'
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  garage: string; // Garage name or technician

  entryDate: string;
  exitDate?: string;

  currentMileage: number;

  // Costs
  partsCost: number;
  laborCost: number;
  totalCost: number;

  status: MaintenanceStatus;

  // Preventive
  nextServiceMileage?: number;
  nextServiceDate?: string;

  notes?: string;
}

// --- New Types for GPS Module ---

export enum GPSStatus {
  MOVING = 'En mouvement',
  IDLE = 'À l\'arrêt',
  OFFLINE = 'Hors ligne',
  ALERT = 'Alerte'
}

export interface GPSDevice {
  id: string; // Tracker ID
  vehicleId: string; // Linked Vehicle
  imei: string;
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees
  status: GPSStatus;
  lastUpdate: string;
  batteryLevel: number; // percentage
  address: string; // Reverse geocoded address (mocked)
  engineOn: boolean;
}

export enum AlertType {
  OVERSPEED = 'Excès de vitesse',
  GEOFENCE_EXIT = 'Sortie de zone',
  BATTERY_LOW = 'Batterie faible',
  DISCONNECTED = 'GPS Déconnecté',
  UNAUTHORIZED_MOVEMENT = 'Mouvement non autorisé'
}

export interface GPSAlert {
  id: string;
  vehicleId: string;
  type: AlertType;
  message: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'NEW' | 'RESOLVED';
  coordinates?: { lat: number; lng: number };
}

export interface GPSTripPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
}

// --- New Types for Reports Module ---

export interface MonthlyStats {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  bookings: number;
}

export interface VehiclePerformance {
  vehicleId: string;
  vehicleName: string;
  plate: string;
  daysRented: number;
  revenue: number;
  maintenanceCost: number;
  roi: number; // Percentage
  occupancyRate: number; // Percentage
}

export interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

// --- New Types for Settings Module ---

export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'ACCOUNTANT' | 'MECHANIC' | 'CONSULTANT';

export interface UserPermissions {
  manageReservations: boolean;
  manageContracts: boolean;
  viewFinancials: boolean;
  manageFleet: boolean;
  manageMaintenance: boolean;
  manageUsers: boolean;
  downloadReports: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
  lastLogin?: string;
  agencyId?: string;
  password?: string; // Mock password field
  permissions: UserPermissions;
}

export interface SystemSettings {
  // Agency Info
  agencyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  ice: string;

  // Finance
  vatRate: number; // Percentage
  currency: 'MAD' | 'EUR' | 'USD' | 'GBP' | 'CAD' | 'CHF';
  defaultDeposit: number;
  kmOverageCost: number; // Cost per km

  // Fleet & Maintenance
  maintenanceInterval: number; // KM
  maintenanceAlertThreshold: number; // KM before alert
  maintenanceTypes: string[];

  // Communication
  smsEnabled: boolean;
  smsProvider?: string;
  emailEnabled: boolean;
  whatsappEnabled: boolean;

  // Docs
  termsAndConditions: string;

  // GPS
  gpsProvider: string;
  gpsUpdateFrequency: number;
  gpsAlertSpeed: number;
  gpsGeofencing: boolean;

  // System
  language: 'fr' | 'ar' | 'en';
  twoFactorAuth: boolean;
  backupFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  darkMode: boolean;

  // Payment
  paymentMethods: string[];
  invoicePrefix: string;
  autoInvoiceNumber: boolean;
}

// --- New Types for Notification Module ---

export enum NotificationCategory {
  VEHICLE = 'Documents Véhicule',
  MAINTENANCE = 'Maintenance',
  RESERVATION = 'Réservation/Contrat',
  CLIENT = 'Client/Paiement',
  GPS = 'Tracking GPS',
  FINANCE = 'Finance'
}

export enum NotificationPriority {
  INFO = 'Info',
  WARNING = 'Attention',
  CRITICAL = 'Critique',
  SUCCESS = 'Succès'
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkTo?: string; // e.g., '/vehicles'
}

export interface AlertConfig {
  id: string;
  enabled: boolean;
  name: string; // e.g., "Expiration Assurance"
  category: NotificationCategory;
  threshold?: number; // e.g., 7 days or 500 km
  thresholdUnit?: 'DAYS' | 'KM' | 'PERCENT' | 'AMOUNT';
  channels: {
    system: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  recipients: UserRole[]; // Who receives this
}

// --- New Types for Invoice Module ---

export enum InvoiceStatus {
  PENDING = 'En attente',
  PAID = 'Payée',
  CANCELLED = 'Annulée',
  OVERDUE = 'En retard'
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  ref: string; // e.g. FACT-2024-001
  date: string;
  dueDate: string;

  clientId: string;
  clientName: string;
  clientAddress?: string;
  clientIce?: string; // For companies

  vehicleId?: string;
  vehicleSnapshot?: string; // e.g. "Clio 5 (12345-A-6)"

  contractId?: string; // Link

  items: InvoiceItem[];

  subTotal: number; // HT
  taxRate: number; // 20% usually
  taxAmount: number; // TVA
  totalAmount: number; // TTC

  paidAmount: number;
  balance: number; // Reste à payer

  status: InvoiceStatus;
  notes?: string;
}