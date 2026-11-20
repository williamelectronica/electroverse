/* =====================================================================
   ELECTROVERSE · Servidor de IA del tutor (Cloudflare Workers)
   ---------------------------------------------------------------------
   Para qué sirve: que los estudiantes usen la IA del tutor SIN ver la
   clave de API del docente. La clave vive aquí, como secreto del servidor.

   Qué hace en cada pregunta:
   1. Solo acepta pedidos desde la página de Electroverse (ORIGENES).
   2. Comprueba que el usuario inició sesión con Firebase (token firmado
      por Google para el proyecto FIREBASE_PROJECT_ID).
   3. Cuenta las preguntas: un límite por usuario al día y un tope diario
      para toda la plataforma (así el gasto nunca se dispara).
   4. Envía la pregunta a Claude con el SDK oficial de Anthropic y devuelve
      la respuesta en vivo (texto que va llegando poco a poco).

   Configuración: wrangler.toml (variables) y el secreto ANTHROPIC_API_KEY.
   ===================================================================== */
import Anthropic from '@anthropic-ai/sdk';

/* Modelos que se pueden usar (con su "esfuerzo": menos = más rápido y barato) */
const MODELOS = {
  'claude-haiku-5-5': { effort: 'low', respaldo: false },
  'claude-sonnet-5-5': { effort: 'low', respaldo: true },
  'claude-opus-5-5': { effort: 'medium', respaldo: true }
};

/* Regla fija del servidor: va antes de las instrucciones que envía la página,
   para que la IA no se use como chat general */
const GUARDIA = 'Eres el tutor de electrónica de Electroverse, una plataforma educativa peruana. Atiende solo temas de electrónica, electricidad, microcontroladores y programación, automatización, robótica, IoT, matemática y física aplicadas y su enseñanza. Si te piden otra cosa, explica amablemente que solo ayudas con esos temas. Responde siempre en español.';

const LIMITES_TEXTO = { mensajes: 16, caracteresPorMensaje: 8000, caracteresTotales: 40000, caracteresSistema: 16000 };

/* ---------- Respuestas con CORS (solo para los orígenes permitidos) ---------- */
function origenPermitido(req, env) {
  const o = req.headers.get('Origin') || '';
  const lista = String(env.ORIGENES || '').split(',').map(s => s.trim()).filter(Boolean);
  return lista.includes(o) ? o : null;
}
function cabeceras(origen, extra = {}) {
  const h = { 'Vary': 'Origin', ...extra };
  if (origen) Object.assign(h, {
    'Access-Control-Allow-Origin': origen,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Expose-Headers': 'X-Restantes, X-Limite, X-Modelo',
    'Access-Control-Max-Age': '86400'
  });
  return h;
}
function json(origen, status, datos, extra) {
  return new Response(JSON.stringify(datos), { status, headers: cabeceras(origen, { 'Content-Type': 'application/json; charset=utf-8', ...extra }) });
}

/* ---------- Verificación del token de Firebase (JWT firmado con RS256) ---------- */
const URL_CLAVES_GOOGLE = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let cacheClaves = { claves: null, vence: 0, url: '' };

async function clavesPublicas(url) {
  const ahora = Date.now();
  if (cacheClaves.claves && cacheClaves.url === url && ahora < cacheClaves.vence) return cacheClaves.claves;
  const r = await fetch(url);
  if (!r.ok) throw new Error('No se pudieron leer las claves públicas de Google');
  const { keys } = await r.json();
  const edad = /max-age=(\d+)/.exec(r.headers.get('Cache-Control') || '');
  cacheClaves = { claves: keys || [], vence: ahora + (edad ? +edad[1] * 1000 : 3600000), url };
  return cacheClaves.claves;
}
const b64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));

/* Devuelve el uid si el token es válido; si no, lanza un error.
   Se exporta para poder probarlo con claves de prueba. */
