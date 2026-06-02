import strapiClient from '../strapiClient'

class BillingService {
  async getOverview() {
    const response = await strapiClient.get('/billing/overview')
    return response?.data || response
  }
}

const billingService = new BillingService()
export default billingService
