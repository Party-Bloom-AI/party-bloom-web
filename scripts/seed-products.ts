import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Checking for existing Party Bloom subscription product...');
  
  const existingProducts = await stripe.products.search({
    query: "name:'Party Bloom Monthly Subscription'"
  });

  if (existingProducts.data.length > 0) {
    console.log('Product already exists:', existingProducts.data[0].id);
    const prices = await stripe.prices.list({
      product: existingProducts.data[0].id,
      active: true
    });
    console.log('Existing prices:', prices.data.map(p => ({
      id: p.id,
      amount: p.unit_amount,
      currency: p.currency,
      interval: p.recurring?.interval
    })));
    return;
  }

  console.log('Creating Party Bloom subscription product...');
  
  const product = await stripe.products.create({
    name: 'Party Bloom Monthly Subscription',
    description: 'Full access to AI-powered party planning with unlimited theme generations, moodboards, and shopping lists.',
    metadata: {
      app: 'party-bloom',
      type: 'subscription'
    }
  });

  console.log('Created product:', product.id);

  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 2000,
    currency: 'cad',
    recurring: {
      interval: 'month',
      trial_period_days: 30
    },
    metadata: {
      app: 'party-bloom',
      plan: 'monthly'
    }
  });

  console.log('Created monthly price:', monthlyPrice.id);
  console.log('Price: $20.00 CAD/month with 30-day free trial');
  console.log('\nDone! Product and price have been created in Stripe.');
}

createProducts().catch(console.error);
