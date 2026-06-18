-- Supabase Schema for InferPay Enterprise Database
-- Copy and paste this script into the Supabase SQL Editor to set up all tables

-- Enable Row Level Security (RLS) is optional.
-- For a hackathon/dev stack challenge, we disable it or use simple policies.

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  tx_hash TEXT,
  block_number BIGINT,
  timestamp BIGINT,
  wallet_address TEXT,
  amount DOUBLE PRECISION,
  status TEXT,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  tx_hash TEXT,
  block_number BIGINT,
  timestamp BIGINT,
  wallet_address TEXT,
  amount DOUBLE PRECISION,
  status TEXT,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  tx_hash TEXT,
  block_number BIGINT,
  timestamp BIGINT,
  wallet_address TEXT,
  amount DOUBLE PRECISION,
  status TEXT,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  tx_hash TEXT,
  block_number BIGINT,
  timestamp BIGINT,
  wallet_address TEXT,
  amount DOUBLE PRECISION,
  status TEXT,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS swaps (
  id TEXT PRIMARY KEY,
  tx_hash TEXT,
  block_number BIGINT,
  timestamp BIGINT,
  wallet_address TEXT,
  amount DOUBLE PRECISION,
  status TEXT,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS bridges (
  id TEXT PRIMARY KEY,
  tx_hash TEXT,
  block_number BIGINT,
  timestamp BIGINT,
  wallet_address TEXT,
  amount DOUBLE PRECISION,
  status TEXT,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  tx_hash TEXT,
  block_number BIGINT,
  timestamp BIGINT,
  wallet_address TEXT,
  amount DOUBLE PRECISION,
  status TEXT,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT,
  capability TEXT,
  pricing DOUBLE PRECISION,
  reputation DOUBLE PRECISION,
  wallet_address TEXT,
  metadata TEXT
);

-- Enable select access to anyone for the dashboard integrations
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridges ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to sessions" ON sessions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to proposals" ON proposals FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to proposals" ON proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to proposals" ON proposals FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to jobs" ON jobs FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to payments" ON payments FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to swaps" ON swaps FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to swaps" ON swaps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to swaps" ON swaps FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to bridges" ON bridges FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to bridges" ON bridges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to bridges" ON bridges FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to activity_log" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to activity_log" ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to activity_log" ON activity_log FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to services" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to services" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to services" ON services FOR UPDATE USING (true);
