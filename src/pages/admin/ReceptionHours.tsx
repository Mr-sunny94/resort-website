import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ReceptionHour } from '../../types';
import { Clock, Save } from 'lucide-react';
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
      // Seed defaults if empty
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
      fetchHours(); // refresh IDs
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-slate-200 rounded w-1/4"></div></div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900">Reception Hours</h1>
          <p className="text-slate-500 mt-2">Manage the front desk operating hours.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-200 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Reception hours saved successfully!
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6 md:p-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {hours.map((h, index) => (
              <div key={h.weekday} className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-slate-100 last:border-0 gap-4">
                <div className="w-32">
                  <span className="font-medium text-slate-900">{WEEKDAYS[h.weekday]}</span>
                </div>
                
                <div className="flex items-center space-x-6 flex-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.is_open}
                      onChange={(e) => handleUpdate(index, 'is_open', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-700">{h.is_open ? 'Open' : 'Closed'}</span>
                  </label>

                  <div className={cn("flex items-center space-x-3 transition-opacity", !h.is_open && "opacity-50 pointer-events-none")}>
                    <input
                      type="time"
                      value={h.start_time || ''}
                      onChange={(e) => handleUpdate(index, 'start_time', e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={h.end_time || ''}
                      onChange={(e) => handleUpdate(index, 'end_time', e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-8 mt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Hours'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
