const { createNextConfig } = require('@greenways/config/next-base');

/** @type {import('next').NextConfig} */
module.exports = createNextConfig({
  async rewrites() {
    return [
      {
        source: '/greenways-docs',
        destination: '/greenways-docs.html',
      },
    ];
  },
});
