import { Handle, Position } from '@xyflow/react';
import {
  Sparkles,
  Copy,
  Check,
  Zap,
  Brain,
  Clock,
  Hash,
  AlertCircle,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { parseMarkdown } from '../utils/markdownParser';

export function ResultNode({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.result || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWordCount = (text) => (text ? text.split(/\s+/).length : 0);
  const getCharCount = (text) => (text ? text.length : 0);

  const isError =
    data.result?.includes('Error:') ||
    data.result?.includes('Connection Error:');

  return (
    <div
      className={`min-w-125 max-w-200 ${
        data.darkMode
          ? 'bg-linear-to-br from-gray-900 to-gray-800'
          : 'bg-linear-to-br from-white to-gray-50'
      } rounded-2xl p-6 shadow-2xl border ${
        isError
          ? 'border-red-500/50'
          : data.darkMode
          ? 'border-white/10'
          : 'border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                isError
                  ? 'bg-linear-to-br from-red-500 to-red-600'
                  : data.darkMode
                  ? 'bg-linear-to-br from-green-500 to-emerald-600'
                  : 'bg-linear-to-br from-green-400 to-emerald-500'
              }`}
            >
              {isError ? (
                <AlertCircle className="w-6 h-6 text-white" />
              ) : (
                <Brain className="w-6 h-6 text-white" />
              )}
            </div>
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse ${
                data.isLoading
                  ? 'bg-blue-500'
                  : isError
                  ? 'bg-red-500'
                  : 'bg-green-500'
              }`}
            ></div>
          </div>

          <div>
            <h3
              className={`font-bold text-xl ${
                data.darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              {isError ? 'Error' : 'AI Response'}
            </h3>
            <div
              className={`flex items-center gap-3 text-sm ${
                data.darkMode ? 'opacity-70' : 'opacity-70'
              }`}
            >
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span>{getWordCount(data.result)} words</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{getCharCount(data.result)} chars</span>
              </div>
              {data.model && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{data.model.split('/').pop()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.result && (
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all-300 ${
                copied
                  ? 'bg-linear-to-r from-green-500 to-emerald-600 text-white'
                  : data.darkMode
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-75">
        {data.isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="relative mb-6">
              <div
                className={`w-16 h-16 rounded-full border-4 border-transparent animate-spin ${
                  data.darkMode ? 'border-t-blue-500' : 'border-t-blue-600'
                }`}
              ></div>
            </div>
            <p
              className={`text-lg font-medium mb-2 ${
                data.darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              Generating Response
            </p>
            <p
              className={`text-sm ${
                data.darkMode ? 'opacity-70' : 'opacity-60'
              }`}
            >
              AI models are processing your request...
            </p>
            <div className="mt-4 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    data.darkMode ? 'bg-blue-500' : 'bg-blue-600'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        ) : data.result ? (
          <div
            className={`rounded-xl p-6 max-h-125 overflow-y-auto ${
              data.darkMode
                ? isError
                  ? 'bg-red-900/20'
                  : 'bg-gray-900/50'
                : isError
                ? 'bg-red-50'
                : 'bg-gray-50'
            } ${
              isError
                ? data.darkMode
                  ? 'border border-red-500/50'
                  : 'border border-red-200'
                : data.darkMode
                ? 'border border-gray-700'
                : 'border border-gray-200'
            }`}
          >
            {isError ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 ${
                      data.darkMode ? 'text-red-400' : 'text-red-600'
                    } mt-0.5 shrink-0`}
                  />
                  <div>
                    <p
                      className={`font-medium ${
                        data.darkMode ? 'text-red-300' : 'text-red-700'
                      }`}
                    >
                      AI Service Error
                    </p>
                    <p
                      className={`text-sm mt-1 whitespace-pre-wrap ${
                        data.darkMode ? 'text-red-200' : 'text-red-600'
                      }`}
                    >
                      {data.result
                        .replace(/^(Error:|Connection Error:)/, '')
                        .trim()}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    data.darkMode ? 'bg-gray-800/50' : 'bg-gray-200'
                  } text-sm`}
                >
                  <p
                    className={`font-medium mb-1 ${
                      data.darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    Troubleshooting:
                  </p>
                  <ul
                    className={`list-disc pl-5 space-y-1 ${
                      data.darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    <li>Check if backend server is running on port 5000</li>
                    <li>Verify OpenRouter API key is configured</li>
                    <li>Try a different prompt</li>
                    <li>Check browser console for detailed errors</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdown(data.result, data.darkMode),
                  }}
                />

                {/* AI Signature */}
                <div
                  className={`mt-6 pt-4 border-t ${
                    data.darkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      data.darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      Generated by FutureBlink AI •{' '}
                      {new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {data.model && (
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          data.darkMode
                            ? 'bg-gray-800/30 text-gray-400'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {data.model.split('/')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
                data.darkMode
                  ? 'bg-linear-to-br from-gray-800 to-gray-900'
                  : 'bg-linear-to-br from-gray-200 to-gray-300'
              }`}
            >
              <Zap
                className={`w-12 h-12 ${
                  data.darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
            </div>
            <p
              className={`text-xl font-medium mb-2 ${
                data.darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              No Response Yet
            </p>
            <p className={data.darkMode ? 'opacity-70' : 'opacity-60'}>
              Run the flow to generate an AI response
            </p>
            <div
              className={`flex items-center gap-2 text-sm ${
                data.darkMode ? 'opacity-50' : 'opacity-40'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Ready to process</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div
        className={`mt-4 pt-4 border-t ${
          data.darkMode ? 'border-gray-700' : 'border-gray-300'
        }`}
      >
        <div
          className={`flex items-center justify-between text-sm ${
            data.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  data.isLoading
                    ? 'bg-blue-500'
                    : isError
                    ? 'bg-red-500'
                    : 'bg-green-500'
                }`}
              ></div>
              <span>
                {data.isLoading
                  ? 'Processing'
                  : isError
                  ? 'Error'
                  : 'AI Active'}
              </span>
            </span>
            <span>•</span>
            <span>
              {data.connectionError
                ? 'Limited Availability'
                : 'Streaming enabled'}
            </span>
          </div>
          {data.processing_time_ms && (
            <span
              className={`text-xs px-2 py-1 rounded ${
                data.darkMode ? 'bg-gray-800/30' : 'bg-gray-300'
              }`}
            >
              {data.processing_time_ms}ms
            </span>
          )}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="from-blue-500! to-purple-600! w-3! h-3! border-2! border-white"
      />
    </div>
  );
}
