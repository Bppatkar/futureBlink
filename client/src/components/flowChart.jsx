import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { InputNode } from './InputNode';
import { ResultNode } from './ResultNode';
import { aiService } from '../services/api';
import { Play, Save, AlertCircle, CheckCircle } from 'lucide-react';

const nodeTypes = {
  input: InputNode,
  result: ResultNode,
};

export function FlowChart({ darkMode = false }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePromptChange = useCallback((value) => {
    setPrompt(value);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input-node'
          ? { ...node, data: { ...node.data, prompt: value } }
          : node
      )
    );
  }, []);

  const initialNodes = [
    {
      id: 'input-node',
      data: { prompt, isLoading, onPromptChange: handlePromptChange, darkMode },
      position: { x: 50, y: 50 },
      type: 'input',
    },
    {
      id: 'result-node',
      data: { result, isLoading, darkMode },
      position: { x: 450, y: 50 },
      type: 'result',
    },
  ];

  const initialEdges = [{
    id: 'e1-2',
    source: 'input-node',
    target: 'result-node',
    animated: true,
    style: { stroke: '#818cf8', strokeWidth: 2 },
  }];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleRunFlow = async () => {
    if (!prompt.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    setIsLoading(true);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'input-node' || node.id === 'result-node'
          ? { ...node, data: { ...node.data, isLoading: true } }
          : node
      )
    );

    try {
      const response = await aiService.generateResponse(prompt);

      if (response.success) {
        setResult(response.response);
        setNodes((nds) =>
          nds.map((node) =>
            node.id === 'result-node'
              ? { ...node, data: { ...node.data, result: response.response, isLoading: false } }
              : node.id === 'input-node'
              ? { ...node, data: { ...node.data, isLoading: false } }
              : node
          )
        );
        showNotification(`Response generated successfully`, 'success');
      } else {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === 'result-node'
              ? { ...node, data: { ...node.data, result: `Error: ${response.error}`, isLoading: false } }
              : node.id === 'input-node'
              ? { ...node, data: { ...node.data, isLoading: false } }
              : node
          )
        );
        showNotification(response.error, 'error');
      }
    } catch (error) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === 'result-node'
            ? { ...node, data: { ...node.data, result: 'Error: Unable to connect to AI service', isLoading: false } }
            : node.id === 'input-node'
            ? { ...node, data: { ...node.data, isLoading: false } }
            : node
        )
      );
      showNotification('Unable to connect to AI service', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prompt.trim() || !result.trim()) {
      showNotification('Please run flow first before saving', 'error');
      return;
    }

    try {
      await aiService.savePrompt(prompt, result);
      showNotification('Saved to database successfully!', 'success');
      // Clear inputs
      setPrompt('');
      setResult('');
      handlePromptChange('');
    } catch (error) {
      showNotification('Failed to save', 'error');
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      {notification && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg animate-fade-in ${
          notification.type === 'success'
            ? darkMode ? 'bg-green-900/80 border border-green-700' : 'bg-green-100 border border-green-300'
            : darkMode ? 'bg-red-900/80 border border-red-700' : 'bg-red-100 border border-red-300'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          ) : (
            <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          )}
          <span className={notification.type === 'success'
            ? darkMode ? 'text-green-300' : 'text-green-800'
            : darkMode ? 'text-red-300' : 'text-red-800'
          }>
            {notification.message}
          </span>
        </div>
      )}

      {/* Flow Area */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          style={{ width: '100%', height: '100%' }}
        >
          <Background color={darkMode ? '#374151' : '#e5e7eb'} gap={20} />
          <Controls className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`} />
          <MiniMap className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`} />
        </ReactFlow>
      </div>

      {/* Controls */}
      <div className={`mt-6 p-6 rounded-2xl ${
        darkMode ? 'bg-gray-800/50' : 'bg-white/80'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Workflow Controls
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enter your prompt, generate AI responses in real-time, and save to history
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleRunFlow}
              disabled={isLoading || !prompt.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isLoading ? 'Processing...' : 'Run Flow'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isLoading || !result.trim()}
              className="btn-secondary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className={`text-center p-3 rounded-xl ${
            darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Prompt
            </div>
            <div className="font-bold text-lg">{prompt.length} chars</div>
          </div>
          <div className={`text-center p-3 rounded-xl ${
            darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Response
            </div>
            <div className="font-bold text-lg">{result.length} chars</div>
          </div>
          <div className={`text-center p-3 rounded-xl ${
            darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Status
            </div>
            <div className={`font-bold text-lg ${
              isLoading ? 'text-yellow-500' : result ? 'text-green-500' : 'text-gray-400'
            }`}>
              {isLoading ? 'Processing' : result ? 'Ready' : 'Idle'}
            </div>
          </div>
          <div className={`text-center p-3 rounded-xl ${
            darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Words
            </div>
            <div className="font-bold text-lg">{prompt.split(/\s+/).filter(w => w.length > 0).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}