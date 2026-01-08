import React, { useMemo, useState } from 'react'
import { WeekGridLesson } from './WeekGrid'

export interface MonthGridProps {
  lessons: WeekGridLesson[]
  onSlotClick: (slotStart: Date) => void
  onLessonClick?: (lesson: WeekGridLesson) => void
  className?: string
}

export default function MonthGrid({
  lessons,
  onSlotClick,
  onLessonClick,
  className = ''
}: MonthGridProps) {
  const [viewDate, setViewDate] = useState(new Date())

  const { days, monthName, year } = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Ajustar para que empiece el lunes (0=Dom, 1=Lun...)
    let startOffset = firstDay.getDay() - 1
    if (startOffset === -1) startOffset = 6 // Si es domingo, offset 6

    const days = []
    const totalSlots = 42 // 6 semanas

    for (let i = 0; i < totalSlots; i++) {
      const d = new Date(year, month, 1 - startOffset + i)
      days.push(d)
    }

    return {
      days,
      monthName: viewDate.toLocaleDateString('es-AR', { month: 'long' }),
      year
    }
  }, [viewDate])

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  const isSameDay = (a: Date, b: Date) => 
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 capitalize">{monthName}</h2>
          <p className="text-xs text-slate-500">{year}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ‹ Anterior
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date())}
            className="rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Siguiente ›
          </button>
        </div>
      </div>

      <div className="border rounded-surface bg-white shadow-card overflow-x-auto">
        <div className="min-w-[700px] md:min-w-0">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {dayNames.map(name => (
            <div key={name} className="p-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {name}
            </div>
          ))}
        </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {days.map((date, i) => {
              const isCurrentMonth = date.getMonth() === viewDate.getMonth()
              const dayLessons = lessons.filter(l => isSameDay(new Date(l.start), date))
              const isToday = isSameDay(new Date(), date)

              return (
                <div 
                  key={i} 
                  className={`min-h-[100px] p-1 transition-colors ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      isToday ? 'bg-brand-500 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {date.getDate()}
                    </span>
                    <button
                      onClick={() => {
                        const now = new Date()
                        date.setHours(now.getHours(), now.getMinutes())
                        onSlotClick(date)
                      }}
                      className="text-slate-300 hover:text-brand-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-1">
                    {dayLessons.slice(0, 3).map(l => (
                      <button
                        key={l.id}
                        onClick={() => onLessonClick?.(l)}
                        className="w-full text-left truncate px-1.5 py-0.5 rounded bg-brand-50 text-[9px] font-medium text-brand-700 border border-brand-100 hover:bg-brand-100 transition-colors"
                      >
                        {new Date(l.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {l.student?.name || 'Clase'}
                      </button>
                    ))}
                    {dayLessons.length > 3 && (
                      <p className="text-[9px] text-slate-400 font-medium pl-1">
                        + {dayLessons.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
