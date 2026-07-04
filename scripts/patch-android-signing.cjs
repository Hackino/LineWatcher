/**
 * Patch android/app/build.gradle after `expo prebuild` so the release variant
 * is signed with the LINEWATCH_UPLOAD_* Gradle properties (fed in by the CI
 * workflow from GitHub secrets). Idempotent — running twice is a no-op.
 *
 * Design: read the passwords from ~/.gradle/gradle.properties, NEVER from
 * the repo. Nothing sensitive gets written into any tracked file.
 */
const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
if (!fs.existsSync(gradlePath)) {
  console.error(
    'patch-android-signing: android/app/build.gradle not found — did prebuild run?',
  );
  process.exit(1);
}

let src = fs.readFileSync(gradlePath, 'utf8');
const MARKER = '// LINEWATCH_RELEASE_SIGNING';
if (src.includes(MARKER)) {
  console.log('patch-android-signing: already patched — no-op.');
  process.exit(0);
}

const RELEASE_SIGNING_BLOCK = `
        release {
            ${MARKER}
            if (project.hasProperty('LINEWATCH_UPLOAD_STORE_FILE')) {
                storeFile file(project.property('LINEWATCH_UPLOAD_STORE_FILE'))
                storePassword project.property('LINEWATCH_UPLOAD_STORE_PASSWORD')
                keyAlias project.property('LINEWATCH_UPLOAD_KEY_ALIAS')
                keyPassword project.property('LINEWATCH_UPLOAD_KEY_PASSWORD')
            }
        }`;

// Inject the release signingConfig block inside `signingConfigs { ... }`.
if (!/signingConfigs\s*\{/.test(src)) {
  console.error(
    'patch-android-signing: no signingConfigs block found in build.gradle.',
  );
  process.exit(1);
}
src = src.replace(/signingConfigs\s*\{/, (match) => `${match}${RELEASE_SIGNING_BLOCK}\n`);

// Point `buildTypes.release` at `signingConfigs.release`.
src = src.replace(
  /buildTypes\s*\{\s*release\s*\{([^}]*)\}/m,
  (whole, body) => {
    if (/signingConfig\s+signingConfigs\.release/.test(body)) return whole;
    const inner = body.replace(
      /signingConfig\s+signingConfigs\.debug/,
      'signingConfig signingConfigs.release',
    );
    if (inner === body) {
      return whole.replace(
        /release\s*\{/,
        'release {\n            signingConfig signingConfigs.release',
      );
    }
    return whole.replace(body, inner);
  },
);

fs.writeFileSync(gradlePath, src);
console.log('patch-android-signing: release signing wired.');
