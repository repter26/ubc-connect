import { useState } from "react";
import type { View, Event as UbcEvent } from "./types";
import type { PollMessage } from "./chatTypes";
import { useChatStore } from "./chatContext";

interface EventDetailProps {
  eventId: string | null;
  navigate: (v: View, eventId?: string) => void;
  events: UbcEvent[];
  loading: boolean;
  error: string;
}

const SOURCE_BADGE: Record<string, string> = {
  ams: "bg-blue-500 text-white",
  ubc: "bg-blue-500 text-white",
  "club-website": "bg-purple-500 text-white",
  instagram: "bg-pink-500 text-white",
};
const SOURCE_LABEL: Record<string, string> = {
  ams: "AMS Events",
  ubc: "UBC Events",
  "club-website": "Club Page",
  instagram: "Instagram",
};
type TrustTier = "trusted" | "regular" | "caution" | "restricted";
const TRUST_TIER_META: Record<
  TrustTier,
  { label: string; color: string; ring: string; icon: string }
> = {
  trusted: {
    label: "Trusted",
    color: "text-green-600",
    ring: "ring-2 ring-green-400",
    icon: "✓",
  },
  regular: { label: "Regular", color: "text-gray-400", ring: "", icon: "" },
  caution: {
    label: "Caution",
    color: "text-amber-600",
    ring: "ring-2 ring-amber-400",
    icon: "⚠",
  },
  restricted: {
    label: "Restricted",
    color: "text-red-500",
    ring: "ring-2 ring-red-400",
    icon: "🚫",
  },
};

