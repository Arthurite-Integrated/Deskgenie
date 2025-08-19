"use server"

import { Appointment } from "@/app/db/schema";
import AppointmentRepository, { AppointmentRepositoryType } from "@/app/server/repository/Appointment";
import CustomError from "@/app/utils/Error";
import Response, { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "@/app/utils/Response";
import { getAppointMentByReferenceId } from "../helper/appointment.helper";

class AppointmentController {
  private appointmentRepository: AppointmentRepositoryType;

  constructor() {
    this.appointmentRepository = new AppointmentRepository()
  }

  async create(data: Omit<Appointment, 'id' | 'created_at' | 'reference_id' | 'rescheduled' | 'type' | 'reschedule_reason'>) {
    try {
      const { client_email, client_name, description, name, scheduled_date } = data;
      const create_appointment = await this.appointmentRepository.create({ client_email, client_name, description, name, scheduled_date })
      return CREATED('Appointment created successfully', create_appointment)
    } catch(e: CustomError | unknown ) {
      if ( e instanceof CustomError ) {
        const { message, status, status_code } = e
        return new Response(status_code, status, message, {})
      }
      return INTERNAL_SERVER_ERROR(String(e))
    }
  }

  async readById(id: string) {
    try {
      const create_appointment = await this.appointmentRepository.readByReferenceId(id)
      if(!create_appointment) return NOT_FOUND('Appointment not found')
      // console.log(create_appointment)
      return OK('Appointment fetched successfully', create_appointment)

    } catch(e: CustomError | unknown ) {
      if ( e instanceof CustomError ) {
        const { message, status, status_code } = e
        return new Response(status_code, status, message, {})
      }
      return INTERNAL_SERVER_ERROR(String(e))
    }
  }

  async cancel(id: string) {
    try {
      await getAppointMentByReferenceId(id)
      const cancel_appointment = await this.appointmentRepository.deleteByReferenceId(id)
      return OK('Appointment deleted successfully', cancel_appointment)
    } catch(e: Error | unknown ) {
      if ( e instanceof CustomError ) {
        const { message, status, status_code } = e
        return new Response(status_code, status, message, {})
      }
      return INTERNAL_SERVER_ERROR(String(e))
    }
  }

  async reschedule(data: { id: string, new_date: Date, reason?: string }) {
    try {
      const { id, new_date, reason } = data;
      
      await getAppointMentByReferenceId(id)
      const mutated_data = { scheduled_date: new_date, reschedule_reason: reason, rescheduled: true }
      const reschedule_appointment = await this.appointmentRepository.updateByReferenceId(id, mutated_data)
      return OK('Appointment rescheduled successfully', reschedule_appointment)
    } catch(e: Error | unknown ) {
      if ( e instanceof CustomError ) {
        const { message, status, status_code } = e
        return new Response(status_code, status, message, {})
      }
      return INTERNAL_SERVER_ERROR(String(e))
    }
  }

  async getAvailableSlots(data: { start_date: Date, end_date: Date}) {
    try {
      const { start_date, end_date } = data;
      const reschedule_appointment = await this.appointmentRepository.findByDateRange(start_date, end_date)
      return OK('Appointments fetched successfully', reschedule_appointment)
    } catch(e: Error | unknown ) {
      if ( e instanceof CustomError ) {
        const { message, status, status_code } = e
        return new Response(status_code, status, message, {})
      }
      return INTERNAL_SERVER_ERROR(String(e))
    }
  }
}

export default AppointmentController;