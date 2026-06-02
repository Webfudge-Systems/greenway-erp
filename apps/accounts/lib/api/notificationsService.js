import strapiClient from '../strapiClient'

class NotificationsService {
  async list({ page = 1, pageSize = 20 } = {}) {
    return strapiClient.get('/notifications', {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      sort: 'createdAt:desc',
    })
  }

  async markRead(id) {
    return strapiClient.patch(`/notifications/${id}`, { isRead: true })
  }

  async markAllRead() {
    return strapiClient.post('/notifications/mark-all-read', {})
  }
}

const notificationsService = new NotificationsService()
export default notificationsService
