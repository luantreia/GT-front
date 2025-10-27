import React from 'react'

export type Student = { id: string; name: string }

export interface LessonFormProps {
  students: Student[]
  studentId: string
  onStudentChange: (id: string) => void
  start: string
  durationMinutes: number
  onDurationChange: (mins: number) => void
  notes: string
  onNotesChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  submitLabel?: string
  className?: string
  studentDisabled?: boolean
  studentReadonlyLabel?: string
  onDelete?: () => void
  canEditStartTime?: boolean
  canEditStartDateTime?: boolean
  onStartChange?: (newStart: string) => void
  onRepeat?: (weeks: number) => void
  repeatWeeksSelected?: number
}

export default function LessonForm(props: LessonFormProps) {
  const {
    students,
    studentId,
    onStudentChange,
    start,
    durationMinutes,
    onDurationChange,
    notes,
    onNotesChange,
    onSubmit,
    submitLabel = 'Guardar',
    className = '',
    studentDisabled = false,
    studentReadonlyLabel,
    onDelete,
    canEditStartTime = false,
    canEditStartDateTime = false,
    onStartChange,
    onRepeat,
    repeatWeeksSelected
  } = props

  const startDate = start ? new Date(start) : null
  const startLabel = startDate ? startDate.toLocaleString() : ''
  const datePart = start ? start.split('T')[0] : ''
  const timePart = start ? start.split('T')[1]?.slice(0,5) : ''

  return (
    <form onSubmit={onSubmit} className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      <div className="sm:col-span-2 space-y-1 text-left">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alumno</span>
        {studentDisabled || studentReadonlyLabel ? (
          <input
            id="student-display"
            type="text"
            value={studentReadonlyLabel || ''}
            readOnly
            className="w-full cursor-default rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
          />
        ) : (
          <select
            id="student"
            value={studentId}
            onChange={e => onStudentChange(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option value="">Seleccionar alumno</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-1 text-left">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inicio</span>
        {canEditStartDateTime ? (
          <input
            id="start-datetime"
            type="datetime-local"
            step={1800}
            value={start ? start.slice(0, 16) : ''}
            onChange={e => onStartChange && onStartChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        ) : canEditStartTime ? (
          <div className="grid grid-cols-2 gap-2">
            <input
              id="start-date-display"
              type="text"
              value={startDate ? startDate.toLocaleDateString() : ''}
              readOnly
              className="w-full cursor-default rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
            />
            <input
              id="start-time"
              type="time"
              step={1800}
              value={timePart || ''}
              onChange={e => {
                if (!onStartChange || !datePart) return
                const v = e.target.value // HH:MM
                onStartChange(`${datePart}T${v}`)
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        ) : (
          <input
            id="start-display"
            type="text"
            value={startLabel}
            readOnly
            className="w-full cursor-default rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
          />
        )}
      </div>

      <fieldset className="space-y-2 text-left">
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duración</legend>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="radio"
              name="duration"
              value={30}
              checked={durationMinutes === 30}
              onChange={() => onDurationChange(30)}
            />
            <span>30 min</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="radio"
              name="duration"
              value={60}
              checked={durationMinutes === 60}
              onChange={() => onDurationChange(60)}
            />
            <span>1 h</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="radio"
              name="duration"
              value={90}
              checked={durationMinutes === 90}
              onChange={() => onDurationChange(90)}
            />
            <span>1 h 30</span>
          </label>
        </div>
      </fieldset>

      <label className="sm:col-span-2 space-y-1 text-left">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas</span>
        <input
          id="notes"
          placeholder="Observaciones opcionales"
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner placeholder-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </label>

      {onRepeat && (
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Repetir próximas semanas</p>
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4].map(w => {
              const active = repeatWeeksSelected === w
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => onRepeat(active ? 0 : w)}
                  className={`rounded-2xl px-3 py-2 text-xs font-semibold shadow-sm transition ${
                    active
                      ? 'border border-brand-300 bg-brand-50 text-brand-700'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50'
                  }`}
                >
                  {w} semana{w > 1 ? 's' : ''}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="sm:col-span-2 flex items-center justify-between gap-2">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Eliminar
          </button>
        ) : <span />}
        <button
          type="submit"
          className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
