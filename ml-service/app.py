# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import recommend_by_id
from semantic_search import search_products_by_text
from utils import convert_keys_to_camel
from fastapi.middleware.cors import CORSMiddleware
import traceback

app = FastAPI(
    title="Liquor Recommendation API",
    version="1.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend dev server
        "http://localhost:3000",  # Alternative port
        "*"  # Allow all origins (development only)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Pydantic model for request body
class TextQueryRequest(BaseModel):
    query: str
    top_k: int = 5

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/recommend/{id_entry}")
def recommend(id_entry: int):
    try:
        print(f"Received recommendation request for id: {id_entry}")
        result = recommend_by_id(id_entry)
        # Convert keys to camelCase before returning
        converted = convert_keys_to_camel(result)
        print(f"Successfully generated {len(converted)} recommendations")
        return converted
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Exception: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/recommend-by-text")
def recommend_by_text(request: TextQueryRequest):
    """
    Recommend products based on natural language query using semantic search
    
    Request Body:
        {
            "query": "I want a sweet red wine",
            "top_k": 5
        }
    
    Returns:
        {
            "query": "I want a sweet red wine",
            "results": [...]
        }
    """
    try:
        print(f"Received text query: {request.query}")
        
        # Load product data
        from model import load_data
        df = load_data()

        # Search for matching products
        result = search_products_by_text(request.query, df, request.top_k)

        # Convert results to camelCase
        converted = convert_keys_to_camel(result)

        print(f"Successfully generated {len(converted)} recommendations")
        return {
            "query": request.query,
            "results": converted
        }
    except Exception as e:
        print(f"Exception: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


