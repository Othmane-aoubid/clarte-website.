import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook Error: signature verification failed`, { status: 400 })
  }

  try {
    await fetch(`${process.env.INTERNAL_API_URL}/api/v1/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify(event),
    })
  } catch (err) {
    // Log internally but still return 200 to Stripe to prevent retries on forwarding errors
    console.error('Failed to forward webhook to backend:', err.message)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
