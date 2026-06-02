const { seed } = require('../database/seeds/apps-and-modules');
const rbac = require('./constants/rbac-app-matrix');
const { resolveOrganizationRoleId, ORG_ROLE_UID } = require('./utils/organization-role');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Strapi is bootstrapping...');

    const forceSeed = process.env.SEED_DATA === 'true';
    let runSeed = forceSeed;
    if (!runSeed) {
      const anyApp = await strapi.entityService.findMany('api::app.app', { limit: 1 });
      runSeed = !anyApp?.length;
    }

    if (runSeed) {
      console.log(
        forceSeed
          ? '🌱 Running database seeds (SEED_DATA=true)...'
          : '🌱 No apps in database — running default app/module seeds...'
      );
      try {
        await seed(strapi);
      } catch (error) {
        console.error('❌ Seeding failed:', error);
      }
    }

    // Seed default organization roles for membership templates
    try {
      const defaultOrgRoles = [
        {
          name: 'Admin',
          code: 'admin',
          accessLevel: 'high',
          description: 'Full organization administration access.',
          isSystem: true,
        },
        {
          name: 'Manager',
          code: 'manager',
          accessLevel: 'medium',
          description: 'Operational management access with limited administration.',
          isSystem: true,
        },
        {
          name: 'Member',
          code: 'member',
          accessLevel: 'basic',
          description: 'Standard member access to assigned workspace features.',
          isSystem: true,
        },
      ];

      for (const role of defaultOrgRoles) {
        const perms = rbac.defaultPermissionsForSystemCode(role.code);
        const existing = await strapi.entityService.findMany(ORG_ROLE_UID, {
          filters: {
            $and: [{ name: role.name }, { organization: { $null: true } }],
          },
          limit: 1,
        });
        if (existing.length === 0) {
          await strapi.entityService.create(ORG_ROLE_UID, {
            data: { ...role, permissions: perms },
          });
        } else {
          /** @type {any} */
          const row = existing[0];
          const empty =
            !row.permissions ||
            (typeof row.permissions === 'object' && Object.keys(row.permissions).length === 0);
          if (empty) {
            await strapi.entityService.update(ORG_ROLE_UID, row.id, {
              data: { permissions: perms },
            });
          }
        }
      }

      const memberRoleId = await resolveOrganizationRoleId(strapi, 'Member');
      const memberships = await strapi.entityService.findMany('api::organization-user.organization-user', {
        populate: { role: true },
        limit: 1000,
      });

      for (const membership of memberships) {
        const hasRole = Boolean(membership?.role?.id || membership?.role);
        if (hasRole) continue;
        await strapi.entityService.update('api::organization-user.organization-user', membership.id, {
          data: { role: memberRoleId },
        });
      }
    } catch (e) {
      console.warn('⚠️ Could not seed organization roles:', e?.message || e);
    }

    // Allow REST access to direct-messages (custom JWT in middleware; Strapi sees unauthenticated)
    try {
      const roleTypes = ['public', 'authenticated'];
      const actions = [
        'api::direct-message.direct-message.find',
        'api::direct-message.direct-message.findOne',
        'api::direct-message.direct-message.create',
      ];
      for (const type of roleTypes) {
        const role = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type },
        });
        if (!role) continue;
        for (const action of actions) {
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: role.id },
          });
          if (existing) continue;
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action, role: role.id, enabled: true },
          });
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not auto-grant direct-message permissions:', e?.message || e);
    }

    try {
      const { seedPlatformAdmin } = require('./utils/seed-platform-admin');
      await seedPlatformAdmin(strapi);
    } catch (e) {
      console.warn('⚠️ Could not seed platform admin:', e?.message || e);
    }

    console.log('✅ Bootstrap complete!');
  },
};
