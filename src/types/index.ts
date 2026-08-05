export type ResortRoom = {
  id: string;
  room_name: string;
  capacity: number;
  view_type: string;
  is_active: boolean;
  created_at: string;
};

export type FeaturedAmenity = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type Reservation = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  guests_count: number;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests: string | null;
  created_at: string;
  resort_rooms?: ResortRoom; // for joins
};

export type ReceptionHour = {
  id: string;
  weekday: number; // 0-6
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type BlockedDate = {
  id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
};

export type ResortSettings = {
  id: string;
  resort_name: string;
  resort_email: string;
  resort_phone: string;
  resort_address: string;
  check_in_time: string;
  check_out_time: string;
  min_stay_nights: number;
  max_guests_per_booking: number;
  resort_logo_url?: string;
  atmosphere_media_url?: string;
  atmosphere_media_type?: 'image' | 'video';
  created_at: string;
};

export type ResortGallery = {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type AdminUser = {
  id: string;
  user_id: string;
  created_at: string;
};
