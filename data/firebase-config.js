/* =====================================================================
   ELECTROVERSE · Configuración de Firebase (registro de usuarios y aulas en línea)
   ---------------------------------------------------------------------
   Mientras "config" sea null, la app funciona como siempre: perfiles
   locales en cada computadora, sin cuentas en la nube.

   Para activar el registro (guía completa en docs/FIREBASE.md):
   1. Crea un proyecto en https://console.firebase.google.com
   2. Agrega una "app web" y copia aquí el objeto firebaseConfig.
   3. Activa Authentication (Google y Correo/contraseña) y Firestore.
   4. Copia las reglas de firestore.rules en Firestore → Reglas.
   5. Entra a Electroverse con tu cuenta, copia "Tu identificador (UID)"
      desde Ajustes y pégalo en adminUid (aquí y en firestore.rules).

   Estos datos NO son secretos: Google los pide públicos para que la
   página funcione. Lo que protege la información son las reglas de
   firestore.rules (cada estudiante solo ve su avance, etc.).
   ===================================================================== */
window.EV_FIREBASE = {
  // Configuración del proyecto Firebase de Electroverse
  config: {
    apiKey: "AIzaSyDxpAagYxhFASSJACLwMZ2hwDFLyr8Lvew",
    authDomain: "electroverse-6edb9.firebaseapp.com",
    projectId: "electroverse-6edb9",
    storageBucket: "electroverse-6edb9.firebasestorage.app",
    messagingSenderId: "431050992452",
    appId: "1:431050992452:web:52f8ba18257b891b1d4511"
  },
  /* Ejemplo de cómo se ve:
  config: {
    apiKey: "AIza...",
    authDomain: "electroverse-xxxx.firebaseapp.com",
    projectId: "electroverse-xxxx",
    storageBucket: "electroverse-xxxx.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
  },
  */
  // UID del administrador (el docente dueño de la plataforma): aprueba a los demás docentes
  adminUid: 'WE9k3K0VGLRWpZBtoGX4yixR0JL2'
};
