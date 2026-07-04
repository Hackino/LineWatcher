module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Must run before the decorators plugin so it can read the TS types.
      'babel-plugin-transform-typescript-metadata',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Path aliases — keep in sync with tsconfig.json "paths".
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@app': './src/app',
            '@core': './src/core',
            '@shared': './src/shared',
            '@ds': './src/design-system',
            '@features': './src/features',
          },
        },
      ],
      // Reanimated 4 requires react-native-worklets/plugin (used transitively by
      // react-native-keyboard-controller for smooth IME tracking). Must be last.
      'react-native-worklets/plugin',
    ],
  };
};
