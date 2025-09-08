# Aligned Academy Monorepo Architecture

## Overview
This document outlines the monorepo structure using Nx for the Aligned Academy platform. The architecture supports multi-tenancy, integrates Sanity for content management, Clerk for authentication, Stripe for payments, and PostgreSQL/Redis for tenant-specific data. The structure follows the original implementation guide's Phase 0 foundation while adapting patterns from the example-todo projects.

## Nx Workspace Structure
```
aligned-academy-platform/
├── apps/
│   ├── web/                  # Next.js 15 app for web frontend (patient portal, practitioner dashboard, public courses)
│   │   ├── app/              # App Router pages (e.g., /patient, /practitioner, /courses)
│   │   ├── components/       # Web-specific UI components using Shadcn/Tailwind
│   │   ├── lib/              # Sanity queries, Clerk hooks, Stripe integrations
│   │   └── package.json      # Dependencies: next@15, @clerk/nextjs, next-sanity, stripe
│   ├── mobile/               # Expo React Native app (adapt current root boilerplate)
│   │   ├── src/              # Screens, components with NativeWind styling
│   │   ├── app/              # Expo Router structure (tabs for patient/course flows)
│   │   └── package.json      # Dependencies: expo@52, @clerk/clerk-expo, groq, nativewind
│   └── api/                  # NestJS backend for custom APIs (tenant management, progress tracking)
│       ├── src/              # Modules (auth, tenant, patient, course)
│       ├── docker-compose.yml # Local dev with PostgreSQL/Redis
│       └── package.json      # Dependencies: @nestjs/core, @nestjs/typeorm, typeorm, pg, redis
├── libs/
│   ├── shared-types/         # TypeScript interfaces (Tenant, User, Course, Exercise, PatientProgress)
│   ├── shared-ui/            # Cross-platform UI (e.g., Button component for web/mobile)
│   ├── shared-utils/         # Business logic (validation, calculations for exercises)
│   └── shared-api-client/    # HTTP client for API calls, shared between web/mobile
├── tools/
│   └── scripts/              # Nx generators, migration scripts
├── nx.json                   # Nx configuration for caching, task runners
├── workspace.json            # Project targets (build, test, lint)
├── docker-compose.yml        # Global dev environment (Sanity, Postgres, Redis)
└── README.md                 # Setup instructions
```

## Data Flow Mermaid Diagram

```mermaid
graph TD
    A[User Request<br/>(Web/Mobile)] --> B{Clerk Auth}
    B -->|Authenticated| C[Tenant Detection<br/>(Subdomain/Metadata)]
    C --> D[Load Tenant Config<br/>(Postgres/Redis Cache)]
    D --> E[Sanity CMS Query<br/>(Courses/Exercises Content)]
    E --> F[NestJS API<br/>(Tenant-filtered Data)]
    F --> G[Row-Level Security<br/>(Postgres RLS)]
    G --> H[Business Logic<br/>(Shared Utils)]
    H --> I[Stripe Integration<br/>(Payments/Subscriptions)]
    I --> J[Response to Client<br/>(Web/Mobile)]
    J --> K[Offline Sync<br/>(Mobile Only)]
    
    subgraph "External Services"
        B -.-> Clerk
        E -.-> Sanity
        I -.-> Stripe
        G -.-> Postgres
        D -.-> Redis
    end
    
    subgraph "Monorepo Apps"
        A
        J
    end
    
    subgraph "Monorepo Libs"
        H
    end
```

### Diagram Explanation
- **Entry Point**: User interactions start via web (Next.js) or mobile (Expo) apps.
- **Authentication**: Clerk handles login, with tenant metadata for multi-tenancy.
- **Tenant Isolation**: Subdomain detection loads tenant-specific config from cached Postgres data.
- **Content Management**: Sanity provides courses/exercises; queries are tenant-aware.
- **API Layer**: NestJS handles custom logic with RLS enforcement.
- **Payments**: Stripe for course purchases/subscriptions.
- **Offline Support**: Mobile app syncs progress when online.

## Key Integrations
- **Sanity CMS**: Adapt LMS schemas (courseType.ts, lessonType.ts, exerciseType.ts for workouts). Use GROQ for efficient queries.
- **Clerk Auth**: Multi-tenant via organizations or user metadata (tenantId, role: patient/practitioner).
- **Stripe**: Subscriptions for courses, one-time payments for premium features.
- **Database**: PostgreSQL with TypeORM entities (add tenantId to all tables), Redis for sessions/caching.
- **Multi-Tenancy**: NestJS middleware for subdomain parsing; RLS policies like `CREATE POLICY tenant_isolation ON users USING (tenant_id = current_setting('app.current_tenant_id')::uuid);`.

## Migration from Current Boilerplate
- Backup current Expo app to apps/mobile/.
- Initialize Nx workspace and migrate dependencies.
- Add web and api apps using Nx generators.
- Replace Supabase with Sanity/Postgres for content/data.

## Expected Outcomes
- Scalable monorepo enabling code sharing and consistent development.
- Multi-tenant support without data leakage.
- Hot reload across apps/libs during development.

Key Insight: "Nx monorepo with shared packages eliminates code duplication while maintaining type safety across platforms"