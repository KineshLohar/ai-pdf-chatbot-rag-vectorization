import { getEmbedding, createChatCompletion } from './openaiService.js';
import { queryVectors } from './vectorStore.js';

export async function retrieveAnswer(pdfId, question, opts = {}) {
  const topK = opts.topK || 4;

  const qVec = await getEmbedding(question);

  const chunks = await queryVectors(pdfId, qVec, topK);
  if (!chunks || chunks.length === 0) {
    return { answer: "I couldn't find relevant information in the document.", citations: [] };
  }

  const contextArray = chunks.map(c => ({
    page: c.page,
    text: c.text
  }));
  const contextJSON = JSON.stringify(contextArray, null, 2);

  console.log("CHUNKS", chunks, contextArray, contextJSON);
  
  const system = `
You are an assistant that answers only from the given context.
Return JSON in the exact format below:
{
  "answer": "<clear and short answer>",
  "mentionedPages": [list of page numbers from context that directly support the answer]
}
- Only use page numbers exactly as they appear in the "page" field of the context JSON.
- Never guess or invent page numbers.
- If no page supports the answer, leave mentionedPages empty.
`;

  const userPrompt = `Context:\n${contextJSON}\n\nQuestion: ${question}`;

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userPrompt }
  ];

  const { answer, mentionedPages } = await createChatCompletion(messages, { temperature: 0.0, maxTokens: 5000 });

  const citations = Array.from(new Set(mentionedPages)).filter(p => Number.isInteger(p));
  const mentionedPage = citations.length ? citations[0] : null;

  return { answer, citations, mentionedPage };
}
