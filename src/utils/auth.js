const AUTH_KEY = 'baholash_auth'

export function getAuth() {
  const raw = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY)
  if (!raw) return { token: null, role: null }
  try {
    const parsed = JSON.parse(raw)
    return {
      token: parsed.token || null,
      role: parsed.role || null,
      fullName: parsed.fullName || null,
    }
  } catch {
    return { token: null, role: null }
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(AUTH_KEY)
}
