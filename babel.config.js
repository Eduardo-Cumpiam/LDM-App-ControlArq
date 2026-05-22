// babel.config.js
// Arquivo para configurar o Babel, permitindo o uso de variáveis de ambiente a partir do arquivo .env
//===================================================================

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          safe: false,
          allowUndefined: true
        }
      ]
    ]
  };
};
