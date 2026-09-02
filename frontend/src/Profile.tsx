import { useState } from "react";
import type { View, UserProfile } from "./types";

interface ProfileProps {
  navigate: (v: View, eventId?: string) => void;
  profile: UserProfile | null;
}

const UPCOMING = [
  { title: "AMS Clubs Days", date: "Tue Feb 18", emoji: "🎪", id: "1" },
  {
    title: "UBC Outing Club: Grouse Grind",
    date: "Sun Feb 23",
    emoji: "🥾",
    id: "3",
  },
  { title: "Hack the Change", date: "Sat Feb 22", emoji: "💻", id: "2" },
];

const VIBE_LABELS: Record<string, string> = {
  explorer: "Explorer",
  social: "Social butterfly",
  selective: "Selective",
  homebody: "Selective homebody",
};

const STYLE_LABELS: Record<string, string> = {
  big: "Big events",
  medium: "Mid-size gatherings",
  small: "Small hangouts",
  any: "Anything goes",
};

// Mock trust data — in a real app this comes from the backend
const TRUST = {
  attended: 4,
  attendedRequired: 6,
  vouches: 3,
  vouchesRequired: 5,
  vouchedBy: [
    { name: "Priya S.", avatar: "P", event: "Grouse Grind" },
    { name: "Marcus W.", avatar: "M", event: "AMS Clubs Days" },
    { name: "Jamie L.", avatar: "J", event: "Ghibli Marathon" },
  ],
  // Potential vouchers: people you attended events with who haven't vouched yet
  pendingVouchers: [
    { name: "Aisha K.", avatar: "A", event: "Hack the Change" },
    { name: "Sam R.", avatar: "S", event: "Grouse Grind" },
  ],
};

const TRUST_LEVELS = [
  {
    id: "new",
    label: "New member",
    emoji: "🌱",
    minAttended: 0,
    minVouches: 0,
  },
  {
    id: "regular",
    label: "Regular",
    emoji: "⭐",
    minAttended: 2,
    minVouches: 1,
  },
  {
    id: "attendee",
    label: "Trusted Attendee",
    emoji: "🏅",
    minAttended: 4,
    minVouches: 2,
  },
  {
    id: "host",
    label: "Trusted Host",
    emoji: "🎖️",
    minAttended: 6,
    minVouches: 5,
  },
];

function getTrustLevel(attended: number, vouches: number) {
  return (
    [...TRUST_LEVELS]
      .reverse()
      .find((l) => attended >= l.minAttended && vouches >= l.minVouches) ??
    TRUST_LEVELS[0]
  );
}

