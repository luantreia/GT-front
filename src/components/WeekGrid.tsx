import React, { useMemo, useRef, useState } from 'react'

export type WeekGridLesson = {
  id: string
  student?: { name?: string }
  start: string
  end: string
}

export interface WeekGridProps {
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
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function WeekGrid({
  lessons,
  onSlotClick,
  onLessonClick,
  startHour = 6,
  endHour = 24,
  stepMinutes = 30,
  className = ''
}: WeekGridProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
  const nowMin = useMemo(() => roundToNextSlot(new Date()), [])
  const pointerStart = useRef<{ x: number; y: number; t: number } | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const lastInnerScrollY = useRef(0)

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const SLOT_MINS = useMemo(
    () => Array.from({ length: ((endHour - startHour) * 60) / stepMinutes }, (_, i) => startHour * 60 + i * stepMinutes),
    [startHour, endHour, stepMinutes]
  )

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Semana</h2>
          <p className="text-xs text-slate-500">
            {addDays(weekStart, 0).toLocaleDateString()} – {addDays(weekStart, 6).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart(prev => addDays(prev, -7))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ‹ Semana anterior
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(prev => addDays(prev, 7))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Semana siguiente ›
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px] md:min-w-0">
          <div className="grid" style={{ gridTemplateColumns: '36px repeat(7, minmax(0, 1fr))' }}>
            <div className="sticky left-0 z-10 bg-white p-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Hora
            </div>
            {days.map((d, idx) => (
              <div key={idx} className="p-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:justify-center sm:gap-1">
                  <span>{dayNames[idx]}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 sm:ml-1">{d.getDate()}</span>
                </div>
              </div>
            ))}
          </div>
          <div
            ref={scrollerRef}
            className="border-t border-slate-200 max-h-[70vh] md:max-h-[75vh] overflow-y-auto overscroll-contain"
            onScroll={e => {
              const el = e.currentTarget as HTMLDivElement
              const y = el.scrollTop
              const delta = y - lastInnerScrollY.current
              lastInnerScrollY.current = y
              window.dispatchEvent(new CustomEvent('content-scroll', { detail: { y, delta } }))
            }}
          >
            <div className="divide-y divide-slate-200">
              {SLOT_MINS.map((m, rowIdx) => (
                <div key={rowIdx} className="grid" style={{ gridTemplateColumns: '36px repeat(7, minmax(0, 1fr))' }}>
                  <div className="sticky left-0 z-10 bg-white p-1 text-[10px] text-slate-500">
                    {String(Math.floor(m / 60)).padStart(2, '0')}:{String(m % 60).padStart(2, '0')}
                  </div>
                  {days.map((d, idx) => {
                    const slotStart = new Date(d)
                    slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0)
                    const slotEnd = addMinutes(slotStart, stepMinutes)
                    const isPast = slotStart < nowMin

                    const overlaps = lessons.filter(l => {
                      const ls = new Date(l.start)
                      const le = new Date(l.end)
                      return le > slotStart && ls < slotEnd && sameDay(ls, d)
                    })
                    const startingHere = overlaps.filter(l => new Date(l.start).getTime() === slotStart.getTime())
                    const hasOverlap = overlaps.length > 1
                    const hasAny = overlaps.length > 0

                    const onPointerDown: React.PointerEventHandler<HTMLButtonElement> = e => {
                      if (e.pointerType !== 'touch') return
                      pointerStart.current = { x: e.clientX, y: e.clientY, t: Date.now() }
                    }

                    const onPointerUp: React.PointerEventHandler<HTMLButtonElement> = e => {
                      if (e.pointerType !== 'touch') return
                      const ps = pointerStart.current
                      pointerStart.current = null
                      if (!ps) return
                      const dx = Math.abs(e.clientX - ps.x)
                      const dy = Math.abs(e.clientY - ps.y)
                      const dt = Date.now() - ps.t
                      const MOVE_THRESHOLD = 10
                      const TIME_THRESHOLD = 500
                      if (dx < MOVE_THRESHOLD && dy < MOVE_THRESHOLD && dt < TIME_THRESHOLD) {
                        if (startingHere.length > 0 && onLessonClick) {
                          onLessonClick(startingHere[0])
                        } else {
                          onSlotClick(slotStart)
                        }
                      }
                    }

                    return (
                      <button
                        key={`${idx}-${rowIdx}`}
                        type="button"
                        disabled={isPast}
                        onClick={() => {
                          if (startingHere.length > 0 && onLessonClick) {
                            onLessonClick(startingHere[0])
                          } else {
                            onSlotClick(slotStart)
                          }
                        }}
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                        className={`relative h-10 sm:h-6 border-l border-slate-200 p-0 text-left transition ${
                          isPast ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'hover:bg-brand-50'
                        } ${hasAny ? 'bg-brand-50/60' : ''} ${hasOverlap ? 'ring-2 ring-red-300' : ''}`}
                        title={hasAny ? `${overlaps.length} clase(s)` : 'Agregar clase'}
                        aria-label={`Agregar clase el ${d.toLocaleDateString()} a las ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`}
                        style={{ touchAction: 'pan-y' }}
                      >
                        <span className="sr-only">Agregar clase</span>
                        {startingHere.length > 0 && (
                          <>
                            {startingHere.slice(0, 2).map((l, i) => {
                              const ls = new Date(l.start)
                              const le = new Date(l.end)
                              const durationMin = Math.max(0, (le.getTime() - ls.getTime()) / 60000)
                              const span = Math.max(1, Math.ceil(durationMin / stepMinutes))
                              const offsetX = i * 2 // px small offset for multiple starting blocks
                              return (
                                <div
                                  key={`blk-${i}`}
                                  className={`pointer-events-none absolute inset-x-0 top-0 z-10 rounded-md border ${i === 0 ? 'bg-brand-500/15 border-brand-300' : 'bg-brand-400/10 border-brand-300'}`}
                                  style={{
                                    height: `calc(100% * ${span})`,
                                    left: `${offsetX}px`,
                                    right: `${offsetX}px`
                                  }}
                                  title={`${l.student?.name || 'Clase'} • ${ls.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${le.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                >
                                  <div className="pointer-events-none p-1">
                                    <span className="inline-flex max-w-full items-center gap-1 truncate rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 shadow">
                                      {l.student?.name || 'Clase'}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                            {startingHere.length > 2 && (
                              <div className="pointer-events-none absolute right-1 top-1 z-20 hidden md:block">
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">+{startingHere.length - 2}</span>
                              </div>
                            )}
                          </>
                        )}
                        
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
