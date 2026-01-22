import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Test 1: Health check
print("=" * 50)
print("Test 1: Health Check")
print("=" * 50)
try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n")

# Test 2: Semantic search
print("=" * 50)
print("Test 2: Semantic Search")
print("=" * 50)
try:
    response = requests.post(
        f"{BASE_URL}/recommend-by-text",
        json={
            "query": "Tôi muốn rượu vang đỏ ngọt ngào",
            "top_k": 3
        },
        timeout=60
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\nQuery: {data['query']}")
        print(f"Found {len(data['results'])} results:\n")
        for result in data['results']:
            print(f"{result['rank']}. {result['name']}")
            print(f"   Brand: {result['brand']}")
            print(f"   Similarity: {result['similarity_score']:.4f}")
            print()
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
