// services/llamaparseService.js
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();

const BASE = 'https://api.cloud.llamaindex.ai/api/v1';
const UPLOAD_ENDPOINT = `${BASE}/parsing/upload`;
const JOB_DETAILS = `${BASE}/parsing/job`; // GET /parsing/job/:job_id/details
const JOB_RESULT_MARKDOWN = (jobId) => `${BASE}/parsing/job/${jobId}/result/markdown`;
const JOB_RESULT_RAW_MD = (jobId) => `${BASE}/parsing/job/${jobId}/result/raw/markdown`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Uploads buffer to LlamaCloud LlamaParse, polls job, returns pages array:
 * [{ page: number, text: string }, ...]
 */
export async function parseWithLlamaCloud(buffer, filename = 'file.pdf', opts = {}) {
    if (!buffer || buffer.length === 0) throw new Error('Empty PDF buffer');

    const form = new FormData();
    form.append('file', buffer, { filename, contentType: 'application/pdf' });

    // Tell LlamaParse we want markdown and a distinct page separator with pageNumber token
    form.append('result_type', opts.resultType || 'markdown');
    // include a page separator that includes pageNumber to make splitting safer:
    form.append('page_separator', opts.pageSeparator || '\n===PAGE {pageNumber}===\n');

    const headers = {
        Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`,
        ...form.getHeaders()
    };
    console.log("SENDING FILE FOR UPLAOD");

    // Send upload
    const uploadResp = await axios.post(UPLOAD_ENDPOINT, form, { headers, maxContentLength: Infinity, maxBodyLength: Infinity });
    console.log("AFTERFILE UPLAOD", uploadResp);

    // The upload might return a job id or an immediate result. Try to extract a job id.
    const data = uploadResp.data || {};
    // Sometimes the API returns { job_id: '...' } or { id: '...' } or { job: { id: '...' } }
    const jobId = data.job_id || data.id || data.job?.id || data.file_id || data.job?.job_id;
    // If response already returns markdown text content in some field, return it immediately.
    // Check common places:
    if (!jobId && (data.result?.markdown || data.markdown || data.text || data.raw_markdown)) {
        const md = data.result?.markdown || data.markdown || data.raw_markdown || data.text;
        return parsePagesFromMarkdown(md, opts.pageSeparator || '\n===PAGE {pageNumber}===\n');
    }

    if (!jobId) {
        // If no job id, maybe the API accepted the file and created a file entry; try to find job via returned data (best-effort)
        throw new Error('LlamaParse: upload returned no job id. Response keys: ' + Object.keys(data).join(', '));
    }

    // Poll for job completion (timeout configurable)
    const timeoutMs = opts.timeoutMs || 12000; // default 2 minutes
    const start = Date.now();
    while (true) {
        // GET job details
        console.log("CHECKING JOB_DETAILS", JOB_DETAILS, jobId);

        const details = await axios.get(`${JOB_DETAILS}/${jobId}`, { headers }).then(r => r.data).catch(e => {
            // if 404 or other network blip, keep trying until timeout
            return null;
        });

        const status = details?.status || details?.job?.status || details?.state;
        console.log("JOB STATUS", details, status);

        // Accept multiple success tokens used by API
        if (status === 'completed' || status === 'SUCCESS' || status === 'succeeded' || status === 'finished') {
            break;
        }
        if (status === 'failed' || status === 'error') {
            throw new Error(`LlamaParse job failed (jobId=${jobId})`);
        }

        if (Date.now() - start > timeoutMs) {
            throw new Error(`LlamaParse job timeout after ${timeoutMs}ms (jobId=${jobId})`);
        }

        await sleep(5000); // poll interval
    }

    // Job finished — fetch the markdown result
    let mdBody;
    try {
        const mdResp = await axios.get(JOB_RESULT_MARKDOWN(jobId), { headers, responseType: 'text' });
        mdBody = mdResp.data;
    } catch (err) {
        // fallback to raw markdown endpoint
        const mdResp2 = await axios.get(JOB_RESULT_RAW_MD(jobId), { headers, responseType: 'text' });
        mdBody = mdResp2.data;
    }

    if (!mdBody) throw new Error('LlamaParse returned empty markdown result');

    // Convert markdown into pages
    return parsePagesFromMarkdown(mdBody, opts.pageSeparator || '\n===PAGE {pageNumber}===\n');
}

/**
 * Parse the returned markdown into page objects. We expect the separator contains "{pageNumber}"
 */
function parsePagesFromMarkdown(markdown, pageSeparatorToken = '\n===PAGE {pageNumber}===\n') {
    // pageSeparatorToken example: '\n===PAGE {pageNumber}===\n'
    // We'll split by '\n===PAGE ' and parse page number and content.
    const sepPrefix = pageSeparatorToken.split('{pageNumber}')[0]; // '\n===PAGE '
    const parts = markdown.split(sepPrefix); // first part may be header content before first sep

    const pages = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === 0 && !part.trim()) continue; // skip leading empty chunk
        // Try to detect pattern like: "3===\n<page content...>"
        const m = part.match(/^(\d+)===(?:\r?\n)?([\s\S]*)$/);
        if (m) {
            const pageNum = Number(m[1]);
            const text = m[2].trim();
            pages.push({ page: pageNum, text });
        } else {
            // fallback: if page numbers not available, use sequence as page index
            const fallbackPage = pages.length + 1;
            pages.push({ page: fallbackPage, text: part.trim() });
        }
    }

    // Filter empty pages
    return pages.filter(p => p.text && p.text.length > 0);
}
