import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortGallery } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Gallery() {
  const [images, setImages] = useState<ResortGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ResortGallery | null>(null);

  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
    display_order: 0,
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resort_gallery')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (!error && data) {
      setImages(data as ResortGallery[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleOpenModal = (image?: ResortGallery) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        image_url: image.image_url,
        caption: image.caption || '',
        display_order: image.display_order,
        is_active: image.is_active,
      });
    } else {
      setEditingImage(null);
      setFormData({ image_url: '', caption: '', display_order: images.length, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingImage) {
      await supabase.from('resort_gallery').update(formData).eq('id', editingImage.id);
    } else {
      await supabase.from('resort_gallery').insert([formData]);
    }
    setIsModalOpen(false);
    fetchImages();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      const { error } = await supabase.from('resort_gallery').delete().eq('id', id);
      if (error) {
        console.error('Delete error:', error);
        alert(`Failed to delete: ${error.message || 'Unknown error'}`);
      }
      fetchImages();
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-300">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2 transition-colors duration-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">MEDIA ASSETS</span>
          </div>
          <h1 className="text-3xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">Resort Gallery Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-light mt-1">Organize showcase photography and visual assets</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 font-bold text-xs font-mono uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ADD GALLERY PHOTO</span>
        </button>
      </div>

      {/* GALLERY TABLE CARD */}
      <div className="glass-card bg-white/60 dark:bg-transparent rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl transition-colors duration-300">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Fetching gallery items...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-syne font-bold text-slate-900 dark:text-white mb-1">No images found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">Add images to showcase your resort.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px] text-xs font-mono">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors duration-300">
                  <th className="px-6 py-4 font-semibold">Preview</th>
                  <th className="px-6 py-4 font-semibold">Caption</th>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {images.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors duration-300">
                    <td className="px-6 py-4">
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                        <img src={item.image_url} alt={item.caption || 'Gallery Image'} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-semibold">
                      {item.caption || <span className="text-slate-400 dark:text-slate-600 italic">No caption</span>}
                    </td>
                    <td className="px-6 py-4 text-cyan-600 dark:text-cyan-400 font-bold">#{item.display_order}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-colors duration-300",
                        item.is_active ? "bg-emerald-100/80 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                      )}>
                        {item.is_active ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{item.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-300">
          <div className="glass-card bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-900/60 shrink-0 transition-colors duration-300">
              <h2 className="text-lg font-syne font-bold text-slate-900 dark:text-white">
                {editingImage ? 'Edit Gallery Photo' : 'Add New Photo'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Image Source</label>
                
                <div className="space-y-4">
                  <label className="block cursor-pointer">
                    <div className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 hover:border-cyan-500 rounded-2xl p-4 text-center transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            setUploading(true);
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Math.random()}.${fileExt}`;
                            const filePath = `${fileName}`;
                            
                            const { error: uploadError } = await supabase.storage
                              .from('gallery')
                              .upload(filePath, file);

                            if (uploadError) {
                              throw uploadError;
                            }

                            const { data: { publicUrl } } = supabase.storage
                              .from('gallery')
                              .getPublicUrl(filePath);

                            setFormData({ ...formData, image_url: publicUrl });
                          } catch (error: any) {
                            alert('Error uploading image: ' + error.message);
                          } finally {
                            setUploading(false);
                          }
                        }}
                        disabled={uploading}
                      />
                      <Upload className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mx-auto mb-1" />
                      <span className="text-xs text-slate-500 dark:text-slate-300 font-mono">
                        {uploading ? 'UPLOADING...' : 'Click to upload from device'}
                      </span>
                    </div>
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                      <span className="bg-white dark:bg-slate-950 px-4 text-slate-400 dark:text-slate-500">OR DIRECT URL</span>
                    </div>
                  </div>

                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-xs font-mono outline-none transition-all"
                    placeholder="https://images.unsplash.com/photo-..."
                    disabled={uploading}
                  />

                  {formData.image_url && (
                    <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Caption (Optional)</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                  placeholder="e.g. Infinity Pool at Dusk"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Display Order</label>
                <input
                  type="number"
                  required
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="is_active" className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    Visible in public gallery
                  </label>
                </div>
              </div>

              <div className="pt-6 flex space-x-3 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-mono text-xs uppercase tracking-wider hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

