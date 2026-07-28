/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User as UserIcon, Calendar, Sparkles, Menu, X, Trash2, Ticket, ChevronDown, CheckCircle2, Award, Users } from 'lucide-react';

import { dbService } from './supabaseClient';
import { authService, getCurrentSessionUser } from './authService';
import { Room, GalleryImage, Booking, User as AppUser } from './types';

// Child components
import Hero from './components/Hero';
import RoomsSection from './components/RoomsSection';
import GallerySection from './components/GallerySection';
import ContactSection from './components/ContactSection';
import SupportSection from './components/SupportSection';
import AuthModal from './components/AuthModal';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}


export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'gallery' | 'book' | 'contact' | 'support'>('home');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Supabase User Count State
  const [userCountData, setUserCountData] = useState<{ count: number; isSupabase: boolean } | null>(null);

  // UI States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isStaysDrawerOpen, setIsStaysDrawerOpen] = useState(false);
  const [cancelNotification, setCancelNotification] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    // Auth Check
    const sessionUser = getCurrentSessionUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      fetchUserBookings(sessionUser.email || '');
    }

    // Fetch database items & user count
    refreshRooms();
    refreshGallery();
    refreshUserCount();
  }, []);

  const refreshUserCount = async () => {
    try {
      const data = await authService.getUserCount();
      setUserCountData(data);
    } catch (err) {
      console.error('Failed to load user count', err);
    }
  };

  const refreshRooms = async () => {
    try {
      const data = await dbService.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms', err);
    }
  };

  const refreshGallery = async () => {
    try {
      const data = await dbService.getGallery();
      setGalleryImages(data);
    } catch (err) {
      console.error('Failed to load gallery', err);
    }
  };

  const fetchUserBookings = async (email: string) => {
    if (!email) return;
    try {
      const data = await dbService.getBookings(email);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load user bookings', err);
    }
  };

  const handleAuthSuccess = (user: AppUser) => {
    setCurrentUser(user);
    fetchUserBookings(user.email || '');
    refreshUserCount();
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setBookings([]);
    setIsProfileDropdownOpen(false);
    setIsStaysDrawerOpen(false);
    refreshUserCount();
  };

  const handleBookingCreated = () => {
    if (currentUser?.email) {
      fetchUserBookings(currentUser.email);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const success = await dbService.cancelBooking(bookingId);
    if (success && currentUser?.email) {
      fetchUserBookings(currentUser.email);
      setCancelNotification('Reservation successfully cancelled. Refund processed.');
      setTimeout(() => setCancelNotification(null), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 font-sans selection:bg-luxury-emerald selection:text-white relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] rounded-full bg-purple-500/5 blur-3xl pointer-events-none -z-10" />

      {/* 
        ========================================================================
        GLASSMORPHIC NAVBAR
        ========================================================================
      */}
      <nav className="fixed top-0 w-full z-40 bg-stone-950/60 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo/Brand Name */}
            <div 
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setCurrentTab('home')}
            >
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-purple-600/20 border border-white/20">
                ME
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white block">Must<span className="text-purple-400">ET</span></span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-purple-400 font-bold block -mt-1">Resorts & Spa</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider">
              <button
                onClick={() => setCurrentTab('home')}
                className={`py-2 border-b-2 transition ${currentTab === 'home' ? 'text-purple-400 border-purple-400 font-bold' : 'text-stone-300 border-transparent hover:text-white'}`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentTab('gallery')}
                className={`py-2 border-b-2 transition ${currentTab === 'gallery' ? 'text-purple-400 border-purple-400 font-bold' : 'text-stone-300 border-transparent hover:text-white'}`}
              >
                Gallery
              </button>
              <button
                onClick={() => setCurrentTab('book')}
                className={`py-2 border-b-2 transition ${currentTab === 'book' ? 'text-purple-400 border-purple-400 font-bold' : 'text-stone-300 border-transparent hover:text-white'}`}
                id="navbar-book-now"
              >
                Book Now
              </button>
              <button
                onClick={() => setCurrentTab('contact')}
                className={`py-2 border-b-2 transition ${currentTab === 'contact' ? 'text-purple-400 border-purple-400 font-bold' : 'text-stone-300 border-transparent hover:text-white'}`}
              >
                Contact
              </button>
              <button
                onClick={() => setCurrentTab('support')}
                className={`py-2 border-b-2 transition ${currentTab === 'support' ? 'text-purple-400 border-purple-400 font-bold' : 'text-stone-300 border-transparent hover:text-white'}`}
              >
                Support
              </button>
            </div>

            {/* Authentication and Profile controls */}
            <div className="hidden md:flex items-center gap-3">
              {userCountData && (
                <div 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 rounded-full text-xs cursor-pointer transition select-none"
                  title="Supabase Registered Members"
                >
                  <Users size={13} className="text-purple-400" />
                  <span className="font-mono font-bold text-white text-[11px]">{userCountData.count.toLocaleString()}</span>
                  <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">Members</span>
                </div>
              )}

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-full border border-white/20 transition cursor-pointer text-white"
                  >
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={currentUser.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-purple-500/30 shadow-inner"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-semibold text-white max-w-[110px] truncate">{currentUser.fullName}</span>
                      <span className="block text-[9px] text-stone-300 capitalize">{currentUser.provider} Member</span>
                    </div>
                    <ChevronDown size={14} className="text-stone-400" />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2.5 w-52 bg-stone-900/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden py-1"
                      >
                        <button
                          onClick={() => {
                            setIsStaysDrawerOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-xs text-left font-medium text-stone-200 hover:bg-white/10 hover:text-purple-400 transition flex items-center gap-2"
                        >
                          <Calendar size={14} className="text-purple-400" />
                          <span>My Stays ({bookings.length})</span>
                        </button>
                        
                        <div className="h-px bg-white/10 my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-xs text-left font-medium text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md hover:shadow-purple-600/10 transition active:scale-[0.98] cursor-pointer"
                  id="navbar-login-btn"
                >
                  Login / Signup
                </button>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-stone-300 hover:text-white rounded-lg"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-stone-900/95 backdrop-blur-2xl border-t border-white/15 py-4 px-6 space-y-3 shadow-inner"
            >
              <button
                onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left py-2 text-sm font-semibold tracking-wide uppercase ${currentTab === 'home' ? 'text-purple-400' : 'text-stone-400'}`}
              >
                Home
              </button>
              <button
                onClick={() => { setCurrentTab('gallery'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left py-2 text-sm font-semibold tracking-wide uppercase ${currentTab === 'gallery' ? 'text-purple-400' : 'text-stone-400'}`}
              >
                Gallery
              </button>
              <button
                onClick={() => { setCurrentTab('book'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left py-2 text-sm font-semibold tracking-wide uppercase ${currentTab === 'book' ? 'text-purple-400' : 'text-stone-400'}`}
              >
                Book Now
              </button>
              <button
                onClick={() => { setCurrentTab('contact'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left py-2 text-sm font-semibold tracking-wide uppercase ${currentTab === 'contact' ? 'text-purple-400' : 'text-stone-400'}`}
              >
                Contact
              </button>
              <button
                onClick={() => { setCurrentTab('support'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left py-2 text-sm font-semibold tracking-wide uppercase ${currentTab === 'support' ? 'text-purple-400' : 'text-stone-400'}`}
              >
                Support
              </button>

              <div className="h-px bg-white/10 my-4" />

              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="block text-sm font-bold text-white">{currentUser.fullName}</span>
                      <span className="block text-[10px] text-stone-400 capitalize">{currentUser.provider} Member</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsStaysDrawerOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-white/10 border border-white/15 text-xs font-semibold text-purple-400 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Calendar size={14} />
                    <span>My Stays ({bookings.length})</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg"
                >
                  Login / Signup
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 
        ========================================================================
        MAIN ROUTE/TAB VIEW SHEATH
        ========================================================================
      */}
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Hero 
                galleryImages={galleryImages}
                userCount={userCountData?.count}
                onBookNowClick={() => setCurrentTab('book')}
                onExploreGalleryClick={() => setCurrentTab('gallery')}
              />
            </motion.div>
          )}

          {currentTab === 'gallery' && (
            <motion.div
              key="gallery-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <GallerySection 
                galleryImages={galleryImages}
                onImageAdded={refreshGallery}
              />
            </motion.div>
          )}

          {currentTab === 'book' && (
            <motion.div
              key="book-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <RoomsSection 
                rooms={rooms}
                currentUser={currentUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onBookingCreated={handleBookingCreated}
              />
            </motion.div>
          )}

          {currentTab === 'contact' && (
            <motion.div
              key="contact-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <ContactSection />
            </motion.div>
          )}

          {currentTab === 'support' && (
            <motion.div
              key="support-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <SupportSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 
        ========================================================================
        AUTHENTICATION MODAL PANEL
        ========================================================================
      */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        "MY STAYS" ACTIVE RESERVATIONS DRAWER
        ========================================================================
      */}
      <AnimatePresence>
        {isStaysDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            {/* Click-out barrier */}
            <div className="absolute inset-0" onClick={() => setIsStaysDrawerOpen(false)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-stone-900/90 backdrop-blur-2xl shadow-2xl flex flex-col justify-between z-10 border-l border-white/15 text-white"
            >
              <div className="p-6 overflow-y-auto h-full">
                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-purple-400" size={20} />
                    <h3 className="font-serif text-xl font-bold text-white">My Stays & Bookings</h3>
                  </div>
                  <button
                    onClick={() => setIsStaysDrawerOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                {cancelNotification && (
                  <div className="p-3 mb-5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>{cancelNotification}</span>
                  </div>
                )}

                {bookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-stone-400 mx-auto mb-4 border border-white/10">
                      <Calendar size={28} />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">No upcoming reservations</p>
                    <p className="text-xs text-stone-400 max-w-xs mx-auto mb-6">
                      We cannot find any active room reservations registered to your account credentials.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentTab('book');
                        setIsStaysDrawerOpen(false);
                      }}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
                    >
                      Book a Room Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((book: Booking) => (
                      <div
                        key={book.id}
                        className={`border rounded-xl p-4 bg-white/5 backdrop-blur-md shadow-md relative transition ${book.status === 'cancelled' ? 'opacity-50 border-white/5' : 'border-white/10 hover:border-purple-500/30'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif text-sm font-bold text-white leading-snug">{book.room_name}</h4>
                          <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${book.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                            {book.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-300 space-y-1 mb-3">
                          <div className="flex justify-between">
                            <span>Reference</span>
                            <span className="font-mono text-stone-200 font-semibold">{book.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration</span>
                            <span className="text-white font-medium">{book.check_in} to {book.check_out}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Guests</span>
                            <span className="text-white font-medium">{book.guests} Guest(s)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Bill</span>
                            <span className="text-purple-400 font-bold font-mono">${book.total_price}</span>
                          </div>
                        </div>

                        {book.status !== 'cancelled' && (
                          <div className="pt-2 border-t border-white/10 flex justify-end">
                            <button
                              onClick={() => handleCancelBooking(book.id)}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 transition flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              <span>Cancel Stay</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer footer */}
              <div className="p-6 bg-black/20 border-t border-white/10 text-xs text-stone-400 leading-relaxed">
                Need urgent modifications to your check-in schedules? Contact the reservations desk immediately at <span className="font-semibold text-stone-200">+1 (555) 019-9000</span>.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        EDITORIAL FOOTER
        ========================================================================
      */}
      <footer className="bg-luxury-dark text-white pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            
            {/* Column 1: Logo & Statement */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-luxury-emerald flex items-center justify-center text-white font-serif font-bold text-sm border border-luxury-gold/30 shadow-md">
                  ME
                </div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">MustET Resorts</span>
              </div>
              <p className="text-xs text-luxury-sand/70 leading-relaxed font-sans max-w-sm">
                A private sanctuary resting on a secluded coastal peninsula, offering breathtaking azure sea views, bespoke wellness spas, and curated culinary masterworks.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-luxury-gold uppercase tracking-wider font-semibold">
                <Award size={12} fill="currentColor" />
                <span>Five-Star Diamond Accredited Sanctuary</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-serif text-sm font-semibold text-white tracking-wide">Sanctuary Navigations</h4>
              <ul className="text-xs text-luxury-sand/65 space-y-2">
                <li>
                  <button onClick={() => setCurrentTab('home')} className="hover:text-luxury-gold transition">
                    Home Sanctuary
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('gallery')} className="hover:text-luxury-gold transition">
                    Scenic Gallery Feed
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('book')} className="hover:text-luxury-gold transition">
                    Suite & Villa Reservals
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('contact')} className="hover:text-luxury-gold transition">
                    Concierge Channels
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('support')} className="hover:text-luxury-gold transition">
                    Immediate Support Hub
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Summary */}
            <div className="md:col-span-3 space-y-3 text-xs text-luxury-sand/65">
              <h4 className="font-serif text-sm font-semibold text-white tracking-wide">Scenic Head Office</h4>
              <p className="leading-relaxed">
                MustET Peninsula Sanctuary,<br />
                Cove Drive, Scenic Point,<br />
                United States 99401
              </p>
              <p className="pt-2">
                concierge@mustet.com<br />
                +1 (555) 019-9000
              </p>
            </div>

            {/* Column 4: Newsletter sign */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-serif text-sm font-semibold text-white tracking-wide">Curation Letters</h4>
              <p className="text-[11px] text-luxury-sand/60 leading-normal">
                Receive quarterly updates regarding luxury bookings and private resort events.
              </p>
              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} className="flex">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  className="w-full px-2.5 py-1.5 text-[11px] bg-white/5 border border-white/10 rounded-l focus:outline-none focus:border-luxury-gold placeholder-gray-500 font-sans"
                />
                <button
                  type="submit"
                  className="px-3 bg-luxury-emerald text-white text-[10px] font-bold uppercase rounded-r border border-transparent hover:bg-luxury-emerald/90 transition"
                >
                  Join
                </button>
              </form>
            </div>

          </div>

          <div className="h-px bg-white/5 my-6" />

          {/* Copyright row */}
          <div className="flex flex-col md:flex-row items-center justify-between text-[10px] text-luxury-sand/40">
            <span>© 2026 MustET Luxury Resorts & Spas. All Rights Reserved.</span>
            <div className="flex gap-4 mt-2 md:mt-0 uppercase tracking-widest font-semibold">
              <a href="#privacy" className="hover:text-luxury-gold transition">Privacy Safeguard</a>
              <a href="#terms" className="hover:text-luxury-gold transition">Terms of Curancy</a>
              <a href="#charter" className="hover:text-luxury-gold transition">Yacht & Heli Charter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
