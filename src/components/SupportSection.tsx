/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, LifeBuoy, FileText, Send, CheckCircle2, Ticket } from 'lucide-react';
import { dbService } from '../supabaseClient';
import { SupportTicket } from '../types';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How do I arrange private airport or marina transfers?',
    answer: 'We provide complimentary premium SUV pickup from the international airport (SPX) for all guests. Helicopter transfers directly to our private lawn helipad and luxury yacht charters from the Scenic Point marina can be arranged upon request by contacting the concierge desk at least 48 hours prior to arrival.'
  },
  {
    question: 'What is your reservation cancellation and refund policy?',
    answer: 'Reservations can be fully refunded or rescheduled up to 7 days prior to check-in. Cancellations made within 7 days of scheduled check-in will incur a charge equivalent to the first night of the booking. All refund requests are processed within 24 to 48 hours.'
  },
  {
    question: 'Are wellness and private spa services included in my booking?',
    answer: 'All resort guests receive complimentary access to our salt-water pools, steam rooms, and yoga gardens. Custom massotherapeutic sessions, private beach cabana yoga, and signature wellness rituals can be booked individually via the support hub or directly at the Sanctuary Spa reception.'
  },
  {
    question: 'Do rooms feature private pools or beach access?',
    answer: 'Yes! Our Royal Oceanfront Villas feature private infinite-edge plunge pools and individual wooden steps leading directly onto our private sands. The Imperial Penthouse boasts a large sun-deck wraparound jacuzzi.'
  },
  {
    question: 'Is high-speed wireless internet available across the peninsula?',
    answer: 'We provide complementary ultra-high-speed fiber Wi-Fi throughout all rooms, beach clubs, and gardens. A secure, high-bandwidth connection ensures you stay seamlessly connected even in our secluded oasis.'
  }
];

export default function SupportSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Support Ticket Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<SupportTicket | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setIsSubmitting(true);
    try {
      const ticket = await dbService.createSupportTicket({
        name,
        email,
        subject,
        message
      });
      setTicketCreated(ticket);
      setTimeout(() => {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setTicketCreated(null);
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto" id="support-section">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">Assistance Hub</span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2 mb-4">Guest Support Desk</h2>
        <p className="max-w-2xl mx-auto text-sm text-stone-300 leading-relaxed">
          Access immediate answers regarding accommodations, transfers, and resort policies, or file a high-priority support ticket to speak to our operational staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Premium FAQ Accordion */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="text-purple-400" size={20} />
            <h3 className="font-serif text-2xl font-bold text-white">Frequently Answered Queries</h3>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-stone-900/60 border border-white/10 rounded-xl overflow-hidden shadow-md transition hover:border-purple-500/20 backdrop-blur-md"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-white uppercase tracking-wide cursor-pointer focus:outline-none hover:text-purple-400 transition"
                >
                  <span className="max-w-[90%] leading-normal">{faq.question}</span>
                  {activeFaq === i ? (
                    <ChevronUp size={16} className="text-purple-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown size={16} className="text-stone-400 shrink-0 ml-2" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-5 text-xs text-stone-300 leading-relaxed font-sans border-t border-white/10 pt-3">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Support Ticket Submission */}
        <div className="lg:col-span-6 bg-stone-900/60 border border-white/10 rounded-2xl p-8 shadow-md relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600" />

          <div className="flex items-center gap-2 mb-6">
            <LifeBuoy className="text-purple-400" size={20} />
            <h3 className="font-serif text-2xl font-bold text-white">File Support Ticket</h3>
          </div>

          <AnimatePresence mode="wait">
            {!ticketCreated ? (
              <motion.form
                key="ticket-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleTicketSubmit}
                className="space-y-4 font-sans"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Your Name</label>
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Registered Email</label>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Inquiry Subject / Topic</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Private Marina Slip Allocation"
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or custom request in details..."
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white/10 transition resize-none text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wider uppercase rounded-lg shadow-md hover:shadow-purple-600/10 transition active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? 'Filing Support Ticket...' : 'File Secure Ticket'}
                  <Send size={12} />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="ticket-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center flex flex-col items-center justify-center h-full text-white"
              >
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/30">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="font-serif text-xl font-bold text-white mb-2">Support Ticket Logged</h4>
                <p className="text-xs text-stone-300 leading-relaxed mb-6 max-w-sm">
                  Ticket logged successfully! Reference number: <span className="font-mono font-bold text-stone-200">{ticketCreated.id}</span>. Our emergency operations department is reviewing your case and will respond within 15 minutes.
                </p>

                <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left space-y-1.5 text-xs text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Subject</span>
                    <span className="font-semibold text-white">{ticketCreated.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Filed By</span>
                    <span className="font-semibold text-white">{ticketCreated.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Ticket Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                      <Ticket size={10} />
                      <span>{ticketCreated.status}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
