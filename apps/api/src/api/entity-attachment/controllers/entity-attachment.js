'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const {
  UID,
  SUBJECT_TYPES,
  createEntityAttachment,
  serializeAttachmentRow,
} = require('../../../utils/entity-attachments');

const CONTACT_UID = 'api::contact.contact';
const LEAD_UID = 'api::lead-company.lead-company';
const DEAL_UID = 'api::deal.deal';
const CLIENT_ACCOUNT_UID = 'api::client-account.client-account';
const MEETING_UID = 'api::meeting.meeting';
const TASK_UID = 'api::task.task';
const PROJECT_UID = 'api::project.project';

function orgIdFromRelation(rel) {
  if (rel == null) return null;
  if (typeof rel === 'object') return rel.id ?? null;
  return rel;
}

async function assertEntityAccess(strapi, ctx, subjectType, subjectId) {
  const orgId = ctx.state.orgId;
  const id = Number(subjectId);
  if (!Number.isFinite(id) || id < 1) return { error: ctx.badRequest('Invalid subjectId') };

  const map = {
    contact: { uid: CONTACT_UID, label: 'Contact' },
    deal: { uid: DEAL_UID, label: 'Deal' },
    lead_company: { uid: LEAD_UID, label: 'Lead company' },
    client_account: { uid: CLIENT_ACCOUNT_UID, label: 'Client account' },
    meeting: { uid: MEETING_UID, label: 'Meeting' },
    task: { uid: TASK_UID, label: 'Task' },
    project: { uid: PROJECT_UID, label: 'Project' },
  };

  const entry = map[subjectType];
  if (!entry) return { error: ctx.badRequest('Invalid subjectType') };

  const entity = await strapi.entityService.findOne(entry.uid, id, {
    populate: ['organization'],
  });
  if (!entity) return { error: ctx.notFound(`${entry.label} not found`) };
  if (orgIdFromRelation(entity.organization) !== orgId) {
    return { error: ctx.forbidden('Access denied') };
  }
  return { entity };
}

module.exports = createCoreController(UID, ({ strapi }) => ({
  /**
   * GET /entity-attachments/list?subjectType=&subjectId=
   */
  async list(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');

    const subjectType = String(ctx.query?.subjectType || '').trim();
    const subjectIdRaw = ctx.query?.subjectId;
    if (!SUBJECT_TYPES.has(subjectType)) return ctx.badRequest('Invalid subjectType');
    if (subjectIdRaw == null || String(subjectIdRaw).trim() === '') {
      return ctx.badRequest('subjectId is required');
    }

    const access = await assertEntityAccess(strapi, ctx, subjectType, subjectIdRaw);
    if (access.error) return access.error;

    const rows = await strapi.entityService.findMany(UID, {
      filters: {
        organization: ctx.state.orgId,
        subjectType,
        subjectId: Number(subjectIdRaw),
      },
      sort: { createdAt: 'desc' },
      limit: 200,
      populate: ['file', 'uploadedBy'],
    });

    return {
      data: (rows || []).map(serializeAttachmentRow),
      meta: { total: (rows || []).length },
    };
  },

  /**
   * GET /entity-attachments/count?subjectType=&subjectId=
   */
  async count(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');

    const subjectType = String(ctx.query?.subjectType || '').trim();
    const subjectIdRaw = ctx.query?.subjectId;
    if (!SUBJECT_TYPES.has(subjectType)) return ctx.badRequest('Invalid subjectType');
    if (subjectIdRaw == null || String(subjectIdRaw).trim() === '') {
      return ctx.badRequest('subjectId is required');
    }

    const access = await assertEntityAccess(strapi, ctx, subjectType, subjectIdRaw);
    if (access.error) return access.error;

    const total = await strapi.db.query(UID).count({
      where: {
        organization: ctx.state.orgId,
        subjectType,
        subjectId: Number(subjectIdRaw),
      },
    });

    return { data: { count: total } };
  },

  /**
   * POST /entity-attachments
   * Body: { subjectType, subjectId, fileId, source? }
   */
  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');

    const body = ctx.request?.body || {};
    const payload = body.data || body;
    const subjectType = String(payload?.subjectType || '').trim();
    const subjectId = payload?.subjectId;
    const fileId = payload?.fileId;
    const source = payload?.source === 'chat' ? 'chat' : 'files_tab';

    if (!SUBJECT_TYPES.has(subjectType)) return ctx.badRequest('Invalid subjectType');
    if (subjectId == null) return ctx.badRequest('subjectId is required');
    if (fileId == null) return ctx.badRequest('fileId is required');

    const access = await assertEntityAccess(strapi, ctx, subjectType, subjectId);
    if (access.error) return access.error;

    const row = await createEntityAttachment(strapi, {
      organizationId: ctx.state.orgId,
      userId: ctx.state.user?.id,
      subjectType,
      subjectId,
      fileId,
      source,
    });
    if (!row) return ctx.badRequest('Invalid fileId');

    return { data: serializeAttachmentRow(row) };
  },

  /**
   * DELETE /entity-attachments/:id
   */
  async delete(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    if (!ctx.state.orgId) return ctx.forbidden('No active organization');

    const id = Number(ctx.params?.id);
    if (!Number.isFinite(id) || id < 1) return ctx.badRequest('Invalid id');

    const row = await strapi.entityService.findOne(UID, id, {
      populate: ['organization'],
    });
    if (!row) return ctx.notFound('Attachment not found');
    if (orgIdFromRelation(row.organization) !== ctx.state.orgId) {
      return ctx.forbidden('Access denied');
    }

    await strapi.entityService.delete(UID, id);
    return { data: { id, deleted: true } };
  },
}));
