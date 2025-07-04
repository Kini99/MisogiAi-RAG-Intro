import React, { useState } from 'react';
import { PDFDocument, ChunkingResult } from './types';
import { chunkingStrategies, executeChunkingStrategy } from './utils/chunkingStrategies';
import { PDFProcessor } from './utils/pdfProcessor';
import PDFUploader from './components/PDFUploader';
import StrategySelector from './components/StrategySelector';
import StrategyExplanation from './components/StrategyExplanation';
import ChunkVisualizer from './components/ChunkVisualizer';
import StatisticsPanel from './components/StatisticsPanel';
import { FileText, BarChart3, Settings, Eye } from 'lucide-react';

function App() {
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState(chunkingStrategies[0]);
  const [chunkingResult, setChunkingResult] = useState<ChunkingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'strategy' | 'visualization' | 'statistics'>('upload');

  const handlePDFUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const document = await PDFProcessor.extractTextFromPDF(file);
      setPdfDocument(document);
      setActiveTab('strategy');
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStrategyChange = (strategy: typeof chunkingStrategies[0]) => {
    setSelectedStrategy(strategy);
    if (pdfDocument) {
      const chunks = executeChunkingStrategy(pdfDocument.text, strategy);
      const totalTokens = chunks.reduce((sum, chunk) => sum + (chunk.metadata.tokenCount || 0), 0);
      const averageTokensPerChunk = chunks.length > 0 ? Math.round(totalTokens / chunks.length) : 0;
      const overlapPercentage = strategy.parameters.overlap > 0 
        ? Math.round((strategy.parameters.overlap / strategy.parameters.chunkSize) * 100) 
        : 0;

      setChunkingResult({
        strategy,
        chunks,
        statistics: {
          totalChunks: chunks.length,
          averageChunkSize: Math.round(chunks.reduce((sum, chunk) => sum + chunk.size, 0) / chunks.length),
          totalTokens,
          averageTokensPerChunk,
          overlapPercentage
        }
      });
    }
  };

  const handleParameterChange = (parameter: string, value: number) => {
    const updatedStrategy = {
      ...selectedStrategy,
      parameters: {
        ...selectedStrategy.parameters,
        [parameter]: value
      }
    };
    setSelectedStrategy(updatedStrategy);
    handleStrategyChange(updatedStrategy);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PDF Chunking Visualizer</h1>
                <p className="text-sm text-gray-600">Explore RAG chunking strategies</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/your-repo/pdf-chunking-visualizer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Upload PDF</span>
            </button>
            {pdfDocument && (
              <>
                <button
                  onClick={() => setActiveTab('strategy')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'strategy'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Strategy</span>
                </button>
                <button
                  onClick={() => setActiveTab('visualization')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'visualization'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>Visualization</span>
                </button>
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'statistics'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Statistics</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {activeTab === 'upload' && (
            <PDFUploader 
              onPDFUpload={handlePDFUpload} 
              isProcessing={isProcessing}
              pdfDocument={pdfDocument}
            />
          )}

          {activeTab === 'strategy' && pdfDocument && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StrategySelector
                strategies={chunkingStrategies}
                selectedStrategy={selectedStrategy}
                onStrategyChange={handleStrategyChange}
                onParameterChange={handleParameterChange}
              />
              <StrategyExplanation strategy={selectedStrategy} />
            </div>
          )}

          {activeTab === 'visualization' && chunkingResult && (
            <ChunkVisualizer 
              chunks={chunkingResult.chunks}
              strategy={chunkingResult.strategy}
              originalText={pdfDocument?.text || ''}
            />
          )}

          {activeTab === 'statistics' && chunkingResult && pdfDocument && (
            <StatisticsPanel 
              chunkingResult={chunkingResult}
              pdfDocument={pdfDocument}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>Built for exploring RAG chunking strategies</p>
            <p className="text-sm mt-2">
              This tool helps you understand how different chunking approaches affect document processing for Retrieval-Augmented Generation systems.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 