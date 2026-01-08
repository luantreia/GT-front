import React, { useEffect, useMemo, useState } from 'react'
import { api, Student } from '../lib/api'
import StudentForm from '../components/StudentForm'
import StudentCard from '../components/StudentCard'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { StatsGrid } from '../components/ui/StatsGrid'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { StudentLessonsModal } from '../components/StudentLessonsModal'
import { StudentPaymentsModal } from '../components/StudentPaymentsModal'
import { PaymentModal } from '../components/PaymentModal'
import SEO from '../components/ui/SEO'

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLessonsModal, setShowLessonsModal] = useState(false)
  const [showPaymentsModal, setShowPaymentsModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  
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
      const data = await api.students.list()
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

  async function handleAddStudent(data: any) {
    await api.students.create(data)
    await load()
    setShowAddModal(false)
  }

  async function remove(id: string) {
    if (!confirm('Eliminar alumno?')) return
    await api.students.delete(id)
    await load()
  }

  function openEdit(s: Student) {
    setEditStudent(s)
    setShowEditModal(true)
  }

  function openLessons(s: Student) {
    setSelectedStudent(s)
    setShowLessonsModal(true)
  }

  function openPayments(s: Student) {
    setSelectedStudent(s)
    setShowPaymentsModal(true)
  }

  function openAddPayment(s: Student) {
    setSelectedStudent(s)
    setShowAddPaymentModal(true)
  }

  async function handleSaveEdit(data: any) {
    if (!editStudent) return
    await api.students.update(editStudent.id, data)
    await load()
    setShowEditModal(false)
    setEditStudent(null)
  }

  async function handleSyncBalances() {
    if (!confirm('¿Deseas recalcular todos los saldos? Esto sincronizará las clases y pagos registrados.')) return;
    try {
      await api.students.syncBalances();
      await load();
      alert('Saldos sincronizados con éxito');
    } catch (e: any) {
      alert('Error al sincronizar: ' + e.message);
    }
  }

  return (
    <section className="space-y-10">
      <SEO 
        title="Alumnos" 
        description="Gestiona tus alumnos, sus saldos, historias y pagos de forma centralizada."
      />
      <PageHeader 
        title="Alumnos"
        subtitle="Registra, visualiza y organiza la base de alumnos de tu academia."
        badge="Gestión"
        actions={
          <>
            <Button variant="secondary" onClick={handleSyncBalances} title="Recalcular saldos">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="shadow-brand-500/20">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Alumno
              </span>
            </Button>
          </>
        }
      />

      <StatsGrid stats={stats} />

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Cargando alumnos...</p>
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
        ) : students.length === 0 ? (
          <EmptyState 
            message="Aún no hay alumnos registrados"
            description="¡Agrega el primero para comenzar a gestionar tu academia!"
            action={
              <Button onClick={() => setShowAddModal(true)}>
                Agregar Alumno
              </Button>
            }
          />
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
                <StudentCard 
                  key={s.id} 
                  student={s} 
                  onEdit={openEdit} 
                  onDelete={remove} 
                  onViewLessons={openLessons}
                  onViewPayments={openPayments}
                  onAddPayment={openAddPayment}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentLessonsModal
          student={selectedStudent}
          isOpen={showLessonsModal}
          onClose={() => {
            setShowLessonsModal(false)
            setSelectedStudent(null)
          }}
        />
      )}

      {selectedStudent && (
        <StudentPaymentsModal
          student={selectedStudent}
          isOpen={showPaymentsModal}
          onClose={() => {
            setShowPaymentsModal(false)
            setSelectedStudent(null)
          }}
        />
      )}

      {showAddPaymentModal && selectedStudent && (
        <PaymentModal
          initialStudentId={selectedStudent.id}
          students={students}
          onClose={() => {
            setShowAddPaymentModal(false)
            setSelectedStudent(null)
          }}
          onSuccess={() => {
            setShowAddPaymentModal(false)
            setSelectedStudent(null)
            load()
          }}
        />
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nuevo Alumno"
      >
        <StudentForm 
          onSubmit={handleAddStudent} 
          submitLabel="Agregar alumno" 
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditStudent(null) }}
        title="Editar alumno"
      >
        {editStudent && (
          <StudentForm 
            initialData={editStudent} 
            onSubmit={handleSaveEdit} 
            submitLabel="Guardar cambios" 
            onCancel={() => { setShowEditModal(false); setEditStudent(null) }}
          />
        )}
      </Modal>
    </section>
  )
}
