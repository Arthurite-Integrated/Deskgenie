import { CE_BAD_REQUEST } from "@/app/utils/Error";
import AppointmentRepository from "../repository/Appointment"
import AppointmentEmmiter from "../event/appointment.event";
import env from "@/app/config/env";

const ADMIN_EMAIL = `sp3c7r40x00@gmail.com`

export async function getAppointMentByReferenceId(reference_id: string) {
  const a = new AppointmentRepository()
  const f = await a.readByReferenceId(reference_id);
  if(!f) throw CE_BAD_REQUEST('Appointment not found')
  return f;
}

export async function sendScheduleNotification(refrence_id: string, data: any) {
  const { email, name, type, description } = data;
  console.log(refrence_id, email, name, type, description )
  console.log(`Sending mail to ${email}`)
  const admin = {
    subject: `Schedule notice for reference id: ${refrence_id.toUpperCase()}`,
    email: ADMIN_EMAIL,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Schedule Notice</h2>
        <p>Dear Admin,</p>
        <p>This is to notify you that a new ${type} appointment has been scheduled with reference ID <strong>${refrence_id.toUpperCase()}</strong>.</p>
        <p>Please review the details and take the necessary actions.</p>
        <p><b>Description:</b> ${description}</p>

        <p>Thank you,</p>
        <p><strong>Appointment Management System</strong></p>
      </div>
    `
  }

  const user = {
    subject: `Schedule notice for reference id: ${refrence_id.toUpperCase()}`,
    email,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Schedule Notice</h2>
        <p>Dear ${name},</p>
        <p>This is to notify you that your ${type} appointment has been successfully scheduled with reference ID <strong>${refrence_id.toUpperCase()}</strong>.</p>
        <p>Please review the details and contact us if you have any questions.</p>
        <p><b>Description:</b> ${description}</p>

        <p>Thank you,</p>
        <p><strong>Genie Agentic Ai</strong></p>
      </div>
    `
  }

  console.log("Here i'm")

  AppointmentEmmiter.emit('alert', { mail: admin });
  AppointmentEmmiter.emit('alert_user', { mail: user });
}

export async function sendRescheduleNotification(refrence_id: string, data: any) {
  const { email, name, reason, type } = data;
  const admin = {
    subject: `Reschedule notice for reference id: ${refrence_id.toUpperCase()}`,
    email: ADMIN_EMAIL,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Reschedule Notice</h2>
        <p>Dear Admin,</p>
        <p>This is to notify you that the ${type} appointment with reference ID <strong>${refrence_id.toUpperCase()}</strong> has been rescheduled.</p>
        <p><b>Reason:</b> ${reason ? reason : 'None'}</p>

        <p>Please review the updated details and take the necessary actions.</p>
        <p>Thank you,</p>
        <p><strong>Appointment Management System</strong></p>
      </div>
    `
  }

  const user = {
    subject: `Reschedule notice for reference id: ${refrence_id.toUpperCase()}`,
    email,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Reschedule Notice</h2>
        <p>Dear ${name},</p>
        <p>This is to notify you that your ${type} appointment with reference ID <strong>${refrence_id.toUpperCase()}</strong> has been rescheduled.</p>
        <p>Please review the updated details</p>
        <p>Thank you,</p>
        <p><strong>Genie Agentic Ai</strong></p>
      </div>
    `
  }

  AppointmentEmmiter.emit('alert', { mail: admin } )
  AppointmentEmmiter.emit('alert_user', { mail: user })
}

export async function sendCancelNotification(refrence_id: string, data: any) {
  const { email, name, reason, type } = data;
  const admin = {
    subject: `Cancellation notice for reference id: ${refrence_id.toUpperCase()}`,
    email: ADMIN_EMAIL,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Cancellation Notice</h2>
        <p>Dear Admin,</p>
        <p>This is to notify you that the ${type} appointment with reference ID <strong>${refrence_id.toUpperCase()}</strong> has been canceled.</p>
        <p><b>Reason:</b> ${reason ? reason : 'None'}</p>
        
        <p>Please review the details and take the necessary actions.</p>
        <p>Thank you,</p>
        <p><strong>Appointment Management System</strong></p>
      </div>
    `
  }

  const user = {
    subject: `Cancellation notice for reference id: ${refrence_id.toUpperCase()}`,
    email,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Cancellation Notice</h2>
        <p>Dear ${name},</p>
        <p>This is to notify you that your ${type} appointment with reference ID <strong>${refrence_id.toUpperCase()}</strong> has been canceled.</p>
        <p>If you have any questions, please contact us.</p>
        <p>Thank you,</p>
        <p><strong>Genie Agentic Ai</strong></p>
      </div>
    `
  }

  AppointmentEmmiter.emit('alert', { mail: admin });
  AppointmentEmmiter.emit('alert_user', { mail: user });
}