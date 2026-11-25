// Extiende app.json con lo que depende de credenciales externas (si faltan, esa función queda apagada).
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  const result = { ...config };

  // Google Sign-In necesita el "URL scheme" de iOS: el ID de cliente OAuth de iOS invertido.
  // "123-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123-abc"
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (iosClientId) {
    const iosUrlScheme = iosClientId.split('.').reverse().join('.');
    result.plugins = [...(result.plugins ?? []), ['@react-native-google-signin/google-signin', { iosUrlScheme }]];
  }

  // Notificaciones push en Android: archivo de Firebase del proyecto.
  if (fs.existsSync(path.join(__dirname, 'google-services.json'))) {
    result.android = { ...result.android, googleServicesFile: './google-services.json' };
  }
  return result;
};
