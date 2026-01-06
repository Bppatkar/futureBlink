import { Handle, Position } from '@xyflow/react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ResultNode({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.result || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="node-box min-w-[350px] max-w-[400px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">AI Response</h3>
          <p className="text-sm text-gray-500">Generated answer</p>
        </div>
      </div>

      <div className="relative">
        {data.isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[120px] gap-3">
            <div className="loading-spinner" />
            <p className="text-sm text-gray-500">Generating response...</p>
          </div>
        ) : data.result ? (
          <>
            <div className="bg-gray-50 rounded-xl p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
              <div className="whitespace-pre-wrap text-gray-700 text-sm">
                {data.result}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="mt-3 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy response
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[120px] text-gray-400">
            <p className="text-center">Run flow to see AI response</p>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} />
    </div>
  );
}