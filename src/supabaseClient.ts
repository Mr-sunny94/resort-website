/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Room, GalleryImage, Booking, User, SupportTicket } from './types';

// Read credentials from environment variables
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholderValue = (val: string): boolean => {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return (
    lower.includes('your_supabase_url') ||
    lower.includes('your-project-id') ||
    lower.includes('your-supabase-anon-key') ||
    lower.includes('my_supabase') ||
    lower.includes('example.com')
  );
};

// Determine if we should use the real Supabase client
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !isPlaceholderValue(SUPABASE_URL) && 
  !isPlaceholderValue(SUPABASE_ANON_KEY)
);

export const supabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Default high-quality room images from Unsplash (Luxury resorts)
const DEFAULT_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Ocean Breeze Suite',
    description: 'A beautiful sea-facing suite featuring a private teak balcony, custom mahogany furnishings, and a marble bath with panoramic coastal views.',
    price: 320,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Private Balcony', 'Ocean View', 'King Bed', 'Free Wi-Fi', 'Mini Bar', 'Espresso Machine'],
    max_guests: 2,
    category: 'Suite',
    available: true
  },
  {
    id: 'room-2',
    name: 'Royal Oceanfront Villa',
    description: 'An expansive beachfront sanctuary with a private infinity-edge plunge pool, open-air living pavilion, and direct access to pristine white sands.',
    price: 650,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Private Pool', 'Direct Beach Access', 'Personal Butler', 'Outdoor Shower', 'Kitchenette', 'Home Theatre'],
    max_guests: 4,
    category: 'Villa',
    available: true
  },
  {
    id: 'room-3',
    name: 'Imperial Sun-Deck Penthouse',
    description: 'Perched on the highest floor, this residence features a 120-sqm wrapping terrace, fire pit, outdoor jacuzzi, and master bedroom with 270-degree azure sea views.',
    price: 980,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Outdoor Jacuzzi', 'Fire Pit', 'Wraparound Terrace', 'Skyline View', '24/7 Dining Service', 'Premium Bar'],
    max_guests: 6,
    category: 'Penthouse',
    available: true
  },
  {
    id: 'room-4',
    name: 'Deluxe Garden Sanctuary',
    description: 'Enveloped by lush tropical gardens, this tranquil sanctuary offers serene botanical views, a rain shower, and a private stone-walled courtyard patio.',
    price: 220,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Garden View', 'Stone Patio', 'Rain Shower', 'King Bed', 'Complimentary Breakfast', 'Yoga Mat'],
    max_guests: 2,
    category: 'Deluxe',
    available: true
  },
  {
    id: 'room-5',
    name: 'Overwater Sunset Pavilion',
    description: 'Suspended above the turquoise lagoon, this villa features glass-bottom floor view panels, a private hammock over the water, and steps directly into the sea.',
    price: 780,
    rating: 4.95,
    image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Glass Floor Panels', 'Lagoon Access', 'Overwater Hammock', 'Sunset Facing', 'iPad Controls', 'Deep Soak Tub'],
    max_guests: 3,
    category: 'Villa',
    available: true
  },
  {
    id: 'room-6',
    name: 'Presidential Lagoon Suite',
    description: 'The epitome of grandeur. Split-level quarters with private docks, multi-room layouts, grand piano, and curated original local artwork throughout.',
    price: 1250,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Private Boat Dock', 'Grand Piano', 'In-Villa Spa Room', 'Wine Cellar', 'Chef Service', 'Sauna'],
    max_guests: 8,
    category: 'Suite',
    available: true
  }
];

// Default gallery images (must match what's used for looping background)
const DEFAULT_GALLERY: GalleryImage[] = [
  {
    id: 'gal-1',
    image_url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80',
    caption: 'Main Infinity Pool Overlooking the Azure Ocean at Sunset',
    category: 'Exterior'
  },
  {
    id: 'gal-2',
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
    caption: 'Our Luxury Overwater Sunset Bungalows suspended above Lagoon waters',
    category: 'Villas'
  },
  {
    id: 'gal-3',
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    caption: 'Majestic Palms Framing the Architectural Entrance of MustET Resort',
    category: 'Exterior'
  },
  {
    id: 'gal-4',
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80',
    caption: 'The Master Bed Suite design in the Imperial Penthouse',
    category: 'Interior'
  },
  {
    id: 'gal-5',
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80',
    caption: 'Lounge Cabanas next to the serene salt-water sanctuary pool',
    category: 'Amenities'
  },
  {
    id: 'gal-6',
    image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1600&q=80',
    caption: 'Crystal-clear Turquoise Waters surrounding the Private Resort Peninsula',
    category: 'Exterior'
  }
];

// LocalStorage helpers for the mock engine
const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to set local data', e);
  }
};

