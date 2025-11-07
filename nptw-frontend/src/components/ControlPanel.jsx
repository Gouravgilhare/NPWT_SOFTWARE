import React, { useState } from "react";
import { sendCommand } from "../api/npwtApi";

const ControlPanel = () => {
  const [pressure, setPressure] = useState(200);
  const [duration, setDuration] = useState(300);
  const [onTime, setOnTime] = useState(3);
  const [offTime, setOffTime] = useState(2);
  const [sending, setSending] = useState(false);

  const buildCommand = (cmdKey) => {
    const base = {
      startContinuous: {
        command: "start",
        mode: "continuous",
        setPressure: pressure,
        duration,
      },
      startCycle: {
        command: "start",
        mode: "cycle",
        setPressure: pressure,
        duration,
        onTime,
        offTime,
      },
      pause: { command: "pause" },
      resume: { command: "resume" },
      stop: { command: "stop" },
      status: { command: "status" },
    };
    return base[cmdKey];
  };

  const handleCommand = async (cmdKey) => {
    setSending(true);
    const payload = buildCommand(cmdKey);
    try {
      await sendCommand(payload);
      // notify logs panel via a lightweight custom event
      window.dispatchEvent(
        new CustomEvent("npwt:command", {
          detail: { ts: new Date().toLocaleTimeString(), cmd: cmdKey, payload },
        })
      );
    } catch (err) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent("npwt:command", {
          detail: {
            ts: new Date().toLocaleTimeString(),
            cmd: "error",
            payload: { error: String(err) },
          },
        })
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="control-panel card">
      <h3 className="panel-title">Device Control</h3>
      <div className="form-row">
        <label>Target Pressure</label>
        <input
          type="number"
          value={pressure}
          onChange={(e) => setPressure(Number(e.target.value))}
        />
      </div>
      <div className="form-row">
        <label>Duration (sec)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>
      <div className="form-row small">
        <label>Cycle on / off (s)</label>
        <input
          type="number"
          value={onTime}
          onChange={(e) => setOnTime(Number(e.target.value))}
          style={{ width: 55, marginRight: 8 }}
        />
        <input
          type="number"
          value={offTime}
          onChange={(e) => setOffTime(Number(e.target.value))}
          style={{ width: 55 }}
        />
      </div>

      <div className="button-grid" style={{ marginTop: 12 }}>
        <button
          className="btn primary"
          disabled={sending}
          onClick={() => handleCommand("startContinuous")}
        >
          {sending ? "Sending..." : "Start Continuous"}
        </button>
        <button
          className="btn primary-outline"
          disabled={sending}
          onClick={() => handleCommand("startCycle")}
        >
          Start Cycle
        </button>
        <button
          className="btn"
          disabled={sending}
          onClick={() => handleCommand("pause")}
        >
          Pause
        </button>
        <button
          className="btn"
          disabled={sending}
          onClick={() => handleCommand("resume")}
        >
          Resume
        </button>
        <button
          className="btn danger"
          disabled={sending}
          onClick={() => handleCommand("stop")}
        >
          Stop
        </button>
        <button
          className="btn muted"
          disabled={sending}
          onClick={() => handleCommand("status")}
        >
          Get Status
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
