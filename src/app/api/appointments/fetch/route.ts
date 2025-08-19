import { NextRequest, NextResponse } from 'next/server';
import AppointmentController from '@/app/server/controllers/appointment.controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json(
        { 
          message: 'Appointment ID is required',
          success: false 
        },
        { status: 400 }
      );
    }

    console.log('🔍 API: Fetching appointment with ID:', appointmentId);

    const controller = new AppointmentController();
    
    // Clean the appointment ID (remove dashes)
    const cleanId = appointmentId.replace(/-/g, '');
    const result = await controller.readById(cleanId);
    console.log(result)

    if (result.statusCode === 200) {
      console.log('✅ API: Appointment fetched successfully');
      return NextResponse.json({
        message: result.message,
        data: result.data,
        success: true
      }, { status: 200 });
    } else {
      console.error('❌ API: Appointment not found:', result.message);
      return NextResponse.json({
        message: result.message,
        success: false
      }, { status: result.statusCode });
    }

  } catch (error: any) {
    console.error('❌ API: Error fetching appointment:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error while fetching appointment',
        error: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment_id } = body;

    if (!appointment_id) {
      return NextResponse.json(
        { 
          message: 'Appointment ID is required',
          success: false 
        },
        { status: 400 }
      );
    }

    console.log('🔍 API: Fetching appointment with ID (POST):', appointment_id);

    const controller = new AppointmentController();
    
    // Clean the appointment ID (remove dashes)
    const cleanId = appointment_id.replace(/-/g, '');
    const result = await controller.readById(cleanId);

    if (result.statusCode === 200) {
      console.log('✅ API: Appointment fetched successfully');
      return NextResponse.json({
        message: result.message,
        data: result.data,
        success: true
      }, { status: 200 });
    } else {
      console.error('❌ API: Appointment not found:', result.message);
      return NextResponse.json({
        message: result.message,
        success: false
      }, { status: result.statusCode });
    }

  } catch (error: any) {
    console.error('❌ API: Error fetching appointment:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error while fetching appointment',
        error: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}
