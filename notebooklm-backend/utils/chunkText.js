// utils/chunkText.js
/**
 * Basic chunker that respects sentence boundaries and keeps chunk sizes around maxWords.
 * Returns array of chunk strings.
 */
export function chunkText(text, maxWords = 200) {
  if (!text) return [];
  // naive sentence split
  const sentences = text.match(/[^\\.\\!\\?]+[\\.\\!\\?]+|[^\\.\\!\\?]+$/g) || [text];
  const chunks = [];
  let current = '';

  for (const s of sentences) {
    const candidate = (current + ' ' + s).trim();
    if (candidate.split(/\s+/).length > maxWords) {
      if (current) {
        chunks.push(current.trim());
      }
      current = s;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}
