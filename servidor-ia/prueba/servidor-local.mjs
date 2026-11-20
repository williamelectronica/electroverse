/* =====================================================================
   Servidor de IA LOCAL para probar el tutor en el navegador (sin gastar)
   Ejecutar:  node prueba/servidor-local.mjs   → http://localhost:8787
   - Usa el mismo código del Worker (src/index.js).
   - Las respuestas de Anthropic son simuladas y los tokens se firman con
     una clave de prueba (GET /token-prueba?uid=…). Solo para pruebas.
   ===================================================================== */
import http from 'node:http';
import worker from '../src/index.js';

const PROY = 'electroverse-prueba-local';
const par = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = { ...(await crypto.subtle.exportKey('jwk', par.publicKey)), kid: 'local', alg: 'RS256' };
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
async function token(uid) {
  const t = Math.floor(Date.now() / 1000), base = b64({ alg: 'RS256', kid: 'local' }) + '.' + b64({ iss: 'https://securetoken.google.com/' + PROY, aud: PROY, sub: uid, iat: t, auth_time: t, exp: t + 3600 });
  return base + '.' + Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', par.privateKey, new TextEncoder().encode(base))).toString('base64url');
}

// Internet simulado: claves de prueba y respuestas de Anthropic que llegan por partes
const fetchReal = globalThis.fetch;
globalThis.fetch = async (url, op = {}) => {
  const u = String(url instanceof Request ? url.url : url);
  if (u === 'https://jwks.local/') return new Response(JSON.stringify({ keys: [jwk] }));
  if (u.startsWith('https://api.anthropic.com')) {
    const pedido = JSON.parse(typeof op.body === 'string' ? op.body : new TextDecoder().decode(op.body));
    const pregunta = pedido.messages.at(-1).content.split('PREGUNTA DEL ESTUDIANTE:').pop().trim().slice(0, 80);
    const partes = ['**Respuesta simulada** ', 'del servidor de IA ', `(modelo ${pedido.model}). `, `Tu pregunta fue: «${pregunta}». `, '\n\n```mermaid\nflowchart LR\n  B[Batería 9 V] --> R[R 470 Ω] --> L[LED] --> B\n```'];
    const ev = (tipo, datos) => `event: ${tipo}\ndata: ${JSON.stringify({ type: tipo, ...datos })}\n\n`;
    const cuerpo = new ReadableStream({ async start(c) {
      const enc = new TextEncoder(), env = s => c.enqueue(enc.encode(s));
      env(ev('message_start', { message: { id: 'm', type: 'message', role: 'assistant', model: pedido.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 0 } } }));
      env(ev('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }));
      for (const p of partes) { await new Promise(r => setTimeout(r, 150)); env(ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: p } })); }
      env(ev('content_block_stop', { index: 0 })); env(ev('message_delta', { delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 9 } })); env(ev('message_stop', {})); c.close();
    } });
    return new Response(cuerpo, { headers: { 'content-type': 'text/event-stream' } });
  }
  return fetchReal(url, op);
};

const kv = new Map();
const env = { LIMITES: { get: async k => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } }, ANTHROPIC_API_KEY: 'sk-ant-simulada', FIREBASE_PROJECT_ID: PROY, JWKS_URL: 'https://jwks.local/', ORIGENES: 'http://localhost:8013', LIMITE_DIARIO_USUARIO: '3', LIMITE_DIARIO_TOTAL: '50', MODELO: 'claude-haiku-5-5', MODELOS_PERMITIDOS: 'claude-haiku-5-5,claude-sonnet-5-5' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:8787');
  if (url.pathname === '/token-prueba') { res.writeHead(200, { 'Access-Control-Allow-Origin': 'http://localhost:8013', 'Content-Type': 'text/plain' }); res.end(await token(url.searchParams.get('uid') || 'uLocal')); return; }
  const trozos = []; for await (const t of req) trozos.push(t);
  const r = await worker.fetch(new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : Buffer.concat(trozos) }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  if (r.body) for await (const t of r.body) res.write(t);
  res.end();
}).listen(8787, () => console.log('Servidor de IA local (simulado) en http://localhost:8787'));
