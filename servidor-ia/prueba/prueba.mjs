/* =====================================================================
   Prueba automática del servidor de IA (sin gastar créditos)
   Ejecutar:  npm run prueba   (desde la carpeta servidor-ia)
   - Crea claves RSA de prueba y firma tokens como lo haría Firebase.
   - Simula las respuestas de Anthropic (no se conecta a internet).
   ===================================================================== */
import worker, { verificarToken } from '../src/index.js';

let fallos = 0, pruebas = 0;
const ok = (cond, nombre) => { pruebas++; if (cond) console.log('  ✔ ' + nombre); else { fallos++; console.log('  ✘ ' + nombre); } };

/* ---------- Claves y tokens de prueba ---------- */
const par = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = { ...(await crypto.subtle.exportKey('jwk', par.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
const otro = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const b64 = o => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const PROY = 'electroverse-prueba';
async function token(datos = {}, { kid = 'k1', clave = par.privateKey } = {}) {
  const ahora = Math.floor(Date.now() / 1000);
  const cuerpo = { iss: 'https://securetoken.google.com/' + PROY, aud: PROY, sub: 'uidPrueba', iat: ahora - 10, auth_time: ahora - 10, exp: ahora + 3600, ...datos };
  const base = b64({ alg: 'RS256', kid, typ: 'JWT' }) + '.' + b64(cuerpo);
  const firma = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', clave, new TextEncoder().encode(base));
  return base + '.' + Buffer.from(firma).toString('base64url');
}
const claves = async () => [jwk];

console.log('\n1) Verificación del token de Firebase');
ok(await verificarToken(await token(), PROY, claves) === 'uidPrueba', 'token válido → devuelve el uid');
const falla = async (t, nombre) => { try { await verificarToken(t, PROY, claves); ok(false, nombre); } catch (e) { ok(true, nombre + ' (' + e.message + ')'); } };
await falla(await token({ exp: Math.floor(Date.now() / 1000) - 3600 }), 'token vencido → rechazado');
await falla(await token({ aud: 'otro-proyecto' }), 'token de otro proyecto → rechazado');
await falla(await token({ iss: 'https://evil.example/' + PROY }), 'emisor falso → rechazado');
await falla(await token({}, { clave: otro.privateKey }), 'firma con otra clave → rechazado');
await falla(await token({}, { kid: 'k2' }), 'clave desconocida → rechazado');
await falla('abc.def', 'token mal formado → rechazado');

/* ---------- Simulación de internet: claves de Google y API de Anthropic ---------- */
const enviados = [];
const sse = (texto, stop = 'end_turn') => {
  const ev = (tipo, datos) => `event: ${tipo}\ndata: ${JSON.stringify({ type: tipo, ...datos })}\n\n`;
  return ev('message_start', { message: { id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-haiku-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 0 } } })
    + ev('content_block_start', { index: 0, content_block: { type: 'text', text: '' } })
    + texto.map(t => ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: t } })).join('')
    + ev('content_block_stop', { index: 0 })
    + ev('message_delta', { delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 5 } })
    + ev('message_stop', {});
};
let modoAnthropic = 'ok';
const fetchReal = globalThis.fetch;
globalThis.fetch = async (url, op = {}) => {
  const u = String(url instanceof Request ? url.url : url);
  if (u === 'https://jwks.prueba/') return new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'Cache-Control': 'max-age=600' } });
  if (u.startsWith('https://api.anthropic.com')) {
    const cuerpo = op.body ? JSON.parse(typeof op.body === 'string' ? op.body : new TextDecoder().decode(op.body)) : (url instanceof Request ? await url.json() : {});
    enviados.push({ url: u, cuerpo });
    if (modoAnthropic === '401') return new Response(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }), { status: 401, headers: { 'content-type': 'application/json' } });
    return new Response(sse(['Hola, ', 'soy el ', 'tutor.'], modoAnthropic === 'refusal' ? 'refusal' : 'end_turn'), { headers: { 'content-type': 'text/event-stream' } });
  }
  return fetchReal(url, op);
};

/* ---------- KV simulado ---------- */
const kv = new Map();
const LIMITES = { get: async k => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } };
const env = { LIMITES, ANTHROPIC_API_KEY: 'sk-ant-prueba', FIREBASE_PROJECT_ID: PROY, JWKS_URL: 'https://jwks.prueba/', ORIGENES: 'https://williamelectronica.github.io,http://localhost:8013', LIMITE_DIARIO_USUARIO: '3', LIMITE_DIARIO_TOTAL: '100', MODELO: 'claude-haiku-5-5', MODELOS_PERMITIDOS: 'claude-haiku-5-5,claude-sonnet-5-5' };
const ORIGEN = 'https://williamelectronica.github.io';
const pedir = async ({ origen = ORIGEN, tok, cuerpo, metodo = 'POST', ruta = '/preguntar' } = {}) => {
  const h = { 'Content-Type': 'application/json' }; if (origen) h.Origin = origen; if (tok) h.Authorization = 'Bearer ' + tok;
  return worker.fetch(new Request('https://ia.prueba' + ruta, { method: metodo, headers: h, body: metodo === 'POST' ? JSON.stringify(cuerpo || {}) : undefined }), env);
};
const pregunta = { system: 'Instrucciones del agente ELECTRO', messages: [{ role: 'user', content: '¿Qué es un diodo?' }] };

