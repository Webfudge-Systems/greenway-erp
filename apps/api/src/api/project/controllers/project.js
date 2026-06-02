'use strict';

/**
 * project controller
 * - Requires ctx.state.user + ctx.state.orgId (global jwt-auth).
 * - CRUD is scoped to organization (tenant isolation).
 */

const { createCoreController } = require('@strapi/strapi').factories;
const {
  orgIdFromRelation,
  readListQuery,
  createPopulateSanitizer,
  safeCount,
  resolveEntityPkForRouteParam,
} = require('../../../utils/content-api-helpers');
const { logCrmActivity, collectChangedKeys, actorDisplayName } = require('../../../utils/crm-activity-log');
const { emitUpdateNotifications, projectStakeholderIds } = require('../../../utils/notification-emitter');
const {
  requireModuleAccess,
  isPmOrgAdminRole,
  isPmOrgManagerRole,
  isPmOrgMemberRole,
  userCanAccessProjectRow,
} = require('../../../utils/rbac');

const UID = 'api::project.project';
const CLIENT_ACCOUNT_UID = 'api::client-account.client-account';

const ALLOWED_POPULATE = new Set([
  'projectManager',
  'teamMembers',
  'tasks',
  'clientAccount',
  'organization',
  'sourceDeal',
]);

const sanitizePopulate = createPopulateSanitizer(ALLOWED_POPULATE, [
  'projectManager',
  'clientAccount',
  'organization',
  'sourceDeal',
]);

async function assertClientAccountInOrg(strapi, clientAccountId, orgId) {
  if (clientAccountId == null || clientAccountId === '') return null;
  const id =
    typeof clientAccountId === 'object'
      ? clientAccountId.id ?? clientAccountId.documentId
      : Number(clientAccountId);
  if (!id || Number.isNaN(id)) return 'Invalid client account';
  const row = await strapi.entityService.findOne(CLIENT_ACCOUNT_UID, id, {
    populate: ['organization'],
  });
  if (!row || orgIdFromRelation(row.organization) !== orgId) {
    return 'Client account not found in this organization';
  }
  return null;
}

