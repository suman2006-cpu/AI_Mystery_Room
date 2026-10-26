import { useEffect, useState } from "react";
import { ArrowUpRight, CircleHelp, Command, Sparkles, Trophy, UserRound } from "lucide-react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { createPlayer, getPlayer } from "./api.js";
import Brand from "./components/Brand.jsx";
import Home from "./pages/Home.jsx";
import CreateCase from "./pages/CreateCase.jsx";
import Investigation from "./pages/Investigation.jsx";
import Accusation from "./pages/Accusation.jsx";
import Results from "./pages/Results.jsx";

function Header({ player, onOpenAccount }) {
  const location = useLocation();
  const onCaseRoute = location.pathname.startsWith("/case/");
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="header-nav" aria-label="Main navigation">
          <a href="/#how-it-works" className="nav-link"><CircleHelp size={15} /> How it works</a>
          <span className="nav-divider" />
          <span className="engine-pill"><span className="engine-dot" /> GROQ POWERED</span>
        </nav>
        <div className="header-action">
          {player && <div className="profile-widget"><button className="profile-trigger" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}><UserRound size={16} /><span>{player.name}</span><i>{player.rank}</i><b>{player.totalScore.toLocaleString()} pts</b></button>{profileOpen && <div className="profile-popover"><div className="profile-popover-heading"><span>{player.rank}</span><strong>{player.totalScore.toLocaleString()} points</strong></div><button className="profile-open-link" onClick={onOpenAccount}>Account & saved evidence</button><h3>Recent case results</h3>{player.recentCases.length ? <ul>{player.recentCases.slice(0, 5).map((item) => <li key={item.caseId}><Link to={`/case/${item.caseId}/results`} onClick={() => setProfileOpen(false)}><span>{item.title}<small>{item.isCorrect ? "SOLVED" : "NOT SOLVED"}</small></span><b className={item.score < 0 ? "score-negative" : ""}>{item.score > 0 ? "+" : ""}{item.score} pts</b></Link></li>)}</ul> : <p className="profile-empty">Your solved cases will appear here.</p>}</div>}</div>}
          {onCaseRoute ? <Link to="/create" className="button button-outline button-small">New case <ArrowUpRight size={15} /></Link> : <Link to="/create" className="button button-gold button-small">Open a case <ArrowUpRight size={15} /></Link>}
        </div>
      </div>
    </header>
  );
}

function AccountGate({ onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { onCreated(await createPlayer(name)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="account-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="account-gate-title"><form className="account-gate-card" onSubmit={submit}><span className="account-gate-icon"><Trophy size={24} /></span><span className="eyebrow">YOUR CASE FILE STARTS HERE</span><h2 id="account-gate-title">Create your detective account</h2><p>Save your score, rank, solved cases, and discovered evidence across your investigations.</p><label htmlFor="detective-name">DETECTIVE NAME</label><input id="detective-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={40} placeholder="How should we address you?" required />{error && <p className="account-gate-error">{error}</p>}<button className="button button-gold button-large" type="submit" disabled={busy}>{busy ? "Creating your account…" : "Create account and enter"}<ArrowUpRight size={16} /></button><small>Your profile is saved with the cases you complete on this device.</small></form></div>;
}

function AccountDetails({ player, onClose }) {
  return <div className="account-details-backdrop" role="dialog" aria-modal="true" aria-labelledby="account-details-title" onClick={onClose}><section className="account-details-card" onClick={(event) => event.stopPropagation()}><button className="account-details-close" onClick={onClose} aria-label="Close account">×</button><span className="eyebrow">DETECTIVE PROFILE</span><h2 id="account-details-title">{player.name}</h2><div className="account-stats"><div><b>{player.totalScore.toLocaleString()}</b><span>POINTS</span></div><div><b>{player.rank}</b><span>RANK</span></div><div><b>{player.casesPlayed}</b><span>CASES CLOSED</span></div></div><h3>Recent case results</h3>{player.recentCases.length ? <ul className="account-recent-list">{player.recentCases.slice(0, 8).map((item) => <li key={item.caseId}><Link to={`/case/${item.caseId}/results`} onClick={onClose}><span>{item.title}<small>{item.isCorrect ? "SOLVED" : "NOT SOLVED"}</small></span><b className={item.score < 0 ? "score-negative" : ""}>{item.score > 0 ? "+" : ""}{item.score} pts</b></Link></li>)}</ul> : <p>No closed cases yet. Your case history will appear here.</p>}<h3>Evidence files saved ({player.discoveredFiles.length})</h3>{player.discoveredFiles.length ? <ul className="account-recent-list">{player.discoveredFiles.slice(-10).reverse().map((file) => <li key={file}><span>{file}</span></li>)}</ul> : <p>Evidence you uncover will be saved here.</p>}</section></div>;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand"><span className="footer-icon"><Command size={15} /></span> THE MYSTERY ROOM <span className="footer-separator">/</span> <span className="muted">A little logic. A little nerve.</span></div>
      <div className="footer-right"><Sparkles size={13} /> Built for curious minds</div>
    </footer>
  );
}

export default function App() {
  const location = useLocation();
  const [player, setPlayer] = useState(null);
  const [accountChecked, setAccountChecked] = useState(false);
  const [showAccountGate, setShowAccountGate] = useState(false);
  const [accountDetailsOpen, setAccountDetailsOpen] = useState(false);
  useEffect(() => {
    const playerId = localStorage.getItem("mystery-room:player");
    if (!playerId) { setShowAccountGate(true); setAccountChecked(true); return; }
    getPlayer(playerId).then(setPlayer).catch(() => { localStorage.removeItem("mystery-room:player"); setShowAccountGate(true); }).finally(() => setAccountChecked(true));
  }, []);
  useEffect(() => {
    if (!player?.id) return undefined;
    const refresh = () => getPlayer(player.id).then(setPlayer).catch(() => {});
    window.addEventListener("mystery-room:profile-updated", refresh);
    const interval = window.setInterval(refresh, 10000);
    return () => { window.removeEventListener("mystery-room:profile-updated", refresh); window.clearInterval(interval); };
  }, [player?.id]);
  function handlePlayerCreated(profile) {
    localStorage.setItem("mystery-room:player", profile.id);
    setPlayer(profile); setShowAccountGate(false);
  }
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <Header player={player} onOpenAccount={() => setAccountDetailsOpen(true)} />
      <main key={location.pathname} className="main-content page-transition">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCase />} />
          <Route path="/case/:id" element={<Investigation />} />
          <Route path="/case/:id/accuse" element={<Accusation />} />
          <Route path="/case/:id/results" element={<Results />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      {accountChecked && showAccountGate && <AccountGate onCreated={handlePlayerCreated} />}
      {accountDetailsOpen && player && <AccountDetails player={player} onClose={() => setAccountDetailsOpen(false)} />}
    </div>
  );
}
