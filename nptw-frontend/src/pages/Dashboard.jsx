import React from "react";

import ControlPanel from "../components/ControlPanel";
import StatusDisplay from "../components/StatusDisplay";
import LogsPanel from "../components/LogsPanel";
import PressureGraph from "../components/PressureGraph";
const Dashboard = () => {
  return (
    <>
      <div className="dashboard-container">
        <aside className="sidebar">
          <ControlPanel />
        </aside>
        <main className="main-area">
          <StatusDisplay />
          <PressureGraph />
          <LogsPanel />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
