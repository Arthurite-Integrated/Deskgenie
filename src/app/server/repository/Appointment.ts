import z from "zod";
import BaseRepository from "./BaseRepository";
import { appointment } from "../../db/schema";
import db from "../../db";
import { CE_INTERNAL_SERVER } from "../../utils/Error";
import { eq } from "drizzle-orm";

interface ExtraRepositoryMethods {
  readByReferenceId(id: string): Promise<any>;
  deleteByReferenceId(id: string): Promise<any>
}

class AppointmentRepository extends BaseRepository implements ExtraRepositoryMethods {
  constructor() {
    super(appointment)
  }

  async readByReferenceId(id: string) {
    console.log(id)
    try {
      const f = await db.query.appointment.findFirst({
        where: (a, {eq}) => eq(a.reference_id, id)
      });
      return f;
    } catch (e: Error | unknown) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }

  async deleteByReferenceId(id: string) {
    try {
      await db.delete(appointment).where(eq(appointment.reference_id, id))
      return { success: true, id }
    } catch(e: Error | unknown) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e))
    }
  }

  async updateByReferenceId(id: string, data: any ) {
    try {
      const update = await db
        .update(appointment)
        .set(data)
        .where(eq(appointment.reference_id, id))
        .returning();
      return update[0];
    } catch(e: Error | unknown) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e))
    }
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    try {
      const results = await db.query.appointment.findMany({
        where: (a, { gte, lte }) => gte(a.scheduled_date, startDate) && lte(a.scheduled_date, endDate),
      });
      return results;
    } catch (e: Error | unknown) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }
}

export default AppointmentRepository;
export type AppointmentRepositoryType = InstanceType<typeof AppointmentRepository>