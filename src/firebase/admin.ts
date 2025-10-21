import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

export async function initializeAdminApp() {
  if (!getApps().length) {
    // En un entorno de Google Cloud (como App Hosting), initializeApp() sin argumentos
    // usará automáticamente las credenciales del entorno.
    app = initializeApp();
  } else {
    app = getApps()[0];
  }
  
  return {
    firestore: getFirestore(app),
  };
}
