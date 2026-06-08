'use strict';

const ORG_USER_UID = 'api::organization-user.organization-user';

const MAX_ORGANIZATIONS_PER_USER = 1;

const ORGANIZATION_LIMIT_MESSAGE =
  'Each user can only have one organization. To create additional organizations, contact the Webfudge Systems Team.';

async function countUserOrganizations(strapi, userId) {
  if (!userId) return 0;
  return strapi.db.query(ORG_USER_UID).count({
    where: { user: userId, isActive: true },
  });
}

async function assertUserCanCreateOrganization(strapi, userId) {
  const count = await countUserOrganizations(strapi, userId);
  if (count >= MAX_ORGANIZATIONS_PER_USER) {
    throw new Error(ORGANIZATION_LIMIT_MESSAGE);
  }
}

module.exports = {
  MAX_ORGANIZATIONS_PER_USER,
  ORGANIZATION_LIMIT_MESSAGE,
  countUserOrganizations,
  assertUserCanCreateOrganization,
};
