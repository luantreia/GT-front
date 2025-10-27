import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, type Coach } from '../lib/api'

type AuthState = {
  token: string | null
  coach: Coach | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [coach, setCoach] = useState<Coach | null>(null)

  useEffect(() => {
    if (!token) setCoach(null)
  }, [token])

  const value = useMemo<AuthState>(() => ({
    token,
    coach,
    login: async (email, password) => {
      const res = await api.login(email, password)
      localStorage.setItem('token', res.token)
      setToken(res.token)
      setCoach(res.coach)
    },
    register: async (email, password, name, phone) => {
      const res = await api.register(email, password, name, phone)
      localStorage.setItem('token', res.token)
      setToken(res.token)
      setCoach(res.coach)
    },
    logout: () => {
      localStorage.removeItem('token')
      setToken(null)
      setCoach(null)
    }
  }), [token, coach])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
