-- Drop existing tables if they exist
DROP TABLE IF EXISTS calc_inverters CASCADE;
DROP TABLE IF EXISTS calc_panels CASCADE;
DROP TABLE IF EXISTS calc_batteries CASCADE;
DROP TABLE IF EXISTS calc_appliances CASCADE;
DROP TABLE IF EXISTS calc_accessories CASCADE;

-- 1. Inverters
CREATE TABLE calc_inverters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kva NUMERIC NOT NULL,
    voltage INTEGER NOT NULL,
    price INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('normal', 'hybrid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Panels
CREATE TABLE calc_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watt NUMERIC NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Batteries
CREATE TABLE calc_batteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('lithium', 'tubular', 'drycell')),
    voltage NUMERIC NOT NULL,
    nominal_voltage INTEGER NOT NULL,
    ah NUMERIC NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Appliances
CREATE TABLE calc_appliances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    running_watts NUMERIC NOT NULL,
    surge_factor NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Accessories & Install Fees
CREATE TABLE calc_accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kva NUMERIC UNIQUE NOT NULL,
    fee INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: To seed data, you will need to run INSERT statements. 
-- The initial seed script will be generated next, or we can insert from the client. Let's seed the defaults here.

-- Seed Inverters (Normal)
INSERT INTO calc_inverters (kva, voltage, price, type) VALUES 
(1, 12, 170000, 'normal'),
(1.5, 12, 220000, 'normal'),
(1.5, 24, 300000, 'normal'),
(2, 12, 240000, 'normal'),
(2, 24, 320000, 'normal'),
(2.5, 24, 350000, 'normal'),
(3, 24, 400000, 'normal'),
(3.5, 24, 450000, 'normal'),
(4, 24, 470000, 'normal'),
(5, 48, 600000, 'normal'),
(6, 48, 650000, 'normal'),
(7.5, 48, 1000000, 'normal'),
(10, 48, 1300000, 'normal');

-- Seed Inverters (Hybrid)
INSERT INTO calc_inverters (kva, voltage, price, type) VALUES 
(1.5, 12, 200000, 'hybrid'),
(2, 12, 230000, 'hybrid'),
(2.5, 24, 250000, 'hybrid'),
(3.5, 24, 310000, 'hybrid'),
(4, 24, 320000, 'hybrid'),
(5, 48, 500000, 'hybrid'),
(6, 48, 550000, 'hybrid'),
(7.5, 48, 800000, 'hybrid'),
(10, 48, 1100000, 'hybrid');

-- Seed Panels
INSERT INTO calc_panels (watt, price) VALUES 
(200, 45000),
(250, 55000),
(300, 68000),
(350, 75000),
(400, 80000),
(450, 85000),
(500, 90000),
(550, 95000),
(600, 105000);

-- Seed Batteries
INSERT INTO calc_batteries (sku, type, voltage, nominal_voltage, ah, price) VALUES 
('dry-12v-200ah', 'drycell', 12, 12, 200, 260000),
('tub-12v-220ah', 'tubular', 12, 12, 220, 250000),
('li-12v-100ah', 'lithium', 12.8, 12, 100, 230000),
('li-12v-200ah', 'lithium', 12.8, 12, 200, 330000),
('li-24v-100ah', 'lithium', 25.6, 24, 100, 480000),
('li-24v-120ah', 'lithium', 25.6, 24, 120, 490000),
('li-24v-200ah', 'lithium', 25.6, 24, 200, 790000),
('li-24v-240ah', 'lithium', 25.6, 24, 240, 820000),
('li-48v-100ah', 'lithium', 51.2, 48, 100, 900000),
('li-48v-200ah', 'lithium', 51.2, 48, 200, 1600000),
('li-48v-300ah', 'lithium', 51.2, 48, 300, 1890000);

-- Seed Appliances
INSERT INTO calc_appliances (name, running_watts, surge_factor) VALUES 
('LED Bulb', 10, 0),
('Fan', 75, 0),
('TV (LED)', 150, 0),
('Sound System', 150, 0),
('Laptop', 65, 0),
('Freezer/Fridge', 200, 3),
('Water Pump (1HP)', 750, 2),
('AC (1HP)', 1100, 2),
('AC (1.5HP)', 1500, 2),
('Microwave', 1200, 0);

-- Seed Accessories Install
INSERT INTO calc_accessories (kva, fee) VALUES 
(1, 295000),
(1.5, 300000),
(2, 300000),
(2.5, 350000),
(3, 350000),
(3.5, 350000),
(4, 350000),
(5, 490000),
(6, 500000),
(7.5, 620000),
(10, 650000);
