-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Vehicles Table
create table public.vehicles (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  brand text not null,
  model text not null,
  version text,
  year integer,
  plate text not null unique,
  vin text,
  category text, -- ECONOMY, SUV, LUXURY, etc.
  status text default 'AVAILABLE', -- AVAILABLE, RENTED, MAINTENANCE
  daily_rate numeric,
  weekly_rate numeric,
  monthly_rate numeric,
  purchase_price numeric,
  current_value numeric,
  image_url text,
  transmission text, -- MANUAL, AUTOMATIC
  fuel text, -- DIESEL, PETROL, HYBRID, ELECTRIC
  seats integer,
  color text,
  fiscal_power integer,
  mileage integer default 0,
  agency_id text,
  insurance_expiry date,
  tech_visit_expiry date,
  gps_id text
);

-- 2. Clients Table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  phone text,
  email text,
  address text,
  city text,
  doc_type text, -- CIN, PASSPORT
  doc_number text,
  doc_expiry date,
  license_number text,
  status text default 'NORMAL', -- NORMAL, VIP, BLACKLIST
  notes text,
  total_bookings integer default 0
);

-- 3. Reservations Table
create table public.reservations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  vehicle_id uuid references public.vehicles(id),
  client_id uuid references public.clients(id),
  client_name text, -- Cache for display
  client_phone text, -- Cache for display
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  pickup_location text,
  return_location text,
  total_price numeric,
  status text default 'PENDING', -- PENDING, CONFIRMED, ONGOING, COMPLETED, CANCELLED
  notes text
);

-- 4. Contracts Table
create table public.contracts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text default 'CONTRAT', -- CONTRAT, DEVIS
  client_id uuid references public.clients(id),
  vehicle_id uuid references public.vehicles(id),
  vehicle_snapshot text, -- "Brand Model (Plate)" at time of contract
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  pickup_location text,
  return_location text,
  daily_rate numeric,
  total_days integer,
  discount numeric default 0,
  extra_fees numeric default 0,
  total_amount numeric,
  deposit numeric default 0,
  paid_amount numeric default 0,
  status text default 'DRAFT', -- DRAFT, ACTIVE, CLOSED
  start_mileage integer,
  end_mileage integer,
  return_date_actual timestamp with time zone
);

-- 5. Invoices Table
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  number text unique, -- FACT-2024-001
  contract_id uuid references public.contracts(id),
  client_id uuid references public.clients(id),
  amount numeric,
  status text default 'UNPAID', -- UNPAID, PAID, CANCELLED
  due_date date,
  items jsonb -- Array of { description, quantity, price }
);

-- 6. Maintenance Table
create table public.maintenance (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  vehicle_id uuid references public.vehicles(id),
  type text, -- OIL_CHANGE, MECHANICAL, TIRES, etc.
  description text,
  garage text,
  entry_date date,
  exit_date date,
  current_mileage integer,
  parts_cost numeric default 0,
  labor_cost numeric default 0,
  total_cost numeric default 0,
  status text default 'TODO', -- TODO, IN_PROGRESS, COMPLETED
  next_service_mileage integer,
  next_service_date date,
  notes text
);

-- RLS Policies (Simplified for now - allow public access for demo purposes, or authenticated)
-- Ideally, you should restrict this to authenticated users only.

alter table public.vehicles enable row level security;
create policy "Enable all access for authenticated users" on public.vehicles for all using (auth.role() = 'authenticated');
create policy "Enable read access for anon" on public.vehicles for select using (true);

alter table public.clients enable row level security;
create policy "Enable all access for authenticated users" on public.clients for all using (auth.role() = 'authenticated');

alter table public.reservations enable row level security;
create policy "Enable all access for authenticated users" on public.reservations for all using (auth.role() = 'authenticated');

alter table public.contracts enable row level security;
create policy "Enable all access for authenticated users" on public.contracts for all using (auth.role() = 'authenticated');

alter table public.invoices enable row level security;
create policy "Enable all access for authenticated users" on public.invoices for all using (auth.role() = 'authenticated');

alter table public.maintenance enable row level security;
create policy "Enable all access for authenticated users" on public.maintenance for all using (auth.role() = 'authenticated');
