import axios from 'axios';
import env from '@/app/config/env';

interface ScheduleAppointmentData {
  client_name: string;
  client_email: string;
  name: string;
  description: string;
  scheduled_date: string;
  type?: 'physical' | 'virtual';
}

interface ScheduleResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export async function scheduleAppointmentThroughAPI(appointmentData: ScheduleAppointmentData): Promise<ScheduleResponse> {
  try {
    console.log('📅 Scheduling appointment through API:', appointmentData);
    
    const response = await axios.post(
      `${env.NEXT_PUBLIC_BASE_URL}/api/appointments/schedule`,
      {
        client_name: appointmentData.client_name,
        client_email: appointmentData.client_email,
        name: appointmentData.name,
        description: appointmentData.description,
        scheduled_date: appointmentData.scheduled_date,
        type: appointmentData.type || 'virtual'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Genie-AI-Agent/1.0'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (response.status === 200 || response.status === 201) {
      console.log('✅ Appointment scheduled successfully via API');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Appointment scheduled successfully'
      };
    } else {
      console.error('❌ API returned non-success status:', response.status);
      return {
        success: false,
        error: `API returned status ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('❌ Failed to schedule appointment via API:', error);
    
    if (error.response) {
      // API responded with error status
      return {
        success: false,
        error: error.response.data?.message || `API Error: ${error.response.status}`,
        message: error.response.data?.message
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Network error - could not reach scheduling API'
      };
    } else {
      // Other error
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}

export async function rescheduleAppointmentThroughAPI(
  appointmentId: string, 
  newDate: string, 
  reason?: string
): Promise<ScheduleResponse> {
  try {
    console.log('📅 Rescheduling appointment through API:', appointmentId, newDate);
    
    const response = await axios.put(
      `${env.NEXT_PUBLIC_BASE_URL}/api/appointments/reschedule`,
      {
        appointment_id: appointmentId,
        new_scheduled_date: newDate,
        reason: reason
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Genie-AI-Agent/1.0'
        },
        timeout: 30000
      }
    );

    if (response.status === 200) {
      console.log('✅ Appointment rescheduled successfully via API');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Appointment rescheduled successfully'
      };
    } else {
      return {
        success: false,
        error: `API returned status ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('❌ Failed to reschedule appointment via API:', error);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || `API Error: ${error.response.status}`
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Network error - could not reach scheduling API'
      };
    } else {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}

export async function cancelAppointmentThroughAPI(
  appointmentId: string, 
  reason?: string
): Promise<ScheduleResponse> {
  try {
    console.log('❌ Canceling appointment through API:', appointmentId);
    
    const response = await axios.delete(
      `${env.NEXT_PUBLIC_BASE_URL}/api/appointments/cancel`,
      {
        data: { 
          appointment_id: appointmentId,
          reason: reason 
        },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Genie-AI-Agent/1.0'
        },
        timeout: 30000
      }
    );

    if (response.status === 200) {
      console.log('✅ Appointment canceled successfully via API');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Appointment canceled successfully'
      };
    } else {
      return {
        success: false,
        error: `API returned status ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('❌ Failed to cancel appointment via API:', error);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || `API Error: ${error.response.status}`
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Network error - could not reach scheduling API'
      };
    } else {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}

export async function fetchAppointmentThroughAPI(
  appointmentId: string
): Promise<ScheduleResponse> {
  try {
    console.log('🔍 Fetching appointment through API:', appointmentId);
    
    const response = await axios.post(
      `${env.NEXT_PUBLIC_BASE_URL}/api/appointments/fetch`,
      {
        appointment_id: appointmentId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Genie-AI-Agent/1.0'
        },
        timeout: 30000
      }
    );

    if (response.status === 200) {
      console.log('✅ Appointment fetched successfully via API');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Appointment fetched successfully'
      };
    } else {
      console.error('❌ API returned non-success status:', response.status);
      return {
        success: false,
        error: `API returned status ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('❌ Failed to fetch appointment via API:', error);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || `API Error: ${error.response.status}`
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Network error - could not reach appointment API'
      };
    } else {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}