export async function verificarToken(token, proyecto, obtenerClaves) {
  const partes = String(token || '').split('.');
  if (partes.length !== 3) throw new Error('token mal formado');
  const cab = JSON.parse(new TextDecoder().decode(b64url(partes[0])));
  const datos = JSON.parse(new TextDecoder().decode(b64url(partes[1])));
  if (cab.alg !== 'RS256' || !cab.kid) throw new Error('algoritmo no permitido');
  const jwk = (await obtenerClaves()).find(k => k.kid === cab.kid);
  if (!jwk) throw new Error('clave desconocida');
  const clave = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', clave, b64url(partes[2]), new TextEncoder().encode(partes[0] + '.' + partes[1]));
  if (!ok) throw new Error('firma no válida');
  const ahora = Math.floor(Date.now() / 1000), margen = 60;
  if (datos.aud !== proyecto) throw new Error('token de otro proyecto');
  if (datos.iss !== 'https://securetoken.google.com/' + proyecto) throw new Error('emisor no válido');
  if (!(datos.exp > ahora - margen)) throw new Error('token vencido');
  if (!(datos.iat <= ahora + margen) || !(datos.auth_time <= ahora + margen)) throw new Error('fechas no válidas');
  if (!datos.sub || typeof datos.sub !== 'string') throw new Error('sin usuario');
  return datos.sub;
}

/* ---------- Límites diarios (Workers KV) ---------- */
const hoy = () => new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10);   // día de Perú (UTC−5)
async function contar(env, uid) {
  const d = hoy(), ku = `u:${uid}:${d}`, kt = `total:${d}`;
  const [u, t] = await Promise.all([env.LIMITES.get(ku), env.LIMITES.get(kt)]);
  const usados = +u || 0, total = +t || 0;
  const limU = +env.LIMITE_DIARIO_USUARIO || 20, limT = +env.LIMITE_DIARIO_TOTAL || 500;
  if (total >= limT) return { ok: false, motivo: 'total', limite: limT, restantes: 0 };
  if (usados >= limU) return { ok: false, motivo: 'usuario', limite: limU, restantes: 0 };
  // KV guarda los contadores dos días (después se borran solos)
  await Promise.all([env.LIMITES.put(ku, String(usados + 1), { expirationTtl: 172800 }), env.LIMITES.put(kt, String(total + 1), { expirationTtl: 172800 })]);
  return { ok: true, limite: limU, restantes: limU - usados - 1 };
}

/* ---------- Revisión de lo que envía la página ---------- */
function revisarPedido(b, env) {
  if (!b || typeof b !== 'object') throw new Error('pedido vacío');
  const msgs = b.messages;
  if (!Array.isArray(msgs) || !msgs.length || msgs.length > LIMITES_TEXTO.mensajes) throw new Error('mensajes no válidos');
  let total = 0;
  msgs.forEach((m, i) => {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') throw new Error('mensaje no válido');
    if ((i === 0 && m.role !== 'user') || (i > 0 && m.role === msgs[i - 1].role)) throw new Error('los turnos deben alternarse empezando por el usuario');
    if (m.content.length > LIMITES_TEXTO.caracteresPorMensaje) throw new Error('mensaje demasiado largo');
    total += m.content.length;
  });
  if (msgs[msgs.length - 1].role !== 'user') throw new Error('el último mensaje debe ser del usuario');
  if (total > LIMITES_TEXTO.caracteresTotales) throw new Error('conversación demasiado larga');
  const sistema = typeof b.system === 'string' ? b.system.slice(0, LIMITES_TEXTO.caracteresSistema) : '';
  const permitidos = String(env.MODELOS_PERMITIDOS || 'claude-haiku-5-5').split(',').map(s => s.trim()).filter(m => MODELOS[m]);
  const modelo = permitidos.includes(b.model) ? b.model : (MODELOS[env.MODELO] && permitidos.includes(env.MODELO) ? env.MODELO : permitidos[0] || 'claude-haiku-5-5');
  return { messages: msgs.map(m => ({ role: m.role, content: m.content })), sistema, modelo };
}

