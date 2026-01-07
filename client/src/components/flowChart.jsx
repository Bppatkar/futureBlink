import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { InputNode } from './InputNode';
import { ResultNode } from './ResultNode';
import { aiService } from '../services/api';
import { Play, Save, AlertCircle, CheckCircle, Settings, Maximize2, RefreshCw, CloudOff } from 'lucide-react';

const nodeTypes = {
  input: InputNode,
  result: ResultNode,
};

export function FlowChart({ darkMode = false }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Initialize nodes state first
  const initialNodes = [
    {
      id: 'input-node',
      data: { 
        prompt, 
        isLoading, 
        onPromptChange: (value) => {}, // Placeholder
        darkMode,
        onGenerate: () => {} // Placeholder
      },
      position: { x: 50, y: 150 },
      type: 'input',
    },
    {
      id: 'result-node',
      data: { 
        result, 
        isLoading, 
        darkMode, 
        connectionError,
        model: currentModel,
        processing_time_ms: processingTime
      },
      position: { x: 700, y: 150 },
      type: 'result',
    },
  ];

  const initialEdges = [{
    id: 'e1-2',
    source: 'input-node',
    target: 'result-node',
    animated: true,
    style: { 
      stroke: connectionError ? (darkMode ? '#ef4444' : '#dc2626') : 'url(#gradient)', 
      strokeWidth: 3 
    },
  }];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Now define functions that use setNodes
  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input-node'
          ? { ...node, data: { ...node.data, prompt: value } }
          : node
      )
    );
  }, [setNodes]);

  const handleRunFlow = useCallback(async () => {
    if (!prompt.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    setIsLoading(true);
    setConnectionError(false);
    setCurrentModel(null);
    setProcessingTime(null);
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input-node' || node.id === 'result-node'
          ? { ...node, data: { ...node.data, isLoading: true, connectionError: false, model: null } }
          : node
      )
    );

    // Update edge color
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        style: { 
          stroke: 'url(#gradient)', 
          strokeWidth: 3,
        }
      }))
    );

    try {
      console.log('Sending prompt to AI service:', prompt);
      const response = await aiService.generateResponse(prompt);
      console.log('AI Service Response:', response);

      if (response.success) {
        setResult(response.response || 'No response content');
        setCurrentModel(response.model);
        setProcessingTime(response.processing_time_ms);
        
        setNodes((nds) =>
          nds.map((node) =>
            node.id === 'result-node'
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    result: response.response, 
                    isLoading: false, 
                    connectionError: false,
                    model: response.model,
                    processing_time_ms: response.processing_time_ms
                  } 
                }
              : node.id === 'input-node'
              ? { ...node, data: { ...node.data, isLoading: false } }
              : node
          )
        );
        showNotification(`✨ Response generated! (${response.model?.split('/')[0]})`, 'success');
      } else {
        const errorMessage = response.error || 'Unknown error';
        setResult(`Error: ${errorMessage}`);
        setConnectionError(true);
        
        setNodes((nds) =>
          nds.map((node) =>
            node.id === 'result-node'
              ? { ...node, data: { ...node.data, result: `Error: ${errorMessage}`, isLoading: false, connectionError: true } }
              : node.id === 'input-node'
              ? { ...node, data: { ...node.data, isLoading: false } }
              : node
          )
        );
        showNotification(`AI Error: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('AI Service Connection Error:', error);
      const errorMessage = error.message || 'Unable to connect to AI service';
      setResult(`Connection Error: ${errorMessage}`);
      setConnectionError(true);
      
      setNodes((nds) =>
        nds.map((node) =>
          node.id === 'result-node'
            ? { ...node, data: { ...node.data, result: `Connection Error: ${errorMessage}`, isLoading: false, connectionError: true } }
            : node.id === 'input-node'
            ? { ...node, data: { ...node.data, isLoading: false } }
            : node
        )
      );
      showNotification('Unable to connect to AI service', 'error');
    } finally {
      setIsLoading(false);
      // Reset edge animation
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          style: { 
            stroke: connectionError ? (darkMode ? '#ef4444' : '#dc2626') : 'url(#gradient)', 
            strokeWidth: 3 
          }
        }))
      );
    }
  }, [prompt, setNodes, setEdges, darkMode]);

  const handleSave = useCallback(async () => {
    if (!prompt.trim() || !result.trim() || result.includes('Error:')) {
      showNotification('Please generate a valid response first', 'error');
      return;
    }

    try {
      console.log('Saving prompt and response:', { prompt, result });
      const saved = await aiService.savePrompt(prompt, result);
      console.log('Save result:', saved);
      
      showNotification('💾 Saved to history!', 'success');
      
      // Clear the input and result
      setPrompt('');
      setResult('');
      setCurrentModel(null);
      setProcessingTime(null);
      
      handlePromptChange('');
      setNodes((nds) =>
        nds.map((node) =>
          node.id === 'result-node'
            ? { ...node, data: { ...node.data, result: '', connectionError: false, model: null } }
            : node.id === 'input-node'
            ? { ...node, data: { ...node.data, prompt: '' } }
            : node
        )
      );
      setConnectionError(false);
    } catch (error) {
      console.error('Save error details:', error.response?.data || error.message);
      showNotification('Failed to save. Check console for details.', 'error');
    }
  }, [prompt, result, handlePromptChange, setNodes]);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Update nodes with actual functions
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input-node'
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                prompt, 
                isLoading, 
                onPromptChange: handlePromptChange,
                onGenerate: handleRunFlow,
                connectionError
              } 
            }
          : node.id === 'result-node'
          ? { ...node, data: { ...node.data, result, isLoading, connectionError, model: currentModel, processing_time_ms: processingTime } }
          : node
      )
    );
  }, [prompt, result, isLoading, handlePromptChange, handleRunFlow, connectionError, currentModel, processingTime, setNodes]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleRetryConnection = () => {
    setConnectionError(false);
    showNotification('Connection reset, ready to try again', 'success');
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Gradient SVG for edges */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#764ba2" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Notification - Modern */}
      {notification && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 shadow-2xl animate-slide-in ${
          notification.type === 'success'
            ? darkMode ? 'bg-gradient-to-r from-green-500/90 to-emerald-600/90' : 'bg-gradient-to-r from-green-400 to-emerald-500'
            : darkMode ? 'bg-gradient-to-r from-red-500/90 to-pink-600/90' : 'bg-gradient-to-r from-red-400 to-pink-500'
        } text-white`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">
            {notification.message}
          </span>
        </div>
      )}

      {/* Connection Error Banner */}
      {connectionError && (
        <div className={`absolute top-4 left-6 right-6 z-40 px-6 py-3 rounded-xl flex items-center justify-between shadow-xl animate-slide-in ${
          darkMode ? 'bg-gradient-to-r from-red-900/90 to-pink-900/90' : 'bg-gradient-to-r from-red-100 to-pink-100 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <CloudOff className={`w-5 h-5 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
            <div>
              <p className={`font-medium ${darkMode ? 'text-red-100' : 'text-red-800'}`}>
                AI Service Connection Issue
              </p>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                Some AI models may be unavailable. Trying alternative models...
              </p>
            </div>
          </div>
          <button
            onClick={handleRetryConnection}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-all-300`}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Modern Control Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
              <span className="font-medium">AI Pipeline</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-70">
              <div className={`w-2 h-2 rounded-full ${connectionError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
              <span>{connectionError ? 'Limited' : 'Live'}</span>
            </div>
          </div>
          {currentModel && (
            <div className={`px-3 py-1 rounded-lg text-sm ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
              Model: {currentModel.split('/')[0]}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl transition-all-300 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleFullScreen}
            className={`p-3 rounded-xl transition-all-300 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            {isFullScreen ? (
              <Maximize2 className="w-5 h-5 rotate-45" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons - Floating */}
      <div className="absolute top-24 left-6 z-10 flex flex-col gap-3">
        <button
          onClick={handleRunFlow}
          disabled={isLoading || !prompt.trim()}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all-300 shadow-lg ${
            isLoading || !prompt.trim()
              ? darkMode 
                ? 'bg-gray-700 text-gray-400' 
                : 'bg-gray-200 text-gray-400'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-105 hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Generate
            </>
          )}
        </button>
        
        <button
          onClick={handleSave}
          disabled={isLoading || !result.trim() || connectionError || result.includes('Error:')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all-300 ${
            isLoading || !result.trim() || connectionError || result.includes('Error:')
              ? darkMode 
                ? 'bg-gray-700/50 text-gray-500' 
                : 'bg-gray-200/50 text-gray-400'
              : darkMode 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-white hover:bg-gray-100'
          }`}
        >
          <Save className="w-5 h-5" />
          Save
        </button>

        {/* Status Indicator */}
        <div className={`mt-4 px-4 py-2 rounded-xl text-sm ${darkMode ? 'bg-white/5' : 'bg-gray-100/50'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectionError ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className={connectionError ? 'text-yellow-400' : 'text-green-600'}>
              {connectionError ? 'Limited AI Models' : '4 AI Models Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Flow Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={2}
          style={{ width: '100%', height: '100%' }}
          defaultEdgeOptions={{
            animated: !connectionError,
            style: { strokeWidth: 3 },
          }}
        >
          <Background 
            variant="dots" 
            gap={20} 
            size={1}
            color={darkMode ? '#4b5563' : '#d1d5db'} 
          />
          <Controls 
            position="bottom-right"
            className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl shadow-lg p-2`}
            showInteractive={false}
          />
          <MiniMap 
            position="bottom-left"
            className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg rounded-xl`}
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              if (node.type === 'input') return '#3b82f6';
              if (node.type === 'result') return connectionError ? '#ef4444' : '#10b981';
              return '#6b7280';
            }}
          />
        </ReactFlow>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`absolute top-20 right-6 w-64 rounded-xl shadow-2xl animate-slide-in ${
          darkMode ? 'glass-effect' : 'bg-white/90 backdrop-blur-sm'
        } p-4`}>
          <h4 className="font-bold mb-4">AI Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm opacity-70 block mb-2">Current Model</label>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {currentModel || 'Not selected'}
              </div>
            </div>
            <div>
              <label className="text-sm opacity-70 block mb-2">Response Length</label>
              <select className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <option>Short & Concise</option>
                <option>Medium (Default)</option>
                <option>Detailed & Comprehensive</option>
              </select>
            </div>
            <div>
              <label className="text-sm opacity-70 block mb-2">Temperature</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                defaultValue="0.7"
                className="w-full accent-blue-500" 
              />
              <div className="flex justify-between text-xs opacity-70 mt-1">
                <span>Precise</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span>Fallback Models</span>
                <span className={`px-2 py-1 rounded ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                  Enabled
                </span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                Automatically try alternative models if one fails
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}