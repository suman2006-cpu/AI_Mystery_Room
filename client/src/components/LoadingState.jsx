import { LoaderCircle, Sparkles } from "lucide-react";

export function LoadingState({ title = "Opening the case file", detail = "Putting the pieces together…" }) {
  return (
    <div className="state-screen">
      <div className="loading-seal"><Sparkles size={25} /><LoaderCircle size={18} className="spin loading-orbit" /></div>
      <p className="eyebrow">PLEASE STAND BY</p>
      <h2>{title}</h2>
      <p className="muted">{detail}</p>
      <div className="loading-line"><span /></div>
    </div>
  );
}

export function ErrorState({ title = "This trail went cold", message, onRetry }) {
  return (
    <div className="state-screen error-state">
      <div className="error-seal">!</div>
      <p className="eyebrow">A SMALL SETBACK</p>
      <h2>{title}</h2>
      <p className="muted error-copy">{message}</p>
      {onRetry && <button className="button button-primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}
