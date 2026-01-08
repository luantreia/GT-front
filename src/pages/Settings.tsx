import React, { useEffect, useState } from 'react';
import { api, Coach } from '../lib/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import SEO from '../components/ui/SEO';

export default function Settings() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newHoliday, setNewHoliday] = useState('');

  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    api.getProfile().then(setCoach).finally(() => setLoading(false));
  }, []);

  const handleWorkHourChange = (day: number, field: 'start' | 'end', value: string) => {
    if (!coach) return;
    const currentHours = coach.workHours || [];
    const existingIndex = currentHours.findIndex(h => h.day === day);
    
    let newHours = [...currentHours];
    if (existingIndex > -1) {
      newHours[existingIndex] = { ...newHours[existingIndex], [field]: value };
    } else {
      newHours.push({ day, start: field === 'start' ? value : '09:00', end: field === 'end' ? value : '18:00' });
    }
    setCoach({ ...coach, workHours: newHours });
  };

  const togglePaymentMethod = (method: string) => {
    if (!coach) return;
    const current = coach.acceptedPayments || [];
    const next = current.includes(method) 
      ? current.filter(m => m !== method) 
      : [...current, method];
    setCoach({ ...coach, acceptedPayments: next });
  };

  const addHoliday = () => {
    if (!newHoliday || !coach) return;
    const current = coach.holidays || [];
    if (current.includes(newHoliday)) return;
    setCoach({ ...coach, holidays: [...current, newHoliday].sort() });
    setNewHoliday('');
  };

  const removeHoliday = (date: string) => {
    if (!coach) return;
    setCoach({ ...coach, holidays: (coach.holidays || []).filter(d => d !== date) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coach) return;
    setSaving(true);
    try {
      await api.updateProfile(coach);
      setMessage('Configuración guardada con éxito');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!coach) return <div className="p-8">Error al cargar perfil</div>;

  return (
    <div className="space-y-10">
      <SEO 
        title="Configuración de Perfil" 
        description="Personaliza tus horarios, tarifas, políticas de cancelación y datos de facturación profesional."
      />
      <PageHeader 
        title="Configuración"
        subtitle="Personaliza los horarios, tarifas y métodos de pago de tu academia."
        badge="Perfil"
      />
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-surface shadow-surface space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Información General</h2>
            <p className="text-sm text-slate-500">Datos básicos de contacto y facturación.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre"
              value={coach.name}
              onChange={e => setCoach({ ...coach, name: e.target.value })}
              required
            />
            <Input
              label="Teléfono"
              value={coach.phone || ''}
              onChange={e => setCoach({ ...coach, phone: e.target.value })}
            />
            <Input
              label="Tarifa por Defecto"
              type="number"
              value={coach.defaultRate || ''}
              onChange={e => setCoach({ ...coach, defaultRate: Number(e.target.value) })}
            />
            <Select
              label="Moneda"
              value={coach.currency || 'ARS'}
              onChange={e => setCoach({ ...coach, currency: e.target.value })}
            >
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="USD">USD - Dólar Estadounidense</option>
              <option value="EUR">EUR - Euro</option>
            </Select>
          </div>
          <Select
            label="Zona Horaria"
            value={coach.timezone || 'America/Argentina/Buenos_Aires'}
            onChange={e => setCoach({ ...coach, timezone: e.target.value })}
          >
            <option value="America/Argentina/Buenos_Aires">Argentina (GMT-3)</option>
            <option value="America/New_York">New York (GMT-5)</option>
            <option value="Europe/Madrid">Madrid (GMT+1)</option>
            <option value="UTC">UTC</option>
          </Select>
        </div>

        <div className="bg-white p-8 rounded-surface shadow-surface space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Datos de Facturación</h2>
            <p className="text-sm text-slate-500">Información para recibos y comprobantes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Negocio"
              value={coach.businessName || ''}
              onChange={e => setCoach({ ...coach, businessName: e.target.value })}
            />
            <Input
              label="CUIT / Tax ID"
              value={coach.taxId || ''}
              onChange={e => setCoach({ ...coach, taxId: e.target.value })}
            />
            <Input
              label="Dirección Física"
              value={coach.address || ''}
              onChange={e => setCoach({ ...coach, address: e.target.value })}
              placeholder="Calle, Ciudad, País"
            />
            <Input
              label="Prefijo de Factura"
              value={coach.invoicePrefix || ''}
              onChange={e => setCoach({ ...coach, invoicePrefix: e.target.value })}
              placeholder="Ej: A-0001"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-surface shadow-surface space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Disponibilidad y Horarios</h2>
            <p className="text-sm text-slate-500">Define tus horarios de trabajo semanales.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DAYS.map((name, i) => {
              const hour = coach.workHours?.find(h => h.day === i);
              return (
                <div key={name} className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">{name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hour?.start || ''}
                      onChange={e => handleWorkHourChange(i, 'start', e.target.value)}
                      className="flex-1 rounded-lg border-slate-200 text-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                    <span className="text-slate-400 text-xs">a</span>
                    <input
                      type="time"
                      value={hour?.end || ''}
                      onChange={e => handleWorkHourChange(i, 'end', e.target.value)}
                      className="flex-1 rounded-lg border-slate-200 text-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-8 rounded-surface shadow-surface space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Feriados y Vacaciones</h2>
            <p className="text-sm text-slate-500">Días en los que la academia permanecerá cerrada.</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-end gap-3 max-w-md">
              <div className="flex-1">
                <Input
                  label="Nueva Fecha"
                  type="date"
                  value={newHoliday}
                  onChange={e => setNewHoliday(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={addHoliday}
                className="mb-1"
              >
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {coach.holidays?.map(date => (
                <span key={date} className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 border border-brand-100">
                  {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  <button 
                    type="button" 
                    onClick={() => removeHoliday(date)}
                    className="hover:text-brand-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {(!coach.holidays || coach.holidays.length === 0) && (
                <p className="text-sm text-slate-400 italic">No hay feriados registrados.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-surface shadow-surface space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Políticas y Pagos</h2>
            <p className="text-sm text-slate-500">Configura reglas de cancelación y medios de cobro.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Cancelación</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <Input
                      type="number"
                      value={coach.cancellationPolicy?.hours || ''}
                      onChange={e => setCoach({ ...coach, cancellationPolicy: { ...coach.cancellationPolicy, hours: Number(e.target.value) } })}
                    />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">horas de anticipación</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <Input
                      type="number"
                      value={coach.cancellationPolicy?.feePercent || ''}
                      onChange={e => setCoach({ ...coach, cancellationPolicy: { ...coach.cancellationPolicy, feePercent: Number(e.target.value) } })}
                    />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">% de penalidad</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Métodos Aceptados</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'cash', label: 'Efectivo' },
                  { id: 'transfer', label: 'Transferencia' },
                  { id: 'mp', label: 'Mercado Pago' },
                  { id: 'card', label: 'Tarjeta' }
                ].map(m => (
                  <label key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={coach.acceptedPayments?.includes(m.id)}
                      onChange={() => togglePaymentMethod(m.id)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-slate-700">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-surface shadow-surface sticky bottom-6">
          <p className={`text-sm font-medium transition-opacity duration-500 ${message ? 'opacity-100 text-emerald-600' : 'opacity-0'}`}>
            {message || 'Cambios sin guardar'}
          </p>
          <Button 
            type="submit" 
            disabled={saving}
            className="min-w-[200px] shadow-brand-500/20"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
