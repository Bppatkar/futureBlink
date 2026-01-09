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
import {
  Play,
  Save,
  AlertCircle,
  CheckCircle,
  Maximize2,
  RefreshCw,
  CloudOff,
  Plus,
} from 'lucide-react';

const nodeTypes = {
  input: InputNode,
  result: ResultNode,
};

export default function FlowChart({ darkMode = false }) {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Initialize nodes state
  const getInitialNodes = () => {
    const nodes = [
      {
        id: 'input-node',
        data: {
          prompt,
          isLoading,
          onPromptChange: (value) => {},
          darkMode,
          onGenerate: () => {},
        },
        position: { x: 50, y: 150 },
        type: 'input',
      },
    ];

    // Add result nodes for each result
    results.forEach((result, index) => {
      const xOffset = 700 + (index % 2) * 450;
      const yOffset = 150 + Math.floor(index / 2) * 400;

      nodes.push({
        id: `result-node-${index}`,
        data: {
          result: result.response,
          isLoading: false,
          darkMode,
          connectionError,
          model: result.model,
          processing_time_ms: result.processing_time_ms,
          resultIndex: index,
        },
        position: { x: xOffset, y: yOffset },
        type: 'result',
      });
    });

    return nodes;
  };

  const getInitialEdges = () => {
    return results.map((_, index) => ({
      id: `e-input-result-${index}`,
      source: 'input-node',
      target: `result-node-${index}`,
      animated: true,
      style: {
        stroke: connectionError
          ? darkMode
            ? '#ef4444'
            : '#dc2626'
          : 'url(#gradient)',
        strokeWidth: 3,
      },
    }));
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  const handlePromptChange = useCallback(
    (value) => {
      setPrompt(value);
      setNodes((nds) =>
        nds.map((node) =>
          node.id === 'input-node'
            ? { ...node, data: { ...node.data, prompt: value } }
            : node
        )
      );
    },
    [setNodes]
  );

  const handleRunFlow = useCallback(async () => {
    if (!prompt.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    setIsLoading(true);
    setConnectionError(false);
    setCurrentModel(null);
    setProcessingTime(null);
    setResults([]);

    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input-node'
          ? {
              ...node,
              data: { ...node.data, isLoading: true, connectionError: false },
            }
          : node
      )
    );

    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        style: {
          stroke: 'url(#gradient)',
          strokeWidth: 3,
        },
      }))
    );

    try {
      console.log('Sending prompt to AI service:', prompt);
      const response = await aiService.generateResponse(prompt);
      console.log('AI Service Response:', response);

      if (response.success) {
        const newResult = {
          response: response.response || 'No response content',
          model: response.model,
          processing_time_ms: response.processing_time_ms,
        };

        setResults([newResult]);
        setCurrentModel(response.model);
        setProcessingTime(response.processing_time_ms);

        setNodes((nds) => [
          ...nds.filter((n) => n.id === 'input-node'),
          {
            id: `result-node-0`,
            data: {
              result: response.response,
              isLoading: false,
              connectionError: false,
              model: response.model,
              processing_time_ms: response.processing_time_ms,
              resultIndex: 0,
            },
            position: { x: 700, y: 150 },
            type: 'result',
          },
        ]);

        setEdges([
          {
            id: `e-input-result-0`,
            source: 'input-node',
            target: `result-node-0`,
            animated: true,
            style: { stroke: 'url(#gradient)', strokeWidth: 3 },
          },
        ]);

        showNotification(
          `✨ Response generated! (${response.model?.split('/')[0]})`,
          'success'
        );
      } else {
        const errorMessage = response.error || 'Unknown error';
        setConnectionError(true);
        showNotification(`AI Error: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('AI Service Connection Error:', error);
      const errorMessage = error.message || 'Unable to connect to AI service';
      setConnectionError(true);
      showNotification('Unable to connect to AI service', 'error');
    } finally {
      setIsLoading(false);
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          style: {
            stroke: connectionError
              ? darkMode
                ? '#ef4444'
                : '#dc2626'
              : 'url(#gradient)',
            strokeWidth: 3,
          },
        }))
      );
    }
  }, [prompt, setNodes, setEdges, darkMode, connectionError]);

  const handleAddNewResult = useCallback(async () => {
    if (!prompt.trim()) {
      showNotification('Please enter a prompt first', 'error');
      return;
    }

    if (isLoading) {
      showNotification(
        'Please wait for current generation to complete',
        'error'
      );
      return;
    }

    setIsLoading(true);
    setConnectionError(false);

    try {
      console.log('Generating additional response for prompt:', prompt);
      const response = await aiService.generateResponse(prompt);
      console.log('Additional AI Service Response:', response);

      if (response.success) {
        const newResult = {
          response: response.response || 'No response content',
          model: response.model,
          processing_time_ms: response.processing_time_ms,
        };

        // Add to existing results instead of replacing
        const updatedResults = [...results, newResult];
        setResults(updatedResults);

        // Calculate position for new node
        const nodeCount = updatedResults.length - 1;
        const xOffset = 700 + (nodeCount % 2) * 450;
        const yOffset = 150 + Math.floor(nodeCount / 2) * 400;

        // Add new node
        setNodes((nds) => [
          ...nds,
          {
            id: `result-node-${nodeCount}`,
            data: {
              result: response.response,
              isLoading: false,
              connectionError: false,
              model: response.model,
              processing_time_ms: response.processing_time_ms,
              resultIndex: nodeCount,
            },
            position: { x: xOffset, y: yOffset },
            type: 'result',
          },
        ]);

        // Add new edge
        setEdges((eds) => [
          ...eds,
          {
            id: `e-input-result-${nodeCount}`,
            source: 'input-node',
            target: `result-node-${nodeCount}`,
            animated: true,
            style: { stroke: 'url(#gradient)', strokeWidth: 3 },
          },
        ]);

        showNotification(
          `✨ Added response ${nodeCount + 1}! (${
            response.model?.split('/')[0]
          })`,
          'success'
        );
      } else {
        const errorMessage = response.error || 'Unknown error';
        setConnectionError(true);
        showNotification(`AI Error: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('AI Service Connection Error:', error);
      const errorMessage = error.message || 'Unable to connect to AI service';
      setConnectionError(true);
      showNotification('Unable to connect to AI service', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, results, isLoading, setNodes, setEdges]);

  const handleSave = useCallback(async () => {
    if (!prompt.trim() || results.length === 0) {
      showNotification('Please generate a response first', 'error');
      return;
    }

    try {
      // Save the first result
      const firstResult = results[0];
      if (firstResult.response.includes('Error:')) {
        showNotification('Cannot save error responses', 'error');
        return;
      }

      console.log('Saving prompt and response:', {
        prompt,
        response: firstResult.response,
      });
      const saved = await aiService.savePrompt(prompt, firstResult.response);
      console.log('Save result:', saved);

      showNotification('💾 Saved to history!', 'success');

      // Clear everything
      setPrompt('');
      setResults([]);
      setCurrentModel(null);
      setProcessingTime(null);

      handlePromptChange('');
      setNodes((nds) => nds.filter((n) => n.id === 'input-node'));
      setEdges([]);
      setConnectionError(false);
    } catch (error) {
      console.error(
        'Save error details:',
        error.response?.data || error.message
      );
      showNotification('Failed to save. Check console for details.', 'error');
    }
  }, [prompt, results, handlePromptChange, setNodes]);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

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
                connectionError,
              },
            }
          : node
      )
    );
  }, [
    prompt,
    isLoading,
    handlePromptChange,
    handleRunFlow,
    connectionError,
    setNodes,
  ]);

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

      {/* Notification */}
      {notification && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 shadow-2xl animate-slide-in ${
            notification.type === 'success'
              ? darkMode
                ? 'bg-linear-to-r from-green-500/90 to-emerald-600/90'
                : 'bg-linear-to-r from-green-400 to-emerald-500'
              : darkMode
              ? 'bg-linear-to-r from-red-500/90 to-pink-600/90'
              : 'bg-linear-to-r from-red-400 to-pink-500'
          } text-white`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Connection Error Banner */}
      {connectionError && (
        <div
          className={`absolute top-4 left-6 right-6 z-40 px-6 py-3 rounded-xl flex items-center justify-between shadow-xl animate-slide-in ${
            darkMode
              ? 'bg-linear-to-r from-red-900/90 to-pink-900/90'
              : 'bg-linear-to-r from-red-100 to-pink-100 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <CloudOff
              className={`w-5 h-5 ${
                darkMode ? 'text-red-300' : 'text-red-600'
              }`}
            />
            <div>
              <p
                className={`font-medium ${
                  darkMode ? 'text-red-100' : 'text-red-800'
                }`}
              >
                AI Service Connection Issue
              </p>
              <p
                className={`text-sm ${
                  darkMode ? 'text-red-300' : 'text-red-600'
                }`}
              >
                Some AI models may be unavailable. Trying alternative models...
              </p>
            </div>
          </div>
          <button
            onClick={handleRetryConnection}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-red-800 hover:bg-red-700'
                : 'bg-red-500 hover:bg-red-600'
            } text-white transition-all-300`}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div
        className={`flex items-center justify-between px-6 py-4 border-b ${
          darkMode ? 'border-white/10' : 'border-gray-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl ${
                darkMode ? 'bg-white/10' : 'bg-gray-100'
              }`}
            >
              <span className="font-medium">AI Pipeline</span>
            </div>
            <div
              className={`flex items-center gap-2 text-sm ${
                darkMode ? 'opacity-70' : 'opacity-60'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionError ? 'bg-red-500' : 'bg-green-500'
                } animate-pulse`}
              ></div>
              <span>{connectionError ? 'Limited' : 'Live'}</span>
            </div>
          </div>
          {currentModel && (
            <div
              className={`px-3 py-1 rounded-lg text-sm ${
                darkMode
                  ? 'bg-blue-900/30 text-blue-300'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              Model: {currentModel.split('/')[0]}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullScreen}
            className={`p-3 rounded-xl transition-all-300 ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-24 left-6 z-10 flex flex-col gap-3">
        <button
          onClick={handleRunFlow}
          disabled={isLoading || !prompt.trim()}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all-300 shadow-lg ${
            isLoading || !prompt.trim()
              ? darkMode
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gray-200 text-gray-400'
              : 'bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-105 hover:shadow-xl'
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
          disabled={isLoading || results.length === 0 || connectionError}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all-300 ${
            isLoading || results.length === 0 || connectionError
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

       <button
  onClick={handleAddNewResult}
  disabled={isLoading || !prompt.trim()}
  className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all-300 ${
    isLoading || !prompt.trim()
      ? darkMode ? 'bg-gray-700/50 text-gray-500' : 'bg-gray-200/50 text-gray-400'
      : darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-100'
  }`}
  title="Generate another AI response for comparison"
>
  <Plus className="w-5 h-5" />
  Add Node
</button>

        {/* Status */}
        <div
          className={`mt-4 px-4 py-2 rounded-xl text-sm ${
            darkMode ? 'bg-white/5' : 'bg-gray-100/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionError ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            ></div>
            <span
              className={connectionError ? 'text-yellow-400' : 'text-green-600'}
            >
              {results.length} Response{results.length !== 1 ? 's' : ''}
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
            className={`${
              darkMode ? 'bg-gray-800/90' : 'bg-white/90'
            } backdrop-blur-sm rounded-xl shadow-lg p-2`}
            showInteractive={true}
            style={{
              button: {
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                color: darkMode ? '#e5e7eb' : '#374151',
                border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
              },
            }}
          />
          <MiniMap
            position="bottom-left"
            className={`${
              darkMode ? 'bg-gray-800/90' : 'bg-white/90'
            } backdrop-blur-sm shadow-lg rounded-xl`}
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              if (node.type === 'input') return '#3b82f6';
              if (node.type === 'result')
                return connectionError ? '#ef4444' : '#10b981';
              return '#6b7280';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
