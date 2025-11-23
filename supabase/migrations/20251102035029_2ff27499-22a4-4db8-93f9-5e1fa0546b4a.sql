-- Add approved_at timestamp to applications table
ALTER TABLE applications ADD COLUMN approved_at timestamp with time zone;

-- Add theme preference to profiles table
ALTER TABLE profiles ADD COLUMN theme_preference text DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark'));

-- Create messages table for chat between users and shelters
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages for their applications"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = messages.application_id
    AND (applications.adopter_id = auth.uid() OR applications.shelter_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages for their applications"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = messages.application_id
    AND (applications.adopter_id = auth.uid() OR applications.shelter_id = auth.uid())
  )
);

-- Update application status trigger to set approved_at
CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = now();
  ELSIF NEW.status != 'approved' THEN
    NEW.approved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_approved_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION set_approved_at();