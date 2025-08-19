import { NextRequest, NextResponse } from "next/server";
import AppointmentController from "../../../server/controllers/appointment.controller";
import { sendCancelNotification } from "../../../server/helper/appointment.helper";

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { appointment_id, reason } = body;

        // Validate required fields
        if (!appointment_id) {
            return NextResponse.json({
                success: false,
                error: "Appointment ID is required"
            }, { status: 400 });
        }

        const controller = new AppointmentController();
        const result = await controller.cancel(appointment_id);

        if (result.statusCode !== 200) {
            return NextResponse.json({
                success: false,
                error: result.message
            }, { status: result.statusCode });
        }

        // Send cancellation notification
        try {
            await sendCancelNotification(appointment_id, {
                type: result.data.type,
                email: result.data.client_email,
                reason: reason
            });
        } catch (emailError) {
            console.error('Failed to send cancellation notification:', emailError);
            // Don't fail the entire operation if email fails
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            message: result.message
        }, { status: 200 });

    } catch (error: any) {
        console.error('API Error - Cancel appointment:', error);
        return NextResponse.json({
            success: false,
            error: "Internal server error occurred while canceling appointment"
        }, { status: 500 });
    }
}
