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
    ],
  };
};
