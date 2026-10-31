import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttendanceSchema, insertEventSchema } from "../shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.post("/api/attendance", async (req, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      const result = await storage.insertAttendance(attendanceData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid attendance data" });
    }
  });

  // Get attendance by roll number: /api/attendance?roll=23A31A4201
  // Get attendance by roll or by date: /api/attendance?roll=... or /api/attendance?date=YYYY-MM-DD
  app.get("/api/attendance", async (req, res) => {
    try {
      const { roll, date } = req.query as { roll?: string; date?: string };
      if (roll) {
        const records = await storage.getAttendanceByRoll(roll);
        return res.json({ records });
      }
      if (date) {
        const records = await storage.getAttendanceByDate(date);
        return res.json({ records });
      }
      return res
        .status(400)
        .json({ error: "roll or date query param required" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  // Return class roster (unique students) for a given date or the latest recorded date
  app.get("/api/roster", async (req, res) => {
    try {
      const { date } = req.query as { date?: string };
      let records = [] as any[];
      if (date) {
        records = await storage.getAttendanceByDate(date);
      } else {
        // Try latest date first
        const all = await storage.getAllAttendances();
        if (all.length === 0) return res.json({ roster: {} });
        const dates = all
          .map((a) => String((a as any).date).split("T")[0])
          .filter(Boolean);
        const latest = dates.sort().reverse()[0];
        records = await storage.getAttendanceByDate(latest);
        // if no records for latest date, fall back to unique students across all attendances
        if (!records || records.length === 0) {
          // build unique roster from all attendances
          const seen = new Set<string>();
          records = [];
          all.forEach((r) => {
            const key = `${r.rollNumber}`;
            if (seen.has(key)) return;
            seen.add(key);
            records.push(r as any);
          });
        }
      }

      // build unique roster grouped by section
      const groups: Record<string, any[]> = {};
      const seen = new Set<string>();
      for (const r of records) {
        const key = `${r.rollNumber}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const sec = r.section || "Unknown";
        if (!groups[sec]) groups[sec] = [];
        // Fetch user details
        const user = await storage.getUser(r.studentId);
        groups[sec].push({
          id: r.studentId,
          name: r.studentName,
          roll: r.rollNumber,
          section: r.section,
          email: user?.email || "",
          cgpa: user?.cgpa || "",
          branch: user?.branch || "",
          year: user?.year || "",
          department: user?.department || "",
          skills: user?.skills || [],
        });
      }

      res.json({ roster: groups });
    } catch (error) {
      res.status(500).json({ error: "Failed to compute roster" });
    }
  });

  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = {
        id: req.body.email, // Use email as ID for simplicity
        username: req.body.email,
        password: req.body.password, // In production, hash the password
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        skills: req.body.skills || [],
        cgpa: req.body.cgpa,
      };
      const result = await storage.createUser(userData);
      res.json({ message: "User created successfully", user: result });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(400)
        .json({ error: "Failed to create user", details: errorMessage });
    }
  });

  // Login user
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByUsername(email);
      if (user && user.password === password) {
        // In production, compare hashed passwords
        res.json({ user });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Test database connection
  app.get("/api/test-db", async (req, res) => {
    try {
      // Simple test - try to create and find a test user
      const testUser = await storage.createUser({
        username: "test_" + Date.now(),
        password: "test",
      });
      res.json({ message: "Database connected successfully", testUser });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Database connection failed", details: errorMessage });
    }
  });

  // Events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json({ event });
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const ok = await storage.deleteEvent(id);
      if (ok) res.json({ success: true });
      else res.status(404).json({ error: "Event not found" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  return httpServer;
}
