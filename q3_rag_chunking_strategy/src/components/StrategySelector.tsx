import React from 'react';
import { ChunkingStrategy } from '../types';
import { Settings, Sliders } from 'lucide-react';

interface StrategySelectorProps {
  strategies: ChunkingStrategy[];
  selectedStrategy: ChunkingStrategy;
  onStrategyChange: (strategy: ChunkingStrategy) => void;
  onParameterChange: (parameter: string, value: number) => void;
}

const StrategySelector: React.FC<StrategySelectorProps> = ({
  strategies,
  selectedStrategy,
  onStrategyChange,
  onParameterChange
}) => {
  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Chunking Strategy</h3>
        </div>
        
        <div className="space-y-3">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedStrategy.id === strategy.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onStrategyChange(strategy)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                </div>
                {selectedStrategy.id === strategy.id && (
                  <div className="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parameter Controls */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Sliders className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Strategy Parameters</h3>
        </div>

        <div className="space-y-4">
          {/* Chunk Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chunk Size (characters)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={selectedStrategy.parameters.chunkSize}
                onChange={(e) => onParameterChange('chunkSize', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm font-medium text-gray-900 min-w-[60px]">
                {selectedStrategy.parameters.chunkSize.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100</span>
              <span>5,000</span>
            </div>
          </div>

          {/* Overlap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overlap (characters)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max={Math.floor(selectedStrategy.parameters.chunkSize * 0.5)}
                step="50"
                value={selectedStrategy.parameters.overlap}
                onChange={(e) => onParameterChange('overlap', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm font-medium text-gray-900 min-w-[60px]">
                {selectedStrategy.parameters.overlap.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{Math.floor(selectedStrategy.parameters.chunkSize * 0.5).toLocaleString()}</span>
            </div>
            {selectedStrategy.parameters.overlap > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Overlap: {Math.round((selectedStrategy.parameters.overlap / selectedStrategy.parameters.chunkSize) * 100)}% of chunk size
              </p>
            )}
          </div>

          {/* Strategy-specific parameters */}
          {selectedStrategy.id === 'semantic' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semantic Boundary Sensitivity
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={selectedStrategy.parameters.sensitivity || 5}
                  onChange={(e) => onParameterChange('sensitivity', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm font-medium text-gray-900 min-w-[30px]">
                  {selectedStrategy.parameters.sensitivity || 5}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          )}

          {selectedStrategy.id === 'sliding-window' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Window Step Size
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="50"
                  max={selectedStrategy.parameters.chunkSize - 100}
                  step="50"
                  value={selectedStrategy.parameters.stepSize || Math.floor(selectedStrategy.parameters.chunkSize * 0.8)}
                  onChange={(e) => onParameterChange('stepSize', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm font-medium text-gray-900 min-w-[60px]">
                  {(selectedStrategy.parameters.stepSize || Math.floor(selectedStrategy.parameters.chunkSize * 0.8)).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Parameter Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Settings</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Chunk Size:</span>
              <span className="ml-2 font-medium">{selectedStrategy.parameters.chunkSize.toLocaleString()} chars</span>
            </div>
            <div>
              <span className="text-gray-600">Overlap:</span>
              <span className="ml-2 font-medium">{selectedStrategy.parameters.overlap.toLocaleString()} chars</span>
            </div>
            <div>
              <span className="text-gray-600">Overlap %:</span>
              <span className="ml-2 font-medium">
                {Math.round((selectedStrategy.parameters.overlap / selectedStrategy.parameters.chunkSize) * 100)}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">Strategy:</span>
              <span className="ml-2 font-medium">{selectedStrategy.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              const strategy = { ...selectedStrategy, parameters: { ...selectedStrategy.parameters, chunkSize: 500, overlap: 50 } };
              onStrategyChange(strategy);
            }}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Small Chunks</div>
            <div className="text-sm text-gray-600">500 chars, 10% overlap</div>
          </button>
          <button
            onClick={() => {
              const strategy = { ...selectedStrategy, parameters: { ...selectedStrategy.parameters, chunkSize: 1000, overlap: 100 } };
              onStrategyChange(strategy);
            }}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Medium Chunks</div>
            <div className="text-sm text-gray-600">1000 chars, 10% overlap</div>
          </button>
          <button
            onClick={() => {
              const strategy = { ...selectedStrategy, parameters: { ...selectedStrategy.parameters, chunkSize: 2000, overlap: 200 } };
              onStrategyChange(strategy);
            }}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Large Chunks</div>
            <div className="text-sm text-gray-600">2000 chars, 10% overlap</div>
          </button>
          <button
            onClick={() => {
              const strategy = { ...selectedStrategy, parameters: { ...selectedStrategy.parameters, chunkSize: 1000, overlap: 0 } };
              onStrategyChange(strategy);
            }}
            className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">No Overlap</div>
            <div className="text-sm text-gray-600">1000 chars, 0% overlap</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategySelector; 