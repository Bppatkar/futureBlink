import axios from 'axios';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function cleanAIResponse(text) {
  if (!text) return '';

  let cleaned = text;
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/&[a-z]+;/g, '');
  cleaned = cleaned.replace(/\\u003c/g, '');
  cleaned = cleaned.replace(/\\u003e/g, '');
  
  cleaned = cleaned.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n');
  
  return cleaned;
}

export const generateAIResponse = async (req, res) => {
  const startTime = Date.now();
  let timeoutId;
  let controller;

  logger.info('🚀 generateAIResponse called', {
    timestamp: new Date().toISOString(),
    promptLength: req.body.prompt?.length || 0,
    apiKeyConfigured: !!config.openrouterApiKey,
  });

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      logger.warn('❌ Invalid prompt received');
      return res.status(400).json({
        error: 'Prompt is required and cannot be empty',
        success: false,
      });
    }

    if (!config.openrouterApiKey) {
      logger.error('❌ OpenRouter API key not configured');
      return res.status(500).json({
        error: 'API key not configured',
        success: false,
      });
    }

    logger.info('✅ API key is configured');

    const models = [
      'mistralai/mistral-7b-instruct:free',
      'google/gemma-2-2b-it:free',
      'microsoft/phi-3.5-mini-instruct:free',
      'nousresearch/hermes-3-llama-3.1-8b:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'openchat/openchat-3.5-1210:free',
      'undi95/toppy-m-7b:free',
      'gryphe/mythomist-7b:free',
      'lizpreciatior/lzlv-70b-fp16-hf:free',
      'huggingfaceh4/zephyr-7b-beta:free',
      'rwkv/rwkv-5-world-3b:free',
      'jebcarter/psyfighter-13b:free',
    ];

    logger.info(`🔄 Trying ${models.length} models:`, { models });

    let lastError = null;
    let attemptCount = 0;

    for (const model of models) {
      attemptCount++;
      try {
        logger.info(`🔍 Attempt ${attemptCount}: Trying model "${model}"`);

        controller = new AbortController();
        timeoutId = setTimeout(() => {
          controller.abort();
          logger.warn(`⏰ Timeout for model: ${model}`);
        }, 15000); 

        const requestBody = {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt.trim(),
            },
          ],
          temperature: 0.7,
          max_tokens: 500, 
        };

        logger.debug('📤 Sending request to OpenRouter', {
          url: OPENROUTER_API_URL,
          model: model,
          headers: {
            Authorization: 'Bearer ***' + config.openrouterApiKey.slice(-4),
            'Content-Type': 'application/json',
            'HTTP-Referer': config.clientUrl,
          },
        });

        const response = await axios.post(OPENROUTER_API_URL, requestBody, {
          headers: {
            Authorization: `Bearer ${config.openrouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': config.clientUrl || 'http://localhost:5173',
            'X-Title': 'FutureBlink AI',
          },
          signal: controller.signal,
          timeout: 16000,
        });

        clearTimeout(timeoutId);

        logger.info(`✅ Model "${model}" responded successfully`, {
          status: response.status,
          statusText: response.statusText,
        });

        if (response.data?.choices?.[0]?.message?.content) {
          const rawResponse = response.data.choices[0].message.content;
          const cleanedResponse = cleanAIResponse(rawResponse);
          const processingTime = Date.now() - startTime;

          logger.info('🎉 AI Response generated successfully', {
            model: model,
            processingTime: `${processingTime}ms`,
            responseLength: cleanedResponse.length,
          });

          return res.status(200).json({
            success: true,
            response: cleanedResponse,
            model: model,
            processing_time_ms: processingTime,
          });
        } else {
          logger.warn(`⚠️ Model "${model}" returned no content`, {
            responseData: response.data,
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        logger.error(`❌ Model "${model}" failed`, {
          errorCode: error.code,
          errorMessage: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          attempt: attemptCount,
        });

        if (error.response?.status === 404) {
          logger.warn(`📛 Model "${model}" not found (404), trying next...`);
          continue;
        }

        if (error.response?.status === 429) {
          logger.warn(`🚦 Rate limited for model "${model}", trying next...`);
          continue;
        }

        if (error.code === 'ECONNABORTED') {
          logger.warn(`⏰ Timeout for model "${model}", trying next...`);
          continue;
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          logger.error('🌐 Network error - cannot reach OpenRouter');
          break; 
        }

        logger.warn(`⚠️ Unexpected error for model "${model}", trying next...`);
        continue;
      }
    }

    logger.error('💥 All models failed', {
      totalAttempts: attemptCount,
      lastError: lastError?.message,
      lastErrorCode: lastError?.code,
      lastErrorStatus: lastError?.response?.status,
    });

    const errorMessage =
      lastError?.response?.status === 404
        ? 'AI model not found. Please try different models.'
        : lastError?.message || 'All AI models are currently unavailable. Please try again in a few moments.';

    return res.status(500).json({
      error: errorMessage,
      success: false,
      details: lastError?.response?.data || 'No additional details',
    });
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);

    logger.error('💣 Unhandled error in generateAIResponse', {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'AI service is taking too long to respond',
        success: false,
      });
    }

    return res.status(500).json({
      error: 'Failed to generate AI response',
      success: false,
      details: error.message,
    });
  }
};

export default {
  generateAIResponse,
};