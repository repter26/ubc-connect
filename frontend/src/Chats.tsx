import { useEffect, useState } from "react";

interface PollOption {
  label: string;
  voters: string[];
}
interface PollMessage {
  id: number;
  type: "poll";
  user: string;
  avatar: string;
  time: string;
  question: string;
  options: PollOption[];
}
interface TextMessage {
  id: number;
  type: "text";
  user: string;
  avatar: string;
  text: string;
  time: string;
}
interface SystemMessage {
  id: number;
  type: "system";
  text: string;
}
type ChatItem = PollMessage | TextMessage | SystemMessage;

interface Member {
  name: string;
  avatar: string;
  year: string;
  you?: boolean;
}

import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

// client-side
socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

interface Room {
  id: string;
  name: string;
  emoji: string;
  interest: string;
  maxSize: number;
  description: string;
  members: Member[];
  chat: ChatItem[];
}

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

const ROOMS: Room[] = [
  {
    id: "1",
    name: "Trail Crew",
    emoji: "🥾",
    interest: "Hiking",
    maxSize: 6,
    description:
      "Small group for hikes, trail planning, and outdoor adventures",
    members: [
      { name: "Sam R.", avatar: "S", year: "3rd" },
      { name: "Nina P.", avatar: "N", year: "2nd" },
      { name: "Ben K.", avatar: "B", year: "4th" },
      { name: "Maya T.", avatar: "M", year: "1st" },
      { name: "You", avatar: "A", year: "3rd", you: true },
    ],
    chat: [],
  },
  {
    id: "2",
    name: "Debug Squad",
    emoji: "💻",
    interest: "Coding",
    maxSize: 6,
    description: "CS and tech students — study sessions, projects, hackathons",
    members: [
      { name: "Leila H.", avatar: "L", year: "3rd" },
      { name: "Chris T.", avatar: "C", year: "2nd" },
      { name: "Dev M.", avatar: "D", year: "4th" },
      { name: "You", avatar: "A", year: "3rd", you: true },
    ],
    chat: [
      {
        id: 1,
        type: "text",
        user: "Leila H.",
        avatar: "L",
        text: "Hack the Change team forming — need a designer. Anyone know one?",
        time: "9:15 AM",
      },
      {
        id: 2,
        type: "text",
        user: "Chris T.",
        avatar: "C",
        text: "My roommate does UI/UX, I'll ask her",
        time: "9:22 AM",
      },
      {
        id: 3,
        type: "poll",
        user: "Dev M.",
        avatar: "D",
        time: "9:40 AM",
        question: "Group study this week?",
        options: [
          { label: "📚 ICICS 246 Wednesday", voters: ["Dev M.", "Leila H."] },
          { label: "☕ Koerner Library Thursday", voters: ["Chris T."] },
          { label: "Can't make it this week", voters: [] },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Frame Rate",
    emoji: "🎬",
    interest: "Film",
    maxSize: 6,
    description:
      "Film fans sharing recs, attending screenings, dissecting directors",
    members: [
      { name: "Jamie L.", avatar: "J", year: "2nd" },
      { name: "Aisha K.", avatar: "A", year: "3rd" },
      { name: "Priya S.", avatar: "P", year: "1st" },
      { name: "Ryo N.", avatar: "R", year: "4th" },
      { name: "You", avatar: "A", year: "3rd", you: true },
    ],
    chat: [
      {
        id: 1,
        type: "text",
        user: "Jamie L.",
        avatar: "J",
        text: "Ghibli marathon Saturday. Spirited Away → Mononoke → Howl's. Who's in?",
        time: "Yesterday",
      },
      {
        id: 2,
        type: "text",
        user: "Aisha K.",
        avatar: "A",
        text: "Obviously. Bringing blankets and I will cry.",
        time: "Yesterday",
      },
      {
        id: 3,
        type: "poll",
        user: "Priya S.",
        avatar: "P",
        time: "Yesterday",
        question: "Ramen in Wesbrook after?",
        options: [
          {
            label: "🍜 Yes — Jinya Ramen",
            voters: ["Priya S.", "Aisha K.", "Jamie L."],
          },
          { label: "🍣 Sushi instead", voters: ["Ryo N."] },
          { label: "Head home after", voters: [] },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Dice Night",
    emoji: "🎲",
    interest: "Board Games",
    maxSize: 6,
    description:
      "Weekly board game nights — strategy, party games, everything goes",
    members: [
      { name: "Marcus W.", avatar: "M", year: "4th" },
      { name: "Jordan T.", avatar: "J", year: "2nd" },
      { name: "Soo-Jin L.", avatar: "S", year: "3rd" },
      { name: "You", avatar: "A", year: "3rd", you: true },
    ],
    chat: [
      {
        id: 1,
        type: "text",
        user: "Marcus W.",
        avatar: "M",
        text: "Settlers of Catan at Koerner's Friday 6pm. 2 spots left!",
        time: "2:00 PM",
      },
      {
        id: 2,
        type: "poll",
        user: "Jordan T.",
        avatar: "J",
        time: "2:30 PM",
        question: "Which game to start with?",
        options: [
          { label: "🏙️ Settlers of Catan", voters: ["Marcus W.", "Jordan T."] },
          { label: "🚂 Ticket to Ride", voters: ["Soo-Jin L."] },
          { label: "🗺️ Pandemic", voters: [] },
        ],
      },
    ],
  },
];

const INITIAL_CHATS = Object.fromEntries(
  ROOMS.map((r) => [r.id, r.chat as ChatItem[]]),
);

export default function Chats() {
  const [activeId, setActiveId] = useState("1");
  const [chats, setChats] = useState<Record<string, ChatItem[]>>(INITIAL_CHATS);
  const [input, setInput] = useState("");
  const [showPollPicker, setShowPollPicker] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const CURRENT_USER = params.get("user") || "Peter";
  const room = ROOMS.find((r) => r.id === activeId)!;
  const allItems: ChatItem[] = chats[activeId] ?? [];
  useEffect(() => {
    const handleMessage = ({
      roomId,
      message,
    }: {
      roomId: string;
      message: ChatItem;
    }) => {
      setChats((c) => ({
        ...c,
        [roomId]: [...(c[roomId] ?? []), message],
      }));
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []);
  const send = () => {
    if (!input.trim()) return;
    const msg: TextMessage = {
      id: Date.now(),
      type: "text",
      user: CURRENT_USER,
      avatar: "A",
      text: input,
      time: "Just now",
    };
    socket.emit("message", { roomId: activeId, message: msg });
    setChats((c) => ({ ...c, [activeId]: [...(c[activeId] ?? []), msg] }));
    setInput("");
  };

  const sendPoll = (tpl: { question: string; options: string[] }) => {
    const poll: PollMessage = {
      id: Date.now(),
      type: "poll",
      user: "You",
      avatar: "A",
      time: "Just now",
      question: tpl.question,
      options: tpl.options.map((o) => ({ label: o, voters: [] })),
    };
    socket.emit("message", { roomId: activeId, message: poll });
    setChats((c) => ({ ...c, [activeId]: [...(c[activeId] ?? []), poll] }));
    setShowPollPicker(false);
  };

  const vote = (itemId: number, optionLabel: string) => {
    setChats((c) => ({
      ...c,
      [activeId]: (c[activeId] ?? []).map((item) => {
        if (item.id !== itemId || item.type !== "poll") return item;
        const already = item.options.some((o) => o.voters.includes("You"));
        return {
          ...item,
          options: item.options.map((o) => ({
            ...o,
            voters:
              o.label === optionLabel
                ? already
                  ? o.voters.filter((v) => v !== "You")
                  : [...o.voters, "You"]
                : o.voters.filter((v) => v !== "You"),
          })),
        };
      }),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1
        className="font-semibold text-2xl text-navy mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Your Groups
      </h1>
      <p className="text-gray-400 text-sm mb-5">
        Interest-based small groups · max 6 people
      </p>

      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex"
        style={{ height: "calc(100vh - 160px)" }}
      >
        {/* Room list sidebar */}
        <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="flex-1 overflow-y-auto">
            {ROOMS.map((r) => {
              const roomItems = chats[r.id] ?? [];
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
                    setActiveId(r.id);
                    setShowMembers(false);
                    setShowPollPicker(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 text-left transition-colors hover:bg-gray-50 ${activeId === r.id ? "bg-campus border-l-2 border-l-navy" : ""}`}
                >
                  <div className="w-9 h-9 bg-campus rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {r.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-navy text-sm truncate">
                      {r.name}
                    </div>
                    <div className="text-gray-400 text-xs truncate mt-0.5">
                      {preview}
                    </div>
                    <div className="text-gray-300 text-xs mt-1">
                      {r.members.length}/{r.maxSize} members
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="text-2xl">{room.emoji}</div>
            <div className="flex-1 min-w-0">
              <h2
                className="font-semibold text-navy"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {room.name}
              </h2>
              <p className="text-gray-400 text-xs">
                {room.interest} · {room.members.length}/{room.maxSize} members
              </p>
            </div>
            <button
              onClick={() => setShowMembers((m) => !m)}
              title="Members"
              className={`flex -space-x-2 hover:opacity-80 transition-opacity`}
            >
              {room.members.slice(0, 6).map((m, i) => (
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

          <div className="flex flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
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

                  const isYou = item.user === CURRENT_USER;

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
                  <div className="grid grid-cols-2 gap-2">
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
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors"
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
              <div className="w-56 border-l border-gray-100 flex flex-col flex-shrink-0">
                <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Members
                  </div>
                  <span className="text-xs text-gray-400">
                    {room.members.length}/{room.maxSize}
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
