const BASE = '/api'

export type Coach = { id: string; email: string; name: string; phone?: string }
export type AuthResponse = { token: string; coach: Coach }

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const h = new Headers({ 'Content-Type': 'application/json' })
  const auth = authHeader()
  if (auth?.Authorization) h.set('Authorization', auth.Authorization)
  if (options.headers) {
    const extra = new Headers(options.headers as HeadersInit)
    extra.forEach((v, k) => h.set(k, v))
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers: h, credentials: 'omit' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || `HTTP ${res.status}`)
  }
  return res.status === 204 ? (undefined as unknown as T) : res.json()
}

export const api = {
  // health
  health: () => request<{ ok: boolean }>(`/health`),

  // auth
  login: (email: string, password: string) =>
    request<AuthResponse>(`/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name: string, phone?: string) =>
    request<AuthResponse>(`/auth/register`, { method: 'POST', body: JSON.stringify({ email, password, name, phone }) }),

  // students
  listStudents: () => request<Array<{ id: string; name: string; phone?: string; email?: string }>>(`/students`),
  createStudent: (data: { name: string; phone?: string; email?: string }) =>
    request<{ id: string }>(`/students`, { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: Partial<{ name: string; phone?: string; email?: string }>) =>
    request<void>(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStudent: (id: string) => request<void>(`/students/${id}`, { method: 'DELETE' }),

  // lessons
  listLessons: (query?: { from?: string; to?: string }) => {
    const q = new URLSearchParams(query as any).toString()
    return request<Array<{ id: string; student: { name: string; email?: string; phone?: string }; start: string; end: string; status: string; notes?: string }>>(`/lessons${q ? `?${q}` : ''}`)
  },
  createLesson: (data: { studentId: string; start: string; end: string; notes?: string }) =>
    request<{ id: string }>(`/lessons`, { method: 'POST', body: JSON.stringify(data) }),
  updateLesson: (id: string, data: Partial<{ start: string; end: string; status: 'scheduled' | 'cancelled' | 'completed'; notes?: string }>) =>
    request<void>(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLesson: (id: string) => request<void>(`/lessons/${id}`, { method: 'DELETE' }),
}
