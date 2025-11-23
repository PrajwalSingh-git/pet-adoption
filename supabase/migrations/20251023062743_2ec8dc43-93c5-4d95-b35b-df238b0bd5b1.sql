-- Add RLS policy to allow adopters to delete their own applications
CREATE POLICY "Adopters can delete own applications"
ON applications
FOR DELETE
TO authenticated
USING (auth.uid() = adopter_id);

-- Create function to update pet status when application is deleted
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for application deletion
CREATE TRIGGER on_application_delete
  BEFORE DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_application_deletion();