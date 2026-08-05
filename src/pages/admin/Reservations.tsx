import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Reservation } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Search, Sparkles, User, Calendar, Mail, Phone, ChevronDown } from 'lucide-react';

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservations')
      .select('*, resort_rooms(room_name)')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setReservations(data as unknown as Reservation[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    await supabase.from('reservations').update({ status: newStatus }).eq('id', id);
    setUpdatingId(null);
    fetchReservations();
  };

  const filteredReservations = reservations.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      r.full_name?.toLowerCase().includes(q) || 
      r.email?.toLowerCase().includes(q) || 
      r.phone?.toLowerCase().includes(q) ||
      r.resort_rooms?.room_name?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const statusStyles = {
    pending: 'bg-amber-100/80 text-amber-700 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80',
    confirmed: 'bg-emerald-100/80 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80',
    cancelled: 'bg-rose-100/80 text-rose-700 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80',
    completed: 'bg-cyan-100/80 text-cyan-700 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800/80'
  };

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-300">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">GUEST BOOKINGS</span>
          </div>
          <h1 className="text-3xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">Reservations Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-light mt-1">Review, approve, or update guest reservation requests</p>
        </div>

        {/* STATUS FILTER PILLS */}
        <div className="flex flex-wrap bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all capitalize",
                filter === status 
                  ? "bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md shadow-cyan-500/20" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search by guest name, email, phone or suite..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
        />
      </div>

      {/* RESERVATIONS TABLE CARD */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl transition-colors duration-300 bg-white/60 dark:bg-transparent">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Fetching guest reservations...</span>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-syne font-bold text-slate-900 dark:text-white mb-1">No reservations found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">No matching records found for status "{filter}".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px] text-xs font-mono">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors duration-300">
                  <th className="px-6 py-4 font-semibold">Guest Contact</th>
                  <th className="px-6 py-4 font-semibold">Stay Dates</th>
                  <th className="px-6 py-4 font-semibold">Suite Assigned</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors duration-300">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>{res.full_name}</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-1">
                        <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{res.email}</span>
                      </div>
                      <div className="text-slate-500 flex items-center space-x-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{res.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-white font-semibold flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>{format(new Date(res.check_in_date), 'MMM d')} - {format(new Date(res.check_out_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 mt-1">{res.guests_count} GUEST(S)</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-300 font-semibold transition-colors duration-300">
                        {res.resort_rooms?.room_name || 'Unassigned Suite'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-colors duration-300",
                        statusStyles[res.status as keyof typeof statusStyles]
                      )}>
                        {updatingId === res.id ? 'UPDATING...' : res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <select
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-cyan-700 dark:text-cyan-300 text-xs rounded-xl focus:border-cyan-500 outline-none p-2 font-mono transition-all"
                          value={res.status}
                          disabled={updatingId === res.id}
                          onChange={(e) => handleStatusChange(res.id, e.target.value)}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

