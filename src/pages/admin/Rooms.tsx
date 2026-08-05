import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ResortRoom } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Sparkles, BedDouble, Users, Eye } from 'lucide-react';
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this suite? This action cannot be undone.')) {
      const { error } = await supabase.from('resort_rooms').delete().eq('id', id);
      if (error) {
        console.error('Delete error:', error);
        alert(`Failed to delete: ${error.message || 'Unknown error'}. (This may happen if the room is linked to existing reservations).`);
      }
      fetchRooms();
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors duration-300">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2 transition-colors duration-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-300">VILLA ACCOMMODATIONS</span>
          </div>
          <h1 className="text-3xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">Resort Rooms & Suites</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-light mt-1">Configure available rooms, guest capacities, and view types</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 font-bold text-xs font-mono uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ADD NEW SUITE</span>
        </button>
      </div>

      {/* ROOMS TABLE CARD */}
      <div className="glass-card bg-white/60 dark:bg-transparent rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl transition-colors duration-300">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading resort suites...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-base font-syne font-bold text-slate-900 dark:text-white mb-1">No rooms found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">Get started by adding your first resort room.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px] text-xs font-mono">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors duration-300">
                  <th className="px-6 py-4 font-semibold">Suite Title</th>
                  <th className="px-6 py-4 font-semibold">Max Capacity</th>
                  <th className="px-6 py-4 font-semibold">View Type</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors duration-300">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                        <BedDouble className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>{room.room_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>Up to {room.capacity} Guests</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center space-x-1.5">
                        <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>{room.view_type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-colors duration-300",
                        room.is_active ? "bg-emerald-100/80 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800" : "bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                      )}>
                        {room.is_active ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{room.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(room)}
                          className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
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
          <div className="glass-card bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-900/60 transition-colors duration-300">
              <h2 className="text-lg font-syne font-bold text-slate-900 dark:text-white">
                {editingRoom ? 'Edit Room Specification' : 'Add New Room'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Room / Suite Name</label>
                <input
                  type="text"
                  required
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                  placeholder="e.g. Oceanfront Master Villa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">View Type</label>
                  <input
                    type="text"
                    required
                    value={formData.view_type}
                    onChange={(e) => setFormData({ ...formData, view_type: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    placeholder="e.g. Panoramic Sea View"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="is_active" className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  Room is active for guest booking
                </label>
              </div>
              <div className="pt-6 flex space-x-3">
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
                  Save Suite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

