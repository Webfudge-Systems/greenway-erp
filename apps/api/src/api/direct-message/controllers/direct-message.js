'use strict';

/**
 * Direct messages — scoped to JWT user + optional org (X-Organization-Id).
 * Client cannot spoof sender; recipient must differ from sender.
 */

const { createCoreController } = require('@strapi/strapi').factories;
const UID = 'api::direct-message.direct-message';

const USER_FIELDS = ['id', 'email', 'username', 'firstName', 'lastName'];

module.exports = createCoreController(UID, ({ strapi }) => ({
  /**
   * GET /direct-messages?withUser=<id>
   * Lists messages between current user and withUser (ascending by time).
   */
  async find(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');

    const me = ctx.state.user.id;
    const withUserRaw = ctx.query.withUser ?? ctx.query['filters[withUser][$eq]'];
    const withUserId = parseInt(withUserRaw, 10);

    if (Number.isNaN(withUserId) || withUserId < 1) {
      return ctx.badRequest('Query parameter withUser (numeric user id) is required');
    }

    if (withUserId === me) {
      return ctx.badRequest('Cannot list a conversation with yourself');
    }

    const filters = {
      $and: [
        {
          $or: [{ sender: { id: { $eq: me } } }, { recipient: { id: { $eq: me } } }],
        },
      ],
    };
    if (ctx.state.orgId) {
      filters.$and.push({ organization: { id: { $eq: ctx.state.orgId } } });
    }

    const poolLimit = Math.min(
      parseInt(ctx.query['pagination[pageSize]'] || ctx.query.pageSize || '500', 10),
      500
    );

    const pool = await strapi.entityService.findMany(UID, {
      filters,
      sort: { createdAt: 'desc' },
      limit: poolLimit,
      populate: {
        sender: { fields: USER_FIELDS },
        recipient: { fields: USER_FIELDS },
      },
    });

    const thread = pool
      .filter((m) => {
        const sid = m.sender?.id;
        const rid = m.recipient?.id;
        return (sid === me && rid === withUserId) || (sid === withUserId && rid === me);
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return { data: thread };
  },

  async findOne(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');
    const { id } = ctx.params;
    const me = ctx.state.user.id;

    const msg = await strapi.entityService.findOne(UID, id, {
      populate: { sender: { fields: USER_FIELDS }, recipient: { fields: USER_FIELDS } },
    });
    if (!msg) return ctx.notFound();

    const sid = msg.sender?.id;
    const rid = msg.recipient?.id;
    if (sid !== me && rid !== me) return ctx.forbidden('Access denied');

    return { data: msg };
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Missing or invalid credentials');

    const body = ctx.request.body || {};
    const payload = body.data || body;
    const content = typeof payload.content === 'string' ? payload.content.trim() : '';
    const recipientRaw = payload.recipient ?? payload.recipientId;
    const recipientId = parseInt(recipientRaw, 10);

    if (!content) return ctx.badRequest('content is required');
    if (Number.isNaN(recipientId) || recipientId < 1) return ctx.badRequest('recipient (user id) is required');

    const me = ctx.state.user.id;
    if (recipientId === me) return ctx.badRequest('Cannot send a message to yourself');

    const recipientUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: recipientId },
    });
    if (!recipientUser) return ctx.badRequest('Recipient not found');

    const data = {
      content,
      sender: me,
      recipient: recipientId,
    };
    if (ctx.state.orgId) {
      data.organization = ctx.state.orgId;
    }

    const entry = await strapi.entityService.create(UID, {
      data,
      populate: {
        sender: { fields: USER_FIELDS },
        recipient: { fields: USER_FIELDS },
      },
    });

    return { data: entry };
  },

  async update(ctx) {
    ctx.status = 405;
    return { error: { message: 'Method not allowed' } };
  },

  async delete(ctx) {
    ctx.status = 405;
    return { error: { message: 'Method not allowed' } };
  },
}));
