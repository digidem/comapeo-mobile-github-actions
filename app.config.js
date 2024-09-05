const execa = require('execa');

const SUFFIX =
  {
    development: '.dev',
    production: '',
    releaseCandidate: '.rc',
    preRelease: 'pre',
  }[process.env.APP_VARIANT] ?? '';

const NAME =
  {
    development: ' Dev',
    production: '',
    releaseCandidate: ' Rc',
    preRelease: ' Pre',
  }[process.env.APP_VARIANT] ?? '';

const pkgVersion = require('./package.json').version;
const pkgVersionBase = pkgVersion.replace(/-.*/, '');

const commitCountSinceDevelop = execa.sync('git', [
  'rev-list',
  '--count',
  'develop',
]).stdout;

const commitSha = execa.sync('git', ['rev-parse', 'HEAD']).stdout;

const VERSION = SUFFIX
  ? `${pkgVersionBase}-${SUFFIX}.${commitCountSinceDevelop}`
  : pkgVersionBase;

const LATEST_SHA = (commitSha || process.env.EAS_BUILD_GIT_COMMIT_HASH).slice(
  0,
  7,
);

/**
 * @param {object} opts
 * @param {import('@expo/config-types').ExpoConfig} opts.config
 *
 * @returns {import('@expo/config-types').ExpoConfig}
 */
module.exports = ({config}) => ({
  ...config,
  version:
    process.env.APP_VARIANT === 'production' || !LATEST_SHA
      ? VERSION
      : `${VERSION}+${LATEST_SHA}`,
  extra: {
    ...config.extra,
    eas: {
      projectId: '2d5b8137-12ec-45aa-9c23-56b6a1c522b7',
    },
  },
  name: 'CoMapeo' + NAME,
  ios: {
    ...config.ios,
    bundleIdentifier: 'com.comapeo' + SUFFIX,
  },
  android: {
    ...config.android,
    package: 'com.comapeo' + SUFFIX,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
  },
  updates: {
    url: 'https://u.expo.dev/2d5b8137-12ec-45aa-9c23-56b6a1c522b7',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
