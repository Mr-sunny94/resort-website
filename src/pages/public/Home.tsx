import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortSettings, FeaturedAmenity } from '../../types';
import BookingWidget from '../../components/BookingWidget';
import { Anchor, Waves, MapPin, Phone, Mail, Image, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function Home() {
  const [settings, setSettings] = useState<ResortSettings | null>(null);
  const [amenities, setAmenities] = useState<FeaturedAmenity[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [galleryPage, setGalleryPage] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const galleryItemsPerPage = 4;
  const galleryTotalPages = Math.ceil(gallery.length / galleryItemsPerPage);

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

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-slate-900 selection:text-white">
      {/* NAVBAR */}
      <nav className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 text-slate-900 bg-white backdrop-blur-sm shadow-sm">
        <div className="flex items-center space-x-2">
          {settings?.resort_logo_url ? (
            <img src={settings.resort_logo_url} alt={settings.resort_name} className="h-10 w-auto object-contain mix-blend-multiply" />
          ) : (
            <Anchor className="w-6 h-6" />
          )}
          <span className="text-xl font-serif tracking-widest uppercase ml-2">{settings?.resort_name || 'The Resort'}</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-widest font-medium">
          <a href="#about" className="hover:text-stone-500 transition-colors">Atmosphere</a>
          {gallery.length > 0 && (
            <a href="#gallery" className="hover:text-stone-500 transition-colors">Gallery</a>
          )}
          <a href="#amenities" className="hover:text-stone-500 transition-colors">Amenities</a>
          <Link to="/reserve" className="hover:text-stone-500 transition-colors">Reserve</Link>
        </div>
        <div>
          <Link to="/admin/login" className="text-sm font-medium uppercase tracking-wider hover:text-stone-500 transition-colors">
            Admin
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[90vh] md:h-screen w-full flex items-center justify-center pt-20">
        <div className="absolute inset-0 w-full h-full">
          <img src={heroImage} alt="Luxury Resort Pool" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/30 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-transparent opacity-90"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto -mt-20">
          <span className="text-white/90 uppercase tracking-[0.3em] text-sm md:text-base font-medium block mb-6 drop-shadow-md">
            Welcome to Paradise
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight drop-shadow-lg">
            Find Your <br />
            <span className="italic font-light">Tranquility</span>
          </h1>
          <Link to="/reserve" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-none font-medium uppercase tracking-widest text-sm hover:bg-stone-100 transition-colors shadow-xl">
            Book Your Stay
          </Link>
        </div>
      </section>

      {/* ABOUT / ATMOSPHERE SECTION */}
      <section id="about" className="py-24 md:py-32 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <Waves className="w-6 h-6 text-slate-400" />
              <span className="uppercase tracking-widest text-sm text-slate-500 font-medium">The Atmosphere</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6 leading-tight">
              A sanctuary defined by <br/> oceanic beauty.
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Immerse yourself in a world where luxury meets natural wonder. Our resort offers an unparalleled escape, featuring pristine beaches, world-class dining, and suites designed to blend seamlessly with the coastal horizon.
            </p>
            <a href="#amenities" className="text-slate-900 uppercase tracking-widest text-sm font-medium border-b border-slate-900 pb-1 hover:text-slate-600 hover:border-slate-600 transition-all">
              Discover Amenities
            </a>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] md:aspect-square overflow-hidden rounded-sm shadow-2xl">
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
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" 
                />
              )}
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-slate-100 -z-10 rounded-sm"></div>
          </div>
        </div>
      </section>

    {/* GALLERY SECTION */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-24 px-6 bg-stone-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="uppercase tracking-widest text-sm text-slate-500 font-medium block mb-4">Visual Journey</span>
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">Gallery</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
              {gallery.slice(galleryPage * galleryItemsPerPage, (galleryPage + 1) * galleryItemsPerPage).map((image, idx) => (
                <div 
                  key={image.id} 
                  className="relative group overflow-hidden rounded-xl bg-slate-200 aspect-[4/3] shadow-sm cursor-pointer"
                  onClick={() => setLightboxImage(image.image_url)}
                >
                  <img 
                    src={image.image_url} 
                    alt={image.caption || `Gallery image ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {image.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-6 w-full">
                        <p className="text-white text-sm font-medium drop-shadow-md">{image.caption}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {galleryTotalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-6">
                <button 
                  onClick={() => setGalleryPage(prev => Math.max(0, prev - 1))}
                  disabled={galleryPage === 0}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Previous images"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex space-x-3">
                  {Array.from({ length: galleryTotalPages }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        i === galleryPage ? "bg-slate-900 w-6" : "bg-slate-300 w-2"
                      )}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setGalleryPage(prev => Math.min(galleryTotalPages - 1, prev + 1))}
                  disabled={galleryPage === galleryTotalPages - 1}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
      <section id="amenities" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="uppercase tracking-widest text-sm text-slate-500 font-medium block mb-4">Curated Experiences</span>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">Exclusive Amenities</h2>
          </div>

          {amenities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {amenities.map(amenity => (
                <div key={amenity.id} className="group border-t border-slate-200 pt-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-serif text-slate-900 group-hover:text-slate-600 transition-colors">{amenity.name}</h3>
                    {amenity.price && <span className="text-sm font-medium text-slate-500">${amenity.price}</span>}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4">{amenity.description}</p>
                  <span className="inline-block px-3 py-1 bg-stone-100 text-slate-600 text-xs uppercase tracking-wider rounded-sm font-medium">
                    {amenity.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">More details coming soon.</p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-100 py-16 px-6 text-center text-slate-500">
        <div className="flex items-center justify-center space-x-2 mb-6 text-slate-900">
          <Anchor className="w-5 h-5" />
          <span className="text-lg font-serif tracking-widest uppercase">{settings?.resort_name || 'The Resort'}</span>
        </div>
        <p className="mb-8">{settings?.resort_address || '123 Ocean Drive, Coastal City'}</p>
        <p className="text-sm">&copy; {new Date().getFullYear()} {settings?.resort_name || 'The Resort'}. All rights reserved.</p>
      </footer>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-sm transition-opacity" 
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            onClick={() => setLightboxImage(null)}
            aria-label="Close fullscreen image"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
