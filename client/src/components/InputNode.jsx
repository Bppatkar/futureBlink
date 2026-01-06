import { Handle, Position } from '@xyflow/react';
import { Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function InputNode({ data }) {
  const [localPrompt, setLocalPrompt] = useState(data.prompt || '');

  useEffect(() => {
    setLocalPrompt(data.prompt || '');
  }, [data.prompt]);

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalPrompt(value);
    if (data.onPromptChange) {
      data.onPromptChange(value);
    }
  };

  return (
    <div className={`node-box min-w-[300px] max-w-[350px] ${
      data.darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } border rounded-2xl p-4 shadow-lg`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${
          data.darkMode
            ? 'bg-blue-900/30'
            : 'bg-blue-100'
        }`}>
          <Edit3 className={`w-5 h-5 ${
            data.darkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        <div>
          <h3 className={`font-bold ${
            data.darkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Input Prompt
          </h3>
          <p className={`text-sm ${
            data.darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Type your question
          </p>
        </div>
      </div>

      <div className="mb-3">
        <textarea
          value={localPrompt}
          onChange={handleChange}
          placeholder="Enter your prompt here..."
          className={`w-full p-3 rounded-lg border transition-all resize-none min-h-[100px] ${
            data.darkMode
              ? 'bg-gray-900/50 border-gray-700 text-gray-100 placeholder-gray-500'
              : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
          }`}
          disabled={data.isLoading}
          maxLength={500}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={data.darkMode ? 'text-gray-400' : 'text-gray-500'}>
          {localPrompt.length}/500
        </span>
        <span className={data.darkMode ? 'text-gray-500' : 'text-gray-400'}>
          Press Run Flow
        </span>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}