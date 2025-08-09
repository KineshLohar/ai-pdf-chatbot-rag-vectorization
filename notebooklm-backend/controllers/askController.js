
import { retrieveAnswer } from '../services/ragPipeline.js';

export async function handleAsk(req, res) {
  try {
    const { pdfId, question } = req.body;
    if (!pdfId || !question) {
      return res.status(400).json({ error: 'Missing pdfId or question' });
    }

    const result = await retrieveAnswer(pdfId, question, { topK: 4 });
    return res.status(200).json(result);
  } catch (err) {
    console.error('AskController error:', err);
    return res.status(500).json({ error: err.message || 'Ask failed' });
  }
}
