import { useState } from "react";
import { useChatStore } from "./chatContext";
import type { View } from "./types";
import EventChatPlan from "./EventChatPlan";

const POLL_TEMPLATES = [
  {
    question: "How are we getting there?",
    options: [
      "🚌 Bus / Transit",
      "🚗 Uber / Lyft split",
      "🚶 Walking",
      "🚴 Bike",
    ],
  },
  {
    question: "What time should we meet?",
    options: ["30 min before", "15 min before", "Right on time"],
  },
  {
    question: "Where should we meet up?",
    options: ["SUB / AMS Nest", "Bus Loop", "At the venue entrance"],
  },
  {
    question: "Dinner before or after?",
    options: ["Dinner before 🍜", "Dinner after 🍣", "Skip it"],
  },
];

export default function Chats({ navigate }: { navigate: (view: View, eventId?: string) => void }) {
  const { joinedRooms, activeId, selectRoom } = useChatStore();
  const [showList, setShowList] = useState(false);
  const room = joinedRooms.find((r) => r.id === activeId) ?? joinedRooms[0];
  if (!room) return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold text-navy">Your Chats</h1>
      <p className="text-gray-500 my-4">Join a group from an event to start planning together.</p>
      <button onClick={() => navigate("feed")} className="bg-navy text-white px-5 py-2 rounded-xl">Explore events</button>
    </div>
  );
  return <Conversation key={room.id} navigate={navigate} showList={showList} setShowList={setShowList} selectRoom={selectRoom} />;
}

