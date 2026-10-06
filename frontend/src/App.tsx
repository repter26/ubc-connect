import { useState, useEffect } from "react";
import type { View, UserProfile, Event as UbcEvent } from "./types";
import Navbar from "./Navbar";
import Landing from "./Landing";
import Onboarding from "./Onboarding";
import Feed from "./Feed";
import EventDetail from "./EventDetail";
import Chats from "./Chats";
import Profile from "./Profile";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<UbcEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events`,
        );

        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        const data: UbcEvent[] = await response.json();
        setEvents(data);
      } catch {
        setError("Events could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const navigate = (v: View, eventId?: string) => {
    setView(v);
    if (eventId !== undefined) setSelectedEvent(eventId);
    window.scrollTo(0, 0);
  };

  const handleComplete = (p: UserProfile) => {
    setProfile(p);
    setIsLoggedIn(true);
    navigate("feed");
  };

  return (
    <div className="min-h-screen bg-warm font-sans">
      {isLoggedIn && view !== "onboarding" && (
        <Navbar view={view} navigate={navigate} profile={profile} />
      )}
      {view === "landing" && (
        <Landing onGetStarted={() => navigate("onboarding")} />
      )}
      {view === "onboarding" && <Onboarding onComplete={handleComplete} />}
      {view === "feed" && (
        <Feed
          navigate={navigate}
          profile={profile}
          events={events}
          loading={loading}
          error={error}
        />
      )}
      {view === "event" && (
        <EventDetail
          eventId={selectedEvent}
          navigate={navigate}
          events={events}
          loading={loading}
          error={error}
        />
      )}
      {view === "chats" && <Chats />}
      {view === "profile" && <Profile navigate={navigate} profile={profile} />}
    </div>
  );
}
