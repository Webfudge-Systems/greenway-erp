'use strict';

const { createClient } = require('redis');

let client = null;
let connectPromise = null;

function resolveRedisUrl() {
  const explicit = process.env.REDIS_URL?.trim();
  if (explicit) return explicit;

  const host = process.env.REDISHOST || process.env.REDIS_HOST;
  const port = process.env.REDISPORT || process.env.REDIS_PORT || '6379';
  const user = process.env.REDISUSER || process.env.REDIS_USER || 'default';
  const password = process.env.REDISPASSWORD || process.env.REDIS_PASSWORD;

  if (host && password) {
    const encodedUser = encodeURIComponent(user);
    const encodedPass = encodeURIComponent(password);
    return `redis://${encodedUser}:${encodedPass}@${host}:${port}`;
  }

  return null;
}

function isRedisConfigured() {
  if (process.env.REDIS_ENABLED === 'false') return false;
  return Boolean(resolveRedisUrl());
}

async function getClient() {
  if (!isRedisConfigured()) return null;
  if (client?.isOpen) return client;

  if (!connectPromise) {
    connectPromise = (async () => {
      const next = createClient({ url: resolveRedisUrl() });
      next.on('error', (err) => {
        console.error('[redis] client error:', err?.message || err);
      });
      await next.connect();
      client = next;
      return client;
    })().catch((err) => {
      connectPromise = null;
      console.error('[redis] connect failed:', err?.message || err);
      return null;
    });
  }

  return connectPromise;
}

async function ping() {
  const c = await getClient();
  if (!c) return false;
  return (await c.ping()) === 'PONG';
}

async function get(key) {
  const c = await getClient();
  if (!c) return null;
  return c.get(key);
}

async function set(key, value, ttlSeconds) {
  const c = await getClient();
  if (!c) return false;
  if (ttlSeconds && ttlSeconds > 0) {
    await c.set(key, value, { EX: ttlSeconds });
  } else {
    await c.set(key, value);
  }
  return true;
}

async function del(key) {
  const c = await getClient();
  if (!c) return false;
  await c.del(key);
  return true;
}

async function keys(pattern) {
  const c = await getClient();
  if (!c) return [];
  return c.keys(pattern);
}

async function disconnect() {
  connectPromise = null;
  if (client?.isOpen) await client.quit();
  client = null;
}

module.exports = {
  resolveRedisUrl,
  isRedisConfigured,
  getClient,
  ping,
  get,
  set,
  del,
  keys,
  disconnect,
};
