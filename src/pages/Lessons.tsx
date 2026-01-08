import React, { useEffect, useMemo, useState } from 'react'
import { api, Lesson, Student } from '../lib/api'
import WeekGrid from '../components/WeekGrid'
import DayGrid from '../components/DayGrid'
import MonthGrid from '../components/MonthGrid'
import LessonForm from '../components/LessonForm'
import LessonCard from '../components/LessonCard'
import { PaymentModal } from '../components/PaymentModal'
import { Modal } from '../components/ui/Modal'
import { StatsGrid } from '../components/ui/StatsGrid'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import SEO from '../components/ui/SEO'

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
  const [type, setType] = useState<'private' | 'group'>('private')
  const [participants, setParticipants] = useState<Array<{ studentId: string; price?: number }>>([])
  const [price, setPrice] = useState<number | undefined>(undefined)
  const [pricingMode, setPricingMode] = useState<'per_lesson' | 'per_student'>('per_lesson')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const [court, setCourt] = useState('')
  const [capacity, setCapacity] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<'scheduled' | 'cancelled' | 'completed'>('scheduled')
  const [cancellationReason, setCancellationReason] = useState('')
  const [attendance, setAttendance] = useState<Array<{ studentId: string; present: boolean; notes?: string }>>([])
  const [additionalCoaches, setAdditionalCoaches] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState<number>(HALF_HOUR_MINUTES)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [isQuickAdd, setIsQuickAdd] = useState(false)
  const [repeatWeeks, setRepeatWeeks] = useState<number>(0)
  const [selectedLessonForPayment, setSelectedLessonForPayment] = useState<Lesson | null>(null)
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'none'>('week')

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
      const [ls, st] = await Promise.all([api.lessons.list(), api.students.list()])
      setLessons(ls)
      setStudents(st)
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
      
      const lessonData = {
        type,
        studentId: type === 'private' ? studentId : undefined,
        participants: type === 'group' ? participants : undefined,
        start: startIso,
        end: endIso,
        price,
        pricingMode,
        notes: notes || undefined,
        location: location || undefined,
        court: court || undefined,
        capacity: capacity || undefined,
        status: status || 'scheduled',
        cancellationReason: cancellationReason || undefined,
        attendance: attendance.length > 0 ? attendance : undefined,
        additionalCoaches: additionalCoaches.length > 0 ? additionalCoaches : undefined
      }

      if (editingLesson) {
        await api.lessons.update(editingLesson.id, lessonData)
      } else {
        await api.lessons.create(lessonData)
        if (repeatWeeks > 0) {
          const tasks: Promise<any>[] = []
          for (let w = 1; w <= repeatWeeks; w++) {
            const dupStart = new Date(startDate)
            dupStart.setDate(dupStart.getDate() + w * 7)
            const dupEnd = addMinutes(dupStart, durationMinutes)
            tasks.push(
              api.lessons.create({
                ...lessonData,
                start: dupStart.toISOString(),
                end: dupEnd.toISOString(),
              })
            )
          }
          await Promise.all(tasks)
        }
      }

      const { startSlot, endSlot } = getDefaultSlots()
      setStudentId('')
      setParticipants([])
      setPrice(undefined)
      setNotes('')
      setLocation('')
      setCourt('')
      setCapacity(undefined)
      setStatus('scheduled')
      setCancellationReason('')
      setAttendance([])
      setAdditionalCoaches([])
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
    await api.lessons.delete(id)
    await load()
    setShowModal(false)
    setEditingLesson(null)
  }

  async function handleRepeat(lesson: Lesson, weeks: number) {
    try {
      setLoading(true);
      const startDate = new Date(lesson.start);
      const endDate = new Date(lesson.end);

      for (let i = 1; i <= weeks; i++) {
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() + (i * 7));
        
        const newEnd = new Date(endDate);
        newEnd.setDate(endDate.getDate() + (i * 7));

        await api.lessons.create({
          type: lesson.type,
          studentId: lesson.studentId,
          participants: lesson.participants?.map(p => ({
            studentId: p.studentId,
            price: p.price
          })),
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
          price: lesson.price,
          pricingMode: lesson.pricingMode,
          currency: lesson.currency,
          location: lesson.location,
          court: lesson.court,
          capacity: lesson.capacity,
          notes: lesson.notes,
          status: 'scheduled'
        });
      }
      
      await load();
      alert(`Se han programado ${weeks} clases adicionales.`);
    } catch (err: any) {
      console.error('Error al repetir clase:', err);
      alert('Error al repetir la clase: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Los horarios se seleccionan desde la grilla; la duración se elige en el formulario

  function handleSlotClick(slotStart: Date) {
    const dt = new Date(slotStart)
    const nowMin = roundToNextSlot(new Date())
    const endDt = addMinutes(dt, HALF_HOUR_MINUTES)
    
    // Reset form state for new lesson
    setStudentId('')
    setParticipants([])
    setPrice(undefined)
    setNotes('')
    setLocation('')
    setCourt('')
    setCapacity(undefined)
    setStatus('scheduled')
    setCancellationReason('')
    setAttendance([])
    setAdditionalCoaches([])
    setType('private')
    setPricingMode('per_lesson')

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

  function handleLessonClick(lesson: Lesson) {
    // Prefill for edit
    setEditingLesson(lesson)
    setStart(formatDateTimeLocal(new Date(lesson.start)))
    const startDate = new Date(lesson.start)
    const endDate = new Date(lesson.end)
    const diff = Math.max(30, Math.round((endDate.getTime() - startDate.getTime()) / 60000 / HALF_HOUR_MINUTES) * HALF_HOUR_MINUTES)
    setDurationMinutes(diff)
    setNotes(lesson.notes || '')
    setLocation(lesson.location || '')
    setCourt(lesson.court || '')
    setCapacity(lesson.capacity)
    setStatus(lesson.status || 'scheduled')
    setCancellationReason(lesson.cancellationReason || '')
    setAttendance(lesson.attendance || [])
    setAdditionalCoaches(lesson.additionalCoaches || [])
    setType(lesson.type || 'private')
    setStudentId(lesson.studentId || '')
    setParticipants(lesson.participants || [])
    setPrice(lesson.price)
    setPricingMode(lesson.pricingMode || 'per_lesson')
    setIsQuickAdd(false)
    setRepeatWeeks(0)
    setShowModal(true)
  }

  function handleQuickAddClick() {
    const { startSlot, endSlot } = getDefaultSlots()
    
    // Reset form state for new lesson
    setStudentId('')
    setParticipants([])
    setPrice(undefined)
    setNotes('')
    setLocation('')
    setCourt('')
    setCapacity(undefined)
    setStatus('scheduled')
    setCancellationReason('')
    setAttendance([])
    setAdditionalCoaches([])
    setType('private')
    setPricingMode('per_lesson')

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
      <SEO 
        title="Agenda" 
        description="Organiza tus clases de tenis, sigue el progreso de tus alumnos y gestiona tu disponibilidad."
      />
      <PageHeader 
        title="Clases"
        subtitle="Programa, supervisa y ajusta las clases de tu academia con un calendario organizado y claro."
        badge="Agenda"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="flex w-full sm:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar shrink-0">
              <button
                onClick={() => setViewMode('day')}
                className={`flex-1 px-3 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  viewMode === 'day' 
                    ? 'bg-white text-brand-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`flex-1 px-3 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  viewMode === 'week' 
                    ? 'bg-white text-brand-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`flex-1 px-3 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  viewMode === 'month' 
                    ? 'bg-white text-brand-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setViewMode('none')}
                className={`flex-1 px-3 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  viewMode === 'none' 
                    ? 'bg-white text-brand-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Ocultar
              </button>
            </div>
            <Button onClick={handleQuickAddClick} className="shadow-brand-500/20 w-full sm:w-auto py-3 shrink-0">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Agendar Clase
              </span>
            </Button>
          </div>
        }
      />

      <StatsGrid stats={stats} />

      {viewMode === 'day' && (
        <DayGrid
          className="rounded-surface bg-white p-4 shadow-card"
          lessons={lessons}
          onSlotClick={handleSlotClick}
          onLessonClick={handleLessonClick as any}
          startHour={6}
          endHour={24}
          stepMinutes={HALF_HOUR_MINUTES}
        />
      )}

      {viewMode === 'week' && (
        <WeekGrid
          className="rounded-surface bg-white p-4 shadow-card"
          lessons={lessons}
          onSlotClick={handleSlotClick}
          onLessonClick={handleLessonClick as any}
          startHour={6}
          endHour={24}
          stepMinutes={HALF_HOUR_MINUTES}
        />
      )}

      {viewMode === 'month' && (
        <MonthGrid
          className="rounded-surface bg-white p-4 shadow-card"
          lessons={lessons}
          onSlotClick={handleSlotClick}
          onLessonClick={handleLessonClick as any}
        />
      )}

      

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Cargando clases...</p>
          </div>
        ) : error ? (
          <div className="rounded-surface border border-red-100 bg-red-50/50 p-6 text-center shadow-surface">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-red-900">Error al cargar</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <Button variant="secondary" onClick={load} className="mt-4">
              Reintentar
            </Button>
          </div>
        ) : lessons.length === 0 ? (
          <EmptyState 
            message="No hay clases registradas todavía"
            description="Comienza agendando tu primera clase desde el botón superior."
            action={
              <Button onClick={handleQuickAddClick}>
                Agendar Clase
              </Button>
            }
          />
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
                <LessonCard
                  key={l.id}
                  lesson={l}
                  onEdit={handleLessonClick}
                  onDelete={remove}
                  onRegisterPayment={setSelectedLessonForPayment}
                  onRepeat={handleRepeat}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingLesson ? 'Editar clase' : 'Agregar clase'}
        >
          <LessonForm
            students={students}
            type={type}
            onTypeChange={setType}
            studentId={studentId}
            onStudentChange={setStudentId}
            participants={participants}
            onParticipantsChange={setParticipants}
            start={start}
            onStartChange={setStart}
            durationMinutes={durationMinutes}
            onDurationChange={setDurationMinutes}
            price={price}
            onPriceChange={setPrice}
            pricingMode={pricingMode}
            onPricingModeChange={setPricingMode}
            notes={notes}
            onNotesChange={setNotes}
            location={location}
            onLocationChange={setLocation}
            court={court}
            onCourtChange={setCourt}
            capacity={capacity}
            onCapacityChange={setCapacity}
            status={status}
            onStatusChange={setStatus}
            cancellationReason={cancellationReason}
            onCancellationReasonChange={setCancellationReason}
            attendance={attendance}
            onAttendanceChange={setAttendance}
            additionalCoaches={additionalCoaches}
            onAdditionalCoachesChange={setAdditionalCoaches}
            onSubmit={addLesson}
            onDelete={editingLesson ? () => remove(editingLesson.id) : undefined}
            submitLabel={editingLesson ? 'Actualizar' : 'Agendar'}
          />
        </Modal>
      )}

      {selectedLessonForPayment && (
        <PaymentModal
          lesson={selectedLessonForPayment}
          students={students}
          onClose={() => setSelectedLessonForPayment(null)}
          onSuccess={() => {
            setSelectedLessonForPayment(null)
            load()
          }}
        />
      )}
    </section>
  )
}
