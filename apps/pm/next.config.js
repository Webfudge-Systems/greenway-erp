const { spawnSync } = require('node:child_process');
const withSerwistInit = require('@serwist/next').default;
const { createNextConfig } = require('@greenways/config/next-base');

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ||
  process.env.SOURCE_COMMIT ||
  String(Date.now());

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
});

/** @type {import('next').NextConfig} */
module.exports = withSerwist(createNextConfig());
