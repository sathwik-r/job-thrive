import axios, { AxiosInstance } from 'axios';
import { env } from './config/env.js';

export interface CalComUser {
  id: number;
  username: string;
  email: string;
  name: string;
  timeZone: string;
  weekStart: string;
  avatar?: string;
  createdDate: string;
  verified: boolean;
  twoFactorEnabled: boolean;
  disableImpersonation: boolean;
  completedOnboarding: boolean;
  locale?: string;
  role: string;
  organizationId?: number;
  organization?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface CalComEventType {
  id: number;
  title: string;
  slug: string;
  description?: string;
  position: number;
  locations: Array<{
    type: string;
    displayLocationPublicly?: boolean;
    address?: string;
    link?: string;
  }>;
  length: number;
  hidden: boolean;
  userId: number;
  teamId?: number;
  eventName?: string;
  timeZone?: string;
  periodType: string;
  periodStartDate?: string;
  periodEndDate?: string;
  periodDays?: number;
  periodCountCalendarDays?: boolean;
  requiresConfirmation: boolean;
  recurringEvent?: {
    freq: number;
    count: number;
    interval: number;
  };
  price: number;
  currency: string;
  slotInterval?: number;
  minimumBookingNotice: number;
  beforeEventBuffer: number;
  afterEventBuffer: number;
  seatsPerTimeSlot?: number;
  seatsShowAttendees?: boolean;
  schedulingType?: string;
  successRedirectUrl?: string;
  isInstantEvent: boolean;
  instantMeetingExpiryTimeOffset: number;
  metadata?: Record<string, any>;
}

export interface CalComBooking {
  id: number;
  uid: string;
  userId: number;
  eventTypeId: number;
  title: string;
  description?: string;
  customInputs?: Array<{
    label: string;
    value: string;
  }>;
  startTime: string;
  endTime: string;
  location?: string;
  attendees: Array<{
    email: string;
    name: string;
    timeZone: string;
    locale?: string;
  }>;
  user: CalComUser;
  eventType: CalComEventType;
  payment?: Array<{
    id: number;
    success: boolean;
    paymentOption: string;
    amount: number;
    currency: string;
    refunded: boolean;
  }>;
  paid: boolean;
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
  rejectionReason?: string;
  dynamicEventSlugRef?: string;
  dynamicGroupSlugRef?: string;
  rescheduled: boolean;
  fromReschedule?: string;
  recurringEventId?: string;
  smsReminderNumber?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CalComAvailability {
  busy: Array<{
    start: string;
    end: string;
  }>;
  timeZone: string;
  workingHours: Array<{
    days: number[];
    startTime: number;
    endTime: number;
  }>;
  dateOverrides: Array<{
    date: string;
    start: number;
    end: number;
  }>;
  currentSeats?: number;
}

export interface CreateBookingRequest {
  eventTypeId: number;
  start: string;
  end: string;
  responses: {
    name: string;
    email: string;
    location?: {
      optionValue: string;
      value: string;
    };
    [key: string]: any;
  };
  timeZone: string;
  language: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  name: string;
  timeZone?: string;
  weekStart?: string;
  role?: string;
  organizationId?: number;
  completedOnboarding?: boolean;
}

export interface CreateEventTypeRequest {
  title: string;
  slug: string;
  description?: string;
  length: number;
  locations?: Array<{
    type: string;
    displayLocationPublicly?: boolean;
    address?: string;
    link?: string;
  }>;
  requiresConfirmation?: boolean;
  price?: number;
  currency?: string;
  slotInterval?: number;
  minimumBookingNotice?: number;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
  seatsPerTimeSlot?: number;
  schedulingType?: string;
  isInstantEvent?: boolean;
  instantMeetingExpiryTimeOffset?: number;
  metadata?: Record<string, any>;
}

export class CalComService {
  private api: AxiosInstance;

