#!/usr/bin/env python3
"""
Demonstration script with interesting example texts for semantic similarity analysis.
These examples showcase different types of text similarity and plagiarism detection.
"""

import requests
import json
import time

# API base URL
API_BASE_URL = "http://localhost:5000/api"

def demo_paraphrasing():
    """Demonstrate detection of paraphrased content."""
    print("=== Demo 1: Paraphrasing Detection ===\n")
    
    texts = [
        "The implementation of machine learning algorithms requires careful consideration of data preprocessing steps.",
        "When applying ML algorithms, one must pay attention to how the data is prepared beforehand.",
        "Machine learning implementation needs data preprocessing consideration.",
        "The weather is beautiful today with clear skies and warm sunshine."
    ]
    
    print("Texts to compare:")
    for i, text in enumerate(texts, 1):
        print(f"{i}. {text}")
    
    return texts

def demo_translation():
    """Demonstrate detection of translated content."""
    print("\n=== Demo 2: Translation Detection ===\n")
    
    texts = [
        "Artificial intelligence is transforming the way we work and live.",
        "La inteligencia artificial está transformando la forma en que trabajamos y vivimos.",
        "L'intelligence artificielle transforme la façon dont nous travaillons et vivons.",
        "The field of computer science continues to evolve rapidly."
    ]
    
    print("Texts to compare (including translations):")
    for i, text in enumerate(texts, 1):
        print(f"{i}. {text}")
    
    return texts

def demo_academic_plagiarism():
    """Demonstrate academic plagiarism detection."""
    print("\n=== Demo 3: Academic Plagiarism Detection ===\n")
    
    texts = [
        "The greenhouse effect is a natural process that warms the Earth's surface. When the Sun's energy reaches the Earth's atmosphere, some of it is reflected back to space and the rest is absorbed and re-radiated by greenhouse gases.",
        "Greenhouse effect naturally heats Earth's surface. Solar energy reaching Earth's atmosphere gets partially reflected to space while the remainder gets absorbed and re-emitted by greenhouse gases.",
        "The greenhouse effect is a natural process that warms the Earth's surface. When the Sun's energy reaches the Earth's atmosphere, some of it is reflected back to space and the rest is absorbed and re-radiated by greenhouse gases.",
        "Machine learning algorithms can be categorized into supervised, unsupervised, and reinforcement learning approaches."
    ]
    
    print("Texts to compare (including exact copy and paraphrase):")
    for i, text in enumerate(texts, 1):
        print(f"{i}. {text}")
    
    return texts

def demo_creative_writing():
    """Demonstrate similarity in creative writing."""
    print("\n=== Demo 4: Creative Writing Similarity ===\n")
    
    texts = [
        "The old mansion stood silently against the darkening sky, its windows like empty eyes watching the world below.",
        "Against the darkening sky, the ancient house stood quiet, with windows that resembled vacant eyes observing the world beneath.",
        "The mansion was old and stood against the dark sky. Its windows looked like empty eyes watching below.",
        "The sunset painted the sky in brilliant oranges and purples, creating a breathtaking display of natural beauty."
    ]
    
    print("Texts to compare (creative descriptions):")
    for i, text in enumerate(texts, 1):
        print(f"{i}. {text}")
    
    return texts

def analyze_texts(texts, demo_name):
    """Analyze the given texts and display results."""
    print(f"\n--- Analyzing {demo_name} ---")
    
    # Get available models
    try:
        response = requests.get(f"{API_BASE_URL}/models")
        models = response.json()['models']
        selected_model = models[0]  # Use first available model
    except:
        print("Error: Could not get available models. Is the server running?")
        return
    
    request_data = {
        "texts": texts,
        "models": [selected_model],
        "clone_threshold": 0.8
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/analyze",
            headers={"Content-Type": "application/json"},
            data=json.dumps(request_data)
        )
        
        if response.status_code == 200:
            data = response.json()
            
            for model_name, model_data in data.items():
                if 'error' in model_data:
                    print(f"Error in {model_name}: {model_data['error']}")
                else:
                    print(f"\nResults using {model_name}:")
                    
                    # Show similarity matrix
                    print("Similarity Matrix:")
                    for i, row in enumerate(model_data['similarity_matrix']):
                        print(f"  Text {i+1}: {[f'{val:.1f}%' for val in row]}")
                    
                    # Show detected clones
                    print(f"\nDetected Clones (≥80% similarity):")
                    if model_data['clones']:
                        for clone in model_data['clones']:
                            print(f"  Text {clone['text1_index']+1} ↔ Text {clone['text2_index']+1}: {clone['percentage']}%")
                    else:
                        print("  No clones detected.")
                    
                    print("-" * 50)
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error analyzing texts: {e}")

def main():
    """Run all demonstration examples."""
    print("=== Semantic Similarity Analyzer - Demonstration Examples ===\n")
    print("This script demonstrates different types of text similarity detection.")
    print("Make sure the Flask application is running on http://localhost:5000\n")
    
    # Demo 1: Paraphrasing
    texts1 = demo_paraphrasing()
    analyze_texts(texts1, "Paraphrasing Detection")
    time.sleep(2)
    
    # Demo 2: Translation
    texts2 = demo_translation()
    analyze_texts(texts2, "Translation Detection")
    time.sleep(2)
    
    # Demo 3: Academic Plagiarism
    texts3 = demo_academic_plagiarism()
    analyze_texts(texts3, "Academic Plagiarism Detection")
    time.sleep(2)
    
    # Demo 4: Creative Writing
    texts4 = demo_creative_writing()
    analyze_texts(texts4, "Creative Writing Similarity")
    
    print("\n=== Demonstration Complete ===")
    print("These examples show how the application can detect:")
    print("• Paraphrased content with different wording")
    print("• Translated content across languages")
    print("• Exact copies and near-duplicates")
    print("• Similar creative descriptions")
    print("\nTry these examples in the web interface for interactive visualization!")

if __name__ == "__main__":
    main() 