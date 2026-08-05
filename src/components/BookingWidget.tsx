import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ResortSettings, ResortRoom, BlockedDate } from '../types';
import { format, addDays, differenceInDays } from 'date-fns';
import { Users, Calendar as CalendarIcon, CheckCircle2, ChevronRight, BedDouble, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

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
      const { data: roomsData } = await supabase
        .from('resort_rooms')
        .select('*')
        .eq('is_active', true)
        .gte('capacity', guestsCount);

      if (!roomsData) {
        setAvailableRooms([]);
        return;
      }

      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('room_id, check_in_date, check_out_date, status')
        .neq('status', 'cancelled');

      const reqStart = new Date(checkInDate);
      reqStart.setHours(0, 0, 0, 0);
      const reqEnd = new Date(checkOutDate);
      reqEnd.setHours(0, 0, 0, 0);

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

      const available = (roomsData as ResortRoom[]).filter(room => {
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
      setError('Failed to load room availability. Please try again.');
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

  const stepsList = [
    { id: 'guests', label: 'Guests' },
    { id: 'dates', label: 'Dates' },
    { id: 'rooms', label: 'Suite' },
    { id: 'details', label: 'Confirm' }
  ];

  const currentStepIndex = stepsList.findIndex(s => s.id === step);

  return (
    <div className="glass-card rounded-3xl overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl mx-auto w-full relative z-10 transition-colors duration-300">
      
      {/* HEADER BAR */}
      <div className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between backdrop-blur-xl transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-xl font-syne font-bold text-slate-900 dark:text-white tracking-wide">Reserve Your Stay</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono uppercase tracking-widest">
            INSTANT CONFIRMATION
          </span>
        </div>

        {/* STEP PROGRESS BAR */}
        {step !== 'success' && (
          <div className="grid grid-cols-4 gap-2 pt-2">
            {stepsList.map((s, idx) => (
              <div key={s.id} className="flex flex-col items-center">
                <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                  idx <= currentStepIndex ? 'bg-gradient-to-r from-cyan-400 to-sky-400 shadow-sm shadow-cyan-500/50' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
                <span className={`text-[10px] font-mono uppercase tracking-wider mt-1.5 ${
                  idx === currentStepIndex ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-500'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 rounded-2xl text-xs font-mono border border-rose-200 dark:border-rose-800/80">
            {error}
          </div>
        )}

        {/* STEP 1: GUESTS */}
        {step === 'guests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-syne font-semibold text-slate-900 dark:text-white flex items-center">
                <Users className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                Select Guests
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Max {settings.max_guests_per_booking} guests</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl glass-card border-none bg-white/60 dark:bg-transparent dark:border-slate-800">
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">Adults</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-light">Age 13+</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:border-cyan-500 flex items-center justify-center font-bold disabled:opacity-30 transition-all"
                    disabled={adultsCount <= 1}
                  >-</button>
                  <span className="text-base font-mono font-bold w-4 text-center text-slate-900 dark:text-white">{adultsCount}</span>
                  <button
                    type="button"
                    onClick={() => setAdultsCount(Math.min(settings.max_guests_per_booking - childrenCount, adultsCount + 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:border-cyan-500 flex items-center justify-center font-bold disabled:opacity-30 transition-all"
                    disabled={guestsCount >= settings.max_guests_per_booking}
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl glass-card border-none bg-white/60 dark:bg-transparent dark:border-slate-800">
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">Children</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-light">Ages 2-12</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:border-cyan-500 flex items-center justify-center font-bold disabled:opacity-30 transition-all"
                    disabled={childrenCount <= 0}
                  >-</button>
                  <span className="text-base font-mono font-bold w-4 text-center text-slate-900 dark:text-white">{childrenCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.min(settings.max_guests_per_booking - adultsCount, childrenCount + 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:border-cyan-500 flex items-center justify-center font-bold disabled:opacity-30 transition-all"
                    disabled={guestsCount >= settings.max_guests_per_booking}
                  >+</button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('dates')}
              className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex justify-center items-center space-x-2"
            >
              <span>Select Stay Dates</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: DATES */}
        {step === 'dates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-syne font-semibold text-slate-900 dark:text-white flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                Select Dates
              </h3>
              <button 
                onClick={() => setStep('guests')} 
                className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Check-in</label>
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
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Check-out</label>
                <input
                  type="date"
                  min={checkInDate ? format(addDays(new Date(checkInDate), settings.min_stay_nights), 'yyyy-MM-dd') : format(addDays(new Date(), settings.min_stay_nights), 'yyyy-MM-dd')}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                />
              </div>
            </div>

            {checkInDate && checkOutDate && differenceInDays(new Date(checkOutDate), new Date(checkInDate)) < settings.min_stay_nights && (
              <p className="text-amber-600 dark:text-amber-400 text-xs font-mono">Minimum stay requirement is {settings.min_stay_nights} nights.</p>
            )}

            <button
              onClick={searchRooms}
              disabled={!checkInDate || !checkOutDate || differenceInDays(new Date(checkOutDate), new Date(checkInDate)) < settings.min_stay_nights}
              className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex justify-center items-center space-x-2 disabled:opacity-40"
            >
              <span>Search Available Suites</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: ROOMS */}
        {step === 'rooms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-syne font-semibold text-slate-900 dark:text-white flex items-center">
                <BedDouble className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                Available Suites
              </h3>
              <button 
                onClick={() => setStep('dates')} 
                className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            </div>

            {loadingRooms ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Finding available luxury suites...</span>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="py-10 text-center glass-card border-none bg-white/60 dark:bg-transparent dark:border-slate-800 rounded-2xl p-6">
                <p className="text-slate-900 dark:text-white font-semibold mb-1">No suites available</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-light">Please try adjusting your check-in dates or guest count.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {availableRooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border bg-white/60 dark:bg-transparent ${
                      selectedRoom?.id === room.id 
                        ? 'bg-slate-50 border-cyan-500 dark:bg-slate-900 dark:border-cyan-400 shadow-lg shadow-cyan-500/20 dark:shadow-cyan-950/40 ring-1 ring-cyan-500/50' 
                        : 'glass-card border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-syne font-bold text-slate-900 dark:text-white text-base">{room.room_name}</h4>
                          {selectedRoom?.id === room.id && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[10px] font-mono uppercase">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">{room.view_type} &bull; Up to {room.capacity} Guests</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selectedRoom?.id === room.id ? 'border-cyan-500 dark:border-cyan-400 bg-cyan-500 dark:bg-cyan-400 text-white dark:text-slate-950' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {selectedRoom?.id === room.id && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep('details')}
              disabled={!selectedRoom}
              className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex justify-center items-center space-x-2 disabled:opacity-40"
            >
              <span>Continue to Guest Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: DETAILS */}
        {step === 'details' && (
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-syne font-semibold text-slate-900 dark:text-white flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                Guest Details
              </h3>
              <button 
                type="button" 
                onClick={() => setStep('rooms')} 
                className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono bg-white/60 dark:bg-transparent">
              <div className="flex justify-between text-cyan-700 dark:text-cyan-300 font-bold mb-1">
                <span>{selectedRoom?.room_name}</span>
                <span>{guestsCount} GUESTS</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {checkInDate} to {checkOutDate}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={guestDetails.fullName} 
                  onChange={(e) => setGuestDetails({...guestDetails, fullName: e.target.value})} 
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={guestDetails.email} 
                    onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})} 
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Phone</label>
                  <input 
                    type="tel" 
                    required 
                    value={guestDetails.phone} 
                    onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})} 
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-sm outline-none transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Special Requests</label>
                <textarea 
                  rows={2} 
                  value={guestDetails.requests} 
                  onChange={(e) => setGuestDetails({...guestDetails, requests: e.target.value})} 
                  placeholder="Early check-in, dietary requirements..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-sm outline-none resize-none transition-all" 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-cyan-500 text-white dark:text-slate-950 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex justify-center items-center space-x-2 disabled:opacity-40"
            >
              <span>{isSubmitting ? 'CONFIRMING STAY...' : 'CONFIRM RESERVATION'}</span>
            </button>
          </form>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-emerald-400 text-white dark:text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/30">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl font-syne font-bold text-slate-900 dark:text-white mb-2">Reservation Confirmed</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto mb-6">
              We look forward to welcoming you to {settings.resort_name}. Your reservation details have been submitted.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500 font-mono text-xs uppercase tracking-widest transition-all"
            >
              Make Another Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

