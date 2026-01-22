import requests
import json

# Test API
base_url = "http://127.0.0.1:8000"

# Test 1: Health check
print("=" * 50)
print("Test 1: Health Check")
print("=" * 50)
try:
    response = requests.get(f"{base_url}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n")

# Test 2: Get recommendations
print("=" * 50)
print("Test 2: Get Recommendations for ID 1")
print("=" * 50)
try:
    response = requests.get(f"{base_url}/recommend/1")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Number of recommendations: {len(data)}")
        print("\nFirst recommendation:")
        print(json.dumps(data[0], indent=2, ensure_ascii=False))
    else:
        print(f"Error Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n")

# Test 3: Get recommendations for another ID
print("=" * 50)
print("Test 3: Get Recommendations for ID 100")
print("=" * 50)
try:
    response = requests.get(f"{base_url}/recommend/100")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Number of recommendations: {len(data)}")
    else:
        print(f"Error Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
