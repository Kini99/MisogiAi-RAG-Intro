import { ChunkingStrategy, Chunk } from '../types';

// Simple character-based chunking
export const characterChunking = (text: string, chunkSize: number, overlap: number): Chunk[] => {
  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkId = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex);
    
    chunks.push({
      id: `chunk-${chunkId}`,
      content,
      startIndex,
      endIndex,
      size: content.length,
      metadata: {
        strategy: 'Character-based',
        overlap,
        chunkSize,
        tokenCount: Math.ceil(content.length / 4) // Rough token estimation
      }
    });

    startIndex = endIndex - overlap;
    chunkId++;
  }

  return chunks;
};

// Sentence-based chunking
export const sentenceChunking = (text: string, maxChunkSize: number, overlap: number): Chunk[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let startIndex = 0;
  let chunkId = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim() + '. ';
    const potentialChunk = currentChunk + sentence;

    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk.length > 0) {
        const endIndex = startIndex + currentChunk.length;
        chunks.push({
          id: `chunk-${chunkId}`,
          content: currentChunk.trim(),
          startIndex,
          endIndex,
          size: currentChunk.length,
          metadata: {
            strategy: 'Sentence-based',
            overlap,
            chunkSize: maxChunkSize,
            tokenCount: Math.ceil(currentChunk.length / 4)
          }
        });
        chunkId++;
      }
      currentChunk = sentence;
      startIndex = text.indexOf(sentence, startIndex);
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    const endIndex = startIndex + currentChunk.length;
    chunks.push({
      id: `chunk-${chunkId}`,
      content: currentChunk.trim(),
      startIndex,
      endIndex,
      size: currentChunk.length,
      metadata: {
        strategy: 'Sentence-based',
        overlap,
        chunkSize: maxChunkSize,
        tokenCount: Math.ceil(currentChunk.length / 4)
      }
    });
  }

  return chunks;
};

// Paragraph-based chunking
export const paragraphChunking = (text: string, maxChunkSize: number, overlap: number): Chunk[] => {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let startIndex = 0;
  let chunkId = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim() + '\n\n';
    const potentialChunk = currentChunk + paragraph;

    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk.length > 0) {
        const endIndex = startIndex + currentChunk.length;
        chunks.push({
          id: `chunk-${chunkId}`,
          content: currentChunk.trim(),
          startIndex,
          endIndex,
          size: currentChunk.length,
          metadata: {
            strategy: 'Paragraph-based',
            overlap,
            chunkSize: maxChunkSize,
            tokenCount: Math.ceil(currentChunk.length / 4)
          }
        });
        chunkId++;
      }
      currentChunk = paragraph;
      startIndex = text.indexOf(paragraph, startIndex);
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    const endIndex = startIndex + currentChunk.length;
    chunks.push({
      id: `chunk-${chunkId}`,
      content: currentChunk.trim(),
      startIndex,
      endIndex,
      size: currentChunk.length,
      metadata: {
        strategy: 'Paragraph-based',
        overlap,
        chunkSize: maxChunkSize,
        tokenCount: Math.ceil(currentChunk.length / 4)
      }
    });
  }

  return chunks;
};

