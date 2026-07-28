import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ResortSettings, ResortRoom, BlockedDate, Reservation } from '../types';
import { format, addDays, differenceInDays, isBefore, startOfDay, isWithinInterval, areIntervalsOverlapping } from 'date-fns';
import { Users, Calendar as CalendarIcon, CheckCircle2, ChevronRight, BedDouble, Info } from 'lucide-react';

type BookingStep = 'guests' | 'dates' | 'rooms' | 'details' | 'success';

export default function BookingWidget() {
  const [step, setStep] = useState<BookingStep>('guests');
  const [settings, setSettings] = useState<ResortSettings | null>(null);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  
  // Form State
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  
  const guestsCount = adultsCount + childrenCount;

  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<ResortRoom | null>(null);
  
  const [guestDetails, setGuestDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    requests: ''
  });

  const [availableRooms, setAvailableRooms] = useState<ResortRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      const [settingsRes, blockedRes] = await Promise.all([
        supabase.from('resort_settings').select('*').limit(1).single(),
        supabase.from('blocked_dates').select('*')
      ]);
      if (settingsRes.data) setSettings(settingsRes.data as ResortSettings);
      if (blockedRes.data) setBlockedDates(blockedRes.data as BlockedDate[]);
    }
    loadInitialData();
  }, []);

  const searchRooms = async () => {
    if (!checkInDate || !checkOutDate) return;
    setLoadingRooms(true);
    setError(null);
    setStep('rooms');

    try {
      // 1. Get all active rooms big enough
      const { data: roomsData } = await supabase
        .from('resort_rooms')
        .select('*')
        .eq('is_active', true)
        .gte('capacity', guestsCount);

      if (!roomsData) {
        setAvailableRooms([]);
        return;
      }

      // 2. Get overlapping reservations
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('room_id, check_in_date, check_out_date, status')
        .neq('status', 'cancelled');

      const reqStart = new Date(checkInDate);
      reqStart.setHours(0, 0, 0, 0);
      const reqEnd = new Date(checkOutDate);
      reqEnd.setHours(0, 0, 0, 0);

      // 3. Check blocked dates
      const hasBlockedDates = blockedDates.some(block => {
        const bDate = new Date(block.blocked_date);
        bDate.setHours(0, 0, 0, 0);
        return bDate >= reqStart && bDate < reqEnd;
      });

      if (hasBlockedDates) {
        setAvailableRooms([]);
        setError('Selected dates include blocked dates. Please choose different dates.');
        setLoadingRooms(false);
        return;
      }

      // Filter rooms physically available
      const available = (roomsData as ResortRoom[]).filter(room => {
        // Check reservations
        const hasConflict = (reservationsData || []).some(res => {
          if (res.room_id !== room.id) return false;
          const resStart = new Date(res.check_in_date);
          resStart.setHours(0, 0, 0, 0);
          const resEnd = new Date(res.check_out_date);
          resEnd.setHours(0, 0, 0, 0);
          
          return (reqStart < resEnd && reqEnd > resStart);
        });

        if (hasConflict) return false;

        return true;
      });

      setAvailableRooms(available);
    } catch (err) {
      setError('Failed to load availability. Please try again.');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.from('reservations').insert([{
        full_name: guestDetails.fullName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        guests_count: guestsCount,
        room_id: selectedRoom.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        status: 'pending',
        special_requests: guestDetails.requests
      }]);

      if (error) throw error;
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-w-xl mx-auto w-full">
      <div className="bg-slate-900 text-white p-6">
        <h2 className="text-2xl font-serif">Reserve Your Stay</h2>
        <p className="text-slate-300 text-sm mt-1">Experience luxury at {settings.resort_name}</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-200">
            {error}
          </div>
        )}

        {/* STEP 1: GUESTS */}
        {step === 'guests' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-slate-400" />
              Number of Guests
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <div>
                  <span className="font-medium text-slate-700 block">Adults</span>
                  <span className="text-xs text-slate-500">Ages 13 or above</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-white bg-transparent transition-colors"
                    disabled={adultsCount <= 1}
                  >-</button>
                  <span className="text-lg font-medium w-4 text-center">{adultsCount}</span>
                  <button
                    type="button"
                    onClick={() => setAdultsCount(Math.min(settings.max_guests_per_booking - childrenCount, adultsCount + 1))}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-white bg-transparent transition-colors"
                    disabled={guestsCount >= settings.max_guests_per_booking}
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <div>
                  <span className="font-medium text-slate-700 block">Children</span>
                  <span className="text-xs text-slate-500">Ages 2-12</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-white bg-transparent transition-colors"
                    disabled={childrenCount <= 0}
                  >-</button>
                  <span className="text-lg font-medium w-4 text-center">{childrenCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.min(settings.max_guests_per_booking - adultsCount, childrenCount + 1))}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-white bg-transparent transition-colors"
                    disabled={guestsCount >= settings.max_guests_per_booking}
                  >+</button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep('dates')}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center"
            >
              Continue to Dates <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 2: DATES */}
        {step === 'dates' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                Select Dates
              </h3>
              <button onClick={() => setStep('guests')} className="text-sm text-slate-500 underline">Back</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-in</label>
                <input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={checkInDate}
                  onChange={(e) => {
                    setCheckInDate(e.target.value);
                    if (checkOutDate && new Date(e.target.value) >= new Date(checkOutDate)) {
                      setCheckOutDate(format(addDays(new Date(e.target.value), settings.min_stay_nights), 'yyyy-MM-dd'));
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-out</label>
                <input
                  type="date"
                  min={checkInDate ? format(addDays(new Date(checkInDate), settings.min_stay_nights), 'yyyy-MM-dd') : format(addDays(new Date(), settings.min_stay_nights), 'yyyy-MM-dd')}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            {checkInDate && checkOutDate && differenceInDays(new Date(checkOutDate), new Date(checkInDate)) < settings.min_stay_nights && (
              <p className="text-amber-600 text-sm">Minimum stay is {settings.min_stay_nights} nights.</p>
            )}

            <button
              onClick={searchRooms}
              disabled={!checkInDate || !checkOutDate || differenceInDays(new Date(checkOutDate), new Date(checkInDate)) < settings.min_stay_nights}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center disabled:opacity-50"
            >
              Check Availability <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 3: ROOMS */}
        {step === 'rooms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900 flex items-center">
                <BedDouble className="w-5 h-5 mr-2 text-slate-400" />
                Available Suites
              </h3>
              <button onClick={() => setStep('dates')} className="text-sm text-slate-500 underline">Back</button>
            </div>

            {loadingRooms ? (
              <div className="py-12 text-center text-slate-500">Searching for perfect suites...</div>
            ) : availableRooms.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-900 font-medium mb-1">No rooms available</p>
                <p className="text-slate-500 text-sm">Please try adjusting your dates or guest count.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {availableRooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedRoom?.id === room.id ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-400'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif text-lg text-slate-900">{room.room_name}</h4>
                        <p className="text-sm text-slate-500 mt-1">{room.view_type} • Up to {room.capacity} Guests</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRoom?.id === room.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'}`}>
                        {selectedRoom?.id === room.id && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep('details')}
              disabled={!selectedRoom}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center disabled:opacity-50 mt-4"
            >
              Continue to Details <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 4: DETAILS */}
        {step === 'details' && (
          <form onSubmit={handleBookingSubmit} className="space-y-6">
             <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900 flex items-center">
                Guest Details
              </h3>
              <button type="button" onClick={() => setStep('rooms')} className="text-sm text-slate-500 underline">Back</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm mb-6">
              <p className="font-medium text-slate-900">{selectedRoom?.room_name}</p>
              <p className="text-slate-600 mt-1">
                {format(new Date(checkInDate), 'MMM d, yyyy')} - {format(new Date(checkOutDate), 'MMM d, yyyy')} • {guestsCount} Guests
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" required value={guestDetails.fullName} onChange={(e) => setGuestDetails({...guestDetails, fullName: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" required value={guestDetails.email} onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" required value={guestDetails.phone} onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests (Optional)</label>
                <textarea rows={2} value={guestDetails.requests} onChange={(e) => setGuestDetails({...guestDetails, requests: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </form>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif text-slate-900 mb-2">Reservation Confirmed</h3>
            <p className="text-slate-600 mb-6">We look forward to welcoming you to {settings.resort_name}. A confirmation email will be sent shortly.</p>
            
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Make Another Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
