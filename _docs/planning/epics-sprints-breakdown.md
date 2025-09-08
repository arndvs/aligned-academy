# Epics and Sprints Breakdown for Aligned Academy

This document breaks down the project into epics and sprints, adapting the original implementation guide's Phase 0-4 structure to our monorepo architecture and example-todo patterns. Each epic includes sprint allocation (2 weeks each), linked user stories, and single-point stories (user stories broken into atomic tasks). Total timeline: 16 sprints (32 weeks/8 months). Focus on MVP in Phases 0-1, then enhancements.

## Phase 0: Foundation & Authentication (2 Sprints / 4 weeks)
**Epic 0.1: Monorepo Architecture Setup (Sprint 1)**  
Objective: Initialize Nx monorepo and migrate current Expo boilerplate.  
Linked User Stories: N/A (infrastructure).  
Single-Point Stories:
- ☐ Initialize Nx workspace with React (Next.js), NestJS, and Expo generators
  - Run `npx create-nx-workspace@latest aligned-academy-platform --preset=empty`
  - Generate apps: `nx g @nx/next:app web`, `nx g @nx/nest:app api`, migrate Expo to `apps/mobile`
  - Configure TypeScript strict mode, path mapping for shared libs
  - Required resources: Nx docs, example-todo package.jsons
  - Expected outcomes: Functional monorepo with hot reload across apps
- ☐ Create shared packages for types, utils, and API client
  - Generate libs: `nx g @nx/js:lib shared-types`, `shared-ui`, `shared-utils`, `shared-api-client`
  - Define interfaces in shared-types (e.g., Tenant { id: string, subdomain: string, branding: { logo: string, colors: string[] } })
  - Implement API client with Axios, tenant-aware headers
  - Required resources: TypeORM for entities, GROQ examples from LMS
  - Expected outcomes: Type-safe shared code preventing duplication
- ☐ Set up Docker Compose for dev environment
  - Create global docker-compose.yml with PostgreSQL 15, Redis, Sanity (via docker)
  - Add pgAdmin and Redis Insight for admin
  - Configure NestJS app to use Docker services in api/docker-compose.yml
  - Required resources: Docker Compose docs, original guide's DB setup
  - Expected outcomes: Consistent dev environment with tenant DB isolation

**Epic 0.2: Authentication & Tenant Management (Sprint 2)**  
Objective: Implement Clerk auth and basic multi-tenancy.  
Linked User Stories: Mobile authentication story.  
Single-Point Stories:
- ☐ Integrate Clerk for web and mobile with tenant metadata
  - Configure Clerk dashboard with organizations for tenants; add metadata (tenantId, role: 'patient'|'practitioner')
  - Implement in web: `@clerk/nextjs` middleware for auth; in mobile: `@clerk/clerk-expo`
  - Add webhook handler in NestJS for user sync to Postgres
  - Required resources: Clerk docs, ecommerce/LMS examples
  - Expected outcomes: Secure auth with role-based access
- ☐ Create tenant detection middleware
  - In Next.js: middleware.ts for subdomain parsing (e.g., req.nextUrl.hostname.split('.')[0])
  - In NestJS: Guard for API requests attaching tenant context
  - Cache tenant config in Redis (branding, features)
  - Required resources: Next.js middleware docs, Redis ioredis
  - Expected outcomes: Automatic tenant context in requests
- ☐ Build tenant management dashboard
  - Create admin route in web app/(admin)/tenants with CRUD (Sanity for config?)
  - Implement onboarding form with subdomain validation
  - Required resources: Shadcn UI components from examples
  - Expected outcomes: Self-service tenant setup

Key Insight: "Clerk's metadata enables tenant association without custom auth complexity."

