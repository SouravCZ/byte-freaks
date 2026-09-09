-- Parivekshan AI - Seed Data
-- Demo records for the 3 tracked states: Delhi, Jammu & Kashmir, Meghalaya
-- NOTE: Primary data loading is via `npm run seed:claude-synth`
--       which reads new_states_mock_data.csv and truncates/reseeds all tables.
--       This file provides a minimal static fallback seed of blocks + users.

-- Blocks (name = district, district = state)
INSERT INTO blocks (name, district, mouza_count, risk_score) VALUES
('North Delhi', 'Delhi', 0, 50),
('New Delhi', 'Delhi', 0, 30),
('South Delhi', 'Delhi', 0, 55),
('East Delhi', 'Delhi', 0, 60),
('West Delhi', 'Delhi', 0, 35),
('Srinagar', 'Jammu and Kashmir', 0, 45),
('Anantnag', 'Jammu and Kashmir', 0, 60),
('Baramulla', 'Jammu and Kashmir', 0, 55),
('Jammu', 'Jammu and Kashmir', 0, 40),
('Kathua', 'Jammu and Kashmir', 0, 45),
('Udhampur', 'Jammu and Kashmir', 0, 35),
('West Garo Hills', 'Meghalaya', 0, 30),
('Ri-Bhoi', 'Meghalaya', 0, 45),
('East Khasi Hills', 'Meghalaya', 0, 35),
('South West Khasi Hills', 'Meghalaya', 0, 50),
('Jaintia Hills', 'Meghalaya', 0, 40)
ON CONFLICT (name) DO NOTHING;

-- Users (RBAC)
INSERT INTO users (name, designation, department, email, role) VALUES
('District Magistrate', 'District Magistrate & Collector', 'District Collectorate', 'dm@parivekshan.gov.in', 'collector'),
('ADM LA', 'Additional District Magistrate (LA)', 'Land Acquisition', 'admla@parivekshan.gov.in', 'adm'),
('BDO', 'Block Development Officer', 'Block Development', 'bdo@parivekshan.gov.in', 'bdo'),
('LAO', 'Land Acquisition Officer', 'LAO Office', 'lao@parivekshan.gov.in', 'lao')
ON CONFLICT (email) DO NOTHING;
