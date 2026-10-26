import { Fingerprint } from "lucide-react";
import { Link } from "react-router-dom";

export default function Brand({ compact = false }) {
  return (
    <Link className={`brand ${compact ? "brand-compact" : ""}`} to="/" aria-label="AI Mystery Room home">
      <span className="brand-mark"><Fingerprint size={23} strokeWidth={1.65} /></span>
      {!compact && <span className="brand-copy"><strong>THE MYSTERY ROOM</strong><small>AN INTELLIGENCE EXPERIMENT</small></span>}
    </Link>
  );
}
