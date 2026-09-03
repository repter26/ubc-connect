import { useState, useEffect } from "react";
import type {
  View,
  UserProfile,
  Event as UbcEvent,
  EventSource,
} from "./types";

const SOURCE_PILL: Record<string, string> = {
  ams: "bg-blue-100 text-blue-700",
  club: "bg-purple-100 text-purple-700",
  instagram: "bg-pink-100 text-pink-700",
  reddit: "bg-orange-100 text-orange-700",
};
const SOURCE_LABEL: Record<string, string> = {
  ams: "AMS",
  club: "Club Page",
  instagram: "Instagram",
  reddit: "Reddit",
};

const ROOMS = [
  {
    id: "1",
    name: "Hiking & Outdoors UBC",
    members: 47,
    unread: 3,
    last: "Anyone joining the Grouse Grind Sunday?",
    emoji: "🥾",
  },
  {
    id: "2",
    name: "CS & Tech People",
    members: 89,
    unread: 12,
    last: "Hack the Change team forming — DM me",
    emoji: "💻",
  },
  {
    id: "3",
    name: "Film & Animation Nerds",
    members: 34,
    unread: 0,
    last: "Ghibli marathon 🔥 who's in?",
    emoji: "🎬",
  },
  {
    id: "4",
    name: "Board Games & Tabletop",
    members: 28,
    unread: 1,
    last: "Settlers @ Koerner's this Fri 6pm",
    emoji: "🎲",
  },
];

const CATEGORIES = [
  "All",
  "Social",
  "Tech",
  "Outdoors",
  "Arts",
  "Cultural",
  "Career",
];

interface FeedProps {
  navigate: (v: View, eventId?: string) => void;
  profile: UserProfile | null;
}

// Mock trust state — same values as Profile.tsx
const MY_TRUST = { attended: 4, vouches: 3 };
const TRUST_TO_HOST = { attended: 6, vouches: 5 };
const canHost =
  MY_TRUST.attended >= TRUST_TO_HOST.attended &&
  MY_TRUST.vouches >= TRUST_TO_HOST.vouches;

const CATEGORIES_EVENT = [
  "Social",
  "Tech",
  "Outdoors",
  "Arts",
  "Cultural",
  "Career",
  "Sports",
  "Workshop",
];

