-- Fix search path security issue for handle_application_deletion function
CREATE OR REPLACE FUNCTION handle_application_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update pet status back to 'available' when an application is deleted
  UPDATE pets
  SET status = 'available'
  WHERE id = OLD.pet_id
  AND status != 'available';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;