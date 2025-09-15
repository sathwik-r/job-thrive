# Job Thrive - Job Referral Platform

## Overview

Job Thrive is a full-stack web application that connects job seekers with referrers in a marketplace-style platform. Users can request referrals for job positions and earn money by providing successful referrals. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.
App name: Must be "Job Thrive" (not Looped)
Design preference: World-class UI design inspired by top-rated apps like Instagram, TikTok, fintech apps
Authentication: Gmail-only authentication for streamlined user experience

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Google OAuth integration with Firebase Auth simulation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **API Design**: RESTful API endpoints under `/api` prefix
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for bundling

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Schema**: Shared TypeScript schema definitions with Zod validation

## Key Components

### Authentication System
- Google OAuth integration for user authentication
- JWT-like session management (simulated Firebase Auth)
- Role-based access with dual roles (seeker/referrer)
- Protected routes with authentication guards

### User Management
- User profiles with Google account integration
- Company affiliation tracking
- Earnings and spending tracking
- Success metrics for referrals

### Job System
- Job posting management with detailed descriptions
- Location and remote work filtering
- Salary and referral fee tracking
- Job search functionality

### Referral Marketplace
- Request-response system for referrals
- Status tracking (pending, assigned, verification_pending, completed, etc.)
- File upload for resumes and proof documents
- Payment integration with Razorpay

### Payment Processing
- Razorpay integration for handling payments
- Order creation and verification
- Payment tracking with referral completion

## Data Flow

1. **User Authentication**: Google OAuth → Backend user creation/lookup → Session establishment
2. **Job Discovery**: Frontend search → Backend API → Database query → Filtered results
3. **Referral Request**: Job selection → Payment processing → Database record creation
4. **Referral Assignment**: Pending referrals → Referrer acceptance → Status updates
5. **Completion Flow**: Proof upload → Verification → Payment release → Status completion

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, ReactDOM, React Router via Wouter)
- UI components (Radix UI primitives, Lucide icons)
- Form handling (React Hook Form with Zod resolvers)
- HTTP client (Fetch API with TanStack Query)
- Payment (Razorpay SDK)
- File handling (Native File API)

### Backend Dependencies
- Express.js with middleware
- Drizzle ORM with PostgreSQL adapter
- Neon serverless PostgreSQL driver
- Zod for schema validation
- Session management (connect-pg-simple)

### Development Tools
- TypeScript for type safety
- Vite for frontend bundling
- ESBuild for backend bundling
- Tailwind CSS for styling
- PostCSS for CSS processing

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Shared: TypeScript schemas used by both frontend and backend

### Production Setup
- Single server deployment serving both API and static files
- PostgreSQL database (configured for Neon serverless)
- Environment variables for database connection and API keys
- Static file serving for the React application

### Development Workflow
- Hot module replacement via Vite dev server
- TypeScript compilation checking
- Database schema migrations via Drizzle Kit
- Concurrent frontend and backend development

The application follows a monorepo structure with shared TypeScript definitions, enabling type safety across the full stack while maintaining clear separation between client and server concerns.

## Recent Changes (January 2025)

### Brand Update
- ✓ Updated application name from "Looped" to "Job Thrive" across all components
- ✓ Enhanced brand colors and gradient system in CSS

### UI/UX Enhancements  
- ✓ Implemented world-class UI design with glassmorphism effects
- ✓ Added modern card styling with enhanced hover animations
- ✓ Created comprehensive onboarding flow with dual value propositions
- ✓ Enhanced dashboard styling with gradient text and modern cards

### Onboarding Experience
- ✓ Built multi-step onboarding showcasing platform benefits
- ✓ Clear value propositions for both seekers ($150-500 referral fees) and referrers ($2000+ monthly earnings)
- ✓ Interactive progress indicators and smooth transitions
- ✓ Integrated onboarding into login flow

### Post-Login Onboarding & Role Management (January 31, 2025)
- ✓ Built comprehensive post-login onboarding flow with role-specific information collection
- ✓ Referrer onboarding: Company, position, department, work experience collection
- ✓ Seeker onboarding: Education, target domain, experience level, skills collection  
- ✓ Profile settings page allowing users to update their information anytime
- ✓ Extended user schema with onboarding completion tracking and role-specific fields
- ✓ Integrated onboarding check in all authenticated routes
- ✓ Users can switch companies, update experience, modify domains and skills

### Technical Architecture Updates
- ✓ Extended user database schema with 9 new onboarding fields
- ✓ Created role-based form validation and progress tracking
- ✓ Added profile update API endpoint with onboarding completion marking
- ✓ Implemented authentication guards requiring onboarding completion
- ✓ Built reusable form components for skill management and profile editing

### Design System
- ✓ Added glassmorphism and modern-card CSS classes
- ✓ Implemented gradient text effects
- ✓ Enhanced color palette with additional brand variables
- ✓ Improved card hover effects with enhanced transforms