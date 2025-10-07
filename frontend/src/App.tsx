import { useEffect, useState } from "react";

export default function App() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => setOk(Boolean(data?.ok)))
      .catch(e => setError(e.message));
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>React ↔ Flask check</h1>
      {ok === true && <div>✅ Backend is reachable (/api/health)</div>}
      {ok === null && !error && <div>Loading…</div>}
      {error && <div style={{ color: "crimson" }}>Error: {error}</div>}
    </main>
  );
}
