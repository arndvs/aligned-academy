# Comprehensive Implementation Guide: Aligned Academy Multi-Tenant Platform

This guide consolidates the monorepo architecture [`_docs/planning/monorepo-architecture.md`](monorepo-architecture.md), user stories [`_docs/planning/user-stories.md`](user-stories.md), and epics/sprints breakdown [`_docs/planning/epics-sprints-breakdown.md`](epics-sprints-breakdown.md) into a unified, ultra-specific, descriptive plan. It follows the original strategic overview, adapting to our Nx monorepo with Next.js web, NestJS API, Expo mobile, Sanity CMS, Clerk auth, Stripe payments, and PostgreSQL/Redis backend. Focus: Multi-tenant healthcare education platform combining patient care with public courses.

## Strategic Overview
**Key Insights:**
- "Multi-tenancy without HIPAA complexity enables rapid practitioner onboarding while maintaining professional licensing compliance"
- "Hybrid native app + PWA strategy maximizes discoverability while providing practitioner-specific branding"
- "Nx monorepo architecture ensures consistency across platforms while reducing development overhead"

**Tech Stack Summary:**
- **Frontend:** Next.js 15 (web) with Shadcn/Tailwind; Expo 52 (mobile) with NativeWind
- **Backend:** NestJS with TypeORM; Sanity v3 for CMS (GROQ queries)
- **Auth:** Clerk with tenant metadata and organizations
- **Payments:** Stripe for subscriptions and one-time purchases
- **Database:** PostgreSQL 15 with RLS; Redis for caching/sessions
- **DevOps:** Nx for monorepo, Docker Compose, GitHub Actions CI/CD

**Total Timeline:** 16 Sprints (32 weeks / 8 months), starting with Phase 0 MVP foundation.

## Phase 0: Foundation & Authentication (Sprints 1-2)
**Objective:** Establish scalable monorepo supporting multi-tenant web, mobile, and API deployment.

### Action Items Format
Each task: ☐ [Specific action] - Sub-tasks/considerations - Required resources - Expected outcomes

