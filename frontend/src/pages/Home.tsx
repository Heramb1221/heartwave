import { SignInButton, SignUpButton, useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import "./Home.css";

/* ══════════════════════════════════
   SVG COMPONENTS
══════════════════════════════════ */
const Logo = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6C3FFF"/>
        <stop offset="100%" stopColor="#FF7A30"/>
      </linearGradient>
    </defs>
    <path d="M12,20C12,20 4,15 4,9.5C4,6.5 6.5,4 9.5,4.5C11,4.8 12,6 12,7.2C12,6 13,4.8 14.5,4.5C17.5,4 20,6.5 20,9.5C20,15 12,20 12,20Z"
      fill="url(#lg1)"/>
  </svg>
);

/* ══════════════════════════════════
   DATA
══════════════════════════════════ */
const STATS = [
  { num: "4.2M+",  lbl: "Active Listeners" },
  { num: "180+",   lbl: "Countries" },
  { num: "<100ms", lbl: "Sync Latency" },
  { num: "50K",    lbl: "Karaoke Songs" },
];

const FEATURES = [
  { icon: "🎧", cls: "fi-coral",  title: "Sync Rooms",          desc: "Create a room in seconds. Share the code. Every listener hears the exact same beat at the same millisecond — no lag, ever." },
  { icon: "🎤", cls: "fi-violet", title: "Karaoke Mode",         desc: "Scrolling lyrics perfectly synced to the beat. Real-time pitch scoring. Challenge your friends to beat your high score." },
  { icon: "💜", cls: "fi-violet", title: "Reactions",            desc: "Send animated reactions that burst across everyone's screen simultaneously — feel the crowd energy ripple in real time." },
  { icon: "🎵", cls: "fi-coral",  title: "Collaborative Queue",  desc: "Anyone in the room can add tracks. Vote songs up or down, skip together, or hand DJ controls exclusively to the host." },
  { icon: "🌊", cls: "fi-teal",   title: "Live Waveform",        desc: "A shared audio waveform pulses across all connected devices — a visual heartbeat tying every listener together." },
  { icon: "🔒", cls: "fi-pink",   title: "Private Sessions",     desc: "Password-protect your room. Only the people you invite can join. Your vibe, your rules, your crowd." },
];

const ROOMS = [
  { genre: "Electronic", karaoke: false, name: "Lo-fi Chill Vibes 🌙",    count: "247",  open: true,  avs: ["JK","M","A"],   more: "+244" },
  { genre: "Afrobeats",  karaoke: false, name: "Afrobeats Friday 🌍",      count: "891",  open: true,  avs: ["T","SA","N"],   more: "+888" },
  { genre: "Bollywood",  karaoke: true,  name: "90s Bollywood Night 🎬",   count: "1.2K", open: false, avs: ["P","D","R"],    more: "+1197" },
  { genre: "K-Pop",      karaoke: true,  name: "K-Pop Stans Unite 💜",     count: "2.1K", open: true,  avs: ["SY","JY","H"],  more: "+2097" },
];

const STEPS = [
  { n: "01", title: "Create or Join a Room",    desc: "Hit 'Start a Jam' to spin up a room, or paste a link to jump into a friend's session." },
  { n: "02", title: "Build the Queue Together", desc: "Search millions of tracks. Add songs, vote on what's next, or let the host DJ." },
  { n: "03", title: "Listen in Perfect Sync",   desc: "Everyone hears the same beat at the same millisecond — no matter where on earth they are." },
  { n: "04", title: "Sing & React Together",    desc: "Tap the mic for Karaoke Mode. Lyrics scroll, pitch detection scores you live. Your room is a stage." },
];

const AV_COLORS = ["av-coral", "av-violet", "av-teal", "av-pink"];

