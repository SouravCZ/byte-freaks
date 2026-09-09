-- Parivekshan AI - Seed Data
-- Demo records matching the landing page telemetry

-- Blocks
INSERT INTO blocks (name, mouza_count, risk_score) VALUES
('Basirhat I', 120, 86.0),
('Basirhat II', 115, 88.0),
('Hingalganj', 98, 74.0),
('Amdanga', 76, 62.0),
('Barasat I', 110, 22.0),
('Barasat II', 95, 30.0),
('Barrackpore', 140, 45.0),
('Hasnabad', 60, 51.0),
('Kakdwip', 85, 52.0),
('Pathar Pratima', 70, 41.0)
ON CONFLICT (name) DO NOTHING;

-- All seed blocks are in West Bengal (district column stores state)
-- No UPDATE needed — default 'West Bengal' already applies to all rows

-- Projects
WITH b AS (SELECT id, name FROM blocks)
INSERT INTO projects (code, name, block_id, project_type, description, status, risk_score, delay_days, lead_time_days, mouzas_affected) VALUES
('BF-BSR-002', 'Basirhat Border Fencing Pkg 2', (SELECT id FROM b WHERE name='Basirhat II'), 'Border Infrastructure',
 'International border fencing with compensation verification backlog and riverine border parcel disputes.', 'active', 86, 210, 180, 24),
('NH12-AMD-EX', 'NH12 Amdanga Expansion', (SELECT id FROM b WHERE name='Amdanga'), 'Highway',
 'National Highway 12 widening with utility shifting delays and commercial tenant compensation claims.', 'active', 62, 120, 150, 18),
('LG-BAR-HUB', 'Barasat Logistics Park Hub', (SELECT id FROM b WHERE name='Barasat I'), 'Industrial',
 'Logistics park with minor environmental clearance documentation lag.', 'planned', 22, 0, 90, 12),
('RR-HNG-EMB', 'Hingalganj Embankment R&R', (SELECT id FROM b WHERE name='Hingalganj'), 'Resettlement',
 'Land-for-land replacement titling in tidal saline zones.', 'active', 74, 95, 200, 30),
('IC-BRK-COR', 'Barrackpore Industrial Corridor', (SELECT id FROM b WHERE name='Barrackpore'), 'Industrial',
 'Industrial utility shifting and multi-agency environmental clearances.', 'active', 45, 60, 120, 22),
('BF-HNG-001', 'Hingalganj Border Fencing Pkg 1', (SELECT id FROM b WHERE name='Hingalganj'), 'Border Infrastructure',
 'Erosion-related border works with legal dispute risk.', 'on_hold', 68, 140, 160, 28),
('KW-KAK-EMB', 'Kakdwip Embankment R&R', (SELECT id FROM b WHERE name='Kakdwip'), 'Resettlement',
 'Cyclone-hardened embankment relocation with fisher community compensation.', 'active', 52, 40, 140, 16),
('RR-PAT-001', 'Pathar Pratima Coastal Road', (SELECT id FROM b WHERE name='Pathar Pratima'), 'Highway',
 'Coastal access road with wetland clearance dependency.', 'planned', 41, 0, 90, 11)
ON CONFLICT (code) DO NOTHING;

-- Risk drivers (SHAP-style attribution)
WITH p AS (SELECT id, code FROM projects)
INSERT INTO risk_drivers (project_id, factor, impact_pct, rank) VALUES
((SELECT id FROM p WHERE code='BF-BSR-002'), 'Compensation Discrepancies', 82, 1),
((SELECT id FROM p WHERE code='BF-BSR-002'), 'R&R Clearance Delays', 71, 2),
((SELECT id FROM p WHERE code='BF-BSR-002'), 'Court Stays', 65, 3),
((SELECT id FROM p WHERE code='BF-BSR-002'), 'Documentation Gaps', 54, 4),
((SELECT id FROM p WHERE code='NH12-AMD-EX'), 'Utility Shifting Delays', 58, 1),
((SELECT id FROM p WHERE code='NH12-AMD-EX'), 'Commercial Valuation Disputes', 47, 2),
((SELECT id FROM p WHERE code='RR-HNG-EMB'), 'Land-for-Land Titling', 66, 1),
((SELECT id FROM p WHERE code='RR-HNG-EMB'), 'Saline Zone Compensation', 52, 2),
((SELECT id FROM p WHERE code='IC-BRK-COR'), 'Multi-Agency Clearances', 41, 1),
((SELECT id FROM p WHERE code='IC-BRK-COR'), 'Utility Shifting', 36, 2),
((SELECT id FROM p WHERE code='BF-HNG-001'), 'Erosion Displacement', 61, 1),
((SELECT id FROM p WHERE code='BF-HNG-001'), 'Legal Disputes', 57, 2),
((SELECT id FROM p WHERE code='KW-KAK-EMB'), 'Relocation Package Negotiation', 48, 1),
((SELECT id FROM p WHERE code='KW-KAK-EMB'), 'Fisher Livelihood Claims', 39, 2),
((SELECT id FROM p WHERE code='RR-PAT-001'), 'Wetland Clearance', 35, 1)
ON CONFLICT DO NOTHING;

-- Risk history snapshots (12 months for trend charts)
WITH p AS (SELECT id, code FROM projects)
INSERT INTO risk_history (project_id, risk_score, recorded_on)
SELECT id, 30 + (random() * 55)::int,
       (CURRENT_DATE - (gs || ' months')::interval)::date
FROM p CROSS JOIN generate_series(11, 0, -1) AS gs
WHERE code = 'BF-BSR-002'
ON CONFLICT DO NOTHING;

-- Alerts
WITH p AS (SELECT id, code FROM projects)
INSERT INTO alerts (project_id, severity, title, message) VALUES
((SELECT id FROM p WHERE code='BF-BSR-002'), 'critical',
 'Delay Imminent: Basirhat Border Fencing Pkg 2',
 'Compensation verification backlog threatening 210-day delay. Deploy Special Revenue Camp.'),
((SELECT id FROM p WHERE code='NH12-AMD-EX'), 'high',
 'NH12 Amdanga Utility Shifting Blocked',
 'WBSEDCL coordination required for commercial advance deposits.'),
((SELECT id FROM p WHERE code='LG-BAR-HUB'), 'low',
 'Barasat Logistics Park Clearance Pending',
 'Automated notice dispatched to State Pollution Control Board.'),
((SELECT id FROM p WHERE code='RR-HNG-EMB'), 'moderate',
 'Hingalganj R&R Titling Pending',
 'Sub-Divisional Officer grievance hearing scheduled for saline zone parcels.'),
((SELECT id FROM p WHERE code='KW-KAK-EMB'), 'moderate',
 'Kakdwip Relocation Negotiations Open',
 'Fisher community compensation talks ongoing across 16 mouzas.')
ON CONFLICT DO NOTHING;

-- Users (RBAC)
INSERT INTO users (name, designation, department, email, role) VALUES
('District Magistrate', 'District Magistrate & Collector', 'District Collectorate', 'dm@parivekshan.gov.in', 'collector'),
('ADM LA', 'Additional District Magistrate (LA)', 'Land Acquisition', 'admla@parivekshan.gov.in', 'adm'),
('BDO Basirhat', 'Block Development Officer', 'Basirhat Block', 'bdo@parivekshan.gov.in', 'bdo'),
('LAO North', 'Land Acquisition Officer', 'LAO Office', 'lao@parivekshan.gov.in', 'lao')
ON CONFLICT (email) DO NOTHING;
