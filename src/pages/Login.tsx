import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/ui/SEO'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      nav('/students')
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto mt-16 grid w-full max-w-5xl gap-10 px-2 sm:px-4 lg:grid-cols-[1.4fr,1fr]">
      <SEO 
        title="Iniciar Sesión" 
        description="Accede a tu panel de gestión de tenis para organizar tus clases y alumnos de manera profesional."
      />
      <article className="rounded-surface bg-white/90 p-8 shadow-card">
        <div className="mb-8 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Acceso
          </span>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-slate-900">Bienvenido al panel</h1>
            <p className="text-sm text-slate-600">
              Ingresa tus credenciales para continuar gestionando alumnos, clases y reportes.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <label className="space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
            <input
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="correo@ejemplo.com"
            />
          </label>

          <label className="space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contraseña</span>
            <input
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600" aria-live="polite">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-200"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <button type="button" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-200 hover:bg-brand-50">
              Usar autenticación federada
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500">
            Regístrate aquí
          </Link>
        </p>
      </article>

      <aside className="hidden flex-col justify-center space-y-6 rounded-surface bg-white/70 p-8 text-slate-600 shadow-surface lg:flex">
        <h2 className="text-lg font-semibold text-slate-900">La plataforma para coordinar tu academia</h2>
        <ul className="space-y-3 text-sm">
          <li>Visualiza el historial de clases y asistencia en un solo lugar.</li>
          <li>Administra alumnos con fichas completas y notas personalizadas.</li>
          <li>Próximamente: análisis automáticos y dashboards comparativos.</li>
        </ul>
        <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Consejo: guarda tu sesión para acceder más rápido desde dispositivos verificados.
        </div>
      </aside>
    </section>
  )
}
