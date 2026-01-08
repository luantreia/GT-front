import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/ui/SEO'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password, name, phone || undefined)
      nav('/students')
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto mt-16 grid w-full max-w-6xl gap-10 px-2 sm:px-4 lg:grid-cols-[1.5fr,1fr]">
      <SEO 
        title="Crear Cuenta" 
        description="Únete a la plataforma líder para profesores de tenis. Digitaliza tu agenda, alumnos y pagos."
      />
      <article className="rounded-surface bg-white/90 p-8 shadow-card">
        <div className="mb-8 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Registro
          </span>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-slate-900">Crear cuenta</h1>
            <p className="text-sm text-slate-600">
              Completa tus datos para activar tu panel de gestión. Puedes actualizar la información más adelante.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2 space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre completo</span>
            <input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Ingresa tu nombre"
            />
          </label>

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
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</span>
            <input
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoComplete="tel"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Opcional"
            />
          </label>

          <label className="sm:col-span-2 space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contraseña</span>
            <input
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Crea una contraseña segura"
            />
          </label>

          {error && (
            <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-200"
          >
            {loading ? 'Creando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
            Ingresar
          </Link>
        </p>
      </article>

      <aside className="flex flex-col justify-center space-y-6 rounded-surface bg-white/70 p-8 text-slate-600 shadow-surface">
        <h2 className="text-lg font-semibold text-slate-900">Beneficios del panel</h2>
        <ul className="space-y-3 text-sm">
          <li>Seguimiento completo de alumnos con notas y datos de contacto.</li>
          <li>Gestión de clases con historial y recordatorios automáticos.</li>
          <li>Integraciones futuras con facturación y reportes avanzados.</li>
        </ul>
        <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Tip: invita a tu equipo para distribuir tareas y turnos de clase.
        </div>
      </aside>
    </section>
  )
}
