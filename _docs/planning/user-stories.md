# User Stories for Aligned Academy

This document captures key user stories for the platform's core features: patient portal, practitioner dashboard, public courses, and mobile flows. Stories are formatted as: **As a [user type], I want [feature] so that [benefit].** Each includes acceptance criteria, related epics, and priority based on the original implementation guide.

## Patient Portal (Web & Mobile)
**As a patient, I want to view my personalized care plan so that I can track my progress through care phases (Foundational → Corrective → Wellness).**
- Acceptance Criteria:
  - Display current care phase with progress bar and next phase requirements.
  - Show assigned exercises with completion status and video links from Sanity.
  - Filter exercises by body region or condition using shared types.
  - Mobile: Offline viewing of downloaded exercises.
- Related Epic: Epic 1.1 Patient Portal Foundation
- Priority: High

**As a patient, I want to complete exercises and log progress so that I can monitor my improvement and receive achievement badges.**
- Acceptance Criteria:
  - Video player integration with completion tracking (Sanity video assets).
  - Log notes, pain levels, and repetitions; sync to NestJS API with tenant_id.
  - Visual streak counter and milestone notifications via Clerk metadata.
  - Mobile: Haptic feedback and camera for form recording.
- Related Epic: Epic 1.1 & 2.2 Mobile Patient Portal
- Priority: High

**As a patient, I want to communicate with my practitioner securely so that I can ask questions about my exercises.**
- Acceptance Criteria:
  - In-app messaging with tenant-isolated threads (Postgres with RLS).
  - Attach progress photos/videos; integrate with mobile camera.
  - Push notifications for responses (mobile) or email (web).
- Related Epic: Epic 4.1 Advanced Patient Analytics and Communication
- Priority: Medium

## Practitioner Dashboard (Web)
**As a practitioner, I want to manage my patient roster so that I can quickly view compliance and progress metrics.**
- Acceptance Criteria:
  - List patients with filters (phase, compliance rate) from tenant-specific queries.
  - Click patient to view profile, history, and automated alerts for non-compliance.
  - Role-based access via Clerk (practitioner role, tenant association).
- Related Epic: Epic 1.2 Practitioner Admin Dashboard
- Priority: High

**As a practitioner, I want to prescribe exercises via drag-and-drop so that I can efficiently create custom care plans.**
- Acceptance Criteria:
  - Library of exercises from Sanity (adapt workout tracker schema).
  - Drag to assign to patient; customize reps/duration; save as protocol template.
  - Bulk assignment for similar conditions; integrate with Stripe for premium features.
- Related Epic: Epic 1.2 & 3.1 Multi-Tenant Infrastructure
- Priority: High

**As a practitioner, I want analytics on patient outcomes so that I can optimize treatments and track practice performance.**
- Acceptance Criteria:
  - Dashboard with charts (completion rates, trends) using shared business logic.
  - Predictive alerts for at-risk patients; export reports for insurance.
  - Tenant-specific metrics (e.g., subdomain analytics).
- Related Epic: Epic 4.1
- Priority: Medium

## Public Courses (Web & Mobile)
**As a non-patient user, I want to browse and preview courses so that I can decide if they fit my reproductive health needs.**
- Acceptance Criteria:
  - Catalog with search/filter (Conception, Pregnancy, Birth, Postpartum) from Sanity courseType.ts.
  - Preview sample lessons/videos; testimonials and pricing from Stripe products.
  - No auth required for browsing; Clerk signup for enrollment.
- Related Epic: Epic 1.3 Public Course Platform
- Priority: High

**As a course enrollee, I want to access purchased content and track completion so that I can learn at my own pace.**
- Acceptance Criteria:
  - Post-purchase access via Stripe webhook updating user enrollment (Sanity enrollmentType.tsx).
  - Interactive player with notes/bookmarks; progress sync across web/mobile.
  - Certificates on completion; community forums for discussion.
- Related Epic: Epic 1.3 & 2.3 Mobile Course Platform
- Priority: High

**As a course creator (admin), I want an admin dashboard to manage content so that I can update courses and monitor engagement.**
- Acceptance Criteria:
  - Sanity Studio integration in Next.js app/(admin)/; create/edit courses/lessons.
  - Analytics on completion rates, A/B testing for content; Stripe revenue tracking.
  - Multi-tenant content customization (branding per practitioner).
- Related Epic: Epic 4.2 Enhanced Course Platform
- Priority: Medium

## Mobile Flows (Expo App)
**As a mobile user, I want seamless authentication and practitioner selection so that I can access tenant-specific content.**
- Acceptance Criteria:
  - Clerk Expo login with biometric support; select practitioner from search (location/specialty).
  - Dynamic branding post-selection (logos/colors from tenant config).
  - Deep linking for shared exercises/courses.
- Related Epic: Epic 2.1 Mobile Foundation & 3.2 Practitioner Selection
- Priority: High

**As a mobile patient, I want offline exercise access so that I can complete workouts without internet.**
- Acceptance Criteria:
  - Download videos/exercises; local storage with Redux persistence.
  - Sync progress on reconnect via NestJS API; geofenced reminders.
  - HealthKit/Google Fit integration for activity tracking.
- Related Epic: Epic 2.2 & 2.4 Mobile Advanced Features
- Priority: High

**As a mobile course user, I want native payment and push notifications so that I can enroll and stay engaged.**
- Acceptance Criteria:
  - Apple Pay/Google Pay via Stripe; notifications for lessons/reminders.
  - Offline course download; voice-to-text notes.
- Related Epic: Epic 2.3
- Priority: Medium

## Multi-Tenancy Stories
**As a practitioner, I want subdomain access (e.g., drsmith.alignwellness.com) so that I can have branded presence.**
- Acceptance Criteria:
  - Next.js middleware detects subdomain, loads tenant config from Redis.
  - PWA generation with custom manifest; fallback to main site.
- Related Epic: Epic 3.1 & 3.3 PWA Implementation
- Priority: High

**As a user with multiple practitioners, I want to switch tenants in the app so that I can manage different care plans.**
- Acceptance Criteria:
  - Mobile tenant switcher; separate data isolation per tenant_id.
- Related Epic: Epic 3.2
- Priority: Medium

## Prioritization Matrix
- High: Core MVP features (Phase 1)
- Medium: Enhancements and mobile polish (Phase 2-4)
- Total Stories: 14 (expandable based on sprints)

Key Insight: "User stories focused on tenant isolation ensure secure, personalized experiences without data leakage."