export default function Feed({ navigate, profile }: FeedProps) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showTrustGate, setShowTrustGate] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "",
    description: "",
    maxAttendees: "20",
  });
  const [created, setCreated] = useState(false);

  const submitEvent = () => {
    if (!form.title || !form.date || !form.location) return;
    setCreated(true);
    setTimeout(() => {
      setShowCreateForm(false);
      setCreated(false);
      setForm({
        title: "",
        date: "",
        time: "",
        location: "",
        category: "",
        description: "",
        maxAttendees: "20",
      });
    }, 1800);
  };

  function formatEventDate(startsAt: string, timezone: string) {
    return new Intl.DateTimeFormat("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: timezone,
    }).format(new Date(startsAt));
  }

  function formatEventTime(
    startsAt: string,
    endsAt: string | null,
    timezone: string,
  ) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    });

    const start = formatter.format(new Date(startsAt));

    if (!endsAt) {
      return start;
    }

    return `${start} – ${formatter.format(new Date(endsAt))}`;
  }

  const filtered = events.filter((e) => {
    const okCat = category === "All" || e.category === category;
    const okSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    return okCat && okSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Trust gate modal */}
      {showTrustGate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🔒</div>
              <h3
                className="font-semibold text-navy text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Trusted Host required
              </h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Event hosting is earned through real participation. The
                community needs to know they can count on you.
              </p>
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-600">🎪 Events attended</span>
                  <span
                    className={`font-semibold ${MY_TRUST.attended >= TRUST_TO_HOST.attended ? "text-green-600" : "text-navy"}`}
                  >
                    {MY_TRUST.attended} / {TRUST_TO_HOST.attended}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-1.5 bg-navy rounded-full"
                    style={{
                      width: `${Math.min(100, (MY_TRUST.attended / TRUST_TO_HOST.attended) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-600">
                    🤝 Vouches from the community
                  </span>
                  <span
                    className={`font-semibold ${MY_TRUST.vouches >= TRUST_TO_HOST.vouches ? "text-green-600" : "text-navy"}`}
                  >
                    {MY_TRUST.vouches} / {TRUST_TO_HOST.vouches}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-1.5 bg-gold rounded-full"
                    style={{
                      width: `${Math.min(100, (MY_TRUST.vouches / TRUST_TO_HOST.vouches) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTrustGate(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:border-navy/30 transition-colors"
              >
                Got it
              </button>
              <button
                onClick={() => {
                  setShowTrustGate(false);
                  navigate("profile");
                }}
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-medium hover:bg-navy-light transition-colors"
              >
                View my profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create event modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3
                className="font-semibold text-navy text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Host an event
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            {created ? (
              <div className="px-6 py-12 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <div
                  className="font-semibold text-navy text-lg"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Event created!
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  It will appear in the feed shortly
                </div>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Event title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="e.g. Study Hike to Pacific Spirit Park"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      Time
                    </label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, time: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Location *
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="e.g. Pacific Spirit Park trailhead"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES_EVENT.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, category: c }))}
                        className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${form.category === c ? "bg-navy text-white border-navy" : "border-gray-200 text-gray-600 hover:border-navy/30"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="What's happening? What should people bring?"
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Max attendees
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={form.maxAttendees}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxAttendees: e.target.value }))
                    }
                    className="w-32 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 bg-campus rounded-xl px-4 py-3 text-xs text-navy/70">
                  <span>🎖️</span>
                  <span>
                    Posting as <strong>Trusted Host</strong> · your reputation
                    is visible to attendees
                  </span>
                </div>
              </div>
            )}
            {!created && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEvent}
                  disabled={!form.title || !form.date || !form.location}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.title && form.date && form.location ? "bg-navy text-white hover:bg-navy-light" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
                >
                  Post event →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-semibold text-navy"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Good morning, {profile?.firstName ?? "Alex"} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {filtered.length} events matching your interests this week
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              canHost ? setShowCreateForm(true) : setShowTrustGate(true)
            }
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${canHost ? "bg-gold text-navy hover:bg-gold-dark" : "bg-white border border-gray-200 text-gray-400 hover:border-navy/30"}`}
          >
            {canHost ? "+ Host an event" : "🔒 Host an event"}
          </button>
          <div className="relative w-56">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-navy transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_276px] gap-6">
        {/* Main */}
        <div>
          {/* Category pills */}
          <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? "bg-navy text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-navy/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Event grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((event) => (
              <button
                key={event.id}
                onClick={() => navigate("event", event.id)}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-navy/20 hover:shadow-md transition-all text-left group"
              >
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/${event.image}?w=600&h=240&fit=crop&auto=format`}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 bg-navy/85 text-gold text-xs font-semibold px-2.5 py-1 rounded-full">
                    {event.matchScore}% match
                  </div>
                  <div
                    className={`absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${SOURCE_PILL[event.source]}`}
                  >
                    {SOURCE_LABEL[event.source]}
                  </div>
                </div>
                <div className="p-4">
                  <h3
                    className="font-semibold text-navy text-sm leading-snug mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
                    <svg
                      className="w-3 h-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatEventDate(event.startsAt, event.timezone)} ·
                    {formatEventTime(
                      event.startsAt,
                      event.endsAt,
                      event.timezone,
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
                    <svg
                      className="w-3 h-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    {event.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      {event.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.attendees}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Your Rooms */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-semibold text-navy text-sm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your Rooms
              </h3>
              <button
                onClick={() => navigate("chats")}
                className="text-xs text-navy/40 hover:text-navy transition-colors"
              >
                See all →
              </button>
            </div>
            <div className="space-y-1">
              {ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => navigate("chats")}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-campus rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {room.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-navy text-xs font-medium truncate">
                      {room.name}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                      {room.last}
                    </div>
                  </div>
                  {room.unread > 0 && (
                    <div className="w-5 h-5 bg-navy rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {room.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Activity heatmap */}
          <div className="bg-navy rounded-2xl p-4 text-white">
            <h3
              className="font-semibold text-sm mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              This week on campus
            </h3>
            {[
              { day: "Mon", count: 2, max: 8 },
              { day: "Tue", count: 4, max: 8 },
              { day: "Wed", count: 5, max: 8 },
              { day: "Thu", count: 3, max: 8 },
              { day: "Fri", count: 7, max: 8 },
              { day: "Sat", count: 8, max: 8 },
              { day: "Sun", count: 4, max: 8 },
            ].map(({ day, count, max }) => (
              <div key={day} className="flex items-center gap-3 mb-2 last:mb-0">
                <div className="text-white/40 text-xs w-7">{day}</div>
                <div className="flex-1 bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-gold h-1.5 rounded-full transition-all"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <div className="text-white/50 text-xs w-4 text-right">
                  {count}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested rooms */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3
              className="font-semibold text-navy text-sm mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Suggested for you
            </h3>
            <div className="space-y-2">
              {[
                {
                  name: "Rock Climbing @ CRC",
                  members: 22,
                  emoji: "🧗",
                  reason: "Based on: Hiking",
                },
                {
                  name: "International Students Connect",
                  members: 156,
                  emoji: "🌏",
                  reason: "Based on: Travel",
                },
              ].map((r) => (
                <div
                  key={r.name}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-navy/20 transition-colors"
                >
                  <div className="w-8 h-8 bg-campus rounded-lg flex items-center justify-center text-base flex-shrink-0">
                    {r.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-navy text-xs font-medium truncate">
                      {r.name}
                    </div>
                    <div className="text-gray-400 text-xs">{r.reason}</div>
                  </div>
                  <button className="text-navy border border-navy/20 text-xs px-2.5 py-1 rounded-full hover:bg-navy hover:text-white transition-colors flex-shrink-0">
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
