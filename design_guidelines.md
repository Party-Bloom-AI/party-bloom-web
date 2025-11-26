# Party Bloom Landing Page Design Guidelines

## Design Approach
**Reference-Based**: Modern SaaS marketing aesthetic inspired by ShortStack, Notion, and Linear - clean cards, generous whitespace, strong visual hierarchy, and compelling CTAs. Curated, not overwhelming.

## Typography System
- **Headings**: Inter or DM Sans (Google Fonts)
  - H1: font-bold, text-4xl md:text-5xl lg:text-6xl
  - H2: font-bold, text-3xl md:text-4xl lg:text-5xl
  - H3: font-semibold, text-xl md:text-2xl
- **Body**: Inter or System-UI stack
  - Large: text-lg md:text-xl (subheadlines)
  - Regular: text-base md:text-lg
  - Small: text-sm (captions, metadata)

## Layout & Spacing
**Tailwind Units**: Consistently use 4, 6, 8, 12, 16, 20, 24, 32 for spacing
- Section padding: py-16 md:py-24 lg:py-32
- Container: max-w-7xl mx-auto px-4 md:px-6
- Card padding: p-6 md:p-8
- Element gaps: gap-4, gap-6, gap-8, gap-12

## Component Library

### Navigation
- Sticky header with logo (left), nav links (center), CTA button (right)
- Transparent background initially, solid white on scroll
- Mobile: Hamburger menu with slide-in drawer

### Hero Section
- Full-width with ample vertical space (min-h-[600px] md:min-h-[700px])
- Two-column layout (60/40): Left (headline, subheadline, CTA), Right (hero mockup - image 6)
- Headline: Bold, punchy, benefit-driven ("Plan a Perfect Party in 10 Minutes")
- Subheadline: 1-2 sentences explaining value proposition
- Primary CTA: Large button (px-8 py-4, rounded-lg) with blur background if overlaying image
- Background: Soft gradient or subtle pattern (not distracting)

### How It Works Section
- 3-column grid (stacks on mobile): grid-cols-1 md:grid-cols-3
- Step cards with number badge, icon/illustration, title, description
- Visual connectors between steps (arrows or dashed lines on desktop)
- Use images 1, 3, 5 to illustrate each step

### Featured Themes Grid
- Masonry or standard grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-5
- 10-15 theme cards with theme name, small preview
- Hover effect: subtle lift (transform scale-105, shadow-lg)
- Each card: rounded corners (rounded-xl), aspect-square or 4:3

### Example Moodboard Section
- Showcase realistic output with images 2 and 4
- Split layout: Moodboard grid (left), Shopping list preview (right)
- Demonstrates actual tool output to build trust

### Testimonials
- 3-column grid of testimonial cards (stacks on mobile)
- Each card: Quote, parent name, child age, subtle avatar placeholder
- Soft background (bg-gray-50 or bg-purple-50)

### Pricing/Free Trial
- Centered content block with clear messaging
- "Start Free" emphasis with subscription mention
- Single prominent CTA button

### FAQ
- Accordion pattern: Question headers expand to reveal answers
- 5-7 common questions about party planning, time savings, customization

### Footer
- 3-4 column layout: Links, Resources, Social, Newsletter signup
- Minimal, clean design with reduced opacity text

## Card Design Pattern
- Consistent rounded-xl corners
- Subtle shadows: shadow-sm default, shadow-lg on hover
- White backgrounds with optional soft tinted borders
- Padding: p-6 or p-8

## Buttons & CTAs
- Primary: Solid fill, bold text, prominent (bg-purple-600, text-white, hover:bg-purple-700)
- Secondary: Outline style (border-2, border-purple-600, text-purple-600)
- Sizing: px-6 py-3 (regular), px-8 py-4 (large hero CTA)
- Rounded: rounded-lg
- Buttons over images: backdrop-blur-sm with semi-transparent background

## Images Section
- **Logo**: Top left of header (logo_1764136309223.png)
- **Hero Image**: Right side of hero section (6_1764136309222.png) - large, prominent
- **How It Works**: Images 1, 3, 5 illustrating each step
- **Moodboard Example**: Images 2 and 4 showing output quality
- All images: rounded corners, responsive sizing, lazy loading

## Responsive Behavior
- Mobile-first: Single column layouts, stacked sections
- Tablet (md): 2-column grids where appropriate
- Desktop (lg): Full multi-column layouts, side-by-side content
- Touch-friendly tap targets: min 44x44px

## Accessibility
- Semantic HTML5 throughout
- ARIA labels for interactive elements
- Focus states visible on all interactive elements
- Sufficient contrast ratios (WCAG AA minimum)