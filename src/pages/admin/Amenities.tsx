import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FeaturedAmenity } from '../../types';
import { Plus, Edit2, CheckCircle2, XCircle, Star, StarOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Amenities() {
  const [amenities, setAmenities] = useState<FeaturedAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<FeaturedAmenity | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '' as string | number,
    category: 'Wellness',
    is_featured: false,
    is_active: true,
  });

  const fetchAmenities = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('featured_amenities').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setAmenities(data as FeaturedAmenity[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleOpenModal = (amenity?: FeaturedAmenity) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setFormData({
        name: amenity.name,
        description: amenity.description,
        price: amenity.price ?? '',
        category: amenity.category,
        is_featured: amenity.is_featured,
        is_active: amenity.is_active,
      });
    } else {
      setEditingAmenity(null);
      setFormData({ name: '', description: '', price: '', category: 'Wellness', is_featured: false, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      price: formData.price === '' ? null : Number(formData.price)
    };

    if (editingAmenity) {
      await supabase.from('featured_amenities').update(dataToSave).eq('id', editingAmenity.id);
    } else {
      await supabase.from('featured_amenities').insert([dataToSave]);
    }
    setIsModalOpen(false);
    fetchAmenities();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900">Featured Amenities</h1>
          <p className="text-slate-500 mt-2">Manage the services and amenities shown on your website.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Amenity</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading amenities...</div>
        ) : amenities.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No amenities found</h3>
            <p className="text-slate-500">Add some amenities to showcase to your guests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Amenity</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Featured</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {amenities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-sm text-slate-500 truncate max-w-[250px]">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.category}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.price ? `$${item.price}` : 'Complimentary'}
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                        "inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium",
                        item.is_featured ? "bg-amber-50 text-amber-700 border border-amber-200/50" : "text-slate-400"
                      )}>
                        {item.is_featured ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                        <span>{item.is_featured ? 'Featured' : '-'}</span>
                      </span>
                    </td>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif text-slate-900">
                {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amenity Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  placeholder="e.g., Infinity Pool"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all resize-none"
                  placeholder="Describe the amenity..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                    placeholder="e.g., Wellness"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                    placeholder="Leave blank if free"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-slate-700">
                    Feature on public website
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                    Amenity is active
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
                  Save Amenity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
