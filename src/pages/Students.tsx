import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

type Student = { id: string; name: string; phone?: string; email?: string }

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const stats = useMemo(
    () => [
      {
        label: 'Alumnos activos',
        value: students.length,
        description: 'Registros totales en la plataforma'
      },
      {
        label: 'Contactos con email',
        value: students.filter(s => Boolean(s.email)).length,
        description: 'Alumnos con correo registrado'
      },
      {
        label: 'Contactos con teléfono',
        value: students.filter(s => Boolean(s.phone)).length,
        description: 'Alumnos con teléfono cargado'
      }
    ],
    [students]
  )

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listStudents()
      setStudents(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.createStudent({ name, phone: phone || undefined, email: email || undefined })
      setName(''); setPhone(''); setEmail('')
      await load()
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function remove(id: string) {
    if (!confirm('Eliminar alumno?')) return
    await api.deleteStudent(id)
    await load()
  }

  function openEdit(s: Student) {
    setEditStudent(s)
    setEditName(s.name)
    setEditPhone(s.phone || '')
    setEditEmail(s.email || '')
    setShowEditModal(true)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editStudent) return
    try {
      await api.updateStudent(editStudent.id, { name: editName, phone: editPhone || undefined, email: editEmail || undefined })
      await load()
      setShowEditModal(false)
      setEditStudent(null)
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <section className="space-y-10">
      <header className="grid gap-6 rounded-surface bg-white/80 p-6 shadow-surface sm:grid-cols-[2fr,3fr]">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Gestión
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Alumnos</h1>
            <p className="text-sm text-slate-600">
              Registra, visualiza y organiza la base de alumnos de tu academia con una vista clara y responsiva.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(item => (
            <article key={item.label} className="rounded-2xl bg-white p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            </article>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-surface bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-slate-900">Agregar alumno</h2>
          <p className="mt-1 text-sm text-slate-600">Completa los datos para sumar un nuevo alumno al sistema.</p>

          <form onSubmit={addStudent} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 space-y-1 text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</span>
              <input
                placeholder="Nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </label>
            <label className="space-y-1 text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</span>
              <input
                placeholder="Opcional"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </label>
            <label className="space-y-1 text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
              <input
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </label>
            <button
              type="submit"
              className="sm:col-span-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400"
            >
              Agregar alumno
            </button>
          </form>
        </div>

        <aside className="rounded-surface bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-slate-900">Consejos rápidos</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Utiliza datos completos para optimizar la comunicación con los alumnos.</li>
            <li>Crea etiquetas personalizadas desde el panel para segmentar grupos.</li>
            <li>Sincroniza tus listas con campañas de email para avisos importantes.</li>
          </ul>
        </aside>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-surface bg-white/60 px-6 py-4 text-sm text-slate-600 shadow-surface">
            Cargando alumnos...
          </div>
        ) : error ? (
          <div className="rounded-surface border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-surface">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-surface bg-white px-6 py-10 text-center text-sm text-slate-600 shadow-surface">
            Aún no hay alumnos registrados. ¡Agrega el primero!
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {students.length} resultados
              </span>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {students.map(s => (
                <li key={s.id} className="flex flex-col justify-between rounded-surface bg-white p-5 shadow-card">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">Alumno</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Email</span>
                        <span>{s.email ?? 'Sin registro'}</span>
                      </p>
                      <p className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Teléfono</span>
                        <span>{s.phone ?? 'Sin registro'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Editar alumno</h3>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditStudent(null) }}
                className="rounded-full px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
            <form onSubmit={saveEdit} className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 space-y-1 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</span>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="space-y-1 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</span>
                <input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="space-y-1 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <button
                type="submit"
                className="sm:col-span-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400"
              >
                Guardar cambios
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
