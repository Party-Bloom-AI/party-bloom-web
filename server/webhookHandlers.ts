import { getStripeSync, isOnReplit, getStripeClient } from './stripeClient';
import { storage } from './storage';
import type Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    if (isOnReplit()) {
      const sync = await getStripeSync();
      if (sync) {
        await sync.processWebhook(payload, signature, uuid);
      }
    } else {
      await WebhookHandlers.processWebhookDirect(payload, signature);
    }
  }

  static async processWebhookDirect(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set - webhook signature verification skipped');
    }

    const stripe = await getStripeClient();
    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } else {
        event = JSON.parse(payload.toString()) as Stripe.Event;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error('Webhook signature verification failed');
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await WebhookHandlers.handleSubscriptionEvent(subscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string) as any;
          await WebhookHandlers.handleSubscriptionEvent(subscription);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log('Payment failed for invoice:', invoice.id);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  static async handleSubscriptionEvent(subscription: any): Promise<void> {
    const customerId = subscription.customer as string;
    
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : new Date();

    await storage.updateSubscriptionByStripeId(subscription.id, {
      status: subscription.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  static async handleSubscriptionUpdated(subscriptionId: string, customerId: string, status: string, currentPeriodEnd: Date, cancelAtPeriodEnd: boolean) {
    await storage.updateSubscriptionByStripeId(subscriptionId, {
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    });
  }
}
