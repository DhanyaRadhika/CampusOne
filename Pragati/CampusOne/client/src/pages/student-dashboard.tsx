import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/events-context";
import { MOCK_UPDATES, Event } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Star,
  Clock,
  Trophy,
  ExternalLink,
  Bell,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Users,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BackendEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  location: string;
  organizer: string;
  image?: string;
  capacity?: number;
  registrations?: string[];
  registrationLink?: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { events: mockEvents } = useEvents();
  const { toast } = useToast();

  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollNumber, setRollNumber] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("rollNumber") : null
  );
  const [attendancePct, setAttendancePct] = useState<number | null>(null);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        } else {
          // Fallback to mock events
          setEvents(
            mockEvents.map((event) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              date: event.date,
              type: event.type,
              location: event.location,
              organizer: event.organizer || "College",
              image: event.image,
              capacity: 100,
              registrations: [],
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        // Fallback to mock events
        setEvents(
          mockEvents.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            type: event.type,
            location: event.location,
            organizer: event.organizer || "College",
            image: event.image,
            capacity: 100,
            registrations: [],
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [mockEvents]);

  // fetch attendance when rollNumber is set
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!rollNumber) return;
      try {
        const res = await fetch(
          `/api/attendance?roll=${encodeURIComponent(rollNumber)}`
        );
        if (res.ok) {
          const data = await res.json();
          const records = data.records || [];
          if (records.length === 0) {
            setAttendancePct(0);
            return;
          }
          const presentCount = records.filter((r: any) => r.present).length;
          const pct = Math.round((presentCount / records.length) * 100);
          setAttendancePct(pct);
        } else {
          setAttendancePct(null);
        }
      } catch (e) {
        console.error(e);
        setAttendancePct(null);
      }
    };
    fetchAttendance();
  }, [rollNumber]);

  const handleRegisterEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event?.registrationLink) {
      // Redirect to the registration link
      window.open(event.registrationLink, "_blank");
      return;
    }

    if (!user?.email) {
      toast({
        title: "Error",
        description: "Please log in to register for events",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        setRegisteredEvents([...registeredEvents, eventId]);
        toast({
          title: "Success!",
          description: "You have registered for this event",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Registration Failed",
          description: error.error || "Could not register for this event",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive",
      });
    }
  };

  const handleUnregisterEvent = (eventId: string) => {
    setRegisteredEvents(registeredEvents.filter((id) => id !== eventId));
    toast({
      title: "Unregistered",
      description: "You have unregistered from this event",
    });
  };

  const recommendedEvents = events.filter((event) =>
    user?.skills?.some((skill) =>
      event.title.toLowerCase().includes(skill.toLowerCase())
    )
  );

  const displayRegisteredEvents = events.filter((event) =>
    registeredEvents.includes(event.id)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome & Stats Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-2xl">
              {user?.name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 z-10">
            <h1 className="text-3xl font-heading font-bold">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Branch:</span>{" "}
                {user?.branch}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Year:</span>{" "}
                {user?.year}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">CGPA:</span>
                <span className="text-green-600 font-bold">{user?.cgpa}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2 pt-2">
              {user?.skills?.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Mini Card */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center gap-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Overall Attendance
              </p>
              <h3 className="text-4xl font-bold text-foreground">
                {attendancePct !== null ? `${attendancePct}%` : "—"}
              </h3>
            </div>
            <div className="bg-green-100 text-green-600 p-2 rounded-full">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <Progress value={attendancePct ?? 0} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {attendancePct === null ? (
              <div className="space-y-2">
                <div>Enter your roll number to see real attendance.</div>
                <div className="flex gap-2">
                  <input
                    className="px-2 py-1 border rounded-md"
                    placeholder="e.g. 23A31A4201"
                    value={rollNumber ?? ""}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (rollNumber) {
                        localStorage.setItem("rollNumber", rollNumber);
                        // trigger fetch by updating state (already set)
                        toast({
                          title: "Saved",
                          description: "Roll number saved",
                        });
                      } else {
                        toast({
                          title: "Error",
                          description: "Please enter a roll number",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : attendancePct >= 75 ? (
              "You are safely above the 75% requirement."
            ) : (
              "You are below the required minimum."
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-heading">
                Upcoming Events
              </h2>
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="registered">Registered</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading events...
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                  No events available at the moment.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isRegistered={registeredEvents.includes(event.id)}
                      onRegister={() => handleRegisterEvent(event.id)}
                      onUnregister={() => handleUnregisterEvent(event.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommended" className="mt-0">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading events...
                </div>
              ) : recommendedEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {recommendedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isRegistered={registeredEvents.includes(event.id)}
                      onRegister={() => handleRegisterEvent(event.id)}
                      onUnregister={() => handleUnregisterEvent(event.id)}
                      recommended
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                  No specific recommendations based on your skills yet.
                </div>
              )}
            </TabsContent>

            <TabsContent value="registered" className="mt-0">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading events...
                </div>
              ) : displayRegisteredEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {displayRegisteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isRegistered={true}
                      onRegister={() => handleRegisterEvent(event.id)}
                      onUnregister={() => handleUnregisterEvent(event.id)}
                      registered
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                  You haven't registered for any events yet.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: Updates */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden flex flex-col h-full max-h-[600px] shadow-sm">
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
              <h3 className="font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> College Updates
              </h3>
              <Badge variant="destructive" className="animate-pulse">
                New
              </Badge>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {MOCK_UPDATES.map((update) => (
                  <div
                    key={update.id}
                    className="group relative pl-4 border-l-2 border-muted hover:border-primary transition-colors py-1"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 rounded">
                        {new Date(update.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {update.important && (
                        <span
                          className="h-2 w-2 rounded-full bg-red-500"
                          title="Important"
                        />
                      )}
                    </div>
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                      {update.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {update.content}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t bg-muted/10">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-primary"
              >
                View All Updates <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  isRegistered,
  onRegister,
  onUnregister,
  recommended,
  registered,
}: {
  event: BackendEvent;
  isRegistered: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  recommended?: boolean;
  registered?: boolean;
}) {
  return (
    <Card className="overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary relative">
      <div className="relative h-48 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Trophy className="h-16 w-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Badge
            variant="secondary"
            className="backdrop-blur-md bg-background/80"
          >
            {event.type}
          </Badge>
          {recommended && (
            <Badge className="bg-accent text-accent-foreground border-none">
              <Star className="w-3 h-3 mr-1 fill-current" /> Recommended
            </Badge>
          )}
        </div>

        {/* Three-dot menu */}
        <div className="absolute top-2 left-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 backdrop-blur-md bg-background/80 hover:bg-background/90 border-white/20"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {isRegistered ? (
                <>
                  <DropdownMenuItem
                    onClick={onUnregister}
                    className="text-red-600 focus:text-red-600"
                  >
                    Unregister from Event
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    Already Registered
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={onRegister}>
                  <Star className="h-4 w-4 mr-2" />
                  Mark as Registered
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />{" "}
          {new Date(event.date).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" /> {event.location}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Organized by {event.organizer}
          </span>
          {event.capacity && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.registrations?.length || 0}/{event.capacity}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {isRegistered ? (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Registered
          </Button>
        ) : (
          <Button className="w-full" onClick={onRegister}>
            Register Now <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
