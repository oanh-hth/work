import { useState } from "react";

export function VersionInfo({ version, date, onCheck }: { version: number; date: string; onCheck: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const check = async () => {
    setBusy(true);
    try { await onCheck(); setFailed(false); }
    catch { setFailed(true); }
    finally { setBusy(false); }
  };
  return (
    <section aria-label="Version" className="stack">
      <p className="muted">Version {version} · {date}</p>
      <div><button type="button" disabled={busy} onClick={check}>{busy ? "Checking…" : "Check for updates"}</button></div>
      {failed && <p role="alert" className="error">Couldn't check. Are you online?</p>}
    </section>
  );
}
