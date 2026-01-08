import React, { useEffect, useState } from 'react';
import { api, Lesson, Student } from '../lib/api';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';

interface StudentLessonsModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentLessonsModal({ student, isOpen, onClose }: StudentLessonsModalProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.lessons.list().then(all => {
        // Filtrar clases donde el alumno es el principal o participante
        const filtered = all.filter(l => 
          l.studentId === student.id || 
          l.participants?.some(p => p.studentId === student.id)
        );
        setLessons(filtered.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()));
      }).finally(() => setLoading(false));
    }
  }, [isOpen, student.id]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Clases de ${student.name}`}>
      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center text-slate-500">Cargando historial...</div>
        ) : lessons.length === 0 ? (
          <div className="py-10 text-center text-slate-500 italic">
            Este alumno no tiene clases registradas.
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
            {lessons.map(lesson => (
              <div key={lesson.id} className="flex items-center justify-between gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                      {new Date(lesson.start).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </span>
                    <Badge variant={getStatusVariant(lesson.status)}>
                      {lesson.status === 'completed' ? 'Finalizada' : lesson.status === 'cancelled' ? 'Cancelada' : 'Programada'}
                    </Badge>
                    <Badge variant={lesson.paymentStatus === 'paid' ? 'success' : lesson.paymentStatus === 'partial' ? 'warning' : 'neutral'}>
                      {lesson.paymentStatus === 'paid' ? 'Pagada' : lesson.paymentStatus === 'partial' ? 'Parcial' : 'Impaga'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(lesson.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(lesson.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ${lesson.type === 'group' 
                      ? lesson.participants?.find(p => p.studentId === student.id)?.price 
                      : lesson.price}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {lesson.type === 'group' ? 'Grupal' : 'Individual'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