function Conversation({ navigate, showList, setShowList, selectRoom }: {
  navigate: (view: View, eventId?: string) => void;
  showList: boolean;
  setShowList: (show: boolean) => void;
  selectRoom: (id: string) => void;
}) {
  const { joinedRooms, activeId, sendText, sendPoll: createPoll, votePoll, leaveRoom } = useChatStore();
  const room = joinedRooms.find((r) => r.id === activeId) ?? joinedRooms[0]!;
  const [input, setInput] = useState("");
  const [showPollPicker, setShowPollPicker] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const allItems = room.chat;
  const send = () => {
    if (!input.trim()) return;
    sendText(room.id, input);
    setInput("");
  };
  const sendPoll = (template: { question: string; options: string[] }) => {
    createPoll(room.id, template);
    setShowPollPicker(false);
  };
  const vote = (itemId: number, option: string) => votePoll(room.id, itemId, option);
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {leaveConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-6" role="dialog" aria-modal="true" aria-labelledby="leave-title">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 id="leave-title" className="font-semibold text-navy text-lg">Leave {room.name}?</h2>
            <p className="text-gray-500 text-sm my-4">{room.kind === "event" ? "You'll give up your spot in this event room and no longer be marked as going. The room will be removed from Chats." : "This group will be removed from your Chats."}</p>
            <div className="flex gap-3">
              <button autoFocus onClick={() => setLeaveConfirm(false)} className="flex-1 border border-gray-200 py-2 rounded-xl">Cancel</button>
              <button onClick={() => { leaveRoom(room.id); setShowList(false); }} className="flex-1 bg-red-500 text-white py-2 rounded-xl">Leave group</button>
            </div>
          </div>
        </div>
      )}
      <h1
        className="font-semibold text-2xl text-navy mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Your Chats
      </h1>
      <p className="text-gray-400 text-sm mb-5">
        Your joined event rooms, together in one place
      </p>

      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex"
        style={{ height: "calc(100vh - 160px)" }}
      >
        {/* Room list sidebar */}
        <div className={`${showList ? "flex w-full" : "hidden"} md:flex md:w-64 border-r border-gray-100 flex-col flex-shrink-0`}>
          <div className="flex-1 overflow-y-auto">
            {joinedRooms.map((r) => {
              const roomItems = r.chat;
              const lastMsg = [...roomItems]
                .reverse()
                .find((i) => i.type === "text" || i.type === "poll");
              const preview = !lastMsg
                ? ""
                : lastMsg.type === "text"
                  ? lastMsg.text
                  : `📊 ${lastMsg.question}`;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    selectRoom(r.id);
                    setShowList(false);
                    setShowMembers(false);
                    setShowPollPicker(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 text-left transition-colors hover:bg-gray-50 ${room.id === r.id ? "bg-campus border-l-2 border-l-navy" : ""}`}
                >
                  <div className="w-9 h-9 bg-campus rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {r.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-navy text-sm truncate">
                      {r.name}
                    </div>
                    <div className="text-xs text-navy/60 truncate">{r.kind === "event" ? `Event · ${r.event?.title}` : `Interest · ${r.interest}`}</div>
                    <div className="text-gray-400 text-xs truncate mt-0.5">
                      {preview}
                    </div>
                    <div className="text-gray-300 text-xs mt-1">
                      {r.members.length}/{r.capacity} members
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className={`${showList ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0`}>
          {/* Header */}
          <div className="px-3 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
            <button className="md:hidden text-sm text-navy" onClick={() => setShowList(true)} aria-label="Show conversations">← Chats</button>
            <div className="text-2xl">{room.emoji}</div>
            <div className="flex-1 min-w-0">
              <h2
                className="font-semibold text-navy truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {room.name}
              </h2>
              <p className="text-gray-400 text-xs truncate">
                {room.kind === "event" ? room.event?.title : room.interest} · {room.members.length}/{room.capacity} members
              </p>
            </div>
            <button
              onClick={() => setShowMembers((m) => !m)}
              title="Members"
              className="flex -space-x-2 hover:opacity-80 transition-opacity shrink-0"
              aria-label="Show members"
            >
              {room.members.slice(0, 3).map((m, i) => (
                <div
                  key={i}
                  title={m.name}
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white ${m.you ? "bg-gold text-navy" : "bg-navy text-white"}`}
                >
                  {m.avatar}
                </div>
              ))}
            </button>
          </div>

          {room.event && <EventChatPlan room={room} navigate={navigate} />}
          <button onClick={() => setLeaveConfirm(true)} className="self-end text-xs text-red-500 px-5 py-2 hover:underline">Leave group</button>
          <div className="flex flex-1 min-h-0 relative">
            {/* Messages */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {allItems.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hello to your group!</p>}
                {allItems.map((item) => {
                  if (item.type === "system")
                    return (
                      <div key={item.id} className="text-center">
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                          {item.text}
                        </span>
                      </div>
                    );

                  if (item.type === "poll") {
                    const total = item.options.reduce(
                      (s, o) => s + o.voters.length,
                      0,
                    );
                    const myVote = item.options.find((o) =>
                      o.voters.includes("You"),
                    );
                    const winner =
                      total > 0
                        ? [...item.options].sort(
                            (a, b) => b.voters.length - a.voters.length,
                          )[0]
                        : null;
                    return (
                      <div key={item.id} className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${item.user === "You" ? "bg-gold text-navy" : "bg-navy text-white"}`}
                        >
                          {item.avatar}
                        </div>
                        <div className="flex-1 max-w-sm">
                          <div className="text-xs text-gray-400 mb-1">
                            {item.user} · {item.time}
                          </div>
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <div className="text-xs font-medium text-gray-400 mb-0.5">
                                📊 Poll
                              </div>
                              <div
                                className="font-semibold text-navy text-sm"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                {item.question}
                              </div>
                            </div>
                            <div className="p-3 space-y-2">
                              {item.options.map((opt) => {
                                const pct =
                                  total > 0
                                    ? Math.round(
                                        (opt.voters.length / total) * 100,
                                      )
                                    : 0;
                                const voted = opt.voters.includes("You");
                                const leading =
                                  winner?.label === opt.label &&
                                  winner.voters.length > 0;
                                return (
                                  <button
                                    key={opt.label}
                                    onClick={() => vote(item.id, opt.label)}
                                    className={`w-full text-left rounded-xl overflow-hidden border transition-all ${voted ? "border-navy" : "border-gray-100 hover:border-navy/30"}`}
                                  >
                                    <div className="relative px-3 py-2">
                                      {total > 0 && (
                                        <div
                                          className={`absolute inset-0 rounded-xl ${leading ? "bg-navy/8" : "bg-gray-50"}`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      )}
                                      <div className="relative flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          {voted && (
                                            <span className="text-navy text-xs">
                                              ✓
                                            </span>
                                          )}
                                          <span
                                            className={`text-sm ${voted ? "text-navy font-medium" : "text-gray-700"}`}
                                          >
                                            {opt.label}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                          {opt.voters
                                            .slice(0, 3)
                                            .map((v, vi) => (
                                              <div
                                                key={vi}
                                                className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border border-white ${v === "You" ? "bg-gold text-navy" : "bg-navy text-white"}`}
                                              >
                                                {v[0]}
                                              </div>
                                            ))}
                                          {pct > 0 && (
                                            <span className="text-xs text-gray-400">
                                              {pct}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="px-4 pb-3 text-xs text-gray-400">
                              {total} vote{total !== 1 ? "s" : ""} ·{" "}
                              {myVote ? `You: ${myVote.label}` : "Tap to vote"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const isYou = item.user === "You";

                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2.5 ${
                        isYou ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                          isYou ? "bg-gold text-navy" : "bg-navy text-white"
                        }`}
                      >
                        {item.avatar}
                      </div>

                      <div
                        className={`flex min-w-0 max-w-[75%] flex-col ${
                          isYou ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="text-xs text-gray-400 mb-1">
                          {isYou ? "You" : item.user} · {item.time}
                        </div>

                        <div
                          className={`w-fit max-w-full whitespace-pre-wrap [overflow-wrap:anywhere] text-left text-sm px-4 py-2.5 rounded-2xl leading-relaxed ${
                            isYou
                              ? "bg-navy text-white rounded-tr-sm"
                              : "bg-gray-100 text-gray-700 rounded-tl-sm"
                          }`}
                        >
                          {item.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showPollPicker && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-navy">
                      Quick polls
                    </span>
                    <button
                      onClick={() => setShowPollPicker(false)}
                      className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {POLL_TEMPLATES.map((t) => (
                      <button
                        key={t.question}
                        onClick={() => sendPoll(t)}
                        className="text-left bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-navy/30 transition-colors"
                      >
                        <div className="text-navy text-xs font-medium leading-snug">
                          {t.question}
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          {t.options.slice(0, 2).join(", ")}…
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => setShowPollPicker((p) => !p)}
                  title="Create a poll"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${showPollPicker ? "bg-navy text-white border-navy" : "border-gray-200 text-gray-400 hover:border-navy/30 hover:text-navy"}`}
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Message ${room.name} or tap 📊 for a poll…`}
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors"
                />
                <button
                  onClick={send}
                  className="bg-navy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-navy-light transition-colors"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Members panel — toggled from header */}
            {showMembers && (
              <div className="absolute inset-0 z-10 bg-white md:static md:w-56 border-l border-gray-100 flex flex-col flex-shrink-0">
                <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Members <button onClick={() => setShowMembers(false)} className="ml-3 text-navy" aria-label="Close members">×</button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {room.members.length}/{room.capacity}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {room.members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.you ? "bg-gold text-navy" : "bg-navy text-white"}`}
                      >
                        {m.avatar}
                      </div>
                      <div>
                        <div className="text-navy text-sm font-medium">
                          {m.name}
                          {m.you && (
                            <span className="text-gold text-xs"> (you)</span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {m.year} year
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400 italic px-1">
                    {room.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
