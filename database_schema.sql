-- ==============================================================================
-- 🏙️ URBAN PULSE - RELATIONAL DATABASE SCHEMA (PostgreSQL + PostGIS)
-- ==============================================================================
-- This SQL schema provides an enterprise-grade relational translation of 
-- the Urban Pulse MongoDB document database, complete with PostGIS geometry,
-- foreign keys, check constraints, enums, and spatial GIST indexes.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. CUSTOM ENUM TYPES
CREATE TYPE user_role AS ENUM ('user', 'admin', 'official', 'osp', 'vendor');
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE locality_type AS ENUM ('Society', 'Colony', 'Village', 'Apartment', 'Commercial Area', 'Other');
CREATE TYPE committee_status AS ENUM ('PENDING', 'UNDER_PROCESS', 'APPROVED', 'REJECTED');
CREATE TYPE report_status AS ENUM ('pending', 'allotted', 'resolved');
CREATE TYPE waste_submission_status AS ENUM ('pending', 'approved', 'vendor-assigned', 'collected', 'verified', 'paid', 'rejected');
CREATE TYPE pickup_method AS ENUM ('self', 'vendor');
CREATE TYPE vendor_event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'created', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'failed', 'paid');
CREATE TYPE payment_method AS ENUM ('razorpay', 'cod');

-- 3. COMMITTEES (Resident Welfare Associations / Societies)
CREATE TABLE committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    locality_type locality_type DEFAULT 'Society',
    approx_households INTEGER DEFAULT 0 CHECK (approx_households >= 0),
    leader_name VARCHAR(150) NOT NULL,
    leader_email VARCHAR(255) NOT NULL UNIQUE,
    leader_phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    area VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    landmark VARCHAR(150),
    location GEOMETRY(Point, 4326),
    is_active BOOLEAN DEFAULT TRUE,
    committee_status committee_status DEFAULT 'PENDING',
    is_kyc_verified BOOLEAN DEFAULT FALSE,
    kyc_remarks TEXT,
    is_committee_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_committees_location ON committees USING GIST(location);

-- 4. USERS (Citizens, Officials, OSP Workers, Vendors, Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE,
    fname VARCHAR(100),
    lname VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    aadhar VARCHAR(12) NOT NULL UNIQUE CHECK (length(aadhar) = 12),
    role user_role DEFAULT 'user',
    dob DATE,
    gender gender_type,
    address TEXT,
    profile_img TEXT,
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    greencoins NUMERIC(12, 2) DEFAULT 0.00 CHECK (greencoins >= 0),
    committee_id UUID REFERENCES committees(id) ON DELETE SET NULL,
    is_on_duty BOOLEAN DEFAULT FALSE,
    otp VARCHAR(10),
    otp_expires TIMESTAMPTZ,
    is_otp_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- 5. COMMITTEE MEMBERSHIP JUNCTION TABLE
CREATE TABLE committee_members (
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (committee_id, user_id)
);

-- 6. USER CART ITEMS (E-commerce shopping cart)
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    img TEXT,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_user ON cart_items(user_id);

-- 7. CIVIC REPORTS (Dual source: Citizen uploads & CCTV YOLOv8 AI detections)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_img TEXT NOT NULL,
    report_yolo_img TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    remarks TEXT DEFAULT 'NA',
    report_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status report_status DEFAULT 'pending',
    report_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_owner ON reports(report_owner_id);
CREATE INDEX idx_reports_assigned ON reports(assigned_to_id);

-- 8. WASTE TYPES (Catalog of accepted recyclables)
CREATE TABLE waste_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_per_kg NUMERIC(8, 2) NOT NULL CHECK (price_per_kg >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. FRANCHISEES (Recycling Hubs & Processing Centers)
CREATE TABLE franchisees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    center_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    serviceable_pincodes TEXT[] DEFAULT '{}',
    location GEOMETRY(Point, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_collected_kg NUMERIC(12, 2) DEFAULT 0.00 CHECK (total_collected_kg >= 0),
    balance NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_franchisees_location ON franchisees USING GIST(location);
CREATE INDEX idx_franchisees_pincode ON franchisees(pincode);

-- 10. FRANCHISEE ACCEPTED WASTE TYPES JUNCTION TABLE
CREATE TABLE franchisee_waste_types (
    franchisee_id UUID NOT NULL REFERENCES franchisees(id) ON DELETE CASCADE,
    waste_type_id UUID NOT NULL REFERENCES waste_types(id) ON DELETE CASCADE,
    PRIMARY KEY (franchisee_id, waste_type_id)
);

-- 11. WASTE SUBMISSIONS (Citizen scrap recycling pickup/dropoff requests)
CREATE TABLE waste_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    waste_type_id UUID NOT NULL REFERENCES waste_types(id) ON DELETE RESTRICT,
    weight_kg NUMERIC(10, 2) NOT NULL CHECK (weight_kg >= 0.1),
    estimated_amount NUMERIC(10, 2) NOT NULL,
    final_amount NUMERIC(10, 2),
    franchisee_id UUID REFERENCES franchisees(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    pickup_method pickup_method DEFAULT 'self',
    status waste_submission_status DEFAULT 'pending',
    images TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_user ON waste_submissions(user_id);
CREATE INDEX idx_submissions_franchisee ON waste_submissions(franchisee_id);
CREATE INDEX idx_submissions_vendor ON waste_submissions(vendor_id);
CREATE INDEX idx_submissions_status ON waste_submissions(status);

-- 12. VENDOR EVENTS (Neighborhood collection drives)
CREATE TABLE vendor_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_name VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    waste_types TEXT[] NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    address TEXT,
    area_name VARCHAR(150),
    event_date TIMESTAMPTZ NOT NULL,
    status vendor_event_status DEFAULT 'upcoming',
    franchisee_id UUID REFERENCES franchisees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_events_location ON vendor_events USING GIST(location);
CREATE INDEX idx_vendor_events_vendor ON vendor_events(vendor_id);
CREATE INDEX idx_vendor_events_date ON vendor_events(event_date);

-- 13. VENDOR SETTLEMENTS (Financial disbursements for collected scrap batches)
CREATE TABLE vendor_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    franchisee_id UUID NOT NULL REFERENCES franchisees(id) ON DELETE RESTRICT,
    event_id UUID NOT NULL REFERENCES vendor_events(id) ON DELETE RESTRICT,
    total_weight_kg NUMERIC(10, 2) NOT NULL CHECK (total_weight_kg >= 0),
    amount_paid_to_vendor NUMERIC(12, 2) NOT NULL CHECK (amount_paid_to_vendor >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlements_vendor ON vendor_settlements(vendor_id);
CREATE INDEX idx_settlements_franchisee ON vendor_settlements(franchisee_id);

-- 14. COMMUNITY CLEANLINESS & RECYCLING EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(255) NOT NULL,
    event_hosted_by VARCHAR(255) NOT NULL,
    event_description TEXT NOT NULL,
    event_date_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_location TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_location ON events USING GIST(location);
CREATE INDEX idx_events_date ON events(event_date_time);

-- 15. EVENT REGISTRATIONS (Attendee RSVP junction)
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participants INTEGER DEFAULT 1 CHECK (participants >= 1),
    experience TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_reg_event ON event_registrations(event_id);
CREATE INDEX idx_event_reg_user ON event_registrations(user_id);

-- 16. GREEN STORE ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ordered_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    payment_method payment_method DEFAULT 'razorpay',
    order_status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(ordered_by);
CREATE INDEX idx_orders_status ON orders(order_status);

-- 17. ORDER LINE ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    category VARCHAR(100) NOT NULL,
    img TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
