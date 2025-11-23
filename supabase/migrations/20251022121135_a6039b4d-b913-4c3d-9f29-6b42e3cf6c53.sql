-- Create liked_pets table for users to save their favorite pets
CREATE TABLE IF NOT EXISTS public.liked_pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, pet_id)
);

-- Enable RLS
ALTER TABLE public.liked_pets ENABLE ROW LEVEL SECURITY;

-- Users can view their own liked pets
CREATE POLICY "Users can view own liked pets"
ON public.liked_pets
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add pets to their liked list
CREATE POLICY "Users can add liked pets"
ON public.liked_pets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove pets from their liked list
CREATE POLICY "Users can remove liked pets"
ON public.liked_pets
FOR DELETE
USING (auth.uid() = user_id);