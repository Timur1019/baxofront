import { apiClient } from './http'

export async function getAppraisalPurposes() {
  const { data } = await apiClient.get('/appraisal-purposes')
  return data
}
