const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://api.greenwaymobility.in' : 'http://localhost:3010')

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = null
  }

  getToken() {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token')
    }
    return this.token
  }

  getCurrentOrgId() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('current-org-id')
  }

  buildQueryString(params = {}) {
    const parts = []
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return
      parts.push(`${k}=${encodeURIComponent(v)}`)
    })
    return parts.join('&')
  }

  async request(endpoint, options = {}) {
    const token = this.getToken()
    const orgId = this.getCurrentOrgId()
    const response = await fetch(`${this.baseURL}/api${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(orgId && { 'X-Organization-Id': orgId }),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.error?.message || errorData?.message || `HTTP ${response.status}`)
    }
    return response.json()
  }

  get(endpoint, params = {}) {
    const qs = this.buildQueryString(params)
    return this.request(qs ? `${endpoint}?${qs}` : endpoint)
  }

  post(endpoint, data = {}) {
    return this.request(endpoint, { method: 'POST', body: data })
  }

  put(endpoint, data = {}) {
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  patch(endpoint, data = {}) {
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

const apiClient = new ApiClient()
export default apiClient
