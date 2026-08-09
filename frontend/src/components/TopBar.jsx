import React from 'react';
import { Sun, Moon, LogOut, LayoutDashboard, ReceiptText, LineChart, User, ShieldAlert } from 'lucide-react';

export default function TopBar({ page, setPage, user, logout, theme, toggleTheme }) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'insights', label: 'Insights', icon: LineChart },
  ];

  return (
    <header className="glass-card" style={{
      margin: '16px 24px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '16px',
      zIndex: 100,
      borderRadius: '99px',
      border: '1px solid var(--border)',
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setPage('/')} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '20px',
          letterSpacing: '-0.5px',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28">
          <defs>
            <linearGradient id="logo-grad-nav" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-tertiary)" />
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="90" height="90" rx="26" fill="transparent" stroke="url(#logo-grad-nav)" strokeWidth="8" />
          <path d="M 25 70 C 25 70, 35 45, 50 45 C 65 45, 75 70, 75 70" fill="none" stroke="url(#logo-grad-nav)" strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="30" r="10" fill="url(#logo-grad-nav)" />
        </svg>
        <span>Spend<span style={{
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Sense</span></span>
      </div>

      {/* Navigation Links */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        position: 'relative'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                background: isActive ? 'var(--surface-hover)' : 'transparent',
                border: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '8px 18px',
                borderRadius: '99px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                border: isActive ? '1px solid var(--border-hover)' : '1px solid transparent',
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Area & Theme Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--accent-warn)' }} /> : <Moon size={18} style={{ color: 'var(--accent-primary)' }} />}
        </button>

        {/* User profile info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '4px 12px 4px 4px',
          borderRadius: '99px',
          color: 'var(--text)',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--gradient-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12px',
            color: '#ffffff',
          }}>
            {user?.name?.[0]?.toUpperCase() || <User size={14} />}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
        </div>

        {/* Obvious, Dedicated Sign Out Button */}
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            borderRadius: '99px',
            gap: '6px',
            border: '1px solid var(--border)',
          }}
          title="Sign Out of SpendSense"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
