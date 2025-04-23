-- Migration to create profiles table and link to auth.users

-- 1. Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NULL,
  role TEXT DEFAULT 'viewer' NOT NULL, -- Example default role
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Add comments
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';
COMMENT ON COLUMN public.profiles.id IS 'Links to auth.users table.';
COMMENT ON COLUMN public.profiles.email IS 'User''s email, kept in sync potentially.';
COMMENT ON COLUMN public.profiles.full_name IS 'User''s full name.';
COMMENT ON COLUMN public.profiles.role IS 'User role for authorization purposes.';

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Policy: Allow users to view their own profile
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to view all profiles (adjust role as needed)
-- WARNING: Be careful with this policy. Restrict to admin roles in a real app.
CREATE POLICY "Authenticated users can view all profiles." ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated'); -- Or check for a specific admin role

-- ADDED POLICY: Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Allow admin users to insert profiles (Needs adjustment based on how you handle sign-up)
-- If using auth.signUp, you might need a trigger or function instead.
-- This example assumes an admin role might insert directly.
-- CREATE POLICY "Admins can insert profiles." ON public.profiles
--   FOR INSERT WITH CHECK (is_admin(auth.uid())); -- Requires an is_admin function

-- 4. Set up trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_profile_update();

-- 5. Consider a trigger to sync email from auth.users on insert/update if needed
-- (This is an alternative/more robust way to create profiles than client-side insert)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, full_name, role) -- Add default fields if needed
--   VALUES (NEW.id, NEW.email, NULL, 'viewer'); -- Set defaults
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- 
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 