import { Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'project-nexus-theme';

export default function Layout() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">Project Nexus</Link>
        <div className="topbar-actions">
          <button type="button" className="secondary" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
