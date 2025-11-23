-- Add rejection_reason column to applications table
ALTER TABLE applications ADD COLUMN rejection_reason TEXT;

-- Add rejection_reason column to application_history table
ALTER TABLE application_history ADD COLUMN rejection_reason TEXT;

-- Update the archive_application function to include rejection_reason
CREATE OR REPLACE FUNCTION public.archive_application()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      rejected_at,
      rejection_reason
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
      NEW.rejected_at,
      NEW.rejection_reason
    );
  END IF;
  
  RETURN NEW;
END;
$function$;