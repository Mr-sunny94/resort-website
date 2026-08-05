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
  X,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

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
    { to: '/admin/amenities', icon: Sparkles, label: 'Amenities' },
    { to: '/admin/gallery', icon: ImageIcon, label: 'Gallery' },
    { to: '/admin/reception-hours', icon: Clock, label: 'Reception Hours' },
    { to: '/admin/blocked-dates', icon: CalendarOff, label: 'Blocked Dates' },
    { to: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800/80 shadow-2xl relative z-20 transition-colors duration-300">
      <div className="p-6 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Shield className="w-5 h-5 text-white dark:text-slate-950" />
          </div>
          <div>
            <h2 className="text-base font-syne font-bold text-slate-900 dark:text-white tracking-wider">AURA ADMIN</h2>
            <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block">CONTROL CENTER</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <Link 
          to="/" 
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all"
        >
          <span>VIEW LIVE SITE</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-mono tracking-wider transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 to-sky-500/5 dark:from-cyan-500/20 dark:to-sky-500/10 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-500/30 dark:border-cyan-500/40 shadow-lg shadow-cyan-900/10 dark:shadow-cyan-950/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent'
              )
            }
          >
            <item.icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/60 transition-colors duration-300">
        <div className="mb-4 px-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">AUTHENTICATED USER</p>
          <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3.5 py-2.5 w-full rounded-xl text-xs font-mono tracking-wider transition-all bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans selection:bg-cyan-500 selection:text-white dark:selection:text-slate-950 relative overflow-x-hidden transition-colors duration-300">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-sky-600/10 dark:bg-sky-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-4 relative z-30 transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-base font-syne font-bold tracking-wider">AURA ADMIN</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /> : <Menu className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm md:hidden transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

