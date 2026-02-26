import { apiClient } from './http'

export async function loginApi(payload) {
  const { data } = await apiClient.post('/auth/login', {
    login: payload.login,
    password: payload.password,
  })
  return data
}

