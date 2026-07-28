/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, CalendarDays, Award, Star, Users } from 'lucide-react';
import { GalleryImage } from '../types';

interface HeroProps {
  galleryImages: GalleryImage[];
  userCount?: number;
  onBookNowClick: () => void;
  onExploreGalleryClick: () => void;
}

export default function Hero({ galleryImages, userCount = 1248, onBookNowClick, onExploreGalleryClick }: HeroProps) {
  const [index, setIndex] = useState(0);

  // Extract URLs
  const imageUrls = galleryImages.length > 0
    ? galleryImages.map((img) => img.image_url)
    : [
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80'
      ];

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageUrls.length);
    }, 6000); // Transitions every 6 seconds
    return () => clearInterval(interval);
  }, [imageUrls]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-stone-950">
      {/* Dynamic Looping Background Image with Fade & Reveal */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={imageUrls[index]}
            alt="Resort Sanctuary Background"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.45, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 2.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Soft elegant gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30 z-1" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-stone-950/40 z-1" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center select-none">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-3 flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-purple-400 text-xs font-semibold tracking-[0.25em] uppercase"
        >
          <Award size={14} className="text-purple-400" />
          <span>A Private Oasis of Uncompromised Luxury</span>
        </motion.div>

        {/* Elegant Display Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight leading-none mb-4 italic"
        >
          Must<span className="text-purple-400">ET</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="max-w-2xl text-base md:text-lg lg:text-xl text-stone-300/90 font-light tracking-[0.3em] uppercase mb-10"
        >
          Paradise Found • Beyond Hospitality
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6"
        >
          <button
            onClick={onBookNowClick}
            className="group px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-full tracking-wider uppercase transition shadow-lg shadow-purple-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            id="hero-book-now"
          >
            <CalendarDays size={18} className="transition group-hover:rotate-12" />
            <span>Secure Your Sanctuary</span>
          </button>
          
          <button
            onClick={onExploreGalleryClick}
            className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/30 hover:border-white/50 font-semibold text-sm rounded-full tracking-wider uppercase backdrop-blur-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
            id="hero-explore-gallery"
          >
            <Compass size={18} />
            <span>Explore the Grounds</span>
          </button>
        </motion.div>
      </div>

      {/* Floating features footer for the hero view */}
      <div className="absolute bottom-6 left-0 w-full z-10 hidden lg:flex justify-around items-center max-w-6xl mx-auto right-0 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/10 rounded-lg text-purple-400">
            <Star size={18} fill="currentColor" />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-sm font-bold">5-Star Excellence</h4>
            <p className="text-xs text-stone-400">Award-winning service</p>
          </div>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/10 rounded-lg text-purple-400">
            <Users size={18} />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-sm font-bold font-mono">{userCount.toLocaleString()} Members</h4>
            <p className="text-xs text-stone-400">Registered Supabase Community</p>
          </div>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/10 rounded-lg text-purple-400">
            <Compass size={18} />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-sm font-bold">Private Peninsula</h4>
            <p className="text-xs text-stone-400">Exclusive coastal location</p>
          </div>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/10 rounded-lg text-purple-400">
            <CalendarDays size={18} />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-sm font-bold">Flexible Stays</h4>
            <p className="text-xs text-stone-400">Seamless instant bookings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
