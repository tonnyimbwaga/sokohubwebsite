-- Function to get push subscriptions for admin users only
CREATE OR REPLACE FUNCTION get_admin_push_subscriptions()
RETURNS TABLE (subscription JSONB)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT ps.subscription
    FROM public.push_subscriptions ps
    JOIN auth.users u ON ps.user_id = u.id
    WHERE u.raw_user_meta_data->>'role' = 'admin';
$$; 