export default function Profile({ navigate, profile }: ProfileProps) {
  const [vouchRequested, setVouchRequested] = useState<string[]>([]);
  const [showVouchInfo, setShowVouchInfo] = useState(false);

  const firstName = profile?.firstName ?? "Alex";
  const lastName = profile?.lastName ?? "Chen";
  const year = profile?.year ?? "3rd";
  const faculty = profile?.faculty ?? "Science";
  const interests = profile?.interests?.length
    ? profile.interests
    : ["Hiking", "Coding", "Film", "Board Games", "Photography"];
  const vibe = profile?.vibe
    ? (VIBE_LABELS[profile.vibe] ?? profile.vibe)
    : "Explorer";
  const style = profile?.socialStyle
    ? (STYLE_LABELS[profile.socialStyle] ?? profile.socialStyle)
    : "Anything goes";

  const currentLevel = getTrustLevel(TRUST.attended, TRUST.vouches);
  const nextLevel =
    TRUST_LEVELS[TRUST_LEVELS.indexOf(currentLevel) + 1] ?? null;
  const canHost = currentLevel.id === "host";

  const attendedPct = Math.min(
    100,
    (TRUST.attended / TRUST.attendedRequired) * 100,
  );
  const vouchesPct = Math.min(
    100,
    (TRUST.vouches / TRUST.vouchesRequired) * 100,
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <h1
        className="font-semibold text-2xl text-navy mb-5"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Your Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[268px_1fr] gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Identity card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div
              className="w-20 h-20 bg-navy rounded-full flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {firstName[0]}
            </div>
            <h2
              className="font-semibold text-navy text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {firstName} {lastName}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {year} year · {faculty}
            </p>
            <p className="text-gray-300 text-xs mt-0.5">UBC Vancouver</p>

            {/* Trust badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 bg-campus border border-navy/10 rounded-full px-3 py-1">
              <span className="text-sm">{currentLevel.emoji}</span>
              <span className="text-navy text-xs font-semibold">
                {currentLevel.label}
              </span>
            </div>

            <button className="mt-4 w-full border border-gray-200 text-gray-500 text-sm py-2 rounded-xl hover:border-navy/30 hover:text-navy transition-colors">
              Edit profile
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
              Activity
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Events attended",
                  value: String(TRUST.attended),
                  icon: "🎪",
                },
                { label: "Rooms joined", value: "4", icon: "💬" },
                { label: "Events going", value: "3", icon: "📅" },
                { label: "Students met", value: "12", icon: "🤝" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <span>{s.icon}</span> {s.label}
                  </span>
                  <span
                    className="font-semibold text-navy"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* ── TRUST SYSTEM CARD ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 flex items-start justify-between">
              <div>
                <h3
                  className="font-semibold text-navy"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Trust & reputation
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {canHost
                    ? "You can host events on UBC Connect"
                    : "Keep attending events to unlock event hosting"}
                </p>
              </div>
              <button
                onClick={() => setShowVouchInfo((v) => !v)}
                className="text-xs text-navy/40 hover:text-navy transition-colors mt-0.5"
              >
                How it works
              </button>
            </div>

            {showVouchInfo && (
              <div className="mx-5 mb-4 bg-campus rounded-xl p-4 text-xs text-navy/70 leading-relaxed">
                <strong className="text-navy">
                  Trust is earned, not assigned.
                </strong>{" "}
                Attend events and show up — group members can vouch for you
                afterward. Once you have{" "}
                <strong>{TRUST.attendedRequired} attended events</strong> and{" "}
                <strong>{TRUST.vouchesRequired} vouches</strong>, you unlock the
                ability to host your own events on UBC Connect.
              </div>
            )}

            {/* Level ladder */}
            <div className="px-5 pb-2">
              <div className="flex items-center gap-0">
                {TRUST_LEVELS.map((level, i) => {
                  const reached =
                    TRUST.attended >= level.minAttended &&
                    TRUST.vouches >= level.minVouches;
                  const isCurrent = level.id === currentLevel.id;
                  return (
                    <div key={level.id} className="flex items-center flex-1">
                      <div
                        className={`flex flex-col items-center gap-1 flex-1 ${isCurrent ? "" : ""}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-base border-2 transition-all ${reached ? (isCurrent ? "border-navy bg-navy" : "border-navy bg-campus") : "border-gray-200 bg-white"}`}
                        >
                          {reached ? (
                            isCurrent ? (
                              <span>{level.emoji}</span>
                            ) : (
                              <span className="text-xs text-navy">✓</span>
                            )
                          ) : (
                            <span className="text-gray-300 text-sm">
                              {level.emoji}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] text-center leading-tight ${isCurrent ? "text-navy font-semibold" : reached ? "text-navy/50" : "text-gray-300"}`}
                        >
                          {level.label.split(" ")[0]}
                        </span>
                      </div>
                      {i < TRUST_LEVELS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-1 -mt-4 ${reached && TRUST_LEVELS[i + 1] && TRUST.attended >= TRUST_LEVELS[i + 1].minAttended && TRUST.vouches >= TRUST_LEVELS[i + 1].minVouches ? "bg-navy" : "bg-gray-100"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress to next level */}
            {nextLevel && (
              <div className="px-5 py-4 border-t border-gray-100 space-y-3">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Progress to {nextLevel.emoji} {nextLevel.label}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">
                      🎪 Events attended
                    </span>
                    <span className="text-xs font-semibold text-navy">
                      {TRUST.attended} / {TRUST.attendedRequired}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-1.5 bg-navy rounded-full transition-all"
                      style={{ width: `${attendedPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">
                      🤝 Vouches received
                    </span>
                    <span className="text-xs font-semibold text-navy">
                      {TRUST.vouches} / {TRUST.vouchesRequired}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-1.5 bg-gold rounded-full transition-all"
                      style={{ width: `${vouchesPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {canHost && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
                <span className="text-2xl">🎖️</span>
                <div>
                  <div className="text-navy text-sm font-semibold">
                    Trusted Host unlocked
                  </div>
                  <div className="text-gray-400 text-xs">
                    You can now host events — go to the feed to create one
                  </div>
                </div>
              </div>
            )}

            {/* Vouches received */}
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                Vouched by
              </div>
              <div className="space-y-2.5">
                {TRUST.vouchedBy.map((v) => (
                  <div key={v.name} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {v.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-navy text-sm font-medium">
                        {v.name}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {" "}
                        · {v.event}
                      </span>
                    </div>
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Request vouches from people you attended with */}
            {TRUST.pendingVouchers.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                  Ask for a vouch
                </div>
                <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                  People you attended events with who can vouch for you
                </p>
                <div className="space-y-2">
                  {TRUST.pendingVouchers.map((v) => (
                    <div key={v.name} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {v.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-navy text-sm">{v.name}</span>
                        <span className="text-gray-400 text-xs">
                          {" "}
                          · {v.event}
                        </span>
                      </div>
                      {vouchRequested.includes(v.name) ? (
                        <span className="text-xs text-gray-400 font-medium">
                          Requested ✓
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setVouchRequested((r) => [...r, v.name])
                          }
                          className="text-xs bg-campus text-navy font-medium px-3 py-1.5 rounded-xl hover:bg-navy hover:text-white transition-colors flex-shrink-0"
                        >
                          Ask →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── PENALTIES / STRIKES CARD ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 flex items-center justify-between">
              <h3
                className="font-semibold text-navy"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Standing
              </h3>
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 font-medium px-2.5 py-1 rounded-full">
                ✓ Good standing
              </span>
            </div>
            <div className="px-5 pb-5 space-y-4">
              {/* Strike counter */}
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                  Strikes (0 / 3)
                </div>
                <div className="flex gap-2 mb-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-2 bg-gray-100 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  No strikes. Keep showing up and the community will keep
                  trusting you.
                </p>
              </div>

              {/* What each level means */}
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2.5">
                  What strikes mean
                </div>
                <div className="space-y-2">
                  {[
                    {
                      strikes: "1 strike",
                      icon: "⚠️",
                      label: "Caution",
                      desc: "Visible warning on your profile in groups. Others can see you have a strike.",
                      color: "border-amber-100 bg-amber-50/50",
                    },
                    {
                      strikes: "2 strikes",
                      icon: "⚠️⚠️",
                      label: "Flagged",
                      desc: "You appear flagged on group cards. Groups may choose not to accept you.",
                      color: "border-amber-100 bg-amber-50",
                    },
                    {
                      strikes: "3 strikes",
                      icon: "🚫",
                      label: "Restricted",
                      desc: "Can't join going-together groups. Browse only. Hosting blocked permanently.",
                      color: "border-red-100 bg-red-50/50",
                    },
                  ].map((row) => (
                    <div
                      key={row.strikes}
                      className={`flex items-start gap-3 border rounded-xl px-3 py-2.5 ${row.color}`}
                    >
                      <span className="text-sm mt-0.5 flex-shrink-0">
                        {row.icon}
                      </span>
                      <div>
                        <div className="text-navy text-xs font-semibold">
                          {row.strikes} — {row.label}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                          {row.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How you get strikes */}
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="text-xs font-medium text-gray-500 mb-1.5">
                  How strikes are added
                </div>
                <ul className="text-gray-400 text-xs space-y-1 leading-relaxed">
                  <li>
                    · Group members report you as a no-show after an event
                  </li>
                  <li>
                    · Multiple reports of disrespectful behaviour in group chats
                  </li>
                  <li>· Strikes expire after 6 months of good attendance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold text-navy"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your interests
              </h3>
              <button className="text-xs text-navy/40 hover:text-navy transition-colors">
                Edit →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <span
                  key={i}
                  className="bg-campus text-navy text-sm px-3 py-1.5 rounded-full font-medium"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold text-navy"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Upcoming events
              </h3>
              <button
                onClick={() => navigate("feed")}
                className="text-xs text-navy/40 hover:text-navy transition-colors"
              >
                See all →
              </button>
            </div>
            <div className="space-y-2">
              {UPCOMING.map((e) => (
                <button
                  key={e.title}
                  onClick={() => navigate("event", e.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-campus transition-colors text-left"
                >
                  <span className="text-xl">{e.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-navy text-sm font-medium truncate">
                      {e.title}
                    </div>
                    <div className="text-gray-400 text-xs">{e.date}</div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Campus vibe */}
          <div className="bg-navy rounded-2xl p-5 text-white">
            <h3
              className="font-semibold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your campus vibe
            </h3>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: "Personality", value: vibe },
                { label: "Event style", value: style },
                { label: "Faculty", value: faculty },
                { label: "Year", value: `${year} year` },
              ].map((v) => (
                <div key={v.label}>
                  <div className="text-white/40 text-xs mb-1">{v.label}</div>
                  <div className="text-gold font-medium text-sm">{v.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
              <span className="text-white/40 text-xs">
                Profile completeness
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/10 rounded-full">
                  <div className="w-4/5 h-1.5 bg-gold rounded-full" />
                </div>
                <span className="text-gold text-xs font-medium">80%</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3
              className="font-semibold text-navy mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Settings
            </h3>
            <div className="space-y-2">
              {[
                { label: "Notification preferences", icon: "🔔" },
                { label: "Privacy settings", icon: "🔒" },
                { label: "Connected accounts", icon: "🔗" },
                { label: "Sign out", icon: "👋" },
              ].map((s) => (
                <button
                  key={s.label}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                >
                  <span>{s.icon}</span>
                  <span className="text-gray-600 text-sm group-hover:text-navy transition-colors">
                    {s.label}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-300 ml-auto group-hover:text-navy/40 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
