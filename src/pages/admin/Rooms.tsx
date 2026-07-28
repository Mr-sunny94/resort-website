import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortRoom } from '../../types';
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Rooms() {
  const [rooms, setRooms] = useState<ResortRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ResortRoom | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    room_name: '',
    capacity: 2,
    view_type: 'Ocean View',
    is_active: true,
  });

  const fetchRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('resort_rooms').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setRooms(data as ResortRoom[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenModal = (room?: ResortRoom) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        room_name: room.room_name,
        capacity: room.capacity,
        view_type: room.view_type,
        is_active: room.is_active,
      });
    } else {
      setEditingRoom(null);
      setFormData({ room_name: '', capacity: 2, view_type: 'Ocean View', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      await supabase.from('resort_rooms').update(formData).eq('id', editingRoom.id);
    } else {
      await supabase.from('resort_rooms').insert([formData]);
    }
    setIsModalOpen(false);
    fetchRooms();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900">Resort Rooms</h1>
          <p className="text-slate-500 mt-2">Manage your property's suites and rooms.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Room</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No rooms found</h3>
            <p className="text-slate-500">Get started by adding your first resort room.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Room Name</th>
                  <th className="px-6 py-4 font-medium">Capacity</th>
                  <th className="px-6 py-4 font-medium">View Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{room.room_name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{room.capacity} Guests</td>
                    <td className="px-6 py-4 text-slate-600">{room.view_type}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium",
                        room.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {room.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{room.is_active ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(room)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-serif text-slate-900">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  placeholder="e.g., Oceanfront Master Suite"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">View Type</label>
                  <input
                    type="text"
                    required
                    value={formData.view_type}
                    onChange={(e) => setFormData({ ...formData, view_type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                    placeholder="e.g., Garden View"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                  Room is active and available for booking
                </label>
              </div>
              <div className="pt-6 flex space-x-3">
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
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
