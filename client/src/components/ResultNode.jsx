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
    <div className={`node-box min-w-[300px] max-w-[350px] ${
      data.darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } border rounded-2xl p-4 shadow-lg`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${
          data.darkMode
            ? 'bg-purple-900/30'
            : 'bg-purple-100'
        }`}>
          <Sparkles className={`w-5 h-5 ${
            data.darkMode ? 'text-purple-400' : 'text-purple-600'
          }`} />
        </div>
        <div>
          <h3 className={`font-bold ${
            data.darkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            AI Response
          </h3>
          <p className={`text-sm ${
            data.darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Generated answer
          </p>
        </div>
      </div>

      <div className="mb-3">
        {data.isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[100px]">
            <div className="loading-pulse"></div>
            <p className="mt-2 text-sm text-gray-500">Generating response...</p>
          </div>
        ) : data.result ? (
          <>
            <div className={`p-3 rounded-lg min-h-[100px] max-h-[200px] overflow-y-auto ${
              data.darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">
                {data.result}
              </pre>
            </div>
            <button
              onClick={handleCopy}
              className={`mt-2 flex items-center gap-1 text-sm ${
                data.darkMode 
                  ? 'text-purple-400 hover:text-purple-300' 
                  : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[100px] text-gray-400">
            <p>Run flow to see response</p>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} />
    </div>
  );
}