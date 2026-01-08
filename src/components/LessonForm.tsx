import React from 'react'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'

export type Student = { id: string; name: string }

export interface LessonFormProps {
  students: Student[]
  type: 'private' | 'group'
  onTypeChange: (type: 'private' | 'group') => void
  studentId?: string
  onStudentChange: (id: string) => void
  participants: Array<{ studentId: string; price?: number }>
  onParticipantsChange: (participants: Array<{ studentId: string; price?: number }>) => void
  start: string
  durationMinutes: number
  onDurationChange: (mins: number) => void
  price?: number
  onPriceChange: (price: number) => void
  pricingMode: 'per_lesson' | 'per_student'
  onPricingModeChange: (mode: 'per_lesson' | 'per_student') => void
  notes: string
  onNotesChange: (value: string) => void
  location?: string
  onLocationChange: (value: string) => void
  court?: string
  onCourtChange: (value: string) => void
  capacity?: number
  onCapacityChange: (value: number) => void
  status?: 'scheduled' | 'cancelled' | 'completed'
  onStatusChange: (value: 'scheduled' | 'cancelled' | 'completed') => void
  cancellationReason?: string
  onCancellationReasonChange: (value: string) => void
  attendance: Array<{ studentId: string; present: boolean; notes?: string }>
  onAttendanceChange: (value: Array<{ studentId: string; present: boolean; notes?: string }>) => void
  additionalCoaches: string[]
  onAdditionalCoachesChange: (value: string[]) => void
  onSubmit: (e: React.FormEvent) => void
  submitLabel?: string
  className?: string
  onDelete?: () => void
  onStartChange?: (newStart: string) => void
}

