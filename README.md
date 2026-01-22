# Sake Discovery Platform  
A platform for discovering Japanese sake products using recommendations

---

## Project Overview

The **Sake Discovery Platform** is a platform to support **taste-based product discovery** for Japanese sake.  
The system focuses on modeling **subjective and multi-dimensional flavor characteristics** and applying machine learning techniques to recommend products **without relying on user interaction history**.

The project is implemented as an end-to-end system, covering data collection, backend APIs, machine learning services, and a user-facing web interface.

---

## Key Capabilities

- Structured dataset of 700+ Japanese sake products  
- Six-dimensional flavor profile modeling  
- Taste-based filtering using vector similarity  
- Similarity-based product recommendation  
- Natural language–based recommendation  
- Modular backend and ML service architecture  

---

## Problem Statement

### Main Problem
Users struggle to discover products that match their personal taste preferences when taste is subjective, multi-dimensional, and difficult to express.

### Sub-Problems
1. Taste characteristics must be represented in a computable and comparable form  
2. Users require different discovery mechanisms depending on their intent  
3. Recommendations must work without user behavior data (cold-start scenario)  

---

## Solution Overview

The system provides **three complementary discovery mechanisms**, each addressing a specific user intent:

| User Intent | API | Method |
|------------|-----|--------|
| "I want something sweet but light" | `/api/products/search/flavor-profile` | Cosine similarity on flavor vectors |
| "I like this product, show me similar ones" | `/recommend/{id_entry}` | Content-based KNN |
| "A fruity sake for beginners" | `/recommend-by-text` | Semantic vector similarity |

All mechanisms are built on a shared product representation.

---

## Flavor Profile Representation

Each sake product is modeled as a six-dimensional normalized flavor vector:

$$
\vec{f} = (f_1, f_2, f_3, f_4, f_5, f_6), \quad f_i \in [0,1]
$$

The dimensions represent core taste attributes such as sweetness/dryness, acidity, bitterness, aftertaste, carbonation, and richness.

This representation enables mathematical comparison between products and user preferences.

---

## API and Model Design

### 1. Taste-Based Flavor Profile Search  
**API:** `/api/products/search/flavor-profile`

**Purpose**  
Allow users to search for products by explicitly specifying taste preferences.

**Method**  
User input is converted into a flavor preference vector. Similarity between the user vector and each product vector is computed using **Cosine Similarity**:

$$
\text{cosine\_similarity}(A, B) = \frac{A \cdot B}{||A|| \times ||B||}
$$

Products are ranked by descending similarity score.

---

### 2. Similarity-Based Product Recommendation  
**API:** `/recommend/{id_entry}`

**Purpose**  
Recommend products similar to a selected reference product.

**Method**  
A **content-based K-Nearest Neighbors (KNN)** approach is used. Each product is represented using structured attributes, with similarity computed via a weighted scoring function.

---

## Recommendation Formula (recommend_by_id)

Each candidate product is scored using a weighted sum of popularity similarity, flavor similarity, and quality score.

### 1. Popularity Similarity

Popularity similarity is computed using a Gaussian similarity based on check-in counts:

$$
S_{\text{popularity}} = \exp\left( - \frac{(\text{max\_checkin} - \text{checkin})^2}{2\sigma^2} \right)
$$

This favors products with popularity close to the reference level.

---

### 2. Flavor Similarity

Each flavor dimension is compared to the reference product using a Gaussian filter:

$$
S_{\text{flavor}_i} = \exp\left( - \frac{(f_{i,\text{ref}} - f_i)^2}{2\sigma_{\text{flavor}}^2} \right)
$$

Total flavor similarity:

$$
\sum_{i=1}^{6} S_{\text{flavor}_i}
$$

Flavor similarity is strongly weighted to emphasize taste matching.

---

### 3. Quality Score Contribution

The product's overall rating (score) is added as a minor adjustment factor.

---

### Final Scoring Formula

$$
\text{Final Score} = S_{\text{popularity}} + 7 \times \sum_{i=1}^{6} S_{\text{flavor}_i} + 0.5 \times \text{score}
$$

---

### Ranking Rules

1. Products are ranked in descending order of the final score  
2. Duplicate products (by name) are removed  
3. The top 5 highest-scoring products are returned  

---

### 3. Natural Language Recommendation  
**API:** `/recommend-by-text`

**Purpose**  
Allow users to describe desired products using natural language.

**Text Representation**

Each product is converted into a textual description:

$$
T_i = \text{Brand}_i + \text{Name}_i + \text{InternationalName}_i + \text{FlavorTags}_i + \text{Rating}_i + \text{Popularity}_i
$$

This transforms structured attributes into unstructured text suitable for semantic modeling.

---

## Semantic Model

- **Model:** Sentence-BERT  
- **Variant:** `paraphrase-multilingual-MiniLM-L12-v2`  

Embedding computation:

$$
v_i = \text{SBERT}(T_i)
$$

$$
v_q = \text{SBERT}(T_q)
$$

---

## Semantic Similarity

$$
\text{sim}(q, i) = \frac{v_q \cdot v_i}{||v_q|| \cdot ||v_i||}
$$

Products are ranked by similarity, and the top-K results are returned.

---

## System Architecture

1. **Data Collection Layer** – Python crawlers aggregate sake data  
2. **Backend API Layer (Spring Boot)** – REST APIs and data management  
3. **Machine Learning Service (FastAPI)** – Recommendation logic  
4. **Frontend Application (React)** – Interactive product discovery  

---

## Database Design

- Single normalized product table  
- 18 columns per product  
- Six float columns for flavor profiles  
- Indexed for read-heavy discovery operations  

---

## Technology Stack

- **Data Collection:** Python  
- **Backend API:** Java, Spring Boot, JPA  
- **ML Service:** FastAPI, scikit-learn, PyTorch, sentence-transformers  
- **Frontend:** React, Vite  
- **Database:** PostgreSQL  
- **Deployment:** Docker, Docker Compose  

---

## Project Scope and Contribution

This project demonstrates:

- Modeling subjective taste in a numerical vector space  
- Designing multiple recommendation strategies aligned with user intent  
- Solving the cold-start problem without user interaction data  
- Building a modular, production-ready recommendation system  

---

## Future Work

- Incorporate user interaction data for collaborative filtering  
- Personalized recommendation strategies  
- Advanced analytics and comparison tools
