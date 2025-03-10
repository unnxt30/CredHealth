module.exports = function (api) {
  api.cache(true);
  const plugins = ['@babel/plugin-transform-class-static-block'];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins: ['module:react-native-dotenv'],
  };
};
