import React, { useState, useEffect } from "react";

const LogsPanel = () => {
  const [logs, setLogs] = useState([
    { ts: new Date().toLocaleTimeString(), msg: "UI initialized" },
  ]);

  useEffect(() => {
    const handler = (ev) => {
      const d = ev.detail || {};
      const msg = d.cmd
        ? `${d.cmd} ${d.payload ? JSON.stringify(d.payload) : ""}`
        : JSON.stringify(d);
      setLogs((prev) =>
        [{ ts: d.ts || new Date().toLocaleTimeString(), msg }, ...prev].slice(
          0,
          200
        )
      );
    };
    window.addEventListener("npwt:command", handler);
    return () => window.removeEventListener("npwt:command", handler);
  }, []);

  const addSample = () => {
    setLogs((l) =>
      [
        { ts: new Date().toLocaleTimeString(), msg: "Sample event logged" },
        ...l,
      ].slice(0, 200)
    );
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="logs-panel card">
      <div className="logs-header">
        <h3>Logs</h3>
        <div className="logs-actions">
          <button className="btn muted" onClick={addSample}>
            Add Sample
          </button>
          <button className="btn danger" onClick={clearLogs}>
            Clear
          </button>
        </div>
      </div>
      <ul className="logs-list">
        {logs.length === 0 ? (
          <li className="muted">No logs</li>
        ) : (
          logs.map((l, i) => (
            <li key={i} className="log-line">
              <span className="log-ts">{l.ts}</span>
              <span className="log-msg">{l.msg}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default LogsPanel;