export default function LessonForm(props: LessonFormProps) {
  const {
    students,
    type,
    onTypeChange,
    studentId,
    onStudentChange,
    participants,
    onParticipantsChange,
    start,
    durationMinutes,
    onDurationChange,
    price,
    onPriceChange,
    pricingMode,
    onPricingModeChange,
    notes,
    onNotesChange,
    location,
    onLocationChange,
    court,
    onCourtChange,
    capacity,
    onCapacityChange,
    status,
    onStatusChange,
    cancellationReason,
    onCancellationReasonChange,
    attendance,
    onAttendanceChange,
    additionalCoaches,
    onAdditionalCoachesChange,
    onSubmit,
    submitLabel = 'Guardar',
    className = '',
    onDelete,
    onStartChange,
  } = props

  const addParticipant = (id: string) => {
    if (!id || participants.some(p => p.studentId === id)) return
    onParticipantsChange([...participants, { studentId: id }])
  }

  const removeParticipant = (id: string) => {
    onParticipantsChange(participants.filter(p => p.studentId !== id))
  }

  const updateParticipantPrice = (id: string, price: number) => {
    onParticipantsChange(participants.map(p => p.studentId === id ? { ...p, price } : p))
  }

  return (
    <form onSubmit={onSubmit} className={`grid gap-x-3 gap-y-4 sm:grid-cols-2 ${className}`}>
      <div className="sm:col-span-2 space-y-1 text-left">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de Clase</span>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              checked={type === 'private'} 
              onChange={() => onTypeChange('private')} 
              className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500" 
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">Privada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              checked={type === 'group'} 
              onChange={() => onTypeChange('group')} 
              className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500" 
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">Grupal</span>
          </label>
        </div>
      </div>

      {type === 'private' ? (
        <div className="sm:col-span-2">
          <Select
            label="Alumno"
            value={studentId || ''}
            onChange={e => onStudentChange(e.target.value)}
            required
            options={[
              { value: '', label: 'Seleccionar alumno' },
              ...students.map(s => ({ value: s.id, label: s.name }))
            ]}
          />
        </div>
      ) : (
        <div className="sm:col-span-2 space-y-2">
          <Select
            label="Participantes"
            onChange={e => { addParticipant(e.target.value); e.target.value = ''; }}
            options={[
              { value: '', label: 'Agregar alumno...' },
              ...students.map(s => ({ value: s.id, label: s.name }))
            ]}
          />
          
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {participants.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-2">No hay participantes seleccionados</p>
            )}
            {participants.map(p => {
              const s = students.find(st => st.id === p.studentId);
              return (
                <div key={p.studentId} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 hover:border-brand-200 transition-colors">
                  <span className="flex-1 text-xs font-medium text-slate-700 ml-1 truncate">{s?.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        placeholder="Precio"
                        value={p.price || ''}
                        onChange={e => updateParticipantPrice(p.studentId, Number(e.target.value))}
                        className="w-20 rounded-lg border border-slate-200 pl-5 pr-1.5 py-1 text-xs font-medium focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeParticipant(p.studentId)} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Input
        label="Inicio"
        type="datetime-local"
        value={start ? start.slice(0, 16) : ''}
        onChange={e => onStartChange && onStartChange(e.target.value)}
        required
      />

      <Select
        label="Duración"
        value={durationMinutes}
        onChange={e => onDurationChange(Number(e.target.value))}
        options={[
          { value: 30, label: '30 min' },
          { value: 60, label: '1 hora' },
          { value: 90, label: '1.5 horas' },
          { value: 120, label: '2 horas' },
        ]}
      />

      <Input
        label="Precio Base"
        type="number"
        value={price || ''}
        onChange={e => onPriceChange(Number(e.target.value))}
        placeholder="0"
        icon={<span className="text-slate-400">$</span>}
      />

      <Select
        label="Modo de Cobro"
        value={pricingMode}
        onChange={e => onPricingModeChange(e.target.value as any)}
        options={[
          { value: 'per_lesson', label: 'Por Clase (Total)' },
          { value: 'per_student', label: 'Por Alumno' },
        ]}
      />

      <Input
        label="Ubicación"
        placeholder="Ej: Sede Central"
        value={location || ''}
        onChange={e => onLocationChange(e.target.value)}
      />

      <Input
        label="Cancha"
        placeholder="Ej: Cancha 1"
        value={court || ''}
        onChange={e => onCourtChange(e.target.value)}
      />

      {type === 'group' && (
        <Input
          label="Capacidad Máx."
          type="number"
          placeholder="Ej: 4"
          value={capacity || ''}
          onChange={e => onCapacityChange(Number(e.target.value))}
        />
      )}

      <Select
        label="Estado"
        value={status || 'scheduled'}
        onChange={e => onStatusChange(e.target.value as any)}
        options={[
          { value: 'scheduled', label: 'Programada' },
          { value: 'completed', label: 'Completada' },
          { value: 'cancelled', label: 'Cancelada' },
        ]}
      />

      {status === 'cancelled' && (
        <div className="sm:col-span-2">
          <Input
            label="Motivo de Cancelación"
            placeholder="Ej: Lluvia, Alumno avisó tarde"
            value={cancellationReason || ''}
            onChange={e => onCancellationReasonChange(e.target.value)}
          />
        </div>
      )}

      {(status === 'completed' || status === 'scheduled') && (
        <div className="sm:col-span-2 space-y-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Asistencia</span>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {(type === 'private' ? (studentId ? [{ studentId }] : []) : participants).map(p => {
              const s = students.find(st => st.id === p.studentId);
              const att = attendance.find(a => a.studentId === p.studentId) || { studentId: p.studentId, present: true };
              return (
                <div key={p.studentId} className="flex items-center justify-between bg-slate-50/50 p-2 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                  <span className="text-xs font-semibold text-slate-700 truncate mr-2">{s?.name}</span>
                  <label className="flex items-center gap-2 cursor-pointer group shrink-0">
                    <input
                      type="checkbox"
                      checked={att.present}
                      onChange={e => {
                        const next = attendance.filter(a => a.studentId !== p.studentId);
                        onAttendanceChange([...next, { ...att, present: e.target.checked }]);
                      }}
                      className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
                    />
                    <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${att.present ? 'text-brand-600' : 'text-slate-400'}`}>
                      {att.present ? 'Pres' : 'Aus'}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="sm:col-span-2">
        <Input
          label="Coaches Adicionales"
          placeholder="Ej: Coach Juan, Coach Maria"
          value={additionalCoaches.join(', ')}
          onChange={e => onAdditionalCoachesChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        />
      </div>

      <div className="sm:col-span-2 space-y-1 text-left">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas</span>
        <textarea
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={2}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all resize-none"
          placeholder="Detalles adicionales..."
        />
      </div>

      <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-2 mt-2">
        {onDelete && (
          <Button type="button" variant="danger" onClick={onDelete} className="w-full sm:w-auto py-2.5">
            Eliminar
          </Button>
        )}
        <Button type="submit" className="flex-1 py-2.5">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