export default function EventDetail({ eventId, navigate, events, loading, error }: EventDetailProps) {
  const [tab, setTab] = useState<"info" | "groups">("info");
  const { rooms, joinedRooms, joinRoom, selectRoom, membershipPending } = useChatStore();
  const [MY_TRUST] = useState<TrustTier>("regular");
  const myStrikes = 0;
  const event = events.find((e) => e.id === eventId);
  if (loading) return <p>Loading event...</p>;
  if (error) return <p>{error}</p>;
  if (!event) return (
    <div className="p-6">
      <p>Event not found.</p>
      <button onClick={() => navigate("feed")}>Back to events</button>
    </div>
  );
  const groups = rooms.filter((room) => room.kind === "event" && room.eventId === event.id);
  const joinedGroup = joinedRooms.find((room) => room.kind === "event" && room.eventId === event.id);
  const joinedGroupId = joinedGroup?.id ?? null;
  const openChat = (id: string) => {
    selectRoom(id);
    navigate("chats");
  };
  const joinGroup = async (id: string) => {
    if (MY_TRUST !== "restricted" && await joinRoom(id)) navigate("chats");
  };
  // ── Event detail view ───────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <button
        onClick={() => navigate("feed")}
        className="flex items-center gap-2 text-navy/50 hover:text-navy text-sm mb-5 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to feed
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
        <div className="relative h-48">
          <img src={event.imageUrl ?? undefined} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/75 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${SOURCE_BADGE[event.source]}`}
              >
                {SOURCE_LABEL[event.source]}
              </span>
              <span className="bg-navy/80 text-gold text-xs font-semibold px-2.5 py-1 rounded-full">
                {event.matchScore}% match
              </span>
            </div>
            <h1
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {event.title}
            </h1>
            <p className="text-white/65 text-sm mt-0.5">by {event.organizer}</p>
          </div>
        </div>
        <div className="px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-gray-100">
          <InfoItem
            icon="calendar"
            text={`${event.startsAt} · ${event.endsAt}`}
          />
          <InfoItem icon="location" text={event.location} />
          <InfoItem
            icon="people"
            text={joinedGroup ? `${joinedGroup.members.length} going in your room` : "Join a room to see who’s going"}
          />
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => joinedGroup ? openChat(joinedGroup.id) : setTab("groups")}
              disabled={membershipPending}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${joinedGroup ? "bg-green-500 text-white hover:bg-green-600" : "bg-gold text-navy hover:bg-gold-dark"}`}
            >
              {joinedGroup ? "✓ You’re going · Open chat" : "Choose a room →"}
            </button>
          </div>
        </div>
        <div className="px-5 py-3 flex items-center gap-3">
          <div className="flex -space-x-2">
            {(joinedGroup?.members ?? []).map((g, i) => (
              <div
                key={i}
                title={g.name}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${g.you ? "bg-gold text-navy" : "bg-navy text-white"}`}
              >
                {g.avatar}
              </div>
            ))}
          </div>
          <span className="text-gray-400 text-sm">
            {joinedGroup ? joinedGroup.members.map((member) => member.name).join(", ") : "Choose a room to go together"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(
          [
            { key: "info", label: "📋 Details" },
            {
              key: "groups",
              label: `👥 Going-together groups (${groups.length})`,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-navy text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-navy/30"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {tab === "info" && (
          <div>
            <h3
              className="font-semibold text-navy mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              About this event
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              {event.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {event.tags.map((t) => (
                <span
                  key={t}
                  className="bg-campus text-navy text-xs px-3 py-1.5 rounded-full font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Organized by
              </div>
              <div className="text-navy font-medium text-sm">
                {event.organizer}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Meetup point
              </div>
              <div className="text-navy font-medium text-sm mb-2">
                📍 {event.meetupPoint}
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-navy/50 hover:text-navy transition-colors"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        )}

        {tab === "groups" && (
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3
                  className="font-semibold text-navy"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Going-together groups
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Find a room and plan your meetup
                </p>
              </div>
              {joinedGroup && (
                <button
                  onClick={() => openChat(joinedGroup!.id)}
                  className="flex items-center gap-1.5 bg-campus text-navy border border-navy/20 text-xs font-medium px-3 py-1.5 rounded-xl hover:bg-navy hover:text-white transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Open group chat →
                </button>
              )}
            </div>

            {/* Restricted banner — shown if the current user is restricted */}
            {MY_TRUST === "restricted" && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <span className="text-lg mt-0.5">🚫</span>
                <div>
                  <div className="text-red-700 text-sm font-semibold">
                    Your account is restricted
                  </div>
                  <div className="text-red-500 text-xs mt-0.5 leading-relaxed">
                    You have {myStrikes} strikes and cannot join going-together
                    groups. You can still browse events and chat rooms. Visit
                    your profile to see what's needed to lift the restriction.
                  </div>
                </div>
              </div>
            )}

            {groups.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                No groups yet.
              </div>
            )}

            <div className="space-y-4">
              {groups.map((group) => {
                const isJoined = joinedGroupId === group.id;
                const full = group.members.length >= group.capacity && !isJoined;
                const polls = group.chat.filter(
                  (i): i is PollMessage => i.type === "poll",
                );
                const decisions = polls.filter((p) =>
                  p.options.some((o) => o.voters.length > 0),
                );
                const flaggedMembers = group.members.filter(
                  (m) => m.trust === "caution" || m.trust === "restricted",
                );
                const hasRestricted = group.members.some(
                  (m) => m.trust === "restricted",
                );
                const meRestricted = MY_TRUST === "restricted";

                return (
                  <div
                    key={group.id}
                    className={`rounded-2xl border transition-all ${isJoined ? "border-navy" : hasRestricted ? "border-amber-200" : "border-gray-100 hover:border-navy/20"}`}
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-semibold text-navy text-sm"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              {group.name}
                            </span>
                            {isJoined && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-navy text-white font-medium">
                                ✓ Joined
                              </span>
                            )}
                            {full && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
                                Full
                              </span>
                            )}
                            {flaggedMembers.length > 0 && !isJoined && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                                ⚠ {flaggedMembers.length} flagged member
                                {flaggedMembers.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Up to {group.capacity} people
                          </div>
                        </div>
                      </div>

                      {decisions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {decisions.map((p) => {
                            const top = [...p.options].sort(
                              (a, b) => b.voters.length - a.voters.length,
                            )[0];
                            return (
                              <span
                                key={p.id}
                                className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full"
                              >
                                ✅ {top.label}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {group.members.slice(0, 6).map((m, i) => {
                            const meta = m.trust
                              ? TRUST_TIER_META[m.trust]
                              : null;
                            return (
                              <div
                                key={i}
                                title={`${m.name}${m.trust && m.trust !== "regular" ? ` · ${TRUST_TIER_META[m.trust].label}` : ""}`}
                                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white ${m.you ? "bg-gold text-navy" : "bg-navy text-white"} ${meta?.ring ?? ""}`}
                              >
                                {m.avatar}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-gray-400 text-xs">
                          {group.members.length}/{group.capacity} people
                        </span>
                        {flaggedMembers.length > 0 && (
                          <div className="ml-auto flex items-center gap-1">
                            {flaggedMembers.map((m) => (
                              <span
                                key={m.name}
                                className="text-xs text-gray-400"
                                title={`${m.name}: ${m.strikes} strike${m.strikes !== 1 ? "s" : ""}`}
                              >
                                {TRUST_TIER_META[m.trust!].icon}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-400 italic truncate flex-1">
                        {(() => {
                          const last = [...group.chat]
                            .reverse()
                            .find(
                              (i) => i.type === "text" || i.type === "poll",
                            );
                          if (!last) return "";
                          if (last.type === "text") return `"${last.text}"`;
                          if (last.type === "poll")
                            return `📊 "${last.question}"`;
                          return "";
                        })()}
                      </div>
                      {isJoined ? (
                        <button
                          onClick={() => openChat(joinedGroup!.id)}
                          className="flex-shrink-0 flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-navy-light transition-colors"
                        >
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          Open chat →
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            !meRestricted && !full && joinGroup(group.id)
                          }
                          disabled={full || meRestricted || membershipPending}
                          title={
                            meRestricted
                              ? "Your account is restricted — visit your profile"
                              : undefined
                          }
                          className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${full || meRestricted ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-navy text-white hover:bg-navy-light"}`}
                        >
                          {meRestricted
                            ? "🚫 Restricted"
                            : full
                              ? "Full"
                              : membershipPending ? "Please wait…" : "Join →"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  text,
}: {
  icon: "calendar" | "location" | "people";
  text: string;
}) {
  const paths: Record<string, string> = {
    calendar:
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    location:
      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    people:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  };
  return (
    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
      <svg
        className="w-4 h-4 text-navy/30 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={paths[icon]}
        />
      </svg>
      {text}
    </div>
  );
}