// Semantic chunking (simplified - using keyword boundaries)
export const semanticChunking = (text: string, maxChunkSize: number, overlap: number): Chunk[] => {
  // Split by semantic boundaries (headers, sections, etc.)
  const semanticBoundaries = text.split(/(?=^#{1,6}\s|^[A-Z][^.!?]*\n|^Chapter|^Section|^Part)/m);
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let startIndex = 0;
  let chunkId = 0;

  for (let i = 0; i < semanticBoundaries.length; i++) {
    const section = semanticBoundaries[i].trim();
    if (section.length === 0) continue;

    const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + section;

    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk.length > 0) {
        const endIndex = startIndex + currentChunk.length;
        chunks.push({
          id: `chunk-${chunkId}`,
          content: currentChunk.trim(),
          startIndex,
          endIndex,
          size: currentChunk.length,
          metadata: {
            strategy: 'Semantic',
            overlap,
            chunkSize: maxChunkSize,
            tokenCount: Math.ceil(currentChunk.length / 4)
          }
        });
        chunkId++;
      }
      currentChunk = section;
      startIndex = text.indexOf(section, startIndex);
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    const endIndex = startIndex + currentChunk.length;
    chunks.push({
      id: `chunk-${chunkId}`,
      content: currentChunk.trim(),
      startIndex,
      endIndex,
      size: currentChunk.length,
      metadata: {
        strategy: 'Semantic',
        overlap,
        chunkSize: maxChunkSize,
        tokenCount: Math.ceil(currentChunk.length / 4)
      }
    });
  }

  return chunks;
};

// Sliding window chunking with overlap
export const slidingWindowChunking = (text: string, chunkSize: number, overlap: number): Chunk[] => {
  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkId = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex);
    
    chunks.push({
      id: `chunk-${chunkId}`,
      content,
      startIndex,
      endIndex,
      size: content.length,
      metadata: {
        strategy: 'Sliding Window',
        overlap,
        chunkSize,
        tokenCount: Math.ceil(content.length / 4)
      }
    });

    startIndex += (chunkSize - overlap);
    chunkId++;
  }

  return chunks;
};

// Recursive character text splitting (similar to LangChain's approach)
export const recursiveCharacterChunking = (text: string, chunkSize: number, overlap: number): Chunk[] => {
  const separators = ['\n\n', '\n', ' ', ''];
  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkId = 0;

  const splitText = (text: string, separators: string[]): string[] => {
    if (separators.length === 0) {
      return [text];
    }

    const separator = separators[0];
    const splits = text.split(separator);
    
    if (splits.length === 1) {
      return splitText(text, separators.slice(1));
    }

    const result: string[] = [];
    for (const split of splits) {
      result.push(...splitText(split, separators.slice(1)));
    }
    return result;
  };

  const textSplits = splitText(text, separators);
  let currentChunk = '';

  for (const split of textSplits) {
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + split;
    
    if (potentialChunk.length <= chunkSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk.length > 0) {
        const endIndex = startIndex + currentChunk.length;
        chunks.push({
          id: `chunk-${chunkId}`,
          content: currentChunk.trim(),
          startIndex,
          endIndex,
          size: currentChunk.length,
          metadata: {
            strategy: 'Recursive Character',
            overlap,
            chunkSize,
            tokenCount: Math.ceil(currentChunk.length / 4)
          }
        });
        chunkId++;
      }
      currentChunk = split;
      startIndex = text.indexOf(split, startIndex);
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    const endIndex = startIndex + currentChunk.length;
    chunks.push({
      id: `chunk-${chunkId}`,
      content: currentChunk.trim(),
      startIndex,
      endIndex,
      size: currentChunk.length,
      metadata: {
        strategy: 'Recursive Character',
        overlap,
        chunkSize,
        tokenCount: Math.ceil(currentChunk.length / 4)
      }
    });
  }

  return chunks;
};

