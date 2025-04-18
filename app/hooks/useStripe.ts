import { useEffect, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';

export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    async function loadStripeAsync() {
      if (!process.env.NEXT_PUBLIC_STRIPE_PUB_KEY) {
        throw new Error(
          'Stripe public key is not defined in environment variables'
        );
      }

      const stripeInstance = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUB_KEY
      );
      setStripe(stripeInstance);
    }
  }, []);

  async function createPaymentStripeCheckout(checkoutData: any) {
    if (!stripe) {
      throw new Error('Stripe is not loaded');
    }

    try {
      const response = await fetch('/api/stripe/create-pay-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      console.log(error);
    }
  }

  async function createSubscriptionStripeCheckout(checkoutData: any) {
    if (!stripe) {
      throw new Error('Stripe is not loaded');
    }

    try {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleCreateStripePortal() {
    const response = await fetch('/api/stripe/create-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    window.location.href = data.url;
  }

  return {
    createPaymentStripeCheckout,
    createSubscriptionStripeCheckout,
    handleCreateStripePortal,
  };
}
