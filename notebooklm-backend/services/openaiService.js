// services/openaiService.js
import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Create embedding for a single text.
 * Uses text-embedding-3-small (recommended).
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== 'string') throw new Error('Invalid text for embedding');
  const resp = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return resp.data[0].embedding;
}

/**
 * Ask completion using chat model with context.
 * messages: array of chat messages [{role, content}, ...]
 */
export async function createChatCompletion(messages, opts = {}) {
  const response = await client.chat.completions.create({
    model: opts.model || 'gpt-3.5-turbo',
    messages,
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens ?? 512
  });
  const content = response.choices?.[0]?.message?.content ?? '';
  return content;
}
