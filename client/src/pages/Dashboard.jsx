import { useState, useEffect } from 'react';
import { FlowChart } from '../components/FlowChart';
import { aiService } from '../services/api';
import { Trash2, RefreshCw, MessageSquare, Eye, EyeOff } from 'lucide-react';

export default function Dashboard() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedPromptId, setExpandedPromptId] = useState(null);

  const fetchPrompts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await aiService.getAllPrompts(page);
      setPrompts(response.data || []);
      setTotalPages(response.pagination?.total_pages || 1);
    } catch (error) {
      // Error is handled silently - no console logs
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
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = (id) => {
    setExpandedPromptId(expandedPromptId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass-effect p-6 rounded-2xl shadow-lg">
          <h1 className="gradient-text text-3xl md:text-4xl font-bold mb-2">
            FutureBlink AI Flow
          </h1>
          <p className="text-gray-600">
            Generate intelligent responses powered by OpenRouter AI
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-2xl shadow-lg overflow-hidden" style={{ height: '700px' }}>
            <FlowChart />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-effect rounded-2xl shadow-lg p-6 h-full flex flex-col" style={{ height: '700px' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">History</h2>
              <button
                onClick={() => fetchPrompts(currentPage)}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="loading-spinner" />
                </div>
              ) : prompts.length === 0 ? (
                <div className="text-center py-12 h-full flex flex-col items-center justify-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500">No prompts saved yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Run a flow and click "Save to Database"
                  </p>
                </div>
              ) : (
                <div className="space-y-4 h-full overflow-y-auto pr-2">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt._id}
                      className="bg-white/60 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-sm text-gray-500">
                          {formatDate(prompt.createdAt)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleExpand(prompt._id)}
                            className="text-indigo-500 hover:text-indigo-600 p-1"
                            title={expandedPromptId === prompt._id ? "Show less" : "Show more"}
                          >
                            {expandedPromptId === prompt._id ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(prompt._id)}
                            className="text-red-500 hover:text-red-600 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Prompt:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {prompt.prompt}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Response:</p>
                        <div className={`bg-gray-50 p-3 rounded ${expandedPromptId === prompt._id ? '' : 'max-h-32 overflow-hidden'}`}>
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                            {prompt.response}
                          </pre>
                          {!expandedPromptId === prompt._id && prompt.response.length > 200 && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/90 to-transparent" />
                          )}
                        </div>
                        
                        {!expandedPromptId === prompt._id && prompt.response.length > 200 && (
                          <button
                            onClick={() => toggleExpand(prompt._id)}
                            className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            Show full response
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                          {prompt.model || 'AI Model'}
                        </span>
                        <div className="text-xs text-gray-400">
                          {prompt.processing_time_ms || 0}ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}