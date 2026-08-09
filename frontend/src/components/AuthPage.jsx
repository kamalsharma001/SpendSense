import React from 'react';
import { ShieldCheck, Eye, EyeOff, Key, Sparkles, Sun, Moon, ArrowLeft } from 'lucide-react';

export default function AuthPage({ API, onLogin, theme, toggleTheme }) {
  const [tab, setTab] = React.useState('login'); // login, signup, forgot, reset
  const [form, setForm] = React.useState({ name: '', email: '', password: '', token: '', newPassword: '' });
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [debugToken, setDebugToken] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const resetMessages = () => {
    setError('');
    setMessage('');
    setDebugToken('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      let url = `${API}/api/auth/login`;
      let body = { email: form.email, password: form.password };

      if (tab === 'signup') {
        url = `${API}/api/auth/signup`;
        body = { name: form.name, email: form.email, password: form.password };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');

      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to submit request');

      setMessage(data.message);
      if (data.debug_token) {
        setDebugToken(data.debug_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          token: form.token,
          new_password: form.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed');

      setMessage(data.message);
      setTab('login');
      setForm({ ...form, password: '', token: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '24px',
    }}>
      {/* Floating themes button inside auth */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px' }}>
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
          }}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--accent-warn)' }} /> : <Moon size={18} style={{ color: 'var(--accent-primary)' }} />}
        </button>
      </div>

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px',
        borderRadius: '24px',
        animation: 'fade-in-up 0.5s ease',
      }}>
        {/* Logo and branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
              <defs>
                <linearGradient id="logo-grad-auth" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="var(--accent-tertiary)" />
                </linearGradient>
              </defs>
              <rect x="5" y="5" width="90" height="90" rx="26" fill="transparent" stroke="url(#logo-grad-auth)" strokeWidth="8" />
              <path d="M 25 70 C 25 70, 35 45, 50 45 C 65 45, 75 70, 75 70" fill="none" stroke="url(#logo-grad-auth)" strokeWidth="8" strokeLinecap="round" />
              <circle cx="50" cy="30" r="10" fill="url(#logo-grad-auth)" />
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              Spend<span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sense</span>
            </span>
          </div>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            // SECURED ACCESS ENVIRONMENT
          </p>
        </div>

        {/* Tab toggler for login/signup */}
        {(tab === 'login' || tab === 'signup') && (
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '99px',
            padding: '3px',
            marginBottom: '28px',
            border: '1px solid var(--border)',
          }}>
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); resetMessages(); }}
                style={{
                  flex: 1,
                  background: tab === t ? 'var(--surface-hover)' : 'transparent',
                  border: 'none',
                  color: tab === t ? 'var(--text)' : 'var(--text-secondary)',
                  padding: '10px',
                  borderRadius: '99px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic back buttons for forgot/reset flow */}
        {(tab === 'forgot' || tab === 'reset') && (
          <button
            onClick={() => { setTab('login'); resetMessages(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </button>
        )}

        {/* Messages */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--accent-danger)',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}>
            <ShieldCheck size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--accent-success)',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
          }}>
            {message}
          </div>
        )}

        {/* MOCK Reset Token helper box */}
        {debugToken && (
          <div style={{
            background: 'var(--surface-solid)',
            border: '1px dashed var(--accent-primary)',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            marginBottom: '20px',
          }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '4px' }}>Demo Reset Token generated:</div>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{debugToken}</code>
            <button
              onClick={() => {
                setForm({ ...form, token: debugToken });
                setTab('reset');
                resetMessages();
              }}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px', marginTop: '8px', width: '100%' }}
            >
              Fill & Proceed to Reset
            </button>
          </div>
        )}

        {/* ── FORMS ── */}

        {/* Login & Signup forms */}
        {(tab === 'login' || tab === 'signup') && (
          <form onSubmit={handleAuth}>
            {tab === 'signup' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={set('name')}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="jane@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); resetMessages(); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-secondary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      paddingBottom: '8px',
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '16px',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            >
              {loading ? 'Processing Transaction...' : tab === 'login' ? 'Proceed Securely' : 'Establish Credentials'}
            </button>
          </form>
        )}

        {/* Forgot password request form */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Key style={{ color: 'var(--accent-primary)' }} size={18} />
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Request Access Key</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              Submit your email coordinates. The core generator will supply a system token.
            </p>

            <div className="form-group">
              <label>Email Coordinates</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="jane@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'Retrieving coordinates...' : 'Generate Reset Token'}
            </button>
            
            <button
              type="button"
              onClick={() => { setTab('reset'); resetMessages(); }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            >
              I have a reset token
            </button>
          </form>
        )}

        {/* Reset password form */}
        {tab === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Key style={{ color: 'var(--accent-primary)' }} size={18} />
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Reset Password Credentials</span>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="jane@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div className="form-group">
              <label>Reset Token</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="SS-RESET-..."
                value={form.token}
                onChange={set('token')}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Minimum 6 characters"
                value={form.newPassword}
                onChange={set('newPassword')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'Updating Credentials...' : 'Rewrite Password Credentials'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
