import { apiClient } from './http'

export async function getRegions() {
  const { data } = await apiClient.get('/regions')
  return data
}

export async function getDistrictsByRegion(regionId) {
  if (!regionId) return []
  const { data } = await apiClient.get(`/regions/${regionId}/districts`)
  return data
}
