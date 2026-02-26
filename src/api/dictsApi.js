import { apiClient } from './http'

export async function fetchStatuses() {
  const { data } = await apiClient.get('/dicts/statuses')
  return data
}

export async function fetchRegions() {
  const { data } = await apiClient.get('/dicts/regions')
  return data
}

export async function fetchDistricts(regionCode) {
  const { data } = await apiClient.get('/dicts/districts', {
    params: { regionCode },
  })
  return data
}

