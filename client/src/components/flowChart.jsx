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

const nodeTypes = {
  input: InputNode,
  result: ResultNode,
};

export function FlowChart() {
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
      data: {
        prompt: prompt,
        isLoading: isLoading,
        onPromptChange: handlePromptChange,
      },
      position: { x: 50, y: 50 },
      type: 'input',
    },
    {
      id: 'result-node',
      data: {
        result: result,
        isLoading: isLoading,
      },
      position: { x: 450, y: 50 },
      type: 'result',
    },
  ];

  const initialEdges = [
    {
      id: 'e1-2',
      source: 'input-node',
      target: 'result-node',
      animated: true,
      style: { stroke: '#818cf8', strokeWidth: 2 },
    },
  ];

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
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    result: response.response,
                    isLoading: false,
                  },
                }
              : node.id === 'input-node'
              ? { ...node, data: { ...node.data, isLoading: false } }
              : node
          )
        );
        showNotification('Response generated successfully!', 'success');
      } else {
        // Handle API error (rate limit, timeout, etc.)
        setNodes((nds) =>
          nds.map((node) =>
            node.id === 'result-node'
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    result: `Error: ${response.error}`,
                    isLoading: false,
                  },
                }
              : node.id === 'input-node'
              ? { ...node, data: { ...node.data, isLoading: false } }
              : node
          )
        );
        showNotification(response.error, 'error');
      }
    } catch (error) {
      // Network error or server down
      setNodes((nds) =>
        nds.map((node) =>
          node.id === 'result-node'
            ? {
                ...node,
                data: {
                  ...node.data,
                  result: 'Error: Unable to connect to AI service',
                  isLoading: false,
                },
              }
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
      await aiService.savePromptResponse(prompt, result);
      showNotification('Saved to database successfully!', 'success');
    } catch (error) {
      showNotification('Failed to save', 'error');
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {notification && (
        <div
          className={`m-4 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-100 border border-green-300'
              : 'bg-red-100 border border-red-300'
          }`}
        >
          <span
            className={
              notification.type === 'success'
                ? 'text-green-800'
                : 'text-red-800'
            }
          >
            {notification.message}
          </span>
        </div>
      )}

      <div
        className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden glass-effect border-2 border-white/50"
        style={{
          height: '500px',
        }}
      >
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
          <Background color="#c7d2e0" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      <div className="mx-4 mb-4 p-6 rounded-2xl shadow-lg bg-white/80">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Enter your prompt above, click "Run Flow" to generate a response,
              then save it to the database.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleRunFlow}
              disabled={isLoading}
              className="button-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
            >
              {isLoading ? 'Processing...' : 'Run Flow'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !result}
              className="button-secondary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
            >
              Save to Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
