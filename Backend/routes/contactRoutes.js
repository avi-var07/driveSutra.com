import express from 'express';
import { sendContactMessage } from '../controllers/contactController.js';

const router = express.Router();

// Send contact form message
router.post('/send-message', sendContactMessage);

export default router;