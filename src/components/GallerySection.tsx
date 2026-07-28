/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Maximize2, ArrowLeft, ArrowRight, Image as ImageIcon, Check, UploadCloud } from 'lucide-react';
import { GalleryImage } from '../types';
import { dbService } from '../supabaseClient';

interface GallerySectionProps {
  galleryImages: GalleryImage[];
  onImageAdded: () => void;
}

export default function GallerySection({ galleryImages, onImageAdded }: GallerySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // New Upload Form state
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState('Exterior');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = ['All', 'Exterior', 'Interior', 'Villas', 'Amenities'];

  const filteredImages = selectedCategory === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex === null || filteredImages.length === 0) return;
    setActivePhotoIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev! - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex === null || filteredImages.length === 0) return;
    setActivePhotoIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev! + 1));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newCaption) return;

    setIsSubmitting(true);
    try {
      await dbService.addGalleryImage(newUrl, newCaption, newCategory);
      setSuccess(true);
      onImageAdded();
      setTimeout(() => {
        setNewUrl('');
        setNewCaption('');
        setIsUploadOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to upload image', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto" id="gallery-section">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
        <div className="text-left max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Visual Chronicles</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2 mb-4">A Portal to Paradise</h2>
          <p className="text-sm text-stone-300 leading-relaxed font-sans">
            Immerse yourself in snapshots of our breathtaking grounds, fine beachfront suites, pristine pools, and unique coastal environments.
          </p>
        </div>

        {/* Action Button to Add Gallery Pictures */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-full flex items-center gap-1.5 shadow-lg shadow-purple-600/20 active:scale-[0.98] transition shrink-0"
          id="add-to-gallery-btn"
        >
          <Plus size={16} />
          <span>Publish Image</span>
        </button>
      </div>

      {/* Categories Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-white/10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${selectedCategory === cat ? 'text-purple-400 border-b-2 border-purple-400' : 'text-stone-400 hover:text-stone-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Grid Layout for Gallery Images */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredImages.map((img, i) => (
          <motion.div
            layout
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer shadow-md border border-white/10 bg-stone-900/40 backdrop-blur-md"
            onClick={() => setActivePhotoIndex(i)}
            id={`gallery-item-${img.id}`}
          >
            <img
              src={img.image_url}
              alt={img.caption}
              className="w-full h-auto object-cover group-hover:scale-[1.03] transition-all duration-500"
            />
            {/* Visual Hover Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
              <span className="text-[10px] uppercase tracking-wider text-purple-400 mb-1 font-semibold">
                {img.category || 'Exterior'}
              </span>
              <p className="text-white text-sm font-serif font-medium leading-snug mb-3">
                {img.caption}
              </p>
              <div className="flex items-center text-xs text-stone-300 gap-1.5">
                <Maximize2 size={12} />
                <span>Expand Frame</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* LIGHTBOX SLIDESHOW MODAL */}
      <AnimatePresence>
        {activePhotoIndex !== null && filteredImages[activePhotoIndex] && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out"
            onClick={() => setActivePhotoIndex(null)}
          >
            {/* Top Toolbar */}
            <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
              <span className="text-white text-xs font-mono">
                {activePhotoIndex + 1} / {filteredImages.length}
              </span>
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Picture Frame */}
            <div className="relative max-w-5xl w-full flex items-center justify-center p-2">
              {/* Pagination controls */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 md:-left-12 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition z-50 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>

              <motion.img
                key={filteredImages[activePhotoIndex].id}
                src={filteredImages[activePhotoIndex].image_url}
                alt={filteredImages[activePhotoIndex].caption}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl cursor-default border border-white/10"
                onClick={(e) => e.stopPropagation()}
              />

              <button
                onClick={handleNextPhoto}
                className="absolute right-2 md:-right-12 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition z-50 cursor-pointer"
              >
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Bottom Details Block */}
            <div
              className="text-center text-white mt-6 max-w-xl px-4 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-bold">
                {filteredImages[activePhotoIndex].category || 'Exterior'}
              </span>
              <p className="font-serif text-lg md:text-xl font-medium mt-1 leading-normal">
                {filteredImages[activePhotoIndex].caption}
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* PUBLISH TO GALLERY SLIDE-OVER */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-stone-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden text-white"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-600" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <ImageIcon size={18} />
                  <span>Publish Resort Photo</span>
                </h3>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-stone-400 mb-5 leading-relaxed">
                Contribute beautiful scenery, design, or landscape photos to our community gallery. This instantly enriches both this list and the animated looping hero background!
              </p>

              <AnimatePresence mode="wait">
                {!success ? (
                  <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Image URL</label>
                      <div className="relative">
                        <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                        <input
                          type="url"
                          required
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                        />
                      </div>
                      <span className="text-[10px] text-stone-500 mt-1 block">Paste any high-resolution image link</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Photo Description</label>
                      <input
                        type="text"
                        required
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        placeholder="Sunrise landscape of the infinity pool"
                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                      >
                        <option value="Exterior">Exterior Grounds</option>
                        <option value="Interior">Interior Layouts</option>
                        <option value="Villas">Villas & Suites</option>
                        <option value="Amenities">Resort Amenities</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md hover:shadow-purple-600/10 transition active:scale-[0.98]"
                    >
                      {isSubmitting ? 'Uploading image...' : 'Publish to Feed'}
                    </button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/30">
                      <Check size={24} />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-white mb-1">Photo Added</h4>
                    <p className="text-xs text-stone-400">
                      The image list has been successfully re-seeded.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
