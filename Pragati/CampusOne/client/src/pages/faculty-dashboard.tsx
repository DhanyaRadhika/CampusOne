import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, Plus } from "lucide-react";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const r = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (r.ok) {
        // refresh events from server
        toast({ title: "Event deleted" });
        fetchEvents();
      } else {
        toast({ title: "Failed to delete event", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to delete event", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome{user ? `, ${user.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateEventDialog onCreated={fetchEvents} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events Created
            </CardTitle>
            <div className="text-3xl font-bold">{events.length}</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registrations
            </CardTitle>
            <div className="text-3xl font-bold">
              {events.reduce(
                (acc, curr) => acc + (curr.registeredCount || 0),
                0
              )}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Class
            </CardTitle>
            <div className="text-xl font-bold truncate">
              CS304 - Data Structures
            </div>
            <div className="text-xs text-muted-foreground">
              Today, 2:00 PM • Lab 3
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">My Events</TabsTrigger>
          <TabsTrigger value="attendance">Take Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {new Date(event.date).getDate()}
                  </div>
                  <div>
                    <h3 className="font-bold">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-bold">
                      {event.registeredCount || 0} /{" "}
                      {event.maxCapacity || event.capacity || 100}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Registered
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AttendancePanel
                onAttendanceSaved={() =>
                  setAttendanceRefreshKey((current) => current + 1)
                }
              />
            </div>
            <div>
              <AttendanceCalendar refreshKey={attendanceRefreshKey} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateEventDialog({ onCreated }: { onCreated?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const eventData = {
        title: formData.get("title"),
        type: formData.get("type"),
        description: formData.get("description"),
        date: formData.get("date"),
        location: formData.get("location"),
        eligibility: formData.get("eligibility"),
        registrationLink: formData.get("registrationLink"),
        image: imagePreview,
        organizer: user?.name || "Faculty",
        maxCapacity: parseInt(formData.get("maxCapacity") as string) || 100,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        toast({
          title: "Event Published Successfully",
          description: "Your event is now live.",
        });
        setImagePreview(null);
        setIsOpen(false);
        onCreated && onCreated();
      } else {
        throw new Error("Failed to publish event");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to publish event",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to the college calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Intro to Cloud Computing"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <select
                  name="type"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select type</option>
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="sports">Sports</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Main Auditorium"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                name="description"
                placeholder="Describe the event..."
                required
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxCapacity">Max Capacity</Label>
              <Input
                id="maxCapacity"
                name="maxCapacity"
                type="number"
                defaultValue={"100"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Event Image (Optional)</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registrationLink">Registration Link</Label>
              <Input
                id="registrationLink"
                name="registrationLink"
                placeholder="https://forms.gle/..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Publish Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AttendancePanel({
  onAttendanceSaved,
}: {
  onAttendanceSaved: () => void;
}) {
  const { toast } = useToast();
  const { user } = useAuth();

  // =========================
  // SECTION-WISE STUDENT DATA
  // =========================
  const sections = {
    A: [
      { id: 1, name: "Sample Student 01", roll: "DEMO-A-001", present: true },
      { id: 2, name: "Sample Student 02", roll: "DEMO-A-002", present: true },
      { id: 3, name: "Sample Student 03", roll: "DEMO-A-003", present: true },
      { id: 4, name: "Sample Student 04", roll: "DEMO-A-004", present: true },
      { id: 5, name: "Sample Student 05", roll: "DEMO-A-005", present: true },
      { id: 6, name: "Sample Student 06", roll: "DEMO-A-006", present: true },
      { id: 7, name: "Sample Student 07", roll: "DEMO-A-007", present: true },
      { id: 8, name: "Sample Student 08", roll: "DEMO-A-008", present: true },
      { id: 9, name: "Sample Student 09", roll: "DEMO-A-009", present: true },
    ],
    B: [
      { id: 10, name: "Sample Student 10", roll: "DEMO-B-010", present: true },
      { id: 11, name: "Sample Student 11", roll: "DEMO-B-011", present: true },
      { id: 12, name: "Sample Student 12", roll: "DEMO-B-012", present: true },
      { id: 13, name: "Sample Student 13", roll: "DEMO-B-013", present: true },
      { id: 14, name: "Sample Student 14", roll: "DEMO-B-014", present: true },
      { id: 15, name: "Sample Student 15", roll: "DEMO-B-015", present: true },
      { id: 16, name: "Sample Student 16", roll: "DEMO-B-016", present: true },
      { id: 17, name: "Sample Student 17", roll: "DEMO-B-017", present: true },
    ],
    C: [
      { id: 18, name: "Sample Student 18", roll: "DEMO-C-018", present: true },
      { id: 19, name: "Sample Student 19", roll: "DEMO-C-019", present: true },
      { id: 20, name: "Sample Student 20", roll: "DEMO-C-020", present: true },
      { id: 21, name: "Sample Student 21", roll: "DEMO-C-021", present: true },
      { id: 22, name: "Sample Student 22", roll: "DEMO-C-022", present: true },
      { id: 23, name: "Sample Student 23", roll: "DEMO-C-023", present: true },
      { id: 24, name: "Sample Student 24", roll: "DEMO-C-024", present: true },
      { id: 25, name: "Sample Student 25", roll: "DEMO-C-025", present: true },
    ],
  };

  // =========================
  // STATE
  // =========================
  const [activeSection, setActiveSection] = useState<"A" | "B" | "C">("A");
  const [attendanceBySection, setAttendanceBySection] = useState(sections);
  const [saving, setSaving] = useState(false);
  const attendance = attendanceBySection[activeSection];

  // =========================
  // HANDLERS
  // =========================
  const changeSection = (section: "A" | "B" | "C") => {
    setActiveSection(section);
  };

  const toggleAttendance = (id: number) => {
    setAttendanceBySection((prev) => ({
      ...prev,
      [activeSection]: prev[activeSection].map((student) =>
        student.id === id
          ? { ...student, present: !student.present }
          : student
      ),
    }));
  };

  const submitAttendance = async () => {
    setSaving(true);
    try {
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")}`;
      const response = await fetch("/api/attendance/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          section: activeSection,
          className: "CS304 - Data Structures",
          facultyId: user?.id || "faculty",
          students: attendance.map((student) => ({
            studentId: String(student.id),
            studentName: student.name,
            rollNumber: student.roll,
            present: student.present,
          })),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Failed to save attendance");
      }

      toast({
        title: "Attendance Submitted",
        description: `Section ${activeSection}: ${
          attendance.filter((student) => student.present).length
        } / ${attendance.length} Present`,
      });
      onAttendanceSaved();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Attendance not saved",
        description:
          error instanceof Error ? error.message : "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance – CS304</CardTitle>
        <CardDescription>
          Date: {new Date().toLocaleDateString()}
        </CardDescription>

        {/* SECTION SELECTOR */}
        <div className="flex gap-2 mt-4">
          {(["A", "B", "C"] as const).map((sec) => (
            <Button
              key={sec}
              variant={activeSection === sec ? "default" : "outline"}
              onClick={() => changeSection(sec)}
            >
              Section {sec}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {attendance.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div>
                <div className="font-medium">{student.name}</div>
                <div className="text-xs text-muted-foreground">
                  {student.roll}
                </div>
              </div>

              <Button
                size="sm"
                variant={student.present ? "default" : "outline"}
                className={
                  student.present ? "bg-green-600 hover:bg-green-700" : ""
                }
                onClick={() => toggleAttendance(student.id)}
              >
                {student.present ? "Present" : "Absent"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Total Present: {attendance.filter((s) => s.present).length} /{" "}
          {attendance.length}
        </div>
        <Button onClick={submitAttendance} disabled={saving}>
          {saving ? "Submitting..." : "Submit Attendance"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function AttendanceCalendar({ refreshKey }: { refreshKey: number }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateRecords, setSelectedDateRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [monthLoading, setMonthLoading] = useState(true);
  const [monthError, setMonthError] = useState(false);
  const [selectedDateError, setSelectedDateError] = useState(false);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  const formatMonthKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    const fetchMonthAttendance = async () => {
      setMonthLoading(true);
      setMonthError(false);
      try {
        const response = await fetch(
          `/api/attendance?month=${formatMonthKey(currentDate)}`
        );
        if (!response.ok) {
          throw new Error("Failed to load attendance history");
        }
        const data = await response.json();
        setAttendanceRecords(data.records || []);
      } catch (error) {
        console.error("Error fetching attendance history:", error);
        setAttendanceRecords([]);
        setMonthError(true);
      } finally {
        setMonthLoading(false);
      }
    };

    fetchMonthAttendance();
  }, [currentDate, refreshKey]);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchSelectedDateAttendance = async () => {
      setLoading(true);
      setSelectedDateError(false);
      try {
        const response = await fetch(
          `/api/attendance?date=${formatDateKey(selectedDate)}`
        );
        if (!response.ok) {
          throw new Error("Failed to load attendance records for this date");
        }
        const data = await response.json();
        setSelectedDateRecords(data.records || []);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setSelectedDateRecords([]);
        setSelectedDateError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedDateAttendance();
  }, [selectedDate, refreshKey]);

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const previousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attendance Calendar</CardTitle>
        <CardDescription>View attendance history by date</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            ←
          </Button>
          <div className="font-bold">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            →
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-xs font-bold text-center text-muted-foreground py-2"
            >
              {d}
            </div>
          ))}

          {days.map((day, idx) => {
            const dateStr =
              day === null
                ? null
                : formatDateKey(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day as number
                    )
                  );
            const dayRecords = dateStr
              ? attendanceRecords.filter(
                  (record) => String(record.date).split("T")[0] === dateStr
                )
              : [];
            const record = dayRecords.length > 0;
            const percentage = record
              ? Math.round(
                  (dayRecords.filter((attendance) => attendance.present)
                    .length /
                    dayRecords.length) *
                    100
                )
              : 0;
            return (
              <div
                key={idx}
                onClick={() => day && handleDateClick(day as number)}
                className={`p-2 text-center text-sm rounded-md cursor-pointer transition-colors ${
                  day === null
                    ? "bg-transparent"
                    : record
                    ? percentage >= 80
                      ? "bg-green-100 hover:bg-green-200 text-green-900"
                      : percentage >= 70
                      ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
                      : "bg-red-100 hover:bg-red-200 text-red-900"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {day && (
                  <div>
                    <div className="font-bold">{day}</div>
                    {record && <div className="text-xs">{percentage}%</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {monthLoading ? (
          <div className="text-xs text-muted-foreground">
            Loading attendance history...
          </div>
        ) : monthError ? (
          <div className="text-xs text-muted-foreground">
            Unable to load attendance history.
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            No attendance records for this month
          </div>
        ) : null}

        {selectedDate && (
          <div className="p-3 bg-muted rounded-md space-y-2 mt-4">
            <div className="text-sm font-bold">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            {loading ? (
              <div className="text-xs text-muted-foreground">
                Loading attendance records...
              </div>
            ) : selectedDateRecords.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Present: {selectedDateRecords.filter((r) => r.present).length}{" "}
                  / {selectedDateRecords.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Percentage:{" "}
                  {Math.round(
                    (selectedDateRecords.filter((r) => r.present).length /
                      selectedDateRecords.length) *
                      100
                  )}
                  %
                </div>
                <div className="mt-2 text-xs space-y-4">
                  {(() => {
                    const groups: Record<string, any[]> = {};
                    selectedDateRecords.forEach((r) => {
                      const sec = r.section || "Unknown";
                      if (!groups[sec]) groups[sec] = [];
                      groups[sec].push(r);
                    });
                    return Object.keys(groups)
                      .sort()
                      .map((sec) => (
                        <div key={sec} className="border rounded p-2 bg-card">
                          <div className="font-medium mb-2">Section {sec}</div>
                          <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                            {groups[sec].map((record) => (
                              <div
                                key={record.id}
                                className="flex justify-between"
                              >
                                <span>
                                  {record.studentName}{" "}
                                  <span className="text-muted-foreground">
                                    ({record.rollNumber})
                                  </span>
                                </span>
                                <span
                                  className={
                                    record.present
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {record.present ? "Present" : "Absent"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {selectedDateError
                  ? "Unable to load attendance records for this date"
                  : "No attendance recorded for this date"}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
