import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, CircleOff, Clock3, FileCheck2, Fingerprint, Lightbulb, LockKeyhole, RotateCcw, Sparkles, Target, Trophy, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getPlayer, getResult } from "../api.js";
import { ErrorState, LoadingState } from "../components/LoadingState.jsx";

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [player, setPlayer] = useState(null);

  async function loadResult() {
    setLoading(true); setError("");
    try {
      setData(await getResult(id));
      const playerId = localStorage.getItem("mystery-room:player");
      if (playerId) getPlayer(playerId).then((profile) => { setPlayer(profile); window.dispatchEvent(new Event("mystery-room:profile-updated")); }).catch(() => {});
    }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadResult(); }, [id]);

  if (loading && !data) return <div className="page-width"><LoadingState title="Unsealing the verdict" detail="Putting the final timeline together…" /></div>;
  if (error && !data) return <div className="page-width"><ErrorState title="The case is still open" message={error} onRetry={loadResult} /></div>;
  if (!data) return null;

  const { case: caseData, result } = data;
  const accused = caseData.suspects.find((suspect) => suspect.id === result.accusation);
  const correct = result.isCorrect;
  const proofClues = result.proofClueIds.map((clueId) => caseData.clues.find((clue) => clue.id === clueId)).filter(Boolean);

  return <div className="page-width inner-page results-page">
    <div className="breadcrumb"><Link to="/"><ArrowLeft size={14} /> Back to home</Link><span>/</span><span>CASE CLOSED</span><span className="breadcrumb-status closed-status"><CheckCircle2 size={12} /> CLOSED</span></div>
    <section className={`verdict-hero ${correct ? "verdict-correct" : "verdict-incorrect"}`}>
      <div className="verdict-ornament ornament-left">✳</div><div className="verdict-ornament ornament-right">✳</div>
      <div className="verdict-icon">{correct ? <Trophy size={27} /> : <Target size={27} />}</div>
      <div className="eyebrow-row center-eyebrow"><span className="eyebrow-line" /><span className="eyebrow">THE FINAL VERDICT</span><span className="eyebrow-line" /></div>
      <h1>{result.timedOut ? <>Time's up.<br /><span className="title-accent">The culprit got away.</span></> : correct ? <>Excellent<br /><span className="title-accent">deduction.</span></> : <>Not quite.<br /><span className="title-accent">Now you know.</span></>}</h1>
      <p>{result.timedOut ? `You ran out of time. ${result.timePenalty} points were deducted from your account.` : correct ? "You followed the trail and found the truth. Every detail led you here." : "The evidence told a different story. Review the timeline and see which detail gave it away."}</p>
      <div className={`verdict-status-badge ${correct ? "badge-correct" : "badge-incorrect"}`}>{result.timedOut ? <><CircleOff size={14} /> TIME EXPIRED</> : correct ? <><CheckCircle2 size={14} /> CORRECT ACCUSATION</> : <><CircleOff size={14} /> INCORRECT ACCUSATION</>}</div>
    </section>

    {player && <div className="rank-banner"><Trophy size={18} /><strong>{player.name}</strong><span>{player.rank}</span><span>{player.totalScore.toLocaleString()} lifetime points</span><small>{player.discoveredFiles.length} evidence files saved</small></div>}
    <div className="score-and-culprit-grid">
      <section className="score-card"><div className="score-card-top"><span className="eyebrow">YOUR CASE SCORE</span><span className="score-medal"><Trophy size={18} /></span></div><div className={`score-number ${result.score < 0 ? "score-negative" : ""}`}>{result.score > 0 ? "+" : ""}{result.score}<span>pts</span></div><div className="score-rule" /><div className="score-breakdown">{result.timedOut ? <div><span>Time expired penalty</span><strong className="negative-value">−{result.timePenalty}</strong></div> : <><div><span>Correct accusation bonus</span><strong className={correct ? "positive-value" : ""}>{correct ? `+${result.maxBaseScore}` : "+0"}</strong></div><div><span>Evidence discovered ({caseData.progress.discoveredClueIds.length})</span><strong>+{caseData.progress.discoveredClueIds.length * 5}</strong></div><div><span>Hints used ({caseData.progress.hintsUsed})</span><strong className={caseData.progress.hintsUsed ? "negative-value" : ""}>{caseData.progress.hintsUsed ? `−${caseData.progress.hintsUsed * 10}` : "0"}</strong></div><div><span>Time remaining bonus</span><strong className="positive-value">+{result.timeBonus}</strong></div></>}</div><p className="score-footnote"><BadgeCheck size={13} /> Score calculated and verified by the server.</p></section>
      <section className="culprit-card"><div className="culprit-card-top"><span className="eyebrow">THE PERSON BEHIND IT</span><span className="culprit-stamp">REVEALED</span></div><div className="culprit-person"><div className="culprit-avatar"><Fingerprint size={27} /></div><div><h2>{result.culpritName}</h2><span>{caseData.suspects.find((suspect) => suspect.id === result.culpritId)?.role}</span></div><div className="culprit-badge"><CheckCircle2 size={16} /></div></div><div className="culprit-detail"><span>MOTIVE</span><p>{result.motive}</p></div><div className="accusation-comparison"><div><span>YOUR ACCUSATION</span><strong>{accused?.name || (result.timedOut ? "No accusation submitted" : "Unknown")}</strong></div><span className={`accusation-result-icon ${correct ? "result-icon-correct" : "result-icon-wrong"}`}>{correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}</span></div></section>
    </div>

    <section className="solution-section"><div className="solution-heading"><div className="section-symbol"><FileCheck2 size={19} /></div><div><span className="eyebrow">THE MISSING PIECES</span><h2>How it all fits together</h2><p>The logic behind the solution, without the red string.</p></div></div><div className="solution-explanation"><div className="solution-mark"><Lightbulb size={19} /></div><div><h3>The explanation</h3><p>{result.explanation}</p></div></div><div className="timeline-panel"><div className="timeline-title"><Clock3 size={16} /><h3>The timeline</h3></div><p>{result.timeline}</p></div>
      <div className="proof-heading"><span className="eyebrow">KEY EVIDENCE</span><span className="proof-count">{proofClues.length} DETAILS CONNECTED</span></div><div className="proof-grid">{proofClues.map((clue, index) => { const reasoning = result.clueReasoning.find((item) => item.clueId === clue.id)?.reasoning; return <article className="proof-card" key={clue.id}><div className="proof-top"><span>PROOF {String(index + 1).padStart(2, "0")}</span><CheckCircle2 size={14} /></div><h3>{clue.title}</h3><p>{reasoning || clue.content}</p><div className="proof-raw"><span>ORIGINAL CLUE</span><p>{clue.content}</p></div></article>; })}</div>
    </section>

    <section className="results-outro"><div className="outro-emblem"><Sparkles size={21} /></div><div><span className="eyebrow">EVERY CASE LEAVES A TRACE</span><h2>Ready for another mystery?</h2><p>New premise, new suspects, and a fresh trail to follow.</p></div><Link to="/create" className="button button-gold button-large"><RotateCcw size={16} /> Start a new case <ArrowRight size={16} /></Link></section>
    <div className="case-closed-footer"><LockKeyhole size={13} /> CASE FILE {caseData.id.slice(-6).toUpperCase()} <span>·</span> CLOSED <span>·</span> {caseData.difficulty.toUpperCase()} DIFFICULTY</div>
  </div>;
}
