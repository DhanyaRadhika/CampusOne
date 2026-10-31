import {
  type User,
  type InsertUser,
  type Attendance,
  type InsertAttendance,
  type Event,
  type InsertEvent,
} from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  insertAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceByRoll(rollNumber: string): Promise<Attendance[]>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;
  getAllAttendances(): Promise<Attendance[]>;
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: string): Promise<boolean>;
}

// In-memory storage for development
export class InMemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private attendances: Attendance[] = [];
  private events: Event[] = [];
  private dataDir = path.resolve(__dirname, "..", "data");
  private attendanceFile = path.join(this.dataDir, "attendance.json");
  private eventsFile = path.join(this.dataDir, "events.json");

  constructor() {
    // Add some demo users for testing
    this.users.set("student@example.com", {
      id: "student@example.com",
      username: "student@example.com",
      password: "password123",
      name: "John Student",
      email: "student@example.com",
      role: "student",
      branch: "CSE",
      year: "2",
      cgpa: "8.5",
      skills: "React,TypeScript,Node.js",
      department: "Computer Science",
      avatar: null,
    });

    this.users.set("faculty@example.com", {
      id: "faculty@example.com",
      username: "faculty@example.com",
      password: "password123",
      name: "Dr. Jane Faculty",
      email: "faculty@example.com",
      role: "faculty",
      branch: "CSE",
      year: null,
      cgpa: null,
      skills: "Teaching,Mentoring",
      department: "Computer Science",
      avatar: null,
    });

    this.users.set("admin@example.com", {
      id: "admin@example.com",
      username: "admin@example.com",
      password: "password123",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      branch: null,
      year: null,
      cgpa: null,
      skills: null,
      department: null,
      avatar: null,
    });
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (e) {
      // ignore
    }
  }

  private async loadDataFiles() {
    await this.ensureDataDir();
    try {
      const attendRaw = await fs.readFile(this.attendanceFile, "utf-8");
      this.attendances = JSON.parse(attendRaw);
    } catch (e) {
      this.attendances = [];
    }

    try {
      const eventsRaw = await fs.readFile(this.eventsFile, "utf-8");
      this.events = JSON.parse(eventsRaw);
    } catch (e) {
      this.events = [];
    }
  }

  private async saveAttendances() {
    await this.ensureDataDir();
    await fs.writeFile(
      this.attendanceFile,
      JSON.stringify(this.attendances, null, 2),
      "utf-8"
    );
  }

  private async saveEvents() {
    await this.ensureDataDir();
    await fs.writeFile(
      this.eventsFile,
      JSON.stringify(this.events, null, 2),
      "utf-8"
    );
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.get(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.username || insertUser.email || `user_${Date.now()}`;
    const user: User = {
      id,
      username: insertUser.username || insertUser.email || id,
      password: insertUser.password || "",
      name: insertUser.name || null,
      email: insertUser.email || null,
      role: insertUser.role || null,
      branch: insertUser.branch || null,
      year: insertUser.year || null,
      cgpa: insertUser.cgpa || null,
      skills: insertUser.skills || null,
      department: insertUser.department || null,
      avatar: insertUser.avatar || null,
    };
    this.users.set(id, user);
    return user;
  }

  // load persisted data on first use
  private _loaded = false;
  private async ensureLoaded() {
    if (this._loaded) return;
    await this.loadDataFiles();
    this._loaded = true;
  }
  async insertAttendance(
    insertAttendance: InsertAttendance
  ): Promise<Attendance> {
    await this.ensureLoaded();
    const attendance: Attendance = {
      id: `att_${Date.now()}`,
      studentId: insertAttendance.studentId,
      studentName: insertAttendance.studentName,
      rollNumber: insertAttendance.rollNumber,
      className: insertAttendance.className,
      date:
        (insertAttendance as any).date ||
        new Date().toISOString().split("T")[0],
      present: insertAttendance.present,
      facultyId: insertAttendance.facultyId,
    };
    this.attendances.push(attendance);
    await this.saveAttendances();
    return attendance;
  }

  async getEvents(): Promise<Event[]> {
    await this.ensureLoaded();
    return this.events;
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    await this.ensureLoaded();
    // date expected in YYYY-MM-DD format; stored attendance.date may be YYYY-MM-DD or ISO
    return this.attendances.filter((a) => {
      if (!a.date) return false;
      const d = String((a as any).date).split("T")[0];
      return d === date;
    });
  }

  async getAllAttendances(): Promise<Attendance[]> {
    await this.ensureLoaded();
    return this.attendances;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    await this.ensureLoaded();
    const event: Event = {
      id: `event_${Date.now()}`,
      title: insertEvent.title,
      description: insertEvent.description,
      date: insertEvent.date,
      type: insertEvent.type,
      location: insertEvent.location,
      organizer: insertEvent.organizer,
      image: insertEvent.image || null,
      capacity: insertEvent.capacity || null,
      registrationLink: insertEvent.registrationLink || null,
    };
    this.events.push(event);
    await this.saveEvents();
    return event;
  }

  async getAttendanceByRoll(rollNumber: string): Promise<Attendance[]> {
    await this.ensureLoaded();
    return this.attendances.filter((a) => a.rollNumber === rollNumber);
  }

  async deleteEvent(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const before = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    const after = this.events.length;
    if (after < before) {
      await this.saveEvents();
      return true;
    }
    return false;
  }
}

export const storage = new InMemoryStorage();
