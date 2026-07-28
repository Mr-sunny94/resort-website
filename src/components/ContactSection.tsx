/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ChevronRight, Globe } from 'lucide-react';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Reservations');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setIsSuccess(false);
      }, 3000);
    }, 1200);
  };

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto" id="contact-section">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Reach Out</span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2 mb-4">Connect with the Concierge</h2>
        <p className="max-w-2xl mx-auto text-sm text-stone-300 leading-relaxed">
          Allow our expert concierge and reservations desk to curate your perfect itinerary, arrange private transits, or answer custom inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-stone-900/60 border border-white/10 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">MustET Headquarters</span>
              <h3 className="font-serif text-3xl font-bold mt-1 mb-6">The Peninsula Sanctuary</h3>
              
              <div className="space-y-5 text-sm text-stone-300">
                <div className="flex items-start gap-3.5">
                  <MapPin className="text-purple-400 shrink-0 mt-1" size={18} />
                  <div>
                    <h4 className="font-semibold text-white">Our Coordinates</h4>
                    <p className="text-xs">MustET Overlook Peninsula, Cove Dr, Scenic Point, SP 99401</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="text-purple-400 shrink-0 mt-1" size={18} />
                  <div>
                    <h4 className="font-semibold text-white">Reservations & Concierge</h4>
                    <p className="text-xs">+1 (555) 019-9000 (Toll-Free 24/7)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="text-purple-400 shrink-0 mt-1" size={18} />
                  <div>
                    <h4 className="font-semibold text-white">General Inquiry Channels</h4>
                    <p className="text-xs">concierge@mustet.com • booking@mustet.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="text-purple-400 shrink-0 mt-1" size={18} />
                  <div>
                    <h4 className="font-semibold text-white">Check-In Standard</h4>
                    <p className="text-xs">Check-In: 3:00 PM • Check-Out: 12:00 PM (Express available)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Globe size={12} />
                <span>Private Charter Helipads</span>
              </span>
              <span>Available 24 hrs</span>
            </div>
          </div>

          {/* Quick Informative Highlight */}
          <div className="p-6 bg-stone-900/60 border border-white/10 rounded-2xl flex items-center gap-4 backdrop-blur-md">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full flex items-center justify-center font-bold font-serif text-lg">
              ME
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Custom Transit Curations</h4>
              <p className="text-xs text-stone-300">Contact us at least 48 hours in advance for customized yacht or helicopter transfers.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Query Form */}
        <div className="lg:col-span-7 bg-stone-900/60 border border-white/10 rounded-2xl p-8 shadow-md relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600" />
          
          <h3 className="font-serif text-2xl font-bold text-white mb-1">Send a Private Message</h3>
          <p className="text-xs text-stone-300 mb-6">Your personal data is managed with strict security standard protocols.</p>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Johnathan Guest"
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. guest@example.com"
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Department</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                  >
                    <option value="Reservations" className="bg-stone-900 text-white">Reservations Desk</option>
                    <option value="Concierge" className="bg-stone-900 text-white">Private Concierge Services</option>
                    <option value="Events" className="bg-stone-900 text-white">Special Events & Gatherings</option>
                    <option value="Corporate" className="bg-stone-900 text-white">Corporate Retreats</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Your Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe how we can curate your absolute perfect stay..."
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition resize-none text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md hover:shadow-purple-600/10 transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <span>{isSending ? 'Transmitting Inquiries...' : 'Transmit Inquiry'}</span>
                  <Send size={12} />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success-prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center flex flex-col items-center justify-center h-full text-white"
              >
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/30 animate-bounce">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="font-serif text-xl font-bold text-white mb-2">Message Transmitted</h4>
                <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
                  Thank you, your message has been transmitted successfully. A private curator or concierge from our scenic Cove HQ will respond to your specified address within 1 to 2 hours.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