module.exports = createCoreController(UID, ({ strapi }) => ({
  /**
   * Org client accounts for PM project client picker (PM projects read; no CRM module required on client).
   */
  async clientOptions(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');
    const denied = requireModuleAccess(ctx, 'pm', 'projects', 'read');
    if (denied) return denied;

    const rows = await strapi.entityService.findMany(CLIENT_ACCOUNT_UID, {
      filters: { organization: ctx.state.orgId },
      fields: ['companyName', 'status'],
      sort: { companyName: 'asc' },
      limit: 500,
    });

    const data = (rows || []).map((row) => ({
      id: row.id,
      companyName: row.companyName || '',
      status: row.status || null,
      label: row.companyName || `Account ${row.id}`,
    }));

    return { data };
  },

  async find(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');
    const denied = requireModuleAccess(ctx, 'pm', 'projects', 'read');
    if (denied) return denied;

    const { query, page, pageSize, sort } = readListQuery(ctx, {
      maxPageSize: 500,
      defaultPageSize: 25,
      defaultSort: 'updatedAt:desc',
    });

    const filters = { organization: ctx.state.orgId };
    if (isPmOrgMemberRole(ctx) && ctx.state.user?.id) {
      const uid = ctx.state.user.id;
      filters.$or = [{ projectManager: uid }, { teamMembers: uid }];
    }
    const extra = query.filters;
    if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
      if (extra.clientAccount) filters.clientAccount = extra.clientAccount;
      if (extra.status) filters.status = extra.status;
      if (extra.sourceDeal) filters.sourceDeal = extra.sourceDeal;
    }

    const results = await strapi.entityService.findMany(UID, {
      filters,
      start: (page - 1) * pageSize,
      limit: pageSize,
      sort,
      populate: sanitizePopulate(query.populate),
    });

    const total = await safeCount(strapi, UID, filters, results.length);
    const pageCount = Math.ceil(Math.max(total, 1) / pageSize);
    return { data: results, meta: { pagination: { page, pageSize, pageCount, total } } };
  },

  async findOne(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');
    const denied = requireModuleAccess(ctx, 'pm', 'projects', 'read');
    if (denied) return denied;

    const pk = await resolveEntityPkForRouteParam(strapi, UID, ctx.params.id);
    if (pk == null) return ctx.notFound();

    const sanitized = sanitizePopulate(ctx.query?.populate);
    const populate = [...new Set([...(Array.isArray(sanitized) ? sanitized : []), 'organization'])];
    const entry = await strapi.entityService.findOne(UID, pk, {
      populate,
    });
    if (!entry) return ctx.notFound();
    if (orgIdFromRelation(entry.organization) !== ctx.state.orgId) {
      return ctx.forbidden('Access denied');
    }
    if (isPmOrgMemberRole(ctx) && ctx.state.user?.id) {
      const gate = await strapi.entityService.findOne(UID, pk, {
        populate: ['teamMembers', 'projectManager'],
      });
      if (!userCanAccessProjectRow(gate, ctx.state.user.id)) {
        return ctx.forbidden('Access denied');
      }
    }
    return { data: entry };
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');
    const denied = requireModuleAccess(ctx, 'pm', 'projects', 'write');
    if (denied) return denied;
    if (isPmOrgMemberRole(ctx)) {
      return ctx.forbidden('Members cannot create projects');
    }

    const body = ctx.request?.body || {};
    const payload = body.data || body;
    const data = typeof payload === 'object' ? { ...payload } : {};

    data.organization = ctx.state.orgId;
    if (data.projectManager == null && ctx.state.user?.id) {
      data.projectManager = ctx.state.user.id;
    }

    delete data.id;
    delete data.documentId;

    if (data.clientAccount != null && data.clientAccount !== '') {
      const clientErr = await assertClientAccountInOrg(strapi, data.clientAccount, ctx.state.orgId);
      if (clientErr) return ctx.badRequest(clientErr);
    }

    const entry = await strapi.entityService.create(UID, { data });
    try {
      const lookupKey = entry?.id ?? entry?.documentId;
      const forLog =
        lookupKey != null
          ? await strapi.entityService.findOne(UID, lookupKey, {
              populate: ['projectManager', 'clientAccount', 'teamMembers'],
            })
          : entry;
      await logCrmActivity(strapi, {
        organizationId: ctx.state.orgId,
        actorUserId: ctx.state.user?.id,
        action: 'create',
        subjectType: 'project',
        entity: forLog,
        changedKeys: null,
      });
    } catch (_) {
      /* best-effort */
    }
    return { data: entry };
  },

  async update(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');
    const denied = requireModuleAccess(ctx, 'pm', 'projects', 'write');
    if (denied) return denied;

    const pk = await resolveEntityPkForRouteParam(strapi, UID, ctx.params.id);
    if (pk == null) return ctx.notFound();

    const existing = await strapi.entityService.findOne(UID, pk, {
      populate: ['organization', 'projectManager', 'clientAccount', 'teamMembers'],
    });
    if (!existing) return ctx.notFound();
    if (orgIdFromRelation(existing.organization) !== ctx.state.orgId) {
      return ctx.forbidden('Access denied');
    }
    if (isPmOrgMemberRole(ctx)) {
      return ctx.forbidden('Members cannot edit project settings');
    }
    if (
      isPmOrgManagerRole(ctx) &&
      !isPmOrgAdminRole(ctx) &&
      ctx.state.user?.id &&
      !userCanAccessProjectRow(existing, ctx.state.user.id)
    ) {
      return ctx.forbidden('You can only edit projects you are assigned to manage');
    }

    const body = ctx.request?.body || {};
    const payload = body.data || body;
    const data = typeof payload === 'object' ? { ...payload } : {};
    delete data.organization;

    if (Object.prototype.hasOwnProperty.call(data, 'clientAccount') && data.clientAccount !== '') {
      const clientErr = await assertClientAccountInOrg(strapi, data.clientAccount, ctx.state.orgId);
      if (clientErr) return ctx.badRequest(clientErr);
    }

    await strapi.entityService.update(UID, pk, { data });
    const changedKeys = collectChangedKeys(data);

    // Reload full row for response + timeline — Strapi 5 update() may omit numeric `id` on the
    // returned entry, which caused logCrmActivity to skip so name edits never appeared.
    const forLog = await strapi.entityService.findOne(UID, pk, {
      populate: ['projectManager', 'clientAccount', 'teamMembers'],
    });

    try {
      const actorName = await actorDisplayName(strapi, ctx.state.user?.id);
      await emitUpdateNotifications(strapi, {
        organizationId: ctx.state.orgId,
        actorUserId: ctx.state.user?.id,
        actorName,
        subjectType: 'project',
        subjectId: pk,
        entityName: (forLog?.name || 'Project').trim() || 'Project',
        changedKeys,
        stakeholderIds: projectStakeholderIds(existing),
        previousEntity: existing,
        patch: data,
      });
      await logCrmActivity(strapi, {
        organizationId: ctx.state.orgId,
        actorUserId: ctx.state.user?.id,
        action: 'update',
        subjectType: 'project',
        entity: forLog,
        subjectId: pk,
        changedKeys,
        previousEntity: existing,
        patch: data,
      });
    } catch (_) {
      /* best-effort */
    }
    return { data: forLog };
  },

  async delete(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');
    const denied = requireModuleAccess(ctx, 'pm', 'projects', 'manage');
    if (denied) return denied;

    const pk = await resolveEntityPkForRouteParam(strapi, UID, ctx.params.id);
    if (pk == null) return ctx.notFound();

    const existing = await strapi.entityService.findOne(UID, pk, {
      populate: ['organization'],
    });
    if (!existing) return ctx.notFound();
    if (orgIdFromRelation(existing.organization) !== ctx.state.orgId) {
      return ctx.forbidden('Access denied');
    }
    if (
      isPmOrgManagerRole(ctx) &&
      !isPmOrgAdminRole(ctx) &&
      ctx.state.user?.id &&
      !userCanAccessProjectRow(existing, ctx.state.user.id)
    ) {
      return ctx.forbidden('You can only delete projects you are assigned to manage');
    }

    const entry = await strapi.entityService.delete(UID, pk);
    try {
      await logCrmActivity(strapi, {
        organizationId: ctx.state.orgId,
        actorUserId: ctx.state.user?.id,
        action: 'delete',
        subjectType: 'project',
        entity: existing,
        changedKeys: null,
      });
    } catch (_) {
      /* best-effort */
    }
    return { data: entry };
  },
}));
