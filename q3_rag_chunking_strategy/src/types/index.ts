export interface Chunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  size: number;
  pageNumber?: number;
  metadata: {
    strategy: string;
    overlap?: number;
    chunkSize?: number;
    tokenCount?: number;
  };
}

export interface ChunkingStrategy {
  id: string;
  name: string;
  description: string;
  parameters: {
    chunkSize: number;
    overlap: number;
    [key: string]: any;
  };
  explanation: string;
  useCases: string[];
  tradeoffs: string[];
}

export interface PDFDocument {
  name: string;
  size: number;
  pages: number;
  text: string;
  extractedAt: Date;
}

export interface ChunkingResult {
  strategy: ChunkingStrategy;
  chunks: Chunk[];
  statistics: {
    totalChunks: number;
    averageChunkSize: number;
    totalTokens: number;
    averageTokensPerChunk: number;
    overlapPercentage: number;
  };
} 