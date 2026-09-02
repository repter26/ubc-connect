import type { View, UserProfile } from "./types";

interface NavbarProps {
  view: View;
  navigate: (v: View) => void;
  profile: UserProfile | null;
}

export default function Navbar({ view, navigate, profile }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-navy border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("feed")}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 bg-gold rounded flex items-center justify-center shadow-sm">
            <span
              className="text-navy font-bold text-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              U
            </span>
          </div>
          <span
            className="text-white font-semibold text-lg tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            UBC<span className="text-gold">Connect</span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          {(
            [
              { label: "Events", v: "feed" as View },
              { label: "Chats", v: "chats" as View },
              { label: "Profile", v: "profile" as View },
            ] as const
          ).map(({ label, v }) => (
            <button
              key={v}
              onClick={() => navigate(v)}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                view === v
                  ? "bg-gold text-navy"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative text-white/70 hover:text-white p-2 rounded hover:bg-white/10 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
          </button>
          <button
            onClick={() => navigate("profile")}
            className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-navy font-bold text-sm hover:opacity-90 transition-opacity"
          >
            {profile?.firstName?.[0] ?? "A"}
          </button>
        </div>
      </div>
    </nav>
  );
}
