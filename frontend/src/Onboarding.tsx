import { useState } from "react";
import type { UserProfile } from "./types";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const INTERESTS = [
  { emoji: "🥾", label: "Hiking" },
  { emoji: "💻", label: "Coding" },
  { emoji: "🎬", label: "Film" },
  { emoji: "🎵", label: "Music" },
  { emoji: "🎨", label: "Art & Design" },
  { emoji: "📚", label: "Reading" },
  { emoji: "🏀", label: "Basketball" },
  { emoji: "⚽", label: "Soccer" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🍳", label: "Cooking" },
  { emoji: "📸", label: "Photography" },
  { emoji: "🎭", label: "Theatre" },
  { emoji: "🌏", label: "Travel" },
  { emoji: "🧘", label: "Yoga & Wellness" },
  { emoji: "🎲", label: "Board Games" },
  { emoji: "🏊", label: "Swimming" },
  { emoji: "🎸", label: "Live Music" },
  { emoji: "🌱", label: "Sustainability" },
  { emoji: "🤖", label: "AI & ML" },
  { emoji: "💼", label: "Entrepreneurship" },
  { emoji: "🎤", label: "Public Speaking" },
  { emoji: "🏔️", label: "Rock Climbing" },
  { emoji: "🍜", label: "Food & Restaurants" },
  { emoji: "🎪", label: "Campus Events" },
];

const STEPS = ["About You", "Your Interests", "Your Vibe"];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    year: "",
    faculty: "",
    interests: [] as string[],
    vibe: "",
    socialStyle: "",
  });

  const toggle = (label: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(label)
        ? f.interests.filter((i) => i !== label)
        : [...f.interests, label],
    }));

  const canNext = () => {
    if (step === 0) return !!form.firstName && !!form.year && !!form.faculty;
    if (step === 1) return form.interests.length >= 3;
    return !!form.vibe && !!form.socialStyle;
  };

  const next = () => {
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      onComplete(form as UserProfile);
    }
  };

  return (
    <div className="min-h-screen bg-warm flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-navy rounded flex items-center justify-center">
              <span
                className="text-gold font-bold text-sm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                U
              </span>
            </div>
            <span
              className="font-semibold text-navy text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              UBCConnect
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-gold" : "bg-gray-200"}`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-xs text-navy/40 font-medium tracking-widest uppercase mb-1.5">
            Step {step + 1} of 3 — {STEPS[step]}
          </div>

          {/* Step 1: About You */}
          {step === 0 && (
            <div>
              <h2
                className="text-2xl font-semibold text-navy mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tell us about you
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Used to find relevant events and matched rooms.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    First name
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    placeholder="Alex"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-navy focus:outline-none focus:border-navy transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    placeholder="Chen"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-navy focus:outline-none focus:border-navy transition-colors"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  Year of study
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["1st", "2nd", "3rd", "4th", "Grad"].map((y) => (
                    <button
                      key={y}
                      onClick={() => setForm((f) => ({ ...f, year: y }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.year === y
                          ? "bg-navy text-white border-navy"
                          : "border-gray-200 text-gray-500 hover:border-navy/40"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Faculty
                </label>
                <select
                  value={form.faculty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, faculty: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-navy focus:outline-none focus:border-navy transition-colors appearance-none bg-white"
                >
                  <option value="">Select your faculty...</option>
                  {[
                    "Arts",
                    "Science",
                    "Engineering",
                    "Commerce (Sauder)",
                    "Applied Science",
                    "Education",
                    "Forestry",
                    "Kinesiology",
                    "Medicine",
                    "Law",
                    "Music",
                    "Graduate Studies",
                  ].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 1 && (
            <div>
              <h2
                className="text-2xl font-semibold text-navy mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What are you into?
              </h2>
              <p className="text-gray-400 text-sm mb-5">
                Pick at least 3 — this powers your event feed and chat rooms.
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {INTERESTS.map(({ emoji, label }) => (
                  <button
                    key={label}
                    onClick={() => toggle(label)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                      form.interests.includes(label)
                        ? "bg-navy text-white border-navy"
                        : "border-gray-200 text-gray-600 hover:border-navy/30 hover:bg-navy/5"
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-400">
                {form.interests.length} selected
                {form.interests.length < 3 &&
                  ` · pick ${3 - form.interests.length} more`}
              </div>
            </div>
          )}

          {/* Step 3: Vibe */}
          {step === 2 && (
            <div>
              <h2
                className="text-2xl font-semibold text-navy mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {"What's your vibe?"}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                {
                  "We'll use this to match you into the right rooms and recommend events."
                }
              </p>

              <div className="mb-5">
                <label className="text-xs font-medium text-gray-500 mb-2.5 block">
                  {"I'm usually..."}
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "explorer",
                      label: "🗺️ Explorer",
                      desc: "I love trying new things I've never done before",
                    },
                    {
                      value: "social",
                      label: "🎉 Social butterfly",
                      desc: "I'm happiest when surrounded by lots of people",
                    },
                    {
                      value: "selective",
                      label: "🎯 Selective",
                      desc: "I prefer smaller, deeper connections over big crowds",
                    },
                    {
                      value: "homebody",
                      label: "🏠 Selective homebody",
                      desc: "I need the right invite to leave the house",
                    },
                  ].map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setForm((f) => ({ ...f, vibe: o.value }))}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        form.vibe === o.value
                          ? "bg-navy border-navy"
                          : "border-gray-200 hover:border-navy/30"
                      }`}
                    >
                      <div
                        className={`font-medium text-sm ${form.vibe === o.value ? "text-white" : "text-navy"}`}
                      >
                        {o.label}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${form.vibe === o.value ? "text-white/65" : "text-gray-400"}`}
                      >
                        {o.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-2.5 block">
                  For events, I prefer...
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      value: "big",
                      label: "🎪 Big events",
                      desc: "Concerts, fairs, mixers",
                    },
                    {
                      value: "medium",
                      label: "🎭 Medium gatherings",
                      desc: "Club nights, workshops",
                    },
                    {
                      value: "small",
                      label: "☕ Small hangouts",
                      desc: "Study groups, cafe meetups",
                    },
                    {
                      value: "any",
                      label: "✨ Anything goes",
                      desc: "Surprise me",
                    },
                  ].map((o) => (
                    <button
                      key={o.value}
                      onClick={() =>
                        setForm((f) => ({ ...f, socialStyle: o.value }))
                      }
                      className={`text-left p-3 rounded-xl border transition-all ${
                        form.socialStyle === o.value
                          ? "bg-gold border-gold"
                          : "border-gray-200 hover:border-navy/30"
                      }`}
                    >
                      <div className="font-medium text-sm text-navy">
                        {o.label}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${form.socialStyle === o.value ? "text-navy/60" : "text-gray-400"}`}
                      >
                        {o.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={`text-sm text-gray-400 hover:text-navy transition-colors ${step === 0 ? "invisible" : ""}`}
            >
              ← Back
            </button>
            <button
              onClick={next}
              disabled={!canNext()}
              className={`px-7 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                canNext()
                  ? "bg-navy text-white hover:bg-navy-light"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              {step < 2 ? "Continue →" : "Find my people →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
