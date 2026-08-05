import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Shield, Sparkles, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white dark:selection:text-slate-950 transition-colors duration-300">
      {/* AMBIENT LIGHTING GLOWS */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse-glow" />

      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resort</span>
        </Link>
      </div>

      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full relative z-10 shadow-2xl bg-white/60 dark:bg-transparent transition-colors duration-300">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-sky-400 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-cyan-500/30">
            <Shield className="w-7 h-7 text-white dark:text-slate-950 stroke-[2.5]" />
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2 transition-colors duration-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">ADMINISTRATOR PORTAL</span>
          </div>
          <h1 className="text-2xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">AUTHENTICATE</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-light mt-1">
            Access management dashboard & control panel
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 p-4 rounded-2xl mb-6 text-xs font-mono border border-rose-200 dark:border-rose-800/80 text-center transition-colors duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
              placeholder="admin@resort.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-40"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS CONTROL PANEL'}
          </button>
        </form>
      </div>
    </div>
  );
}

