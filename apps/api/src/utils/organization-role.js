'use strict'

const ORG_ROLE_UID = 'api::organization-role.organization-role'

async function findSystemRoleByNameOrCode(strapi, role) {
  const normalized = String(role || '').trim()
  if (!normalized) return null

  const lower = normalized.toLowerCase()

  const byCode = await strapi.entityService.findMany(ORG_ROLE_UID, {
    filters: {
      $and: [{ code: lower }, { organization: { $null: true } }],
    },
    limit: 1,
  })
  if (byCode.length > 0) return byCode[0]

  const byName = await strapi.entityService.findMany(ORG_ROLE_UID, {
    filters: {
      $and: [{ name: normalized }, { organization: { $null: true } }],
    },
    limit: 1,
  })
  if (byName.length > 0) return byName[0]

  return null
}

async function findOrganizationRoleByNameOrCode(strapi, role) {
  return findSystemRoleByNameOrCode(strapi, role)
}

/**
 * Resolve a role id for use in an organization: custom roles in the org take precedence
 * over system templates when codes collide.
 */
async function resolveOrganizationRoleIdForOrg(strapi, role, organizationId) {
  const orgIdNum = organizationId != null ? parseInt(String(organizationId), 10) : NaN
  const hasOrg = !Number.isNaN(orgIdNum) && orgIdNum > 0

  if (typeof role === 'number' && Number.isFinite(role)) {
    return validateOrganizationRoleId(strapi, role, orgIdNum)
  }

  if (typeof role === 'string' && /^\d+$/.test(role.trim())) {
    return validateOrganizationRoleId(strapi, parseInt(role.trim(), 10), orgIdNum)
  }

  const normalized = String(role || '').trim()
  if (!normalized) {
    return resolveOrganizationRoleId(strapi, 'Member')
  }

  const lower = normalized.toLowerCase()

  if (hasOrg) {
    const customByCode = await strapi.entityService.findMany(ORG_ROLE_UID, {
      filters: { organization: orgIdNum, code: lower },
      limit: 1,
    })
    if (customByCode.length > 0) return customByCode[0].id

    const customByName = await strapi.entityService.findMany(ORG_ROLE_UID, {
      filters: { organization: orgIdNum, name: normalized },
      limit: 1,
    })
    if (customByName.length > 0) return customByName[0].id
  }

  const system = await findSystemRoleByNameOrCode(strapi, normalized)
  if (system) return system.id

  throw new Error(`Role "${normalized}" was not found for this organization`)
}

async function validateOrganizationRoleId(strapi, roleId, organizationId) {
  const id = parseInt(String(roleId), 10)
  if (Number.isNaN(id)) {
    throw new Error('Invalid role id')
  }

  const row = await strapi.entityService.findOne(ORG_ROLE_UID, id, {
    populate: ['organization'],
  })
  if (!row) {
    throw new Error('Role not found')
  }

  /** @type {any} */
  const anyRow = row
  if (anyRow.isSystem && !anyRow.organization) {
    return id
  }

  const orgIdNum = organizationId != null ? parseInt(String(organizationId), 10) : NaN
  const roleOrgId =
    typeof anyRow.organization === 'object' ? anyRow.organization?.id : anyRow.organization

  if (!Number.isNaN(orgIdNum) && roleOrgId === orgIdNum) {
    return id
  }

  throw new Error('Role is not available for this organization')
}

async function ensureOrganizationRole(strapi, role = 'Member') {
  const existing = await findSystemRoleByNameOrCode(strapi, role)
  if (existing) return existing

  const normalized = String(role || 'Member').trim()
  const code = normalized.toLowerCase()
  const accessLevel = code === 'admin' ? 'high' : code === 'manager' ? 'medium' : 'basic'

  return strapi.entityService.create(ORG_ROLE_UID, {
    data: {
      name: normalized,
      code,
      accessLevel,
      isSystem: true,
      description: `${normalized} role`,
    },
  })
}

async function resolveOrganizationRoleId(strapi, role = 'Member') {
  const resolved = await ensureOrganizationRole(strapi, role)
  return resolved.id
}

module.exports = {
  ORG_ROLE_UID,
  findOrganizationRoleByNameOrCode,
  findSystemRoleByNameOrCode,
  ensureOrganizationRole,
  resolveOrganizationRoleId,
  resolveOrganizationRoleIdForOrg,
  validateOrganizationRoleId,
}
