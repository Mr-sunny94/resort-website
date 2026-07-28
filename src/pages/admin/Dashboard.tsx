import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Reservation, ResortRoom } from '../../types';
import { Users, BedDouble, CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import { format, isToday, isFuture } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    upcoming: 0,
    arrivalsToday: 0,
    activeRooms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [resResponse, roomsResponse] = await Promise.all([
          supabase.from('reservations').select('*'),
          supabase.from('resort_rooms').select('*').eq('is_active', true),
        ]);

        const reservations = (resResponse.data || []) as Reservation[];
        const rooms = (roomsResponse.data || []) as ResortRoom[];

        const now = new Date();
        let pending = 0;
        let confirmed = 0;
        let upcoming = 0;
        let arrivalsToday = 0;

        reservations.forEach((res) => {
          if (res.status === 'pending') pending++;
          if (res.status === 'confirmed') confirmed++;
          
          const checkIn = new Date(res.check_in_date);
          if (res.status === 'confirmed' && isFuture(checkIn)) upcoming++;
          if (res.status === 'confirmed' && isToday(checkIn)) arrivalsToday++;
        });

        setStats({
          pending,
          confirmed,
          upcoming,
          arrivalsToday,
          activeRooms: rooms.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-slate-200 rounded w-1/4"></div></div>;
  }

  const statCards = [
    { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Confirmed Stays', value: stats.confirmed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Upcoming Arrivals', value: stats.upcoming, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: "Today's Arrivals", value: stats.arrivalsToday, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Rooms', value: stats.activeRooms, icon: BedDouble, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-2">Welcome to the resort admin dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-semibold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Could add a recent reservations table here if needed, but we have a dedicated page */}
    </div>
  );
}