// Strategy definitions
export const chunkingStrategies: ChunkingStrategy[] = [
  {
    id: 'character',
    name: 'Character-based Chunking',
    description: 'Simple character-level text splitting with fixed chunk sizes',
    parameters: {
      chunkSize: 1000,
      overlap: 200
    },
    explanation: 'This strategy splits text into fixed-size chunks based on character count. It\'s the simplest approach but may break sentences or paragraphs inappropriately.',
    useCases: [
      'Quick prototyping',
      'When semantic boundaries are not important',
      'Processing very large documents where speed is critical'
    ],
    tradeoffs: [
      'May break sentences or paragraphs mid-way',
      'Doesn\'t preserve semantic meaning',
      'Fast and simple to implement'
    ]
  },
  {
    id: 'sentence',
    name: 'Sentence-based Chunking',
    description: 'Splits text at sentence boundaries while respecting maximum chunk size',
    parameters: {
      chunkSize: 1000,
      overlap: 100
    },
    explanation: 'This strategy respects sentence boundaries, ensuring that chunks don\'t break in the middle of sentences. It provides better semantic coherence than character-based chunking.',
    useCases: [
      'When sentence-level context is important',
      'Question-answering systems',
      'Text summarization tasks'
    ],
    tradeoffs: [
      'Better semantic coherence than character-based',
      'May still break paragraph context',
      'Slightly more complex than character-based'
    ]
  },
  {
    id: 'paragraph',
    name: 'Paragraph-based Chunking',
    description: 'Splits text at paragraph boundaries for better context preservation',
    parameters: {
      chunkSize: 1500,
      overlap: 200
    },
    explanation: 'This strategy groups text by paragraphs, maintaining the natural flow and context of the document. It\'s particularly useful for documents with clear paragraph structure.',
    useCases: [
      'Academic papers and research documents',
      'When paragraph-level context is crucial',
      'Document classification tasks'
    ],
    tradeoffs: [
      'Excellent context preservation',
      'May create very large chunks',
      'Requires well-structured documents'
    ]
  },
  {
    id: 'semantic',
    name: 'Semantic Chunking',
    description: 'Splits text based on semantic boundaries like headers and sections',
    parameters: {
      chunkSize: 2000,
      overlap: 300
    },
    explanation: 'This strategy identifies semantic boundaries in the text (like headers, chapters, or sections) and splits accordingly. It preserves the logical structure of the document.',
    useCases: [
      'Structured documents with headers',
      'Technical documentation',
      'When topic-level context is important'
    ],
    tradeoffs: [
      'Best semantic coherence',
      'Requires document structure',
      'Most complex to implement'
    ]
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window Chunking',
    description: 'Creates overlapping chunks with a sliding window approach',
    parameters: {
      chunkSize: 1000,
      overlap: 200
    },
    explanation: 'This strategy creates overlapping chunks by sliding a window over the text. The overlap helps maintain context between chunks and improves retrieval performance.',
    useCases: [
      'When context continuity is important',
      'Information retrieval systems',
      'When you need redundancy for better recall'
    ],
    tradeoffs: [
      'Good context continuity through overlap',
      'Creates more chunks (higher storage cost)',
      'May introduce redundancy'
    ]
  },
  {
    id: 'recursive-character',
    name: 'Recursive Character Chunking',
    description: 'Recursively splits text using multiple separators (similar to LangChain)',
    parameters: {
      chunkSize: 1000,
      overlap: 200
    },
    explanation: 'This strategy recursively splits text using a hierarchy of separators (paragraphs, sentences, words, characters). It\'s similar to LangChain\'s RecursiveCharacterTextSplitter.',
    useCases: [
      'General-purpose text processing',
      'When you need flexible chunking',
      'Processing diverse document types'
    ],
    tradeoffs: [
      'Flexible and adaptive',
      'Good balance of speed and quality',
      'More complex than simple approaches'
    ]
  }
];

// Strategy execution function
export const executeChunkingStrategy = (
  text: string, 
  strategy: ChunkingStrategy
): Chunk[] => {
  const { chunkSize, overlap } = strategy.parameters;

  switch (strategy.id) {
    case 'character':
      return characterChunking(text, chunkSize, overlap);
    case 'sentence':
      return sentenceChunking(text, chunkSize, overlap);
    case 'paragraph':
      return paragraphChunking(text, chunkSize, overlap);
    case 'semantic':
      return semanticChunking(text, chunkSize, overlap);
    case 'sliding-window':
      return slidingWindowChunking(text, chunkSize, overlap);
    case 'recursive-character':
      return recursiveCharacterChunking(text, chunkSize, overlap);
    default:
      return characterChunking(text, chunkSize, overlap);
  }
}; 