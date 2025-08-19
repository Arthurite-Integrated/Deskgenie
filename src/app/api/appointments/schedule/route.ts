import { NextRequest, NextResponse } from 'next/server';
import AppointmentController from '@/app/server/controllers/appointment.controller';
import { sendScheduleNotification } from '@/app/server/helper/appointment.helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📅 API: Scheduling appointment request:', body);

    const { client_name, client_email, name, description, scheduled_date, type } = body;

    // Validate required fields
    if (!client_name || !client_email || !name || !description || !scheduled_date) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: client_name, client_email, name, description, scheduled_date' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client_email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Validate and parse date
    const date = new Date(scheduled_date);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid date format. Please use ISO format (e.g., 2025-01-15T14:30:00Z)' 
        },
        { status: 400 }
      );
    }

    // Check if date is in the future
    if (date < new Date()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Appointment date must be in the future' 
        },
        { status: 400 }
      );
    }

    // Create appointment
    const appointmentController = new AppointmentController();
    const appointmentData = {
      client_name,
      client_email,
      name,
      description,
      scheduled_date: date
    };
    
    const result = await appointmentController.create(appointmentData);

    if (result.statusCode !== 201) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || 'Failed to create appointment' 
        },
        { status: result.statusCode }
      );
    }

    // Send notification emails
    try {
      await sendScheduleNotification(result.data.reference_id, {
        type: result.data.type,
        name: result.data.client_name,
        email: result.data.client_email,
        description: result.data.description
      });
      console.log('✅ Notification emails sent');
    } catch (emailError) {
      console.error('⚠️ Failed to send notification emails:', emailError);
      // Don't fail the appointment creation if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment scheduled successfully',
        data: {
          id: result.data.id,
          reference_id: result.data.reference_id,
          client_name: result.data.client_name,
          client_email: result.data.client_email,
          name: result.data.name,
          description: result.data.description,
          scheduled_date: result.data.scheduled_date,
          type: result.data.type,
          created_at: result.data.created_at
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ API: Error scheduling appointment:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
