# Servidor de IA del tutor (Cloudflare Workers)

Con este servidor, **los estudiantes usan la IA del tutor sin ver ninguna clave**. Tu clave de Anthropic queda guardada como secreto en Cloudflare, y el servidor:

- solo atiende a la página de Electroverse;
- solo responde a usuarios que **iniciaron sesión** con su cuenta (Firebase);
- limita las preguntas: **20 por estudiante al día** y **500 en total al día** (puedes cambiarlo);
- usa el modelo económico **Claude Haiku 5.5** por defecto.

El código está en la carpeta `servidor-ia/`. El plan gratuito de Cloudflare Workers permite 100 000 pedidos al día, mucho más de lo que necesita un colegio.

> Tiempo aproximado: 20 minutos. Se hace una sola vez.

---

## Lo que necesitas

1. **Una clave de API de Anthropic con créditos.** Se saca en https://platform.claude.com, en **API Keys**. Pon un **límite de gasto mensual** en **Limits**, por ejemplo 10 dólares.
2. **Una cuenta gratuita de Cloudflare.** Se crea en https://dash.cloudflare.com/sign-up.
3. **Node.js 24 LTS.** En PowerShell:

```powershell
winget install OpenJS.NodeJS.LTS
```

Cierra y vuelve a abrir PowerShell, y comprueba la versión (debe ser 22 o más):

```powershell
node -v
```

## Paso 1 — Instalar las herramientas

Abre PowerShell en la carpeta del servidor:

```powershell
cd C:\Users\William\Proyectos\prueba-claude\electroverse\servidor-ia
```

```powershell
npm install
```

## Paso 2 — Conectar con tu cuenta de Cloudflare

```powershell
npx wrangler login
```

Se abre el navegador: inicia sesión en Cloudflare y pulsa **Allow** (Permitir).

## Paso 3 — Crear el contador de preguntas

```powershell
npx wrangler kv namespace create LIMITES
```

Aparece algo como `id = "a1b2c3d4…"`. Abre `servidor-ia/wrangler.toml` y reemplaza `PEGA_AQUI_EL_ID_DE_KV` por ese id.

## Paso 4 — Guardar tu clave de Anthropic (secreta)

```powershell
npx wrangler secret put ANTHROPIC_API_KEY
```

Pega tu clave (`sk-ant-…`) y pulsa Enter. La clave queda guardada **solo en Cloudflare**: no aparece en el código ni en GitHub.

## Paso 5 — Publicar el servidor

```powershell
npx wrangler deploy
```

Al final muestra la dirección del servidor, por ejemplo:

```
https://electroverse-ia.tu-nombre.workers.dev
```

Ábrela en el navegador: debe decir `"estado":"ok"`.

## Paso 6 — Conectar Electroverse

Pásame esa dirección y la pondré en `data/firebase-config.js` (campo `iaUrl`). Desde ese momento:

- los estudiantes que **entren con su cuenta** tienen IA en el tutor, con su límite diario;
- quien use un perfil de la computadora (sin cuenta) sigue con el tutor sin IA;
- tú, como docente, puedes seguir usando tu clave propia en **Configurar IA** si quieres otro modelo.

---

## Cambiar los límites o el modelo

Edita la sección `[vars]` de `servidor-ia/wrangler.toml`:

| Variable | Qué controla | Valor inicial |
|---|---|---|
| `LIMITE_DIARIO_USUARIO` | Preguntas con IA por estudiante al día | 20 |
| `LIMITE_DIARIO_TOTAL` | Preguntas con IA de toda la plataforma al día | 500 |
| `MODELO` | Modelo que se usa | `claude-haiku-5-5` |
| `MODELOS_PERMITIDOS` | Modelos que la página puede pedir | Haiku y Sonnet |
| `ORIGENES` | Páginas que pueden usar el servidor | GitHub Pages y localhost |

Luego vuelve a publicar:

```powershell
npx wrangler deploy
```

## Costos aproximados

Con Haiku 5.5, cada pregunta cuesta alrededor de **0,1 centavos de dólar**. El peor caso, con las 500 preguntas diarias usadas todos los días, sería unos 15 dólares al mes. El uso normal de un aula es mucho menor. El límite de gasto de la consola de Anthropic es tu seguro final.

## Problemas frecuentes

| Mensaje | Solución |
|---|---|
| `Wrangler requires at least Node.js v22` | Instala Node.js 24 LTS (ver arriba) y vuelve a abrir PowerShell. |
| "El servidor de IA no está configurado todavía" | Falta el paso 3 (id de KV) o el paso 4 (clave secreta). |
| "La clave de API del servidor no es válida" | Repite el paso 4 con la clave correcta. |
| "Inicia sesión con tu cuenta para usar la IA" | El estudiante entró con un perfil de la computadora: debe entrar con Google o correo. |
| "Este servidor solo atiende a la página de Electroverse" | Agrega la dirección de tu página en `ORIGENES` y vuelve a publicar. |

## Para desarrolladores

- Prueba automática, sin gastar créditos: `npm run prueba` (27 pruebas).
- Servidor local simulado para probar el tutor: `node prueba/servidor-local.mjs`.
