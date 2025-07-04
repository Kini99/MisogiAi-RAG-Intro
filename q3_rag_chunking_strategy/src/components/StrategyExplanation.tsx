import React from 'react';
import { ChunkingStrategy } from '../types';
import { Info, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface StrategyExplanationProps {
  strategy: ChunkingStrategy;
}

const StrategyExplanation: React.FC<StrategyExplanationProps> = ({ strategy }) => {
  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Strategy Overview</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{strategy.name}</h4>
            <p className="text-gray-600 leading-relaxed">{strategy.explanation}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">How it works:</h5>
            <p className="text-sm text-blue-800 leading-relaxed">
              {getStrategyHowItWorks(strategy.id)}
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">Best Use Cases</h3>
        </div>
        
        <div className="space-y-3">
          {strategy.useCases.map((useCase, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-gray-700">{useCase}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trade-offs */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Trade-offs & Considerations</h3>
        </div>
        
        <div className="space-y-3">
          {strategy.tradeoffs.map((tradeoff, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-yellow-100 text-yellow-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                ⚠
              </div>
              <p className="text-gray-700">{tradeoff}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Tips */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Tips</h3>
        </div>
        
        <div className="space-y-3">
          {getPerformanceTips(strategy.id).map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-orange-100 text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                💡
              </div>
              <p className="text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aspect
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {strategy.name}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Other Strategies
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Semantic Coherence</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getSemanticCoherenceScore(strategy.id)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Varies by approach</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Processing Speed</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getProcessingSpeedScore(strategy.id)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Varies by approach</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Memory Usage</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getMemoryUsageScore(strategy.id)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Varies by approach</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Implementation Complexity</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getComplexityScore(strategy.id)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Varies by approach</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper functions to provide strategy-specific information
function getStrategyHowItWorks(strategyId: string): string {
  const explanations: Record<string, string> = {
    'character': 'Splits text into fixed-size chunks based on character count. Each chunk contains exactly the specified number of characters, regardless of word or sentence boundaries.',
    'sentence': 'Respects sentence boundaries by splitting text at sentence endings (.!?) while ensuring chunks don\'t exceed the maximum size. Maintains better semantic coherence than character-based chunking.',
    'paragraph': 'Groups text by paragraphs, maintaining the natural flow and context of the document. Particularly effective for documents with clear paragraph structure.',
    'semantic': 'Identifies semantic boundaries in the text (headers, chapters, sections) and splits accordingly. Preserves the logical structure and topic-level context of the document.',
    'sliding-window': 'Creates overlapping chunks by sliding a window over the text. The overlap helps maintain context continuity between chunks and improves retrieval performance.',
    'recursive-character': 'Recursively splits text using a hierarchy of separators (paragraphs, sentences, words, characters). Similar to LangChain\'s RecursiveCharacterTextSplitter approach.'
  };
  return explanations[strategyId] || 'This strategy processes text according to its specific algorithm.';
}

function getPerformanceTips(strategyId: string): string[] {
  const tips: Record<string, string[]> = {
    'character': [
      'Use for quick prototyping when semantic boundaries are not critical',
      'Consider increasing chunk size for better context preservation',
      'Monitor for broken sentences or paragraphs in output'
    ],
    'sentence': [
      'Ideal for question-answering systems where sentence context matters',
      'Adjust chunk size based on average sentence length in your documents',
      'Consider overlap to maintain context between chunks'
    ],
    'paragraph': [
      'Best for academic papers and research documents',
      'Monitor chunk sizes as paragraphs can vary greatly in length',
      'Consider combining with other strategies for very large paragraphs'
    ],
    'semantic': [
      'Requires well-structured documents with clear headers or sections',
      'Adjust sensitivity based on document structure complexity',
      'May need preprocessing to identify semantic boundaries'
    ],
    'sliding-window': [
      'Use when context continuity is crucial for your application',
      'Balance overlap percentage with storage costs',
      'Consider the trade-off between recall and precision'
    ],
    'recursive-character': [
      'Good general-purpose approach for diverse document types',
      'Customize separator hierarchy based on your document structure',
      'Monitor performance with very large documents'
    ]
  };
  return tips[strategyId] || ['Consider your specific use case when choosing parameters.'];
}

function getSemanticCoherenceScore(strategyId: string): string {
  const scores: Record<string, string> = {
    'character': 'Low',
    'sentence': 'Medium',
    'paragraph': 'High',
    'semantic': 'Very High',
    'sliding-window': 'Medium-High',
    'recursive-character': 'Medium'
  };
  return scores[strategyId] || 'Medium';
}

function getProcessingSpeedScore(strategyId: string): string {
  const scores: Record<string, string> = {
    'character': 'Very Fast',
    'sentence': 'Fast',
    'paragraph': 'Medium',
    'semantic': 'Slow',
    'sliding-window': 'Fast',
    'recursive-character': 'Medium'
  };
  return scores[strategyId] || 'Medium';
}

function getMemoryUsageScore(strategyId: string): string {
  const scores: Record<string, string> = {
    'character': 'Low',
    'sentence': 'Low',
    'paragraph': 'Medium',
    'semantic': 'Medium',
    'sliding-window': 'High',
    'recursive-character': 'Medium'
  };
  return scores[strategyId] || 'Medium';
}

function getComplexityScore(strategyId: string): string {
  const scores: Record<string, string> = {
    'character': 'Very Low',
    'sentence': 'Low',
    'paragraph': 'Low',
    'semantic': 'High',
    'sliding-window': 'Medium',
    'recursive-character': 'Medium'
  };
  return scores[strategyId] || 'Medium';
}

export default StrategyExplanation; 