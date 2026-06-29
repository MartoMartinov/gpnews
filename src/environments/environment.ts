/**
 * Development environment (default).
 * `ng build` / `ng serve` replace this file per the configuration's
 * fileReplacements in angular.json.
 */
export const environment = {
  production: false,
  name: 'dev',
  apiBaseUrl: 'http://localhost:3000/api/gpnews',
  firebase: {
    apiKey: 'REDACTED_FIREBASE_API_KEY',
    authDomain: 'redacted-firebase-project.firebaseapp.com',
    projectId: 'redacted-firebase-project',
    storageBucket: 'redacted-firebase-project.firebasestorage.app',
    messagingSenderId: '0000000000000',
    appId: '1:0000000000000:web:5c016fe952d04f885b8f27',
  },
};
