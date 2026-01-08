const BASE = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')

export type Coach = { 
  id: string; 
  email: string; 
  name: string; 
  phone?: string;
  defaultRate?: number;
  currency?: string;
  timezone?: string;
  workHours?: Array<{ day: number; start: string; end: string }>;
  businessName?: string;
  taxId?: string;
  address?: string;
  acceptedPayments?: string[];
  cancellationPolicy?: { hours?: number; feePercent?: number };
  holidays?: string[];
  invoicePrefix?: string;
}

export type Student = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  birthdate?: string;
  level?: string;
  hand?: 'right' | 'left';
  notes?: string;
  tags?: string[];
  goals?: string[];
  guardianName?: string;
  guardianPhone?: string;
  defaultRate?: number;
  currency?: string;
  balance: number;
  packageCredits: number;
}

export type Lesson = {
  id: string;
  coachId: string;
  additionalCoaches?: string[];
  studentId?: string;
  student?: { name: string; email?: string; phone?: string };
  type: 'private' | 'group';
  participants?: Array<{ studentId: string; price?: number }>;
  start: string;
  end: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  price?: number;
  pricingMode: 'per_lesson' | 'per_student';
  currency: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  location?: string;
  court?: string;
  capacity?: number;
  notes?: string;
  cancellationReason?: string;
  attendance?: Array<{ studentId: string; present: boolean; notes?: string }>;
}

export type Payment = {
  id: string;
  studentId: string;
  lessonId?: string;
  amount: number;
  currency: string;
  method: 'cash' | 'transfer' | 'mp' | 'card';
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  date: string;
  reference?: string;
  notes?: string;
}

export type AuthResponse = { token: string; coach: Coach }

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

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

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers: h, credentials: 'omit' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new ApiError(data?.error || `HTTP ${res.status}`, res.status)
    }
    return res.status === 204 ? (undefined as unknown as T) : res.json()
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new Error(err.message || 'Network error');
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>(`/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email: string, password: string, name: string, phone?: string) =>
      request<AuthResponse>(`/auth/register`, { method: 'POST', body: JSON.stringify({ email, password, name, phone }) }),
  },
  students: {
    list: () => request<Student[]>(`/students`),
    create: (data: Partial<Student>) =>
      request<{ id: string }>(`/students`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Student>) =>
      request<void>(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/students/${id}`, { method: 'DELETE' }),
    syncBalances: () => request<{ message: string }>(`/students/sync-balances`, { method: 'POST' }),
  },
  lessons: {
    list: (query?: { from?: string; to?: string }) => {
      const q = new URLSearchParams(query as any).toString()
      return request<Lesson[]>(`/lessons${q ? `?${q}` : ''}`)
    },
    create: (data: Partial<Lesson>) =>
      request<{ id: string }>(`/lessons`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Lesson>) =>
      request<void>(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/lessons/${id}`, { method: 'DELETE' }),
  },
  payments: {
    list: () => request<Payment[]>(`/payments`),
    create: (data: Partial<Payment>) =>
      request<Payment>(`/payments`, { method: 'POST', body: JSON.stringify(data) }),
  },
  coach: {
    getProfile: () => request<Coach>(`/coach/profile`),
    updateProfile: (data: Partial<Coach>) =>
      request<Coach>(`/coach/profile`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  health: () => request<{ ok: boolean }>(`/health`),
}
