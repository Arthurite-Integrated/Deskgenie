import { NextRequest, NextResponse } from "next/server";
import AppointmentController from "../../../server/controllers/appointment.controller";
import { sendRescheduleNotification } from "../../../server/helper/appointment.helper";

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { appointment_id, new_scheduled_date, reason } = body;

        // Validate required fields
        if (!appointment_id || !new_scheduled_date) {
            return NextResponse.json({
                success: false,
                error: "Appointment ID and new scheduled date are required"
            }, { status: 400 });
        }

        // Validate date format
        const newDate = new Date(new_scheduled_date);
        if (isNaN(newDate.getTime())) {
            return NextResponse.json({
                success: false,
                error: "Invalid date format. Please provide a valid ISO date string"
            }, { status: 400 });
        }

        // Check if the new date is in the future
        if (newDate <= new Date()) {
            return NextResponse.json({
                success: false,
                error: "Appointment date must be in the future"
            }, { status: 400 });
        }

        const controller = new AppointmentController();
        const result = await controller.reschedule({
            id: appointment_id,
            new_date: newDate,
            reason: reason as any
        });

        if (result.statusCode !== 200) {
            return NextResponse.json({
                success: false,
                error: result.message
            }, { status: result.statusCode });
        }

        // Send reschedule notification
        try {
            await sendRescheduleNotification(appointment_id, {
                type: result.data.type,
                email: result.data.client_email,
                reason: reason
            });
        } catch (emailError) {
            console.error('Failed to send reschedule notification:', emailError);
            // Don't fail the entire operation if email fails
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            message: result.message
        }, { status: 200 });

    } catch (error: any) {
        console.error('API Error - Reschedule appointment:', error);
        return NextResponse.json({
            success: false,
            error: "Internal server error occurred while rescheduling appointment"
        }, { status: 500 });
    }
}
