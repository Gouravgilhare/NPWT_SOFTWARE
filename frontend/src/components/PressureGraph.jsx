import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { getStatus } from "../api/npwtApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required scales and elements to fix "category is not a registered scale" error
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PressureGraph() {
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [isRunning, setIsRunning] = useState(null); // null = unknown, true/false = device state
  const mountedRef = useRef(false);
  const intervalRef = useRef(null);
  const lastTsRef = useRef(null);
  const INTERVAL_MS = 1000;
  const MAX_POINTS = 60;
  const LOCAL_URL = "http://backend:8080/api/device/local-data";

  // normalize various possible server responses into an array of points
  const normalizeResponse = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    // common wrappers
    if (Array.isArray(resData.data)) return resData.data;
    if (Array.isArray(resData.logs)) return resData.logs;
    if (Array.isArray(resData.points)) return resData.points;
    // if object with numeric keys -> map to array
    if (typeof resData === "object") {
      const vals = Object.values(resData).filter(
        (v) => v && (v.timestamp || v.ts || v.currentPressure || v.current)
      );
      if (vals.length) return vals;
    }
    return [];
  };

  useEffect(() => {
    mountedRef.current = true;

    const pushPoint = (point) => {
      setData((prev) => {
        const labels = [...(prev.labels || [])];
        const ds0 = prev.datasets?.[0]?.data?.slice() || [];
        const ds1 = prev.datasets?.[1]?.data?.slice() || [];

        labels.push(point.label);
        ds0.push(point.current);
        ds1.push(point.target);

        while (labels.length > MAX_POINTS) {
          labels.shift();
          ds0.shift();
          ds1.shift();
        }

        return {
          labels,
          datasets: [
            {
              label: "Current Pressure",
              data: ds0,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75,192,192,0.15)",
              fill: false,
            },
            {
              label: "Target Pressure",
              data: ds1,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255,99,132,0.12)",
              fill: false,
            },
          ],
        };
      });
    };

    // fetch latest point only when device is running
    const fetchIfRunning = async () => {
      try {
        // check device status first
        const statusRes = await getStatus();
        const statusData = statusRes?.data ?? {};
        const running =
          typeof statusData.running !== "undefined"
            ? statusData.running
            : typeof statusData.state === "string"
            ? String(statusData.state).toLowerCase() === "running"
            : true; // default to true if backend doesn't report

        setIsRunning(running);

        if (!running) {
          // device stopped: do not fetch/append live points (keep previous data)
          return;
        }

        // device running -> fetch latest local-data and append latest point
        const res = await axios.get(LOCAL_URL);
        const logs = normalizeResponse(res.data);
        if (logs.length === 0) return;

        const latest = logs[logs.length - 1];
        const ts = latest.timestamp ?? latest.ts ?? new Date().toISOString();
        if (ts === lastTsRef.current) return; // skip duplicate
        lastTsRef.current = ts;

        const label = ts
          ? new Date(ts).toLocaleTimeString()
          : new Date().toLocaleTimeString();
        const current =
          latest.currentPressure ?? latest.current ?? latest.pressure ?? null;
        const target =
          latest.targetPressure ?? latest.target ?? latest.setPressure ?? null;

        if (mountedRef.current) pushPoint({ label, current, target });
      } catch (err) {
        console.error("Failed to fetch point or status", err);
      }
    };

    // initial populate: fetch recent points so chart shows previous data immediately
    (async () => {
      try {
        const res = await axios.get(LOCAL_URL);
        const logs = normalizeResponse(res.data);
        const recent = logs.slice(-MAX_POINTS);
        if (recent.length > 0) {
          lastTsRef.current =
            recent[recent.length - 1].timestamp ??
            recent[recent.length - 1].ts ??
            null;
          const labels = recent.map((l) =>
            l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : ""
          );
          const ds0 = recent.map(
            (l) => l.currentPressure ?? l.current ?? l.pressure ?? null
          );
          const ds1 = recent.map(
            (l) => l.targetPressure ?? l.target ?? l.setPressure ?? null
          );
          if (mountedRef.current) {
            setData({
              labels,
              datasets: [
                {
                  label: "Current Pressure",
                  data: ds0,
                  borderColor: "rgb(75, 192, 192)",
                  backgroundColor: "rgba(75,192,192,0.15)",
                  fill: false,
                },
                {
                  label: "Target Pressure",
                  data: ds1,
                  borderColor: "rgb(255, 99, 132)",
                  backgroundColor: "rgba(255,99,132,0.12)",
                  fill: false,
                },
              ],
            });
          }
        }
      } catch (err) {
        console.warn("Initial logs fetch failed", err);
      } finally {
        // start regular 1s loop which will check status and append only if running
        if (!mountedRef.current) return;
        intervalRef.current = setInterval(() => {
          if (mountedRef.current) fetchIfRunning();
        }, INTERVAL_MS);
      }
    })();

    return () => {
      mountedRef.current = false;
      // clear interval if set
      try {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasLabels = Array.isArray(data.labels) && data.labels.length > 0;

  if (!hasLabels) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div className="muted">No pressure data available yet.</div>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      title: { display: false, text: "Pressure over time" },
    },
    scales: {
      x: { display: true, title: { display: false } },
      y: { display: true, title: { display: true, text: "Pressure (mmHg)" } },
    },
  };

  return (
    <div
      className="card"
      style={{ height: 360, padding: 12, position: "relative" }}
    >
      {!isRunning && isRunning !== null ? (
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            zIndex: 5,
            background: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          Device stopped — displaying previous data
        </div>
      ) : null}
      <Line data={data} options={options} />
    </div>
  );
}
