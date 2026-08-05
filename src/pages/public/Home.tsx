import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortSettings, FeaturedAmenity } from '../../types';
import { Anchor, Waves, Sparkles, MapPin, Phone, Mail, ChevronLeft, ChevronRight, X, Calendar, Compass, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function Home() {
  const [settings, setSettings] = useState<ResortSettings | null>(null);
  const [amenities, setAmenities] = useState<FeaturedAmenity[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [galleryPage, setGalleryPage] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const galleryItemsPerPage = 4;
  const galleryTotalPages = Math.ceil(gallery.length / galleryItemsPerPage);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadPublicData() {
      const [settingsRes, amenitiesRes, galleryRes] = await Promise.all([
        supabase.from('resort_settings').select('*').limit(1).single(),
        supabase.from('featured_amenities').select('*').eq('is_featured', true).eq('is_active', true),
        supabase.from('resort_gallery').select('*').eq('is_active', true).order('display_order', { ascending: true })
      ]);
      
      if (settingsRes.data) {
        let loadedSettings: any = { ...settingsRes.data };
        const localLogo = localStorage.getItem('resort_logo_url');
        const localAtmosphere = localStorage.getItem('atmosphere_media_url');
        const localAtmosphereType = localStorage.getItem('atmosphere_media_type');
        
        if (localLogo) loadedSettings.resort_logo_url = localLogo;
        if (localAtmosphere) loadedSettings.atmosphere_media_url = localAtmosphere;
        if (localAtmosphereType) loadedSettings.atmosphere_media_type = localAtmosphereType;
        
        setSettings(loadedSettings as ResortSettings);
      }
      
      if (amenitiesRes.data) setAmenities(amenitiesRes.data as FeaturedAmenity[]);
      if (galleryRes.data) setGallery(galleryRes.data);
    }
    loadPublicData();
  }, []);

  const heroImage = "/hero-bg.jpg";
  const aboutImage = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200";

  const filteredAmenities = activeTab === 'all' 
    ? amenities 
    : amenities.filter(a => a.category?.toLowerCase() === activeTab.toLowerCase());

  const categories = ['all', ...Array.from(new Set(amenities.map(a => a.category).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden transition-colors duration-300">
      
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse-glow" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-600/5 dark:bg-sky-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* STICKY GLASS NAVIGATION BAR */}
      <header className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b",
        scrolled 
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200/80 dark:border-slate-800/80 py-4 shadow-2xl shadow-cyan-950/5 dark:shadow-cyan-950/20" 
          : "bg-transparent border-transparent py-6"
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            {settings?.resort_logo_url ? (
              <img src={settings.resort_logo_url} alt={settings.resort_name} className="h-10 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)] dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-transform group-hover:scale-105" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:rotate-6 transition-transform">
                <Anchor className="w-5 h-5 text-slate-950" />
              </div>
            )}
            <div>
              <span className={cn("text-xl font-syne font-bold tracking-wider uppercase block", scrolled ? "text-slate-900 dark:text-white" : "text-white")}>
                {settings?.resort_name || 'AURA HAVEN'}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-cyan-500 dark:text-cyan-400 uppercase flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping inline-block" />
                <span>SANCTUARY & RESORT</span>
              </span>
            </div>
          </Link>

          <nav className={cn("hidden md:flex items-center space-x-1 p-1.5 rounded-full border backdrop-blur-md transition-colors", scrolled ? "bg-slate-100/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80" : "bg-slate-900/60 border-slate-800/80")}>
            <a href="#about" className={cn("px-5 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all", scrolled ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60" : "text-slate-300 hover:text-white hover:bg-slate-800/60")}>
              Atmosphere
            </a>
            {gallery.length > 0 && (
              <a href="#gallery" className={cn("px-5 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all", scrolled ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60" : "text-slate-300 hover:text-white hover:bg-slate-800/60")}>
                Gallery
              </a>
            )}
            <a href="#amenities" className={cn("px-5 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all", scrolled ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60" : "text-slate-300 hover:text-white hover:bg-slate-800/60")}>
              Amenities
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link 
              to="/reserve" 
              className="relative hidden sm:inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-slate-950 font-semibold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all group overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Book Stay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              to="/admin/login" 
              className={cn("text-xs font-mono tracking-wider transition-colors px-3 py-2 rounded-lg border border-transparent", scrolled ? "text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-slate-200 dark:hover:border-slate-800" : "text-slate-400 hover:text-cyan-400 hover:border-slate-800")}
            >
              ADMIN
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full flex items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
        {/* Adjusted Background Image and Gradient Overlay for Text Clarity without Box */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img src={heroImage} alt="Luxury Resort" className="w-full h-full object-cover opacity-70 scale-100 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/45 to-slate-50 dark:from-slate-950/70 dark:via-slate-950/45 dark:to-slate-950 transition-colors duration-300" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/30 to-slate-900/70 dark:via-slate-950/30 dark:to-slate-950/70 pointer-events-none transition-colors duration-300" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center mt-8">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-950/80 border border-cyan-400/40 backdrop-blur-xl mb-6 shadow-xl shadow-cyan-900/20 dark:shadow-cyan-950/50">
            <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300 uppercase tracking-widest font-semibold">
              NEXT-GEN COASTAL ESCAPE &bull; RECEPTION OPEN 24/7
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-syne font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-none drop-shadow-[0_10px_25px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] transition-colors duration-300">
            FIND YOUR <br />
            <span className="text-gradient-cyan italic font-serif">FUTURE SERENITY</span>
          </h1>

          <p className="text-slate-800 dark:text-slate-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-normal drop-shadow-[0_4px_12px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] transition-colors duration-300">
            Unwind in ultra-modern architectural villas suspended over turquoise ocean waters. Custom private dining, immersive wellness, and seamless digital booking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/reserve" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 font-bold text-sm uppercase tracking-widest hover:brightness-110 shadow-2xl shadow-cyan-500/40 transition-all flex items-center justify-center space-x-3 group"
            >
              <Calendar className="w-4 h-4" />
              <span>RESERVE SUITE NOW</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#about" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-slate-800 dark:text-white font-medium text-sm uppercase tracking-widest hover:bg-slate-200/50 dark:hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
            >
              <Compass className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span>EXPLORE RESORT</span>
            </a>
          </div>

          {/* QUICK HIGHLIGHT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 pt-8 border-t border-slate-300/50 dark:border-white/10">
            <div className="glass-card p-4 rounded-2xl text-left bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">Location</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{settings?.resort_address || 'Paradise Ocean Cove'}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-left bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">Rating</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                <span>4.98 / 5.0</span>
                <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
              </p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-left bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">Suites</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Private Ocean Villas</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-left bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">Security</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" />
                <span>Verified Resort</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ATMOSPHERE SECTION */}
      <section id="about" className="py-28 px-6 relative z-10 border-t border-slate-200 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">ATMOSPHERE & ESSENCE</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-syne font-bold text-slate-900 dark:text-white leading-tight">
              A sanctuary crafted at the intersection of <span className="text-gradient-cyan">luxury and nature</span>.
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed font-light">
              Step into a realm crafted for high-end tranquility. Our oceanfront sanctuary pairs sleek minimal architecture with pristine natural surroundings, offering unmatched privacy, fine dining, and bespoke concierge services.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="glass-card p-5 rounded-2xl border-none">
                <div className="text-3xl font-syne font-bold text-cyan-600 dark:text-cyan-400 mb-1">100%</div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Private Ocean Views</div>
              </div>
              <div className="glass-card p-5 rounded-2xl border-none">
                <div className="text-3xl font-syne font-bold text-sky-600 dark:text-sky-400 mb-1">24/7</div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Butler & Concierge</div>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href="#amenities" 
                className="inline-flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-mono text-xs uppercase tracking-widest hover:text-cyan-700 dark:hover:text-cyan-300 group"
              >
                <span>EXPLORE ALL AMENITIES</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden glass-card p-2 shadow-2xl group">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                {settings?.atmosphere_media_type === 'video' && settings?.atmosphere_media_url ? (
                  <video 
                    src={settings.atmosphere_media_url} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <img 
                    src={settings?.atmosphere_media_url || aboutImage} 
                    alt="Luxury Resort Suite" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">SANCTUARY SUITE</span>
                    <span className="text-sm font-semibold">Infinity Pool & Sunset Terrace</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 text-[10px] font-mono text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                    LIVE VIEW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-28 px-6 relative z-10 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-slate-900 border border-slate-300/50 dark:border-slate-800 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">VISUAL IMMERSION</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-syne font-bold text-slate-900 dark:text-white">Resort Gallery</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md font-light">
                Discover the architectural elegance, secluded beaches, and fine dining spaces that define our sanctuary.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {gallery.slice(galleryPage * galleryItemsPerPage, (galleryPage + 1) * galleryItemsPerPage).map((image, idx) => (
                <div 
                  key={image.id} 
                  className="relative group overflow-hidden rounded-3xl glass-card aspect-[4/3] cursor-pointer"
                  onClick={() => setLightboxImage(image.image_url)}
                >
                  <img 
                    src={image.image_url} 
                    alt={image.caption || `Gallery item ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  <div className="absolute bottom-0 inset-x-0 p-6 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block mb-1">
                        VIEW PHOTO #0{galleryPage * galleryItemsPerPage + idx + 1}
                      </span>
                      <p className="text-white text-base font-semibold drop-shadow-md">
                        {image.caption || 'Resort Vista'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-slate-950/80 backdrop-blur-md border border-white/40 dark:border-slate-700 flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {galleryTotalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-6">
                <button 
                  onClick={() => setGalleryPage(prev => Math.max(0, prev - 1))}
                  disabled={galleryPage === 0}
                  className="p-3 rounded-2xl glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                  aria-label="Previous images"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex space-x-3">
                  {Array.from({ length: galleryTotalPages }).map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setGalleryPage(i)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        i === galleryPage ? "bg-cyan-500 dark:bg-cyan-400 w-8 shadow-md shadow-cyan-500/50" : "bg-slate-300 dark:bg-slate-800 w-2 hover:bg-slate-400 dark:hover:bg-slate-700"
                      )}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setGalleryPage(prev => Math.min(galleryTotalPages - 1, prev + 1))}
                  disabled={galleryPage === galleryTotalPages - 1}
                  className="p-3 rounded-2xl glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                  aria-label="Next images"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* AMENITIES SECTION */}
      <section id="amenities" className="py-28 px-6 relative z-10 border-t border-slate-200 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">BESPOKE SERVICES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-syne font-bold text-slate-900 dark:text-white mb-6">Curated Resort Amenities</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base font-light">
              Elevate your stay with signature dining experiences, private spa treatments, and high-speed ocean adventures.
            </p>

            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all",
                      activeTab === cat
                        ? "bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-lg shadow-cyan-500/25"
                        : "bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredAmenities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAmenities.map(amenity => (
                <div key={amenity.id} className="glass-card p-8 rounded-3xl hover:border-cyan-500/40 transition-all group relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono uppercase tracking-widest">
                        {amenity.category || 'EXCLUSIVES'}
                      </span>
                      {amenity.price ? (
                        <span className="text-lg font-syne font-bold text-cyan-600 dark:text-cyan-400">${amenity.price}</span>
                      ) : (
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">INCLUDED</span>
                      )}
                    </div>
                    <h3 className="text-xl font-syne font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {amenity.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-light">
                      {amenity.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span>STATUS: AVAILABLE</span>
                    <Link to="/reserve" className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1">
                      <span>BOOK</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-3xl max-w-md mx-auto">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-mono uppercase tracking-widest">No amenities in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Anchor className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <span className="text-lg font-syne font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
                {settings?.resort_name || 'AURA HAVEN'}
              </span>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                {settings?.resort_address || '123 Ocean Cove Drive'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
            <a href="#about" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Atmosphere</a>
            <a href="#amenities" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Amenities</a>
            <Link to="/reserve" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Reservations</Link>
            <Link to="/admin/login" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Admin Portal</Link>
          </div>

          <p className="text-xs font-mono text-slate-500 dark:text-slate-600">
            &copy; {new Date().getFullYear()} {settings?.resort_name || 'AURA HAVEN'}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 dark:bg-slate-950/95 p-4 md:p-8 backdrop-blur-xl transition-all" 
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full transition-colors z-10"
            onClick={() => setLightboxImage(null)}
            aria-label="Close image"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-cyan-900/20 dark:shadow-cyan-950/40"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}

