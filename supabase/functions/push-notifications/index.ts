// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://deno.land/x/webpush/mod.ts';

const WEB_PUSH_CONTACT = Deno.env.get('VAPID_CONTACT_EMAIL')!;
const VAPID_PUBLIC_KEY = Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

// Configure web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your contact email
  Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY')!,
  VAPID_PRIVATE_KEY
);

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

async function handleSubscribe(supabaseClient: SupabaseClient, req: Request) {
  const { subscription } = await req.json();
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const { error } = await supabaseClient
    .from('push_subscriptions')
    .insert({ user_id: user.id, subscription: subscription });

  if (error) throw error;

  return new Response(JSON.stringify({ message: 'Subscribed successfully' }), { status: 201 });
}

async function handleSend(supabaseClient: SupabaseClient, req: Request) {
  const { payload } = await req.json(); // e.g., { title: 'New Order!', body: 'Order #123 has been placed.' }

  // Call the secure database function to get ONLY admin subscriptions
  const { data: subs, error } = await supabaseClient.rpc('get_admin_push_subscriptions');

  if (error) throw error;
  if (!subs) return new Response(JSON.stringify({ message: 'No admin subscriptions found' }), { status: 200 });

  const notificationPromises = subs.map(item =>
    webpush.sendNotification(item.subscription as unknown as PushSubscription, JSON.stringify(payload))
  );

  await Promise.all(notificationPromises);

  return new Response(JSON.stringify({ message: 'Notifications sent' }), { status: 200 });
}

serve(async (req) => {
  const { url } = req;
  const urlPattern = new URLPattern({ pathname: '/:slug' });
  const matchingUrl = urlPattern.exec(url);
  const slug = matchingUrl ? matchingUrl.pathname.groups.slug : null;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    switch (slug) {
      case 'subscribe':
        return await handleSubscribe(supabaseClient, req);
      case 'send':
        // Note: For production, this endpoint should be secured, e.g., only callable by a trusted service or another Supabase function.
        return await handleSend(supabaseClient, req);
      default:
        return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 