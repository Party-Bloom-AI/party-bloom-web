# Party Bloom

An AI-powered party planning assistant that helps busy parents plan kids' themed birthday party decorations in under 10 minutes.

## Overview

Party Bloom transforms the overwhelming task of party planning into a simple, enjoyable experience. Instead of endless Pinterest scrolling, parents can quickly generate cohesive party themes, curated moodboards, and shopping lists with just a few clicks.

## Features

- **AI Theme Generation** - Share your vision through an image, text description, or browse curated templates
- **Curated Moodboards** - Receive beautifully designed moodboards with 4-6 inspiring images
- **Smart Shopping Lists** - Get detailed decoration shopping lists with cost estimates and retailer links
- **100+ Preset Themes** - Access a library of popular party themes including:
  - Princess Dreams
  - Dino Adventure
  - Mermaid Splash
  - Space Explorer
  - And many more!

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Backend**: Express.js
- **Build Tool**: Vite
- **Database**: PostgreSQL with Drizzle ORM

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
│   └── vite.ts             # Vite dev server setup
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
└── attached_assets/        # Static assets and images
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

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

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server

## Landing Page Sections

The landing page includes the following sections:

1. **Hero Section** - Main value proposition with CTA
2. **How It Works** - 3-step process explanation
3. **Featured Themes** - Showcase of 4 popular party themes
4. **Example Moodboard** - Sample AI-generated output
5. **Party Showcase** - Full-width image banner with social proof
6. **Testimonials** - Customer reviews and feedback
7. **Pricing** - Free trial offer and feature list
8. **FAQ** - Frequently asked questions
9. **Footer** - Navigation and contact information

## Design System

Party Bloom uses a custom color palette:

- **Primary**: Purple (#7C3AED)
- **Accent**: Teal (#14B8A6)
- **Coral**: (#F97316)
- **Yellow**: (#FACC15)

The design follows modern SaaS marketing conventions with:
- Clean card-based layouts
- Generous whitespace
- Mobile-first responsive design
- Subtle hover animations
- Accessible color contrasts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide Icons](https://lucide.dev/) for the icon set
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
