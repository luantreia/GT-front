import React, { useState } from 'react';
import { Student } from '../lib/api';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface StudentFormProps {
  initialData?: Partial<Student>;
  onSubmit: (data: any) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}

export default function StudentForm({ initialData, onSubmit, submitLabel, onCancel }: StudentFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [defaultRate, setDefaultRate] = useState<number | ''>(initialData?.defaultRate ?? '');
  const [currency, setCurrency] = useState(initialData?.currency || 'ARS');
  const [birthdate, setBirthdate] = useState(initialData?.birthdate ? new Date(initialData.birthdate).toISOString().split('T')[0] : '');
  const [level, setLevel] = useState(initialData?.level || '');
  const [hand, setHand] = useState<'right' | 'left'>(initialData?.hand || 'right');
  const [status, setStatus] = useState<'active' | 'inactive'>(initialData?.status || 'active');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [goals, setGoals] = useState(initialData?.goals?.join(', ') || '');
  const [guardianName, setGuardianName] = useState(initialData?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(initialData?.guardianPhone || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        phone: phone || undefined,
        email: email || undefined,
        status,
        defaultRate: defaultRate === '' ? undefined : Number(defaultRate),
        currency,
        birthdate: birthdate || undefined,
        level: level || undefined,
        hand,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        goals: goals ? goals.split(',').map(g => g.trim()).filter(Boolean) : [],
        guardianName: guardianName || undefined,
        guardianPhone: guardianPhone || undefined,
        notes: notes || undefined
      });
      if (!initialData) {
        // Reset if it's a creation form
        setName(''); setPhone(''); setEmail(''); setDefaultRate(''); setCurrency('ARS');
        setBirthdate(''); setLevel(''); setHand('right'); setStatus('active');
        setTags(''); setGoals('');
        setGuardianName(''); setGuardianPhone(''); setNotes('');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label="Nombre"
          placeholder="Nombre completo"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="col-span-1">
        <Input
          label="Teléfono"
          placeholder="Opcional"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>
      
      <div className="col-span-1">
        <Input
          label="Email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
        />
      </div>

      <div className="col-span-1">
        <Input
          label="Tarifa ($)"
          placeholder="Ej: 5000"
          type="number"
          value={defaultRate}
          onChange={e => setDefaultRate(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>
      
      <div className="col-span-1">
        <Select
          label="Moneda"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          options={[
            { value: 'ARS', label: 'ARS' },
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' }
          ]}
        />
      </div>

      <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-1">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Información Adicional
        </h3>
        
        <div className="grid gap-x-3 gap-y-4 grid-cols-1 sm:grid-cols-2">
          <Select
            label="Nivel"
            value={level}
            onChange={e => setLevel(e.target.value)}
            options={[
              { value: '', label: 'Seleccionar nivel' },
              { value: 'Principiante', label: 'Principiante' },
              { value: 'Intermedio', label: 'Intermedio' },
              { value: 'Avanzado', label: 'Avanzado' },
              { value: 'Pro', label: 'Pro' }
            ]}
          />
          <Select
            label="Mano"
            value={hand}
            onChange={e => setHand(e.target.value as any)}
            options={[
              { value: 'right', label: 'Diestro' },
              { value: 'left', label: 'Zurdo' }
            ]}
          />
          <Select
            label="Estado"
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' }
            ]}
          />
          <Input
            label="Fecha Nacimiento"
            type="date"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
          />
          <Input
            label="Etiquetas"
            placeholder="Ej: Competencia, Mañana"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
          <Input
            label="Objetivos"
            placeholder="Ej: Mejorar revés, Bajar peso"
            value={goals}
            onChange={e => setGoals(e.target.value)}
          />
          <Input
            label="Tutor (Nombre)"
            placeholder="Si es menor"
            value={guardianName}
            onChange={e => setGuardianName(e.target.value)}
          />
          <Input
            label="Tutor (Teléfono)"
            placeholder="Opcional"
            value={guardianPhone}
            onChange={e => setGuardianPhone(e.target.value)}
          />
          <div className="sm:col-span-2">
            <label className="block space-y-1 text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas / Objetivos</span>
              <textarea
                placeholder="Metas, lesiones, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-inner focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all resize-none"
                rows={3}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={`sm:col-span-2 flex flex-col-reverse sm:flex-row gap-2 mt-2 ${onCancel ? 'sm:justify-end' : ''}`}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} type="button" className="w-full sm:w-auto py-2.5">
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          loading={loading} 
          className={`w-full sm:w-auto py-2.5 ${onCancel ? 'sm:min-w-[140px]' : 'flex-1'}`}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
