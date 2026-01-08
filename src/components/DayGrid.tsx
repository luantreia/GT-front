import React, { useMemo, useRef, useState } from 'react'
import { WeekGridLesson } from './WeekGrid'

export interface DayGridProps {
  lessons: WeekGridLesson[]
  onSlotClick: (slotStart: Date) => void
  onLessonClick?: (lesson: WeekGridLesson) => void
  startHour?: number
  endHour?: number
  stepMinutes?: number
  className?: string
}

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

export default function DayGrid({
  lessons,
  onSlotClick,
  onLessonClick,
  startHour = 6,
  endHour = 24,
  stepMinutes = 30,
  className = ''
}: DayGridProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const nowMin = useMemo(() => roundToNextSlot(new Date()), [])
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const SLOT_MINS = useMemo(
    () => Array.from({ length: ((endHour - startHour) * 60) / stepMinutes }, (_, i) => startHour * 60 + i * stepMinutes),
    [startHour, endHour, stepMinutes]
  )

  const addDays = (date: Date, days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Día</h2>
          <p className="text-xs text-slate-500">
            {currentDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentDate(prev => addDays(prev, -1))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ‹ Anterior
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(prev => addDays(prev, 1))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Siguiente ›
          </button>
        </div>
      </div>

      <div className="overflow-x-hidden border rounded-surface bg-white shadow-card">
        <div className="grid" style={{ gridTemplateColumns: '60px 1fr' }}>
          <div className="sticky left-0 z-10 bg-slate-50 p-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-r border-slate-200">
            Hora
          </div>
          <div className="bg-slate-50 p-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            {currentDate.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })}
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100"
        >
          {SLOT_MINS.map((m, rowIdx) => {
            const slotStart = new Date(currentDate)
            slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0)
            const slotEnd = addMinutes(slotStart, stepMinutes)
            const isPast = slotStart < nowMin

            const overlaps = lessons.filter(l => {
              const ls = new Date(l.start)
              const le = new Date(l.end)
              return le > slotStart && ls < slotEnd && 
                     ls.getDate() === currentDate.getDate() && 
                     ls.getMonth() === currentDate.getMonth() && 
                     ls.getFullYear() === currentDate.getFullYear()
            })
            const startingHere = overlaps.filter(l => new Date(l.start).getTime() === slotStart.getTime())

            return (
              <div key={rowIdx} className="grid" style={{ gridTemplateColumns: '60px 1fr' }}>
                <div className="p-2 text-[11px] font-medium text-slate-400 border-r border-slate-100 bg-slate-50/30">
                  {String(Math.floor(m / 60)).padStart(2, '0')}:{String(m % 60).padStart(2, '0')}
                </div>
                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    if (startingHere.length > 0 && onLessonClick) {
                      onLessonClick(startingHere[0])
                    } else {
                      onSlotClick(slotStart)
                    }
                  }}
                  className={`relative h-12 transition-colors ${
                    isPast ? 'bg-slate-50/50 cursor-not-allowed' : 'hover:bg-brand-50/30'
                  } ${overlaps.length > 0 ? 'bg-brand-50/20' : ''}`}
                >
                  {startingHere.map((l, i) => {
                    const ls = new Date(l.start)
                    const le = new Date(l.end)
                    const durationMin = (le.getTime() - ls.getTime()) / 60000
                    const span = Math.ceil(durationMin / stepMinutes)
                    return (
                      <div
                        key={l.id}
                        className="absolute inset-x-1 top-1 z-10 rounded-lg border border-brand-200 bg-brand-500/10 p-2 text-left shadow-sm"
                        style={{ height: `calc(${span * 100}% - 8px)` }}
                      >
                        <p className="truncate text-xs font-bold text-brand-700">
                          {l.student?.name || 'Clase'}
                        </p>
                        <p className="text-[10px] text-brand-600/80">
                          {ls.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {le.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )
                  })}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
