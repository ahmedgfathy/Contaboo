-- Make sure admin user is properly activated
-- First delete any existing admin users
DELETE FROM public.users WHERE mobile_number = '01002778090';
DELETE FROM auth.users WHERE email = '01002778090@contaboo.local' OR email = 'admin@contaboo.com';

-- Create properly activated admin user
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
);

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
);
