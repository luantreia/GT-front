import React, { useState, useRef, useEffect } from 'react';
import { Lesson } from '../lib/api';
import { Badge } from './ui/Badge';

interface LessonCardProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
  onRegisterPayment: (lesson: Lesson) => void;
  onRepeat: (lesson: Lesson, weeks: number) => void;
}

export default function LessonCard({ lesson, onEdit, onDelete, onRegisterPayment, onRepeat }: LessonCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      default: return 'neutral';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'partial': return 'Pago Parcial';
      default: return 'Pendiente';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return 'Programada';
    }
  };

  return (
    <li className="flex flex-col justify-between rounded-surface bg-white p-5 shadow-card border border-slate-50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700">
              {lesson.type === 'group' ? 'G' : (lesson.student?.name?.charAt(0).toUpperCase() ?? 'P')}
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">
                {lesson.type === 'group' ? 'Clase Grupal' : (lesson.student?.name || 'Sin alumno')}
              </p>
              <div className="flex gap-1.5 mt-0.5">
                <Badge variant={getStatusVariant(lesson.status)}>
                  {getStatusLabel(lesson.status)}
                </Badge>
                <Badge variant={getPaymentStatusVariant(lesson.paymentStatus)}>
                  {getPaymentStatusLabel(lesson.paymentStatus)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-slate-400 hover:text-brand-600 transition p-1 rounded-lg hover:bg-slate-100"
              title="Opciones"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(lesson);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar clase
                </button>
                
                <div className="border-t border-slate-50 my-1"></div>
                <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repetir clase</p>
                {[1, 2, 3, 4].map(weeks => (
                  <button
                    key={weeks}
                    onClick={() => {
                      onRepeat(lesson, weeks);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Por {weeks} {weeks === 1 ? 'semana' : 'semanas'}
                  </button>
                ))}

                <div className="border-t border-slate-50 my-1"></div>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
                      onDelete(lesson.id);
                    }
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <svg className="mr-3 h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar clase
                </button>
              </div>
            )}
          </div>
        </div>

        {lesson.type === 'group' && lesson.participants && lesson.participants.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Participantes</p>
            <div className="flex flex-wrap gap-1">
              {lesson.participants.map((p: any) => (
                <span key={p.studentId} className="text-[11px] font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 text-slate-600">
                  {p.studentName || 'Alumno'}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <p className="flex items-center justify-between text-slate-600">
            <span className="font-medium text-slate-500">Horario</span>
            <span className="font-medium">
              {new Date(lesson.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(lesson.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
          <p className="flex items-center justify-between text-slate-600">
            <span className="font-medium text-slate-500">Fecha</span>
            <span className="font-medium">{new Date(lesson.start).toLocaleDateString()}</span>
          </p>
          {lesson.price !== undefined && (
            <p className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Precio</span>
              <span className="font-bold text-slate-900">${lesson.price}</span>
            </p>
          )}
          {lesson.notes && (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600 italic text-xs border border-slate-100/50">
              "{lesson.notes}"
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        {lesson.paymentStatus !== 'paid' && (
          <button
            onClick={() => onRegisterPayment(lesson)}
            className="w-full rounded-xl bg-brand-500 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-400"
          >
            Registrar Pago
          </button>
        )}
      </div>
    </li>
  );
}
