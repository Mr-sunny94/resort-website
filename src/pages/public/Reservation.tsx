import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortSettings } from '../../types';
import BookingWidget from '../../components/BookingWidget';
import { Anchor, Phone, Mail, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reservation() {
  const [settings, setSettings] = useState<ResortSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('resort_settings').select('*').limit(1).single();
      if (data) {
        let loadedSettings: any = { ...data };
        const localLogo = localStorage.getItem('resort_logo_url');
        if (localLogo) loadedSettings.resort_logo_url = localLogo;
        setSettings(loadedSettings as ResortSettings);
      }
    }
    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col relative overflow-x-hidden">
      
      {/* AMBIENT LIGHTING GLOWS */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse-glow" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* GLASS HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            {settings?.resort_logo_url ? (
              <img src={settings.resort_logo_url} alt={settings.resort_name} className="h-9 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Anchor className="w-5 h-5 text-slate-950" />
              </div>
            )}
            <span className="text-lg font-syne font-bold tracking-wider uppercase text-white">
              {settings?.resort_name || 'AURA HAVEN'}
            </span>
          </Link>

          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-cyan-400 px-4 py-2 rounded-full border border-slate-800 hover:border-cyan-500/40 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </header>

      {/* MAIN RESERVATION CONTENT */}
      <main className="flex-grow pt-32 pb-20 px-6 relative z-10 flex items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">ONLINE SUITE BOOKING</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-syne font-bold text-white leading-tight">
              Begin your <br/>
              <span className="text-gradient-cyan">luxury getaway</span>.
            </h1>

            <p className="text-slate-300 text-base leading-relaxed font-light">
              Select your dates and preferred suite to reserve your stay. Our dedicated guest concierge will ensure every detail of your visit is flawlessly tailored.
            </p>

            <div className="space-y-4 pt-4">
              <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-widest block">DIRECT CONCIERGE PHONE</span>
                  <span className="text-sm font-semibold text-white">{settings?.resort_phone || '+1 (555) 123-4567'}</span>
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-widest block">EMAIL ASSISTANCE</span>
                  <span className="text-sm font-semibold text-white">{settings?.resort_email || 'hello@resort.com'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>256-BIT ENCRYPTED RESERVATION PROCESS</span>
            </div>
          </div>
          
          <div className="lg:col-span-7">
             <BookingWidget />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6 text-center relative z-10 mt-auto">
        <p className="text-xs font-mono text-slate-600">
          &copy; {new Date().getFullYear()} {settings?.resort_name || 'AURA HAVEN'}. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}

