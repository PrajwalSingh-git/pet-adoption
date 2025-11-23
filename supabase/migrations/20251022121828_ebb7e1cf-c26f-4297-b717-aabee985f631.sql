-- Add foreign key constraint between liked_pets and pets
ALTER TABLE public.liked_pets
ADD CONSTRAINT liked_pets_pet_id_fkey
FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;