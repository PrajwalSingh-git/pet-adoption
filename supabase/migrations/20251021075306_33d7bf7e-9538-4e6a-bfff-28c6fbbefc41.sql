-- Create app_role enum for user types
CREATE TYPE public.app_role AS ENUM ('admin', 'shelter', 'adopter');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL,
  phone TEXT,
  address TEXT,
  shelter_name TEXT,
  shelter_description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_roles table for authorization
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  size TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted')),
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on pets
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Pets policies
CREATE POLICY "Anyone can view available pets"
  ON public.pets FOR SELECT
  USING (true);

CREATE POLICY "Shelters can insert own pets"
  ON public.pets FOR INSERT
  WITH CHECK (auth.uid() = shelter_id);

CREATE POLICY "Shelters can update own pets"
  ON public.pets FOR UPDATE
  USING (auth.uid() = shelter_id);

CREATE POLICY "Shelters can delete own pets"
  ON public.pets FOR DELETE
  USING (auth.uid() = shelter_id);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  adopter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shelter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Adopters can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = adopter_id);

CREATE POLICY "Shelters can view applications for their pets"
  ON public.applications FOR SELECT
  USING (auth.uid() = shelter_id);

CREATE POLICY "Adopters can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = adopter_id);

CREATE POLICY "Shelters can update applications for their pets"
  ON public.applications FOR UPDATE
  USING (auth.uid() = shelter_id);

-- Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((new.raw_user_meta_data->>'role')::app_role, 'adopter')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'role')::app_role, 'adopter')
  );
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true);

-- Storage policies for pet photos
CREATE POLICY "Anyone can view pet photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-photos');

CREATE POLICY "Authenticated users can upload pet photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own pet photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own pet photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);