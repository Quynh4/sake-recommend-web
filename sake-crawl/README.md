# Sake Data Crawler

## Overview

Automated web scraper that extracts sake product data from the Sakenowa API across all 47 Japanese prefectures. Solves the problem of fragmented product information by aggregating 940+ products into a single structured dataset.

## Problem Solved

The sake industry lacks centralized product databases. Information is scattered across regional APIs with inconsistent schemas. Manual collection would require 940+ individual API calls with error-prone data normalization.

## Technical Solution

Built a systematic crawler that:
- Iterates through all 47 prefectures (area IDs 1-47)
- Extracts 18 fields per product from nested JSON responses
- Handles missing/optional fields with defensive programming
- Normalizes multi-valued fields (images, tags, similar brands) into pipe-delimited strings
- Outputs clean CSV ready for database import

## Key Technical Challenges

**1. Inconsistent Data Availability**
- Not all products have complete metadata (international names, flavor profiles)
- Solution: Conditional field extraction with null-safe defaults

**2. SSL Certificate Issues**
- Sakenowa API has self-signed certificates
- Solution: Custom SSL context override for unverified connections

**3. Multi-valued Fields**
- Products have variable-length arrays (pictures, flavor tags, similar brands)
- Solution: Pipe-delimited concatenation for CSV compatibility

**4. Data Integrity**
- Partial failures could corrupt entire dataset
- Solution: Write-as-you-go CSV approach with explicit quoting

## Data Schema

Extracts 18 fields per product:
- **Identifiers**: id, name, intl_name
- **Regional**: brand_name, brand_intl_name
- **Metrics**: rank, score, checkin_count
- **Flavor Profile**: f1-f6 (6-dimensional normalized vectors)
- **Metadata**: year_month, flavour_tags, pictures, similar_brands

Flavor dimensions (f1-f6) represent:
- f1: Umami intensity
- f2: Acidity level
- f3: Bitterness
- f4: Aftertaste complexity
- f5: Carbonation presence
- f6: Overall richness

## Technology Stack

- Python 3.7+
- urllib (HTTP client)
- tqdm (progress tracking)
- CSV writer (data output)

## Usage

```bash
python crawl.py
```

Output: `liquor_data.csv` (~500KB, 940 products)

## Integration

CSV format designed for direct PostgreSQL import:
```sql
COPY products FROM 'liquor_data.csv' DELIMITER ',' CSV HEADER;
```
