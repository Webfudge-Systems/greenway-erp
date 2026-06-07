const defaultOrigins = [
  'http://localhost:3000', // Organization Manager
  'http://localhost:3001', // Accounts
  'http://localhost:3002', // PM
  'http://localhost:3003', // (reserved)
  'https://greenwaymobility.in',
  'https://www.greenwaymobility.in',
  'https://pm.greenwaymobility.in',
  'https://accounts.greenwaymobility.in',
  'https://api.greenwaymobility.in',
  'https://orbit.greenway.webfudge.in',
  'https://base.greenway.webfudge.in',
  'https://erp.greenway.webfudge.in',
];

const extraOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];

const allowedOriginPatterns = [
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+\.greenwaymobility\.in$/,
  /^https:\/\/[a-z0-9-]+\.greenway\.webfudge\.in$/,
  /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/,
];

module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: (ctx) => {
        const requestOrigin = ctx.request.header.origin;

        if (!requestOrigin) {
          return '*';
        }

        if (allowedOrigins.includes(requestOrigin)) {
          return requestOrigin;
        }

        if (allowedOriginPatterns.some((pattern) => pattern.test(requestOrigin))) {
          return requestOrigin;
        }

        return '';
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'X-Organization-Id',
        'X-Department-Id',
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'global::jwt-auth',
  'global::api-cache',
];
