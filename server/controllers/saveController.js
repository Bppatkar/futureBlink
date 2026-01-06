import Prompt from '../models/PromptSchema.js';

export const savePromptResponse = async (req, res) => {
  try {
    const { prompt, response } = req.body;

    if (!prompt || !response) {
      return res.status(400).json({
        error: 'Prompt and response are required',
        success: false,
      });
    }

    const newPrompt = new Prompt({
      prompt: prompt.trim(),
      response: response.trim(),
      timestamp: new Date(),
    });

    const savedPrompt = await newPrompt.save();

    return res.status(201).json({
      success: true,
      message: 'Prompt saved successfully',
      data: savedPrompt,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to save prompt to database',
      success: false,
    });
  }
};

export const getAllPrompts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prompts = await Prompt.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Prompt.countDocuments();

    return res.status(200).json({
      success: true,
      data: prompts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch prompts',
      success: false,
    });
  }
};

export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPrompt = await Prompt.findByIdAndDelete(id);

    if (!deletedPrompt) {
      return res.status(404).json({
        error: 'Prompt not found',
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Prompt deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to delete prompt',
      success: false,
    });
  }
};

export default {
  savePromptResponse,
  getAllPrompts,
  deletePrompt,
};