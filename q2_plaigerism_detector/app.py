from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import openai
import os
from dotenv import load_dotenv
import json
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize embedding models
models = {
    'sentence-transformers': {
        'all-MiniLM-L6-v2': SentenceTransformer('all-MiniLM-L6-v2'),
        'all-mpnet-base-v2': SentenceTransformer('all-mpnet-base-v2'),
        'paraphrase-multilingual-MiniLM-L12-v2': SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    }
}

# Initialize OpenAI client if API key is available
openai_client = None
if os.getenv('OPENAI_API_KEY'):
    openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def preprocess_text(text):
    """Clean and preprocess text for better embedding generation."""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)]', '', text)
    return text

def get_embeddings_sentence_transformers(texts, model_name):
    """Generate embeddings using sentence-transformers."""
    model = models['sentence-transformers'][model_name]
    embeddings = model.encode(texts, convert_to_tensor=False)
    return embeddings

def get_embeddings_openai(texts):
    """Generate embeddings using OpenAI API."""
    if not openai_client:
        raise Exception("OpenAI API key not configured")
    
    embeddings = []
    for text in texts:
        response = openai_client.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )
        embeddings.append(response.data[0].embedding)
    
    return np.array(embeddings)

def calculate_similarity_matrix(embeddings):
    """Calculate pairwise cosine similarity between all embeddings."""
    similarity_matrix = cosine_similarity(embeddings)
    return similarity_matrix

def detect_clones(similarity_matrix, threshold=0.8):
    """Detect potential clones based on similarity threshold."""
    clones = []
    n = len(similarity_matrix)
    
    for i in range(n):
        for j in range(i + 1, n):
            similarity = float(similarity_matrix[i][j])  # Convert numpy float to Python float
            if similarity >= threshold:
                clones.append({
                    'text1_index': i,
                    'text2_index': j,
                    'similarity': similarity,
                    'percentage': round(similarity * 100, 2)
                })
    
    return sorted(clones, key=lambda x: x['similarity'], reverse=True)

@app.route('/api/analyze', methods=['POST'])
def analyze_texts():
    """Main endpoint for text similarity analysis."""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        selected_models = data.get('models', ['all-MiniLM-L6-v2'])
        clone_threshold = data.get('clone_threshold', 0.8)
        
        if not texts or len(texts) < 2:
            return jsonify({'error': 'At least 2 texts are required'}), 400
        
        # Preprocess texts
        processed_texts = [preprocess_text(text) for text in texts]
        
        results = {}
        
        for model_name in selected_models:
            try:
                if model_name == 'text-embedding-ada-002':
                    embeddings = get_embeddings_openai(processed_texts)
                else:
                    embeddings = get_embeddings_sentence_transformers(processed_texts, model_name)
                
                # Calculate similarity matrix
                similarity_matrix = calculate_similarity_matrix(embeddings)
                
                # Convert to percentage format for display
                similarity_percentages = (similarity_matrix * 100).round(2).astype(float).tolist()
                
                # Detect clones
                clones = detect_clones(similarity_matrix, clone_threshold)
                
                results[model_name] = {
                    'similarity_matrix': similarity_percentages,
                    'clones': clones,
                    'texts': processed_texts
                }
                
            except Exception as e:
                results[model_name] = {
                    'error': str(e),
                    'texts': processed_texts
                }
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models', methods=['GET'])
def get_available_models():
    """Get list of available embedding models."""
    available_models = list(models['sentence-transformers'].keys())
    
    if openai_client:
        available_models.append('text-embedding-ada-002')
    
    return jsonify({
        'models': available_models,
        'openai_configured': openai_client is not None
    })

@app.route('/')
def index():
    """Serve the main application page."""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'message': 'Semantic Similarity API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 