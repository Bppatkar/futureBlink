import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const aiService = {
  generateResponse: async (prompt) => {
    try {
      console.log('Sending to:', `${API_BASE_URL}/ask-ai`);
      const response = await axios.post(
        `${API_BASE_URL}/ask-ai`,
        {
          prompt: prompt.trim(),
          timestamp: new Date().toISOString(),
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Backend Response:', response.data);

      if (response.data && response.data.success === true) {
        return {
          success: true,
          response: response.data.response,
          model: response.data.model || 'Unknown',
          processing_time_ms: response.data.processing_time_ms,
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Invalid response from server',
          data: response.data,
        };
      }
    } catch (error) {
      console.error('API Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timeout - AI service is taking too long',
        };
      }

      if (!error.response) {
        return {
          success: false,
          error: 'Network error - Check backend server',
        };
      }

      const errorData = error.response.data;
      return {
        success: false,
        error:
          errorData?.error ||
          errorData?.message ||
          `Server error (${error.response.status})`,
        status: error.response.status,
        details: errorData,
      };
    }
  },

  savePrompt: async (prompt, response) => {
    try {
      console.log('Saving to database...');
      const result = await axios.post(`${API_BASE_URL}/save`, {
        prompt: prompt.trim(),
        response: response.trim(),
        timestamp: new Date().toISOString(),
      });
      console.log('Save successful:', result.data);
      return result.data;
    } catch (error) {
      console.error('Save Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllPrompts: async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/prompts?page=${page}&limit=10`
      );
      return response.data;
    } catch (error) {
      console.error(
        'Fetch History Error:',
        error.response?.data || error.message
      );
      return { data: [], pagination: { total_pages: 1 } };
    }
  },

  deletePrompt: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/prompts/${id}`);
    } catch (error) {
      console.error('Delete Error:', error);
      throw error;
    }
  },
};
