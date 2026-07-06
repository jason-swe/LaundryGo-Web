import { authenticatedApiRequest } from '../utils/api'

const unwrapData = (payload) => payload?.data ?? payload

export const getUserProfile = async () => {
  const payload = await authenticatedApiRequest('/api/v1/users/profile')
  return unwrapData(payload)
}

export const getUserProfileSummary = async () => {
  const payload = await authenticatedApiRequest('/api/v1/users/profile/summary')
  return unwrapData(payload)
}

export const updateUserProfile = async (profile) => {
  const payload = await authenticatedApiRequest('/api/v1/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
  return unwrapData(payload)
}
