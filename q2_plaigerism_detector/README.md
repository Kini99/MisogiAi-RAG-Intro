# Semantic Similarity Analyzer & Clone Detection

A comprehensive web application for analyzing semantic similarity between texts and detecting potential clones using advanced embedding models.

## Features

- **Dynamic Text Input**: Add/remove multiple text input boxes for comparison
- **Multiple Embedding Models**: Compare results across different embedding models
- **Real-time Similarity Matrix**: Visual similarity percentages between all text pairs
- **Clone Detection**: Automatic detection of potential clones based on configurable thresholds
- **Interactive Heatmaps**: Visual representation of similarity relationships
- **Model Comparison**: Side-by-side comparison of different embedding models
- **Modern UI**: Responsive, beautiful interface with Bootstrap 5

## Supported Embedding Models

### Sentence Transformers (Local)
- **all-MiniLM-L6-v2**: Fast and accurate, good balance of speed and quality
- **all-mpnet-base-v2**: High-quality embeddings, slower but more accurate
- **paraphrase-multilingual-MiniLM-L12-v2**: Multilingual support

### OpenAI (Requires API Key)
- **text-embedding-ada-002**: Premium embeddings with excellent quality

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Optional: Set up OpenAI API key** (for premium embeddings):
   Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Access the application**:
   Open your browser and go to `http://localhost:5000`

## Usage

### Basic Workflow

1. **Select Models**: Choose one or more embedding models to use for analysis
2. **Set Threshold**: Adjust the clone detection threshold (default: 80%)
3. **Input Texts**: Enter the texts you want to compare
   - Use "Add Text" to add more text inputs
   - Use "Remove Text" to remove inputs (minimum 2 required)
   - Use "Clear All" to reset all inputs
4. **Analyze**: Click "Analyze Similarity" to process the texts
5. **Review Results**: 
   - View similarity matrix with percentages
   - Check for detected clones
   - Explore interactive heatmaps
   - Compare results across different models

### Understanding Results

#### Similarity Matrix
- Shows pairwise similarity percentages between all texts
- Color coding: Green (high similarity), Yellow (medium), Red (low)
- Diagonal values are always 100% (text compared to itself)

#### Clone Detection
- Texts with similarity ≥ threshold are flagged as potential clones
- Click "Compare" buttons to view side-by-side text comparison
- Results are sorted by similarity percentage

#### Heatmaps
- Visual representation of the similarity matrix
- Darker colors indicate higher similarity
- Interactive tooltips show exact percentages

## Technical Implementation

### How Embeddings Detect Plagiarism

#### 1. Text Preprocessing
```python
def preprocess_text(text):
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    # Remove special characters but keep punctuation
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)]', '', text)
    return text
```

#### 2. Embedding Generation
The application converts text into high-dimensional vectors (embeddings) that capture semantic meaning:

- **Sentence Transformers**: Uses transformer-based models to generate contextual embeddings
- **OpenAI Embeddings**: Leverages OpenAI's advanced language models for high-quality embeddings

#### 3. Similarity Calculation
```python
def calculate_similarity_matrix(embeddings):
    # Calculate cosine similarity between all embedding pairs
    similarity_matrix = cosine_similarity(embeddings)
    return similarity_matrix
```

#### 4. Clone Detection Algorithm
```python
def detect_clones(similarity_matrix, threshold=0.8):
    clones = []
    for i in range(n):
        for j in range(i + 1, n):
            similarity = similarity_matrix[i][j]
            if similarity >= threshold:
                clones.append({
                    'text1_index': i,
                    'text2_index': j,
                    'similarity': similarity,
                    'percentage': round(similarity * 100, 2)
                })
    return sorted(clones, key=lambda x: x['similarity'], reverse=True)
```

### Why Embeddings Work for Plagiarism Detection

#### Semantic Understanding
- Traditional plagiarism detection relies on exact text matching
- Embeddings capture **semantic meaning**, not just word overlap
- Can detect paraphrased content, translated text, and conceptual similarities

#### Robustness to Variations
- Handles synonyms, different word orders, and sentence structures
- Detects content that conveys the same meaning with different words
- Works across different writing styles and formats

#### Mathematical Foundation
- Embeddings represent text as vectors in high-dimensional space
- Similar meanings cluster together in this space
- Cosine similarity measures the angle between vectors (1 = identical, 0 = completely different)

### Model Comparison

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| all-MiniLM-L6-v2 | Fast | Good | General purpose, quick analysis |
| all-mpnet-base-v2 | Medium | Excellent | High-accuracy requirements |
| Multilingual MiniLM | Fast | Good | Multi-language content |
| OpenAI Ada-002 | Slow | Premium | Best quality, requires API key |

## API Endpoints

### POST /api/analyze
Analyze text similarity using specified models.

**Request Body:**
```json
{
  "texts": ["text1", "text2", "text3"],
  "models": ["all-MiniLM-L6-v2", "all-mpnet-base-v2"],
  "clone_threshold": 0.8
}
```

**Response:**
```json
{
  "all-MiniLM-L6-v2": {
    "similarity_matrix": [[100.0, 85.2, 23.1], ...],
    "clones": [{"text1_index": 0, "text2_index": 1, "similarity": 0.852, "percentage": 85.2}],
    "texts": ["processed_text1", "processed_text2", "processed_text3"]
  }
}
```

### GET /api/models
Get available embedding models.

**Response:**
```json
{
  "models": ["all-MiniLM-L6-v2", "all-mpnet-base-v2", ...],
  "openai_configured": true
}
```

### GET /api/health
Health check endpoint.

## Project Structure

```
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This documentation
├── .env                  # Environment variables (create this)
├── templates/
│   └── index.html        # Main web interface
└── static/
    └── js/
        └── app.js        # Frontend JavaScript
```

## Troubleshooting

### Common Issues

1. **Models not loading**: Ensure you have a stable internet connection for downloading models
2. **OpenAI errors**: Check your API key in the `.env` file
3. **Memory issues**: Large texts or many models may require more RAM
4. **Slow performance**: Try using faster models like `all-MiniLM-L6-v2`

### Performance Tips

- Use fewer models for faster analysis
- Limit text length for better performance
- Consider using local models instead of OpenAI for privacy
- Adjust clone threshold based on your needs (higher = fewer false positives)

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

This project is open source and available under the MIT License. 