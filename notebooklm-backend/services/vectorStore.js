import weaviate from 'weaviate-ts-client';
import dotenv from 'dotenv';
import { chunkText } from '../utils/chunkText.js';
import { getEmbedding } from './openaiService.js';
dotenv.config();

const host = (process.env.WEAVIATE_CLUSTER_URL || '').replace(/^https?:\/\//, '');
export const client = weaviate.client({
  scheme: 'https',
  host,
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
});

// check connectivity
export async function checkWeaviateConnection(timeoutMs = 3000) {
  try {
    await client.misc.liveChecker().do({ timeout: timeoutMs });
    return true;
  } catch (err) {
    console.error('Weaviate connection failed:', err.message || err);
    throw new Error('Weaviate unavailable');
  }
}

export async function ensureSchema() {
  const schema = await client.schema.getter().do();
  if (schema?.classes?.some(c => c.class === 'PDFChunk')) return;

  await client.schema.classCreator().withClass({
    class: 'PDFChunk',
    description: 'PDF text chunks with page metadata',
    vectorizer: 'none', 
    properties: [
      { name: 'pdfId', dataType: ['string'] },
      { name: 'page', dataType: ['int'] },
      { name: 'text', dataType: ['text'] }
    ]
  }).do();
  console.log('Created class PDFChunk in Weaviate');
}

export async function storeVectors(pages, chunkFn = chunkText, embedFn = getEmbedding) {
  if (!Array.isArray(pages) || pages.length === 0) throw new Error('No pages to store');

  await ensureSchema();
  const pdfId = Date.now().toString();

  for (const { page, text } of pages) {
    const chunks = chunkFn(text, 200); 

    const batchSize = 8;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const slice = chunks.slice(i, i + batchSize);
      const embeddings = await Promise.all(slice.map(c => embedFn(c)));
      const creations = slice.map((chunkText, idx) => {
        return client.data.creator()
          .withClassName('PDFChunk')
          .withProperties({ pdfId, page, text: chunkText })
          .withVector(embeddings[idx])
          .do();
      });
      await Promise.all(creations);
    }
  }

  return pdfId;
}

export async function queryVectors(pdfId, questionEmbedding, topK = 4) {
  const res = await client.graphql.get()
    .withClassName('PDFChunk')
    .withFields('text page _additional { distance }')
    .withWhere({ path: ['pdfId'], operator: 'Equal', valueString: pdfId })
    .withNearVector({ vector: questionEmbedding })
    .withLimit(topK)
    .do();

  const hits = res?.data?.Get?.PDFChunk || res?.Get?.PDFChunk || [];
  return (hits || []).map(h => ({
    text: h.text,
    page: h.page,
    score: h._additional?.distance ?? null
  }));
}
