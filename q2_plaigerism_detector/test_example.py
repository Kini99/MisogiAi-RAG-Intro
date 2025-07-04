#!/usr/bin/env python3
"""
Test script with example texts to demonstrate semantic similarity analysis.
Run this script to test the API endpoints with sample data.
"""

import requests
import json

# API base URL
API_BASE_URL = "http://localhost:5000/api"

def test_health_check():
    """Test the health check endpoint."""
    print("Testing health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_models():
    """Test getting available models."""
    print("\nTesting get models...")
    try:
        response = requests.get(f"{API_BASE_URL}/models")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Available models: {data['models']}")
        print(f"OpenAI configured: {data['openai_configured']}")
        return data['models']
    except Exception as e:
        print(f"Error: {e}")
        return []

def test_analyze_texts():
    """Test text analysis with example texts."""
    print("\nTesting text analysis...")
    
    # Example texts with different similarity levels
    example_texts = [
        "The quick brown fox jumps over the lazy dog.",
        "A fast brown fox leaps over a sleepy dog.",
        "Machine learning is a subset of artificial intelligence.",
        "Artificial intelligence encompasses various technologies including machine learning.",
        "The weather is beautiful today with clear skies.",
        "Python is a popular programming language for data science."
    ]
    
    # Use the first available model
    models = test_get_models()
    if not models:
        print("No models available, skipping analysis test.")
        return
    
    selected_model = models[0]  # Use the first available model
    
    request_data = {
        "texts": example_texts,
        "models": [selected_model],
        "clone_threshold": 0.8
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/analyze",
            headers={"Content-Type": "application/json"},
            data=json.dumps(request_data)
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Analysis completed for model: {selected_model}")
            
            # Display results
            for model_name, model_data in data.items():
                if 'error' in model_data:
                    print(f"Error in {model_name}: {model_data['error']}")
                else:
                    print(f"\nResults for {model_name}:")
                    print(f"Similarity Matrix:")
                    for i, row in enumerate(model_data['similarity_matrix']):
                        print(f"  Text {i+1}: {row}")
                    
                    print(f"\nDetected Clones:")
                    for clone in model_data['clones']:
                        print(f"  Text {clone['text1_index']+1} ↔ Text {clone['text2_index']+1}: {clone['percentage']}%")
                    
                    if not model_data['clones']:
                        print("  No clones detected.")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

def main():
    """Run all tests."""
    print("=== Semantic Similarity Analyzer Test Suite ===\n")
    
    # Test health check
    if not test_health_check():
        print("Server is not running. Please start the Flask application first.")
        return
    
    # Test get models
    models = test_get_models()
    if not models:
        print("No models available.")
        return
    
    # Test text analysis
    test_analyze_texts()
    
    print("\n=== Test Suite Complete ===")
    print("If all tests passed, your application is working correctly!")
    print("You can now access the web interface at: http://localhost:5000")

if __name__ == "__main__":
    main() 