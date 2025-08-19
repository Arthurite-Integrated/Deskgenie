import { boolean, date, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { ulid } from 'ulid'

const generate_refrence_id = () => Math.random().toString(36).substring(2, 8).toUpperCase()

/** ---Enums---- **/
export const appointment_type = pgEnum('appointment_type', [ 'physical', 'virtual' ])

export const appointment = pgTable('appointment', {
  id: varchar({ length: 26 }).primaryKey().notNull().$defaultFn(ulid),
  reference_id: varchar({ length: 6}).notNull().$defaultFn(generate_refrence_id),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  client_email: varchar({ length: 255 }).notNull(),
  client_name: varchar({ length: 255 }).notNull(),
  scheduled_date: timestamp({ mode: "date" }).notNull(),
  rescheduled: boolean().default(false),
  reschedule_reason: text(),
  type:  appointment_type().notNull().default("virtual"),
  created_at: timestamp({ mode: "date" }).defaultNow()
})

export const company = pgTable('company', {
  id: varchar({ length: 26 }).primaryKey().notNull().$defaultFn(ulid),
  name: varchar({ length: 255 }).notNull(),
  description: text()
})

export type Company =  InferSelectModel<typeof company>
export type Appointment = InferSelectModel<typeof appointment>;