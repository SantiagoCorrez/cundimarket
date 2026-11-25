// Extiende app.json. El plugin de Google Sign-In necesita el "URL scheme" de iOS, que es el ID de
// cliente OAuth de iOS invertido; solo se agrega cuando EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID está definido
// (si no, el botón "Continuar con Google" no se muestra en iOS).
module.exports = ({ config }) => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!iosClientId) return config;

  // "123-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123-abc"
  const iosUrlScheme = iosClientId.split('.').reverse().join('.');
  return {
    ...config,
    plugins: [...(config.plugins ?? []), ['@react-native-google-signin/google-signin', { iosUrlScheme }]],
  };
};
