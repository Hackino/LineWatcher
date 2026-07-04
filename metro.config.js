// Learn more: https://docs.expo.dev/guides/customizing-metro/
// Mock vs real datasources are selected at runtime by the DI container
// (see app/di/container.ts), so no build-time source swapping is needed here.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SVG-as-component support: `.svg` imports become React components
// (react-native-svg-transformer) instead of asset URIs.
config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer/expo',
);
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