**Epic 0.1: Monorepo Architecture Setup (Sprint 1)**
☐ Initialize Nx workspace and migrate Expo boilerplate
- Run `npx create-nx-workspace@latest aligned-academy-platform --preset=empty --packageManager=yarn`
- Generate apps: `nx g @nx/next:app web --bundler=vite`, `nx g @nx/nest:app api`, `nx g @nx/react-native:app mobile`
- Migrate current root files (app/, components/, etc.) to apps/mobile/; update imports to use shared libs
- Configure nx.json for caching: `{ "tasksRunnerOptions": { "default": { "runner": "nx/tasks-runners/default", "options": { "cacheableOperations": ["build", "test", "lint"] } } } }`
- Considerations: Backup current repo; handle Expo EAS config migration
- Required resources: Nx docs ([nx.dev](https://nx.dev)), Expo migration guide
- Expected outcomes: Functional monorepo with `nx run-many --target=dev --all` for concurrent hot reload

☐ Create shared packages structure
- Generate libs: `nx g @nx/js:lib shared-types --bundler=none`, `nx g @nx/js:lib shared-ui`, `nx g @nx/js:lib shared-utils`, `nx g @nx/js:lib shared-api-client`
- In shared-types: Define interfaces e.g., `export interface Tenant { id: string; subdomain: string; branding: { logoUrl: string; primaryColor: string; }; features: string[]; }`, `export interface Exercise { id: string; title: string; videoUrl: string; tenantId?: string; }`
- In shared-utils: Add validation e.g., `export function validateExerciseReps(reps: number): boolean { return reps > 0 && reps <= 100; }`
- In shared-api-client: Axios instance with interceptors for tenant headers `axios.defaults.headers.common['X-Tenant-Id'] = tenantId;`
- Considerations: Ensure TypeScript path mapping in tsconfig.base.json: `"paths": { "@aligned/shared-types/*": ["libs/shared-types/src/*"] }`
- Required resources: TypeScript handbook, Axios docs
- Expected outcomes: Type-safe imports e.g., `import { Tenant } from '@aligned/shared-types';` across apps

☐ Set up Docker Compose development environment
- Create root docker-compose.yml: `services: postgres: image: postgres:15 environment: POSTGRES_DB: aligned_db POSTGRES_USER: user POSTGRES_PASSWORD: pass ports: - "5432:5432" redis: image: redis:7 ports: - "6379:6379" sanity: image: registry.sanity.io/sanity/studio:latest environment: SANITY_PROJECT_ID: your_id ports: - "3333:3333"`
- In apps/api: Add docker-compose.override.yml for NestJS connection
- Configure TypeORM in api/src/app.module.ts: `TypeOrmModule.forRoot({ type: 'postgres', host: process.env.DB_HOST || 'localhost', entities: [Tenant, User], synchronize: true })`
- Considerations: Use .env templates; seed initial tenant data
- Required resources: Docker Compose docs, TypeORM Postgres guide
- Expected outcomes: `docker-compose up` starts all services; apps connect via env vars

**Epic 0.2: Authentication & Tenant Management (Sprint 2)**
☐ Set up Clerk authentication with custom metadata
- Create Clerk app in dashboard; enable email/password + OAuth; add metadata fields: tenantId (string), role (enum: 'patient'|'practitioner'|'admin')
- In web: Install `@clerk/nextjs@latest`; add middleware.ts: `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'; export default clerkMiddleware();`
- In mobile: Install `@clerk/clerk-expo`; wrap App.tsx with `<ClerkProvider publishableKey={env.CLERK_PUBLISHABLE_KEY}>`
- Implement webhook in api/src/auth/webhook.controller.ts: `@Post() async handleClerkWebhook(@Body() body: any) { await this.userService.syncFromClerk(body.data); }`
- Considerations: Secure webhook with Clerk secret; handle user creation/updates
- Required resources: Clerk Next.js guide ([clerk.com/docs](https://clerk.com/docs)), Expo Clerk integration
- Expected outcomes: Auth flows work; users have tenant/role metadata

☐ Create tenant detection middleware for NestJS and Next.js
- In api/src/tenant/tenant.middleware.ts: `injectable().apply(ExecutionContext).forRoutes('*') async use(req: Request) { const subdomain = req.headers.host?.split('.')[0]; const tenant = await this.tenantService.findBySubdomain(subdomain); req['tenant'] = tenant; return true; }`
- In web/middleware.ts: Extend Clerk middleware to attach tenant to headers
- Cache in Redis: `await redis.set(`tenant:${tenant.id}`, JSON.stringify(tenant), 'EX', 3600);`
- Considerations: Fallback to default tenant; error on invalid subdomain
- Required resources: NestJS guards docs, Redis ioredis npm
- Expected outcomes: All requests have tenant context; caching reduces DB hits

☐ Build tenant management admin interface
- In web/app/(admin)/tenants/page.tsx: Use Shadcn forms for CRUD; query/mutate via shared-api-client
- Add subdomain validation: Check availability via DNS lookup or DB query
- Implement in Sanity: Create tenant schema with branding fields; link to Postgres for data
- Considerations: Role check for admin access; preview branding changes
- Required resources: Shadcn UI docs ([ui.shadcn.com](https://ui.shadcn.com)), Sanity schema examples from LMS
- Expected outcomes: Admins can create tenants with custom subdomains and branding

**Implementation Checklist for Phase 0**
- Define the Foundation as the Hero
  - Objective: Create development environment supporting rapid feature development and tenant onboarding
  - Tasks:
    - Monorepo Architecture:
      - Nx workspace with Next.js web, NestJS API, Expo mobile
      - Shared packages for types, business logic, API client
      - TypeScript strict mode and path mapping
      - Docker Compose with hot reload
    - Multi-Tenant Database:
      - Tenant schema with subdomain mapping
      - RLS policies for data isolation
      - Tenant config in Postgres/Redis
      - Migrations and seeding
    - Authentication:
      - Clerk integration with RBAC
      - Tenant-aware auth and middleware
  - Action Items:
    ☐ Initialize Nx monorepo with configurations and shared packages
    ☐ Implement multi-tenant DB schema with RLS
    ☐ Set up Clerk auth with tenant metadata
    ☐ Configure Sanity CMS for tenant content
    ☐ Create dev environment with Docker and CI/CD
    ☐ Build tenant management interface
  - Key Insight: "Multi-tenant foundation without HIPAA complexity enables rapid practitioner onboarding while maintaining security"

## Phase 1: Core Platform MVP (Sprints 3-6)
**Objective:** Launch functional patient portal and course platform with e-commerce.

### Action Items (Sample from Epic 1.1)
☐ Build patient dashboard with care phase display
- Create web/app/(patient)/dashboard/page.tsx: Fetch phase from API `/patients/${userId}/phase` using shared-api-client
- Render progress bar with CSS: `.progress { width: ${percentage}%; background: linear-gradient(to right, #4CAF50, #yellow); }`
- Integrate Sanity for exercises: `const exercises = await sanityClient.fetch('*[_type == "exercise" && tenantId == $tenantId]', { tenantId });`
- Considerations: Role guard for patient access; mobile responsive with Tailwind
- Required resources: Recharts for charts, LMS dashboard components
- Expected outcomes: Patients see phase status and assigned exercises

(Full action items for all epics in epics-sprints-breakdown.md; expand similarly for Sprints 4-6 covering practitioner dashboard, courses, e-commerce with Stripe webhooks granting access post-payment.)

**Implementation Checklist for Phase 1**
- Launch Functional Patient Portal and Course Platform with E-commerce
  - Objective: Create MVP supporting patient care and course revenue
  - Tasks:
    - Patient Portal: Video prescription, progress tracking, communication
    - Practitioner Dashboard: Roster, drag-and-drop assignment
    - Course Platform: Four Align Method courses, catalog, player
    - E-commerce: Stripe integration, access management
  - Action Items:
    ☐ Build patient portal with exercise tracking
    ☐ Create practitioner dashboard with assignment tools
    ☐ Implement core courses with curriculum
    ☐ Add Stripe payments with subscription options
    ☐ Build course completion system
    ☐ Create landing pages for promotion
  - Key Insight: "Dual platform serves patient care efficiency while generating scalable course revenue"

## Phase 2: Mobile Companion App (Sprints 7-10)
**Objective:** Create mobile app improving compliance and engagement.

### Action Items (Sample from Epic 2.1)
☐ Initialize Expo project with shared integration
- Update apps/mobile/package.json: Add `@clerk/clerk-expo`, `groq`, `nativewind`; yarn install
- Configure Metro in metro.config.js: `module.exports = { resolver: { alias: { '@aligned/shared-types': '../../libs/shared-types/src/index' } } };`
- Set up dev scripts: `"start": "expo start --dev-client"`
- Considerations: EAS build for iOS/Android; handle shared UI platform differences
- Required resources: Workout tracker package.json, Expo Router docs
- Expected outcomes: Mobile app runs with shared types/utils

(Continue with detailed actions for offline features, payments, etc., adapting workout tracker example.)

**Implementation Checklist for Phase 2**
- Similar structure as above, focusing on offline capabilities and device integrations.
- Key Insight: "Mobile convenience captures compliance moments and increases engagement through accessibility"

## Phase 3: Multi-Tenancy & Practitioner Platform (Sprints 11-13)
**Objective:** Implement practitioner licensing with subdomain/PWA support.

### Action Items (Sample from Epic 3.1)
☐ Implement database multi-tenancy
- Create migration: In api/migrations/ create AddTenantIdToUsers.ts with `await queryRunner.query('ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id)');`
- Add RLS: `CREATE POLICY tenant_policy ON users FOR ALL USING (tenant_id = current_setting('app.tenant_id')::uuid); SET app.tenant_id = ?;` in middleware
- Update entities: `@Entity() class User { @Column() tenantId: string; }`
- Considerations: Cascade deletes; test isolation with multiple tenants
- Required resources: TypeORM migrations guide, Postgres RLS docs
- Expected outcomes: Queries auto-filter by tenant; no cross-tenant leakage

(Details for subdomain routing, PWA generation using Next.js plugins.)

**Implementation Checklist for Phase 3**
- Implement Practitioner Licensing with Subdomain and PWA
  - Objective: Scalable licensing with professional branding
  - Tasks: Subdomain routing, dynamic branding, mobile selection, PWA offline
  - Action Items: As per epics
  - Key Insight: "Hybrid native app + PWA maximizes discoverability"

## Phase 4: Enhanced Features & Optimization (Sprints 14-16)
**Objective:** Scale with analytics, community, and performance.

### Action Items (Sample from Epic 4.1)
☐ Build advanced patient analytics
- In web/app/(practitioner)/analytics/page.tsx: Use shared-utils for correlations e.g., `calculateComplianceTrend(progressData)`
- Implement alerts: NestJS cron `@Cron('0 9 * * *') async sendAlerts() { ... }`
- Considerations: Anonymize data; integrate with Clerk for notifications
- Required resources: Chart.js, NestJS schedule module
- Expected outcomes: Dashboards show predictive insights

(Details for community forums using NestJS WebSockets, caching with Redis.)

**Implementation Checklist for Phase 4**
- Scale Platform with Advanced Analytics and Community
  - Objective: Differentiated platform with optimization
  - Tasks: Predictive analytics, interactive courses, performance caching
  - Action Items: As per epics
  - Key Insight: "Advanced features create competitive differentiation"

## Collaboration Framework
### Team Roles and Responsibilities
- **Brainstorming:** All roles; weekly sessions to refine stories/epics
- **Product Strategy Lead:** Vision, prioritization; coordinate with Dr. Bonnie on clinical needs
- **Technical Lead:** Architecture oversight; ensure Nx consistency and security
- **UX/UI Designer:** Wireframes for portals/dashboards; Figma prototypes for mobile flows
- **Frontend Developer:** Implement React/Next.js components; integrate Shadcn
- **Backend Developer:** NestJS APIs, Sanity schemas, Stripe webhooks
- **Mobile Developer:** Expo features, offline sync, device integrations
- **DevOps Engineer:** CI/CD with GitHub Actions; Docker/K8s for prod
- **QA Engineer:** Test tenant isolation, E2E flows with Cypress/Detox
- **Content Specialist:** Course content migration to Sanity; video production
- **Business Development Lead:** Practitioner onboarding docs; revenue modeling
- **Implementation Oversight:** Track sprints with Jira/Trello; risk mitigation

**Verification Steps:** 
- Unit tests: 80% coverage with Jest
- Integration: Postman for APIs; Sanity Vision for CMS
- Security: OWASP scans; manual RLS tests
- Performance: Lighthouse scores >90; load testing with Artillery

This guide provides measurable, achievable steps. Review and approve before implementation.