import { useState, useEffect } from 'react';
import { FlowChart } from '../components/FlowChart';
import { aiService } from '../services/api';
import { Moon, Sun, History, Zap, Cpu, Activity, X } from 'lucide-react';

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true); 
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [aiModels, setAiModels] = useState(8);
  const [systemStatus, setSystemStatus] = useState('optimal');

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await aiService.getAllPrompts(1);
      setHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const formatHistoryText = (text) => {
    if (!text) return '';
    
    return text
      .split('\n')
      .map((line) => {
        if (line.startsWith('# ')) {
          return `<h1 class="text-3xl font-bold mt-6 mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-700'}">${line.substring(2)}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold mt-5 mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}">${line.substring(3)}</h2>`;
        } else if (line.startsWith('### ')) {
          return `<h3 class="text-xl font-bold mt-4 mb-2 ${darkMode ? 'text-pink-400' : 'text-pink-700'}">${line.substring(4)}</h3>`;
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
          return `<div class="flex items-start mb-2 ml-4"><span class="${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-3 font-bold">•</span><span class="${darkMode ? 'text-gray-100' : 'text-gray-900'}">${line.substring(2)}</span></div>`;
        } else if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^\d+/)[0];
          const content = line.substring(line.indexOf('. ') + 2);
          return `<div class="flex items-start mb-2 ml-4"><span class="${darkMode ? 'text-purple-400' : 'text-purple-600'} mr-3 font-bold">${num}.</span><span class="${darkMode ? 'text-gray-100' : 'text-gray-900'}">${content}</span></div>`;
        } else if (line.trim()) {
          return `<p class="mb-4 leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-900'}">${line}</p>`;
        }
        return '';
      })
      .join('');
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'modern-gradient text-gray-100' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
    }`}>
      
      {/* Modern Header */}
      <div className="glass-effect border-b border-white/10">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold tracking-tight">FutureBlink AI</h1>
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <Activity className="w-3 h-3" />
                  <span>System {systemStatus}</span>
                  <span className="mx-1">•</span>
                  <Cpu className="w-3 h-3" />
                  <span>{aiModels} AI Models Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Stats Badge */}
              <div className={`px-4 py-2 rounded-xl ${
                darkMode 
                  ? 'bg-black/20 backdrop-blur-sm' 
                  : 'bg-white/50 backdrop-blur-sm'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{history.length}</div>
                    <div className="text-xs opacity-70">Prompts</div>
                  </div>
                  <div className="h-6 w-px bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold">∞</div>
                    <div className="text-xs opacity-70">Tokens</div>
                  </div>
                </div>
              </div>
              
              {/* History Button */}
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) fetchHistory();
                }}
                className={`group relative px-4 py-2 rounded-xl flex items-center gap-2 transition-all-300 ${
                  darkMode 
                    ? 'bg-white/10 hover:bg-white/20' 
                    : 'bg-white/80 hover:bg-white'
                } backdrop-blur-sm`}
              >
                <History className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">History</span>
                {showHistory && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                )}
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-xl transition-all-300 ${
                  darkMode 
                    ? 'bg-white/10 hover:bg-white/20' 
                    : 'bg-white/80 hover:bg-white'
                } backdrop-blur-sm`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform hover:rotate-12" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full h-[calc(100vh-84px)] p-4">
        {/* History Modal - Modern */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowHistory(false);
                setSelectedHistoryItem(null);
              }}
            ></div>
            
            {/* Selected Item Detailed View */}
            {selectedHistoryItem ? (
              <div className={`relative w-full max-w-2xl h-[calc(100vh-64px)] mr-4 rounded-2xl shadow-2xl animate-slide-in overflow-hidden flex flex-col ${
                darkMode ? 'glass-effect' : 'bg-white/90 backdrop-blur-sm'
              }`}>
                {/* Header */}
                <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedHistoryItem(null)}
                      className={`p-2 rounded-lg transition-all-300 ${
                        darkMode 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        setShowHistory(false);
                        setSelectedHistoryItem(null);
                      }}
                      className={`p-2 rounded-lg hover:bg-white/10 transition-all-300`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{selectedHistoryItem.prompt}</h2>
                  <p className={`text-sm ${darkMode ? 'opacity-70' : 'opacity-60'}`}>
                    {new Date(selectedHistoryItem.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-y-auto p-6 ${
                  darkMode ? 'bg-gray-900/30' : 'bg-gray-50'
                }`}>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formatHistoryText(selectedHistoryItem.response)
                    }}
                  />
                </div>
              </div>
            ) : (
              /* History List */
              <div className={`relative w-96 h-[calc(100vh-64px)] mr-4 rounded-2xl shadow-2xl animate-slide-in ${
                darkMode ? 'glass-effect' : 'bg-white/90 backdrop-blur-sm'
              }`}>
                <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">History</h2>
                    <button
                      onClick={() => setShowHistory(false)}
                      className={`p-2 rounded-lg hover:bg-white/10 transition-all-300`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className={`text-sm ${darkMode ? 'opacity-70' : 'opacity-60'} mt-1`}>Your previous conversations</p>
                </div>
                <div className={`p-4 overflow-y-auto h-[calc(100%-120px)]`}>
                  {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 animate-spin mb-4"></div>
                      <p className={darkMode ? 'opacity-70' : 'opacity-60'}>Loading history...</p>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <History className={`w-16 h-16 ${darkMode ? 'opacity-30' : 'opacity-20'} mb-4`} />
                      <p className={darkMode ? 'opacity-70' : 'opacity-60'}>No history yet</p>
                      <p className={`text-sm ${darkMode ? 'opacity-50' : 'opacity-40'} mt-1`}>Start a conversation to see history</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedHistoryItem(item)}
                          className={`w-full text-left p-4 rounded-xl transition-all-300 hover:scale-[1.02] ${
                            darkMode 
                              ? 'bg-white/5 hover:bg-white/10' 
                              : 'bg-white/50 hover:bg-white'
                          } backdrop-blur-sm border ${darkMode ? 'border-white/10' : 'border-gray-300'}`}
                        >
                          <div className="font-medium mb-2 line-clamp-1">{item.prompt}</div>
                          <div className={`text-sm line-clamp-2 ${darkMode ? 'opacity-70' : 'opacity-60'}`}>{item.response}</div>
                          <div className={`flex items-center justify-between mt-3 text-xs ${darkMode ? 'opacity-50' : 'opacity-40'}`}>
                            <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>{item.response?.length || 0} chars</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flow Chart - Modern Container */}
        <div className={`w-full h-full rounded-2xl overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80' 
            : 'bg-white/90'
        } backdrop-blur-sm shadow-2xl border ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
          <FlowChart darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}