/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Users, Coffee, Wind, MapPin, Tv, Shield, ArrowRight, CreditCard, Calendar, Check, AlertCircle, X } from 'lucide-react';
import { Room, Booking, User } from '../types';
import { dbService } from '../supabaseClient';

interface RoomsSectionProps {
  rooms: Room[];
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onBookingCreated: () => void;
}

export default function RoomsSection({ rooms, currentUser, onOpenAuthModal, onBookingCreated }: RoomsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Booking Form State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter categories
  const categories = ['All', 'Suite', 'Villa', 'Penthouse', 'Deluxe'];
  const filteredRooms = selectedCategory === 'All' 
    ? rooms 
    : rooms.filter(room => room.category === selectedCategory);

  const calculateNights = (inDate: string, outDate: string): number => {
    if (!inDate || !outDate) return 0;
    const start = new Date(inDate);
    const end = new Date(outDate);
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    if (!checkIn || !checkOut) {
      setFormError('Please select both Check-In and Check-Out dates.');
      return;
    }

    if (nights <= 0) {
      setFormError('Check-Out date must be after Check-In date.');
      return;
    }

    if (selectedRoom && guests > selectedRoom.max_guests) {
      setFormError(`Maximum guests allowed for this room is ${selectedRoom.max_guests}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedRoom) {
        const booking = await dbService.createBooking({
          room_id: selectedRoom.id,
          room_name: selectedRoom.name,
          check_in: checkIn,
          check_out: checkOut,
          guests: guests,
          total_price: totalPrice,
          user_email: currentUser.email || 'guest@mustet.com',
          user_phone: currentUser.phone
        });
        setBookingSuccess(booking);
        onBookingCreated();
      }
    } catch (err) {
      setFormError('Failed to record reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeBookingModal = () => {
    setSelectedRoom(null);
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
    setBookingSuccess(null);
    setFormError(null);
  };

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto" id="rooms-section">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Resort Accommodations</span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2 mb-4">Choose Your Private Sanctuary</h2>
        <p className="max-w-2xl mx-auto text-sm text-stone-300 leading-relaxed font-sans">
          Bespoke design, stunning coastal vistas, and signature hospitality combine to offer an unforgettable luxurious getaway on our secluded peninsula.
        </p>

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 text-xs font-medium tracking-wider uppercase rounded-full transition-all ${selectedCategory === cat ? 'bg-purple-600 text-white shadow-md' : 'bg-white/5 text-stone-300 hover:bg-white/10'}`}
            >
              {cat}s
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid Layout ("Little Windows") */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredRooms.map((room) => (
            <motion.div
              layout
              key={room.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-stone-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-purple-500/30 transition-all group flex flex-col h-full"
              id={`room-card-${room.id}`}
            >
              {/* Card Image Block */}
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wider uppercase rounded-full">
                  {room.category}
                </div>
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-stone-900/90 border border-white/10 text-purple-400 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                  <Star size={14} fill="currentColor" className="text-yellow-500" />
                  <span>{room.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-purple-400 transition">
                    {room.name}
                  </h3>
                </div>
                
                <p className="text-sm text-stone-300 line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {room.description}
                </p>

                {/* Key Amenities row */}
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 mb-6 py-3 border-t border-b border-white/10 text-xs text-stone-300">
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-purple-400" />
                    <span>Up to {room.max_guests} Guests</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Coffee size={14} className="text-purple-400" />
                    <span>Breakfast Included</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind size={14} className="text-purple-400" />
                    <span>AC</span>
                  </span>
                </div>

                {/* Bottom Pricing & Action */}
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-stone-400">Nightly Rate</span>
                    <span className="text-2xl font-bold text-purple-400 font-mono">
                      ${room.price}
                      <span className="text-xs text-stone-400 font-sans font-normal"> / night</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md hover:shadow-purple-600/10 transition active:scale-[0.98]"
                    id={`select-room-btn-${room.id}`}
                  >
                    Select Room
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ROOM RESERVATION DIALOGUE MODAL */}
      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl overflow-hidden bg-stone-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl my-8 text-white"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-600" />

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Side: Room details & layout */}
                <div className="bg-stone-950/40 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <button
                      onClick={closeBookingModal}
                      className="md:hidden absolute top-4 right-4 p-1.5 bg-stone-900 border border-white/10 text-stone-400 hover:text-white rounded-full shadow-sm"
                    >
                      <X size={18} />
                    </button>

                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">{selectedRoom.category} Sanctuary</span>
                    <h3 className="font-serif text-2xl font-bold text-white mt-1 mb-4">{selectedRoom.name}</h3>
                    
                    <img
                      src={selectedRoom.image_url}
                      alt={selectedRoom.name}
                      className="w-full h-44 object-cover rounded-xl shadow-inner mb-4 border border-white/10"
                    />

                    <p className="text-xs text-stone-300 leading-relaxed mb-4">
                      {selectedRoom.description}
                    </p>

                    <div className="space-y-2">
                      <span className="block text-xs uppercase tracking-wider font-semibold text-stone-400">Premium Amenities</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {selectedRoom.amenities.map(a => (
                          <span key={a} className="text-[11px] text-stone-300 flex items-center gap-1">
                            <Check size={10} className="text-purple-400 shrink-0" />
                            <span>{a}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">Nightly Rate</span>
                      <p className="font-mono text-xl font-bold text-purple-400">${selectedRoom.price}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">Guest Limit</span>
                      <p className="text-xs font-semibold text-stone-200">Max {selectedRoom.max_guests} Guests</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Interactive Booking Engine */}
                <div className="p-6 md:p-8 border-l border-white/10 relative">
                  <button
                    onClick={closeBookingModal}
                    className="hidden md:flex absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition"
                  >
                    <X size={18} />
                  </button>

                  <AnimatePresence mode="wait">
                    {!bookingSuccess ? (
                      <motion.div
                        key="booking-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-serif text-lg font-bold text-white mb-5">Configure Stay</h4>
                          
                          {formError && (
                            <div className="p-3 mb-4 text-xs font-medium text-red-400 bg-red-500/15 border border-red-500/30 rounded-lg flex items-start gap-1.5">
                              <AlertCircle size={14} className="shrink-0 mt-0.5" />
                              <span>{formError}</span>
                            </div>
                          )}

                          <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Check-In Date</label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                                <input
                                  type="date"
                                  required
                                  value={checkIn}
                                  onChange={(e) => setCheckIn(e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Check-Out Date</label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                                <input
                                  type="date"
                                  required
                                  value={checkOut}
                                  onChange={(e) => setCheckOut(e.target.value)}
                                  min={checkIn || new Date().toISOString().split('T')[0]}
                                  className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Number of Guests</label>
                              <select
                                value={guests}
                                onChange={(e) => setGuests(Number(e.target.value))}
                                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                              >
                                {Array.from({ length: selectedRoom.max_guests }, (_, i) => i + 1).map(n => (
                                  <option key={n} value={n} className="bg-stone-900 text-white">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                                ))}
                              </select>
                            </div>

                            {/* Dynamically calculated bill itemizer */}
                            {nights > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs font-sans text-stone-300"
                              >
                                <div className="flex justify-between">
                                  <span>Room Rate ({nights} nights)</span>
                                  <span>${selectedRoom.price} x {nights} = ${selectedRoom.price * nights}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-stone-500">
                                  <span>Resort service charge & tax</span>
                                  <span>Included</span>
                                </div>
                                <div className="h-px bg-white/10 my-1" />
                                <div className="flex justify-between font-bold text-purple-400 text-sm">
                                  <span>Est. Grand Total</span>
                                  <span className="font-mono">${totalPrice}</span>
                                </div>
                              </motion.div>
                            )}

                            {!currentUser ? (
                              <button
                                type="button"
                                onClick={onOpenAuthModal}
                                className="w-full py-2.5 mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md hover:shadow-purple-600/10 transition active:scale-[0.98]"
                              >
                                Sign In to Book Now
                              </button>
                            ) : (
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md hover:shadow-purple-600/10 transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                                id="booking-submit"
                              >
                                {isSubmitting ? 'Confirming Stay...' : 'Confirm Sanctuary Booking'}
                                <ArrowRight size={14} />
                              </button>
                            )}
                          </form>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="booking-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 flex flex-col items-center justify-center h-full"
                      >
                        <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/30">
                          <Check size={28} />
                        </div>
                        <h4 className="font-serif text-xl font-bold text-white mb-2">Reservation Secured</h4>
                        <p className="text-xs text-stone-400 leading-relaxed mb-6">
                          Thank you! Your private sanctuary has been reserved successfully under ticket number <span className="font-mono font-bold text-stone-200">{bookingSuccess.id}</span>. An invoice and itinerary have been forwarded to your registered email address.
                        </p>

                        <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left space-y-2 mb-6 text-xs text-stone-300">
                          <div className="flex justify-between">
                            <span className="text-stone-400">Sanctuary</span>
                            <span className="font-semibold text-white">{bookingSuccess.room_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400">Duration</span>
                            <span className="font-semibold text-white">{bookingSuccess.check_in} to {bookingSuccess.check_out} ({nights} Nights)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400">Guests</span>
                            <span className="font-semibold text-white">{bookingSuccess.guests} Guest(s)</span>
                          </div>
                          <div className="h-px bg-white/10 my-1.5" />
                          <div className="flex justify-between font-bold text-sm text-purple-400">
                            <span>Amount Paid</span>
                            <span className="font-mono">${bookingSuccess.total_price}</span>
                          </div>
                        </div>

                        <button
                          onClick={closeBookingModal}
                          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md"
                        >
                          Discover More
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