## Phase 1: Core Platform MVP (4 Sprints / 8 weeks)
**Epic 1.1: Patient Portal Foundation (Sprint 3)**  
Objective: Build web patient dashboard with exercise tracking.  
Linked User Stories: Patient care plan view, exercise completion.  
Single-Point Stories:
- ☐ Create patient dashboard components in web app
  - Use Next.js pages for /patient/dashboard; fetch care phase from NestJS API
  - Integrate Sanity for exercise content (adapt lessonType.ts for exercises)
  - Add progress charts with Recharts or similar
  - Required resources: LMS example's course components, shared-types for PatientProgress
  - Expected outcomes: Intuitive portal displaying phase progression
- ☐ Implement exercise prescription and video player
  - Embed Sanity videos with react-player; completion tracking via API
  - Add logging form (notes, reps) with tenant_id enforcement
  - Required resources: Workout tracker video integration
  - Expected outcomes: Self-service exercise access
- ☐ Add communication and reminders
  - Basic messaging UI; integrate email via Nodemailer in NestJS
  - Required resources: Original guide's communication system
  - Expected outcomes: Improved patient-practitioner interaction

**Epic 1.2: Practitioner Admin Dashboard (Sprint 4)**  
Objective: Web dashboard for patient management.  
Linked User Stories: Practitioner roster management, exercise prescription.  
Single-Point Stories:
- ☐ Build patient roster list with filters
  - Table component with Shadcn; query tenant patients from Postgres
  - Add search by compliance/phase using shared-utils filters
  - Required resources: LMS admin dashboard example
  - Expected outcomes: Efficient patient overview
- ☐ Create drag-and-drop exercise assignment
  - Use react-dnd for drag from exercise library to patient plan
  - Save protocols as templates in Sanity
  - Required resources: Ecommerce category browsing patterns
  - Expected outcomes: Streamlined prescription workflow
- ☐ Implement progress monitoring alerts
  - Dashboard charts; cron job in NestJS for alerts
  - Required resources: Stripe webhook patterns for events
  - Expected outcomes: Proactive compliance management

**Epic 1.3: Public Course Platform (Sprint 5)**  
Objective: Non-patient course catalog and player.  
Linked User Stories: Browse/preview courses, access purchased content.  
Single-Point Stories:
- ☐ Build course catalog and detail pages
  - Next.js dynamic routes /courses/[slug]; GROQ queries from LMS courseType.ts
  - Add previews with limited video access
  - Required resources: LMS example's /courses/[slug]
  - Expected outcomes: Optimized discovery and conversion
- ☐ Create interactive course player
  - Video player with progress tracking; notes via PortableText
  - Completion certificates generated on finish
  - Required resources: LMS lesson components
  - Expected outcomes: Engaging learning experience
- ☐ Convert content to digital format
  - Migrate PDFs to Sanity documents; create video lessons
  - Required resources: Content specialist role
  - Expected outcomes: Professional course modules

**Epic 1.4: E-commerce Integration (Sprint 6)**  
Objective: Stripe payments for courses/subscriptions.  
Linked User Stories: Course enrollment.  
Single-Point Stories:
- ☐ Integrate Stripe checkout and webhooks
  - Server actions in Next.js for checkout sessions; webhook in NestJS
  - Create products in Stripe dashboard synced to Sanity
  - Required resources: Ecommerce example's /api/stripe-checkout
  - Expected outcomes: Secure payment processing
- ☐ Build pricing tiers and access granting
  - UI for individual/subscription options; update enrollment on payment
  - Required resources: Patreon clone pricing page
  - Expected outcomes: Flexible access management
- ☐ Add marketing landing pages
  - Static pages with promotional content; coupon integration
  - Required resources: Blog example's marketing
  - Expected outcomes: Increased conversions

Key Insight: "Dual patient care and course revenue streams create sustainable platform growth."

