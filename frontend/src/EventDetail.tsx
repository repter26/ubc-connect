import { useState } from "react";
import type { View } from "./types";
import type { EVENT } from "./types";

interface EventDetailProps {
  eventId: string | null;
  navigate: (v: View) => void;
}

const SOURCE_BADGE: Record<string, string> = {
  ams: "bg-blue-500 text-white",
  club: "bg-purple-500 text-white",
  instagram: "bg-pink-500 text-white",
};
const SOURCE_LABEL: Record<string, string> = {
  ams: "AMS Events",
  club: "Club Page",
  instagram: "Instagram",
};

type Tab = "info" | "groups";

type TrustTier = "trusted" | "regular" | "caution" | "restricted";
interface Member {
  name: string;
  avatar: string;
  year: string;
  you?: boolean;
  trust?: TrustTier;
  strikes?: number;
}

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

interface GoingGroup {
  id: string;
  name: string;
  compatibility: number;
  sharedWith: string[];
  vibe: string;
  members: Member[];
  chat: ChatItem[];
}

const EVENT_GROUPS: Record<string, GoingGroup[]> = {
  "1": [
    {
      id: "g1a",
      name: "Main Mall Crew",
      compatibility: 92,
      sharedWith: ["Priya S.", "Marcus W."],
      vibe: "Chill walkers · stopping at every table",
      members: [
        { name: "Priya S.", avatar: "P", year: "2nd", trust: "trusted" },
        { name: "Marcus W.", avatar: "M", year: "4th", trust: "regular" },
        {
          name: "Jamie L.",
          avatar: "J",
          year: "3rd",
          trust: "caution",
          strikes: 1,
        },
      ],
      chat: [
        {
          id: 1,
          type: "text",
          user: "Priya S.",
          avatar: "P",
          text: "Meeting at the flagpole at 9:45, then walking down together!",
          time: "9:35 AM",
        },
        {
          id: 2,
          type: "poll",
          user: "Marcus W.",
          avatar: "M",
          time: "9:40 AM",
          question: "First stop on Main Mall?",
          options: [
            {
              label: "🎨 Arts clubs section",
              voters: ["Priya S.", "Jamie L."],
            },
            { label: "⚽ Sports clubs first", voters: ["Marcus W."] },
            { label: "Wander and see", voters: [] },
          ],
        },
      ],
    },
    {
      id: "g1b",
      name: "Early Birds",
      compatibility: 74,
      sharedWith: ["Aisha K."],
      vibe: "Getting there at 10 AM sharp",
      members: [
        { name: "Aisha K.", avatar: "A", year: "3rd", trust: "regular" },
        {
          name: "Wei L.",
          avatar: "W",
          year: "2nd",
          trust: "restricted",
          strikes: 3,
        },
        { name: "Ryo N.", avatar: "R", year: "4th", trust: "trusted" },
      ],
      chat: [
        {
          id: 1,
          type: "text",
          user: "Aisha K.",
          avatar: "A",
          text: "Bus from Exchange at 9:40 — see you there!",
          time: "9:00 AM",
        },
      ],
    },
  ],
  "2": [
    {
      id: "g2a",
      name: "Team Formation",
      compatibility: 89,
      sharedWith: ["Leila H."],
      vibe: "Already forming a team · social good theme",
      members: [
        { name: "Leila H.", avatar: "L", year: "3rd", trust: "trusted" },
        { name: "Chris T.", avatar: "C", year: "2nd", trust: "regular" },
      ],
      chat: [
        {
          id: 1,
          type: "text",
          user: "Leila H.",
          avatar: "L",
          text: "We're doing a mental health check-in app. Need one more — interested?",
          time: "9:15 AM",
        },
        {
          id: 2,
          type: "poll",
          user: "Leila H.",
          avatar: "L",
          time: "9:18 AM",
          question: "Tech stack vote",
          options: [
            { label: "React + Node", voters: ["Leila H.", "Chris T."] },
            { label: "Next.js + Supabase", voters: [] },
            { label: "Flutter", voters: [] },
          ],
        },
      ],
    },
    {
      id: "g2b",
      name: "Solo → Maybe Team",
      compatibility: 61,
      sharedWith: [],
      vibe: "Haven't formed a team yet · open to merging",
      members: [
        {
          name: "Dev M.",
          avatar: "D",
          year: "4th",
          trust: "caution",
          strikes: 2,
        },
        { name: "Ingrid T.", avatar: "I", year: "2nd", trust: "regular" },
      ],
      chat: [
        {
          id: 1,
          type: "text",
          user: "Dev M.",
          avatar: "D",
          text: "Anyone else going solo? Open to teaming up last minute.",
          time: "10:00 AM",
        },
      ],
    },
  ],
  "3": [
    {
      id: "g3a",
      name: "Shuttle Crew",
      compatibility: 96,
      sharedWith: ["Sam R.", "Nina P."],
      vibe: "Taking the club shuttle · leaving SUB 6:45 AM",
      members: [
        { name: "Sam R.", avatar: "S", year: "3rd" },
        { name: "Nina P.", avatar: "N", year: "2nd" },
        { name: "Ben K.", avatar: "B", year: "4th" },
        { name: "Maya T.", avatar: "M", year: "1st" },
        { name: "Leo V.", avatar: "L", year: "3rd" },
      ],
      chat: [
        {
          id: 1,
          type: "text",
          user: "Sam R.",
          avatar: "S",
          text: "SUB bus circle at 6:40 to be safe. Shuttle leaves at 6:45 sharp!",
          time: "10:30 AM",
        },
        {
          id: 2,
          type: "poll",
          user: "Ben K.",
          avatar: "B",
          time: "10:45 AM",
          question: "Post-grind food?",
          options: [
            {
              label: "🍺 Chalet at the top",
              voters: ["Sam R.", "Ben K.", "Leo V."],
            },
            {
              label: "🚐 Head back and eat in Kits",
              voters: ["Nina P.", "Maya T."],
            },
          ],
        },
      ],
    },
    {
      id: "g3b",
      name: "Uber Carpool",
      compatibility: 71,
      sharedWith: [],
      vibe: "Splitting an Uber directly from UBC",
      members: [
        { name: "Hana M.", avatar: "H", year: "2nd" },
        { name: "Oscar V.", avatar: "O", year: "3rd" },
      ],
      chat: [
        {
          id: 1,
          type: "text",
          user: "Hana M.",
          avatar: "H",
          text: "Need 2 more for the Uber — $18 split 4 ways. Leaving UBC at 6:15 AM.",
          time: "9:00 AM",
        },
      ],
    },
  ],
  "5": [
    {
      id: "g5a",
      name: "Front Row Club",
      compatibility: 88,
      sharedWith: ["Jamie L.", "Aisha K."],
      vibe: "Arriving early · crying together guaranteed",
      members: [
        { name: "Jamie L.", avatar: "J", year: "2nd" },
        { name: "Aisha K.", avatar: "A", year: "3rd" },
        { name: "Priya S.", avatar: "P", year: "1st" },
      ],
      chat: [
        {
          id: 1,
          type: "text",
          user: "Jamie L.",
          avatar: "J",
          text: "Blankets and snacks — Mononoke starts at 6:30.",
          time: "Yesterday 8PM",
        },
        {
          id: 2,
          type: "poll",
          user: "Aisha K.",
          avatar: "A",
          time: "Yesterday 8:35 PM",
          question: "Front row or middle?",
          options: [
            {
              label: "🎬 Front row — full immersion",
              voters: ["Aisha K.", "Priya S."],
            },
            { label: "🎭 Middle — best view", voters: ["Jamie L."] },
          ],
        },
      ],
    },
  ],
};

