# db_loader.py
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def load_data_from_db():
    """Load product data from PostgreSQL database"""
    try:
        # Database connection parameters from environment
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 5433)),
            database=os.getenv('DB_NAME', 'testdb'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '123456')
        )
        
        # SQL query to get all products
        query = """
            SELECT 
                id,
                name,
                intl_name,
                brand_name,
                brand_intl_name,
                year_month,
                rank,
                score,
                f1, f2, f3, f4, f5, f6,
                flavour_tags,
                checkin_count,
                pictures,
                similar_brands
            FROM products
            ORDER BY id
        """
        
        # Load data into pandas DataFrame
        df = pd.read_sql_query(query, conn)
        
        conn.close()
        
        print(f"Loaded {len(df)} products from database")
        return df
        
    except Exception as e:
        print(f"Error loading from database: {e}")
        print("Falling back to CSV file...")
        # Fallback to CSV if database connection fails
        df = pd.read_csv("data/liquors.csv")
        return df

def get_product_by_id(product_id):
    """Get a single product by ID from database"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="winedb",
            user="postgres",
            password="123456"
        )
        
        query = """
            SELECT * FROM products WHERE id = %s
        """
        
        df = pd.read_sql_query(query, conn, params=(product_id,))
        conn.close()
        
        if len(df) == 0:
            raise ValueError(f"Product with ID {product_id} not found")
            
        return df.iloc[0]
        
    except Exception as e:
        print(f"Error getting product: {e}")
        raise
