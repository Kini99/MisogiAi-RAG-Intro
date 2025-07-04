import React, { useMemo } from 'react';
import { ChunkingResult, PDFDocument } from '../types';
import { BarChart3, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

interface StatisticsPanelProps {
  chunkingResult: ChunkingResult;
  pdfDocument: PDFDocument;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ chunkingResult, pdfDocument }) => {
  const { chunks, statistics, strategy } = chunkingResult;
  
  const textStats = useMemo(() => {
    const wordCount = pdfDocument.text.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = pdfDocument.text.length;
    const sentenceCount = pdfDocument.text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphCount = pdfDocument.text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
    
    return {
      wordCount,
      characterCount,
      sentenceCount,
      paragraphCount,
      averageWordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0,
      averageWordsPerParagraph: paragraphCount > 0 ? Math.round(wordCount / paragraphCount) : 0
    };
  }, [pdfDocument.text]);

  // Calculate chunk size distribution
  const chunkSizeDistribution = useMemo(() => {
    const sizeRanges = [
      { min: 0, max: 500, label: '0-500 chars' },
      { min: 501, max: 1000, label: '501-1000 chars' },
      { min: 1001, max: 1500, label: '1001-1500 chars' },
      { min: 1501, max: 2000, label: '1501-2000 chars' },
      { min: 2001, max: Infinity, label: '2000+ chars' }
    ];

    return sizeRanges.map(range => ({
      ...range,
      count: chunks.filter(chunk => chunk.size >= range.min && chunk.size <= range.max).length,
      percentage: Math.round((chunks.filter(chunk => chunk.size >= range.min && chunk.size <= range.max).length / chunks.length) * 100)
    }));
  }, [chunks]);

  // Calculate efficiency metrics
  const efficiencyMetrics = useMemo(() => {
    const totalOriginalSize = pdfDocument.text.length;
    const totalChunkedSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const compressionRatio = totalOriginalSize > 0 ? (totalChunkedSize / totalOriginalSize) : 0;
    const overlapEfficiency = strategy.parameters.overlap > 0 
      ? (strategy.parameters.overlap / strategy.parameters.chunkSize) * 100 
      : 0;

    return {
      compressionRatio,
      overlapEfficiency,
      averageChunkEfficiency: statistics.averageChunkSize / strategy.parameters.chunkSize,
      coveragePercentage: (totalChunkedSize / totalOriginalSize) * 100
    };
  }, [chunks, statistics, strategy, pdfDocument.text]);

  // Calculate performance indicators
  const performanceIndicators = useMemo(() => {
    const sizeVariability = chunks.length > 1 
      ? Math.sqrt(chunks.reduce((sum, chunk) => sum + Math.pow(chunk.size - statistics.averageChunkSize, 2), 0) / chunks.length)
      : 0;

    const sizeConsistency = statistics.averageChunkSize > 0 
      ? (1 - (sizeVariability / statistics.averageChunkSize)) * 100 
      : 100;

    return {
      sizeVariability,
      sizeConsistency,
      chunkDensity: statistics.totalTokens / pdfDocument.text.length,
      retrievalEfficiency: statistics.averageTokensPerChunk / 100 // Normalized score
    };
  }, [chunks, statistics, pdfDocument.text]);

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">Chunking Statistics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Chunks</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">{statistics.totalChunks}</p>
            <p className="text-xs text-blue-700 mt-1">
              {Math.round((statistics.totalChunks / textStats.paragraphCount) * 100)}% of paragraphs
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Avg Chunk Size</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">{statistics.averageChunkSize.toLocaleString()}</p>
            <p className="text-xs text-green-700 mt-1">characters</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Total Tokens</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-2">{statistics.totalTokens.toLocaleString()}</p>
            <p className="text-xs text-purple-700 mt-1">
              ~{Math.round(statistics.totalTokens / 4)} words
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Overlap</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-2">{statistics.overlapPercentage}%</p>
            <p className="text-xs text-orange-700 mt-1">
              {strategy.parameters.overlap.toLocaleString()} chars
            </p>
          </div>
        </div>
      </div>

      {/* Document vs Chunked Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Original Document</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Characters:</span>
                <span className="font-medium">{textStats.characterCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Words:</span>
                <span className="font-medium">{textStats.wordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sentences:</span>
                <span className="font-medium">{textStats.sentenceCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paragraphs:</span>
                <span className="font-medium">{textStats.paragraphCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg words/sentence:</span>
                <span className="font-medium">{textStats.averageWordsPerSentence}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Chunked Results</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total chunks:</span>
                <span className="font-medium">{statistics.totalChunks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg tokens/chunk:</span>
                <span className="font-medium">{statistics.averageTokensPerChunk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coverage:</span>
                <span className="font-medium">{efficiencyMetrics.coveragePercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size consistency:</span>
                <span className="font-medium">{performanceIndicators.sizeConsistency.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chunk density:</span>
                <span className="font-medium">{performanceIndicators.chunkDensity.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chunk Size Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chunk Size Distribution</h3>
        <div className="space-y-3">
          {chunkSizeDistribution.map((range, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-24 text-sm text-gray-600">{range.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${range.percentage}%` }}
                ></div>
              </div>
              <div className="w-16 text-sm text-gray-900 text-right">
                {range.count} ({range.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Storage Efficiency</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Compression Ratio</span>
                  <span className="font-medium">{(efficiencyMetrics.compressionRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(efficiencyMetrics.compressionRatio * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-medium">{efficiencyMetrics.coveragePercentage.toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${efficiencyMetrics.coveragePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Performance Indicators</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Size Consistency</span>
                  <span className="font-medium">{performanceIndicators.sizeConsistency.toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${performanceIndicators.sizeConsistency}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Retrieval Efficiency</span>
                  <span className="font-medium">{(performanceIndicators.retrievalEfficiency * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${Math.min(performanceIndicators.retrievalEfficiency * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {getRecommendations(statistics, efficiencyMetrics, performanceIndicators, strategy).map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                💡
              </div>
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function getRecommendations(
  statistics: any, 
  efficiencyMetrics: any, 
  performanceIndicators: any, 
  strategy: any
): string[] {
  const recommendations: string[] = [];

  // Chunk size recommendations
  if (statistics.averageChunkSize < 500) {
    recommendations.push("Consider increasing chunk size for better context preservation. Small chunks may lose important context.");
  } else if (statistics.averageChunkSize > 2000) {
    recommendations.push("Large chunks may be difficult for models to process efficiently. Consider reducing chunk size.");
  }

  // Overlap recommendations
  if (statistics.overlapPercentage === 0) {
    recommendations.push("Adding overlap between chunks can improve retrieval performance by maintaining context continuity.");
  } else if (statistics.overlapPercentage > 30) {
    recommendations.push("High overlap increases storage costs. Consider reducing overlap if retrieval performance is adequate.");
  }

  // Consistency recommendations
  if (performanceIndicators.sizeConsistency < 70) {
    recommendations.push("Low size consistency may indicate the strategy isn't well-suited for your document structure.");
  }

  // Coverage recommendations
  if (efficiencyMetrics.coveragePercentage < 95) {
    recommendations.push("Low coverage suggests some text may be lost. Check if the strategy handles your document format properly.");
  }

  // Strategy-specific recommendations
  if (strategy.id === 'character' && statistics.averageChunkSize < 1000) {
    recommendations.push("Character-based chunking with small chunks may break sentences. Consider sentence-based chunking instead.");
  }

  if (strategy.id === 'semantic' && statistics.totalChunks < 5) {
    recommendations.push("Very few semantic chunks may indicate the document lacks clear structural boundaries.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Your current configuration appears well-balanced for most use cases.");
  }

  return recommendations;
}

export default StatisticsPanel; 