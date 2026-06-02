'use strict';

const { uniqueUsernameFromEmail } = require('./user-username');

async function seedPlatformAdmin(strapi) {
  const email = (process.env.PLATFORM_ADMIN_EMAIL || 'superadmin@greenways.in').toLowerCase();
  const password = process.env.PLATFORM_ADMIN_PASSWORD || 'Greenways@2026!';
  const firstName = process.env.PLATFORM_ADMIN_FIRST_NAME || 'Platform';
  const lastName = process.env.PLATFORM_ADMIN_LAST_NAME || 'Admin';

  let user = await strapi.query('plugin::users-permissions.user').findOne({
    where: { email },
  });

  if (user) {
    if (!user.isPlatformAdmin) {
      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: { isPlatformAdmin: true },
      });
      console.log(`✅ Promoted existing user to platform admin: ${email}`);
    } else {
      console.log(`ℹ️ Platform admin already exists: ${email}`);
    }
    return;
  }

  user = await strapi.plugins['users-permissions'].services.user.add({
    username: await uniqueUsernameFromEmail(strapi, email),
    email,
    password,
    firstName,
    lastName,
    confirmed: true,
    blocked: false,
    provider: 'local',
    isPlatformAdmin: true,
  });

  console.log(`✅ Seeded platform super admin: ${email}`);
  if (!process.env.PLATFORM_ADMIN_PASSWORD) {
    console.log('   Default password: Greenways@2026! (set PLATFORM_ADMIN_PASSWORD in production)');
  }
}

module.exports = { seedPlatformAdmin };
