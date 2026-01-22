# test_semantic_search.py
"""
Test script for semantic search functionality
"""
import requests
import json

# API endpoint
BASE_URL = "http://127.0.0.1:8000"

def test_semantic_search():
    """Test the semantic search endpoint"""
    
    # Test queries
    test_queries = [
        "Tôi muốn rượu vang đỏ ngọt ngào",
        "Rượu whisky mạnh mẽ, có vị khói",
        "Rượu sake nhẹ nhàng, dễ uống",
        "Rượu vodka tinh khiết",
        "I want a sweet red wine",
        "Strong whisky with smoky flavor"
    ]
    
    print("=" * 80)
    print("TESTING SEMANTIC SEARCH API")
    print("=" * 80)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{'='*80}")
        print(f"Test {i}: {query}")
        print(f"{'='*80}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/recommend-by-text",
                json={
                    "query": query,
                    "top_k": 3
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n✅ Success! Found {len(data['results'])} recommendations\n")
                
                for result in data['results']:
                    print(f"  {result['rank']}. {result['name']}")
                    print(f"     Brand: {result['brand']}")
                    print(f"     Similarity: {result['similarity_score']:.4f}")
                    print(f"     Score: {result['score']}")
                    if result['flavour_tags']:
                        print(f"     Tags: {', '.join(result['flavour_tags'][:3])}")
                    print()
            else:
                print(f"\n❌ Error: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"\n❌ Exception: {str(e)}")
    
    print("\n" + "=" * 80)
    print("TESTING COMPLETED")
    print("=" * 80)

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to server: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🔍 Testing ML Service API\n")
    
    # First check if server is running
    if test_health():
        print("\n" + "="*80)
        input("Press Enter to start semantic search tests...")
        test_semantic_search()
    else:
        print("\n⚠️  Please start the server first:")
        print("   cd ml-service")
        print("   uvicorn app:app --reload")
