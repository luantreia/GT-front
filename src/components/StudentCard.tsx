import React from 'react';
import { Student } from '../lib/api';
import { Badge } from './ui/Badge';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onViewLessons: (student: Student) => void;
  onViewPayments: (student: Student) => void;
  onAddPayment: (student: Student) => void;
}

export default function StudentCard({ student, onEdit, onDelete, onViewLessons, onViewPayments, onAddPayment }: StudentCardProps) {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <li className="group relative flex flex-col justify-between rounded-surface bg-white p-5 shadow-card border border-slate-50 transition-all hover:shadow-md">
      {/* Botón de configuración (Tuerca) */}
      <div className="absolute right-4 top-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Configuración"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {showSettings && (
          <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white p-1 shadow-xl border border-slate-100 z-10">
            <button
              onClick={() => {
                onEdit(student);
                setShowSettings(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              onClick={() => {
                onAddPayment(student);
                setShowSettings(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2m14 0V9a2 2 0 00-2-2h-2M9 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-7 7h10" />
              </svg>
              Registrar Pago
            </button>
            <button
              onClick={() => {
                onViewPayments(student);
                setShowSettings(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2m14 0V9a2 2 0 00-2-2h-2M9 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-7 7h10" />
              </svg>
              Ver Pagos
            </button>
            <button
              onClick={() => {
                onDelete(student.id);
                setShowSettings(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700">
            {student.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-base font-semibold text-slate-900">{student.name}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant={student.balance > 0 ? 'error' : 'success'}>
                Saldo: ${student.balance}
              </Badge>
              {student.packageCredits > 0 && (
                <Badge variant="info">
                  Créditos: {student.packageCredits}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center justify-between text-slate-600">
            <span className="font-medium text-slate-500">Email</span>
            <span className="truncate max-w-[150px]">{student.email ?? 'Sin registro'}</span>
          </p>
          <p className="flex items-center justify-between text-slate-600">
            <span className="font-medium text-slate-500">Teléfono</span>
            <span>{student.phone ?? 'Sin registro'}</span>
          </p>
          <p className="flex items-center justify-between text-slate-600">
            <span className="font-medium text-slate-500">Tarifa</span>
            <span className="font-semibold text-slate-900">
              {student.defaultRate ? `$${student.defaultRate} ${student.currency || 'ARS'}` : 'Default Coach'}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-5">
        <button
          onClick={() => onViewLessons(student)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Ver Clases
        </button>
      </div>
    </li>
  );
}
