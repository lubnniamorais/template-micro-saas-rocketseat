import { NextResponse, type NextRequest } from 'next/server';

import stripe from '@/app/lib/stripe';
import { auth } from '@/app/lib/auth';
import { getOrCreateCustomer } from '@/app/server/stripe/get-customer-id';

export async function POST(req: NextRequest) {
  const { testId } = await req.json();

  const price = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

  if (!price) {
    return NextResponse.json({ error: 'Price ID not found' }, { status: 500 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.id;

  if (!userId || !userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerId = await getOrCreateCustomer(userId, userEmail);

  const metadata = {
    testId,
  };

  // Precisamos criar um cliente na STRIPE para ter referência dele quando for criar o portal

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      payment_method_types: ['card'],
      success_url: `${req.headers.get('origin')}/success`,
      cancel_url: `${req.headers.get('origin')}/`,
      metadata,
      // customer
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Session URL not found' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
