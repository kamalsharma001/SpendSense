import React from 'react';
import { BarChart3, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import Chart from 'chart.js/auto';

const CAT_ICONS = {
  'Food & Dining': '🍜', 'Transport': '🚕', 'Shopping': '🛒', 'Healthcare': '💊',
  'Entertainment': '🎮', 'Education': '📖', 'Bills & Utilities': '⚡', 'Personal Care': '🪞',
  'Travel': '✈️', 'Investments': '📊', 'Gifts & Donations': '🎁', 'Other': '📦'
};

const PALETTE_DARK = ['#00f2fe', '#4facfe', '#a855f7', '#fbbf24', '#f43f5e', '#10b981', '#6366f1', '#ec4899'];
const PALETTE_LIGHT = ['#0284c7', '#0ea5e9', '#7c3aed', '#d97706', '#e11d48', '#059669', '#4f46e5', '#db2777'];

export default function InsightsPage({ API, theme }) {
  const [month, setMonth] = React.useState('');
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const barRef = React.useRef(null);
  const barInst = React.useRef(null);
  const radarRef = React.useRef(null);
  const radarInst = React.useRef(null);
  const hbarRef = React.useRef(null);
  const hbarInst = React.useRef(null);

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtShort = n => n >= 100000 ? '₹' + (n / 100000).toFixed(1) + 'L' : n >= 1000 ? '₹' + (n / 1000).toFixed(1) + 'k' : '₹' + Number(n).toFixed(0);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (month) params.set('month', month);

      const res = await fetch(`${API}/api/expenses/insights?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInsights();
  }, [month, API]);

  React.useEffect(() => {
    if (!data) return;

    const isDark = theme === 'dark';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textMuted = isDark ? '#475569' : '#94a3b8';
    const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    const palette = isDark ? PALETTE_DARK : PALETTE_LIGHT;

    // 1. Monthly Spending (Vertical Bar)
    if (barRef.current) {
      if (barInst.current) barInst.current.destroy();
      barInst.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: data.monthly.map(m => m.month),
          datasets: [{
            label: 'Monthly Sum',
            data: data.monthly.map(m => m.amount),
            backgroundColor: data.monthly.map((_, i) => i === data.monthly.length - 1 ? (isDark ? '#00f2fe' : '#0ea5e9') : (isDark ? 'rgba(0, 242, 254, 0.25)' : 'rgba(14, 165, 233, 0.25)')),
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            y: {
              grid: { color: gridColor },
              ticks: { callback: v => fmtShort(v), color: textMuted, font: { family: "'JetBrains Mono'" } }
            },
            x: {
              grid: { display: false },
              ticks: { color: textMuted, font: { family: "'JetBrains Mono'" } }
            }
          }
        }
      });
    }

    // 2. Spending Radar (by category)
    if (radarRef.current && data.by_category.length > 0) {
      if (radarInst.current) radarInst.current.destroy();
      const top = data.by_category.slice(0, 6);
      radarInst.current = new Chart(radarRef.current, {
        type: 'radar',
        data: {
          labels: top.map(c => c.category),
          datasets: [{
            label: 'Telemetry Distribution',
            data: top.map(c => c.amount),
            backgroundColor: isDark ? 'rgba(0, 242, 254, 0.08)' : 'rgba(14, 165, 233, 0.08)',
            borderColor: isDark ? '#00f2fe' : '#0ea5e9',
            borderWidth: 2,
            pointBackgroundColor: isDark ? '#00f2fe' : '#0ea5e9',
            pointRadius: 4,
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            r: {
              angleLines: { color: gridColor },
              grid: { color: gridColor },
              pointLabels: { color: textPrimary, font: { family: "'Plus Jakarta Sans'", size: 10, weight: '500' } },
              ticks: { display: false }
            }
          }
        }
      });
    }

    // 3. Category Comparison (Horizontal Bar)
    if (hbarRef.current && data.by_category.length > 0) {
      if (hbarInst.current) hbarInst.current.destroy();
      const top = data.by_category.slice(0, 7);
      hbarInst.current = new Chart(hbarRef.current, {
        type: 'bar',
        data: {
          labels: top.map(c => c.category),
          datasets: [{
            data: top.map(c => c.amount),
            backgroundColor: palette.slice(0, top.length),
            borderRadius: 6,
            borderSkipped: false
          }]
        },
        options: {
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { callback: v => fmtShort(v), color: textMuted, font: { family: "'JetBrains Mono'" } }
            },
            y: {
              grid: { display: false },
              ticks: { color: textPrimary, font: { size: 11 } }
            }
          }
        }
      });
    }

    return () => {
      if (barInst.current) barInst.current.destroy();
      if (radarInst.current) radarInst.current.destroy();
      if (hbarInst.current) hbarInst.current.destroy();
    };
  }, [data, theme]);

  const avg = data?.monthly?.length > 0 ? data.monthly.reduce((a, m) => a + m.amount, 0) / data.monthly.length : 0;
  const topCat = data?.by_category?.[0];
  const maxMonth = data?.monthly?.length > 0 ? data.monthly.reduce((a, b) => a.amount > b.amount ? a : b, { amount: 0 }) : null;

  return (
    <div style={{ padding: '0 24px 40px', maxWidth: '1200px', margin: '0 auto', animation: 'fade-in-up 0.5s ease' }}>
      
      {/* Filtering Header bar */}
      <div className="glass-card" style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 style={{ color: 'var(--accent-primary)' }} size={20} />
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Analytics Telemetry Center</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Filter:</span>
          <input
            type="month"
            className="form-control"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ width: '160px', borderRadius: '99px', colorScheme: 'dark' }}
          />
          {month && (
            <button onClick={() => setMonth('')} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
              <RefreshCw size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Key Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {[
              { label: 'Aggregate Sum', val: fmtShort(data?.total || 0), color: 'var(--accent-primary)' },
              { label: 'Operations Logged', val: data?.count || 0, color: 'var(--accent-secondary)' },
              { label: 'Cycle Mean', val: fmtShort(avg), color: 'var(--accent-tertiary)' },
              { label: 'Peak Cycle', val: maxMonth?.month || '—', color: 'var(--accent-warn)', desc: maxMonth ? fmtShort(maxMonth.amount) : '' }
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>
                  {s.val}
                </div>
                {s.desc && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{s.desc}</div>}
              </div>
            ))}
          </div>

          {/* Core Insights Charts grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Cycle Allocations Overview</h3>
              <canvas ref={barRef} height="200" />
            </div>

            <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Radar Radar Vectors</h3>
              {data?.by_category?.length > 0 ? (
                <canvas ref={radarRef} height="200" />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No radar vector records.
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Category horizontal comparisons */}
            <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Domain Range comparison</h3>
              {data?.by_category?.length > 0 ? (
                <canvas ref={hbarRef} height="220" />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No domains segment logged.
                </div>
              )}
            </div>

            {/* Highlights Detail */}
            <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Highlights Log</h3>
                
                {topCat ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '32px' }}>{CAT_ICONS[topCat.category] || '📦'}</div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MAX DOMAIN PRESSURE</div>
                      <div style={{ fontSize: '16px', fontWeight: 800 }}>{topCat.category}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Represents {topCat.percent}% of cycle allocation.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>No domain highlights.</div>
                )}
              </div>

              {topCat && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>ALLOCATED WEIGHT</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {fmt(topCat.amount)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>CYCLE PERCENT</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>
                      {topCat.percent}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
