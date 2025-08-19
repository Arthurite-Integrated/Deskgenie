// "use server"
import { tool } from "@openai/agents/realtime";
import { z } from "zod";
import { 
  scheduleAppointmentThroughAPI, 
  rescheduleAppointmentThroughAPI, 
  cancelAppointmentThroughAPI,
  fetchAppointmentThroughAPI 
} from "../server/helper/scheduling.helper";

interface AiResponse {
  status: boolean;
  msg: any
}

// ==================== ACTIVE APPOINTMENT MANAGEMENT TOOLS ====================

export const createAppointment = tool({
  name: "createAppointmentTool",
  description: "Creates a new appointment for a client. Use this when someone wants to schedule, book, or make a new appointment. This tool works efficiently - if you have all required information (name, email, appointment type, description, date/time), schedule immediately without asking additional questions.",
  parameters: z.object({
    name: z.string().describe("The type or title of the appointment (e.g., 'Medical Consultation', 'Business Meeting', 'Dental Checkup', 'Job Interview')"),
    description: z.string().describe('Comprehensive description of the appointment purpose, including any specific requirements, preparation needed, or topics to be covered'),
    client_name: z.string().describe("Client's full name as it should appear in the appointment record"),
    client_email: z.string().email().describe("Valid email address for sending appointment confirmation and reminders"),
    scheduled_date: z.string().describe("The exact date and time for the appointment in ISO format (e.g., '2025-01-15T14:30:00Z'). Convert relative dates like 'tomorrow' or 'next Monday' to proper ISO format"),
    type: z.enum([ 'physical', 'virtual' ]).describe("The meeting type - physical or virtual").nullable().optional()
  }).strict(),
  execute: async ({ client_name, client_email, description, scheduled_date, name, type }): Promise<AiResponse> => {
    console.log('🔧 Tool: Creating appointment with data:', { client_name, client_email, description, scheduled_date, name, type });
    
    // Validate required fields
    if (!client_name || !client_email || !description || !scheduled_date || !name) {
      console.error('❌ Tool: Missing required information');
      return { 
        status: false, 
        msg: 'Missing required information. Please provide: client name, email, appointment description, scheduled date, and appointment title.' 
      };
    }
    
    // Validate date format
    const date = new Date(scheduled_date);
    if (isNaN(date.getTime())) {
      console.error('❌ Tool: Invalid date format');
      return { 
        status: false, 
        msg: 'Invalid date format. Please provide date in proper format (e.g., "2025-01-20T14:30:00Z" or "January 20, 2025 at 2:30 PM")' 
      };
    }
    
    try {
      // Use the helper function to schedule through API
      const result = await scheduleAppointmentThroughAPI({
        client_name,
        client_email,
        name,
        description,
        scheduled_date,
        type: type || 'virtual'
      });

      if (result.success) {
        console.log('✅ Tool: Appointment scheduled successfully via API');
        return { 
          status: true, 
          msg: {
            data: result.data,
            info: result.message,
            reference_id: result.data?.reference_id,
            confirmation: `Appointment confirmed! Reference ID: ${result.data?.reference_id}. You'll receive a confirmation email shortly.`
          }
        };
      } else {
        console.error('❌ Tool: API scheduling failed:', result.error);
        return { 
          status: false, 
          msg: result.error || 'Failed to schedule appointment. Please try again or contact support.' 
        };
      }
    } catch (error: any) {
      console.error('❌ Tool: Unexpected error during scheduling:', error);
      return { 
        status: false, 
        msg: 'An unexpected error occurred while scheduling your appointment. Please try again.' 
      };
    }
  }
})

export const fetchAppointment = tool({
  name: "fetchAppointmentTool",
  description: "Looks up and retrieves appointment details. Use this when someone asks about their existing appointment, wants to check appointment details, or needs their appointment information.",
  parameters: z.object({
    id: z.string().describe("The appointment reference ID that was provided to the client when they booked"),
    // client_name: z.string().nullable().optional().describe("Client's name (optional - can help verify the right appointment)")
  }).strict(), // Add .strict() here too
  execute: async ({ id }): Promise<AiResponse> => {
    console.log('🔧 Tool: Fetching appointment with ID:', id);
    
    // Validate required fields
    if (!id) {
      console.error('❌ Tool: Missing appointment ID');
      return { 
        status: false, 
        msg: 'Please provide the appointment reference ID to look up your appointment.' 
      };
    }
    
    try {
      const result = await fetchAppointmentThroughAPI(id);
      
      if (result.success) {
        console.log('✅ Tool: Appointment fetched successfully via helper');
        return { 
          status: true, 
          msg: { 
            data: result.data, 
            info: result.message 
          }
        };
      } else {
        console.error('❌ Tool: Helper fetch failed:', result.error);
        return { 
          status: false, 
          msg: result.error || `Sorry, I couldn't find an appointment with that reference ID. Please double-check the ID or contact us if you need help.` 
        };
      }
    } catch (error: any) {
      console.error('❌ Tool: Unexpected error during fetch:', error);
      return { 
        status: false, 
        msg: 'An unexpected error occurred while fetching your appointment. Please try again.' 
      };
    }
  },
})

