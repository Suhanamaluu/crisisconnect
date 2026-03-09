-- ===== CRISIS CONNECT (CDRS) — SUPABASE TABLE SETUP =====
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Camps Table
CREATE TABLE IF NOT EXISTS camps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT NOT NULL,
  total_capacity INTEGER DEFAULT 0,
  beds_available INTEGER DEFAULT 0,
  food_availability TEXT DEFAULT 'Low',
  children INTEGER DEFAULT 0,
  adults INTEGER DEFAULT 0,
  seniors INTEGER DEFAULT 0,
  food_stock INTEGER DEFAULT 0,
  medicine_stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Requests Table
CREATE TABLE IF NOT EXISTS user_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  resource TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  accepted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Coordinators Table
CREATE TABLE IF NOT EXISTS coordinators (
  id TEXT PRIMARY KEY,         -- 6-digit coordinator code
  name TEXT NOT NULL,
  camp_code TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Resource Requests Table
CREATE TABLE IF NOT EXISTS resource_requests (
  id TEXT PRIMARY KEY,
  coordinator_name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  required_before TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Map Data Table (single row with full grid as JSON)
CREATE TABLE IF NOT EXISTS map_data (
  id TEXT PRIMARY KEY DEFAULT 'main_grid',
  grid JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== SEED DATA =====

-- Seed camps
INSERT INTO camps (id, name, code, location, total_capacity, beds_available, food_availability, children, adults, seniors, food_stock, medicine_stock)
VALUES
  ('CAMP001', 'City Relief Center', 'CRC-2026', 'Block A, Sector 12', 500, 120, 'High', 85, 280, 15, 450, 200),
  ('CAMP002', 'Green Valley Shelter', 'GVS-2026', 'Highway 7, Green Valley', 300, 45, 'Medium', 60, 175, 20, 180, 90),
  ('CAMP003', 'East Side Camp', 'ESC-2026', 'East Bridge Road', 200, 8, 'Low', 42, 140, 10, 60, 30)
ON CONFLICT (id) DO NOTHING;

-- Seed default map (15x15 grid with danger/moderate zones)
INSERT INTO map_data (id, grid)
VALUES ('main_grid', '[
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","moderate","moderate","safe","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","moderate","danger","danger","moderate","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","moderate","danger","danger","danger","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","moderate","moderate","moderate","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","moderate","moderate","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","moderate","danger","danger","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","danger","danger","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","danger","moderate","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe"],
  ["safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe","safe"]
]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ===== ROW LEVEL SECURITY (Public access for emergency platform) =====
-- Enable RLS but allow public read/write for emergency use

ALTER TABLE camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_data ENABLE ROW LEVEL SECURITY;

-- Public policies (anyone can read/write — emergency platform, no auth walls)
CREATE POLICY "Public read camps" ON camps FOR SELECT USING (true);
CREATE POLICY "Public update camps" ON camps FOR UPDATE USING (true);
CREATE POLICY "Public insert camps" ON camps FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read requests" ON user_requests FOR SELECT USING (true);
CREATE POLICY "Public insert requests" ON user_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update requests" ON user_requests FOR UPDATE USING (true);

CREATE POLICY "Public read coordinators" ON coordinators FOR SELECT USING (true);
CREATE POLICY "Public insert coordinators" ON coordinators FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read resource_requests" ON resource_requests FOR SELECT USING (true);
CREATE POLICY "Public insert resource_requests" ON resource_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read map_data" ON map_data FOR SELECT USING (true);
CREATE POLICY "Public update map_data" ON map_data FOR UPDATE USING (true);
CREATE POLICY "Public insert map_data" ON map_data FOR INSERT WITH CHECK (true);
