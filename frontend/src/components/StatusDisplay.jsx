import React, { useEffect, useState } from "react";
import { getStatus } from "../api/npwtApi";

const formatValue = (key, val) => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "number") {
    if (key.toLowerCase().includes("pressure")) return `${val} mmHg`;
    if (key.toLowerCase().includes("temp")) return `${val} °C`;
    return String(val);
  }
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

const StatusDisplay = () => {
  const [status, setStatus] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(null); // null=unknown, false=not connected, true=connected

  useEffect(() => {
    let connTimer = null;
    let pollTimer = null;
    const POLL_INTERVAL = 2000;

    const startConnCheck = () => {
      // lightweight periodic attempts to detect device connection
      connTimer = setInterval(async () => {
        try {
          const res = await getStatus();
          const isConnected = res?.data?.connected ?? true; // prefer explicit flag if backend provides it
          if (isConnected) {
            // device became available — set state and start continuous polling
            setStatus(res.data || {});
            setLastUpdated(new Date());
            setConnected(true);
            clearInterval(connTimer);
            connTimer = null;
            startPolling();
          } else {
            setConnected(false);
          }
        } catch (e) {
          setConnected(false);
        }
      }, POLL_INTERVAL);
    };

    const startPolling = () => {
      // continuous status updates while device is connected
      pollTimer = setInterval(async () => {
        try {
          const res = await getStatus();
          setStatus(res.data || {});
          setLastUpdated(new Date());
          setConnected(true);
        } catch (e) {
          // polling failed -> assume device disconnected, stop polling and resume connection checks
          console.error(
            "status poll failed, switching to connection checks",
            e
          );
          setConnected(false);
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
          if (!connTimer) startConnCheck();
        }
      }, POLL_INTERVAL);
    };

    // initial attempt: try to get status once and decide path
    (async () => {
      setLoading(true);
      try {
        const res = await getStatus();
        const isConnected = res?.data?.connected ?? true;
        if (isConnected) {
          setStatus(res.data || {});
          setLastUpdated(new Date());
          setConnected(true);
          startPolling();
        } else {
          setConnected(false);
          startConnCheck();
        }
      } catch (e) {
        setConnected(false);
        startConnCheck();
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (connTimer) clearInterval(connTimer);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  return (
    <div className="status-display card">
      <div className="status-header">
        <h3>Device Status</h3>
        <div className="muted small">
          Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
        </div>
      </div>

      {connected === false ? (
        <div className="muted">
          Device not connected — retrying connection...
        </div>
      ) : loading ? (
        <div className="muted">Checking device status…</div>
      ) : null}

      <div className="status-grid" aria-busy={loading}>
        {Object.keys(status).length > 0 ? (
          Object.entries(status).map(([key, val]) => (
            <div className="status-item" key={key}>
              <div className="status-key">{key}</div>
              <div className="status-value">{formatValue(key, val)}</div>
            </div>
          ))
        ) : connected === false ? (
          <div className="empty">No status — device disconnected</div>
        ) : (
          <div className="empty">No status available</div>
        )}
      </div>
    </div>
  );
};

export default StatusDisplay;
