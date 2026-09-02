interface LandingProps {
  onGetStarted: () => void
}

const MINI_EVENTS = [
  { title: 'AMS Clubs Days Spring 2025', time: 'Today · 10AM–4PM', source: 'AMS', emoji: '🎪', attendees: 847, color: 'bg-blue-500/20' },
  { title: 'Hack the Change Hackathon', time: 'Sat · 9AM', source: 'CS Club', emoji: '💻', attendees: 124, color: 'bg-purple-500/20' },
  { title: 'Outing Club: Grouse Grind', time: 'Sun · 7AM', source: 'Instagram', emoji: '🥾', attendees: 31, color: 'bg-green-500/20' },
  { title: 'Lunar New Year Gala', time: 'Fri · 7PM', source: 'CVS Club', emoji: '🏮', attendees: 189, color: 'bg-red-500/20' },
]

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-warm">
      {/* Top bar */}
      <header className="bg-navy px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
            <span className="text-navy font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>U</span>
          </div>
          <span className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            UBC<span className="text-gold">Connect</span>
          </span>
        </div>
        <button onClick={onGetStarted} className="text-sm text-white/60 hover:text-white transition-colors">
          Sign in →
        </button>
      </header>

      {/* Hero */}
      <section className="bg-navy text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(#FFD100 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5 text-gold text-xs font-medium mb-8 tracking-wide">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              UBC Students Only · Verified via CWL
            </div>
            <h1
              className="text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Discover campus.<br />
              <em className="text-gold not-italic">Find your people.</em>
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-md">
              UBC Connect scrapes every campus event source, matches you into interest-based group chats, and actually coordinates getting you there — together.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onGetStarted}
                className="bg-gold text-navy font-semibold px-8 py-3.5 rounded text-sm hover:bg-gold-dark transition-colors"
              >
                Get started with CWL →
              </button>
              <button className="border border-white/20 text-white/80 px-8 py-3.5 rounded text-sm hover:bg-white/10 hover:text-white transition-colors">
                See how it works
              </button>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-8 mt-10 pt-10 border-t border-white/10">
              {[
                { n: '500+', label: 'Events / month' },
                { n: '200+', label: 'Active clubs' },
                { n: '12k', label: 'Students connected' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-semibold text-gold" style={{ fontFamily: 'var(--font-display)' }}>{s.n}</div>
                  <div className="text-white/45 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live feed mockup */}
          <div className="relative">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/40 text-xs font-medium mb-4">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live event feed — right now on campus
              </div>
              <div className="space-y-2">
                {MINI_EVENTS.map((e, i) => (
                  <div
                    key={i}
                    className="bg-white/8 rounded-xl p-3 flex items-center gap-3 hover:bg-white/12 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl ${e.color}`}>
                      {e.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{e.title}</div>
                      <div className="text-white/40 text-xs mt-0.5">{e.time} · {e.source}</div>
                    </div>
                    <div className="text-gold text-xs font-semibold flex-shrink-0">{e.attendees} going</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating matched room bubble */}
            <div className="absolute -bottom-5 -right-3 bg-white rounded-2xl shadow-xl p-3.5 border border-gray-100 max-w-[220px]">
              <div className="text-xs text-gray-400 mb-2 font-medium">Matched for you</div>
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {['#002145', '#0055A4', '#FFD100'].map((bg, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-white text-xs font-bold flex items-center justify-center text-white"
                      style={{ backgroundColor: bg, color: bg === '#FFD100' ? '#002145' : 'white' }}
                    >
                      {['S', 'N', 'B'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-navy text-xs font-semibold">Hiking & Outdoors UBC</div>
                  <div className="text-gray-400 text-xs">47 members · 3 mutual interests</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UX flow banner */}
      <section className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-0 flex-wrap">
          {[
            { step: '1', label: 'Build your interest profile' },
            { step: '2', label: 'Discover matched events' },
            { step: '3', label: 'Join interest chat rooms' },
            { step: '4', label: 'Coordinate — maps, Uber, transit' },
            { step: '5', label: 'Actually show up together' },
          ].map((s, i, arr) => (
            <div key={s.step} className="flex items-center">
              <div className="flex items-center gap-2.5 px-4 py-2">
                <div className="w-6 h-6 bg-navy rounded-full flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                  {s.step}
                </div>
                <span className="text-navy text-sm font-medium whitespace-nowrap">{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="text-gray-300 text-lg mx-1">›</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold text-navy mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Everything in one place
            </h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
              From discovering what's happening to actually getting there with people you'll connect with.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: '📡',
                title: 'Aggregated Events',
                desc: "We scrape AMS, club pages, Instagram, and Reddit so you never miss what's happening — filtered to what actually interests you.",
                tags: ['AMS Events', 'Club Websites', 'Instagram', 'Reddit r/UBC'],
                accent: 'bg-blue-50 border-blue-100',
              },
              {
                icon: '💬',
                title: 'Interest-Matched Rooms',
                desc: 'Your profile gets you dropped into group chats with students who share your specific hobbies and vibe. Real connections, not random mass chats.',
                tags: ['Personality matching', 'Interest groups', 'Event chats'],
                accent: 'bg-purple-50 border-purple-100',
              },
              {
                icon: '🚀',
                title: 'Get There, Together',
                desc: 'Coordinate meetup spots, split Ubers, find carpool partners, and get transit info — so actually showing up is easy.',
                tags: ['Google Maps', 'Uber split', 'Transit', 'Carpool match'],
                accent: 'bg-green-50 border-green-100',
              },
            ].map((f) => (
              <div key={f.title} className={`bg-white rounded-2xl p-6 border ${f.accent} hover:shadow-md transition-shadow`}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-navy text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{f.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.tags.map(t => (
                    <span key={t} className="bg-campus text-navy text-xs px-2.5 py-1 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sources strip */}
      <section className="py-10 px-6 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-6">We pull events from</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['AMS UBC', 'UBC Rec', 'Instagram', 'Reddit r/UBC', 'Club Pages', 'Facebook Events', 'UBC Arts + Science', 'Eventbrite'].map(s => (
              <span key={s} className="text-gray-400 font-medium text-sm">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20 px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Your campus is more active than you think.
        </h2>
        <p className="text-white/55 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
          Join 12,000+ UBC students already discovering events and making plans together.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-gold text-navy font-semibold px-8 py-3.5 rounded text-sm hover:bg-gold-dark transition-colors"
        >
          Get started — it"s free →
        </button>
      </section>

      <footer className="bg-navy border-t border-white/10 px-6 py-8 text-center text-white/30 text-sm">
        <div className="font-semibold text-white/50 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          UBC<span className="text-gold/50">Connect</span>
        </div>
        <div>Built for UBC students · Not affiliated with UBC · Vancouver, BC</div>
      </footer>
    </div>
  )
}