  constructor() {
    console.log('🔧 Cal.com Service Initialization:');
    console.log('  - API URL:', env.CALCOM_API_URL);
    console.log('  - API Key present:', !!env.CALCOM_API_KEY);
    console.log('  - API Key length:', env.CALCOM_API_KEY?.length || 0);
    
    this.api = axios.create({
      baseURL: env.CALCOM_API_URL,
      params: {
        apiKey: env.CALCOM_API_KEY, // v1 API uses query parameter
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // User Management
  async createUser(userData: CreateUserRequest): Promise<CalComUser> {
    try {
      console.log('🚀 Creating Cal.com user with data:', JSON.stringify(userData, null, 2));
      console.log('📡 Making request to:', `${this.api.defaults.baseURL}/me`);
      
      // Try the /me endpoint first to test authentication
      const testResponse = await this.api.get('/me');
      console.log('✅ Authentication test successful:', testResponse.data);
      
      // For now, let's just return the test data since we can't create users via API
      // Cal.com doesn't allow creating users via API - users must sign up manually
      console.log('ℹ️ Cal.com doesn\'t support creating users via API');
      throw new Error('Cal.com doesn\'t support creating users via API. Users must sign up manually.');
      
    } catch (error: any) {
      console.error('❌ Error with Cal.com API:');
      console.error('  - Status:', error.response?.status);
      console.error('  - Status Text:', error.response?.statusText);
      console.error('  - Response Data:', error.response?.data);
      console.error('  - Request URL:', error.config?.url);
      console.error('  - Request Headers:', error.config?.headers);
      throw new Error(`Cal.com API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getUser(userId: number): Promise<CalComUser> {
    try {
      const response = await this.api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching Cal.com user:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Cal.com user: ${error.response?.data?.message || error.message}`);
    }
  }

  async getUserByEmail(email: string): Promise<CalComUser | null> {
    try {
      // Test API connectivity with a simple request
      const testResponse = await this.api.get('/');
      console.log('✅ Cal.com API test successful:', testResponse.data);
      
      // For MVP, we'll assume the user exists if API is working
      // In production, you'd need to implement proper user lookup
      return {
        id: 1,
        username: email.split('@')[0],
        email: email,
        name: email.split('@')[0],
        timeZone: 'Asia/Kolkata',
        weekStart: 'Monday',
        createdDate: new Date().toISOString(),
        verified: true,
        twoFactorEnabled: false,
        disableImpersonation: false,
        completedOnboarding: true,
        role: 'USER'
      };
    } catch (error: any) {
      console.error('Error testing Cal.com API:', error.response?.data || error.message);
      return null;
    }
  }

  async updateUser(userId: number, updates: Partial<CalComUser>): Promise<CalComUser> {
    try {
      const response = await this.api.patch(`/users/${userId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Error updating Cal.com user:', error.response?.data || error.message);
      throw new Error(`Failed to update Cal.com user: ${error.response?.data?.message || error.message}`);
    }
  }

  // Event Type Management
  async createEventType(userId: number, eventTypeData: CreateEventTypeRequest): Promise<CalComEventType> {
    try {
      const response = await this.api.post(`/users/${userId}/event-types`, eventTypeData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating Cal.com event type:', error.response?.data || error.message);
      throw new Error(`Failed to create Cal.com event type: ${error.response?.data?.message || error.message}`);
    }
  }

  async getEventTypes(userId: number): Promise<CalComEventType[]> {
    try {
      const response = await this.api.get(`/users/${userId}/event-types`);
      return response.data.event_types || [];
    } catch (error: any) {
      console.error('Error fetching Cal.com event types:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Cal.com event types: ${error.response?.data?.message || error.message}`);
    }
  }

  async getEventType(eventTypeId: number): Promise<CalComEventType> {
    try {
      const response = await this.api.get(`/event-types/${eventTypeId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching Cal.com event type:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Cal.com event type: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateEventType(eventTypeId: number, updates: Partial<CalComEventType>): Promise<CalComEventType> {
    try {
      const response = await this.api.patch(`/event-types/${eventTypeId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Error updating Cal.com event type:', error.response?.data || error.message);
      throw new Error(`Failed to update Cal.com event type: ${error.response?.data?.message || error.message}`);
    }
  }

  // Availability Management
  async getAvailability(userId: number, dateFrom: string, dateTo: string): Promise<CalComAvailability> {
    try {
      // For MVP, return mock availability structure
      // In production, you'd use the actual Cal.com availability API
      console.log('📅 Getting availability for user:', userId, 'from', dateFrom, 'to', dateTo);
      
      return {
        busy: [],
        timeZone: 'Asia/Kolkata',
        workingHours: [
          { days: [1, 2, 3, 4, 5], startTime: 540, endTime: 1080 } // 9 AM to 6 PM
        ],
        dateOverrides: []
      };
    } catch (error: any) {
      console.error('Error fetching Cal.com availability:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Cal.com availability: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBusyTimes(userId: number, dateFrom: string, dateTo: string): Promise<Array<{ start: string; end: string }>> {
    try {
      // For MVP, return empty busy times
      // In production, you'd fetch actual busy times from Cal.com
      console.log('⏰ Getting busy times for user:', userId, 'from', dateFrom, 'to', dateTo);
      
      return [];
    } catch (error: any) {
      console.error('Error fetching Cal.com busy times:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Cal.com busy times: ${error.response?.data?.message || error.message}`);
    }
  }

  // Booking Management
  async createBooking(bookingData: CreateBookingRequest): Promise<CalComBooking> {
    try {
      console.log('📝 Creating Cal.com booking with data:', JSON.stringify(bookingData, null, 2));
      
      // For MVP, create a mock booking response
      // In production, you'd use the actual Cal.com booking API
      const mockBooking: CalComBooking = {
        id: Math.floor(Math.random() * 1000000) + 100000,
        uid: `booking_${Date.now()}`,
        userId: 1,
        eventTypeId: bookingData.eventTypeId,
        title: bookingData.title || 'Coaching Session',
        description: bookingData.description,
        startTime: bookingData.start,
        endTime: bookingData.end,
        attendees: [{
          email: bookingData.responses.email,
          name: bookingData.responses.name,
          timeZone: bookingData.timeZone
        }],
        user: {
          id: 1,
          username: 'mentor',
          email: 'mentor@example.com',
          name: 'Mentor',
          timeZone: 'Asia/Kolkata',
          weekStart: 'Monday',
          createdDate: new Date().toISOString(),
          verified: true,
          twoFactorEnabled: false,
          disableImpersonation: false,
          completedOnboarding: true,
          role: 'USER'
        },
        eventType: {
          id: bookingData.eventTypeId,
          title: 'Coaching Session',
          slug: 'coaching-session',
          position: 0,
          locations: [],
          length: 30,
          hidden: false,
          userId: 1,
          periodType: 'UNLIMITED',
          requiresConfirmation: true,
          price: 0,
          currency: 'INR',
          minimumBookingNotice: 60,
          beforeEventBuffer: 0,
          afterEventBuffer: 0,
          isInstantEvent: false,
          instantMeetingExpiryTimeOffset: 60
        },
        paid: false,
        status: 'ACCEPTED',
        rescheduled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ Created mock Cal.com booking:', mockBooking.id);
      return mockBooking;
    } catch (error: any) {
      console.error('Error creating Cal.com booking:', error.response?.data || error.message);
      throw new Error(`Failed to create Cal.com booking: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBooking(bookingId: number): Promise<CalComBooking> {
    try {
      const response = await this.api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching Cal.com booking:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Cal.com booking: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBookings(userId: number, filters?: {
    status?: string;
    eventTypeId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CalComBooking[]> {
    try {
      // Use the correct Cal.com v1 API endpoint
      const response = await this.api.get('/bookings', { params: filters });
      console.log('✅ Fetched Cal.com bookings:', response.data);
      return response.data.bookings || [];
    } catch (error: any) {
      console.error('Error fetching Cal.com bookings:', error.response?.data || error.message);
      // For MVP, return empty array if API fails
      return [];
    }
  }

  async updateBooking(bookingId: number, updates: Partial<CalComBooking>): Promise<CalComBooking> {
    try {
      const response = await this.api.patch(`/bookings/${bookingId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Error updating Cal.com booking:', error.response?.data || error.message);
      throw new Error(`Failed to update Cal.com booking: ${error.response?.data?.message || error.message}`);
    }
  }

  async cancelBooking(bookingId: number, reason?: string): Promise<CalComBooking> {
    try {
      const response = await this.api.post(`/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling Cal.com booking:', error.response?.data || error.message);
      throw new Error(`Failed to cancel Cal.com booking: ${error.response?.data?.message || error.message}`);
    }
  }

  // Webhook verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!env.CALCOM_WEBHOOK_SECRET) {
      console.warn('Cal.com webhook secret not configured, skipping signature verification');
      return true;
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', env.CALCOM_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }
}

export const calComService = new CalComService();
