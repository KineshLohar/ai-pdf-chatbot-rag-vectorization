
import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getEmbedding(text) {
    if (!text || typeof text !== 'string') throw new Error('Invalid text for embedding');
    const resp = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
    });
    return resp.data[0].embedding;
}

export async function createChatSuggestions(messages, opts = {}) {
    const response = await client.chat.completions.create({
      model: opts.model || 'gpt-4o-mini',
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 5120
    });
  
    const rawContent = response.choices?.[0]?.message?.content ?? '';
  
    console.log("RAW CONTENT ON QUESTION SUGGESTION", rawContent);
  
    let suggestions = [];
  
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) {
        suggestions = parsed.map(q => ({
          question: q.question || '',
          mentionedPages: Array.isArray(q.mentionedPages) ? q.mentionedPages : []
        }));
      }
    } catch (e) {
      console.error("Failed to parse question suggestions:", e);
      // You may fallback here if needed
      throw new Error("Failed to parse question suggestions")
    }
  
    return suggestions;
  }
  

export async function createChatCompletion(messages, opts = {}) {
    const response = await client.chat.completions.create({
        model: opts.model || 'gpt-4o-mini',
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 5120
    });

    const rawContent = response.choices?.[0]?.message?.content ?? '';

    let answer = '';
    let mentionedPages = [];

    try {
        const parsed = JSON.parse(rawContent);
        answer = typeof parsed.answer === 'string' ? parsed.answer : String(parsed.answer ?? '');
        mentionedPages = Array.isArray(parsed.mentionedPages) ? parsed.mentionedPages : [];
    } catch {
        answer = String(rawContent);
        mentionedPages = [];
    }

    console.log("ANSWER AND mentionedPage", answer, mentionedPages);
    

    return { answer, mentionedPages };

}
