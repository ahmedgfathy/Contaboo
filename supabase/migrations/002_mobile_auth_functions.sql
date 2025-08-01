-- Create function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.users),
    'total_agents', (SELECT COUNT(*) FROM public.agents),
    'total_clients', (SELECT COUNT(*) FROM public.clients),
    'total_properties', (SELECT COUNT(*) FROM public.properties),
    'available_properties', (SELECT COUNT(*) FROM public.properties WHERE status = 'available'),
    'sold_properties', (SELECT COUNT(*) FROM public.properties WHERE status = 'sold'),
    'total_transactions', (SELECT COUNT(*) FROM public.transactions),
    'pending_transactions', (SELECT COUNT(*) FROM public.transactions WHERE status = 'pending'),
    'completed_transactions', (SELECT COUNT(*) FROM public.transactions WHERE status = 'completed')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-confirm users (skip email confirmation)
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the user
  NEW.email_confirmed_at = NOW();
  NEW.phone_confirmed_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- Create function to handle mobile-based authentication
CREATE OR REPLACE FUNCTION authenticate_user_by_mobile(mobile_num TEXT, user_password TEXT)
RETURNS JSON AS $$
DECLARE
  user_record auth.users%ROWTYPE;
  user_data public.users%ROWTYPE;
  result JSON;
BEGIN
  -- Find user by mobile number
  SELECT * INTO user_record 
  FROM auth.users 
  WHERE phone = mobile_num;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Get additional user data
  SELECT * INTO user_data
  FROM public.users
  WHERE id = user_record.id;
  
  RETURN json_build_object(
    'success', true,
    'user_id', user_record.id,
    'mobile_number', user_data.mobile_number,
    'full_name', user_data.full_name,
    'role', user_data.role,
    'is_active', user_data.is_active
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create user with mobile number
CREATE OR REPLACE FUNCTION create_user_with_mobile(
  mobile_num TEXT,
  user_password TEXT,
  user_full_name TEXT DEFAULT '',
  user_role user_role DEFAULT 'client'
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
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
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    mobile_num || '@contaboo.local', -- Create a dummy email
    crypt(user_password, gen_salt('bf')),
    NOW(),
    mobile_num,
    NOW(),
    json_build_object(
      'mobile_number', mobile_num,
      'full_name', user_full_name,
      'role', user_role
    ),
    false,
    NOW(),
    NOW()
  ) RETURNING id INTO new_user_id;
  
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully'
  );
  
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Mobile number already exists'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error creating user: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow mobile-based authentication
DROP POLICY IF EXISTS "Mobile auth users can be selected" ON public.users;
CREATE POLICY "Mobile auth users can be selected" ON public.users
  FOR SELECT USING (true);

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user_by_mobile(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_user_with_mobile(TEXT, TEXT, TEXT, user_role) TO anon;
