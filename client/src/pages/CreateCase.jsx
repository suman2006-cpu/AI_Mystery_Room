import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, FileText, FlaskConical, Lightbulb, LockKeyhole, ShieldCheck, Sparkles, WandSparkles, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createCase, createPlayer, getPlayer } from "../api.js";
import Notice from "../components/Notice.jsx";

const difficulties = [
  { id: "easy", name: "Easy", label: "The warm-up", suspects: 3, clues: 5, hints: 2, base: 100, minutes: 12, note: "A satisfying first case", icon: "I" },
  { id: "medium", name: "Medium", label: "The investigator", suspects: 4, clues: 7, hints: 3, base: 150, minutes: 9, note: "Connections matter", icon: "II" },
  { id: "hard", name: "Hard", label: "The mastermind", suspects: 5, clues: 9, hints: 3, base: 200, minutes: 7, note: "Nothing is accidental", icon: "III" },
];
const prompts = [
  "A priceless painting disappears from a locked museum during a thunderstorm.",
  "A famous chef is poisoned during a private dinner, but every guest has an alibi.",
  "An antique pocket watch vanishes from a train compartment between two stations.",
  "A midnight message appears in a library that has been sealed for twenty years.",
];

export default function CreateCase() {
  const [premise, setPremise] = useState(prompts[0]);
  const [difficulty, setDifficulty] = useState("medium");
  const [demoMode, setDemoMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [player, setPlayer] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [accountBusy, setAccountBusy] = useState(false);
  const navigate = useNavigate();
  const selected = difficulties.find((item) => item.id === difficulty);

  useEffect(() => {
    const id = localStorage.getItem("mystery-room:player");
    if (id) getPlayer(id).then(setPlayer).catch(() => localStorage.removeItem("mystery-room:player"));
  }, []);

  async function handleAccount(event) {
    event.preventDefault(); setError(""); setAccountBusy(true);
    try {
      const profile = await createPlayer(playerName);
      localStorage.setItem("mystery-room:player", profile.id);
      setPlayer(profile);
    } catch (err) { setError(err.message); }
    finally { setAccountBusy(false); }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!player) throw new Error("Create your detective account before opening a case.");
      const response = await createCase({ premise: premise.trim(), difficulty, demo: demoMode, playerId: player.id });
      const nextCase = response.case;
      localStorage.setItem("mystery-room:last-case", nextCase.id);
      navigate(`/case/${nextCase.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-width inner-page create-page">
      <div className="breadcrumb"><Link to="/"><ArrowLeft size={14} /> Back to home</Link><span>/</span><span>CREATE A CASE</span></div>
      <div className="create-heading"><div><div className="eyebrow-row"><span className="eyebrow-line" /><span className="eyebrow">CASE DESIGNER · 01</span></div><h1>Set the scene.<br /><span className="title-accent">Start the mystery.</span></h1><p>Give your case a spark. We'll build the suspects, evidence, and story around it.</p></div><div className="case-seal"><div className="seal-ring"><FingerprintMark /></div><span>NEW CASE</span><small>FORM 001—B</small></div></div>
      <section className="account-panel"><div><span className="eyebrow">DETECTIVE PROFILE</span><h2>{player ? `Welcome, ${player.name}` : "Create your detective account"}</h2><p>{player ? `${player.rank} · ${player.totalScore} points · ${player.casesPlayed} cases closed · ${player.discoveredFiles.length} evidence files found` : "Your score and discovered evidence will be saved to this profile. Reach 1,000 points to become a Senior Detective."}</p>{player?.discoveredFiles.length > 0 && <details className="saved-files"><summary>View saved evidence files</summary><ul>{player.discoveredFiles.slice(-8).reverse().map((file) => <li key={file}>{file}</li>)}</ul></details>}</div>{!player && <form onSubmit={handleAccount}><input aria-label="Detective name" value={playerName} onChange={(event) => setPlayerName(event.target.value)} minLength={2} maxLength={40} placeholder="Your detective name" required /><button className="button button-gold" disabled={accountBusy}>{accountBusy ? "Creating…" : "Create account"}</button></form>}</section>

      <form className="create-layout" onSubmit={handleSubmit}>
        <div className="create-form-column">
          <section className="form-panel">
            <div className="panel-heading"><span className="panel-number">01</span><div><h2>Your premise</h2><p>Every good mystery begins with one strange detail.</p></div><FileText size={19} className="panel-heading-icon" /></div>
            <label className="field-label" htmlFor="premise">WHAT HAPPENED?</label>
            <textarea id="premise" className="premise-input" value={premise} onChange={(event) => setPremise(event.target.value)} minLength={12} maxLength={600} placeholder="A locked room. A missing heirloom. A guest who shouldn't be here…" required />
            <div className="field-meta"><span><Lightbulb size={13} /> Leave some questions unanswered.</span><span>{premise.length}/600</span></div>
            <div className="suggestions-label">NEED A SPARK? <span>Choose a starting point</span></div>
            <div className="prompt-chips">{prompts.map((prompt, index) => <button key={prompt} type="button" className={`prompt-chip ${premise === prompt ? "selected-chip" : ""}`} onClick={() => setPremise(prompt)}><span>0{index + 1}</span>{prompt}</button>)}</div>
          </section>

          <section className="form-panel difficulty-panel">
            <div className="panel-heading"><span className="panel-number">02</span><div><h2>Set the difficulty</h2><p>Choose how many moving parts you want to untangle.</p></div><FlaskConical size={19} className="panel-heading-icon" /></div>
            <div className="difficulty-selector">{difficulties.map((item) => <button key={item.id} type="button" className={`difficulty-option ${difficulty === item.id ? "difficulty-option-selected" : ""}`} onClick={() => setDifficulty(item.id)} aria-pressed={difficulty === item.id}>
              <div className="difficulty-option-top"><span className={`roman roman-${item.id}`}>{item.icon}</span>{difficulty === item.id && <span className="selected-check"><Check size={12} /></span>}</div>
              <strong>{item.name}</strong><small>{item.label}</small>
              <div className="option-counts"><span>{item.suspects} suspects</span><span>{item.clues} clues</span><span>{item.hints} hints</span><span>{item.minutes} min</span></div>
              <div className="option-bottom"><span>BASE SCORE</span><b>{item.base} <i>PTS</i></b></div>
            </button>)}</div>
          </section>
        </div>

        <aside className="create-side-column">
          <div className="case-preview-card"><div className="preview-top"><span className="eyebrow">CASE PREVIEW</span><span className="preview-badge"><span className="live-dot" /> READY</span></div><div className="preview-illustration"><div className="preview-radial" /><div className="preview-stamp"><FingerprintMark /></div><div className="preview-document"><span>CASE NO.</span><strong>001—B</strong><div /><small>CONFIDENTIAL</small></div><div className="preview-spark preview-spark-one">✳</div><div className="preview-spark preview-spark-two">✳</div></div>
            <h3>Your investigation</h3><p className="preview-description">A private dossier prepared for your eyes only.</p>
            <div className="preview-stats"><div><span>SUSPECTS</span><strong>{selected.suspects.toString().padStart(2, "0")}</strong></div><div><span>CLUES</span><strong>{selected.clues.toString().padStart(2, "0")}</strong></div><div><span>HINTS</span><strong>{selected.hints.toString().padStart(2, "0")}</strong></div></div>
            <div className="preview-score"><span><Zap size={15} /> Correct accusation bonus</span><strong>+{selected.base} pts</strong></div>
            <div className="preview-footnote"><LockKeyhole size={14} /><span>The culprit stays hidden until you submit your accusation.</span></div>
          </div>
          <div className="engine-card"><div className="engine-card-icon"><Sparkles size={18} /></div><div><strong>Powered by Groq AI</strong><p>Fresh suspects, consistent evidence, and a solution that has to hold up.</p></div><span className="engine-tick"><Check size={13} /></span></div>
          <label className="demo-toggle"><span className={`toggle-switch ${demoMode ? "toggle-on" : ""}`}><span /></span><input type="checkbox" checked={demoMode} onChange={(event) => setDemoMode(event.target.checked)} /><span className="toggle-copy"><strong>Use curated demo case</strong><small>Instant start · no AI key needed</small></span><CircleHelp size={15} title="A handcrafted case is used instead of generating a new story with Groq." /></label>
        </aside>

        <div className="create-submit-row">
          <div className="submit-note"><ShieldCheck size={17} /><span><strong>Fair-play by design</strong><small>Scoring and the final answer are verified on the server.</small></span></div>
          {error && <div className="submit-error"><Notice type="error" onClose={() => setError("")}>{error}</Notice></div>}
          <button className="button button-gold button-large submit-case-button" type="submit" disabled={!player || busy || premise.trim().length < 12}>{busy ? <><span className="button-spinner" /> Preparing your case…</> : <><WandSparkles size={18} /> {demoMode ? "Open demo case" : "Generate my mystery"} <ArrowRight size={17} /></>}</button>
        </div>
      </form>
      <p className="create-disclaimer"><LockKeyhole size={12} /> Your API key is never sent to this page. Case generation happens on the server.</p>
    </div>
  );
}

function FingerprintMark() {
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 7c-9 0-16 7-16 16M24 13c-6 0-10 4-10 10 0 10-2 13-4 16M24 18c-3 0-5 2-5 5 0 11-2 15-4 18M24 7c9 0 16 7 16 16 0 6-1 11-3 15M24 13c6 0 10 4 10 10 0 8-1 13-3 17M24 23c0 9-1 15-2 18M8 23c0-9 7-16 16-16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
