import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BlockedDate } from '../../types';
import { format } from 'date-fns';
import { CalendarOff, Plus, Trash2, XCircle, Sparkles, Calendar } from 'lucide-react';

export default function BlockedDates() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    blocked_date: '',
    reason: '',
  });

  const fetchBlockedDates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('blocked_date', { ascending: true });
    if (!error && data) {
      setBlockedDates(data as BlockedDate[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('blocked_dates').insert([formData]);
    setIsModalOpen(false);
    setFormData({ blocked_date: '', reason: '' });
    fetchBlockedDates();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this block?')) {
      await supabase.from('blocked_dates').delete().eq('id', id);
      fetchBlockedDates();
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-300">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2 transition-colors duration-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">CALENDAR OVERRIDES</span>
          </div>
          <h1 className="text-3xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">Blocked Dates</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-light mt-1">Manage blackout dates for maintenance, private events, or seasonal closures</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 font-bold text-xs font-mono uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ADD DATE BLOCK</span>
        </button>
      </div>

      {/* BLOCKED DATES TABLE CARD */}
      <div className="glass-card bg-white/60 dark:bg-transparent rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl transition-colors duration-300">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Fetching blocked dates...</span>
          </div>
        ) : blockedDates.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 transition-colors duration-300">
              <CalendarOff className="w-6 h-6" />
            </div>
            <h3 className="text-base font-syne font-bold text-slate-900 dark:text-white mb-1">No blocked dates</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">Your calendar is fully open for guest reservations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px] text-xs font-mono">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors duration-300">
                  <th className="px-6 py-4 font-semibold">Blocked Date</th>
                  <th className="px-6 py-4 font-semibold">Reason</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {blockedDates.map((block) => (
                  <tr key={block.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors duration-300">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>{format(new Date(block.blocked_date), 'MMMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {block.reason ? (
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors duration-300">
                          {block.reason}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 italic">No reason specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(block.id)}
                        className="p-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
                        title="Remove Block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD BLOCK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-300">
          <div className="glass-card bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-900/60 transition-colors duration-300">
              <h2 className="text-lg font-syne font-bold text-slate-900 dark:text-white">Block a Date</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Date to Block</label>
                <input
                  type="date"
                  required
                  value={formData.blocked_date}
                  onChange={(e) => setFormData({ ...formData, blocked_date: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Reason (Optional)</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                  placeholder="e.g. Private Event, Maintenance"
                />
              </div>
              <div className="pt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-mono text-xs uppercase tracking-wider hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Save Date Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

