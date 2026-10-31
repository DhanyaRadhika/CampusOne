import { createContext, useContext, useState, ReactNode } from "react";
import { MOCK_EVENTS, Event } from "@/lib/mock-data";

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);

  const addEvent = (newEvent: Omit<Event, "id">) => {
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(), // Simple ID generation
    };
    setEvents((prev) => [...prev, event]);
  };

  return (
    <EventsContext.Provider value={{ events, addEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
}
