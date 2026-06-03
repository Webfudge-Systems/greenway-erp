import strapiClient from '../strapiClient'

function normalizeList(response) {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response)) return response
  return []
}

/**
 * Active departments in the current organization (org-scoped API).
 */
export async function listOrgDepartments() {
  const response = await strapiClient.get('/departments', {
    'pagination[pageSize]': 100,
    sort: 'name:asc',
  })
  return normalizeList(response)
    .filter((row) => row.isActive !== false)
    .map((row) => ({
      id: row.id,
      name: row.name || `Department ${row.id}`,
      isActive: row.isActive !== false,
    }))
}
