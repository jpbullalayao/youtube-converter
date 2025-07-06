import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event;

  try {
    const stripe = getServerStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { videoInfo, format, quality, url } = session.metadata || {};

    console.log('Payment successful for:', {
      sessionId: session.id,
      videoInfo: videoInfo ? JSON.parse(videoInfo) : null,
      format,
      quality,
      url,
    });

    // Here you would typically trigger the download process
    // For now, we'll just log the successful payment
  }

  return NextResponse.json({ received: true });
}