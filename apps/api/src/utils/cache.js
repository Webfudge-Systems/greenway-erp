'use strict';

const redis = require('./redis');

const DEFAULT_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 300;
const PREFIX = process.env.CACHE_KEY_PREFIX || 'cache';
const MAX_BODY_BYTES = Number(process.env.CACHE_MAX_BODY_BYTES || 5 * 1024 * 1024);

function fullKey(key) {
  return `${PREFIX}:${key}`;
}

async function getJson(key) {
  if (!redis.isRedisConfigured()) return null;
  try {
    const raw = await redis.get(fullKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[cache] getJson failed:', err?.message || err);
    return null;
  }
}

async function setJson(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  if (!redis.isRedisConfigured()) return false;
  try {
    const body = JSON.stringify(value);
    if (body.length > MAX_BODY_BYTES) return false;
    await redis.set(fullKey(key), body, ttlSeconds);
    return true;
  } catch (err) {
    console.warn('[cache] setJson failed:', err?.message || err);
    return false;
  }
}

async function invalidatePattern(pattern) {
  if (!redis.isRedisConfigured()) return 0;
  try {
    const matched = await redis.keys(fullKey(pattern));
    if (!matched.length) return 0;
    await Promise.all(matched.map((key) => redis.del(key)));
    return matched.length;
  } catch (err) {
    console.warn('[cache] invalidate failed:', err?.message || err);
    return 0;
  }
}

async function invalidateOrg(orgId) {
  if (orgId == null || orgId === '' || orgId === 'none') return 0;
  return invalidatePattern(`*:o:${orgId}:*`);
}

async function invalidateUser(userId) {
  if (userId == null || userId === '' || userId === 'anon') return 0;
  return invalidatePattern(`u:${userId}:*`);
}

module.exports = {
  DEFAULT_TTL_SECONDS,
  PREFIX,
  fullKey,
  getJson,
  setJson,
  invalidatePattern,
  invalidateOrg,
  invalidateUser,
};
