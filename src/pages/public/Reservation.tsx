import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortSettings } from '../../types';
import BookingWidget from '../../components/BookingWidget';
import { Anchor, Phone, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 text-slate-900 bg-white backdrop-blur-sm shadow-sm">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            {settings?.resort_logo_url ? (
              <img src={settings.resort_logo_url} alt={settings.resort_name} className="h-10 w-auto object-contain mix-blend-multiply" />
            ) : (
              <Anchor className="w-6 h-6" />
            )}
            <span className="text-xl font-serif tracking-widest uppercase ml-2">{settings?.resort_name || 'The Resort'}</span>
          </Link>
        </div>
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-widest font-medium">
          <Link to="/" className="hover:text-stone-500 transition-colors">Home</Link>
        </div>
      </nav>

      {/* RESERVATION SECTION */}
      <section className="flex-grow py-32 px-6 bg-slate-900 relative overflow-hidden flex items-center">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16 relative z-10 w-full pt-12">
          <div className="lg:col-span-2 text-white">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
              Begin your <br/>journey.
            </h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">
              Reserve your suite today and secure your place in our coastal sanctuary. Our concierge will be in touch to finalize your personalized itinerary.
            </p>
            <div className="space-y-6 text-sm tracking-wider uppercase">
              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 border border-slate-700 rounded-full flex items-center justify-center">
                   <Phone className="w-4 h-4" />
                 </div>
                 <span>{settings?.resort_phone || '+1 (555) 123-4567'}</span>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 border border-slate-700 rounded-full flex items-center justify-center">
                   <Mail className="w-4 h-4" />
                 </div>
                 <span className="lowercase">{settings?.resort_email || 'hello@resort.com'}</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
             <BookingWidget />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-100 py-16 px-6 text-center text-slate-500 mt-auto">
        <div className="flex items-center justify-center space-x-2 mb-6 text-slate-900">
          <Anchor className="w-5 h-5" />
          <span className="text-lg font-serif tracking-widest uppercase">{settings?.resort_name || 'The Resort'}</span>
        </div>
        <p className="mb-8">{settings?.resort_address || '123 Ocean Drive, Coastal City'}</p>
        <p className="text-sm">&copy; {new Date().getFullYear()} {settings?.resort_name || 'The Resort'}. All rights reserved.</p>
      </footer>
    </div>
  );
}
