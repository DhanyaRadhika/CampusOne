import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role"),
  branch: text("branch"),
  year: varchar("year"),
  cgpa: varchar("cgpa"),
  skills: text("skills"),
  department: text("department"),
  avatar: text("avatar"),
});

export const attendance = pgTable("attendance", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  studentName: text("student_name").notNull(),
  rollNumber: text("roll_number").notNull(),
  className: text("class_name").notNull(),
  date: timestamp("date")
    .notNull()
    .default(sql`now()`),
  present: boolean("present").notNull(),
  facultyId: varchar("faculty_id").notNull(),
});

export const events = pgTable("events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  organizer: text("organizer").notNull(),
  image: text("image"),
  capacity: varchar("capacity"),
  registrationLink: text("registration_link"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  branch: true,
  year: true,
  cgpa: true,
  skills: true,
  department: true,
  avatar: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  studentId: true,
  studentName: true,
  rollNumber: true,
  className: true,
  present: true,
  facultyId: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  type: true,
  location: true,
  organizer: true,
  image: true,
  capacity: true,
  registrationLink: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
