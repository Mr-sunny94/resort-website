/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image_url: string;
  amenities: string[];
  max_guests: number;
  category: 'Suite' | 'Villa' | 'Penthouse' | 'Deluxe';
  available: boolean;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  category?: string;
}

export interface Booking {
  id: string;
  room_id: string;
  room_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  user_email: string;
  user_phone?: string;
  created_at: string;
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  phone?: string;
  fullName?: string;
  avatar_url?: string;
  is_logged_in: boolean;
  provider: 'email' | 'phone' | 'google';
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
}
