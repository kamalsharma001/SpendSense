import React from 'react';
import { ShieldAlert, Home, Loader } from 'lucide-react';

export default function NotFoundPage({ goHome }) {
  const [countdown, setCountdown] = React.useState(5);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          goHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [goHome]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      animation: 'fade-in-up 0.5s ease',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-danger)',
        marginBottom: '28px',
        animation: 'float 4s ease infinite',
      }}>
        <ShieldAlert size={40} />
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '48px',
        fontWeight: 800,
        letterSpacing: '-1px',
        marginBottom: '12px',
        background: 'var(--gradient-accent)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        404 — Void Coordinate
      </h1>

      <p style={{
        fontSize: '15px',
        color: 'var(--text-secondary)',
        marginBottom: '16px',
        maxWidth: '400px',
        lineHeight: 1.5,
        fontFamily: 'var(--font-mono)',
      }}>
        // The requested segment coordinate does not exist.
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginBottom: '32px',
        fontFamily: 'var(--font-mono)',
      }}>
        <Loader size={12} className="spinner" />
        <span>Redirecting to landing page in {countdown} seconds...</span>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={goHome} className="btn btn-primary" style={{ padding: '12px 24px' }}>
          <Home size={16} />
          <span>Go Home Instantly</span>
        </button>
      </div>
    </div>
  );
}
