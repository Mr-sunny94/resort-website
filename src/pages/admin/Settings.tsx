import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortSettings } from '../../types';
import { Settings as SettingsIcon, Save } from 'lucide-react';

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
      // Create defaults if not found
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
      // Fix: Store custom fields in localStorage to bypass strict Supabase schema requirements
      const { resort_logo_url, atmosphere_media_url, atmosphere_media_type, ...dbSettings } = settings;
      
      if (resort_logo_url) localStorage.setItem('resort_logo_url', resort_logo_url);
      if (atmosphere_media_url) localStorage.setItem('atmosphere_media_url', atmosphere_media_url);
      if (atmosphere_media_type) localStorage.setItem('atmosphere_media_type', atmosphere_media_type);

      if (settings.id) {
        await supabase.from('resort_settings').update(dbSettings).eq('id', settings.id);
      } else {
        const { data } = await supabase.from('resort_settings').insert([dbSettings]).select().single();
        if (data) {
           setSettings({ ...data, resort_logo_url, atmosphere_media_url, atmosphere_media_type } as ResortSettings);
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
    return <div className="animate-pulse flex space-x-4"><div className="h-4 bg-slate-200 rounded w-1/4"></div></div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900">Resort Settings</h1>
          <p className="text-slate-500 mt-2">Manage global configurations for the property.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-200 flex items-center">
          <SettingsIcon className="w-5 h-5 mr-2" />
          Settings saved successfully!
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resort Name</label>
                <input
                  type="text"
                  name="resort_name"
                  required
                  value={settings.resort_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="resort_email"
                  required
                  value={settings.resort_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="resort_phone"
                  required
                  value={settings.resort_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  name="resort_address"
                  required
                  value={settings.resort_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resort Logo URL</label>
                <div className="flex flex-col space-y-2">
                  <input
                    type="url"
                    name="resort_logo_url"
                    value={settings.resort_logo_url || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                    <div className="w-full px-4 py-2 border border-dashed border-slate-300 text-slate-500 text-center rounded-lg hover:bg-slate-50 cursor-pointer">
                      Or click to upload from device
                    </div>
                  </div>
                </div>
              </div>
              {settings.resort_logo_url && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Logo Preview</label>
                   <div className="h-20 bg-slate-100 rounded flex items-center justify-center p-2">
                     <img src={settings.resort_logo_url} alt="Logo preview" className="max-h-full object-contain" />
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Booking Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Time</label>
                <input
                  type="time"
                  name="check_in_time"
                  required
                  value={settings.check_in_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-out Time</label>
                <input
                  type="time"
                  name="check_out_time"
                  required
                  value={settings.check_out_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Stay (Nights)</label>
                <input
                  type="number"
                  name="min_stay_nights"
                  min="1"
                  required
                  value={settings.min_stay_nights}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Guests Per Booking</label>
                <input
                  type="number"
                  name="max_guests_per_booking"
                  min="1"
                  required
                  value={settings.max_guests_per_booking}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Atmosphere Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Media Type</label>
                <select
                  name="atmosphere_media_type"
                  value={settings.atmosphere_media_type || 'image'}
                  onChange={(e) => setSettings({ ...settings, atmosphere_media_type: e.target.value as 'image' | 'video' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Media URL</label>
                <div className="flex flex-col space-y-2">
                  <input
                    type="url"
                    name="atmosphere_media_url"
                    value={settings.atmosphere_media_url || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    placeholder="https://example.com/media.jpg"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept={settings.atmosphere_media_type === 'video' ? 'video/*' : 'image/*'}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        try {
                          // Note: Need to add a small uploading state, but we can just use the global saving state for now to keep it simple, or create a specific one. Let's alert if error.
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
                    <div className="w-full px-4 py-2 border border-dashed border-slate-300 text-slate-500 text-center rounded-lg hover:bg-slate-50 cursor-pointer">
                      Or click to upload from device
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
