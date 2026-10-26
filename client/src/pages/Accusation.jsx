import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Fingerprint, LockKeyhole, ShieldAlert, Sparkles, Target } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { accuse, getCase } from "../api.js";
import CaseTimer from "../components/CaseTimer.jsx";
import Notice from "../components/Notice.jsx";
import { ErrorState, LoadingState } from "../components/LoadingState.jsx";

export default function Accusation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadCase() {
    setLoading(true); setError("");
    try {
      const data = await getCase(id);
      if (data.progress.completed && !data.progress.timedOut) { navigate(`/case/${id}/results`, { replace: true }); return; }
      setCaseData(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadCase(); }, [id]);

  async function handleAccuse() {
    if (!selected || submitting) return;
    setSubmitting(true); setError("");
    try {
      const response = await accuse(id, selected);
      window.dispatchEvent(new Event("mystery-room:profile-updated"));
      if (response.case.progress.timedOut) { navigate(`/case/${id}`); return; }
      navigate(`/case/${id}/results`);
    } catch (err) { setError(err.message); setSubmitting(false); }
  }

  if (loading && !caseData) return <div className="page-width"><LoadingState title="Reviewing the evidence" detail="Making sure the final accusation is ready…" /></div>;
  if (error && !caseData) return <div className="page-width"><ErrorState title="Couldn't load the suspects" message={error} onRetry={loadCase} /></div>;
  if (!caseData) return null;

  return <div className="page-width inner-page accusation-page">
    <div className="breadcrumb"><Link to={`/case/${id}`}><ArrowLeft size={14} /> Back to investigation</Link><span>/</span><span>FINAL ACCUSATION</span><CaseTimer caseData={caseData} /></div>
    <div className="accusation-hero"><div className="accusation-emblem"><Target size={28} /></div><div className="eyebrow-row"><span className="eyebrow-line" /><span className="eyebrow">CASE FILE / FINAL DECISION</span></div><h1>Who do you believe<br /><span className="title-accent">is responsible?</span></h1><p>Every story has a crack. Every alibi has a weak point. Review the people of interest and make your call.</p><div className="accusation-case-line"><span>{caseData.title}</span><span>·</span><span>{caseData.difficulty.toUpperCase()} CASE</span><span>·</span><span>{caseData.progress.discoveredClueIds.length} CLUES FOUND</span></div></div>
    {error && <Notice type="error" onClose={() => setError("")}>{error}</Notice>}
    <div className="accusation-warning"><LockKeyhole size={17} /><div><strong>One accusation. One final verdict.</strong><p>Once submitted, the solution is revealed and the case closes. Your score is calculated from evidence found and hints used.</p></div><AlertTriangle size={19} className="warning-icon" /></div>
    <div className="suspect-selection-grid">{caseData.suspects.map((suspect, index) => <button key={suspect.id} type="button" onClick={() => setSelected(suspect.id)} className={`selection-suspect-card ${selected === suspect.id ? "suspect-selected" : ""}`} aria-pressed={selected === suspect.id}>
      <div className={`suspect-avatar suspect-avatar-${index % 5}`}><span>{suspect.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div className="avatar-corner">0{index + 1}</div></div><div className="selection-suspect-info"><div><h3>{suspect.name}</h3><span>{suspect.role}</span></div><span className="selection-radio">{selected === suspect.id && <Check size={13} />}</span></div><p>{suspect.profile}</p><div className="selection-alibi"><span>STATED ALIBI</span><p>{suspect.alibi}</p></div><div className="selection-footer">{selected === suspect.id ? <><Check size={13} /> SELECTED FOR ACCUSATION</> : <>SELECT THIS SUSPECT <ArrowRight size={13} /></>}</div>
    </button>)}</div>
    <div className="final-submit-panel"><div className="final-submit-note"><span className="final-lock"><LockKeyhole size={17} /></span><div><strong>Your choice is a commitment.</strong><p>{selected ? `You have selected ${caseData.suspects.find((s) => s.id === selected)?.name}. Ready to hear the truth?` : "Select one person of interest to continue."}</p></div></div><button className="button button-gold button-large" onClick={handleAccuse} disabled={!selected || submitting}>{submitting ? <><span className="button-spinner" /> Delivering verdict…</> : <>Submit final accusation <ArrowRight size={17} /></>}</button></div>
    <div className="case-privacy-note"><Fingerprint size={14} /> The solution remains on the server until the accusation is submitted.</div>
  </div>;
}
