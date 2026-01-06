import express from 'express';
import {
  savePromptResponse,
  getAllPrompts,
  deletePrompt,
} from '../controllers/saveController.js';

const router = express.Router();

router.post('/save', savePromptResponse);
router.get('/prompts', getAllPrompts);
router.delete('/prompts/:id', deletePrompt);

export default router;