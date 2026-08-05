import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Reservation, ResortRoom } from '../../types';
import { Users, BedDouble, CalendarCheck, Clock, CheckCircle, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { isToday, isFuture } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    upcoming: 0,
    arrivalsToday: 0,
    activeRooms: 0,
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [fullRoomNotices, setFullRoomNotices] = useState<any[]>([]);
  const [roomOccupancy, setRoomOccupancy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [resResponse, roomsResponse] = await Promise.all([
          supabase.from('reservations').select('*').order('created_at', { ascending: false }),
          supabase.from('resort_rooms').select('*').eq('is_active', true),
        ]);

        const reservations = (resResponse.data || []) as Reservation[];
        const rooms = (roomsResponse.data || []) as ResortRoom[];

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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const notices = reservations
          .filter(res => {
            if (res.status !== 'confirmed') return false;
            const checkIn = new Date(res.check_in_date);
            const checkOut = new Date(res.check_out_date);
            // Reset times for accurate date-only comparison
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            return checkIn <= today && checkOut >= today;
          })
          .map(res => {
            const room = rooms.find(r => r.id === res.room_id);
            if (room && res.guests_count >= room.capacity) {
              return {
                id: res.id,
                roomName: room.room_name,
                endDate: res.check_out_date,
                guests: res.guests_count,
                capacity: room.capacity
              };
            }
            return null;
          })
          .filter(Boolean);

        const occupancyData = rooms.map(room => {
          // Find all ACTIVE reservations for THIS room today
          const activeRes = reservations.filter(res => {
            if (res.status !== 'confirmed') return false;
            const checkIn = new Date(res.check_in_date);
            const checkOut = new Date(res.check_out_date);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            return res.room_id === room.id && checkIn <= today && checkOut >= today;
          });
          
          // Sum up the guests
          const currentGuests = activeRes.reduce((sum, res) => sum + res.guests_count, 0);
          
          return {
            id: room.id,
            roomName: room.room_name,
            capacity: room.capacity,
            currentGuests: currentGuests
          };
        });

        setRoomOccupancy(occupancyData);
        setFullRoomNotices(notices);
        setRecentReservations(reservations.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400 font-mono text-xs flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading Control Center Metrics...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-500/30', bg: 'bg-amber-100/50 dark:bg-amber-950/30' },
    { label: 'Confirmed Stays', value: stats.confirmed, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-500/30', bg: 'bg-emerald-100/50 dark:bg-emerald-950/30' },
    { label: 'Upcoming Arrivals', value: stats.upcoming, icon: CalendarCheck, color: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-500/30', bg: 'bg-cyan-100/50 dark:bg-cyan-950/30' },
    { label: "Today's Arrivals", value: stats.arrivalsToday, icon: Users, color: 'text-sky-600 dark:text-sky-400', border: 'border-sky-300 dark:border-sky-500/30', bg: 'bg-sky-100/50 dark:bg-sky-950/30' },
    { label: 'Active Rooms', value: stats.activeRooms, icon: BedDouble, color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-500/30', bg: 'bg-purple-100/50 dark:bg-purple-950/30' },
  ];

  return (
    <div className="space-y-10">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-300">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2 transition-colors duration-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">LIVE METRICS</span>
          </div>
          <h1 className="text-3xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">Overview & Telemetry</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-light mt-1">Real-time resort operations and booking status</p>
        </div>

        <Link 
          to="/admin/reservations" 
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-white dark:text-slate-950 font-bold text-xs font-mono uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <span>MANAGE RESERVATIONS</span>
          <TrendingUp className="w-4 h-4" />
        </Link>
      </div>

      {/* ROOM FULL NOTICES */}
      {fullRoomNotices.length > 0 && (
        <div className="space-y-3">
          {fullRoomNotices.map(notice => (
            <div key={notice.id} className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                  <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-syne font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span className="text-rose-600 dark:text-rose-400">MAX CAPACITY REACHED:</span>
                    <span>{notice.roomName}</span>
                  </h4>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                    Currently occupied by {notice.guests}/{notice.capacity} guests.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Frees Up On</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono font-semibold text-slate-900 dark:text-white shadow-sm">
                  {notice.endDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className={`glass-card bg-white/60 dark:bg-transparent p-5 rounded-2xl border ${stat.border} flex flex-col justify-between relative overflow-hidden group transition-colors duration-300`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} border ${stat.border} transition-colors duration-300`}>
                <stat.icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">LIVE</span>
            </div>
            <div>
              <h3 className="text-3xl font-syne font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* LIVE ROOM OCCUPANCY */}
      <div className="glass-card bg-white/60 dark:bg-transparent rounded-3xl border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-purple-100/50 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <BedDouble className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-syne font-bold text-slate-900 dark:text-white">Live Room Occupancy</h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Current guests vs max capacity per room</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomOccupancy.map(room => {
            const percentage = room.capacity > 0 ? Math.min(100, (room.currentGuests / room.capacity) * 100) : 0;
            const isMax = percentage >= 100;
            return (
              <div key={room.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate pr-2">{room.roomName}</h4>
                  <span className={cn(
                    "text-[10px] font-mono font-bold px-2 py-1 rounded-md",
                    isMax ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400" : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400"
                  )}>
                    {room.currentGuests}/{room.capacity} GUESTS
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isMax ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT RESERVATIONS SUMMARY TABLE */}
      <div className="glass-card bg-white/60 dark:bg-transparent rounded-3xl border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-100/50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-syne font-bold text-slate-900 dark:text-white">Recent Reservation Activity</h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Latest incoming guest requests</p>
            </div>
          </div>
          <Link to="/admin/reservations" className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline uppercase tracking-widest">
            View All &rarr;
          </Link>
        </div>

        {recentReservations.length === 0 ? (
          <p className="text-xs font-mono text-slate-400 dark:text-slate-500 py-6 text-center">No reservations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors duration-300">
                  <th className="pb-3 px-3">Guest Name</th>
                  <th className="pb-3 px-3">Check-In</th>
                  <th className="pb-3 px-3">Check-Out</th>
                  <th className="pb-3 px-3">Guests</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {recentReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors duration-300">
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">{res.full_name}</td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{res.check_in_date}</td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{res.check_out_date}</td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">{res.guests_count}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                        res.status === 'confirmed' ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800' :
                        res.status === 'pending' ? 'bg-amber-100/80 text-amber-700 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800' :
                        'bg-rose-100/80 text-rose-700 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                      }`}>
                        {res.status}
                      </span>
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

