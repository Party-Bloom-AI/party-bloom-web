# Party Bloom - AI-Powered Party Planning Assistant

## Overview

Party Bloom is an AI-powered party planning platform designed to help busy parents plan kids' themed birthday party decorations in under 10 minutes. The application transforms the overwhelming task of party planning into a simple, enjoyable experience by generating cohesive party themes, curated moodboards, and detailed shopping lists.

The platform features AI theme generation from images or text descriptions, access to 100+ preset themes, curated moodboards with 4-6 inspiring images, and smart shopping lists with cost estimates and retailer links.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing (minimal alternative to React Router)

**UI Component Strategy**
- shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows modern SaaS aesthetic inspired by ShortStack, Notion, and Linear
- Component examples stored in `client/src/components/examples/` for development reference

**State Management**
- TanStack Query (React Query) for server state management, caching, and data fetching
- Custom React hooks for authentication state (`useAuth`) and mobile detection (`useIsMobile`)
- Query client configured with credentials-based fetching and infinite stale time

**Design System**
- Typography: Inter/DM Sans for headings, system UI stack for body text
- Spacing: Consistent Tailwind units (4, 6, 8, 12, 16, 20, 24, 32)
- Color system: HSL-based with CSS custom properties for theme variables
- Responsive breakpoints: mobile-first with md (768px) and lg breakpoints

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- Dual entry points: `index-dev.ts` (development with Vite middleware) and `index-prod.ts` (production with static file serving)
- Custom logging middleware for request monitoring and performance tracking
- Raw body capture for webhook verification support

**Development vs Production**
- Development: Vite dev server integrated as Express middleware with HMR support
- Production: Pre-built static assets served from `dist/public` directory
- Environment-based configuration switching via NODE_ENV

**API Design**
- RESTful API routes registered through `routes.ts`
- Authentication-protected endpoints using middleware pattern
- Centralized error handling with status code and message formatting

### Data Storage

**Database**
- PostgreSQL as the primary database (via Neon serverless)
- Drizzle ORM for type-safe database operations and schema management
- Connection pooling via `@neondatabase/serverless` with WebSocket support

**Schema Design**
- Users table: Stores user profiles (id, email, firstName, lastName, profileImageUrl, timestamps)
- Sessions table: Required for Replit Auth, stores session data with expiration
- Type generation: Drizzle Zod schemas for runtime validation and TypeScript inference
- Migration strategy: Schema changes managed through `drizzle-kit push` command

**Storage Interface**
- Abstract `IStorage` interface for potential future storage backend changes
- `DatabaseStorage` implementation provides user CRUD operations
- Upsert pattern for user creation/updates with automatic timestamp management

### Authentication & Authorization

**Replit Auth Integration**
- OpenID Connect (OIDC) authentication flow via Replit's identity provider
- Passport.js strategy for session-based authentication
- Session storage: PostgreSQL-backed sessions via `connect-pg-simple`
- Session configuration: 7-day TTL, HTTP-only cookies, secure flag enabled

**User Session Management**
- Token storage: Access tokens and refresh tokens stored in user session
- Claims-based authorization using JWT claims from OIDC tokens
- Middleware: `isAuthenticated` guard for protected routes
- User creation: Automatic upsert on successful authentication

**Security Considerations**
- Session secrets managed via environment variables
- CSRF protection through same-site cookie policies
- Token refresh mechanism for maintaining long-lived sessions

### Subscription & Freemium Model

**Free Trial System**
- All new users get 30 days free trial automatically (no payment info required)
- Trial period calculated from user's `createdAt` timestamp in database
- Users can generate unlimited themes during their free trial
- Access status tracked via `/api/access-status` endpoint

**Subscription Details**
- Price: $20 CAD/month after trial expires
- Payment processed via Stripe Checkout
- No trial period on Stripe subscription (trial is handled internally)
- Subscription required to continue generating themes after free trial

**Access Control**
- Theme generation checks both free trial status AND subscription status
- Trial users see green banner with days remaining
- Expired trial users redirected to subscription page
- Active subscribers have full access

**Stripe Setup Requirements**
- Create a recurring price in Stripe: $20 CAD/month (2000 cents)
- Product name: "Party Bloom Monthly"
- The system looks for a price with unit_amount=2000 and currency=cad

## External Dependencies

### Third-Party Services

**Authentication Provider**
- Replit OIDC service for user authentication and identity management
- Issuer URL: Configurable via `ISSUER_URL` environment variable (defaults to https://replit.com/oidc)
- Client identification via `REPL_ID` environment variable

**Database Service**
- Neon serverless PostgreSQL database
- Connection via `DATABASE_URL` environment variable
- WebSocket-based connection pooling for serverless compatibility

### Development Tools

**Replit Platform Integration**
- `@replit/vite-plugin-runtime-error-modal`: Runtime error overlay for development
- `@replit/vite-plugin-cartographer`: Development navigation and structure visualization
- `@replit/vite-plugin-dev-banner`: Development environment indicator
- Conditional loading: Only enabled in non-production Replit environments

### UI Component Libraries

**Radix UI Primitives** (Extensive collection)
- Accordion, Alert Dialog, Aspect Ratio, Avatar, Checkbox, Collapsible, Context Menu
- Dialog, Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Popover
- Progress, Radio Group, Scroll Area, Select, Separator, Slider, Switch, Tabs
- Toast, Toggle, Tooltip components
- Provides accessible, unstyled primitives for building custom components

**Supporting Libraries**
- `cmdk`: Command palette component for search/navigation
- `class-variance-authority`: Type-safe variant styling utility
- `clsx` + `tailwind-merge`: Conditional className composition
- `date-fns`: Date manipulation and formatting
- `lucide-react`: Icon library
- `react-icons`: Additional icon set (Google icons used)
- `vaul`: Drawer component primitive
- `embla-carousel-react`: Carousel/slider functionality
- `react-day-picker`: Calendar/date picker component
- `recharts`: Charting library for data visualization
- `input-otp`: OTP input component

### Asset Management

**Static Assets**
- Images stored in `attached_assets/` directory
- Vite alias `@assets` for convenient asset imports
- Theme preview images: princess, dino, mermaid, space themes
- Moodboard examples and shopping list mockups
- Logo and hero imagery

**Font Loading**
- Google Fonts: Architects Daughter, DM Sans, Fira Code, Geist Mono
- Preconnect optimization for faster font loading
- System font fallbacks configured in Tailwind