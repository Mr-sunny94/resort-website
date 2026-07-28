-- ============================================================================
-- MustET Resorts & Sanctuary - Complete Supabase Database Setup Script
-- Paste this script into your Supabase Dashboard -> SQL Editor and click "Run"
-- ============================================================================

-- 1. PROFILES TABLE (User Accounts & Registration)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  username text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ROOMS TABLE (Accommodations & Sanctuary Suites)
create table if not exists public.rooms (
  id text primary key default 'room-' || extract(epoch from now())::text,
  name text not null,
  description text,
  price numeric not null,
  rating numeric default 5.0,
  image_url text not null,
  amenities text[] default '{}',
  max_guests integer default 2,
  category text default 'Suite',
  available boolean default true
);

-- 3. GALLERY TABLE (Visual Chronicles Feed)
create table if not exists public.gallery (
  id text primary key default 'gal-' || extract(epoch from now())::text,
  image_url text not null,
  caption text not null,
  category text default 'Exterior'
);

-- 4. BOOKINGS TABLE (Guest Room Reservations)
create table if not exists public.bookings (
  id text primary key default 'book-' || extract(epoch from now())::text,
  room_id text,
  room_name text not null,
  check_in text not null,
  check_out text not null,
  guests integer not null default 1,
  total_price numeric not null,
  status text not null default 'confirmed',
  user_email text not null,
  user_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. SUPPORT TICKETS TABLE (Guest Assistance Hub)
create table if not exists public.support_tickets (
  id text primary key default 'ticket-' || extract(epoch from now())::text,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.gallery enable row level security;
alter table public.bookings enable row level security;
alter table public.support_tickets enable row level security;

-- Allow public read/write access for application features
drop policy if exists "Public access to profiles" on public.profiles;
create policy "Public access to profiles" on public.profiles for all using (true) with check (true);

drop policy if exists "Public access to rooms" on public.rooms;
create policy "Public access to rooms" on public.rooms for all using (true) with check (true);

drop policy if exists "Public access to gallery" on public.gallery;
create policy "Public access to gallery" on public.gallery for all using (true) with check (true);

drop policy if exists "Public access to bookings" on public.bookings;
create policy "Public access to bookings" on public.bookings for all using (true) with check (true);

drop policy if exists "Public access to support tickets" on public.support_tickets;
create policy "Public access to support tickets" on public.support_tickets for all using (true) with check (true);

-- ============================================================================
-- AUTOMATIC USER REGISTRATION TRIGGER (auth.users -> public.profiles)
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'full_name', 'Valued Guest'),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    username = excluded.username,
    phone = excluded.phone;
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

insert into public.rooms (id, name, description, price, rating, image_url, amenities, max_guests, category, available)
values
  ('room-1', 'Ocean Breeze Suite', 'A beautiful sea-facing suite featuring a private teak balcony, custom mahogany furnishings, and a marble bath with panoramic coastal views.', 320, 4.9, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', ARRAY['Private Balcony', 'Ocean View', 'King Bed', 'Free Wi-Fi', 'Mini Bar', 'Espresso Machine'], 2, 'Suite', true),
  ('room-2', 'Royal Oceanfront Villa', 'An expansive beachfront sanctuary with a private infinity-edge plunge pool, open-air living pavilion, and direct access to pristine white sands.', 650, 5.0, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80', ARRAY['Private Pool', 'Direct Beach Access', 'Personal Butler', 'Outdoor Shower', 'Kitchenette', 'Home Theatre'], 4, 'Villa', true),
  ('room-3', 'Imperial Sun-Deck Penthouse', 'Perched on the highest floor, this residence features a 120-sqm wrapping terrace, fire pit, outdoor jacuzzi, and master bedroom with 270-degree azure sea views.', 980, 4.8, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', ARRAY['Outdoor Jacuzzi', 'Fire Pit', 'Wraparound Terrace', 'Skyline View', '24/7 Dining Service', 'Premium Bar'], 6, 'Penthouse', true),
  ('room-4', 'Deluxe Garden Sanctuary', 'Enveloped by lush tropical gardens, this tranquil sanctuary offers serene botanical views, a rain shower, and a private stone-walled courtyard patio.', 220, 4.7, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', ARRAY['Garden View', 'Stone Patio', 'Rain Shower', 'King Bed', 'Complimentary Breakfast', 'Yoga Mat'], 2, 'Deluxe', true)
on conflict (id) do nothing;

insert into public.gallery (id, image_url, caption, category)
values
  ('gal-1', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80', 'Main Infinity Pool Overlooking the Azure Ocean at Sunset', 'Exterior'),
  ('gal-2', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80', 'Our Luxury Overwater Sunset Bungalows suspended above Lagoon waters', 'Villas'),
  ('gal-3', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80', 'Majestic Palms Framing the Architectural Entrance of MustET Resort', 'Exterior')
on conflict (id) do nothing;
