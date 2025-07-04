// Global variables
let textInputCount = 2;
const API_BASE_URL = 'http://localhost:5000/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up threshold slider
    const thresholdSlider = document.getElementById('thresholdSlider');
    const thresholdValue = document.getElementById('thresholdValue');
    
    thresholdSlider.addEventListener('input', function() {
        thresholdValue.textContent = this.value + '%';
    });
    
    // Load available models
    loadAvailableModels();
}

function loadAvailableModels() {
    fetch(`${API_BASE_URL}/models`)
        .then(response => response.json())
        .then(data => {
            const modelSelect = document.getElementById('modelSelect');
            modelSelect.innerHTML = '';
            
            data.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                
                switch(model) {
                    case 'all-MiniLM-L6-v2':
                        option.textContent = 'all-MiniLM-L6-v2 (Fast & Accurate)';
                        option.selected = true;
                        break;
                    case 'all-mpnet-base-v2':
                        option.textContent = 'all-mpnet-base-v2 (High Quality)';
                        break;
                    case 'paraphrase-multilingual-MiniLM-L12-v2':
                        option.textContent = 'Multilingual MiniLM (Multi-language)';
                        break;
                    case 'text-embedding-ada-002':
                        option.textContent = 'OpenAI Ada-002 (Premium)';
                        break;
                    default:
                        option.textContent = model;
                }
                
                modelSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading models:', error);
            showAlert('Error loading available models. Please check if the server is running.', 'danger');
        });
}

function addTextInput() {
    textInputCount++;
    const textInputsContainer = document.getElementById('textInputs');
    
    const newInputDiv = document.createElement('div');
    newInputDiv.className = 'mb-3';
    newInputDiv.innerHTML = `
        <label class="form-label fw-bold">Text ${textInputCount}:</label>
        <textarea class="form-control text-input" placeholder="Enter your text here..." oninput="updateCharCount(this)"></textarea>
        <div class="text-counter">0 characters</div>
    `;
    
    textInputsContainer.appendChild(newInputDiv);
}

function removeTextInput() {
    if (textInputCount > 2) {
        const textInputsContainer = document.getElementById('textInputs');
        textInputsContainer.removeChild(textInputsContainer.lastElementChild);
        textInputCount--;
    } else {
        showAlert('At least 2 texts are required for comparison.', 'warning');
    }
}

function clearAllTexts() {
    const textInputs = document.querySelectorAll('.text-input');
    textInputs.forEach(input => {
        input.value = '';
        updateCharCount(input);
    });
}

function updateCharCount(textarea) {
    const counter = textarea.parentElement.querySelector('.text-counter');
    const charCount = textarea.value.length;
    counter.textContent = `${charCount} characters`;
}

function getSelectedModels() {
    const modelSelect = document.getElementById('modelSelect');
    const selectedOptions = Array.from(modelSelect.selectedOptions);
    return selectedOptions.map(option => option.value);
}

function getTexts() {
    const textInputs = document.querySelectorAll('.text-input');
    const texts = Array.from(textInputs).map(input => input.value.trim()).filter(text => text.length > 0);
    return texts;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.insertBefore(alertDiv, resultsDiv.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

function analyzeTexts() {
    const texts = getTexts();
    const selectedModels = getSelectedModels();
    const threshold = document.getElementById('thresholdSlider').value / 100;
    
    if (texts.length < 2) {
        showAlert('Please enter at least 2 texts for comparison.', 'warning');
        return;
    }
    
    if (selectedModels.length === 0) {
        showAlert('Please select at least one embedding model.', 'warning');
        return;
    }
    
    showLoading(true);
    clearResults();
    
    const requestData = {
        texts: texts,
        models: selectedModels,
        clone_threshold: threshold
    };
    
    fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        displayResults(data, texts);
    })
    .catch(error => {
        showLoading(false);
        console.error('Error:', error);
        showAlert('Error analyzing texts. Please check your connection and try again.', 'danger');
    });
}

function clearResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
}

function displayResults(data, originalTexts) {
    const resultsDiv = document.getElementById('results');
    
    // Create results header
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'text-center mb-4';
    resultsHeader.innerHTML = `
        <h2 class="text-primary"><i class="fas fa-chart-bar"></i> Analysis Results</h2>
        <p class="text-muted">Comparing ${originalTexts.length} texts using ${Object.keys(data).length} embedding model(s)</p>
    `;
    resultsDiv.appendChild(resultsHeader);
    
    // Display results for each model
    Object.entries(data).forEach(([modelName, modelData]) => {
        if (modelData.error) {
            const errorCard = createErrorCard(modelName, modelData.error);
            resultsDiv.appendChild(errorCard);
        } else {
            const modelCard = createModelCard(modelName, modelData, originalTexts);
            resultsDiv.appendChild(modelCard);
        }
    });
}

