// services/ragPipeline.js
import { getEmbedding, createChatCompletion } from './openaiService.js';
import { queryVectors } from './vectorStore.js';

/**
 * Retrieve top K chunks for pdfId and call OpenAI chat to answer.
 * Returns { answer: string, citations: [pageNumbers] }
 */
export async function retrieveAnswer(pdfId, question, opts = {}) {
  const topK = opts.topK || 4;

  // 1) embed question
  const qVec = await getEmbedding(question);

  // 2) query vector store
  const chunks = await queryVectors(pdfId, qVec, topK);
  if (!chunks || chunks.length === 0) {
    return { answer: "I couldn't find relevant information in the document.", citations: [] };
  }

  // 3) build context string (include page info)
  const context = chunks.map(c => `Page ${c.page}: ${c.text}`).join('\n\n---\n\n');

  // 4) ask model — instruct to answer only with context; ask to mention pages in answer
  const system = `You are an assistant that answers strictly from the provided context. If the answer cannot be found, say "I don't know." Provide short, precise answers and, when you cite info, include the page numbers (e.g., "See page 3").`;

  const userPrompt =
`Context:
${context}

Question: ${question}
`;

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userPrompt }
  ];

  const answer = await createChatCompletion(messages, { temperature: 0.0, maxTokens: 500 });

  const citations = Array.from(new Set(chunks.map(c => c.page))).slice(0, 10);
  return { answer, citations };
}
