import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import WeekGrid from '../components/WeekGrid'
import LessonForm from '../components/LessonForm'

type Lesson = { id: string; student: { name: string; email?: string; phone?: string }; start: string; end: string; status: string; notes?: string }

type Student = { id: string; name: string }

const HALF_HOUR_MINUTES = 30

function addMinutes(date: Date, minutes: number) {
  const result = new Date(date.getTime())
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

function roundToNextSlot(date: Date) {
  const result = new Date(date.getTime())
  result.setSeconds(0, 0)
  const remainder = result.getMinutes() % HALF_HOUR_MINUTES
  if (remainder !== 0) {
    result.setMinutes(result.getMinutes() + (HALF_HOUR_MINUTES - remainder))
  }
  if (result < date) {
    result.setMinutes(result.getMinutes() + HALF_HOUR_MINUTES)
  }
  return result
}

function formatDateTimeLocal(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function parseDateTimeLocal(value: string) {
  if (!value) return null
  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) return null
  return new Date(`${datePart}T${timePart}`)
}

function getDefaultSlots() {
  const startSlot = roundToNextSlot(new Date())
  const endSlot = addMinutes(startSlot, HALF_HOUR_MINUTES)
  return { startSlot, endSlot }
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [studentId, setStudentId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState<number>(HALF_HOUR_MINUTES)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [isQuickAdd, setIsQuickAdd] = useState(false)
  const [repeatWeeks, setRepeatWeeks] = useState<number>(0)

  const minStartSlot = useMemo(() => roundToNextSlot(new Date()), [start])

  const stats = useMemo(() => {
    const now = new Date()
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const upcoming = lessons.filter(l => {
      const start = new Date(l.start)
      return start >= now && start <= next24h
    }).length
    const completed = lessons.filter(l => l.status?.toLowerCase() === 'completada' || l.status?.toLowerCase() === 'completado').length
    return [
      {
        label: 'Clases programadas',
        value: lessons.length,
        description: 'Total de eventos registrados'
      },
      {
        label: 'Próximas 24h',
        value: upcoming,
        description: 'Sesiones con fecha futura'
      },
      {
        label: 'Completadas',
        value: completed,
        description: 'Marcadas como finalizadas'
      }
    ]
  }, [lessons])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [ls, st] = await Promise.all([api.listLessons(), api.listStudents()])
      setLessons(ls)
      setStudents(st.map(s => ({ id: s.id, name: s.name })))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const { startSlot, endSlot } = getDefaultSlots()
    setStart(formatDateTimeLocal(startSlot))
    setEnd(formatDateTimeLocal(endSlot))
    setDurationMinutes(HALF_HOUR_MINUTES)
    setRepeatWeeks(0)
  }, [])

  async function addLesson(e: React.FormEvent) {
    e.preventDefault()
    try {
      const startDate = parseDateTimeLocal(start)
      if (!startDate) {
        throw new Error('Selecciona fecha y hora válidas para la clase.')
      }
      if (startDate < minStartSlot) {
        throw new Error('La fecha debe ser desde hoy en adelante.')
      }
      const endDate = addMinutes(startDate, durationMinutes)
      const startIso = startDate.toISOString()
      const endIso = endDate.toISOString()
      await api.createLesson({ studentId, start: startIso, end: endIso, notes: notes || undefined })
      if (repeatWeeks > 0) {
        const tasks: Promise<any>[] = []
        for (let w = 1; w <= repeatWeeks; w++) {
          const dupStart = new Date(startDate)
          dupStart.setDate(dupStart.getDate() + w * 7)
          const dupEnd = addMinutes(dupStart, durationMinutes)
          tasks.push(
            api.createLesson({
              studentId,
              start: dupStart.toISOString(),
              end: dupEnd.toISOString(),
              notes: notes || undefined,
            })
          )
        }
        await Promise.all(tasks)
      }
      const { startSlot, endSlot } = getDefaultSlots()
      setStudentId('')
      setNotes('')
      setStart(formatDateTimeLocal(startSlot))
      setEnd(formatDateTimeLocal(endSlot))
      setDurationMinutes(HALF_HOUR_MINUTES)
      setRepeatWeeks(0)
      await load()
      setShowModal(false)
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function remove(id: string) {
    if (!confirm('Eliminar clase?')) return
    await api.deleteLesson(id)
    await load()
    setShowModal(false)
    setEditingLesson(null)
  }

  // Los horarios se seleccionan desde la grilla; la duración se elige en el formulario

  function handleSlotClick(slotStart: Date) {
    const dt = new Date(slotStart)
    const nowMin = roundToNextSlot(new Date())
    const endDt = addMinutes(dt, HALF_HOUR_MINUTES)
    if (dt < nowMin) {
      const adjusted = nowMin
      const adjustedEnd = addMinutes(adjusted, HALF_HOUR_MINUTES)
      setStart(formatDateTimeLocal(adjusted))
      setEnd(formatDateTimeLocal(adjustedEnd))
    } else {
      setStart(formatDateTimeLocal(dt))
      setEnd(formatDateTimeLocal(endDt))
    }
    setDurationMinutes(HALF_HOUR_MINUTES)
    setEditingLesson(null)
    setIsQuickAdd(false)
    setRepeatWeeks(0)
    setShowModal(true)
  }

  function handleLessonClick(lesson: { id: string; student?: { name?: string }; start: string; end: string }) {
    // Prefill for edit
    setEditingLesson(lesson as Lesson)
    setStart(formatDateTimeLocal(new Date(lesson.start)))
    const startDate = new Date(lesson.start)
    const endDate = new Date(lesson.end)
    const diff = Math.max(30, Math.round((endDate.getTime() - startDate.getTime()) / 60000 / HALF_HOUR_MINUTES) * HALF_HOUR_MINUTES)
    setDurationMinutes(diff)
    setNotes((lesson as any).notes || '')
    const found = students.find(s => s.name === lesson.student?.name)
    if (found) setStudentId(found.id)
    setIsQuickAdd(false)
    setRepeatWeeks(0)
    setShowModal(true)
  }

  function handleQuickAddClick() {
    const { startSlot, endSlot } = getDefaultSlots()
    setStart(formatDateTimeLocal(startSlot))
    setEnd(formatDateTimeLocal(endSlot))
    setDurationMinutes(HALF_HOUR_MINUTES)
    setEditingLesson(null)
    setIsQuickAdd(true)
    setRepeatWeeks(0)
    setShowModal(true)
  }

  // repeatNextWeeks se maneja ahora con repeatWeeks en el submit

  const minStartValue = formatDateTimeLocal(minStartSlot)

  return (
    <section className="space-y-10">
      <header className="grid gap-6 rounded-surface bg-white/80 p-6 shadow-surface sm:grid-cols-[2fr,3fr]">
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleQuickAddClick}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400"
          >
            <span aria-hidden>＋</span> Agendar clase
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Clases</h1>
            <p className="text-sm text-slate-600">
              Programa, supervisa y ajusta las clases de tu academia con un calendario organizado y claro.
            </p>
          </div>
        </div>
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(item => (
              <article key={item.label} className="rounded-2xl bg-white p-4 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </header>

      <WeekGrid
        className="rounded-surface bg-white p-4 shadow-card"
        lessons={lessons}
        onSlotClick={handleSlotClick}
        onLessonClick={handleLessonClick}
        startHour={6}
        endHour={24}
        stepMinutes={HALF_HOUR_MINUTES}
      />

      

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-surface bg-white/60 px-6 py-4 text-sm text-slate-600 shadow-surface">
            Cargando clases...
          </div>
        ) : error ? (
          <div className="rounded-surface border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-surface">
            {error}
          </div>
        ) : lessons.length === 0 ? (
          <div className="rounded-surface bg-white px-6 py-10 text-center text-sm text-slate-600 shadow-surface">
            No hay clases registradas todavía.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Calendario de clases</h2>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {lessons.length} resultados
              </span>
            </div>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lessons.map(l => (
                <li
                  key={l.id}
                  className="flex flex-col justify-between rounded-surface bg-white p-5 shadow-card"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700">
                        {l.student?.name?.charAt(0).toUpperCase() ?? '—'}
                      </span>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{l.student?.name || 'Sin alumno'}</p>
                        <span className="inline-flex items-center rounded-chip bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {l.status || 'Sin estado'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Inicio</span>
                        <span>{new Date(l.start).toLocaleString()}</span>
                      </p>
                      <p className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Fin</span>
                        <span>{new Date(l.end).toLocaleString()}</span>
                      </p>
                      {l.notes && (
                        <p className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-600">
                          {l.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(l.id)}
                    className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{editingLesson ? 'Editar clase' : 'Agregar clase'}</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
            <LessonForm
              students={students}
              studentId={editingLesson ? '' : studentId}
              onStudentChange={setStudentId}
              start={start}
              durationMinutes={durationMinutes}
              onDurationChange={setDurationMinutes}
              notes={notes}
              onNotesChange={setNotes}
              canEditStartTime={!!editingLesson}
              canEditStartDateTime={isQuickAdd}
              onStartChange={setStart}
              onSubmit={async e => {
                e.preventDefault()
                if (editingLesson) {
                  const startDate = new Date(start)
                  const endDate = addMinutes(startDate, durationMinutes)
                  await api.updateLesson(editingLesson.id, { start: startDate.toISOString(), end: endDate.toISOString(), notes: notes || undefined })
                  if (repeatWeeks > 0) {
                    const tasks: Promise<any>[] = []
                    const studentIdForDup = studentId || (students.find(x => x.name === editingLesson.student?.name)?.id ?? '')
                    for (let w = 1; w <= repeatWeeks; w++) {
                      const dupStart = new Date(startDate)
                      dupStart.setDate(dupStart.getDate() + w * 7)
                      const dupEnd = addMinutes(dupStart, durationMinutes)
                      tasks.push(
                        api.createLesson({
                          studentId: studentIdForDup,
                          start: dupStart.toISOString(),
                          end: dupEnd.toISOString(),
                          notes: notes || undefined,
                        })
                      )
                    }
                    await Promise.all(tasks)
                  }
                  await load()
                  setShowModal(false)
                  setEditingLesson(null)
                  setRepeatWeeks(0)
                } else {
                  await addLesson(e)
                }
              }}
              submitLabel={editingLesson ? 'Guardar cambios' : 'Agregar clase'}
              studentDisabled={!!editingLesson}
              studentReadonlyLabel={editingLesson?.student?.name}
              onDelete={editingLesson ? () => remove(editingLesson.id) : undefined}
              onRepeat={setRepeatWeeks}
              repeatWeeksSelected={repeatWeeks}
            />
          </div>
        </div>
      )}
    </section>
  )
}
