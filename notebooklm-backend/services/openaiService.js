
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

export async function createChatCompletion(messages, opts = {}) {
    const response = await client.chat.completions.create({
        model: opts.model || 'gpt-4o-mini',
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 512
    });tent;

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
