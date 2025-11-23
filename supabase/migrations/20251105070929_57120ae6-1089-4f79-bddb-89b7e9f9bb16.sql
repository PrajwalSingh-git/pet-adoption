-- Add ignored status to applications and add auto-deletion tracking
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ignored';

-- Add ignored status and deletion timestamp tracking
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Create function to calculate days remaining before auto-deletion
CREATE OR REPLACE FUNCTION public.calculate_days_until_deletion(deletion_date TIMESTAMP WITH TIME ZONE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT GREATEST(0, EXTRACT(DAY FROM (deletion_date - NOW()))::INTEGER);
$$;

-- Create function to auto-delete old approved/rejected applications
CREATE OR REPLACE FUNCTION public.auto_schedule_application_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When application is approved or rejected, schedule deletion for 7 days later
  IF (NEW.status = 'approved' OR NEW.status = 'rejected') AND 
     (OLD.status != NEW.status OR OLD.status IS NULL) THEN
    NEW.deletion_scheduled_at = NOW() + INTERVAL '7 days';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-scheduling deletion
DROP TRIGGER IF EXISTS schedule_deletion_on_status_change ON applications;
CREATE TRIGGER schedule_deletion_on_status_change
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_schedule_application_deletion();