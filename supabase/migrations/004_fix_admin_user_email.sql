-- Fix admin user to use email-based authentication instead of phone
-- First, delete the existing admin user if it exists
DELETE FROM auth.users WHERE email = 'admin@contaboo.com' OR phone = '01002778090';
DELETE FROM public.users WHERE mobile_number = '01002778090';

-- Create new admin user with email format
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmation_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  '01002778090@contaboo.local',
  crypt('ZeroCall20!@H', gen_salt('bf')),
  NOW(),
  '{"mobile_number": "01002778090", "full_name": "Main Admin", "role": "admin"}'::jsonb,
  true,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = '01002778090@contaboo.local',
  encrypted_password = crypt('ZeroCall20!@H', gen_salt('bf')),
  email_confirmed_at = NOW(),
  raw_user_meta_data = '{"mobile_number": "01002778090", "full_name": "Main Admin", "role": "admin"}'::jsonb,
  is_super_admin = true,
  updated_at = NOW();

-- Create the corresponding public.users record
INSERT INTO public.users (
  id,
  mobile_number,
  full_name,
  role,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '01002778090',
  'Main Admin',
  'admin',
  true
) ON CONFLICT (mobile_number) DO UPDATE SET
  full_name = 'Main Admin',
  role = 'admin',
  is_active = true,
  updated_at = NOW();
