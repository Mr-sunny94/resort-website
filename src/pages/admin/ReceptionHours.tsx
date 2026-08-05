import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ReceptionHour } from '../../types';
import { Clock, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ReceptionHours() {
  const [hours, setHours] = useState<ReceptionHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchHours = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('reception_hours').select('*').order('weekday', { ascending: true });
    
    if (data && data.length > 0) {
      setHours(data as ReceptionHour[]);
    } else {
      const defaults = WEEKDAYS.map((_, index) => ({
        weekday: index,
        is_open: true,
        start_time: '08:00',
        end_time: '20:00'
      }));
      setHours(defaults as ReceptionHour[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHours();
  }, []);

  const handleUpdate = (index: number, field: keyof ReceptionHour, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      for (const h of hours) {
        if (h.id) {
          await supabase.from('reception_hours').update(h).eq('id', h.id);
        } else {
          await supabase.from('reception_hours').insert([h]);
        }
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchHours();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading reception schedules...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* HEADER BAR */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-300">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2 transition-colors duration-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">FRONT DESK TIMINGS</span>
        </div>
        <h1 className="text-3xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">Reception Hours</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-light mt-1">Configure weekly front desk availability and check-in windows</p>
      </div>

      {success && (
        <div className="glass-card bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl text-xs font-mono flex items-center shadow-lg transition-colors duration-300">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
          Reception operating hours updated successfully!
        </div>
      )}

      <div className="glass-card bg-white/60 dark:bg-transparent rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl transition-colors duration-300">
        <form onSubmit={handleSubmit}>
          <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {hours.map((h, index) => (
              <div key={h.weekday} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4 transition-colors duration-300">
                <div className="w-36">
                  <span className="font-syne font-semibold text-sm text-slate-900 dark:text-white">{WEEKDAYS[h.weekday]}</span>
                </div>
                
                <div className="flex items-center space-x-6 flex-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.is_open}
                      onChange={(e) => handleUpdate(index, 'is_open', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className={`text-xs font-mono uppercase tracking-wider ${h.is_open ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-500'}`}>
                      {h.is_open ? 'OPEN' : 'CLOSED'}
                    </span>
                  </label>

                  <div className={cn("flex items-center space-x-3 transition-opacity", !h.is_open && "opacity-30 pointer-events-none")}>
                    <input
                      type="time"
                      value={h.start_time || ''}
                      onChange={(e) => handleUpdate(index, 'start_time', e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 outline-none transition-colors duration-300"
                    />
                    <span className="text-slate-500 text-xs font-mono">TO</span>
                    <input
                      type="time"
                      value={h.end_time || ''}
                      onChange={(e) => handleUpdate(index, 'end_time', e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 outline-none transition-colors duration-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-8 mt-6 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 font-bold text-xs font-mono uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{saving ? 'SAVING CHANGES...' : 'SAVE RECEPTION HOURS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

