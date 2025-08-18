import { parseWithLlamaCloud } from '../services/llamaparseService.js';
import { createChatSuggestions, getEmbedding } from '../services/openaiService.js';
import { storeVectors } from '../services/vectorStore.js';
import { chunkText } from '../utils/chunkText.js';

export async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(415).json({ error: 'Only PDF files are supported.' });
    }

    const parsedPages = await parseWithLlamaCloud(req.file.buffer, req.file.originalname, {
      resultType: 'markdown',
      pageSeparator: '\n===PAGE {pageNumber}===\n'
    });

    if (!parsedPages || parsedPages.length === 0) {
      return res.status(422).json({ error: 'Parsing returned no content.' });
    }

    const pdfId = await storeVectors(parsedPages, chunkText, getEmbedding);

    const suggestions = await getSuggestions(parsedPages);

    return res.status(200).json({ message: 'Uploaded and indexed', pdfId, suggestions });
  } catch (err) {
    console.error('UploadController error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}

const getSuggestions = async (data) => {
  const contextArray = data.map(c => ({
    page: c.page,
    text: c.text
  }));

  const contextJSON = JSON.stringify(contextArray, null, 2);

  const system = `
You are an assistant that only uses the given context to generate suggestions.
Based on the provided context, suggest 3 relevant questions that someone might ask.
Return a JSON array of exactly 3 objects, each with:
- "question": A clear and concise question.
- "mentionedPages": A list of page numbers (from the "page" field) that directly support the question.

Important rules:
- Only use page numbers that appear in the "page" field of the context.
- Do not guess or invent page numbers.
- If no pages support a question, use an empty array for "mentionedPages".
Format:
[
  {
    "question": "Your question here?",
    "mentionedPages": [1, 2]
  },
  {
    "question": "Another question?",
    "mentionedPages": []
  },
  ...
]
`;

  const userPrompt = `Context:\n${contextJSON}`;


  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userPrompt }
  ];

  const suggestions = await createChatSuggestions(messages, {
    temperature: 0.0,
    maxTokens: 5000
  });

  return suggestions;
};
