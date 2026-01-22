# Machine Learning Recommendation Service

## Overview

Production-ready microservice providing intelligent product recommendations through two complementary ML approaches: K-Nearest Neighbors for collaborative filtering and Sentence Transformers for semantic search. Achieves 150ms query latency while solving the cold-start problem.

## Problem Solved

Traditional recommendation systems face critical challenges:
- **Cold Start**: New users have no interaction history
- **Sparse Data**: Most users interact with <5% of products
- **Semantic Gap**: Keyword search fails to understand intent ("sweet fruity sake" vs "甘口フルーティー")
- **Multilingual Queries**: Japanese products with English queries require cross-lingual understanding
- **Real-time Inference**: Must generate recommendations in <200ms for acceptable UX

## Technical Solution

Hybrid recommendation architecture combining:

**1. Content-Based Filtering (KNN)**
- Algorithm: K-Nearest Neighbors with Euclidean distance
- Features: Brand one-hot encoding + flavor tags binary vectors
- Use case: "Find products similar to this one"
- Latency: ~50ms per query

**2. Semantic Search (Transformers)**
- Model: paraphrase-multilingual-MiniLM-L12-v2
- Technique: Dense vector embeddings (384-dim) + cosine similarity
- Use case: "I want a sweet red wine with fruity notes"
- Latency: ~150ms (cached embeddings)

## Key Technical Challenges

**1. Sparse Feature Vectors**
- Products have variable brand/tag combinations creating sparse matrices
- Solution: Dynamic feature extraction per query - only use features present in query product
- Avoids zero-inflation while maintaining similarity accuracy

**2. Multilingual Embeddings**
- Japanese product names + English queries require cross-lingual understanding
- Solution: Multilingual sentence transformer trained on 50+ languages
- Shared embedding space maps Japanese and English queries to similar vectors
- Validation: "sweet sake" → "甘口純米大吟醸" (similarity: 0.78)

**3. Cold Start Latency**
- First request takes 30+ seconds (model loading + embedding generation)
- Solution: Lazy loading + pickle caching of embeddings
- Cache invalidation on dataframe shape change
- Result: First request 30s → Cached requests 150ms

**4. JSON Serialization**
- FastAPI fails to serialize numpy types (np.int64, np.float64)
- Solution: Explicit type conversion in safe_get() helper
- Ensures all response values are Python native types

**5. Gaussian Similarity Ranking**
- Need to penalize large flavor deviations while rewarding exact matches
- Solution: Gaussian filter with configurable sigma parameter

**Mathematical Formulas:**

**Gaussian Similarity Function:**
```
G(x_ref, x_current, σ) = exp(-(x_ref - x_current)² / (2σ²))

Where:
- x_ref: Reference value (from query product)
- x_current: Current value (from candidate product)
- σ (sigma): Standard deviation controlling sensitivity
- Output: Similarity score in range [0, 1]
```

**Flavor Similarity Calculation:**
```
For each flavor dimension i ∈ {1,2,3,4,5,6}:
  flavor_sim_i = G(f_i_ref, f_i_current, σ=0.6)

Total flavor similarity = Σ(flavor_sim_i) for i=1 to 6
```

**Popularity Similarity:**
```
popularity_sim = G(max_checkin, current_checkin, σ=max_checkin)

Where:
- max_checkin: Highest check-in count in candidate set
- current_checkin: Check-in count of current product
- σ = max_checkin: Adaptive sigma based on data scale
```

**Final Ranking Score:**
```
Score = popularity_sim + (Σ flavor_sim_i × 7) + (product_score × 0.5)

Where:
- popularity_sim: Gaussian similarity on check-in counts
- Σ flavor_sim_i: Sum of 6 flavor dimension similarities
- 7: Weight multiplier for flavor importance
- product_score: User rating (0-5 scale)
- 0.5: Weight for rating contribution
```

**Example Calculation:**
```
Given query product: f1=0.8, f2=0.6, checkin=1000, score=4.5
Candidate product: f1=0.75, f2=0.65, checkin=950, score=4.3

flavor_sim_1 = exp(-((0.8-0.75)²)/(2×0.6²)) = exp(-0.0025/0.72) = 0.9965
flavor_sim_2 = exp(-((0.6-0.65)²)/(2×0.6²)) = exp(-0.0025/0.72) = 0.9965
... (calculate f3-f6 similarly)

popularity_sim = exp(-((1000-950)²)/(2×1000²)) = exp(-2500/2000000) = 0.9988

Final Score = 0.9988 + ((0.9965+0.9965+...×6) × 7) + (4.3 × 0.5)
            ≈ 0.9988 + (5.98 × 7) + 2.15
            ≈ 44.01
```

