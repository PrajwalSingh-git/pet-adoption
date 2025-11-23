-- Add rejected_at column to applications table
ALTER TABLE applications ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;

-- Create application_history table for persistent records
CREATE TABLE public.application_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  pet_name TEXT NOT NULL,
  adopter_id UUID NOT NULL,
  adopter_name TEXT NOT NULL,
  shelter_id UUID NOT NULL,
  shelter_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on application_history
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;

-- Shelters can view their application history
CREATE POLICY "Shelters can view their application history"
ON public.application_history
FOR SELECT
USING (auth.uid() = shelter_id);

-- Adopters can view their application history
CREATE POLICY "Adopters can view their application history"
ON public.application_history
FOR SELECT
USING (auth.uid() = adopter_id);

-- Only admins can delete application history
CREATE POLICY "Only admins can delete application history"
ON public.application_history
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Function to archive application when status changes to approved/rejected
CREATE OR REPLACE FUNCTION public.archive_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pet_data RECORD;
  adopter_data RECORD;
  shelter_data RECORD;
BEGIN
  -- Only archive when status changes to approved or rejected
  IF (NEW.status = 'approved' OR NEW.status = 'rejected') AND 
     (OLD.status != NEW.status OR OLD.status IS NULL) THEN
    
    -- Get pet details
    SELECT name INTO pet_data FROM pets WHERE id = NEW.pet_id;
    
    -- Get adopter details
    SELECT full_name INTO adopter_data FROM profiles WHERE id = NEW.adopter_id;
    
    -- Get shelter details
    SELECT full_name, shelter_name INTO shelter_data FROM profiles WHERE id = NEW.shelter_id;
    
    -- Insert into history
    INSERT INTO application_history (
      application_id,
      pet_id,
      pet_name,
      adopter_id,
      adopter_name,
      shelter_id,
      shelter_name,
      message,
      status,
      applied_at,
      approved_at,
      rejected_at
    ) VALUES (
      NEW.id,
      NEW.pet_id,
      pet_data.name,
      NEW.adopter_id,
      adopter_data.full_name,
      NEW.shelter_id,
      COALESCE(shelter_data.shelter_name, shelter_data.full_name),
      NEW.message,
      NEW.status,
      NEW.created_at,
      NEW.approved_at,
      NEW.rejected_at
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for archiving applications
CREATE TRIGGER archive_application_trigger
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION archive_application();

-- Update set_approved_at function to also handle rejected_at
CREATE OR REPLACE FUNCTION public.set_approved_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = now();
    NEW.rejected_at = NULL;
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    NEW.rejected_at = now();
    NEW.approved_at = NULL;
  ELSIF NEW.status = 'pending' THEN
    NEW.approved_at = NULL;
    NEW.rejected_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;