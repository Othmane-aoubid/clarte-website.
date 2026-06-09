const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/fr/auth/login'
    }
    throw new Error('Unauthorized')
  }

  if (response.status === 403) {
    throw new Error('Forbidden')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }

  if (response.status === 204) return null
  return response.json()
}
