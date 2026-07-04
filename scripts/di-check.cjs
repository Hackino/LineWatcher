// Verifies TSyringe resolution through the SAME Babel transforms the app uses
// (transform-typescript-metadata + legacy decorators), so emitted decorator
// metadata is exercised for real. Run: node scripts/di-check.cjs
require('reflect-metadata');
require('@babel/register')({
  extensions: ['.ts'],
  presets: ['@babel/preset-typescript'],
  plugins: [
    'babel-plugin-transform-typescript-metadata',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
});

const { diSelfTest } = require('../src/app/di/selftest.ts');
const result = diSelfTest();
console.log(result);
process.exit(result.startsWith('DI OK') ? 0 : 1);
