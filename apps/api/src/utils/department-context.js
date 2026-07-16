'use strict';

const DEPARTMENT_UID = 'api::department.department';
const ORG_USER_UID = 'api::organization-user.organization-user';

function normalizeIdList(raw) {
  if (raw == null) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const ids = [];
  for (const item of list) {
    const id =
      typeof item === 'object' && item != null
        ? item.id ?? item.documentId
        : Number.parseInt(String(item), 10);
    if (id && !Number.isNaN(id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

function departmentIdsFromMembership(membership) {
  const raw = membership?.departments;
  const list = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  return list
    .map((d) => {
      if (typeof d === 'object' && d != null) return Number(d.id);
      return Number(d);
    })
    .filter((id) => id && !Number.isNaN(id));
}

function primaryDepartmentIdFromMembership(membership) {
  const primary = membership?.primaryDepartment;
  if (typeof primary === 'object' && primary?.id) return primary.id;
  if (primary != null && primary !== '') return Number(primary);
  const fromList = departmentIdsFromMembership(membership);
  return fromList[0] ?? null;
}

/**
 * Validate department ids belong to the given organization.
 * @returns {Promise<number[]>} normalized ids
 */
async function validateDepartmentsInOrg(strapi, orgId, departmentIds) {
  const ids = normalizeIdList(departmentIds);
  if (!ids.length) return [];

  const rows = await strapi.entityService.findMany(DEPARTMENT_UID, {
    filters: { id: { $in: ids }, organization: orgId },
    fields: ['id'],
    limit: ids.length,
  });
  const found = new Set((rows || []).map((r) => r.id));
  const missing = ids.filter((id) => !found.has(id));
  if (missing.length) {
    throw new Error('One or more departments are invalid for this organization');
  }
  return ids;
}

/**
 * Persist departments + optional primary on organization-user membership.
 */
async function applyMembershipDepartments(strapi, membershipId, orgId, { departmentIds, primaryDepartmentId } = {}) {
  const ids = await validateDepartmentsInOrg(strapi, orgId, departmentIds);
  let primary = primaryDepartmentId != null ? Number(primaryDepartmentId) : null;
  if (primary && !ids.includes(primary)) {
    throw new Error('Primary department must be included in assigned departments');
  }
  if (!primary && ids.length) primary = ids[0];

  const data = { departments: ids };
  if (primary) data.primaryDepartment = primary;
  else data.primaryDepartment = null;

  return strapi.entityService.update(ORG_USER_UID, membershipId, {
    data,
    populate: ['departments', 'primaryDepartment'],
  });
}

function departmentsPayload(membership) {
  const raw = membership?.departments;
  const list = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  const departments = list
    .filter((d) => d && typeof d === 'object')
    .map((d) => ({
      id: d.id,
      name: d.name || '',
      isActive: d.isActive !== false,
    }));
  const primaryDepartmentId = primaryDepartmentIdFromMembership(membership);
  return { departments, primaryDepartmentId };
}

/**
 * When X-Department-Id is active, scope list filters to that department.
 */
function mergeDepartmentScopeFilter(filters, departmentId) {
  if (!departmentId) return filters;
  return { ...filters, department: departmentId };
}

/**
 * Task + project subject ids visible in a PM department feed.
 * Tasks match when task.department matches or any linked project is in the department.
 */
async function pmSubjectIdsForDepartment(strapi, orgId, departmentId) {
  const PROJECT_UID = 'api::project.project';
  const TASK_UID = 'api::task.task';
  if (!orgId || !departmentId) return { projectIds: [], taskIds: [] };

  const projectRows = await strapi.entityService.findMany(PROJECT_UID, {
    filters: { organization: orgId, department: departmentId },
    fields: ['id'],
    limit: 5000,
  });
  const projectIds = (projectRows || []).map((r) => r.id).filter((id) => id != null);

  const taskOr = [{ department: departmentId }];
  if (projectIds.length) {
    taskOr.push({ projects: { id: { $in: projectIds } } });
  }

  const taskRows = await strapi.entityService.findMany(TASK_UID, {
    filters: { organization: orgId, $or: taskOr },
    fields: ['id'],
    limit: 5000,
  });
  const taskIds = (taskRows || []).map((r) => r.id).filter((id) => id != null);

  return { projectIds, taskIds };
}

/**
 * Build $or filters for CRM activity feed rows scoped to a PM department.
 */
function pmActivityDepartmentFeedOr({ departmentId, projectIds, taskIds, subjectTypes = [] }) {
  const allowProject = !subjectTypes.length || subjectTypes.includes('project');
  const allowTask = !subjectTypes.length || subjectTypes.includes('task');
  const or = [];

  if (departmentId) {
    or.push({ department: departmentId });
  }

  if (allowProject && projectIds.length) {
    or.push({
      department: { $null: true },
      subjectType: 'project',
      subjectId: { $in: projectIds },
    });
  }
  if (allowTask && taskIds.length) {
    or.push({
      department: { $null: true },
      subjectType: 'task',
      subjectId: { $in: taskIds },
    });
  }

  return or;
}

/**
 * Resolve whether the user may use this department in the active org.
 */
async function resolveDepartmentContext(strapi, ctx) {
  const departmentHeader = ctx.request?.headers?.['x-department-id'];
  if (!departmentHeader) return;

  const departmentId = Number.parseInt(String(departmentHeader), 10);
  if (!departmentId || Number.isNaN(departmentId)) return;

  const orgId = ctx.state.orgId;
  if (!orgId) return;

  const dept = await strapi.entityService.findOne(DEPARTMENT_UID, departmentId, {
    fields: ['id', 'name', 'isActive'],
    populate: ['organization'],
  });
  if (!dept) return;

  const deptOrgId =
    typeof dept.organization === 'object' ? dept.organization?.id : dept.organization;
  if (Number(deptOrgId) !== Number(orgId)) return;

  if (ctx.state.platformAdminContext) {
    ctx.state.departmentId = departmentId;
    ctx.state.department = dept;
    return;
  }

  const membership = ctx.state.orgMembership;
  if (!membership) return;

  const assigned = departmentIdsFromMembership(membership);
  if (assigned.length === 0) {
    ctx.state.departmentId = departmentId;
    ctx.state.department = dept;
    return;
  }

  if (assigned.includes(departmentId)) {
    ctx.state.departmentId = departmentId;
    ctx.state.department = dept;
  }
}

module.exports = {
  DEPARTMENT_UID,
  applyMembershipDepartments,
  departmentIdsFromMembership,
  departmentsPayload,
  mergeDepartmentScopeFilter,
  normalizeIdList,
  pmActivityDepartmentFeedOr,
  pmSubjectIdsForDepartment,
  primaryDepartmentIdFromMembership,
  resolveDepartmentContext,
  validateDepartmentsInOrg,
};
