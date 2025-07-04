import React, { useState, useMemo } from 'react';
import { Chunk, ChunkingStrategy } from '../types';
import { Eye, Search, Copy, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface ChunkVisualizerProps {
  chunks: Chunk[];
  strategy: ChunkingStrategy;
  originalText: string;
}

const ChunkVisualizer: React.FC<ChunkVisualizerProps> = ({ chunks, strategy, originalText }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());
  const [showOverlaps, setShowOverlaps] = useState(true);
  const [sortBy, setSortBy] = useState<'index' | 'size' | 'tokens'>('index');

  // Filter chunks based on search term
  const filteredChunks = useMemo(() => {
    if (!searchTerm) return chunks;
    return chunks.filter(chunk => 
      chunk.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chunks, searchTerm]);

  // Sort chunks
  const sortedChunks = useMemo(() => {
    return [...filteredChunks].sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.size - a.size;
        case 'tokens':
          return (b.metadata.tokenCount || 0) - (a.metadata.tokenCount || 0);
        default:
          return a.startIndex - b.startIndex;
      }
    });
  }, [filteredChunks, sortBy]);

  // Calculate overlap regions
  const overlapRegions = useMemo(() => {
    if (!showOverlaps || strategy.parameters.overlap === 0) return [];
    
    const overlaps: Array<{start: number, end: number, chunks: string[]}> = [];
    
    for (let i = 0; i < chunks.length - 1; i++) {
      const currentChunk = chunks[i];
      const nextChunk = chunks[i + 1];
      
      if (nextChunk.startIndex < currentChunk.endIndex) {
        const overlapStart = nextChunk.startIndex;
        const overlapEnd = currentChunk.endIndex;
        
        overlaps.push({
          start: overlapStart,
          end: overlapEnd,
          chunks: [currentChunk.id, nextChunk.id]
        });
      }
    }
    
    return overlaps;
  }, [chunks, showOverlaps, strategy.parameters.overlap]);

  const toggleChunkExpansion = (chunkId: string) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId);
    } else {
      newExpanded.add(chunkId);
    }
    setExpandedChunks(newExpanded);
  };

  const copyChunkContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const exportChunks = () => {
    const data = {
      strategy: strategy.name,
      parameters: strategy.parameters,
      chunks: chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        size: chunk.size,
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        metadata: chunk.metadata
      })),
      statistics: {
        totalChunks: chunks.length,
        averageChunkSize: Math.round(chunks.reduce((sum, chunk) => sum + chunk.size, 0) / chunks.length),
        totalTokens: chunks.reduce((sum, chunk) => sum + (chunk.metadata.tokenCount || 0), 0),
        overlapPercentage: Math.round((strategy.parameters.overlap / strategy.parameters.chunkSize) * 100)
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chunks_${strategy.id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Chunk Visualization</h2>
            <p className="text-gray-600">
              {chunks.length} chunks created using {strategy.name}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportChunks}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export JSON</span>
            </button>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOverlaps}
                onChange={(e) => setShowOverlaps(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Show Overlaps</span>
            </label>
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in chunks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'index' | 'size' | 'tokens')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="index">Index</option>
              <option value="size">Size</option>
              <option value="tokens">Tokens</option>
            </select>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Found {filteredChunks.length} chunks containing "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Chunks Display */}
      <div className="space-y-4">
        {sortedChunks.map((chunk, index) => {
          const isExpanded = expandedChunks.has(chunk.id);
          const hasOverlap = overlapRegions.some(overlap => 
            overlap.chunks.includes(chunk.id)
          );
          
          return (
            <div
              key={chunk.id}
              className={`card transition-all ${
                hasOverlap && showOverlaps ? 'border-l-4 border-l-green-500' : ''
              }`}
            >
              {/* Chunk Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      Chunk {index + 1} ({chunk.id})
                    </h3>
                    {hasOverlap && showOverlaps && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Has Overlap
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-1 font-medium">{chunk.size.toLocaleString()} chars</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tokens:</span>
                      <span className="ml-1 font-medium">{chunk.metadata.tokenCount?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Position:</span>
                      <span className="ml-1 font-medium">{chunk.startIndex.toLocaleString()} - {chunk.endIndex.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Strategy:</span>
                      <span className="ml-1 font-medium">{chunk.metadata.strategy}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyChunkContent(chunk.content)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy chunk content"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleChunkExpansion(chunk.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={isExpanded ? "Collapse chunk" : "Expand chunk"}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Chunk Content */}
              {isExpanded && (
                <div className="mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {highlightSearchTerm(chunk.content, searchTerm)}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Chunk Preview (when not expanded) */}
              {!isExpanded && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {chunk.content.length > 200 
                      ? `${chunk.content.substring(0, 200)}...`
                      : chunk.content
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {sortedChunks.length === 0 && (
        <div className="card text-center py-12">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chunks found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? `No chunks contain "${searchTerm}". Try a different search term.`
              : 'No chunks available. Please check your strategy settings.'
            }
          </p>
        </div>
      )}

      {/* Overlap Visualization */}
      {showOverlaps && overlapRegions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overlap Regions</h3>
          <div className="space-y-3">
            {overlapRegions.map((overlap, index) => (
              <div key={index} className="chunk-overlap">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">Overlap {index + 1}</span>
                  <span className="text-sm text-green-600">
                    {overlap.end - overlap.start} characters
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  <p>Position: {overlap.start.toLocaleString()} - {overlap.end.toLocaleString()}</p>
                  <p>Shared by chunks: {overlap.chunks.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChunkVisualizer; 