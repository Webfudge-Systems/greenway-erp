'use strict';

const { uniqueUsernameFromEmail } = require('./user-username');
const { resolveOrganizationRoleId } = require('./organization-role');

const ORG_UID = 'api::organization.organization';
const ORG_USER_UID = 'api::organization-user.organization-user';

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensurePlatformAdminOrganization(strapi, user) {
  const orgName = process.env.PLATFORM_ADMIN_ORG_NAME || 'Greenways';
  const baseSlug = toSlug(process.env.PLATFORM_ADMIN_ORG_SLUG || orgName) || 'greenways';

  const existingMembership = await strapi.entityService.findMany(ORG_USER_UID, {
    filters: { user: user.id, isActive: true },
    populate: { organization: true, role: true },
    limit: 1,
  });

  if (existingMembership.length > 0) {
    console.log(`ℹ️ Platform admin already has organization access: ${existingMembership[0].organization?.name}`);
    return existingMembership[0].organization;
  }

  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const taken = await strapi.entityService.findMany(ORG_UID, {
      filters: { slug },
      limit: 1,
    });
    if (!taken.length) break;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const organization = await strapi.entityService.create(ORG_UID, {
    data: {
      name: orgName,
      slug,
      companyEmail: user.email,
      owner: user.id,
      status: 'active',
      onboardingCompleted: true,
      trialEndsAt: null,
    },
  });

  const adminRoleId = await resolveOrganizationRoleId(strapi, 'Admin');
  await strapi.entityService.create(ORG_USER_UID, {
    data: {
      user: user.id,
      organization: organization.id,
      role: adminRoleId,
      isActive: true,
      joinedAt: new Date(),
    },
  });

  const accountsApp = await strapi.entityService.findMany('api::app.app', {
    filters: { slug: 'accounts' },
    limit: 1,
  });

  if (accountsApp.length > 0) {
    const appId = accountsApp[0].id;
    const modules = await strapi.entityService.findMany('api::module.module', {
      filters: { app: appId },
    });
    const moduleIds = modules.map((m) => m.id);

    const existingSub = await strapi.entityService.findMany('api::subscription.subscription', {
      filters: { organization: organization.id, app: appId },
      limit: 1,
    });

    if (!existingSub.length) {
      const pricing = await strapi.service('api::subscription.subscription').calculatePricing(
        appId,
        moduleIds,
        1
      );

      await strapi.entityService.create('api::subscription.subscription', {
        data: {
          organization: organization.id,
          app: appId,
          selectedModules: moduleIds,
          basePrice: pricing.basePrice,
          pricePerUser: pricing.pricePerUser,
          totalUsers: 1,
          calculatedPrice: pricing.totalMonthly,
          status: 'active',
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log(`✅ Created default organization for platform admin: ${orgName} (${slug})`);
  return organization;
}

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
  } else {
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

  await ensurePlatformAdminOrganization(strapi, user);
}

module.exports = { seedPlatformAdmin };
