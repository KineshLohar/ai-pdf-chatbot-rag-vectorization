// controllers/uploadController.js
import { parseWithLlamaCloud } from '../services/llamaparseService.js';
import { storeVectors } from '../services/vectorStore.js';
import { chunkText } from '../utils/chunkText.js';
import { getEmbedding } from '../services/openaiService.js';

export async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(415).json({ error: 'Only PDF files are supported.' });
    }

    // 1) Parse PDF with LlamaParse Cloud (async job + polling)
    const parsedPages = await parseWithLlamaCloud(req.file.buffer, req.file.originalname, {
      // optional: you can pass presets here
      resultType: 'markdown',
      pageSeparator: '\n===PAGE {pageNumber}===\n'
    });

    if (!parsedPages || parsedPages.length === 0) {
      return res.status(422).json({ error: 'Parsing returned no content.' });
    }

    // 2) Store chunks in vector DB (Weaviate) with page metadata
    // storeVectors accepts pages: [{page, text}, ...] and internally chunks & embeds
    const pdfId = await storeVectors(parsedPages, chunkText, getEmbedding);

    return res.status(200).json({ message: 'Uploaded and indexed', pdfId });
  } catch (err) {
    console.error('UploadController error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
