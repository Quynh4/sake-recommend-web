# semantic_search.py
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
import pickle
import os

# Global variables
model = None
product_embeddings = None
df_products = None

def load_semantic_model():
    """Load sentence transformer model"""
    global model
    if model is None:
        print("Loading sentence-transformers model...")
        model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("Model loaded successfully!")
    return model

def create_product_description(row):
    """Create product description from data fields"""
    parts = []
    
    # Add brand name
    if pd.notnull(row.get('brand_name')) and row.get('brand_name'):
        parts.append(f"Brand: {row['brand_name']}")
    
    # Add product name
    if pd.notnull(row.get('name')) and row.get('name'):
        parts.append(f"Name: {row['name']}")
    
    # Add international name
    if pd.notnull(row.get('intl_name')) and row.get('intl_name'):
        parts.append(f"{row['intl_name']}")
    
    # Add flavour tags
    if pd.notnull(row.get('flavour_tags')) and row.get('flavour_tags'):
        tags = row['flavour_tags'].replace('|', ', ')
        parts.append(f"Flavors: {tags}")
    
    # Add score information
    if pd.notnull(row.get('score')) and row.get('score') > 0:
        parts.append(f"Rating: {row['score']:.1f}")
    
    # Add popularity information
    if pd.notnull(row.get('checkin_count')) and row.get('checkin_count') > 0:
        parts.append(f"Check-ins: {row['checkin_count']}")
    
    return ". ".join(parts)

def build_embeddings(df):
    """Create embeddings for all products"""
    global product_embeddings, df_products, model
    
    # Load model
    model = load_semantic_model()
    
    # Create description for each product
    print("Creating product descriptions...")
    descriptions = []
    for idx, row in df.iterrows():
        desc = create_product_description(row)
        descriptions.append(desc)
    
    # Create embeddings
    print(f"Creating embeddings for {len(descriptions)} products...")
    product_embeddings = model.encode(descriptions, convert_to_tensor=True, show_progress_bar=True)
    df_products = df.copy()
    
    # Save embeddings for reuse
    cache_path = "data/embeddings_cache.pkl"
    os.makedirs("data", exist_ok=True)
    with open(cache_path, 'wb') as f:
        pickle.dump({
            'embeddings': product_embeddings,
            'descriptions': descriptions,
            'df_shape': df.shape
        }, f)
    print(f"Embeddings saved to {cache_path}")
    
    return product_embeddings

def load_or_build_embeddings(df):
    """Load embeddings from cache or build new ones if not available"""
    global product_embeddings, df_products
    
    cache_path = "data/embeddings_cache.pkl"
    
    # Check if cache exists
    if os.path.exists(cache_path):
        try:
            print("Loading embeddings from cache...")
            with open(cache_path, 'rb') as f:
                cache_data = pickle.load(f)
            
            # Check if data has changed
            if cache_data['df_shape'] == df.shape:
                product_embeddings = cache_data['embeddings']
                df_products = df.copy()
                print("Embeddings loaded from cache successfully!")
                return product_embeddings
            else:
                print("Data shape changed, rebuilding embeddings...")
        except Exception as e:
            print(f"Error loading cache: {e}")
    
    # If no cache or cache is invalid, build new embeddings
    return build_embeddings(df)

def search_products_by_text(query, df, top_k=5):
    """
    Search for products based on customer's query/description
    
    Args:
        query: Customer's question or description (e.g., "I want a sweet red wine")
        df: DataFrame containing product data
        top_k: Number of products to recommend (default: 5)
    
    Returns:
        List of recommended products with detailed information
    """
    global product_embeddings, df_products, model
    
    # Load model if not already loaded
    if model is None:
        model = load_semantic_model()
    
    # Load or create embeddings
    if product_embeddings is None or df_products is None:
        load_or_build_embeddings(df)
    
    # Create embedding for query
    print(f"Processing query: {query}")
    query_embedding = model.encode(query, convert_to_tensor=True)
    
    # Calculate cosine similarity
    cos_scores = util.cos_sim(query_embedding, product_embeddings)[0]
    
    # Get top_k results
    top_results = np.argsort(-cos_scores.cpu().numpy())[:top_k]
    
    # Create results list
    results = []
    for rank, idx in enumerate(top_results):
        row = df_products.iloc[idx]
        similarity_score = float(cos_scores[idx])
        
        # Helper functions to safely process data
        def safe_get(key, default=None):
            try:
                val = row.get(key, default)
                if pd.notnull(val):
                    if isinstance(val, (np.integer, np.int64)):
                        return int(val)
                    elif isinstance(val, (np.floating, np.float64)):
                        return float(val)
                    elif isinstance(val, str):
                        return str(val)
                    else:
                        return val
                return default
            except:
                return default
        
        def safe_split(key):
            try:
                val = safe_get(key, '')
                if val and isinstance(val, str):
                    return [x.strip() for x in val.split('|') if x.strip()]
                return []
            except:
                return []
        
        result = {
            'rank': int(rank + 1),
            'similarity_score': round(similarity_score, 4),
            'id': int(safe_get('id', 0)) if safe_get('id') is not None else None,
            'brand': safe_get('brand_name'),
            'brand_intl_name': safe_get('brand_intl_name'),
            'name': safe_get('name'),
            'intl_name': safe_get('intl_name'),
            'score': float(round(float(safe_get('score', 0)), 2)) if safe_get('score') is not None else None,
            'checkin_count': int(safe_get('checkin_count', 0)) if safe_get('checkin_count') is not None else None,
            'flavors': {
                'f1': float(round(float(safe_get('f1', 0)), 3)) if safe_get('f1') is not None else None,
                'f2': float(round(float(safe_get('f2', 0)), 3)) if safe_get('f2') is not None else None,
                'f3': float(round(float(safe_get('f3', 0)), 3)) if safe_get('f3') is not None else None,
                'f4': float(round(float(safe_get('f4', 0)), 3)) if safe_get('f4') is not None else None,
                'f5': float(round(float(safe_get('f5', 0)), 3)) if safe_get('f5') is not None else None,
                'f6': float(round(float(safe_get('f6', 0)), 3)) if safe_get('f6') is not None else None
            },
            'flavour_tags': safe_split('flavour_tags'),
            'pictures': safe_split('pictures'),
            'similar_brands': safe_split('similar_brands'),
            'year_month': safe_get('year_month'),
        }
        results.append(result)
        
        print(f"{rank+1}. {result['name']} (similarity: {similarity_score:.4f})")
    
    return results
