# PDF Chunking Visualizer for RAG Systems

A modern web application that allows users to upload PDF documents and visualize different chunking strategies for Retrieval-Augmented Generation (RAG) systems. This tool helps developers and researchers understand how different text chunking approaches affect document processing and retrieval performance.

## 🚀 Features

### Core Functionality
- **PDF Upload & Text Extraction**: Extract and display text from uploaded PDFs using PDF.js
- **Multiple Chunking Strategies**: Explore 6 different chunking approaches
- **Interactive Parameter Controls**: Adjust chunk size, overlap, and strategy-specific parameters
- **Real-time Visualization**: See chunks with metadata and overlap regions
- **Comprehensive Statistics**: Detailed analytics and performance metrics
- **Export Capabilities**: Download chunked results as JSON

### Chunking Strategies Implemented

1. **Character-based Chunking**
   - Simple character-level text splitting
   - Fastest processing, but may break semantic boundaries

2. **Sentence-based Chunking**
   - Respects sentence boundaries
   - Better semantic coherence than character-based
   - Ideal for question-answering systems

3. **Paragraph-based Chunking**
   - Groups text by paragraphs
   - Excellent context preservation
   - Best for academic papers and research documents

4. **Semantic Chunking**
   - Splits based on semantic boundaries (headers, sections)
   - Highest semantic coherence
   - Requires well-structured documents

5. **Sliding Window Chunking**
   - Creates overlapping chunks with sliding window
   - Good context continuity
   - Higher storage cost due to overlap

6. **Recursive Character Chunking**
   - Recursively splits using multiple separators
   - Similar to LangChain's RecursiveCharacterTextSplitter
   - Flexible and adaptive approach

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PDF Processing**: PDF.js
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdf-chunking-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### 1. Upload PDF
- Drag and drop a PDF file or click to browse
- The application will extract text and display document statistics
- Supports large PDF files with progress indication

### 2. Choose Strategy
- Select from 6 different chunking strategies
- Each strategy includes detailed explanation and use cases
- Adjust parameters using interactive sliders

### 3. Visualize Results
- View chunks with metadata (size, tokens, position)
- Search within chunks
- Sort by different criteria
- Expand/collapse chunk content
- Highlight overlap regions

### 4. Analyze Statistics
- Comprehensive performance metrics
- Chunk size distribution
- Efficiency analysis
- Personalized recommendations

## 📊 Understanding Chunking Strategies

### When to Use Each Strategy

| Strategy | Best For | Pros | Cons |
|----------|----------|------|------|
| Character-based | Quick prototyping, speed-critical applications | Fast, simple | May break sentences |
| Sentence-based | Q&A systems, text summarization | Good semantic coherence | May break paragraphs |
| Paragraph-based | Academic papers, research documents | Excellent context | Variable chunk sizes |
| Semantic | Structured documents with headers | Best semantic coherence | Complex implementation |
| Sliding Window | Context continuity important | Good overlap handling | Higher storage cost |
| Recursive Character | General purpose, diverse documents | Flexible, adaptive | Medium complexity |

### Parameter Guidelines

#### Chunk Size
- **Small (500 chars)**: Quick retrieval, may lose context
- **Medium (1000 chars)**: Balanced approach for most use cases
- **Large (2000+ chars)**: Rich context, may be harder to process

#### Overlap
- **0%**: No redundancy, may miss context
- **10-20%**: Good balance for most applications
- **30%+**: High recall, increased storage cost

## 🔧 Customization

### Adding New Strategies

1. Implement the chunking function in `src/utils/chunkingStrategies.ts`
2. Add strategy definition to the `chunkingStrategies` array
3. Update the `executeChunkingStrategy` function

### Styling

The application uses Tailwind CSS with custom components defined in `src/index.css`. You can customize:
- Color scheme in `tailwind.config.js`
- Component styles in the CSS file
- Layout and spacing in individual components

## 📈 Performance Considerations

### Large Documents
- The application handles large PDFs efficiently
- Text extraction is done page by page
- Chunking is performed in memory for real-time feedback

### Browser Compatibility
- Modern browsers with ES2020 support
- PDF.js for PDF processing
- Local processing (no server required)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect your repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use the `dist` folder as source
- **Any static hosting**: Serve the `dist` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code formatting
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PDF.js**: For PDF text extraction capabilities
- **LangChain**: Inspiration for recursive character chunking
- **Tailwind CSS**: For the beautiful UI components
- **React Community**: For the excellent ecosystem

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ for the RAG community** 