-- Migration 001: Add project geolocation columns
-- Adds latitude/longitude (plain DOUBLE PRECISION) to existing installs.
-- Note: The PostGIS-based `geom` column and trigger from schema.sql are
-- intentionally skipped here because the `postgis` extension is not
-- installed on every server. The API/UI only needs latitude/longitude.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;