## API Endpoints
**GET /recommend/{id}**
- KNN-based collaborative filtering
- Input: Product ID from database
- Output: Top 5 similar products with flavor profiles
- Response includes: rank, id, brand, name, score, flavors (f1-f6), tags, pictures

**POST /recommend-by-text**
- Semantic search with natural language queries
- Input: {"query": "sweet fruity sake", "top_k": 5}
- Output: Ranked products with similarity scores (0.0-1.0)
- Supports multilingual queries (Japanese, English, mixed)

## KNN Algorithm Details

Feature engineering:
- Extract brand name as binary feature
- Parse pipe-delimited flavor tags into multi-hot encoding
- Typical dimensionality: 50-100 features per product

Ranking strategy:
- Popularity factor: Gaussian similarity on checkin_count
- Flavor similarity: Gaussian on 6 dimensions (f1-f6) with sigma=0.6
- Score bonus: Product rating × 0.5
- Final score: popularity + (sum of flavor similarities × 7) + score bonus

## Semantic Search Details

Product description generation:
- Concatenates: brand, name, intl_name, flavor tags, rating, check-ins
- Example: "Brand: Hokkaido. Name: Kamikawataisetsu. Flavors: 旨味, 酸味, 苦味. Rating: 4.4"

Embedding pipeline:
- Model: paraphrase-multilingual-MiniLM-L12-v2 (384-dim vectors)
- Batch encode all 900 products (~25 seconds)
- Cache embeddings to disk (data/embeddings_cache.pkl)
- Query encoding: Real-time (<50ms)
- Similarity: Cosine similarity via PyTorch util.cos_sim()

## Semantic Search Algorithm

**Product Description Generation:**
- Concatenates: brand, name, intl_name, flavor tags, rating, check-ins
- Example: "Brand: Hokkaido. Name: Kamikawataisetsu. Flavors: 旨味, 酸味, 苦味. Rating: 4.4"

**Embedding Process:**
- Model: paraphrase-multilingual-MiniLM-L12-v2 (384-dimensional vectors)
- Batch encode all 900 products (~25 seconds)
- Cache embeddings to disk (data/embeddings_cache.pkl)
- Query encoding: Real-time (<50ms)

**Cosine Similarity Formula:**
```
Given two vectors A and B in 384-dimensional space:

cos_sim(A, B) = (A · B) / (||A|| × ||B||)

Where:
- A · B: Dot product = Σ(A_i × B_i) for i=1 to 384
- ||A||: L2 norm of A = √(Σ A_i²)
- ||B||: L2 norm of B = √(Σ B_i²)
- Output: Similarity score in range [-1, 1], typically [0, 1] for text
```

**Step-by-step Calculation:**
```
1. Encode query text to embedding vector:
   query_vec = model.encode("sweet fruity sake")
   → 384-dimensional vector: [0.123, -0.456, 0.789, ...]

2. For each product embedding in database:
   product_vec = cached_embeddings[i]
   → 384-dimensional vector: [0.234, -0.345, 0.678, ...]

3. Calculate dot product:
   dot_product = Σ(query_vec[i] × product_vec[i]) for i=0 to 383
   Example: (0.123 × 0.234) + (-0.456 × -0.345) + ... = 0.856

4. Calculate norms:
   norm_query = √(Σ query_vec[i]²) = √(0.123² + (-0.456)² + ...) = 1.0
   norm_product = √(Σ product_vec[i]²) = √(0.234² + (-0.345)² + ...) = 1.0
   (Note: Sentence-transformers normalizes embeddings, so norms ≈ 1.0)

5. Calculate cosine similarity:
   cos_sim = 0.856 / (1.0 × 1.0) = 0.856

6. Rank all products by similarity score (descending)
7. Return top-k results
```

**Multilingual Cross-lingual Matching:**
```
The model maps semantically similar text to nearby points in embedding space,
regardless of language:

English query: "sweet sake"
  → embedding: [0.12, -0.34, 0.56, ...]

Japanese product: "甘口純米大吟醸"
  → embedding: [0.15, -0.32, 0.58, ...]

Cosine similarity: 0.78 (high similarity despite different languages)
```

## Technology Stack

- FastAPI 0.109.0 (async ASGI framework)
- scikit-learn 1.4.0 (KNN, preprocessing)
- sentence-transformers 2.3.1 (semantic embeddings)
- PyTorch 2.1.2 CPU (transformer inference)
- pandas 2.1.4, numpy 1.26.3 (data processing)
- PostgreSQL via psycopg2-binary 2.9.9
- Uvicorn 0.27.0 (production server)

## Installation

**Option 1: Local Development**
Prerequisites: Python 3.9+, PostgreSQL 15+ (optional), 2GB RAM, 1GB disk

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

**Option 2: Docker (Recommended)**
Prerequisites: Docker

```bash
docker build -t ml-service .
docker run -d -p 8000:8000 ml-service
```

Service runs on http://localhost:8000
