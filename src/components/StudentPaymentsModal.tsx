import React, { useEffect, useState } from 'react';
import { api, Payment, Student } from '../lib/api';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';

interface StudentPaymentsModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentPaymentsModal({ student, isOpen, onClose }: StudentPaymentsModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.payments.list().then(all => {
        const filtered = all.filter(p => {
          // 1. Intentar con studentId (que debería ser un string por la normalización del backend)
          const pStudentId = p.studentId && typeof p.studentId === 'object' 
            ? (p.studentId._id || p.studentId.id || p.studentId) 
            : p.studentId;
          
          if (String(pStudentId) === String(student.id)) return true;

          // 2. Fallback: Intentar con el objeto student si existe
          if (p.student) {
            const sId = p.student._id || p.student.id;
            if (sId && String(sId) === String(student.id)) return true;
          }

          return false;
        });
        
        setPayments(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }).catch(err => {
        console.error('Error cargando pagos:', err);
      }).finally(() => setLoading(false));
    }
  }, [isOpen, student.id]);

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'transfer': return 'Transferencia';
      case 'mp': return 'Mercado Pago';
      case 'card': return 'Tarjeta';
      default: return method;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'neutral';
      case 'refunded': return 'info';
      case 'failed': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pagos de ${student.name}`}>
      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center text-slate-500">Cargando historial de pagos...</div>
        ) : payments.length === 0 ? (
          <div className="py-10 text-center text-slate-500 italic">
            Este alumno no tiene pagos registrados.
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
            {payments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                      {new Date(payment.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status === 'completed' ? 'Completado' : payment.status === 'pending' ? 'Pendiente' : payment.status === 'refunded' ? 'Reembolsado' : 'Fallido'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Método: {getMethodLabel(payment.method)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-600">
                    + ${payment.amount}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {payment.currency}
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