/* ══════════════════════════════════
   COMPONENT
══════════════════════════════════ */
export default function Home() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [pct, setPct] = useState(0);
  const homeRef = useRef<HTMLDivElement>(null);

  // Redirect signed-in users
  useEffect(() => { if (isSignedIn) navigate("/dashboard"); }, [isSignedIn, navigate]);

  // Loader counter
  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + Math.floor(Math.random() * 4) + 1);
      setPct(p);
      if (p >= 100) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, []);

  // Loader exit
  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => setLoading(false), 800);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Scroll reveal
  const initReveal = useCallback(() => {
    if (!homeRef.current) return;
    const els = homeRef.current.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), i * 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!loading) setTimeout(initReveal, 120);
  }, [loading, initReveal]);

  return (
    <>
      {/* ═══ LOADER ═══ */}
      {loading && (
        <div className={`ml-loader${exiting ? " exiting" : ""}`}>
          <div className="loader-visual">
            <div className="loader-ring" />
            <div className="loader-ring" />
            <div className="loader-ring" />
            <div className="loader-icon">🎧</div>
          </div>
          <div className="loader-text">
            <div className="loader-title">Melodies</div>
            <div className="loader-sub">Listen Together · Anywhere · In Sync</div>
          </div>
          <div className="loader-progress">
            <div className="loader-bar-track">
              <div className="loader-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="loader-pct-row">
              <span>Syncing your heartbeat…</span>
              <span className="loader-pct-num">{pct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HOME ═══ */}
      <div ref={homeRef} className={`ml-home${!loading ? " visible" : ""}`}>

        {/* NAVBAR */}
        <nav className="ml-nav">
          <div className="ml-nav-logo" onClick={() => navigate("/")}>
            <div className="ml-nav-logo-icon"><Logo size={18} /></div>
            Melodies
          </div>
          <div className="ml-nav-links">
            <a href="#features">Features</a>
            <a href="#rooms">Rooms</a>
            <a href="#karaoke">Karaoke</a>
            <a href="#how">How It Works</a>
          </div>
          <div className="ml-nav-right">
            {isSignedIn ? (
              <>
                <button className="btn btn-primary btn-sm btn-pill" onClick={() => navigate("/dashboard")}>
                  Start Jamming
                </button>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="btn btn-ghost btn-sm btn-pill">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary btn-sm btn-pill">Get Started</button>
                </SignUpButton>
              </>
            )}
          </div>
        </nav>

        {/* HERO */}
        <section className="ml-hero">
          <div className="ml-mesh">
            <div className="ml-blob ml-blob-1" />
            <div className="ml-blob ml-blob-2" />
            <div className="ml-blob ml-blob-3" />
          </div>
          <div className="ml-grid" />

          <div className="hero-content">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              3,241 sessions live right now
            </div>

            <h1 className="hero-title">
              Music is better<br />
              <span className="hero-title-line2">when shared.</span>
            </h1>

            <p className="hero-sub">
              Create a sync room, invite your people, and feel every beat together —
              no matter where on earth you are. Real-time, millisecond-precise.
            </p>

            <div className="hero-cta">
              {isSignedIn ? (
                <button className="btn btn-primary btn-lg btn-pill" onClick={() => navigate("/dashboard")}>
                  ▶ &nbsp; Start a Jam
                </button>
              ) : (
                <SignUpButton mode="modal">
                  <button className="btn btn-primary btn-lg btn-pill">▶ &nbsp; Start a Jam</button>
                </SignUpButton>
              )}
              <SignInButton mode="modal">
                <button className="btn btn-ghost btn-lg btn-pill">Join a Room →</button>
              </SignInButton>
            </div>
          </div>

          {/* Waveform visualizer */}
          <div className="hero-waveform">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="hero-wb" />
            ))}
            <div className="hero-waveform-label">Live sync · 180+ countries</div>
          </div>
        </section>

        {/* STATS */}
        <div className="ml-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="stats-strip reveal">
            {STATS.map(s => (
              <div key={s.lbl} className="stat-cell">
                <span className="stat-num">{s.num}</span>
                <span className="stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="ml-section" id="features">
          <div className="reveal">
            <div className="ml-section-label">Why Melodies</div>
            <div className="ml-section-title">Every feature built<br />for shared listening.</div>
            <div className="ml-section-desc">
              Shared music creates moments that solo listening never can.
              We built every feature around that one truth.
            </div>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`feat-card reveal delay-${((i % 4) + 1) * 100}`}>
                <div className={`feat-icon ${f.cls}`}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE ROOMS */}
        <div className="ml-section" style={{ paddingTop: 0 }} id="rooms">
          <div className="reveal">
            <div className="ml-section-label">Live Now</div>
            <div className="ml-section-title">Jump into a room.</div>
            <div className="ml-section-desc">
              Thousands of rooms are open right now. Find your vibe and join instantly —
              no invite needed for open rooms.
            </div>
          </div>
          <div className="rooms-panel reveal">
            <div className="rooms-panel-header">
              <div className="rooms-panel-title">
                🔥 Trending Rooms
                <div className="live-indicator">
                  <div className="live-dot-red" />
                  Live
                </div>
              </div>
              <button className="btn btn-sm btn-ghost btn-pill">Browse All</button>
            </div>
            <div className="rooms-grid">
              {ROOMS.map(r => (
                <div key={r.name} className="room-card">
                  {r.karaoke && <div className="room-karaoke-tag">🎤 Karaoke</div>}
                  <div className="room-card-genre">{r.genre}</div>
                  <div className="room-card-name">{r.name}</div>
                  <div className="room-card-meta">
                    <span>🎵 {r.count} listening</span>
                    <span>{r.open ? "🟢 Open" : "🔐 Members"}</span>
                  </div>
                  <div className="room-card-avatars">
                    {r.avs.map((av, i) => (
                      <div key={av} className={`room-av ${AV_COLORS[i % AV_COLORS.length]}`}>{av}</div>
                    ))}
                    <div className="room-av room-av-more">{r.more}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KARAOKE */}
        <div className="ml-section" style={{ paddingTop: 0 }} id="karaoke">
          <div className="karaoke-banner reveal">
            <div className="ml-section-label" style={{ marginBottom: 14 }}>✨ Karaoke Mode</div>
            <div className="karaoke-title">
              Your stage.<br />
              <span className="text-gradient">Their applause.</span>
            </div>
            <div className="karaoke-desc">
              50,000+ songs with perfectly scrolling lyrics. Real-time pitch detection
              scores you live. Sing solo, duet, or throw the mic to the room.
            </div>
            <div className="karaoke-btns">
              <button className="btn btn-primary btn-lg btn-pill">🎤 Try Karaoke</button>
              <button className="btn btn-ghost btn-lg btn-pill">Browse Songs</button>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="ml-section" style={{ paddingTop: 0 }} id="how">
          <div className="reveal">
            <div className="ml-section-label">Get Started</div>
            <div className="ml-section-title">Jamming in under<br />60 seconds.</div>
          </div>
          <div className="steps-list reveal">
            {STEPS.map(s => (
              <div key={s.n} className="step-row">
                <div className="step-n">{s.n}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="cta-banner reveal">
          <div className="ml-section-label" style={{ marginBottom: 14 }}>Free · No Ads · No Download</div>
          <div className="cta-title">
            Your next great memory<br />
            <span className="text-gradient">starts with a Jam.</span>
          </div>
          <div className="cta-desc">
            Open a room, share the link, feel the music together.
            No credit card, no install — just music and the people you love.
          </div>
          {isSignedIn ? (
            <button
              className="btn btn-primary btn-lg btn-pill"
              style={{ margin: "0 auto" }}
              onClick={() => navigate("/dashboard")}
            >
              🎧 Start Jamming Free
            </button>
          ) : (
            <SignUpButton mode="modal">
              <button className="btn btn-primary btn-lg btn-pill" style={{ margin: "0 auto" }}>
                🎧 Start Jamming Free
              </button>
            </SignUpButton>
          )}
        </div>

        {/* FOOTER */}
        <footer className="ml-footer">
          <div className="footer-logo">🎵 Melodies</div>
          <div className="footer-copy">© 2025 Melodies — Listen Together. Feel Everything.</div>
          <div className="footer-links">
            <a href="https://github.com/Heramb1221/heartwave" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#">Credits</a>
            <a href="mailto:hchaudhari1221@gmail.com">Contact</a>
          </div>
        </footer>

      </div>
    </>
  );
}
