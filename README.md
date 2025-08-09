# Job Thrive - Professional Referral Platform

A modern job referral platform that connects job seekers with professionals who can provide referrals.

## 🚀 Quick Start

### Prerequisites
- Node.js 24.x or higher
- npm

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   The `.env` file has been created with basic settings. For production, you'll need to:
   - Set up a Neon PostgreSQL database
   - Update `DATABASE_URL` with your actual database connection string
   - Configure Google OAuth credentials

3. **Start the development server:**
   ```bash
   npm run dev
   # OR use the convenience script:
   ./start.sh
   ```

4. **Access the application:**
   - Open your browser to: `http://127.0.0.1:3001`
   - The app includes both client and API on the same port

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL (Neon)
- **Build Tools:** Vite, ESBuild
- **State Management:** TanStack Query
- **Routing:** Wouter
- **Authentication:** Google OAuth (mock implementation for demo)

### Project Structure
```
├── client/               # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages/routes
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
├── server/               # Express.js backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── db.ts            # Database configuration
│   └── storage.ts       # File storage utilities
├── shared/               # Shared types and schemas
└── package.json          # Monorepo dependencies
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

## 🌟 Features

- **Dual Role System:** Users can be both job seekers and referrers
- **Job Search:** Browse and search for job opportunities
- **Referral Requests:** Request referrals from professionals
- **Payment Integration:** Handle referral payments and rewards
- **Analytics Dashboard:** Track referral performance and earnings
- **Profile Management:** Comprehensive user profiles with skills and experience

## 🔐 Authentication

The application currently uses a mock authentication system for demonstration purposes. In production, it's configured to use Google OAuth with proper credential management.

## 🗃️ Database

The application uses PostgreSQL via Neon for data persistence. Update the `DATABASE_URL` in your `.env` file with your actual database connection string.

## 🚀 Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Start the production server: `npm run start`

## 📝 Development Notes

- The server binds to `127.0.0.1` for macOS compatibility
- Vite handles hot module replacement in development
- API routes are prefixed with `/api`
- The application serves both frontend and backend on the same port 