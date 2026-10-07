-- Core Property Entity
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- e.g., 'apartment', 'house', 'commercial'
    listing_type VARCHAR(20) NOT NULL,   -- e.g., 'sale', 'rent'
    bedrooms INT,
    bathrooms NUMERIC(3, 1),
    sqft INT,
    address JSONB NOT NULL,              -- Street, City, State, Zip, Country
    location GEOGRAPHY(Point, 4326),     -- Geospatial PostGIS point
    status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'published', 'sold'
    agent_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geospatial Index for map-range searches
CREATE INDEX idx_properties_location ON properties USING GIST (location);
-- Composite Index for fast filtering
CREATE INDEX idx_properties_search ON properties (listing_type, property_type, price);
