-- First, let's create the main admin user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
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
  'admin@contaboo.com',
  '$2a$10$ZRXz8QJ5N5Z5N5Z5N5Z5NuQJ5N5Z5N5Z5N5Z5N5Z5N5Z5N5Z5N5Z5O', -- This will be updated
  NOW(),
  '01002778090',
  NOW(),
  '{"mobile_number": "01002778090", "full_name": "Main Admin", "role": "admin"}'::jsonb,
  true,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (phone) DO UPDATE SET
  encrypted_password = '$2a$10$ZRXz8QJ5N5Z5N5Z5N5Z5NuQJ5N5Z5N5Z5N5Z5N5Z5N5Z5N5Z5N5Z5O',
  email_confirmed_at = NOW(),
  phone_confirmed_at = NOW(),
  raw_user_meta_data = '{"mobile_number": "01002778090", "full_name": "Main Admin", "role": "admin"}'::jsonb,
  is_super_admin = true,
  updated_at = NOW();

-- Now let's properly hash and update the password
UPDATE auth.users 
SET encrypted_password = crypt('ZeroCall20!@H', gen_salt('bf'))
WHERE phone = '01002778090';

-- Make sure the user record exists in public.users
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
) ON CONFLICT (id) DO UPDATE SET
  mobile_number = '01002778090',
  full_name = 'Main Admin',
  role = 'admin',
  is_active = true,
  updated_at = NOW();
