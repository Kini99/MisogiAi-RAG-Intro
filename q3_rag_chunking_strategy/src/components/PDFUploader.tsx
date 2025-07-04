import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { PDFDocument } from '../types';
import { PDFProcessor } from '../utils/pdfProcessor';

interface PDFUploaderProps {
  onPDFUpload: (file: File) => void;
  isProcessing: boolean;
  pdfDocument: PDFDocument | null;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onPDFUpload, isProcessing, pdfDocument }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => PDFProcessor.isPDFFile(file));

    if (pdfFile) {
      onPDFUpload(pdfFile);
    } else {
      setError('Please upload a valid PDF file.');
    }
  }, [onPDFUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      if (PDFProcessor.isPDFFile(file)) {
        onPDFUpload(file);
      } else {
        setError('Please select a valid PDF file.');
      }
    }
  }, [onPDFUpload]);

  const handleRemoveFile = useCallback(() => {
    // Reset the file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="card">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload PDF Document</h2>
          <p className="text-gray-600 mb-6">
            Upload a PDF file to explore different chunking strategies for RAG systems
          </p>

          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragOver
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Processing PDF...</p>
                    <p className="text-sm text-gray-600">Extracting text content</p>
                  </div>
                </>
              ) : pdfDocument ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">PDF Uploaded Successfully!</p>
                    <p className="text-sm text-gray-600">{pdfDocument.name}</p>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Remove File</span>
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop your PDF here</p>
                    <p className="text-sm text-gray-600">or click to browse</p>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="btn-primary"
                    disabled={isProcessing}
                  >
                    Choose PDF File
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* File Information */}
      {pdfDocument && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">File Name</p>
                  <p className="text-sm text-gray-600 truncate">{pdfDocument.name}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">File Size</p>
                <p className="text-sm text-gray-600">{PDFProcessor.formatFileSize(pdfDocument.size)}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Pages</p>
                <p className="text-sm text-gray-600">{pdfDocument.pages}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Extracted At</p>
                <p className="text-sm text-gray-600">
                  {pdfDocument.extractedAt.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Text Statistics */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Text Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(PDFProcessor.getTextStatistics(pdfDocument.text)).map(([key, value]) => (
                <div key={key} className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-lg font-semibold text-blue-600">{value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              1
            </div>
            <p>Upload a PDF document using the drag-and-drop area or file browser</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              2
            </div>
            <p>Choose a chunking strategy and adjust parameters to see how they affect text segmentation</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              3
            </div>
            <p>Visualize the resulting chunks and analyze statistics to understand the impact of different approaches</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader; 