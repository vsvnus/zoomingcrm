-- Migration: Fix Signup RLS
-- Allows authenticated users to create organizations and user profiles.

-- 1. Organizations: Allow INSERT
-- Note: 'auth.uid() IS NOT NULL' ensures only authenticated users (even if just signed up) can create orgs.
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations" ON public.organizations
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Users: Allow INSERT (their own profile)
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
CREATE POLICY "Users can create their own profile" ON public.users
FOR INSERT 
WITH CHECK (id = auth.uid()::text); 
