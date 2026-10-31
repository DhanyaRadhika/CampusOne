import mongoose from "./database";

export interface IUser extends mongoose.Document {
  id: string;
  username: string;
  password: string;
  name?: string;
  email?: string;
  role?: "student" | "faculty" | "admin";
  branch?: string;
  year?: number;
  cgpa?: number;
  skills?: string[];
  department?: string;
  avatar?: string;
}

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  email: { type: String },
  role: { type: String, enum: ["student", "faculty", "admin"] },
  branch: { type: String },
  year: { type: Number },
  cgpa: { type: Number },
  skills: [{ type: String }],
  department: { type: String },
  avatar: { type: String },
});

export const User = mongoose.model<IUser>("User", UserSchema);

export interface IAttendance extends mongoose.Document {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  date: Date;
  present: boolean;
  facultyId: string;
}

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  className: { type: String, required: true },
  date: { type: Date, default: Date.now },
  present: { type: Boolean, required: true },
  facultyId: { type: String, required: true },
});

export const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  AttendanceSchema
);
