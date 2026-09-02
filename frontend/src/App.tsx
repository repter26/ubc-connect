import { useState } from "react";
import type { View, UserProfile } from "./types";
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
      {view === "feed" && <Feed navigate={navigate} profile={profile} />}
      {view === "event" && (
        <EventDetail eventId={selectedEvent} navigate={navigate} />
      )}
      {view === "chats" && <Chats />}
      {view === "profile" && <Profile navigate={navigate} profile={profile} />}
    </div>
  );
}