// Initialize mock storage if not present
if (!localStorage.getItem('mustet_rooms')) {
  setLocalData('mustet_rooms', DEFAULT_ROOMS);
}
if (!localStorage.getItem('mustet_gallery')) {
  setLocalData('mustet_gallery', DEFAULT_GALLERY);
}
if (!localStorage.getItem('mustet_bookings')) {
  setLocalData('mustet_bookings', []);
}
if (!localStorage.getItem('mustet_tickets')) {
  setLocalData('mustet_tickets', []);
}
if (!localStorage.getItem('mustet_users')) {
  // Pre-seed a default user
  setLocalData('mustet_users', [
    {
      id: 'usr-default',
      email: 'guest@mustet.com',
      username: 'guest',
      phone: '+15550199',
      fullName: 'John Guest',
      password: 'password123', // Encrypted/hashed in real, simple text for mock
    }
  ]);
}

// Unified Database and Service API
export const dbService = {
  // --- ROOMS ---
  async getRooms(): Promise<Room[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.from('rooms').select('*').order('price', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Room[];
      }
    }
    return getLocalData<Room[]>('mustet_rooms', DEFAULT_ROOMS);
  },

  async addRoom(room: Omit<Room, 'id'>): Promise<Room> {
    const newRoom: Room = {
      ...room,
      id: `room-${Date.now()}`
    };
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.from('rooms').insert(newRoom).select().single();
      if (!error && data) return data as Room;
    }
    const currentRooms = getLocalData<Room[]>('mustet_rooms', DEFAULT_ROOMS);
    const updated = [...currentRooms, newRoom];
    setLocalData('mustet_rooms', updated);
    return newRoom;
  },

  // --- GALLERY ---
  async getGallery(): Promise<GalleryImage[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.from('gallery').select('*');
      if (!error && data && data.length > 0) {
        return data as GalleryImage[];
      }
    }
    return getLocalData<GalleryImage[]>('mustet_gallery', DEFAULT_GALLERY);
  },

  async addGalleryImage(url: string, caption: string, category: string = 'Exterior'): Promise<GalleryImage> {
    const newImage: GalleryImage = {
      id: `gal-${Date.now()}`,
      image_url: url,
      caption,
      category
    };
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.from('gallery').insert({
        image_url: url,
        caption,
        category
      }).select().single();
      if (!error && data) return data as GalleryImage;
    }
    const current = getLocalData<GalleryImage[]>('mustet_gallery', DEFAULT_GALLERY);
    const updated = [newImage, ...current];
    setLocalData('mustet_gallery', updated);
    return newImage;
  },

  // --- BOOKINGS ---
  async getBookings(email: string): Promise<Booking[]> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('bookings').select('*').ilike('user_email', email);
        if (!error && data) return data as Booking[];
        if (error) console.error('[Supabase DB Error] getBookings:', error.message);
      } catch (err) {
        console.error('[Supabase DB Exception] getBookings:', err);
      }
    }
    const bookings = getLocalData<Booking[]>('mustet_bookings', []);
    return bookings.filter(b => b.user_email.toLowerCase() === email.toLowerCase());
  },

  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'status'>): Promise<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: `book-${Date.now()}`,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const payload: Record<string, any> = {
          id: newBooking.id,
          room_id: newBooking.room_id,
          room_name: newBooking.room_name,
          check_in: newBooking.check_in,
          check_out: newBooking.check_out,
          guests: newBooking.guests,
          total_price: newBooking.total_price,
          status: newBooking.status,
          user_email: newBooking.user_email,
          created_at: newBooking.created_at
        };
        if (newBooking.user_phone) {
          payload.user_phone = newBooking.user_phone;
        }

        const { data, error } = await supabaseClient.from('bookings').insert(payload).select().single();
        if (!error && data) {
          console.log('[Supabase DB] Booking inserted successfully:', data);
          return data as Booking;
        }
        if (error) {
          console.error('[Supabase DB Error] createBooking:', error.message, error.details, error.hint);
        }
      } catch (err) {
        console.error('[Supabase DB Exception] createBooking:', err);
      }
    }

    const bookings = getLocalData<Booking[]>('mustet_bookings', []);
    const updated = [newBooking, ...bookings];
    setLocalData('mustet_bookings', updated);
    return newBooking;
  },

  async cancelBooking(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error } = await supabaseClient.from('bookings').update({ status: 'cancelled' }).eq('id', id);
        if (!error) return true;
        if (error) console.error('[Supabase DB Error] cancelBooking:', error.message);
      } catch (err) {
        console.error('[Supabase DB Exception] cancelBooking:', err);
      }
    }
    const bookings = getLocalData<Booking[]>('mustet_bookings', []);
    const updated = bookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b);
    setLocalData('mustet_bookings', updated);
    return true;
  },

  // --- SUPPORT ---
  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at' | 'status'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      status: 'open',
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.from('support_tickets').insert(newTicket).select().single();
      if (!error && data) return data as SupportTicket;
    }
    const tickets = getLocalData<SupportTicket[]>('mustet_tickets', []);
    const updated = [newTicket, ...tickets];
    setLocalData('mustet_tickets', updated);
    return newTicket;
  }
};
