const path = require('path');

/** Shared Next.js settings for monorepo Docker / standalone deploys */
function createNextConfig(overrides = {}) {
  return {
    reactStrictMode: true,
    output: 'standalone',
    experimental: {
      outputFileTracingRoot: path.join(__dirname, '../..'),
    },
    transpilePackages: [
      '@greenways/ui',
      '@greenways/auth',
      '@greenways/utils',
      '@greenways/config',
    ],
    ...overrides,
  };
}

module.exports = { createNextConfig };