console.log('\n2) Seguridad del servidor');
let r = await pedir({ metodo: 'OPTIONS' }); ok(r.status === 204 && r.headers.get('Access-Control-Allow-Origin') === ORIGEN, 'preflight desde la página permitida → 204');
r = await pedir({ metodo: 'OPTIONS', origen: 'https://otra-pagina.com' }); ok(r.status === 403, 'preflight desde otra página → 403');
r = await pedir({ origen: 'https://otra-pagina.com', tok: await token(), cuerpo: pregunta }); ok(r.status === 403, 'pregunta desde otra página → 403');
r = await pedir({ cuerpo: pregunta }); ok(r.status === 401, 'sin sesión → 401');
r = await pedir({ tok: await token({ aud: 'otro' }), cuerpo: pregunta }); ok(r.status === 401, 'token de otro proyecto → 401');
r = await pedir({ tok: await token(), cuerpo: { messages: [{ role: 'assistant', content: 'x' }] } }); ok(r.status === 400, 'conversación mal armada → 400');
r = await pedir({ tok: await token(), cuerpo: { messages: [{ role: 'user', content: 'x'.repeat(9000) }] } }); ok(r.status === 400, 'mensaje demasiado largo → 400');
ok(enviados.length === 0, 'ningún pedido rechazado llegó a Anthropic (no gastó)');

console.log('\n3) Respuesta en vivo');
r = await pedir({ tok: await token(), cuerpo: pregunta });
const texto = await r.text();
ok(r.status === 200 && texto === 'Hola, soy el tutor.', 'respuesta completa: "' + texto + '"');
ok(r.headers.get('X-Restantes') === '2' && r.headers.get('X-Limite') === '3', 'cabeceras de límite: quedan 2 de 3');
const env1 = enviados[0].cuerpo;
ok(env1.model === 'claude-haiku-5-5' && env1.output_config.effort === 'low' && !env1.fallbacks, 'Haiku por defecto, esfuerzo bajo, sin respaldo');
ok(env1.system.startsWith('Eres el tutor de electrónica de Electroverse') && env1.system.includes('Instrucciones del agente ELECTRO'), 'la regla fija del servidor va antes de las instrucciones de la página');
r = await pedir({ tok: await token(), cuerpo: { ...pregunta, model: 'claude-sonnet-5-5' } }); await r.text();
ok(enviados[1].cuerpo.model === 'claude-sonnet-5-5' && enviados[1].cuerpo.fallbacks === 'default', 'Sonnet permitido, con respaldo del servidor');
r = await pedir({ tok: await token({ sub: 'otroUid' }), cuerpo: { ...pregunta, model: 'claude-opus-5-5' } }); await r.text();
ok(enviados[2].cuerpo.model === 'claude-haiku-5-5', 'Opus no permitido → usa Haiku');

console.log('\n4) Límite diario');
r = await pedir({ tok: await token(), cuerpo: pregunta }); await r.text(); ok(r.headers.get('X-Restantes') === '0', 'tercera pregunta: quedan 0');
const antes = enviados.length;
r = await pedir({ tok: await token(), cuerpo: pregunta }); const j = await r.json();
ok(r.status === 429 && j.error === 'limite_usuario' && enviados.length === antes, 'cuarta pregunta → 429, sin llamar a Anthropic');
r = await pedir({ tok: await token({ sub: 'otroUid' }), cuerpo: pregunta }); await r.text(); ok(r.status === 200, 'otro estudiante tiene su propio límite');

console.log('\n5) Errores de Anthropic');
modoAnthropic = 'refusal'; r = await pedir({ tok: await token({ sub: 'u3' }), cuerpo: pregunta }); const t2 = await r.text();
ok(t2.includes('no pudo responder esta consulta'), 'rechazo del modelo → mensaje amable');
modoAnthropic = '401'; r = await pedir({ tok: await token({ sub: 'u4' }), cuerpo: pregunta }); const t3 = await r.text();
ok(t3.includes('clave de API del servidor no es válida'), 'clave inválida → aviso al docente: "' + t3.trim().slice(0, 60) + '…"');
r = await pedir({ metodo: 'GET', ruta: '/' }); ok(r.status === 200 && (await r.json()).estado === 'ok', 'GET / → servidor en línea');

console.log(`\nResultado: ${pruebas - fallos} de ${pruebas} pruebas correctas.`);
process.exit(fallos ? 1 : 0);
