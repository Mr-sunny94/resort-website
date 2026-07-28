import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Reservation } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Search, ChevronDown, CheckCircle, Clock, XCircle, MoreVertical } from 'lucide-react';

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservations')
      .select('*, resort_rooms(room_name)')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setReservations(data as unknown as Reservation[]); // Type coercion due to join
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

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  const statusStyles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-slate-900">Reservations</h1>
          <p className="text-slate-500 mt-2">Manage all guest bookings and statuses.</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                filter === status ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading reservations...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reservations found</h3>
            <p className="text-slate-500">There are no {filter !== 'all' ? filter : ''} reservations to display.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Guest</th>
                  <th className="px-6 py-4 font-medium">Stay Details</th>
                  <th className="px-6 py-4 font-medium">Room</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{res.full_name}</div>
                      <div className="text-sm text-slate-500">{res.email}</div>
                      <div className="text-sm text-slate-500">{res.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">
                        {format(new Date(res.check_in_date), 'MMM d')} - {format(new Date(res.check_out_date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-slate-500">{res.guests_count} Guests</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {res.resort_rooms?.room_name || 'Unknown Room'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
                        statusStyles[res.status as keyof typeof statusStyles]
                      )}>
                        {updatingId === res.id ? 'Updating...' : res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <select
                          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-900 focus:border-slate-900 block w-full p-2"
                          value={res.status}
                          disabled={updatingId === res.id}
                          onChange={(e) => handleStatusChange(res.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
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
