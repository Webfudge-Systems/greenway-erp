import strapiClient from '../strapiClient'

class NotificationService {
  async getNotifications() {
    try {
      const response = await strapiClient.get('/notifications', {
        'pagination[pageSize]': 20,
        sort: 'createdAt:desc',
      })
      return response?.data || []
    } catch {
      return []
    }
  }

  transformNotification(item) {
    const a = item?.attributes || item || {}
    return {
      id: item?.id || a.id,
      title: a.title || 'Notification',
      message: a.message || 'No message',
      isRead: !!a.isRead,
      timeAgo: a.createdAt ? new Date(a.createdAt).toLocaleString() : 'now',
    }
  }

  async markAsRead(notificationId) {
    try {
      await strapiClient.put(`/notifications/${notificationId}`, {
        data: { isRead: true, readAt: new Date().toISOString() },
      })
      return true
    } catch {
      return false
    }
  }

  async markAllAsRead() {
    try {
      const notifications = await this.getNotifications()
      await Promise.all(
        notifications.filter((n) => !(n?.isRead ?? n?.attributes?.isRead)).map((n) => this.markAsRead(n.id))
      )
      return true
    } catch {
      return false
    }
  }
}

const notificationService = new NotificationService()
export default notificationService
