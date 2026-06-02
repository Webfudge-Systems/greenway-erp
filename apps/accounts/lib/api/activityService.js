import strapiClient from '../strapiClient'

class ActivityService {
  async getFeed({ page = 1, pageSize = 20 } = {}) {
    if (typeof window === 'undefined') return { data: [], meta: {} }

    const orgId = localStorage.getItem('current-org-id')
    if (!orgId) return { data: [], meta: {} }

    return strapiClient.get('/crm-activities/feed', {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
    })
  }

  async getTimeline({ entityType, entityId, page = 1, pageSize = 20 } = {}) {
    return strapiClient.get('/crm-activities', {
      'filters[entityType][$eq]': entityType,
      'filters[entityId][$eq]': entityId,
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      sort: 'createdAt:desc',
    })
  }

  async addComment({ entityType, entityId, comment }) {
    return strapiClient.post('/crm-activities', {
      activityType: 'comment',
      entityType,
      entityId,
      comment,
    })
  }

  async getCommentCounts(entityIds = []) {
    if (!entityIds.length) return {}
    return strapiClient.get('/crm-activities/comment-counts', {
      entityIds: entityIds.join(','),
    })
  }
}

const activityService = new ActivityService()
export default activityService