## Phase 2: Mobile Companion App (4 Sprints / 8 weeks)
**Epic 2.1: Mobile Foundation & Authentication (Sprint 7)**  
Objective: Migrate and enhance Expo app with shared libs.  
Linked User Stories: Mobile authentication, practitioner selection.  
Single-Point Stories:
- ☐ Migrate current Expo boilerplate to apps/mobile
  - Copy src/app structure; update package.json with shared deps
  - Integrate @clerk/clerk-expo and groq for Sanity
  - Required resources: Workout tracker example
  - Expected outcomes: Shared business logic in mobile
- ☐ Set up navigation and Redux
  - Expo Router with tabs for patient/courses; Redux for state
  - Deep linking for content
  - Required resources: NativeWind styling from example
  - Expected outcomes: Intuitive mobile navigation
- ☐ Implement auth flow with biometrics
  - Screens for login/registration; Face ID integration
  - Required resources: Clerk Expo docs
  - Expected outcomes: Seamless cross-platform auth

**Epic 2.2: Mobile Patient Portal (Sprint 8)**  
Objective: Touch-optimized patient features.  
Linked User Stories: Offline exercise access.  
Single-Point Stories:
- ☐ Build mobile dashboard with gestures
  - Swipe for exercise completion; progress visuals
  - Required resources: Workout tracker tabs
  - Expected outcomes: Daily engagement interface
- ☐ Create offline video player and timer
  - Expo AV for videos; download with expo-file-system
  - Haptic timers with react-native-reanimated
  - Required resources: Offline sync patterns
  - Expected outcomes: Reliable access without internet
- ☐ Add assessment forms and sharing
  - Forms with mobile input; share via expo-sharing
  - Required resources: Camera integration
  - Expected outcomes: Comprehensive tracking

**Epic 2.3: Mobile Course Platform (Sprint 9)**  
Objective: Mobile course experience.  
Linked User Stories: Mobile course user.  
Single-Point Stories:
- ☐ Build mobile catalog and player
  - Touch-friendly browsing; offline downloads
  - Required resources: LMS mobile adaptations
  - Expected outcomes: Flexible learning
- ☐ Integrate native payments
  - Stripe with Apple/Google Pay
  - Required resources: Ecommerce mobile flows
  - Expected outcomes: Frictionless purchases
- ☐ Add notifications and social features
  - Expo notifications; sharing integration
  - Required resources: Push setup
  - Expected outcomes: Increased engagement

**Epic 2.4: Mobile Advanced Features (Sprint 10)**  
Objective: Device integrations and app store prep.  
Linked User Stories: Offline exercise access.  
Single-Point Stories:
- ☐ Integrate HealthKit/Google Fit
  - Sync activity data to progress API
  - Required resources: Expo health plugins
  - Expected outcomes: Enhanced insights
- ☐ Add location/voice features
  - Geofencing reminders; voice recording
  - Required resources: Expo location
  - Expected outcomes: Context-aware engagement
- ☐ Optimize offline and prepare assets
  - Background sync; app store screenshots
  - Required resources: EAS build docs
  - Expected outcomes: Production-ready app

Key Insight: "Mobile features leverage device capabilities for superior patient compliance."

## Phase 3: Multi-Tenancy & Practitioner Platform (3 Sprints / 6 weeks)
**Epic 3.1: Multi-Tenant Infrastructure (Sprint 11)**  
Objective: Database isolation and subdomain support.  
Linked User Stories: Subdomain access.  
Single-Point Stories:
- ☐ Implement DB multi-tenancy
  - Add tenantId to entities; TypeORM migrations
  - RLS policies in Postgres
  - Required resources: Original guide's schema
  - Expected outcomes: Secure data isolation
- ☐ Build subdomain routing
  - Next.js/NestJS middleware; wildcard DNS setup
  - Required resources: Vercel/Cloudflare docs
  - Expected outcomes: Branded subdomains
- ☐ Create tenant onboarding
  - Automation scripts; email workflows
  - Required resources: Clerk webhooks
  - Expected outcomes: Reduced admin overhead

