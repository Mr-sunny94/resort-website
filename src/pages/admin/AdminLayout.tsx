import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BedDouble, 
  Sparkles, 
  CalendarOff,
  BookOpen,
  Clock,
  Image as ImageIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/reservations', icon: BookOpen, label: 'Reservations' },
    { to: '/admin/rooms', icon: BedDouble, label: 'Resort Rooms' },
    { to: '/admin/amenities', icon: Sparkles, label: 'Featured Amenities' },
    { to: '/admin/gallery', icon: ImageIcon, label: 'Gallery' },
    { to: '/admin/reception-hours', icon: Clock, label: 'Reception Hours' },
    { to: '/admin/blocked-dates', icon: CalendarOff, label: 'Blocked Dates' },
    { to: '/admin/settings', icon: SettingsIcon, label: 'Resort Settings' },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 flex-shrink-0">
      <div className="p-6">
        <h2 className="text-xl font-serif text-white tracking-wide">Resort Admin</h2>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors',
                isActive
                  ? 'bg-slate-800 text-white font-medium'
                  : 'hover:bg-slate-800/50 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Logged in as</p>
          <p className="text-sm text-slate-300 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-left hover:bg-slate-800 transition-colors text-rose-400 hover:text-rose-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4">
        <h2 className="text-xl font-serif tracking-wide">Resort Admin</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