function compatColor(n: number) {
  if (n >= 85)
    return {
      bar: "bg-green-500",
      badge: "bg-green-50 text-green-700",
      label: "Excellent match",
    };
  if (n >= 70)
    return {
      bar: "bg-blue-500",
      badge: "bg-blue-50 text-blue-700",
      label: "Good match",
    };
  return {
    bar: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700",
    label: "Decent match",
  };
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

const MAX_GROUP = 10;

export default function EventDetail({ eventId, navigate }: EventDetailProps) {
  const [tab, setTab] = useState<Tab>("info");
  const [joinedGroupId, setJoinedGroupId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [extraItems, setExtraItems] = useState<Record<string, ChatItem[]>>({});
  const [showPollPicker, setShowPollPicker] = useState(false);
  const [isGoing, setIsGoing] = useState(false);
  const [pinExpanded, setPinExpanded] = useState(true);
  const [reportedMembers, setReportedMembers] = useState<string[]>([]);
  const [reportTarget, setReportTarget] = useState<string | null>(null);

  // Mock: the current user's trust tier (change to 'restricted' to see penalty UI)
  const MY_TRUST: TrustTier = "regular";
  const myStrikes = 0;

  // Pinned coordination votes per group — { groupId: { meetup: Record<option, voters[]>, transport: Record<option, voters[]> } }
  const [coordVotes, setCoordVotes] = useState<
    Record<
      string,
      { meetup: Record<string, string[]>; transport: Record<string, string[]> }
    >
  >({
    g1a: {
      meetup: {
        "Main Library steps": ["Priya S.", "Marcus W."],
        "AMS Nest entrance": ["Jamie L."],
      },
      transport: { "🚶 Walk": ["Priya S.", "Marcus W.", "Jamie L."] },
    },
    g1b: {
      meetup: {
        "AMS Nest entrance": ["Aisha K.", "Wei L."],
        "At the venue": ["Ryo N."],
      },
      transport: { "🚌 Bus": ["Aisha K.", "Wei L."], "🚶 Walk": ["Ryo N."] },
    },
    g2a: {
      meetup: { "ICICS lobby": ["Leila H.", "Chris T."] },
      transport: { "🚶 Walk": ["Leila H."], "🚴 Bike": ["Chris T."] },
    },
    g2b: {
      meetup: {},
      transport: { "🚌 Bus": ["Dev M."], "🚶 Walk": ["Ingrid T."] },
    },
    g3a: {
      meetup: {
        "SUB bus circle": ["Sam R.", "Nina P.", "Ben K.", "Maya T.", "Leo V."],
      },
      transport: {
        "🚐 Club shuttle": ["Sam R.", "Nina P.", "Ben K.", "Maya T.", "Leo V."],
      },
    },
    g3b: {
      meetup: { "Wesbrook Village": ["Hana M.", "Oscar V."] },
      transport: { "🚗 Uber split": ["Hana M.", "Oscar V."] },
    },
    g5a: {
      meetup: {
        "Norm Theatre entrance": ["Aisha K.", "Priya S."],
        "Koerner's Pub": ["Jamie L."],
      },
      transport: { "🚶 Walk": ["Jamie L.", "Aisha K.", "Priya S."] },
    },
  });

  const COORD_OPTIONS: Record<
    string,
    { meetup: string[]; transport: string[] }
  > = {
    "1": {
      meetup: [
        "Main Library steps",
        "AMS Nest entrance",
        "Flagpole Main Mall",
        "At the venue",
      ],
      transport: ["🚶 Walk", "🚌 Bus", "🚗 Uber split", "🚴 Bike"],
    },
    "2": {
      meetup: ["ICICS lobby", "SUB / AMS Nest", "Bus loop", "At the venue"],
      transport: ["🚶 Walk", "🚌 Bus", "🚗 Uber split", "🚴 Bike"],
    },
    "3": {
      meetup: [
        "SUB bus circle",
        "Wesbrook Village",
        "Bus loop",
        "At the venue",
      ],
      transport: ["🚐 Club shuttle", "🚗 Uber split", "🚌 Transit", "🚘 Drive"],
    },
    "5": {
      meetup: [
        "Norm Theatre entrance",
        "Koerner's Pub",
        "AMS Nest lobby",
        "At the venue",
      ],
      transport: ["🚶 Walk", "🚌 Bus", "🚗 Uber split", "🚴 Bike"],
    },
  };

  const voteCoord = (
    groupId: string,
    type: "meetup" | "transport",
    option: string,
  ) => {
    setCoordVotes((prev) => {
      const group = prev[groupId] ?? { meetup: {}, transport: {} };
      const current = { ...group[type] };
      const alreadyVoted = Object.values(current).flat().includes("You");
      // Remove 'You' from all options of this type
      const cleared = Object.fromEntries(
        Object.entries(current).map(([k, v]) => [
          k,
          (v as string[]).filter((x) => x !== "You"),
        ]),
      );
      // Toggle: if clicking same option again, just remove. Otherwise add.
      const currentVoters = cleared[option] ?? [];
      const wasOnThis = (current[option] ?? []).includes("You");
      const newVoters = wasOnThis ? currentVoters : [...currentVoters, "You"];
      return {
        ...prev,
        [groupId]: { ...group, [type]: { ...cleared, [option]: newVoters } },
      };
    });
  };

  const event = EVENTS.find((e) => e.id === eventId) ?? EVENTS[0];
  const groups: GoingGroup[] = EVENT_GROUPS[event.id] ?? [];
  const joinedGroup = groups.find((g) => g.id === joinedGroupId) ?? null;

  const allItems: ChatItem[] = joinedGroup
    ? [...joinedGroup.chat, ...(extraItems[joinedGroup.id] ?? [])]
    : [];

  const joinGroup = (id: string) => {
    const g = groups.find((x) => x.id === id);
    if (!g || g.members.length >= MAX_GROUP) return;
    g.members.push({ name: "You", avatar: "A", year: "3rd", you: true });
    setJoinedGroupId(id);
    setIsGoing(true);
    setChatOpen(true);
  };

  const leaveGroup = () => {
    if (!joinedGroup) return;
    joinedGroup.members = joinedGroup.members.filter((m) => !m.you);
    setJoinedGroupId(null);
    setLeaveConfirm(false);
    setChatOpen(false);
  };

  const sendText = () => {
    if (!chatInput.trim() || !joinedGroup) return;
    const msg: TextMessage = {
      id: Date.now(),
      type: "text",
      user: "You",
      avatar: "A",
      text: chatInput,
      time: "Just now",
    };
    setExtraItems((e) => ({
      ...e,
      [joinedGroup.id]: [...(e[joinedGroup.id] ?? []), msg],
    }));
    setChatInput("");
  };

  const sendPoll = (tpl: { question: string; options: string[] }) => {
    if (!joinedGroup) return;
    const poll: PollMessage = {
      id: Date.now(),
      type: "poll",
      user: "You",
      avatar: "A",
      time: "Just now",
      question: tpl.question,
      options: tpl.options.map((o) => ({ label: o, voters: [] })),
    };
    setExtraItems((e) => ({
      ...e,
      [joinedGroup.id]: [...(e[joinedGroup.id] ?? []), poll],
    }));
    setShowPollPicker(false);
  };

  const voteChat = (itemId: number, optionLabel: string) => {
    if (!joinedGroup) return;
    const update = (items: ChatItem[]) =>
      items.map((item) => {
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
      });
    joinedGroup.chat = update(joinedGroup.chat) as ChatItem[];
    setExtraItems((e) => ({
      ...e,
      [joinedGroup.id]: update(e[joinedGroup.id] ?? []) as ChatItem[],
    }));
    setExtraItems((e) => ({ ...e }));
  };

  // ── Full-screen group chat ──────────────────────────────────────────────────
  if (chatOpen && joinedGroup) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        {leaveConfirm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3
                className="font-semibold text-navy text-lg mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Leave this group?
              </h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                {"You'll lose your spot and chat history."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLeaveConfirm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:border-navy/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={leaveGroup}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {reportTarget && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3
                className="font-semibold text-navy text-lg mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Report {reportTarget}?
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                This adds a strike to their trust record. Three strikes
                restricts their access across UBC Connect. Only report genuine
                no-shows or bad behaviour.
              </p>
              <div className="space-y-2 mb-5">
                {[
                  "Didn't show up to the event",
                  "Disrespectful in the group",
                  "Made others uncomfortable",
                  "Spam / fake account",
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      setReportedMembers((r) => [...r, reportTarget]);
                      setReportTarget(null);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 text-sm text-gray-700 hover:text-red-700 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setReportTarget(null)}
                className="w-full border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setChatOpen(false)}
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
          Back to {event.title}
        </button>

        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex"
          style={{ height: "calc(100vh - 150px)" }}
        >
          {/* Sidebar */}
          <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-semibold text-navy"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {joinedGroup.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${compatColor(joinedGroup.compatibility).badge}`}
                >
                  {joinedGroup.compatibility}%
                </span>
              </div>
              <p className="text-gray-400 text-xs">{joinedGroup.vibe}</p>
            </div>

            {/* Decisions summary */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                Decided so far
              </div>
              {(() => {
                const polls = allItems.filter(
                  (i): i is PollMessage => i.type === "poll",
                );
                if (polls.length === 0)
                  return (
                    <p className="text-gray-400 text-xs italic">
                      No group decisions yet
                    </p>
                  );
                return polls.map((p) => {
                  const winner = [...p.options].sort(
                    (a, b) => b.voters.length - a.voters.length,
                  )[0];
                  const decided = winner.voters.length > 0;
                  return (
                    <div
                      key={p.id}
                      className="flex items-start gap-2 mb-2 last:mb-0"
                    >
                      <span className="text-sm leading-none mt-0.5">
                        {decided ? "✅" : "⏳"}
                      </span>
                      <div>
                        <div className="text-navy text-xs font-medium">
                          {p.question}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${decided ? "text-green-600 font-medium" : "text-gray-400 italic"}`}
                        >
                          {decided ? winner.label : "Voting in progress…"}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="px-5 py-4 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                Event
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-navy text-sm font-medium hover:underline text-left leading-snug"
              >
                {event.title}
              </button>
              <div className="text-gray-400 text-xs mt-1">
                {event.date} · {event.time}
              </div>
              <div className="text-gray-400 text-xs mt-0.5">
                📍 {event.location}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Members
                </div>
                <span className="text-xs text-gray-400">
                  {joinedGroup.members.length}/{MAX_GROUP}
                </span>
              </div>
              <div className="space-y-2.5">
                {joinedGroup.members.map((m, i) => {
                  const tier = m.you ? null : (m.trust ?? "regular");
                  const meta = tier ? TRUST_TIER_META[tier] : null;
                  const reported = reportedMembers.includes(m.name);
                  return (
                    <div key={i} className="group flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.you ? "bg-gold text-navy" : "bg-navy text-white"} ${meta?.ring ?? ""}`}
                      >
                        {m.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-navy text-sm font-medium">
                            {m.name}
                            {m.you && (
                              <span className="text-gold text-xs"> (you)</span>
                            )}
                          </span>
                          {meta && tier !== "regular" && (
                            <span
                              className={`text-[10px] font-semibold ${meta.color}`}
                            >
                              {meta.icon} {meta.label}
                            </span>
                          )}
                          {m.strikes && m.strikes > 0 && (
                            <span className="text-[10px] text-gray-400">
                              {m.strikes} strike{m.strikes !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {m.year} year
                        </div>
                      </div>
                      {!m.you && !reported && (
                        <button
                          onClick={() => setReportTarget(m.name)}
                          title="Report member"
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition-all flex-shrink-0"
                        >
                          ⚑
                        </button>
                      )}
                      {reported && (
                        <span className="text-[10px] text-gray-300 flex-shrink-0">
                          Reported
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => setLeaveConfirm(true)}
                className="w-full text-center text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 py-2 rounded-xl transition-colors"
              >
                Leave group
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="flex-1">
                <h2
                  className="font-semibold text-navy"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {joinedGroup.name}
                </h2>
                <p className="text-gray-400 text-xs">
                  {event.title} · {joinedGroup.members.length} members
                </p>
              </div>
              <div className="flex -space-x-2">
                {joinedGroup.members.slice(0, 6).map((m, i) => (
                  <div
                    key={i}
                    title={m.name}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white ${m.you ? "bg-gold text-navy" : "bg-navy text-white"}`}
                  >
                    {m.avatar}
                  </div>
                ))}
              </div>
            </div>

            {/* ── PINNED COORDINATION STRIP ────────────────────────────────── */}
            {(() => {
              const opts = COORD_OPTIONS[event.id] ?? COORD_OPTIONS["1"];
              const gVotes = coordVotes[joinedGroup.id] ?? {
                meetup: {},
                transport: {},
              };
              const myMeetup = Object.entries(gVotes.meetup).find(([, v]) =>
                (v as string[]).includes("You"),
              )?.[0];
              const myTransport = Object.entries(gVotes.transport).find(
                ([, v]) => (v as string[]).includes("You"),
              )?.[0];
              const topMeetup = Object.entries(gVotes.meetup).sort(
                (a, b) => (b[1] as string[]).length - (a[1] as string[]).length,
              )[0];
              const topTransport = Object.entries(gVotes.transport).sort(
                (a, b) => (b[1] as string[]).length - (a[1] as string[]).length,
              )[0];

              return (
                <div className="border-b border-gray-100 bg-gray-50/60">
                  <button
                    onClick={() => setPinExpanded((e) => !e)}
                    className="w-full flex items-center gap-2 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm">📌</span>
                    <span
                      className="text-sm font-semibold text-navy flex-1 text-left"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Group plan
                    </span>
                    {!pinExpanded && (myMeetup || myTransport) && (
                      <span className="text-xs text-gray-400 mr-2">
                        {[myTransport, myMeetup && `→ ${myMeetup}`]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                    )}
                    {!pinExpanded && topMeetup && !myMeetup && (
                      <span className="text-xs text-gray-400 mr-2">
                        {(topMeetup[1] as string[]).length} voting{" "}
                        {topMeetup[0]}
                      </span>
                    )}
                    <svg
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${pinExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {pinExpanded && (
                    <div className="px-5 pb-4 space-y-4">
                      {/* Meetup spot */}
                      <div>
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                          📍 Where are we meeting?
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {opts.meetup.map((opt) => {
                            const voters = (gVotes.meetup[opt] ??
                              []) as string[];
                            const voted = voters.includes("You");
                            return (
                              <button
                                key={opt}
                                onClick={() =>
                                  voteCoord(joinedGroup.id, "meetup", opt)
                                }
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-all ${voted ? "bg-navy text-white border-navy" : "bg-white border-gray-200 text-gray-600 hover:border-navy/30"}`}
                              >
                                <span>{opt}</span>
                                {voters.length > 0 && (
                                  <span
                                    className={`flex items-center gap-0.5 ${voted ? "text-white/70" : "text-gray-400"}`}
                                  >
                                    <span className="flex -space-x-1">
                                      {voters.slice(0, 3).map((v, i) => (
                                        <span
                                          key={i}
                                          className={`inline-flex w-4 h-4 rounded-full text-[9px] font-bold items-center justify-center border border-white ${v === "You" ? "bg-gold text-navy" : voted ? "bg-white/30 text-white" : "bg-navy text-white"}`}
                                        >
                                          {v[0]}
                                        </span>
                                      ))}
                                    </span>
                                    <span className="text-xs ml-1">
                                      {voters.length}
                                    </span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Transport */}
                      <div>
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                          🚗 How are we getting there?
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {opts.transport.map((opt) => {
                            const voters = (gVotes.transport[opt] ??
                              []) as string[];
                            const voted = voters.includes("You");
                            return (
                              <button
                                key={opt}
                                onClick={() =>
                                  voteCoord(joinedGroup.id, "transport", opt)
                                }
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-all ${voted ? "bg-navy text-white border-navy" : "bg-white border-gray-200 text-gray-600 hover:border-navy/30"}`}
                              >
                                <span>{opt}</span>
                                {voters.length > 0 && (
                                  <span
                                    className={`flex items-center gap-0.5 ${voted ? "text-white/70" : "text-gray-400"}`}
                                  >
                                    <span className="flex -space-x-1">
                                      {voters.slice(0, 3).map((v, i) => (
                                        <span
                                          key={i}
                                          className={`inline-flex w-4 h-4 rounded-full text-[9px] font-bold items-center justify-center border border-white ${v === "You" ? "bg-gold text-navy" : voted ? "bg-white/30 text-white" : "bg-navy text-white"}`}
                                        >
                                          {v[0]}
                                        </span>
                                      ))}
                                    </span>
                                    <span className="text-xs ml-1">
                                      {voters.length}
                                    </span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="text-center">
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  You joined · tap 📊 to start a poll
                </span>
              </div>
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
                                  onClick={() => voteChat(item.id, opt.label)}
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
                                        {opt.voters.slice(0, 3).map((v, vi) => (
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
                    className={`flex items-start gap-2.5 ${isYou ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isYou ? "bg-gold text-navy" : "bg-navy text-white"}`}
                    >
                      {item.avatar}
                    </div>
                    <div className={`max-w-sm ${isYou ? "text-right" : ""}`}>
                      <div
                        className={`text-xs text-gray-400 mb-1 ${isYou ? "text-right" : ""}`}
                      >
                        {item.user} · {item.time}
                      </div>
                      <div
                        className={`text-sm px-4 py-2.5 rounded-2xl leading-relaxed ${isYou ? "bg-navy text-white rounded-tr-sm" : "bg-gray-100 text-gray-700 rounded-tl-sm"}`}
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
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendText()}
                placeholder="Message the group or tap 📊 for a poll…"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-navy transition-colors"
              />
              <button
                onClick={sendText}
                className="bg-navy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-navy-light transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <img
            src={`https://images.unsplash.com/${event.image}?w=1000&h=400&fit=crop&auto=format`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
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
          <InfoItem icon="calendar" text={`${event.date} · ${event.time}`} />
          <InfoItem icon="location" text={event.location} />
          <InfoItem
            icon="people"
            text={`${event.attendees + (isGoing ? 1 : 0)} going`}
          />
          <div className="ml-auto flex items-center gap-2">
            {joinedGroup && (
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-1.5 bg-campus text-navy border border-navy/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy hover:text-white transition-colors"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Open group chat
              </button>
            )}
            <button
              onClick={() => setIsGoing((g) => !g)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isGoing ? "bg-green-500 text-white hover:bg-green-600" : "bg-gold text-navy hover:bg-gold-dark"}`}
            >
              {isGoing ? "✓ You're going" : "I'm going →"}
            </button>
          </div>
        </div>
        <div className="px-5 py-3 flex items-center gap-3">
          <div className="flex -space-x-2">
            {event.going.map((g, i) => (
              <div
                key={i}
                title={g.name}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${g.mutual ? "bg-navy text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {g.avatar}
              </div>
            ))}
            {isGoing && (
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-xs font-bold border-2 border-white text-navy">
                You
              </div>
            )}
          </div>
          <span className="text-gray-400 text-sm">
            {event.going
              .filter((g) => g.mutual)
              .map((g) => g.name.split(" ")[0])
              .join(", ")}
            {event.going.some((g) => g.mutual) && " and others are going"}
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
                  Max {MAX_GROUP} people · ranked by compatibility
                </p>
              </div>
              {joinedGroup && (
                <button
                  onClick={() => setChatOpen(true)}
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
                const c = compatColor(group.compatibility);
                const isJoined = joinedGroupId === group.id;
                const full = group.members.length >= MAX_GROUP && !isJoined;
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
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}
                            >
                              {c.label}
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
                          <div className="text-gray-400 text-xs mt-1 italic">
                            {group.vibe}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className="text-2xl font-semibold text-navy leading-none"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {group.compatibility}
                            <span className="text-sm text-gray-400">%</span>
                          </div>
                          <div className="text-gray-400 text-xs">match</div>
                        </div>
                      </div>

                      <div className="h-1 bg-gray-100 rounded-full mb-3">
                        <div
                          className={`h-1 rounded-full ${c.bar}`}
                          style={{ width: `${group.compatibility}%` }}
                        />
                      </div>

                      {group.sharedWith.length > 0 && (
                        <div className="text-xs text-gray-400 mb-3">
                          You know:{" "}
                          <span className="text-navy font-medium">
                            {group.sharedWith.join(", ")}
                          </span>
                        </div>
                      )}

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
                          {group.members.length}/{MAX_GROUP} people
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
                          onClick={() => setChatOpen(true)}
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
                          disabled={full || meRestricted}
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
                              : "Join →"}
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