/* ---------- Pregunta a Claude y devuelve el texto en vivo ---------- */
async function responder(env, pedido, origen, cuenta) {
  const cliente = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const M = MODELOS[pedido.modelo];
  const params = {
    model: pedido.modelo,
    max_tokens: +env.MAX_TOKENS || 8000,
    system: GUARDIA + (pedido.sistema ? '\n\n' + pedido.sistema : ''),
    output_config: { effort: M.effort },
    messages: pedido.messages
  };
  // Sonnet y Opus: si el modelo rechaza la consulta, el servidor de Anthropic reintenta con otro modelo
  const stream = M.respaldo
    ? cliente.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
    : cliente.messages.stream(params);

  const { readable, writable } = new TransformStream();
  const escritor = writable.getWriter(), enc = new TextEncoder();
  (async () => {
    try {
      for await (const ev of stream) {
        if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') await escritor.write(enc.encode(ev.delta.text));
      }
      const fin = await stream.finalMessage();
      if (fin.stop_reason === 'refusal') await escritor.write(enc.encode('\n\n_La IA no pudo responder esta consulta. Reformúlala enfocándola en el aprendizaje de electrónica._'));
      else if (fin.stop_reason === 'max_tokens') await escritor.write(enc.encode('\n\n_(Respuesta cortada por su longitud: pide que continúe.)_'));
    } catch (e) {
      console.error('Error de Anthropic:', e && (e.status || ''), e && e.message);
      const status = e && e.status;
      const msg = status === 401 ? 'La clave de API del servidor no es válida (avisa al docente).'
        : status === 429 ? 'La IA está muy ocupada. Espera un minuto y vuelve a intentarlo.'
        : 'La IA no respondió. Inténtalo de nuevo en unos minutos.';
      try { await escritor.write(enc.encode('\n\n⚠ ' + msg)); } catch (er) { /* el usuario cerró la conexión */ }
    } finally {
      try { await escritor.close(); } catch (er) { /* ya cerrado */ }
    }
  })();
  return new Response(readable, { status: 200, headers: cabeceras(origen, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Restantes': String(cuenta.restantes), 'X-Limite': String(cuenta.limite), 'X-Modelo': pedido.modelo }) });
}

export default {
  async fetch(req, env) {
    const origen = origenPermitido(req, env);
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: origen ? 204 : 403, headers: cabeceras(origen) });
    if (url.pathname === '/' && req.method === 'GET') return json(origen, 200, { servicio: 'Electroverse · servidor de IA', estado: 'ok' });
    if (url.pathname !== '/preguntar' || req.method !== 'POST') return json(origen, 404, { error: 'no_encontrado', mensaje: 'Ruta no encontrada.' });
    if (!origen) return json(null, 403, { error: 'origen', mensaje: 'Este servidor solo atiende a la página de Electroverse.' });
    if (!env.ANTHROPIC_API_KEY || !env.FIREBASE_PROJECT_ID || !env.LIMITES) return json(origen, 500, { error: 'config', mensaje: 'El servidor de IA no está configurado todavía.' });

    // 1) ¿Quién pregunta? (token de Firebase)
    let uid;
    try {
      const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
      uid = await verificarToken(token, env.FIREBASE_PROJECT_ID, () => clavesPublicas(env.JWKS_URL || URL_CLAVES_GOOGLE));
    } catch (e) { return json(origen, 401, { error: 'sesion', mensaje: 'Inicia sesión con tu cuenta para usar la IA del tutor.' }); }

    // 2) ¿Qué pregunta? (se revisa antes de gastar)
    let pedido;
    try { pedido = revisarPedido(await req.json(), env); }
    catch (e) { return json(origen, 400, { error: 'pedido', mensaje: 'Pregunta no válida: ' + e.message + '.' }); }

    // 3) ¿Le quedan preguntas hoy?
    const cuenta = await contar(env, uid);
    if (!cuenta.ok) return json(origen, 429, cuenta.motivo === 'total'
      ? { error: 'limite_total', mensaje: 'Hoy ya se usaron todas las preguntas con IA de la plataforma. Vuelve mañana o usa el tutor sin IA.', limite: cuenta.limite }
      : { error: 'limite_usuario', mensaje: `Llegaste a tu límite de ${cuenta.limite} preguntas con IA por hoy. Vuelve mañana o sigue con el tutor sin IA.`, limite: cuenta.limite }, { 'X-Restantes': '0', 'X-Limite': String(cuenta.limite) });

    // 4) Respuesta de Claude en vivo
    return responder(env, pedido, origen, cuenta);
  }
};
