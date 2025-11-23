-- Fix function search path issue
DROP TRIGGER IF EXISTS update_approved_at ON applications;
DROP FUNCTION IF EXISTS set_approved_at();

CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = now();
  ELSIF NEW.status != 'approved' THEN
    NEW.approved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_approved_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION set_approved_at();