  const [sections, setSections] = useState<Record<string, any[]>>({});
  const [activeSection, setActiveSection] = useState<string>("");
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [searchRoll, setSearchRoll] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const loadRoster = () => {
      setLoadingRoster(true);
      // Group students by section (10th character in roll)
      const groups: Record<string, any[]> = {};
      students.forEach((student) => {
        const section = student.roll[9] || "Unknown";
        if (!groups[section]) groups[section] = [];
        groups[section].push(student);
      });
      setSections(groups);
      const keys = Object.keys(groups).sort();
      if (keys.length) {
        setActiveSection(keys[0]);
        setAttendance(groups[keys[0]] || []);
      }
      setLoadingRoster(false);
    };
    loadRoster();
  }, []);

  useEffect(() => {
    if (sections && sections[activeSection])
      setAttendance(sections[activeSection]);
    else setAttendance([]);
  }, [activeSection, sections]);

  const handleSearch = async () => {
    if (!searchRoll) return;
    try {
      const res = await fetch(
        `/api/attendance?roll=${encodeURIComponent(searchRoll)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.records || []);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.error(e);
      setSearchResults([]);
    }
  };

  const toggleAttendance = (id: number) => {
    setAttendance((prev) =>
      prev.map((s) => (s.id === id ? { ...s, present: !s.present } : s))
    );
  };

  const submitAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      for (const student of attendance) {
        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            studentId: student.id,
            studentName: student.name,
            rollNumber: student.roll,
            className: "CS304",
            section: activeSection,
            present: student.present,
            facultyId: "faculty1",
          }),
        });
        if (!response.ok) throw new Error("Failed to submit");
      }
      toast({
        title: `Attendance Submitted`,
        description: `Section ${activeSection}: ${
          attendance.filter((s) => s.present).length
        } / ${attendance.length} Present`,
      });
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance – CS304</CardTitle>
        <CardDescription>
          Date: {new Date().toLocaleDateString()}
        </CardDescription>
        <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {loadingRoster ? (
              <div className="text-sm text-muted-foreground">
                Loading roster…
              </div>
            ) : (
              Object.keys(sections).map((sec) => (
                <Button
                  key={sec}
                  variant={activeSection === sec ? "default" : "outline"}
                  onClick={() => setActiveSection(sec)}
                >
                  Section {sec}
                </Button>
              ))
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search roll e.g. 23A31A4201"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
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
        <Button onClick={submitAttendance}>Submit Attendance</Button>
      </CardFooter>
    </Card>
  );
}

function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateRecords, setSelectedDateRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const attendanceRecords: Record<string, { present: number; total: number }> =
    {
      "2024-12-16": { present: 45, total: 50 },
      "2024-12-15": { present: 48, total: 50 },
    };

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (d: Date) => d.toISOString().split("T")[0];

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

  const handleDateClick = async (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
    setLoading(true);
    try {

function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateRecords, setSelectedDateRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const attendanceRecords: Record<string, { present: number; total: number }> =
    {
      "2024-12-16": { present: 45, total: 50 },
      "2024-12-15": { present: 48, total: 50 },
    };

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (d: Date) => d.toISOString().split("T")[0];

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

  const handleDateClick = async (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
    setLoading(true);
    try {
      const dateStr = formatDateKey(clickedDate);
      const response = await fetch(`/api/attendance?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedDateRecords(data.records || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
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
            const record = dateStr ? attendanceRecords[dateStr] : null;
            const percentage = record
              ? Math.round((record.present / record.total) * 100)
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
                No attendance recorded for this date
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
