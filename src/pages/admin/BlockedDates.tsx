import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BlockedDate } from '../../types';
import { format } from 'date-fns';
import { CalendarOff, Plus, Trash2, XCircle } from 'lucide-react';

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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900">Blocked Dates</h1>
          <p className="text-slate-500 mt-2">Prevent reservations on specific dates.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Date Block</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading...</div>
        ) : blockedDates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <CalendarOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No blocked dates</h3>
            <p className="text-slate-500">Your calendar is fully open for reservations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blockedDates.map((block) => (
                  <tr key={block.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {format(new Date(block.blocked_date), 'MMMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {block.reason || <span className="text-slate-400 italic">No reason provided</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(block.id)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-serif text-slate-900">Block a Date</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.blocked_date}
                  onChange={(e) => setFormData({ ...formData, blocked_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  placeholder="e.g., Private Event, Maintenance"
                />
              </div>
              <div className="pt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
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
