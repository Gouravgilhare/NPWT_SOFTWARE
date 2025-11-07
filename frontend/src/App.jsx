import React, { useEffect, useState } from "react";
import "./styles/App.css";
import Dashboard from "./pages/Dashboard";

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className={`app-root ${theme}`}>
      <header className="app-header card">
        <div className="brand">NPWT Control</div>
        <div className="header-actions">
          <button className="btn muted" onClick={() => alert("Open help")}>
            Help
          </button>
          <button
            className="btn theme-toggle"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌞" : "🌙"}
          </button>
        </div>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
