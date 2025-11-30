import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Checking for existing Party Bloom subscription product...');
  
  const existingProducts = await stripe.products.search({
    query: "name:'Party Bloom Monthly Subscription'"
  });

  let productId: string;

  if (existingProducts.data.length > 0) {
    productId = existingProducts.data[0].id;
    console.log('Product already exists:', productId);
    
    const prices = await stripe.prices.list({
      product: productId,
      active: true
    });
    
    console.log('Existing prices:', prices.data.map(p => ({
      id: p.id,
      amount: p.unit_amount,
      currency: p.currency,
      interval: p.recurring?.interval
    })));

    const has2CadPrice = prices.data.some(p => p.unit_amount === 200 && p.currency === 'cad');
    
    if (has2CadPrice) {
      console.log('$2 CAD price already exists. No changes needed.');
      return;
    }

    for (const price of prices.data) {
      if (price.unit_amount !== 200) {
        console.log(`Archiving old price: ${price.id} ($${(price.unit_amount || 0) / 100} ${price.currency})`);
        await stripe.prices.update(price.id, { active: false });
      }
    }
  } else {
    console.log('Creating Party Bloom subscription product...');
    
    const product = await stripe.products.create({
      name: 'Party Bloom Monthly Subscription',
      description: 'Full access to AI-powered party planning with unlimited theme generations, moodboards, and shopping lists.',
      metadata: {
        app: 'party-bloom',
        type: 'subscription'
      }
    });

    productId = product.id;
    console.log('Created product:', productId);
  }

  const monthlyPrice = await stripe.prices.create({
    product: productId,
    unit_amount: 200,
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
  console.log('Price: $2.00 CAD/month with 30-day free trial');
  console.log('\nDone! Product and price have been updated in Stripe.');
}

createProducts().catch(console.error);
