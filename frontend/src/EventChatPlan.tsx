import { useState } from "react";
import { useChatStore } from "./chatContext";
import type { ChatRoom, CoordinationType } from "./chatTypes";
import type { View } from "./types";

export default function EventChatPlan({ room, navigate }: {
  room: ChatRoom;
  navigate: (view: View, eventId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { coordination, voteCoordination } = useChatStore();
  const event = room.event;
  if (!event) return null;
  const votes = coordination[room.id] ?? { meetup: {}, transport: {} };
  const categories: { key: CoordinationType; label: string; options: string[] }[] = [
    { key: "meetup", label: "📍 Where are we meeting?", options: [...new Set([event.meetupPoint, event.location, "AMS Nest entrance", "Bus loop"].filter((option): option is string => Boolean(option)))] },
    { key: "transport", label: "🚗 How are we getting there?", options: ["🚶 Walk", "🚌 Bus", "🚗 Uber split", "🚴 Bike"] },
  ];
  const decisions = room.chat.filter((item) => item.type === "poll").map((poll) => {
    const top = [...poll.options].sort((a, b) => b.voters.length - a.voters.length)[0];
    return { id: poll.id, question: poll.question, winner: top && top.voters.length > 0 ? top.label : null };
  });
  return (
    <section className="border-b border-gray-100 bg-gray-50/60 shrink-0">
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        <button onClick={() => navigate("event", event.id)} className="text-left text-xs text-navy hover:underline min-w-0 truncate">📅 {event.title} →</button>
        <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="event-group-plan" className="text-xs text-navy font-semibold shrink-0">📌 Group plan {expanded ? "▴" : "▾"}</button>
      </div>
      {expanded && (
        <div id="event-group-plan" className="px-4 pb-4 space-y-4 max-h-[35vh] overflow-y-auto">
          <p className="text-xs text-gray-500">{event.startsAt}{event.endsAt ? ` – ${event.endsAt}` : ""} · {event.location}</p>
          {event.transit && <p className="text-xs text-gray-500">Transit: {event.transit}</p>}
          {categories.map(({ key, label, options }) => (
            <div key={key}>
              <h3 className="text-xs font-medium text-gray-500 mb-2">{label}</h3>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const voters = votes[key][option] ?? [];
                  const selected = voters.includes("You");
                  return <button key={option} aria-pressed={selected} onClick={() => voteCoordination(room.id, key, option)} className={`px-3 py-1.5 rounded-xl border text-xs ${selected ? "bg-navy text-white border-navy" : "bg-white text-gray-600 border-gray-200 hover:border-navy/30"}`}>{option}{voters.length > 0 ? ` · ${voters.length} vote${voters.length === 1 ? "" : "s"}` : ""}{selected ? " ✓" : ""}</button>;
                })}
              </div>
            </div>
          ))}
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Decided so far</h3>
            {decisions.length === 0 && <p className="text-xs text-gray-400">No group decisions yet. Create a poll to start planning.</p>}
            {decisions.map((decision) => <p key={decision.id} className="text-xs text-navy mt-1">{decision.winner ? "✅" : "⏳"} {decision.question} · {decision.winner ?? "Voting in progress…"}</p>)}
          </div>
        </div>
      )}
    </section>
  );
}
