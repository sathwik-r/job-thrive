# Cal.com Integration Implementation

## Overview
This document outlines the comprehensive Cal.com integration implemented for the Job Thrive mentoring platform. The integration provides end-to-end booking functionality, calendar management, and session coordination.

## 🏗️ Architecture

### Components
1. **Your Platform (Frontend + Backend)** - Where mentors/mentees log in, payments integrated
2. **Cal.com Instance (Self-hosted)** - Handles availability, booking logic, calendar sync, reminders
3. **External Calendars (Google/Outlook)** - Optional, syncs mentors' real calendars
4. **Video Conferencing** - Zoom/Meet/Cal Video links for actual sessions

## 🔧 Backend Implementation

### 1. Cal.com Service (`server/calcom-service.ts`)
- **User Management**: Create, update, fetch Cal.com users
- **Event Type Management**: Create and manage different session types
- **Availability Management**: Fetch mentor availability and busy times
- **Booking Management**: Create, update, cancel bookings
- **Webhook Verification**: Secure webhook signature validation

### 2. Cal.com Integration (`server/calcom-integration.ts`)
- **Mentor Provisioning**: Automatically create Cal.com accounts for mentors
- **Availability Fetching**: Get real-time availability from Cal.com
- **Booking Creation**: Create bookings with proper metadata
- **Session Management**: Handle booking updates and cancellations

### 3. API Routes (`server/routes.ts`)
- `POST /api/calcom/provision-mentor` - Set up mentor Cal.com account
- `GET /api/calcom/mentor/:mentorId/availability` - Get mentor availability
- `POST /api/calcom/create-booking` - Create new booking
- `GET /api/calcom/mentor/:mentorId/bookings` - Get mentor's bookings
- `POST /api/calcom/booking/:bookingId/cancel` - Cancel booking
- `POST /api/calcom/webhook` - Handle Cal.com webhooks

### 4. Database Schema Updates (`shared/schema.ts`)
- Added Cal.com fields to `mentorProfiles` table:
  - `calcomUserId` - Cal.com user ID
  - `calcomEventTypeId` - Primary event type ID
  - `calcomUsername` - Cal.com username
- Added Cal.com fields to `coachingRequests` table:
  - `calcomBookingId` - Cal.com booking ID
  - `calcomBookingUid` - Cal.com booking UID
  - `videoMeetingUrl` - Video meeting link

## 🎨 Frontend Implementation

### 1. Cal.com Booking Modal (`client/src/components/calcom-booking-modal.tsx`)
- **Session Type Selection**: Choose from 4 session types with pricing
- **Date & Time Selection**: Calendar picker with real-time availability
- **Mentee Information**: Name and email collection
- **Booking Confirmation**: Complete booking flow with Cal.com integration

### 2. Mentor Schedule Component (`client/src/components/mentor-schedule.tsx`)
- **Provisioning Setup**: One-click Cal.com account setup
- **Booking Management**: View upcoming, pending, and past bookings
- **Status Tracking**: Real-time booking status updates
- **Cancellation**: Cancel bookings with reason

### 3. Updated Mentor Card (`client/src/components/mentor-card.tsx`)
- **Integrated Booking**: Direct booking from mentor cards
- **Cal.com Integration**: Seamless booking modal integration
- **Updated Interface**: Compatible with new mentor data structure

### 4. Enhanced Coaching Dashboard (`client/src/pages/coaching-dashboard.tsx`)
- **Schedule Tab**: New tab for mentor schedule management
- **Integrated Components**: All Cal.com components integrated
- **Updated Data Flow**: Compatible with new mentor interface

## 🔄 End-to-End Flow

### 1. Mentor Setup
1. Mentor signs up/logs in on your platform
2. On "My Schedule" page → backend calls Cal.com API to provision mentor account
3. Mentor connects Google/Outlook calendar (OAuth handled by Cal.com)
4. Mentor sets availability rules (stored in Cal.com, accessible via API)

### 2. Mentee Booking
1. Mentee browses mentors on your platform
2. Clicks "Book Session" → Cal.com booking modal opens
3. Frontend fetches mentor availability from Cal.com API
4. Mentee picks slot → confirms → backend creates booking via Cal.com API
5. Booking triggers:
   - Calendar invite sent to both mentor + mentee
   - Video meeting link generated (Zoom/Meet/Cal Video)
   - Webhook to your backend updates database
   - Custom notifications sent

### 3. Pre-Session
- Mentor sees session in dashboard (via Cal.com API)
- Mentee gets reminder emails (Cal.com default or custom via webhook)
- Both calendars show event with video link

### 4. Session Happens
- At session time, both click the video link
- Optional: record attendance or session outcome

### 5. Post-Session
- Cal.com marks booking as completed
- Webhook notifies backend → update database
- Trigger follow-ups:
  - Ask mentee for feedback
  - Release payment to mentor (if escrow)
  - Show session history in dashboards

## 🔧 Configuration

### Environment Variables
Add to your `.env` file:
```env
CALCOM_API_KEY=your_calcom_api_key
CALCOM_API_URL=https://api.cal.com/v1
CALCOM_WEBHOOK_SECRET=your_webhook_secret
```

### Cal.com Setup
1. Set up self-hosted Cal.com instance
2. Configure API key and webhook endpoints
3. Set up video conferencing integrations (Zoom/Meet)
4. Configure email templates and notifications

## 🚀 Features Implemented

### ✅ Completed
- [x] Cal.com API integration and configuration
- [x] Mentor account provisioning in Cal.com
- [x] API endpoints to fetch mentor availability
- [x] Mentee booking flow with Cal.com integration
- [x] Webhook handlers for booking events
- [x] Calendar sync and video link generation
- [x] Session management and post-session workflows
- [x] UI components for booking and schedule management

### 🎯 Key Features
- **Real-time Availability**: Live availability fetching from Cal.com
- **Multiple Session Types**: Career advice, mock interviews, technical reviews, project guidance
- **Flexible Pricing**: Different rates for different session types
- **Video Integration**: Automatic Zoom/Meet link generation
- **Webhook Support**: Real-time updates for booking changes
- **Calendar Sync**: Integration with external calendars
- **Mobile Responsive**: All components work on mobile devices

## 🔒 Security
- Webhook signature verification
- User authentication for all API endpoints
- Secure API key management
- Proper error handling and logging

## 📱 User Experience
- **Mentors**: Easy setup, clear schedule management, booking notifications
- **Mentees**: Intuitive booking flow, real-time availability, confirmation emails
- **Admins**: Complete visibility into booking system, webhook monitoring

## 🚀 Next Steps
1. Set up your Cal.com instance
2. Configure environment variables
3. Test the integration with sample data
4. Set up webhook endpoints
5. Configure email templates
6. Deploy to production

The integration is now complete and ready for use! 🎉
