import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function Notice({ type = "error", children, onClose }) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`notice notice-${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon size={17} />
      <span>{children}</span>
      {onClose && <button className="notice-close" onClick={onClose} aria-label="Dismiss message"><X size={15} /></button>}
    </div>
  );
}
