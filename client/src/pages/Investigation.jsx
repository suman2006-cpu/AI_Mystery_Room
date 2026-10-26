import { useEffect, useState } from "react";
import { Activity, ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, ChevronDown, ChevronRight, Clock3, Eye, FileSearch, Fingerprint, KeyRound, Lightbulb, LockKeyhole, MapPin, ScanSearch, ShieldAlert, Sparkles, Target, UnlockKeyhole } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { discoverClue, getCase, requestHint } from "../api.js";
import Notice from "../components/Notice.jsx";
import CaseTimer from "../components/CaseTimer.jsx";
import { ErrorState, LoadingState } from "../components/LoadingState.jsx";

const monograms = ["TM", "IV", "LV", "MC", "FR"];

export default function Investigation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workingClue, setWorkingClue] = useState("");
  const [hintBusy, setHintBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadCase() {
    setLoading(true); setError("");
    try {
      const data = await getCase(id);
      if (data.progress.completed && !data.progress.timedOut) {
        navigate(`/case/${id}/results`, { replace: true });
        return;
      }
      setCaseData(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCase(); }, [id]);

  async function handleClue(clue) {
    if (clue.discovered || workingClue) return;
    setWorkingClue(clue.id); setError("");
    try {
      const updated = await discoverClue(id, clue.id);
      setCaseData(updated);
      window.dispatchEvent(new Event("mystery-room:profile-updated"));
    } catch (err) { setError(err.message); }
    finally { setWorkingClue(""); }
  }

  async function handleHint() {
    if (hintBusy || !caseData?.progress.hintsRemaining) return;
    setHintBusy(true); setError("");
    try {
      const response = await requestHint(id);
      setCaseData(response.case);
    } catch (err) { setError(err.message); }
    finally { setHintBusy(false); }
  }

  if (loading && !caseData) return <div className="page-width"><LoadingState title="Opening your investigation" detail="Laying out the evidence and checking the case file…" /></div>;
  if (error && !caseData) return <div className="page-width"><ErrorState title="Couldn't open the case" message={error} onRetry={loadCase} /></div>;
  if (!caseData) return null;

  const discoveredCount = caseData.progress.discoveredClueIds.length;
  const totalClues = caseData.clues.length;
  const progressPercent = Math.round((discoveredCount / totalClues) * 100);

  return (
    <div className="page-width inner-page investigation-page">
      <div className="breadcrumb"><Link to="/create"><ArrowLeft size={14} /> Leave investigation</Link><span>/</span><span>ACTIVE CASE</span><span className="breadcrumb-status"><span className="live-dot" /> IN PROGRESS</span><CaseTimer caseData={caseData} /></div>
      {error && <Notice type="error" onClose={() => setError("")}>{error}</Notice>}
      {caseData.provider === "demo" && <div className="demo-banner"><Sparkles size={14} /><span><strong>Curated demo case</strong> — add your Groq API key to generate a brand-new mystery from your premise.</span></div>}

      <section className="investigation-title-row"><div><div className="eyebrow-row"><span className="eyebrow-line" /><span className="eyebrow">CASE FILE / {caseData.id.slice(-6).toUpperCase()}</span></div><h1>{caseData.title}</h1><div className="case-meta-row"><span><MapPin size={14} /> {caseData.setting}</span><span className="meta-dot">·</span><span><Activity size={14} /> {caseData.difficulty} difficulty</span><span className="meta-dot">·</span><span><Clock3 size={14} /> {caseData.clues.length} pieces of evidence</span></div></div><div className="case-number-stamp"><span>OFFICIAL</span><strong>CASE<br />NO.</strong><b>{caseData.id.slice(-4).toUpperCase()}</b></div></section>

      <section className="story-panel"><div className="story-label"><span className="story-icon"><BookOpen size={16} /></span><div><span className="eyebrow">THE BRIEFING</span><h2>What we know so far</h2></div><span className="classified-label"><LockKeyhole size={11} /> CONFIDENTIAL</span></div><p>{caseData.story}</p><div className="story-bottom"><span><Fingerprint size={14} /> EVIDENCE FIRST. ASSUMPTIONS LAST.</span><span>FILED TODAY <span className="gold-dot">✳</span></span></div></section>

      <div className="investigation-layout">
        <div className="evidence-column">
          <section className="investigation-section">
            <div className="section-title-row"><div className="section-symbol"><FileSearch size={19} /></div><div><div className="eyebrow">EXHIBIT A</div><h2>Evidence locker</h2><p>Some details are waiting to be uncovered.</p></div><span className="count-badge">{discoveredCount.toString().padStart(2, "0")} <i>/ {totalClues.toString().padStart(2, "0")}</i></span></div>
            <div className="progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
            <div className="clue-grid">{caseData.clues.map((clue, index) => {
              const discovered = clue.discovered;
              const busy = workingClue === clue.id;
              return <article key={clue.id} className={`clue-card ${discovered ? "clue-discovered" : ""}`}>
                <div className="clue-card-top"><span className="clue-number">EVIDENCE {String(index + 1).padStart(2, "0")}</span>{discovered ? <span className="evidence-status found-status"><Check size={11} /> FOUND</span> : <span className="evidence-status sealed-status"><LockKeyhole size={10} /> SEALED</span>}</div>
                <div className={`clue-icon ${discovered ? "clue-icon-found" : ""}`}>{discovered ? <Eye size={18} /> : <KeyRound size={18} />}</div>
                <h3>{clue.title}</h3><p>{discovered ? clue.content : clue.teaser}</p>
                {!discovered ? <button className="clue-open-button" onClick={() => handleClue(clue)} disabled={Boolean(workingClue)}>{busy ? <><span className="mini-spinner" /> Examining…</> : <>Examine evidence <ChevronRight size={14} /></>}</button> : <div className="clue-found-footer"><BadgeCheck size={14} /> Added to your notes</div>}
              </article>;
            })}</div>
          </section>

          <section className="investigation-section suspects-section">
            <div className="section-title-row"><div className="section-symbol"><Fingerprint size={19} /></div><div><div className="eyebrow">EXHIBIT B</div><h2>People of interest</h2><p>Listen carefully. Alibis can be as revealing as evidence.</p></div><span className="count-badge">{caseData.suspects.length.toString().padStart(2, "0")} <i>PERSONS</i></span></div>
            <div className="suspect-grid">{caseData.suspects.map((suspect, index) => <article className="suspect-card" key={suspect.id}>
              <div className={`suspect-avatar suspect-avatar-${index % 5}`}><span>{suspect.name.split(" ").map((part) => part[0]).slice(0, 2).join("") || monograms[index]}</span><div className="avatar-corner">{String(index + 1).padStart(2, "0")}</div></div>
              <div className="suspect-info"><h3>{suspect.name}</h3><span className="suspect-role">{suspect.role}</span></div>
              <p>{suspect.profile}</p>
              <div className="alibi-box"><span><Clock3 size={12} /> ALIBI ON RECORD</span><p>{suspect.alibi}</p></div>
            </article>)}</div>
          </section>
        </div>

        <aside className="investigation-sidebar">
          <div className="progress-card"><div className="sidebar-card-heading"><span className="side-icon"><ScanSearch size={17} /></span><div><span className="eyebrow">YOUR STATUS</span><h3>Investigation log</h3></div></div><div className="progress-summary"><div className="progress-ring" style={{ "--progress": `${progressPercent * 3.6}deg` }}><div><strong>{progressPercent}%</strong><small>REVIEWED</small></div></div><div className="progress-stats"><div><span>Evidence found</span><strong>{discoveredCount} <small>/ {totalClues}</small></strong></div><div><span>Hints used</span><strong>{caseData.progress.hintsUsed} <small>/ {caseData.progress.hintsUsed + caseData.progress.hintsRemaining}</small></strong></div><div><span>Potential score</span><strong className="gold-text">{caseData.progress.potentialScore} <small>pts</small></strong></div></div></div><div className="sidebar-rule" /><p className="log-tip"><Lightbulb size={15} /> Every discovered clue adds 5 points. Each hint costs 10.</p></div>

          <div className="hint-card"><div className="hint-card-heading"><span className="hint-spark"><Sparkles size={17} /></span><div><span className="eyebrow">A LITTLE NUDGE</span><h3>Detective's intuition</h3></div></div><p>Stuck on a detail? Ask for a hint. It won't give the game away—but it will cost you a few points.</p>
            <div className="hint-quota">{Array.from({ length: caseData.progress.hintsUsed + caseData.progress.hintsRemaining }, (_, i) => <span key={i} className={i < caseData.progress.hintsUsed ? "hint-dot-used" : ""} />)}<small>{caseData.progress.hintsRemaining} LEFT</small></div>
            <button className="button button-outline hint-button" onClick={handleHint} disabled={hintBusy || caseData.progress.hintsRemaining === 0}>{hintBusy ? <><span className="button-spinner dark-spinner" /> Thinking…</> : <><Lightbulb size={16} /> Request a hint <ChevronDown size={14} /></>}</button>
            {caseData.progress.revealedHints.length > 0 && <div className="revealed-hints">{caseData.progress.revealedHints.map((hint) => <div className="revealed-hint" key={hint.number}><span>HINT {String(hint.number).padStart(2, "0")}</span><p>{hint.text}</p></div>)}</div>}
          </div>

          <div className="accusation-prompt"><div className="accusation-icon"><Target size={20} /></div><span className="eyebrow">THE MOMENT OF TRUTH</span><h3>Connect the dots.</h3><p>Have a theory? Choose the person whose story fails the evidence test.</p><Link className="button button-gold accusation-cta" to={`/case/${id}/accuse`}>Make an accusation <ArrowRight size={16} /></Link><div className="accusation-privacy"><LockKeyhole size={12} /> Final verdict cannot be undone.</div></div>
        </aside>
      </div>
      <div className="investigation-bottom-note"><ShieldAlert size={14} /><span>THE SOLUTION IS SEALED</span><span className="note-spacer" /><span>Nothing is revealed until your accusation is final.</span><UnlockKeyhole size={13} /></div>
    </div>
  );
}
