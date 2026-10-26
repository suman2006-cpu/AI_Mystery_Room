import { ArrowDown, ArrowRight, ArrowUpRight, BrainCircuit, Check, ChevronRight, CircleDot, Eye, Fingerprint, KeyRound, LockKeyhole, Orbit, ScanEye, ShieldCheck, Sparkles, Target, WandSparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const stages = [
  { number: "01", icon: <Sparkles size={21} />, title: "Set the scene", text: "Start with a strange event, an impossible room, or a secret that refuses to stay buried.", tag: "THE PREMISE", tone: "violet" },
  { number: "02", icon: <ScanEye size={21} />, title: "Read between lines", text: "Unseal evidence, compare alibis, and catch the tiny contradictions everyone else missed.", tag: "THE INVESTIGATION", tone: "cyan" },
  { number: "03", icon: <Target size={21} />, title: "Name the truth", text: "Choose your suspect. The server checks your verdict and reveals how every detail connects.", tag: "THE VERDICT", tone: "lime" },
];

function HeroScene() {
  return (
    <div className="hero-visual" aria-label="Illustrated classified case file with a midnight manor and floating evidence cards">
      <div className="visual-topline"><span><i className="live-indicator" /> CASE SIMULATION // 001</span><span>FIELD ARCHIVE <b>●</b></span></div>
      <div className="visual-aura aura-one" /><div className="visual-aura aura-two" />
      <div className="visual-grid" />
      <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
      <div className="scene-coordinate coordinate-one">51°30'26.4"N<br />00°07'39.0"W</div>
      <div className="scene-coordinate coordinate-two">SIGNAL DETECTED<br /><span>00:14:32:08</span></div>
      <div className="manor-frame">
        <div className="manor-glow" />
        <svg className="manor-art" viewBox="0 0 560 580" role="img" aria-label="Mysterious mansion in moonlight">
          <defs>
            <linearGradient id="skyGradient" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#141d3b"/><stop offset="0.56" stopColor="#263457"/><stop offset="1" stopColor="#101727"/></linearGradient>
            <linearGradient id="windowGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d7ff8d"/><stop offset="1" stopColor="#65d8ce"/></linearGradient>
            <radialGradient id="moonGlow"><stop offset="0" stopColor="#d9e7ff" stopOpacity=".7"/><stop offset="1" stopColor="#9aaefa" stopOpacity="0"/></radialGradient>
            <linearGradient id="fog" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7c65e8" stopOpacity="0"/><stop offset=".5" stopColor="#a4badf" stopOpacity=".26"/><stop offset="1" stopColor="#6bdbca" stopOpacity="0"/></linearGradient>
          </defs>
          <rect width="560" height="580" fill="url(#skyGradient)" />
          <circle cx="388" cy="115" r="115" fill="url(#moonGlow)" />
          <circle cx="388" cy="115" r="36" fill="#dce6f9" opacity=".88" />
          {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={(i * 83 + 19) % 550} cy={(i * 41 + 15) % 320} r={i % 7 === 0 ? 1.7 : .8} fill="#dce7ff" opacity={i % 3 === 0 ? .8 : .42} />)}
          <path d="M0 343 54 295 96 314 150 244 199 310 253 278 309 322 380 265 435 313 501 275 560 318V580H0Z" fill="#171e34" />
          <path d="M0 390 88 344 137 370 216 327 274 366 333 336 404 380 471 339 560 389V580H0Z" fill="#101726" />
          <path d="M78 432V278L146 232 212 278V432Z" fill="#0b101c" stroke="#6d81ab" strokeOpacity=".6" strokeWidth="2" />
          <path d="M58 280 146 211 231 280Z" fill="#0a0f19" stroke="#8193bc" strokeOpacity=".7" strokeWidth="2" />
          <path d="M99 275V251L146 217 193 251V275" fill="none" stroke="#92a5d0" strokeOpacity=".35" />
          <path d="M125 432V346Q146 319 167 346V432" fill="#243653" stroke="#8295b8" strokeOpacity=".75" strokeWidth="2" />
          <path d="M111 330 146 308 182 330" fill="#0a101c" stroke="#8295b8" strokeOpacity=".6" />
          <path d="M210 432V246L286 188 361 246V432Z" fill="#0b101c" stroke="#7f91b8" strokeOpacity=".6" strokeWidth="2" />
          <path d="M193 249 285 172 378 249Z" fill="#0a0e17" stroke="#9baed6" strokeOpacity=".7" strokeWidth="2" />
          <path d="M249 196V178L285 148 322 178V196" fill="none" stroke="#9baed6" strokeOpacity=".32" />
          <path d="M269 432V355Q285 327 302 355V432" fill="#273857" stroke="#91a3c6" strokeOpacity=".65" strokeWidth="2" />
          <path d="M231 274H249V302H231ZM321 274H339V302H321ZM98 300H117V322H98ZM177 300H195V322H177Z" fill="url(#windowGlow)" opacity=".82" />
          <path d="M365 432V297L420 257 478 297V432Z" fill="#0b101b" stroke="#6d81ab" strokeOpacity=".55" strokeWidth="2" />
          <path d="M350 299 420 242 494 299Z" fill="#090e18" stroke="#8194bc" strokeOpacity=".65" strokeWidth="2" />
          <path d="M389 316H407V340H389ZM433 316H451V340H433Z" fill="url(#windowGlow)" opacity=".75" />
          <path d="M0 434Q120 405 213 435T410 432T560 423V580H0Z" fill="#0a111d" />
          <path d="M-20 458Q118 434 249 466T580 450" fill="none" stroke="url(#fog)" strokeWidth="22" opacity=".8" />
          <path d="M-20 490Q142 466 288 495T580 486" fill="none" stroke="url(#fog)" strokeWidth="13" opacity=".7" />
          <path d="M0 538 560 523M0 550 560 545" stroke="#8b9bcd" strokeOpacity=".1" />
          <rect x="1" y="1" width="558" height="578" fill="none" stroke="#dce7ff" strokeOpacity=".15" />
        </svg>
        <div className="scan-beam" />
        <div className="frame-caption"><span>LOCATION: BLACKTHORN MANOR</span><span>FIG. 01 / 04</span></div>
      </div>
      <div className="float-card suspect-float">
        <div className="float-card-head"><span className="mini-overline">PERSON OF INTEREST</span><span className="confidence-pill">UNVERIFIED</span></div>
        <div className="suspect-profile"><div className="profile-silhouette"><span>MV</span></div><div><strong>Marcus Vale</strong><small>THE ESTATE CURATOR</small></div><Fingerprint size={20} /></div>
        <div className="signal-meter"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
        <div className="float-card-footer"><span>ALIBI INTEGRITY</span><b>ANALYZING</b></div>
      </div>
      <div className="float-card clue-float">
        <div className="clue-icon-wrap"><KeyRound size={17} /></div><div className="clue-float-copy"><span className="mini-overline">EVIDENCE 03 / RECOVERED</span><strong>Something is missing.</strong><small>Timestamp discrepancy detected</small></div><ArrowUpRight size={15} className="clue-arrow" />
      </div>
      <div className="lens-badge"><Orbit size={16} /><span>DEDuction ENGINE</span><b>ONLINE</b></div>
      <div className="visual-bottomline"><span>OBSERVE <b>·</b> CONNECT <b>·</b> DEDUCE</span><span>ENCRYPTED CASEWORK <LockKeyhole size={11} /></span></div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home-v2">
      <section className="hero-v2 page-width">
        <div className="hero-copy-v2">
          <div className="live-kicker"><span className="kicker-spark"><Sparkles size={13} /></span><span>AN AI-POWERED MYSTERY EXPERIENCE</span><span className="kicker-line" /></div>
          <h1>Some secrets<br />refuse to stay<br /><span className="hero-gradient-word">buried<span className="title-period">.</span></span></h1>
          <p className="hero-intro">Every clue has a pulse. Every suspect has a story. Step into a living case file where <em>you</em> decide what happens next.</p>
          <div className="hero-v2-actions">
            <Link to="/create" className="button button-lime button-xlarge"><WandSparkles size={18} /> Begin an investigation <ArrowUpRight size={17} /></Link>
            <a href="#how-it-works" className="hero-text-link"><span className="play-icon"><ArrowDown size={14} /></span> How it works</a>
          </div>
          <div className="hero-metrics">
            <div className="metric"><strong>03</strong><span>DIFFICULTY MODES</span></div>
            <div className="metric-rule" />
            <div className="metric"><strong>01<span className="metric-plus">/</span>01</strong><span>TRUTH PER CASE</span></div>
            <div className="metric-rule" />
            <div className="metric"><strong><span className="metric-infinity">∞</span></strong><span>WAYS TO THINK</span></div>
          </div>
        </div>
        <HeroScene />
        <div className="hero-bottom-note"><span className="tiny-crosshair"><CircleDot size={13} /></span><span>THE CASE IS NEVER WHAT IT FIRST APPEARS TO BE.</span><span className="hero-note-id">MR / 26—001</span></div>
      </section>

      <div className="ticker-wrap" aria-label="Mystery Room features"><div className="ticker-track"><span><Sparkles size={14} /> AI-BUILT CASES</span><i /> <span><Eye size={14} /> EVIDENCE-LED THINKING</span><i /> <span><ShieldCheck size={14} /> FAIR-PLAY SCORING</span><i /> <span><LockKeyhole size={14} /> SOLUTIONS STAY SEALED</span><i /> <span><Sparkles size={14} /> AI-BUILT CASES</span><i /> <span><Eye size={14} /> EVIDENCE-LED THINKING</span><i /> <span><ShieldCheck size={14} /> FAIR-PLAY SCORING</span><i /> <span><LockKeyhole size={14} /> SOLUTIONS STAY SEALED</span><i /></div></div>

      <section id="how-it-works" className="method-section page-width">
        <div className="method-heading"><div><div className="live-kicker"><span className="kicker-line" /><span>THE ART OF DEDUCTION</span></div><h2>Not a game of chance.<br /><span>A game of <em>noticing.</em></span></h2></div><p>Ignore the noise. Follow the detail that doesn't belong. The room gives you the pieces; the conclusion is yours.</p></div>
        <div className="method-grid">{stages.map((stage, index) => <article className={`method-card method-${stage.tone}`} key={stage.number}>
          <div className="method-card-glow" /><div className="method-card-top"><span className="method-number">{stage.number}</span><span className="method-icon">{stage.icon}</span></div>
          <span className="mini-overline">{stage.tag}</span><h3>{stage.title}</h3><p>{stage.text}</p>
          <div className="method-card-bottom"><span>PHASE {stage.number}</span><span className="method-progress"><i style={{ width: `${(index + 1) * 33.33}%` }} /></span><span>0{index + 1}<ChevronRight size={14} /></span></div>
        </article>)}</div>
      </section>

      <section className="difficulty-v2 page-width">
        <div className="difficulty-v2-copy"><div className="live-kicker"><span className="kicker-line" /><span>CALIBRATE YOUR INSTINCT</span></div><h2>How deep do<br />you want to <em>go?</em></h2><p>Three levels of complexity. More suspects, tighter timelines, and clues that refuse to line up until you see the pattern.</p><Link to="/create" className="button button-glass button-xlarge">Choose your case <ArrowRight size={17} /></Link></div>
        <div className="difficulty-v2-stack">
          <Link to="/create" className="level-row level-easy"><span className="level-index">01</span><span className="level-orb"><i /></span><span className="level-copy"><strong>First Look</strong><small>EASY · 3 SUSPECTS · 5 CLUES</small></span><span className="level-score"><b>100</b><small>PTS</small></span><ArrowUpRight size={17} className="level-arrow" /></Link>
          <Link to="/create" className="level-row level-medium"><span className="level-index">02</span><span className="level-orb"><i /></span><span className="level-copy"><strong>Deep Dive</strong><small>MEDIUM · 4 SUSPECTS · 7 CLUES</small></span><span className="level-score"><b>150</b><small>PTS</small></span><ArrowUpRight size={17} className="level-arrow" /></Link>
          <Link to="/create" className="level-row level-hard"><span className="level-index">03</span><span className="level-orb"><i /></span><span className="level-copy"><strong>Dark Logic</strong><small>HARD · 5 SUSPECTS · 9 CLUES</small></span><span className="level-score"><b>200</b><small>PTS</small></span><ArrowUpRight size={17} className="level-arrow" /></Link>
          <div className="difficulty-footnote"><Zap size={13} /><span>Correct accusation bonus +5 per clue discovered −10 per hint used</span></div>
        </div>
      </section>

      <section className="closing-v2 page-width"><div className="closing-grid-glow" /><div className="closing-emblem"><BrainCircuit size={25} /></div><div className="closing-copy"><span className="mini-overline">YOUR NEXT OBSESSION STARTS HERE</span><h2>The truth is in there.<br /><em>Go find it.</em></h2><p>Your case file is waiting. Bring your curiosity; leave your assumptions at the door.</p></div><Link to="/create" className="button button-lime button-xlarge">Enter the room <ArrowRight size={17} /></Link><div className="closing-watermark">CASE<br />CLOSED<span>?</span></div></section>

      <div className="home-footnote page-width"><span><Fingerprint size={14} /> THE MYSTERY ROOM</span><span>BUILT FOR CURIOUS MINDS <b>✳</b> POWERED BY GROQ AI</span></div>
    </div>
  );
}
