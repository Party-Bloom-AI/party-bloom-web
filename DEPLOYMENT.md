# Party Bloom - External Deployment Guide

This guide explains how to deploy Party Bloom for free outside of Replit.

## How Authentication Works

Party Bloom uses **Clerk** for authentication. This means:
- Users can log in with **Google, GitHub, Apple, Microsoft, or email/password**
- Authentication is managed by Clerk's hosted service
- Works seamlessly on any hosting platform
- No complex OAuth setup required

## Prerequisites

Before deploying, you'll need:

1. **Clerk Account** - Sign up at [clerk.com](https://clerk.com) (free tier available)
   - Create a new application in Clerk Dashboard
   - Get your **Publishable Key** (starts with `pk_`)
   - Get your **Secret Key** (starts with `sk_`)

2. **SESSION_SECRET** - A random 32+ character string. Generate one:
   ```bash
   openssl rand -hex 32
   ```

3. **Stripe Keys** - From your Stripe Dashboard:
   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLIC_KEY` (publishable key)

---

## Option 1: Railway (Recommended)

Railway offers $5 free credit per month - usually enough for a small app.

### Step 1: Push to GitHub

1. Create a new repository on GitHub.com
2. In Replit, open the Shell and run:
   ```bash
   git remote add github https://github.com/YOUR_USERNAME/party-bloom.git
   git push github main
   ```

### Step 2: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (free)

### Step 3: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your Party Bloom repository
4. Click **"Add variables"** before deploying

### Step 4: Add PostgreSQL Database

1. In your project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates and connects the database

### Step 5: Configure Environment Variables

Click on your web service → **Variables** tab → Add these:

| Variable | Value |
|----------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key (pk_...) |
| `CLERK_SECRET_KEY` | Your Clerk secret key (sk_...) |
| `SESSION_SECRET` | Random 32+ char string |
| `NODE_ENV` | `production` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_live_... or sk_test_...) |
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (pk_live_... or pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Step 9 (whsec_...) |

**Note:** `DATABASE_URL` is automatically set by Railway when you add PostgreSQL.

### Step 6: Configure Clerk Redirect URLs

In your Clerk Dashboard → **Configure** → **Paths**:
1. Add your Railway URL to **Allowed Origins**: `https://your-app.up.railway.app`
2. Add redirect URLs for sign-in/sign-up flows

### Step 7: Configure Build Settings

1. Click on your service → **Settings** tab
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `npm run start`

### Step 8: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Get your URL from the **Settings** tab (e.g., `party-bloom-production.up.railway.app`)

### Step 9: Configure Stripe Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter endpoint URL: `https://YOUR_RAILWAY_URL/api/stripe/webhook/external`
4. Select events to listen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`)
7. Add it to Railway as `STRIPE_WEBHOOK_SECRET`

---

## Option 2: Render

Render offers free web services and a free PostgreSQL database.

### Step 1: Push to GitHub (same as above)

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 3: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Name: `party-bloom-db`
3. Region: Choose closest to your users
4. Plan: **Free**
5. Click **"Create Database"**
6. Copy the **"External Database URL"**

### Step 4: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `party-bloom`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

### Step 5: Add Environment Variables

In the web service settings, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | PostgreSQL External URL from Step 3 |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |
| `CLERK_SECRET_KEY` | Your Clerk secret key |
| `SESSION_SECRET` | Random 32+ char string |
| `NODE_ENV` | `production` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (whsec_...) |

### Step 6: Configure Clerk

In Clerk Dashboard, add your Render URL to allowed origins.

### Step 7: Deploy

Click **"Create Web Service"** and wait for deployment.

### Step 8: Configure Stripe Webhook

Same as Railway Step 9, but use your Render URL:
`https://YOUR_RENDER_URL/api/stripe/webhook/external`

---

## Option 3: Fly.io

Fly.io offers a generous free tier with global deployment.

### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Sign Up and Login

```bash
fly auth signup
# or
fly auth login
```

### Step 3: Launch App

```bash
cd party-bloom
fly launch
```

When prompted:
- App name: `party-bloom` (or your choice)
- Region: Choose closest to your users
- PostgreSQL: **Yes, create a new one** (Development - free)
- Redis: No

### Step 4: Set Environment Variables

```bash
fly secrets set VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
fly secrets set CLERK_SECRET_KEY=sk_live_xxx
fly secrets set SESSION_SECRET=your-random-secret
fly secrets set NODE_ENV=production
fly secrets set STRIPE_SECRET_KEY=sk_live_xxx
fly secrets set STRIPE_PUBLISHABLE_KEY=pk_live_xxx
fly secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Step 5: Configure Clerk

In Clerk Dashboard, add your Fly.io URL (`https://party-bloom.fly.dev`) to allowed origins.

### Step 6: Deploy

```bash
fly deploy
```

### Step 7: Get Your URL

```bash
fly open
```

Your app is at `https://party-bloom.fly.dev`

---

## Clerk Dashboard Setup

After deploying to any platform, configure Clerk:

### 1. Add Allowed Origins

In Clerk Dashboard → **Configure** → **Paths**:
- Add your production URL (e.g., `https://party-bloom.up.railway.app`)

### 2. Configure Social Login (Optional)

In Clerk Dashboard → **User & Authentication** → **Social Connections**:
- Enable Google, GitHub, Apple, or other providers
- Follow Clerk's guide for each provider's OAuth setup

### 3. Customize Appearance (Optional)

In Clerk Dashboard → **Customization**:
- Upload your logo
- Match colors to Party Bloom's theme
- Customize email templates

---

## Post-Deployment Checklist

After deploying to any platform:

1. **Test Authentication**
   - Visit your deployed URL
   - Click "Sign In"
   - Verify you can sign in with email or social login
   - Check that user data syncs correctly

2. **Test Stripe**
   - Create a test account
   - Try the subscription flow
   - Verify webhooks are received (check Stripe Dashboard)

3. **Verify Database**
   - Log in and create a theme
   - Refresh the page - theme should persist

4. **Update Stripe Product**
   - In Stripe Dashboard, ensure you have a $20 CAD monthly price
   - Product name: "Party Bloom Monthly"

---

## Troubleshooting

### "Clerk is not configured" error
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set correctly
- Verify `CLERK_SECRET_KEY` is set correctly
- Check that keys match your Clerk application

### "Unauthorized" error after login
- Check Clerk Dashboard for any errors
- Verify your production URL is in Clerk's allowed origins

### Database connection errors
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL is running

### Stripe webhooks not working
- Verify webhook URL matches your deployed domain
- Check webhook signing secret if configured

### Session/cookie issues
- Ensure `NODE_ENV=production` is set
- App must be served over HTTPS

---

## Free Tier Limitations

| Platform | Limits | Notes |
|----------|--------|-------|
| Railway | $5/month credit | Usually enough for low traffic |
| Render | 750 hours/month | Apps sleep after 15 min inactivity |
| Fly.io | 3 shared VMs | Very generous for small apps |
| Clerk | 10,000 MAU | Monthly active users on free tier |

---

## Option 4: Netlify

Netlify requires converting the Express backend to serverless functions. This is more complex but works well for production.

### Important Note

Netlify doesn't run traditional Node.js servers. You need:
1. An **external PostgreSQL database** (Neon is free and recommended)
2. Convert Express routes to **Netlify Functions**

### Step 1: Create a Neon Database (Free)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (DATABASE_URL)

### Step 2: Push to GitHub

1. Create a new repository on GitHub.com
2. Push your Party Bloom code to GitHub

### Step 3: Create `netlify.toml`

Create this file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist/public"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
  included_files = ["shared/**"]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 4: Create Netlify Function

Create `netlify/functions/api.ts`:

```typescript
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

const app = express();

// Trust proxy for secure cookies
app.set("trust proxy", 1);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all routes (Clerk middleware is set up in routes)
registerRoutes(app);

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};

export { handler };
```

### Step 5: Install Serverless Package

Add to your project:
```bash
npm install serverless-http @netlify/functions
```

### Step 6: Update package.json Build Script

Make sure your build script builds both frontend and prepares functions:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### Step 7: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`

### Step 8: Set Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |
| `CLERK_SECRET_KEY` | Your Clerk secret key |
| `SESSION_SECRET` | Random 32+ char string |
| `NODE_ENV` | `production` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `VITE_STRIPE_PUBLIC_KEY` | Your Stripe publishable key |

### Step 9: Configure Clerk

In Clerk Dashboard, add your Netlify URL to allowed origins.

### Step 10: Update Stripe Webhook

Update your Stripe webhook URL to:
`https://YOUR_SITE.netlify.app/api/stripe/webhook`

### Step 11: Deploy

Click **"Deploy site"** and wait for the build to complete.

---

## Netlify vs Other Platforms - Comparison

| Feature | Railway/Render/Fly | Netlify |
|---------|-------------------|---------|
| Setup difficulty | Easy | More complex |
| Backend type | Traditional server | Serverless functions |
| Cold starts | No | Yes (first request slower) |
| Database included | Yes (Railway/Render) | No (need external) |
| Best for | Full-stack apps | Static sites + APIs |

**Recommendation**: For Party Bloom, Railway or Render are simpler choices since they support traditional Express servers. Netlify works but requires more setup.

---

## Need Help?

- Clerk: [clerk.com/docs](https://clerk.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- Fly.io: [fly.io/docs](https://fly.io/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
