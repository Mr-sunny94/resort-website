import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortGallery } from '../../types';
import { Plus, Edit2, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900">Gallery</h1>
          <p className="text-slate-500 mt-2">Manage the images displayed in the public gallery.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Image</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading gallery...</div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No images found</h3>
            <p className="text-slate-500">Add some images to showcase your resort.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium">Caption</th>
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {images.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-24 h-16 rounded-md overflow-hidden bg-slate-100">
                        <img src={item.image_url} alt={item.caption || 'Gallery Image'} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.caption || <span className="text-slate-400 italic">No caption</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.display_order}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium",
                        item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {item.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{item.is_active ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif text-slate-900">
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image Source</label>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
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
                              
                              const { error: uploadError, data } = await supabase.storage
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
                              alert('Error uploading image: ' + error.message + '\n\nPlease ensure you have created a public bucket named "gallery" in your Supabase project.');
                            } finally {
                              setUploading(false);
                            }
                          }}
                          disabled={uploading}
                        />
                        <span className="text-sm text-slate-600 font-medium">
                          {uploading ? 'Uploading...' : 'Click to upload from device'}
                        </span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                      <span className="bg-white px-6 text-slate-900">Or use URL</span>
                    </div>
                  </div>

                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                    disabled={uploading}
                  />

                  {formData.image_url && (
                    <div className="mt-4 w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Caption (Optional)</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  placeholder="e.g., Sunset over the ocean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                <input
                  type="number"
                  required
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                    Image is active (visible in gallery)
                  </label>
                </div>
              </div>

              <div className="pt-6 flex space-x-3 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  Save Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
