import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiService = {
  generateResponse: async (prompt) => {
    try {
      const response = await api.post('/ask-ai', { prompt });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllPrompts: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/prompts', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePrompt: async (id) => {
    try {
      const response = await api.delete(`/prompts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  savePrompt: async (prompt, response) => {
    try {
      const result = await api.post('/save', { prompt, response });
      return result.data;
    } catch (error) {
      throw error;
    }
  }
};

export default aiService;