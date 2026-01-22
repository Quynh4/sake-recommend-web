-- Create database
CREATE DATABASE wine_db;

-- Connect to database
\c wine_db;

-- Create products table (optional - JPA will auto-create if using ddl-auto=update)
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    intl_name VARCHAR(255),
    brand_name VARCHAR(255),
    brand_intl_name VARCHAR(255),
    year_month VARCHAR(10),
    rank INTEGER,
    score DOUBLE PRECISION,
    f1 DOUBLE PRECISION,
    f2 DOUBLE PRECISION,
    f3 DOUBLE PRECISION,
    f4 DOUBLE PRECISION,
    f5 DOUBLE PRECISION,
    f6 DOUBLE PRECISION,
    flavour_tags VARCHAR(1000),
    checkin_count INTEGER,
    pictures VARCHAR(2000),
    similar_brands VARCHAR(1000)
);

-- Create indexes to improve search performance
CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_product_intl_name ON products(intl_name);
CREATE INDEX idx_product_brand_name ON products(brand_name);
CREATE INDEX idx_product_brand_intl_name ON products(brand_intl_name);
CREATE INDEX idx_product_rank ON products(rank);
CREATE INDEX idx_product_score ON products(score);
CREATE INDEX idx_product_flavour_tags ON products USING gin(to_tsvector('simple', flavour_tags));