**Epic 3.2: Practitioner Selection in Mobile (Sprint 12)**  
Objective: Dynamic branding in app.  
Linked User Stories: Practitioner selection.  
Single-Point Stories:
- ☐ Build search and profile cards
  - Map integration with expo-location
  - Required resources: Shared UI components
  - Expected outcomes: Easy discovery
- ☐ Implement dynamic mobile branding
  - Theme switching post-selection
  - Required resources: NativeWind themes
  - Expected outcomes: Personalized experience
- ☐ Add tenant switching
  - Isolated storage per tenant
  - Required resources: AsyncStorage
  - Expected outcomes: Multi-practitioner support

**Epic 3.3: PWA Implementation (Sprint 13)**  
Objective: Tenant-specific PWAs.  
Linked User Stories: Subdomain access.  
Single-Point Stories:
- ☐ Generate dynamic PWA manifests
  - API for tenant icons/manifests
  - Required resources: Next.js PWA plugin
  - Expected outcomes: Installable PWAs
- ☐ Add custom domain support
  - DNS verification; SSL automation
  - Required resources: Cloudflare API
  - Expected outcomes: Premium branding
- ☐ Optimize PWA offline
  - Service workers; push notifications
  - Required resources: Workbox
  - Expected outcomes: Native-like experience

Key Insight: "PWAs extend reach without app store barriers."

## Phase 4: Enhanced Features & Optimization (3 Sprints / 6 weeks)
**Epic 4.1: Advanced Patient Analytics (Sprint 14)**  
Objective: Predictive insights and communication.  
Linked User Stories: Practitioner analytics, patient communication.  
Single-Point Stories:
- ☐ Build analytics dashboard
  - Predictive models with shared-utils
  - Required resources: Chart.js
  - Expected outcomes: Data-driven care
- ☐ Enhance communication
  - Video messaging; team coordination
  - Required resources: WebRTC or Twilio
  - Expected outcomes: Better coordination
- ☐ Add personalization
  - Adaptive recommendations
  - Required resources: ML libs if needed
  - Expected outcomes: Personalized experience

**Epic 4.2: Enhanced Course Platform (Sprint 15)**  
Objective: Interactive and community features.  
Linked User Stories: Course admin dashboard.  
Single-Point Stories:
- ☐ Create interactive elements
  - Quizzes in Sanity; personalized paths
  - Required resources: LMS assessments
  - Expected outcomes: Higher completion
- ☐ Build community features
  - Forums with moderation
  - Required resources: NestJS sockets
  - Expected outcomes: Social learning
- ☐ Add live sessions
  - Webinar integration
  - Required resources: Zoom API
  - Expected outcomes: Expert access
- ☐ Implement analytics
  - A/B testing; engagement tracking
  - Required resources: PostHog from Expo
  - Expected outcomes: Optimized content

**Epic 4.3: Platform Optimization (Sprint 16)**  
Objective: Performance and scalability.  
Linked User Stories: N/A (infrastructure).  
Single-Point Stories:
- ☐ Optimize caching and queries
  - Redis for API; CDN for videos
  - Required resources: NestJS cache module
  - Expected outcomes: Faster loads
- ☐ Build BI dashboard
  - Revenue analytics; segmentation
  - Required resources: Next.js admin
  - Expected outcomes: Business insights
- ☐ Create API framework
  - REST docs with Swagger
  - Required resources: NestJS Swagger
  - Expected outcomes: Third-party ready
- ☐ Implement backups
  - Automated Postgres backups
  - Required resources: Docker volumes
  - Expected outcomes: Data protection

Key Insight: "Optimization ensures scalability as practitioner base grows."

## Sprint Planning Guidelines
- Each sprint: 3-5 stories, daily standups, end with demo.
- Tools: Nx for builds, GitHub Actions for CI/CD.
- Verification: Unit tests (Jest), E2E (Cypress/Detox), manual tenant isolation tests.