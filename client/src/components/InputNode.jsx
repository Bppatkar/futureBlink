import { Handle, Position } from '@xyflow/react';
import { Edit3, Send, Mic, Zap, Image } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function InputNode({ data }) {
  const [localPrompt, setLocalPrompt] = useState(data.prompt || '');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setLocalPrompt(data.prompt || '');
  }, [data.prompt]);

  const handleChange = (e) => {
    const value = e.target.value.slice(0, 500);
    setLocalPrompt(value);
    if (data.onPromptChange) {
      data.onPromptChange(value);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleGenerate = () => {
    if (localPrompt.trim() && !data.isLoading && data.onGenerate) {
      data.onGenerate();
    }
  };

  const characterPercentage = (localPrompt.length / 500) * 100;

  return (
    <div className={`min-w-[500px] rounded-2xl p-6 shadow-2xl transition-all-300 ${
      data.darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-white to-gray-50'
    } ${isFocused ? 'scale-[1.02]' : ''} border ${isFocused ? 'border-blue-500/50' : 'border-white/10'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          
          <div>
            <h3 className="font-bold text-xl">Your Question</h3>
            <p className="text-sm opacity-70 mt-1">Ask anything about AI, technology, or coding</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className={`p-2 rounded-lg transition-all-300 ${
            data.darkMode 
              ? 'hover:bg-white/10' 
              : 'hover:bg-gray-100'
          }`} title="Voice Input">
            <Mic className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-lg transition-all-300 ${
            data.darkMode 
              ? 'hover:bg-white/10' 
              : 'hover:bg-gray-100'
          }`} title="Attach Image">
            <Image className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative mb-4">
        <textarea
          ref={textareaRef}
          value={localPrompt}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="What would you like to know? (e.g., 'Explain quantum computing in simple terms')"
          className={`w-full p-4 rounded-xl border transition-all-300 resize-none min-h-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            data.darkMode
              ? 'bg-gray-900/50 border-gray-700 text-gray-100 placeholder-gray-500'
              : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
          }`}
          disabled={data.isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) {
              // Allow new line with Shift+Enter
              return;
            }
            if (e.key === 'Enter' && localPrompt.trim() && !data.isLoading) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
        
        {/* Character Progress */}
        <div className={`absolute -bottom-2 left-0 right-0 h-1 rounded-full overflow-hidden ${
          data.darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className={`h-full transition-all duration-300 ${
              characterPercentage >= 90 
                ? 'bg-gradient-to-r from-red-500 to-pink-600' 
                : characterPercentage >= 70
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}
            style={{ width: `${characterPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-lg font-medium ${
            characterPercentage >= 90 
              ? 'bg-red-500/20 text-red-300' 
              : characterPercentage >= 70
              ? 'bg-yellow-500/20 text-yellow-300'
              : data.darkMode 
                ? 'bg-blue-500/20 text-blue-300' 
                : 'bg-blue-100 text-blue-700'
          }`}>
            {localPrompt.length}/500
          </div>
          
          <div className="text-sm opacity-70 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Press Enter to generate</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`text-sm px-3 py-1.5 rounded-lg ${
            data.darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
          }`}>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Ready</span>
            </span>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!localPrompt.trim() || data.isLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all-300 ${
              localPrompt.trim() && !data.isLoading
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : data.darkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
            Generate
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-sm opacity-70 mb-2">Quick prompts:</p>
        <div className="flex flex-wrap gap-2">
          {['Future of AI', 'Code review', 'Tech trends', 'Explain ML'].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setLocalPrompt(prompt);
                if (data.onPromptChange) data.onPromptChange(prompt);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all-300 ${
                data.darkMode 
                  ? 'bg-white/5 hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-gradient-to-r !from-blue-500 !to-purple-600 !w-3 !h-3 !border-2 !border-white" 
      />
    </div>
  );
}