export const rescheduleAppointment = tool({
  name: "rescheduleAppointmentTool",
  description: "Reschedule an existing appointment to a new date and time",
  parameters: z.object({
    appointment_id: z.string().describe("The appointment reference ID to reschedule"),
    new_scheduled_date: z.string().describe("New date and time in ISO format"),
    reason: z.string().nullable().optional().describe("Optional reason for rescheduling")
  }),
  execute: async ({ appointment_id, new_scheduled_date, reason }): Promise<AiResponse> => {
    console.log('🔧 Tool: Rescheduling appointment:', appointment_id, new_scheduled_date);
    
    try {
      const result = await rescheduleAppointmentThroughAPI(appointment_id, new_scheduled_date, reason || undefined);
      
      if (result.success) {
        console.log('✅ Tool: Appointment rescheduled successfully via API');
        return { 
          status: true, 
          msg: {
            data: result.data,
            info: result.message,
            confirmation: `Appointment successfully rescheduled! You'll receive a confirmation email with the updated details.`
          }
        };
      } else {
        console.error('❌ Tool: API rescheduling failed:', result.error);
        return { 
          status: false, 
          msg: result.error || 'Failed to reschedule appointment. Please check the appointment ID and try again.' 
        };
      }
    } catch (error: any) {
      console.error('❌ Tool: Unexpected error during rescheduling:', error);
      return { 
        status: false, 
        msg: 'An unexpected error occurred while rescheduling your appointment. Please try again.' 
      };
    }
  }
});

export const cancelAppointment = tool({
  name: "cancelAppointmentTool", 
  description: "Cancel an existing appointment",
  parameters: z.object({
    appointment_id: z.string().describe("The appointment reference ID to cancel"),
    reason: z.string().nullable().optional().describe("Optional reason for cancellation")
  }),
  execute: async ({ appointment_id, reason }): Promise<AiResponse> => {
    console.log('🔧 Tool: Canceling appointment:', appointment_id);
    
    try {
      const result = await cancelAppointmentThroughAPI(appointment_id, reason || undefined);
      
      if (result.success) {
        console.log('✅ Tool: Appointment canceled successfully via API');
        return { 
          status: true, 
          msg: {
            data: result.data,
            info: result.message,
            confirmation: `Appointment successfully canceled. You'll receive a confirmation email shortly.`
          }
        };
      } else {
        console.error('❌ Tool: API cancellation failed:', result.error);
        return { 
          status: false, 
          msg: result.error || 'Failed to cancel appointment. Please check the appointment ID and try again.' 
        };
      }
    } catch (error: any) {
      console.error('❌ Tool: Unexpected error during cancellation:', error);
      return { 
        status: false, 
        msg: 'An unexpected error occurred while canceling your appointment. Please try again.' 
      };
    }
  }
});

export const checkAvailability = tool({
  name: "checkAvailabilityTool",
  description: "Check available appointment slots for a specific date range",
  parameters: z.object({
    start_date: z.string().describe("Start date to check availability"),
    end_date: z.string().describe("End date to check availability")
  }),
  execute: async ({ start_date, end_date }): Promise<AiResponse> => {
    try {
      console.log('🔧 Tool: Checking availability for date range:', start_date, 'to', end_date);
      
      // Import the controller dynamically to maintain consistency with the new pattern
      const AppointmentController = (await import('../server/controllers/appointment.controller')).default;
      const controller = new AppointmentController();
      
      const result = await controller.getAvailableSlots({
        start_date: new Date(start_date),
        end_date: new Date(end_date)
      });
      
      if (result.statusCode === 200) {
        console.log('✅ Tool: Availability check successful');
        return { 
          status: true, 
          msg: { 
            availableSlots: result.data,
            info: result.message 
          } 
        };
      } else {
        console.error('❌ Tool: Availability check failed:', result.message);
        return { 
          status: false, 
          msg: result.message || 'Failed to check availability' 
        };
      }
    } catch (error: any) {
      console.error('❌ Tool: Unexpected error during availability check:', error);
      return { 
        status: false, 
        msg: 'An unexpected error occurred while checking availability. Please try again.' 
      };
    }
  }
});