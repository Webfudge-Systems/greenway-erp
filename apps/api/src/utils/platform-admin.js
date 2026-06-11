'use strict';

function isPlatformAdminUser(user) {
  return Boolean(user?.isPlatformAdmin);
}

/** Platform admin passwords may only be changed by that same user. */
function canChangeUserPassword(actor, targetUser) {
  if (!isPlatformAdminUser(targetUser)) return true;
  return actor?.id != null && String(actor.id) === String(targetUser.id);
}

function requirePlatformAdmin(ctx) {
  if (!ctx.state.user) {
    return ctx.unauthorized('Missing or invalid credentials');
  }
  if (!isPlatformAdminUser(ctx.state.user)) {
    return ctx.forbidden('Platform administrator access required');
  }
  return null;
}

module.exports = {
  isPlatformAdminUser,
  canChangeUserPassword,
  requirePlatformAdmin,
};
