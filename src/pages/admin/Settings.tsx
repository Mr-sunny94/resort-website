import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortSettings } from '../../types';
import { Settings as SettingsIcon, Save, Sparkles, CheckCircle2, Upload, Building, Palette, Calendar, Film } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<ResortSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('resort_settings').select('*').limit(1).single();
    let currentSettings: any = null;
    
    if (data) {
      currentSettings = data;
    } else {
      currentSettings = {
        resort_name: 'The Azure Resort',
        resort_email: 'hello@azureresort.com',
        resort_phone: '+1 (555) 123-4567',
        resort_address: '123 Ocean Drive, Coastal City',
        check_in_time: '15:00',
        check_out_time: '11:00',
        min_stay_nights: 1,
        max_guests_per_booking: 4,
        atmosphere_media_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200',
        atmosphere_media_type: 'image',
      };
    }
    
    if (currentSettings) {
      currentSettings.resort_logo_url = localStorage.getItem('resort_logo_url') || currentSettings.resort_logo_url;
      currentSettings.atmosphere_media_url = localStorage.getItem('atmosphere_media_url') || currentSettings.atmosphere_media_url;
      currentSettings.atmosphere_media_type = localStorage.getItem('atmosphere_media_type') || currentSettings.atmosphere_media_type || 'image';
      currentSettings.map_embed_url = localStorage.getItem('map_embed_url') || currentSettings.map_embed_url || '';
      setSettings(currentSettings as ResortSettings);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccess(false);

    try {
      const { resort_logo_url, atmosphere_media_url, atmosphere_media_type, map_embed_url, ...dbSettings } = settings;
      
      if (resort_logo_url) localStorage.setItem('resort_logo_url', resort_logo_url);
      if (atmosphere_media_url) localStorage.setItem('atmosphere_media_url', atmosphere_media_url);
      if (atmosphere_media_type) localStorage.setItem('atmosphere_media_type', atmosphere_media_type);
      if (map_embed_url !== undefined) localStorage.setItem('map_embed_url', map_embed_url);

      if (settings.id) {
        await supabase.from('resort_settings').update(dbSettings).eq('id', settings.id);
      } else {
        const { data } = await supabase.from('resort_settings').insert([dbSettings]).select().single();
        if (data) {
           setSettings({ ...data, resort_logo_url, atmosphere_media_url, atmosphere_media_type, map_embed_url } as ResortSettings);
        }
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  if (loading || !settings) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading resort configurations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* HEADER BAR */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-300">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2 transition-colors duration-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">SYSTEM CONFIGURATION</span>
        </div>
        <h1 className="text-3xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">Resort Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-light mt-1">Global settings, brand identity, check-in rules, and showcase media</p>
      </div>

      {success && (
        <div className="glass-card bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl text-xs font-mono flex items-center shadow-lg transition-colors duration-300">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
          Resort configuration saved successfully!
        </div>
      )}

      <div className="glass-card bg-white/60 dark:bg-transparent rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: PROPERTY DETAILS */}
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 transition-colors duration-300">
              <Building className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-syne font-bold text-slate-900 dark:text-white uppercase tracking-wider">Property Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Resort Name</label>
                <input
                  type="text"
                  name="resort_name"
                  required
                  value={settings.resort_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Contact Email</label>
                <input
                  type="email"
                  name="resort_email"
                  required
                  value={settings.resort_email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  name="resort_phone"
                  required
                  value={settings.resort_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Google Maps Embed URL (iframe src)</label>
                <input
                  type="url"
                  name="map_embed_url"
                  value={settings.map_embed_url || ''}
                  onChange={handleChange}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BRANDING */}
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 transition-colors duration-300">
              <Palette className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-syne font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resort Branding</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Resort Logo URL</label>
                <div className="space-y-3">
                  <input
                    type="url"
                    name="resort_logo_url"
                    value={settings.resort_logo_url || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-xs font-mono outline-none transition-all"
                    placeholder="https://example.com/logo.png"
                  />
                  <label className="block cursor-pointer">
                    <div className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 hover:border-cyan-500 rounded-xl p-3 text-center transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `logo-${Math.random()}.${fileExt}`;
                            
                            const { error: uploadError } = await supabase.storage
                              .from('gallery')
                              .upload(fileName, file);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                              .from('gallery')
                              .getPublicUrl(fileName);

                            setSettings({ ...settings, resort_logo_url: publicUrl });
                          } catch (error: any) {
                            alert('Error uploading file: ' + error.message);
                          }
                        }}
                      />
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-300 flex items-center justify-center space-x-1.5">
                        <Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Or click to upload logo from device</span>
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {settings.resort_logo_url && (
                <div>
                   <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Logo Preview</label>
                   <div className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
                     <img src={settings.resort_logo_url} alt="Logo preview" className="max-h-full object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]" />
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: BOOKING RULES */}
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 transition-colors duration-300">
              <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-syne font-bold text-slate-900 dark:text-white uppercase tracking-wider">Booking Constraints</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Check-in Time</label>
                <input
                  type="time"
                  name="check_in_time"
                  required
                  value={settings.check_in_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Check-out Time</label>
                <input
                  type="time"
                  name="check_out_time"
                  required
                  value={settings.check_out_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Minimum Stay (Nights)</label>
                <input
                  type="number"
                  name="min_stay_nights"
                  min="1"
                  required
                  value={settings.min_stay_nights}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Max Guests Per Booking</label>
                <input
                  type="number"
                  name="max_guests_per_booking"
                  min="1"
                  required
                  value={settings.max_guests_per_booking}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: ATMOSPHERE MEDIA */}
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 transition-colors duration-300">
              <Film className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-syne font-bold text-slate-900 dark:text-white uppercase tracking-wider">Atmosphere Media Showcase</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Media Type</label>
                <select
                  name="atmosphere_media_type"
                  value={settings.atmosphere_media_type || 'image'}
                  onChange={(e) => setSettings({ ...settings, atmosphere_media_type: e.target.value as 'image' | 'video' })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                >
                  <option value="image">IMAGE PHOTO</option>
                  <option value="video">LOOPING VIDEO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Media URL</label>
                <div className="space-y-3">
                  <input
                    type="url"
                    name="atmosphere_media_url"
                    value={settings.atmosphere_media_url || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-xs font-mono outline-none transition-all"
                    placeholder="https://example.com/video.mp4"
                  />
                  <label className="block cursor-pointer">
                    <div className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 hover:border-cyan-500 rounded-xl p-3 text-center transition-all">
                      <input
                        type="file"
                        accept={settings.atmosphere_media_type === 'video' ? 'video/*' : 'image/*'}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `atmosphere-${Math.random()}.${fileExt}`;
                            
                            const { error: uploadError } = await supabase.storage
                              .from('gallery')
                              .upload(fileName, file);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                              .from('gallery')
                              .getPublicUrl(fileName);

                            setSettings({ ...settings, atmosphere_media_url: publicUrl });
                          } catch (error: any) {
                            alert('Error uploading file: ' + error.message);
                          }
                        }}
                      />
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-300 flex items-center justify-center space-x-1.5">
                        <Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Or click to upload showcase media</span>
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 font-bold text-xs font-mono uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{saving ? 'SAVING CONFIGURATION...' : 'SAVE ALL SETTINGS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

