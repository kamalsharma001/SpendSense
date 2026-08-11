import React from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import ExpensesPage from './components/ExpensesPage';
import InsightsPage from './components/InsightsPage';
import NotFoundPage from './components/NotFoundPage';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Dynamic API endpoint

export default function App() {
  const [user, setUser] = React.useState(null);
  const [checkedAuth, setCheckedAuth] = React.useState(false);
  const [theme, setTheme] = React.useState('dark'); // 'dark' (default) or 'light'
  
  // HTML5 History API Path Routing (No hash!)
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname || '/');

  // Razorpay-style unlock animation state
  const [showUnlockAnim, setShowUnlockAnim] = React.useState(false);
  const [pendingUser, setPendingUser] = React.useState(null);

  // Initialize Theme
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = `theme-${savedTheme}`;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.body.className = `theme-${nextTheme}`;
  };

  // Validate Token on startup
  React.useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          console.error('Failed to authenticate stored token', e);
        }
      }
      setCheckedAuth(true);
    };
    checkUser();
  }, []);

  // Listen to browser Back/Forward (popstate)
  React.useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Custom Navigation function (pushes history and updates state manually)
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Central Route Guards (Redirect logic)
  React.useEffect(() => {
    if (!checkedAuth) return;

    const path = currentPath || '/';
    const isAuthRoute = ['/login', '/signup'].includes(path);
    const isProtectedRoute = ['/dashboard', '/expenses', '/insights'].includes(path);

    if (!user && isProtectedRoute) {
      navigateTo('/login');
    } else if (user && isAuthRoute) {
      navigateTo('/dashboard');
    }
  }, [currentPath, user, checkedAuth]);

  const handleLoginSuccess = (loggedInUser) => {
    setPendingUser(loggedInUser);
    setShowUnlockAnim(true);

    setTimeout(() => {
      setUser(loggedInUser);
      setShowUnlockAnim(false);
      navigateTo('/dashboard');
    }, 1800);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigateTo('/');
  };

  if (!checkedAuth) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  // Razorpay Lock/Unlock Overlay
  if (showUnlockAnim) {
    return (
      <div className="rp-unlock-overlay">
        <div className="rp-success-circle">
          <svg>
            <circle cx="50" cy="50" r="45" />
          </svg>
          <div className="rp-check-mark" />
        </div>
        <div className="rp-success-text">AUTHENTICATION APPROVED</div>
        <div className="rp-success-sub">Accessing secure coordinates...</div>
      </div>
    );
  }

  const path = currentPath || '/';
  
  // Render routing logic
  const renderRoute = () => {
    if (path === '/' || path === '/landing') {
      return (
        <LandingPage 
          API={API}
          onStart={() => navigateTo(user ? '/dashboard' : '/login')} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      );
    }

    if (path === '/login' || path === '/signup') {
      return (
        <AuthPage 
          API={API} 
          onLogin={handleLoginSuccess} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      );
    }

    if (path === '/dashboard') {
      return <Dashboard API={API} theme={theme} setPage={(p) => navigateTo(p.startsWith('/') ? p : '/' + p)} />;
    }

    if (path === '/expenses') {
      return <ExpensesPage API={API} />;
    }

    if (path === '/insights') {
      return <InsightsPage API={API} theme={theme} />;
    }

    // 404 Route fallback
    return <NotFoundPage goHome={() => navigateTo('/')} />;
  };

  const showTopBar = user && ['/dashboard', '/expenses', '/insights'].includes(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showTopBar && (
        <TopBar 
          page={path.replace('/', '')} 
          setPage={(p) => navigateTo(p.startsWith('/') ? p : '/' + p)} 
          user={user} 
          logout={handleLogout} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      
      <div style={{ flex: 1 }}>
        {renderRoute()}
      </div>
    </div>
  );
}
