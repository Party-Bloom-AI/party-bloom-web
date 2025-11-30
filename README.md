# Party Bloom

An AI-powered party planning assistant that helps busy parents plan kids' themed birthday party decorations in under 10 minutes.

## Overview

Party Bloom transforms the overwhelming task of party planning into a simple, enjoyable experience. Instead of endless Pinterest scrolling, parents can quickly generate cohesive party themes, curated moodboards, and shopping lists with just a few clicks.

## Features

- **AI Theme Generation** - Share your vision through text description or browse 8 curated preset themes
- **AI-Generated Moodboards** - Receive beautifully designed moodboards with 4 AI-generated inspiring images
- **AI Hero Images** - Each theme includes a stunning AI-generated hero image
- **Smart Shopping Lists** - Get detailed decoration shopping lists (5-10 items) with cost estimates and retailer links
- **Preset Themes** - Access popular party themes including:
  - Princess Dreams
  - Dino Adventure
  - Mermaid Splash
  - Space Explorer
  - Safari
  - Unicorn
  - Superhero
  - Garden
- **Subscription Model** - $20 CAD/month with 30-day free trial (payment info required upfront)
- **Billing Portal** - Manage subscription through Stripe customer portal

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Backend**: Express.js
- **Build Tool**: Vite
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-5 for theme generation, GPT-Image-1 for image generation
- **Payments**: Stripe (subscriptions, trials, billing portal)
- **Authentication**: Replit Auth (OpenID Connect)

## Project Structure

```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # shadcn/ui base components
│   │   │   └── examples/   # Component examples
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Page components
│   └── index.html
├── server/                 # Backend application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   ├── webhookHandlers.ts  # Stripe webhook handlers
│   └── vite.ts             # Vite dev server setup
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
├── scripts/                # Utility scripts
│   └── seed-products.ts    # Stripe product seeding
└── attached_assets/        # Static assets and images
```

## Environment Variables

The following environment variables are required:

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `OPENAI_API_KEY` - OpenAI API key (via AI integration)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database
- Stripe account
- OpenAI API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd party-bloom
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Environment Variables section)

4. Push database schema:
```bash
npm run db:push
```

5. Seed Stripe products:
```bash
npx tsx scripts/seed-products.ts
```

6. Start the development server:
```bash
npm run dev
```

7. Open your browser and navigate to `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run db:push` - Push database schema changes

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Log out user
- `GET /api/auth/user` - Get current user

### Theme Generation
- `POST /api/generate-theme` - Generate AI party theme (requires subscription)

### Favorites
- `GET /api/favorites` - Get user's favorite themes
- `POST /api/favorites` - Add theme to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### Subscription
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/create-checkout` - Create Stripe checkout session
- `POST /api/subscription/create-portal` - Create billing portal session
- `POST /api/stripe/webhook/:uuid` - Stripe webhook endpoint

## Design System

Party Bloom uses a custom color palette:

- **Primary**: Purple (#7C3AED)
- **Accent**: Teal (#14B8A6)
- **Coral**: (#F97316)
- **Yellow**: (#FACC15)

The design follows modern SaaS marketing conventions with:
- Mobile-first responsive design
- Clean card-based layouts
- Generous whitespace
- Subtle hover animations
- Accessible color contrasts

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide Icons](https://lucide.dev/) for the icon set
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [OpenAI](https://openai.com/) for AI capabilities
- [Stripe](https://stripe.com/) for payment processing