function createErrorCard(modelName, error) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.innerHTML = `
        <h4 class="text-danger"><i class="fas fa-exclamation-triangle"></i> ${modelName}</h4>
        <div class="alert alert-danger">
            <strong>Error:</strong> ${error}
        </div>
    `;
    return card;
}

function createModelCard(modelName, modelData, originalTexts) {
    const card = document.createElement('div');
    card.className = 'model-card';
    
    const similarityMatrix = modelData.similarity_matrix;
    const clones = modelData.clones;
    
    let cardContent = `
        <h4 class="text-primary"><i class="fas fa-brain"></i> ${modelName}</h4>
        
        <!-- Similarity Matrix -->
        <div class="similarity-matrix">
            <h5><i class="fas fa-table"></i> Similarity Matrix</h5>
            <div class="table-responsive">
                <table class="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th></th>
                            ${originalTexts.map((_, i) => `<th class="text-center">Text ${i + 1}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${similarityMatrix.map((row, i) => `
                            <tr>
                                <td class="fw-bold">Text ${i + 1}</td>
                                ${row.map((value, j) => {
                                    const cellClass = getSimilarityClass(value);
                                    return `<td class="similarity-cell ${cellClass}">${value}%</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Clone Detection Results
    if (clones.length > 0) {
        cardContent += `
            <div class="mt-3">
                <h5 class="text-danger"><i class="fas fa-exclamation-circle"></i> Potential Clones Detected</h5>
                ${clones.map(clone => `
                    <div class="clone-alert">
                        <strong>Text ${clone.text1_index + 1} ↔ Text ${clone.text2_index + 1}</strong><br>
                        Similarity: ${clone.percentage}%
                        <button class="btn btn-sm btn-outline-light ms-2" onclick="showTextComparison(${clone.text1_index}, ${clone.text2_index})">
                            <i class="fas fa-eye"></i> Compare
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        cardContent += `
            <div class="mt-3">
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> No potential clones detected with the current threshold.
                </div>
            </div>
        `;
    }
    
    // Add heatmap visualization
    cardContent += `
        <div class="mt-3">
            <h5><i class="fas fa-chart-area"></i> Similarity Heatmap</h5>
            <div id="heatmap-${modelName.replace(/[^a-zA-Z0-9]/g, '')}"></div>
        </div>
    `;
    
    card.innerHTML = cardContent;
    
    // Create heatmap after card is added to DOM
    setTimeout(() => {
        createHeatmap(modelName, similarityMatrix, originalTexts);
    }, 100);
    
    return card;
}

function getSimilarityClass(value) {
    if (value >= 80) return 'similarity-high';
    if (value >= 60) return 'similarity-medium';
    return 'similarity-low';
}

function createHeatmap(modelName, similarityMatrix, originalTexts) {
    const containerId = `heatmap-${modelName.replace(/[^a-zA-Z0-9]/g, '')}`;
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const labels = originalTexts.map((_, i) => `Text ${i + 1}`);
    
    const data = [{
        z: similarityMatrix,
        x: labels,
        y: labels,
        type: 'heatmap',
        colorscale: [
            [0, '#f8d7da'],
            [0.6, '#fff3cd'],
            [0.8, '#d4edda'],
            [1, '#155724']
        ],
        colorbar: {
            title: 'Similarity %',
            titleside: 'right'
        }
    }];
    
    const layout = {
        title: `${modelName} Similarity Heatmap`,
        width: Math.min(600, window.innerWidth - 100),
        height: 400,
        margin: { t: 50, b: 50, l: 50, r: 50 }
    };
    
    Plotly.newPlot(container, data, layout);
}

function showTextComparison(text1Index, text2Index) {
    const textInputs = document.querySelectorAll('.text-input');
    const text1 = textInputs[text1Index].value;
    const text2 = textInputs[text2Index].value;
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Text Comparison</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Text ${text1Index + 1}:</h6>
                            <div class="border rounded p-3 bg-light" style="max-height: 300px; overflow-y: auto;">
                                ${text1.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6>Text ${text2Index + 1}:</h6>
                            <div class="border rounded p-3 bg-light" style="max-height: 300px; overflow-y: auto;">
                                ${text2.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
} 