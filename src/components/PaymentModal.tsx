import React, { useState, useEffect } from 'react'
import { Lesson, Student, api } from '../lib/api'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'

interface PaymentModalProps {
  lesson?: Lesson
  initialStudentId?: string
  students: Student[]
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ lesson, initialStudentId, students, onClose, onSuccess }: PaymentModalProps) {
  const [studentId, setStudentId] = useState(initialStudentId || '')
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState('ARS')
  const [method, setMethod] = useState<'cash' | 'transfer' | 'mp' | 'card' | 'balance'>('cash')
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('completed')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedStudent = students.find(s => s.id === studentId)

  useEffect(() => {
    if (lesson) {
      if (lesson.type === 'private' && lesson.studentId) {
        setStudentId(lesson.studentId)
        setAmount(lesson.price || 0)
        setCurrency(lesson.currency || 'ARS')
      } else if (lesson.type === 'group' && lesson.participants && lesson.participants.length > 0) {
        // Default to first participant
        setStudentId(lesson.participants[0].studentId)
        setAmount(lesson.participants[0].price || 0)
        setCurrency(lesson.currency || 'ARS')
      }
    }
  }, [lesson])

  const handleStudentChange = (id: string) => {
    setStudentId(id)
    const student = students.find(s => s.id === id)
    if (student && student.balance < 0) {
      setMethod('balance')
    } else {
      setMethod('cash')
    }

    if (lesson && lesson.type === 'group' && lesson.participants) {
      const p = lesson.participants.find(x => x.studentId === id)
      if (p) setAmount(p.price || 0)
    }
  }

  useEffect(() => {
    if (selectedStudent && selectedStudent.balance < 0) {
      setMethod('balance')
    }
  }, [studentId, students])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.payments.create({
        studentId,
        lessonId: lesson?.id,
        amount,
        currency,
        method,
        status,
        reference: reference || undefined,
        notes: notes || undefined,
        date: new Date(date).toISOString()
      })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const participantIds = lesson 
    ? (lesson.type === 'group' 
        ? (lesson.participants?.map(p => p.studentId) || [])
        : [lesson.studentId].filter(Boolean) as string[])
    : []

  const filteredStudents = lesson ? students.filter(s => participantIds.includes(s.id)) : students

  return (
    <Modal isOpen={true} onClose={onClose} title={lesson ? "Registrar Pago de Clase" : "Registrar Pago Manual"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Alumno"
          value={studentId}
          onChange={(e) => handleStudentChange(e.target.value)}
          required
          disabled={!!initialStudentId && !lesson}
          options={[
            { value: '', label: 'Seleccionar alumno' },
            ...filteredStudents.map(s => ({ value: s.id, label: s.name }))
          ]}
        />

        {selectedStudent && (
          <div className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
            selectedStudent.balance < 0 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : selectedStudent.balance > 0
                ? 'bg-amber-50 border-amber-100 text-amber-700'
                : 'bg-slate-50 border-slate-100 text-slate-600'
          }`}>
            {selectedStudent.balance < 0 
              ? `Saldo a favor: $${Math.abs(selectedStudent.balance)}` 
              : selectedStudent.balance > 0
                ? `Deuda actual: $${selectedStudent.balance}`
                : 'Sin deuda ni saldo a favor'}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Monto"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <span className="absolute right-4 top-10 text-slate-400">$</span>
          </div>
          <Select
            label="Moneda"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: 'ARS', label: 'ARS' },
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
            ]}
          />
        </div>

        <Input
          label="Fecha y Hora"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          label="Método"
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
          options={[
            { value: 'cash', label: 'Efectivo' },
            { value: 'transfer', label: 'Transferencia' },
            { value: 'mp', label: 'Mercado Pago' },
            { value: 'card', label: 'Tarjeta' },
            { value: 'balance', label: 'Saldo a favor' },
          ]}
        />

        {method === 'balance' && selectedStudent && selectedStudent.balance >= 0 && (
          <p className="text-[10px] text-amber-600 font-medium px-1">
            ⚠️ El alumno no tiene saldo a favor. La deuda de esta clase se mantendrá en su cuenta general.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'completed', label: 'Completado' },
              { value: 'pending', label: 'Pendiente' },
              { value: 'failed', label: 'Fallido' },
            ]}
          />
          <Input
            label="Referencia"
            placeholder="ID Transacción"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        <div className="space-y-1 text-left">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas (opcional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all resize-none"
            rows={2}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="w-full sm:flex-1 py-2.5"
          >
            Confirmar Pago
          </Button>
        </div>
      </form>
    </Modal>
  )
}
