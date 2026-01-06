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
    <div className="node-box min-w-[350px] max-w-[400px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
          <Edit3 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Input Prompt</h3>
          <p className="text-sm text-gray-500">Type your question here</p>
        </div>
      </div>

      <div className="relative mb-2">
        <textarea
          value={localPrompt}
          onChange={handleChange}
          placeholder="Enter your prompt here"
          className="input-field min-h-[120px] resize-none"
          disabled={data.isLoading}
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Press "Run Flow" to send
        </div>
        <div className="text-xs text-gray-400">
          {localPrompt.length}/500 chars
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}