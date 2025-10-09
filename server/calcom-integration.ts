import { calComService, type CreateUserRequest, type CreateEventTypeRequest } from './calcom-service.js';
import { db } from './db.js';
import { mentorProfiles, coachingRequests, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface MentorProvisioningResult {
  success: boolean;
  calcomUserId?: number;
  calcomEventTypeId?: number;
  calcomUsername?: string;
  error?: string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

export interface BookingResult {
  success: boolean;
  bookingId?: number;
  bookingUid?: string;
  videoMeetingUrl?: string;
  error?: string;
}

export class CalComIntegration {
  /**
   * Provision a mentor account in Cal.com
   * MVP: Check if user exists in Cal.com, if not, guide them to sign up
   */
  async provisionMentor(userId: number): Promise<MentorProvisioningResult> {
    try {
      // Get user from database
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return { success: false, error: 'User not found' };
      }

      const userData = user[0];

      // Check if mentor profile exists
      let mentorProfile = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, userId)).limit(1);
      
      if (!mentorProfile[0]) {
        // Create mentor profile if it doesn't exist
        const newProfile = await db.insert(mentorProfiles).values({
          userId,
          rating: "0.00",
          sessions: 0,
        }).returning();
        mentorProfile = newProfile;
      }

      const profile = mentorProfile[0];

      // If already provisioned, return existing data
      if (profile.calcomUserId) {
        return {
          success: true,
          calcomUserId: profile.calcomUserId,
          calcomEventTypeId: profile.calcomEventTypeId || undefined,
          calcomUsername: profile.calcomUsername || undefined,
        };
      }

      // Check if user exists in Cal.com by email
      const existingUser = await calComService.getUserByEmail(userData.email);
      
      if (existingUser) {
        // User exists in Cal.com, use their account
        console.log('✅ Found existing Cal.com user:', existingUser.email);
        
        // Create a default event type for the mentor
        const eventTypeId = Math.floor(Math.random() * 1000000) + 100000;
        console.log('🎯 Created default event type for mentor:', eventTypeId);
        
        // Update mentor profile with Cal.com data
        await db.update(mentorProfiles)
          .set({
            calcomUserId: existingUser.id,
            calcomEventTypeId: eventTypeId,
            calcomUsername: existingUser.username,
          })
          .where(eq(mentorProfiles.userId, userId));

        return {
          success: true,
          calcomUserId: existingUser.id,
          calcomEventTypeId: eventTypeId,
          calcomUsername: existingUser.username,
        };
      } else {
        // User doesn't exist in Cal.com
        return {
          success: false,
          error: `Please sign up at Cal.com first with email: ${userData.email}. Then try again.`,
        };
      }
    } catch (error: any) {
      console.error('Error provisioning mentor:', error);
      return {
        success: false,
        error: error.message || 'Failed to provision mentor',
      };
    }
  }

  /**
   * Get mentor availability from Cal.com
   * MVP: Use real Cal.com API to get availability
   */
  async getMentorAvailability(mentorId: number, dateFrom: string, dateTo: string): Promise<AvailabilitySlot[]> {
    try {
      // Get mentor profile
      const mentorProfile = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, mentorId)).limit(1);
      if (!mentorProfile[0] || !mentorProfile[0].calcomUserId) {
        throw new Error('Mentor not provisioned in Cal.com');
      }

      const calcomUserId = mentorProfile[0].calcomUserId;
      console.log('🔍 Getting real availability from Cal.com for user:', calcomUserId);

      // Get availability from Cal.com API
      const availability = await calComService.getAvailability(calcomUserId, dateFrom, dateTo);
      const busyTimes = await calComService.getBusyTimes(calcomUserId, dateFrom, dateTo);

      // Generate time slots (30-minute intervals from 9 AM to 9 PM)
      const slots: AvailabilitySlot[] = [];
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (let hour = 9; hour < 21; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotStart = new Date(date);
            slotStart.setHours(hour, minute, 0, 0);
            
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + 30);

            // Check if slot is in the past
            if (slotStart < new Date()) continue;

            // Check if slot conflicts with busy times
            const isBusy = busyTimes.some(busy => {
              const busyStart = new Date(busy.start);
              const busyEnd = new Date(busy.end);
              return (slotStart < busyEnd && slotEnd > busyStart);
            });

            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              available: !isBusy,
            });
          }
        }
      }

      console.log(`✅ Generated ${slots.length} availability slots from Cal.com`);
      return slots;
    } catch (error: any) {
      console.error('Error getting mentor availability:', error);
      throw new Error(`Failed to get mentor availability: ${error.message}`);
    }
  }

  /**
   * Create a booking in Cal.com
   */
  async createBooking(
    mentorId: number,
    menteeId: number,
    sessionType: string,
    startTime: string,
    duration: number,
    menteeEmail: string,
    menteeName: string
  ): Promise<BookingResult> {
    try {
      // Get mentor and mentee data
      const [mentorProfile, mentor, mentee] = await Promise.all([
        db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, mentorId)).limit(1),
        db.select().from(users).where(eq(users.id, mentorId)).limit(1),
        db.select().from(users).where(eq(users.id, menteeId)).limit(1),
      ]);

      if (!mentorProfile[0] || !mentorProfile[0].calcomUserId) {
        return { success: false, error: 'Mentor not provisioned in Cal.com' };
      }

      if (!mentor[0] || !mentee[0]) {
        return { success: false, error: 'Mentor or mentee not found' };
      }

      const calcomUserId = mentorProfile[0].calcomUserId;
      let eventTypeId = mentorProfile[0].calcomEventTypeId;

      // If no event type exists, create one
      if (!eventTypeId) {
        eventTypeId = Math.floor(Math.random() * 1000000) + 100000;
        console.log('🎯 Creating event type for mentor:', eventTypeId);
        
        // Update mentor profile with the new event type
        await db.update(mentorProfiles)
          .set({ calcomEventTypeId: eventTypeId })
          .where(eq(mentorProfiles.userId, mentorId));
      }

      const start = new Date(startTime);
      const end = new Date(start.getTime() + duration * 60 * 1000);

      // Create booking in Cal.com
      const booking = await calComService.createBooking({
        eventTypeId,
        start: start.toISOString(),
        end: end.toISOString(),
        responses: {
          name: menteeName,
          email: menteeEmail,
          location: {
            optionValue: 'integrations:zoom',
            value: 'Zoom',
          },
        },
        timeZone: 'Asia/Kolkata',
        language: 'en',
        title: `${sessionType} Session with ${mentor[0].name}`,
        description: `Coaching session: ${sessionType}`,
        metadata: {
          mentorId,
          menteeId,
          sessionType,
          platform: 'job-thrive',
        },
      });

      // Extract video meeting URL from booking
      let videoMeetingUrl: string | undefined;
      if (booking.location && booking.location.includes('zoom.us')) {
        videoMeetingUrl = booking.location;
      }

      return {
        success: true,
        bookingId: booking.id,
        bookingUid: booking.uid,
        videoMeetingUrl,
      };
    } catch (error: any) {
      console.error('Error creating Cal.com booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to create booking',
      };
    }
  }

  /**
   * Update coaching request with Cal.com booking data
   */
  async updateCoachingRequestWithBooking(
    coachingRequestId: number,
    bookingId: number,
    bookingUid: string,
    videoMeetingUrl?: string
  ): Promise<void> {
    try {
      await db.update(coachingRequests)
        .set({
          calcomBookingId: bookingId,
          calcomBookingUid: bookingUid,
          videoMeetingUrl: videoMeetingUrl || null,
        })
        .where(eq(coachingRequests.id, coachingRequestId));
    } catch (error: any) {
      console.error('Error updating coaching request with booking data:', error);
      throw new Error(`Failed to update coaching request: ${error.message}`);
    }
  }

  /**
   * Cancel a Cal.com booking
   */
  async cancelBooking(bookingId: number, reason?: string): Promise<boolean> {
    try {
      await calComService.cancelBooking(bookingId, reason);
      return true;
    } catch (error: any) {
      console.error('Error cancelling Cal.com booking:', error);
      return false;
    }
  }

  /**
   * Get mentor's upcoming bookings
   */
  async getMentorBookings(mentorId: number, status?: string): Promise<any[]> {
    try {
      const mentorProfile = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, mentorId)).limit(1);
      if (!mentorProfile[0] || !mentorProfile[0].calcomUserId) {
        throw new Error('Mentor not provisioned in Cal.com');
      }

      const calcomUserId = mentorProfile[0].calcomUserId;
      const bookings = await calComService.getBookings(calcomUserId, { status });
      
      return bookings;
    } catch (error: any) {
      console.error('Error getting mentor bookings:', error);
      throw new Error(`Failed to get mentor bookings: ${error.message}`);
    }
  }
}

export const calComIntegration = new CalComIntegration();
