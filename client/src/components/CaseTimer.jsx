import { useEffect, useRef, useState } from "react";
import { Clock3, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { timeoutCase } from "../api.js";

function formatTime(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function CaseTimer({ caseData }) {
  const [remaining, setRemaining] = useState(caseData.timer?.timeRemaining ?? 0);
  const [timedOut, setTimedOut] = useState(Boolean(caseData.progress?.timedOut));
  const [penalty, setPenalty] = useState(caseData.progress?.timePenalty ?? 0);
  const [retry, setRetry] = useState(0);
  const requested = useRef(false);

  useEffect(() => {
    const deadline = new Date(caseData.timer.deadline).getTime();
    const tick = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [caseData.timer.deadline]);

  useEffect(() => {
    if (remaining !== 0 || requested.current) return;
    requested.current = true;
    if (caseData.progress?.timedOut) { setTimedOut(true); setPenalty(caseData.progress.timePenalty); return; }
    timeoutCase(caseData.id).then((closedCase) => {
      setTimedOut(true);
      setPenalty(closedCase.progress.timePenalty);
      window.dispatchEvent(new Event("mystery-room:profile-updated"));
    }).catch(() => {
      window.setTimeout(() => { requested.current = false; setRetry((value) => value + 1); }, 1000);
    });
  }, [remaining, caseData.id, caseData.progress?.timedOut, caseData.progress?.timePenalty, retry]);

  return <>
    <span className={`case-timer ${remaining <= 60 ? "case-timer-urgent" : ""}`} aria-live="off"><Clock3 size={14} /><span>{formatTime(remaining)}</span><small>TIME LEFT</small></span>
    {timedOut && <div className="timeout-backdrop" role="dialog" aria-modal="true" aria-labelledby="timeout-title"><section className="timeout-modal"><span className="timeout-icon"><XCircle size={26} /></span><span className="eyebrow">CASE TIME EXPIRED</span><h2 id="timeout-title">You weren't able to crack the case.</h2><p>The culprit got away before you could submit your accusation. <strong>{penalty} points</strong> have been deducted from your score.</p><Link className="button button-gold button-large" to={`/case/${caseData.id}/results`}>View case report</Link></section></div>}
  </>;
}
