# Activar cuentas y aulas en línea con Firebase (v14)

Con Firebase, los estudiantes y docentes entran con **Google** o con **correo y contraseña**, su avance se guarda en la nube y las aulas funcionan en línea. Firebase es de Google y su plan **Spark es gratuito** (alcanza de sobra para un colegio).

Mientras no lo actives, Electroverse sigue funcionando como siempre: perfiles locales en cada computadora.

> Tiempo aproximado: 15 minutos. Necesitas una cuenta de Google (la tuya de docente).

---

## Paso 1 — Crear el proyecto

1. Entra a **https://console.firebase.google.com** con tu cuenta de Google.
2. Pulsa **Crear un proyecto** (o "Agregar proyecto").
3. Nombre: `electroverse` (Firebase le agrega letras al final, por ejemplo `electroverse-a1b2c`).
4. Google Analytics: puedes **desactivarlo** (no se necesita). Pulsa **Crear proyecto**.

## Paso 2 — Registrar la app web y copiar la configuración

1. En la página del proyecto, pulsa el ícono **`</>`** (Web).
2. Apodo de la app: `Electroverse`. **No** marques "Firebase Hosting". Pulsa **Registrar app**.
3. Aparece un código con `const firebaseConfig = { ... }`. Copia solo lo que está entre las llaves.
4. Abre `data/firebase-config.js` y reemplaza `config: null,` por tu configuración, así:

```js
config: {
  apiKey: "AIza…",
  authDomain: "electroverse-a1b2c.firebaseapp.com",
  projectId: "electroverse-a1b2c",
  storageBucket: "electroverse-a1b2c.firebasestorage.app",
  messagingSenderId: "…",
  appId: "…"
},
```

> Estos datos **no son secretos**: Google los pide públicos para que la página funcione. La protección la dan las reglas del paso 5.

## Paso 3 — Activar el inicio de sesión

1. Menú izquierdo → **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Método de acceso**:
   - **Correo electrónico/contraseña** → Habilitar → Guardar.
   - **Google** → Habilitar → elige tu correo de asistencia → Guardar.
3. Pestaña **Configuración → Dominios autorizados** → **Agregar dominio**:
   - `williamelectronica.github.io`
   - (`localhost` ya viene incluido, sirve para probar en tu computadora).

## Paso 4 — Crear la base de datos

1. Menú izquierdo → **Compilación → Firestore Database** → **Crear base de datos**.
2. Ubicación: elige la más cercana, por ejemplo **`southamerica-east1` (São Paulo)**. *No se puede cambiar después.*
3. Elige **Comenzar en modo de producción** → Crear.

## Paso 5 — Pegar las reglas de seguridad

1. En Firestore, pestaña **Reglas**.
2. Borra lo que hay y pega todo el contenido del archivo `firestore.rules` de Electroverse.
3. Pulsa **Publicar**. (En una instalación nueva, `TU_UID_DE_ADMIN` se reemplaza en el paso 7. En Electroverse ya está puesto el UID del administrador: si vuelves a copiar el archivo, ya va incluido.)

## Paso 6 — Probar el inicio de sesión

1. Abre Electroverse con el servidor local (`python -m http.server 8000` y luego `http://localhost:8000`).
2. En la puerta de entrada aparecen **Entrar con Google** y **Entrar con correo y contraseña**.
3. Entra con tu cuenta de docente y elige **Estudiante** por ahora (todavía no eres administrador).

## Paso 7 — Hacerte administrador

1. En Electroverse ve a **Ajustes** → copia **Tu identificador (UID)**.
2. Pégalo en dos lugares:
   - `data/firebase-config.js` → `adminUid: 'TU_UID',`
   - Firebase → Firestore → **Reglas** → reemplaza `TU_UID_DE_ADMIN` por tu UID → **Publicar**.
3. En Electroverse: **Ajustes → Cerrar sesión** y vuelve a entrar. Ya puedes elegir el rol **Administrador (docente)**.

## Paso 8 — Publicar

Cuando funcione en tu computadora, avísame y subo los cambios a GitHub Pages. La página publicada usará tu proyecto de Firebase.

---

## Cómo se usa en el aula

| Quién | Qué hace |
|---|---|
| **Tú (administrador)** | En **Ajustes → Docentes** apruebas o rechazas a los docentes que lo soliciten. También ves todas las aulas. |
| **Otro docente** | Entra con su cuenta, elige **Docente** (queda como solicitud). Cuando lo apruebas y vuelve a entrar, ya es Docente y crea sus aulas. |
| **Estudiante** | Entra con su cuenta, se une al aula con el código de 6 letras y pulsa **Enviar mi avance**. Su docente lo ve al instante. |
| **Sin internet o sin cuenta** | Sigue usando un perfil de la computadora y envía su avance con el código **EV1**. |

## Privacidad (Ley N.º 29733)

- Se guarda solo: un identificador, el rol, el alias que elige el estudiante y su avance.
- El correo de los docentes solo lo ve el administrador (en las solicitudes).
- Cada estudiante solo puede leer y escribir **su** avance; cada docente ve solo las entregas de **sus** aulas.
- Los estudiantes menores de edad deben usar la plataforma con conocimiento de su docente o apoderado (la puerta de entrada pide el consentimiento).

## Problemas frecuentes

| Mensaje | Solución |
|---|---|
| "Esta dirección no está autorizada en Firebase" | Agrega el dominio en Authentication → Configuración → Dominios autorizados (paso 3). |
| "Este método de inicio no está activado" | Activa Google o Correo/contraseña (paso 3). |
| "La configuración de Firebase no es válida" | Revisa que copiaste bien el `apiKey` en `data/firebase-config.js`. |
| "No se pudieron leer las solicitudes" | Tu UID no coincide en `adminUid` o en las reglas (paso 7). |
| "El navegador bloqueó la ventana de Google" | Permite las ventanas emergentes para la página, o entra con correo. |
