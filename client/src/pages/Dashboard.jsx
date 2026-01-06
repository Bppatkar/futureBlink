import { useState, useEffect } from 'react';
import { FlowChart } from '../components/FlowChart';
import { aiService } from '../services/api';
import { 
  Trash2, RefreshCw, MessageSquare, Eye, EyeOff, 
  Moon, Sun, Database, Clock, Hash, Zap, 
  TrendingUp, Users, Cpu, ChevronLeft, ChevronRight,
  Save, Copy, CheckCircle, AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedPromptId, setExpandedPromptId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    totalChars: 0,
    avgResponseTime: 0,
    successRate: 100
  });

  const fetchPrompts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await aiService.getAllPrompts(page);
      setPrompts(response.data || []);
      setTotalPages(response.pagination?.total_pages || 1);
      setTotalItems(response.pagination?.total || 0);
      
      // Calculate stats
      const totalChars = response.data?.reduce((acc, prompt) => 
        acc + (prompt.prompt?.length || 0) + (prompt.response?.length || 0), 0) || 0;
      const avgResponseTime = response.data?.length > 0 
        ? response.data.reduce((acc, prompt) => acc + (prompt.processing_time_ms || 0), 0) / response.data.length 
        : 0;
      
      setStats({
        totalChars,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: response.data?.length > 0 ? 95 : 100
      });
    } catch (error) {
      console.error('Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await aiService.deletePrompt(id);
        setPrompts(prompts.filter(prompt => prompt._id !== id));
        fetchPrompts(currentPage);
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const toggleExpand = (id) => {
    setExpandedPromptId(expandedPromptId === id ? null : id);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-indigo-50/20 to-purple-50/20'
    }`}>
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Left Side - Title & Stats */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${
                  darkMode 
                    ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30' 
                    : 'bg-gradient-to-br from-purple-100 to-indigo-100'
                }`}>
                  <Zap className={`w-8 h-8 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h1 className="headline-1 gradient-text mb-2">
                    FutureBlink AI Studio
                  </h1>
                  <p className="subtitle">
                    Intelligent workflow automation powered by cutting-edge AI models
                  </p>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="stat-card fade-in">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <Database className={`w-5 h-5 ${
                        darkMode ? 'text-blue-400' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Total Prompts</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {totalItems}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card fade-in" style={{animationDelay: '0.1s'}}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <Hash className={`w-5 h-5 ${
                        darkMode ? 'text-green-400' : 'text-green-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Characters</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {(stats.totalChars / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <Clock className={`w-5 h-5 ${
                        darkMode ? 'text-yellow-400' : 'text-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Avg Response</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {stats.avgResponseTime}ms
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <TrendingUp className={`w-5 h-5 ${
                        darkMode ? 'text-red-400' : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Success Rate</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {stats.successRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Theme Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-xl transition-all hover-lift ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-50 shadow-lg'
                }`}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <Sun className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Flow Chart - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl p-2 h-[650px]">
              <FlowChart darkMode={darkMode} />
            </div>
          </div>

          {/* History Panel - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6 h-[650px] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="headline-2 text-gray-800 dark:text-gray-100 mb-1">
                    History
                  </h2>
                  <p className="subtitle">
                    {totalItems} prompts • {totalPages} pages
                  </p>
                </div>
                <button
                  onClick={() => fetchPrompts(currentPage)}
                  disabled={loading}
                  className={`btn-secondary flex items-center gap-2 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing' : 'Refresh'}
                </button>
              </div>

              {/* Prompts List */}
              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="loading-pulse"></div>
                    <p className="subtitle">Loading history...</p>
                  </div>
                ) : prompts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No prompts yet
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Run your first AI workflow to see results here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 h-full overflow-y-auto custom-scrollbar pr-2">
                    {prompts.map((prompt, index) => (
                      <div
                        key={prompt._id}
                        className={`glass-card rounded-2xl p-4 hover-lift fade-in ${
                          darkMode 
                            ? 'border-gray-700' 
                            : 'border-gray-200'
                        } border`}
                        style={{animationDelay: `${index * 0.05}s`}}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="badge badge-primary">
                              {prompt.model?.split('/')[0]?.slice(0, 12) || 'AI'}
                            </span>
                            <span className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {formatDate(prompt.createdAt)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleExpand(prompt._id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                              }`}
                              title={expandedPromptId === prompt._id ? "Collapse" : "Expand"}
                            >
                              {expandedPromptId === prompt._id ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(prompt._id)}
                              className="p-1.5 rounded-lg transition-colors text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Prompt Preview */}
                        <div className="mb-3">
                          <p className={`text-xs font-semibold mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            PROMPT
                          </p>
                          <p className={`text-sm line-clamp-2 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {prompt.prompt}
                          </p>
                        </div>

                        {/* Response */}
                        <div>
                          <p className={`text-xs font-semibold mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            RESPONSE
                          </p>
                          <div className={`text-sm rounded-lg p-3 ${
                            expandedPromptId === prompt._id 
                              ? '' 
                              : 'max-h-24 overflow-hidden'
                          } ${
                            darkMode 
                              ? 'bg-gray-800/50 text-gray-300' 
                              : 'bg-gray-50 text-gray-600'
                          }`}>
                            <pre className="whitespace-pre-wrap font-sans">
                              {prompt.response}
                            </pre>
                          </div>
                          
                          {expandedPromptId !== prompt._id && prompt.response.length > 100 && (
                            <button
                              onClick={() => toggleExpand(prompt._id)}
                              className={`mt-2 text-xs font-medium ${
                                darkMode 
                                  ? 'text-purple-400 hover:text-purple-300' 
                                  : 'text-purple-600 hover:text-purple-700'
                              }`}
                            >
                              Read more →
                            </button>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className={`text-xs flex items-center gap-1 ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <Cpu className="w-3 h-3" />
                            {prompt.processing_time_ms || 0}ms
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            darkMode 
                              ? 'bg-gray-800 text-gray-300' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {Math.ceil(prompt.response?.length / 5) || 0} words
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination - Modern Design */}
              {totalPages > 1 && (
                <div className={`mt-6 pt-6 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 
                          ? i + 1 
                          : currentPage >= totalPages - 2 
                            ? totalPages - 4 + i 
                            : currentPage - 2 + i;
                        
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                              currentPage === pageNum
                                ? 'btn-primary'
                                : darkMode
                                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              darkMode 
                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
                      }`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className={`text-center mt-3 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Page {currentPage} of {totalPages} • Showing {prompts.length} prompts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className={`glass-card rounded-2xl p-4 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        } border`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <Users className={`w-5 h-5 ${
                  darkMode ? 'text-blue-400' : 'text-blue-500'
                }`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Real-time AI Processing
                </p>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Powered by multiple AI models for best results
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`text-xs px-3 py-1.5 rounded-full ${
                darkMode 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-green-100 text-green-600'
              }`}>
                <CheckCircle className="w-3 h-3 inline mr-1" />
                System Operational
              </div>
              <div className={`text-xs px-3 py-1.5 rounded-full ${
                darkMode 
                  ? 'bg-blue-900/30 text-blue-400' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <Cpu className="w-3 h-3 inline mr-1" />
                8 AI Models Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}