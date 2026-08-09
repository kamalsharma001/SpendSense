import React from 'react';
import { DollarSign, Wallet, ClipboardList, TrendingUp, HelpCircle } from 'lucide-react';
import Chart from 'chart.js/auto';

const CAT_ICONS = {
  'Food & Dining': '🍜', 'Transport': '🚕', 'Shopping': '🛒', 'Healthcare': '💊',
  'Entertainment': '🎮', 'Education': '📖', 'Bills & Utilities': '⚡', 'Personal Care': '🪞',
  'Travel': '✈️', 'Investments': '📊', 'Gifts & Donations': '🎁', 'Other': '📦'
};

const PALETTE_DARK = ['#00f2fe', '#4facfe', '#a855f7', '#fbbf24', '#f43f5e', '#10b981', '#6366f1', '#ec4899'];
const PALETTE_LIGHT = ['#0284c7', '#0ea5e9', '#7c3aed', '#d97706', '#e11d48', '#059669', '#4f46e5', '#db2777'];

export default function Dashboard({ API, theme, setPage }) {
  const [ins, setIns] = React.useState(null);
  const [recent, setRecent] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  const donutRef = React.useRef(null);
  const donutInst = React.useRef(null);
  const lineRef = React.useRef(null);
  const lineInst = React.useRef(null);

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtShort = n => n >= 100000 ? '₹' + (n / 100000).toFixed(1) + 'L' : n >= 1000 ? '₹' + (n / 1000).toFixed(1) + 'k' : '₹' + Number(n).toFixed(0);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      const [resIns, resExp] = await Promise.all([
        fetch(`${API}/api/expenses/insights`, { headers }),
        fetch(`${API}/api/expenses/`, { headers })
      ]);

      const insData = await resIns.json();
      const expData = await resExp.json();

      setIns(insData);
      setRecent(expData.slice(0, 5));
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, [API]);

  // Chart configuration updates on theme/data change
  React.useEffect(() => {
    if (!ins) return;

    const isDark = theme === 'dark';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textMuted = isDark ? '#475569' : '#94a3b8';
    const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    const palette = isDark ? PALETTE_DARK : PALETTE_LIGHT;

    // Line Chart (Monthly trend)
    if (lineRef.current) {
      if (lineInst.current) lineInst.current.destroy();
      lineInst.current = new Chart(lineRef.current, {
        type: 'line',
        data: {
          labels: ins.monthly.map(m => m.month),
          datasets: [{
            label: 'Spending',
            data: ins.monthly.map(m => m.amount),
            borderColor: isDark ? '#00f2fe' : '#0ea5e9',
            backgroundColor: isDark ? 'rgba(0, 242, 254, 0.04)' : 'rgba(14, 165, 233, 0.05)',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: isDark ? '#00f2fe' : '#0ea5e9',
            pointRadius: 4,
            pointHoverRadius: 6,
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
          },
          animation: { duration: 1000, easing: 'easeOutQuart' }
        }
      });
    }

    // Donut Chart (Category split)
    if (donutRef.current) {
      if (donutInst.current) donutInst.current.destroy();
      const top = ins.by_category.slice(0, 6);
      donutInst.current = new Chart(donutRef.current, {
        type: 'doughnut',
        data: {
          labels: top.map(c => c.category),
          datasets: [{
            data: top.map(c => c.amount),
            backgroundColor: palette,
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#0b1422' : '#ffffff',
            hoverOffset: 12
          }]
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: textPrimary,
                font: { family: "'Plus Jakarta Sans'", size: 11, weight: '500' },
                padding: 12,
                boxWidth: 10,
                boxHeight: 10,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            }
          },
          animation: { animateScale: true, animateRotate: true, duration: 1000 }
        }
      });
    }

    return () => {
      if (lineInst.current) lineInst.current.destroy();
      if (donutInst.current) donutInst.current.destroy();
    };
  }, [ins, theme]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const monthly = ins?.monthly?.map(m => m.amount) || [];
  const lastM = monthly.slice(-1)[0] || 0;
  const prevM = monthly.slice(-2, -1)[0] || 0;
  const changePercent = prevM > 0 ? ((lastM - prevM) / prevM * 100).toFixed(1) : 0;
  const avgM = monthly.length > 0 ? monthly.reduce((a, b) => a + b, 0) / monthly.length : 0;

  // Custom Gauge values
  const budgetLimit = avgM * 1.3 || 12000;
  const gaugePercent = Math.min(lastM / (budgetLimit || 1), 1);
  const strokeDash = 283;
  const strokeOffset = strokeDash - (gaugePercent * strokeDash);

  return (
    <div style={{ padding: '0 24px 40px', maxWidth: '1200px', margin: '0 auto', animation: 'fade-in-up 0.5s ease' }}>
      
      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          {
            label: 'Telemetry Accumulation',
            val: fmt(ins?.total || 0),
            color: 'var(--accent-primary)',
            desc: 'Aggregate expenditure recorded',
            glow: 'rgba(0, 242, 254, 0.15)'
          },
          {
            label: 'Cycle Spending',
            val: fmt(lastM),
            color: 'var(--accent-secondary)',
            desc: changePercent !== 0 ? `${changePercent > 0 ? '▲' : '▼'} ${Math.abs(changePercent)}% from previous cycle` : 'Initial recorded cycle',
            glow: 'rgba(79, 172, 254, 0.15)'
          },
          {
            label: 'Data Points',
            val: ins?.count || 0,
            color: 'var(--accent-tertiary)',
            desc: 'Total logged entries',
            glow: 'rgba(168, 85, 247, 0.15)'
          },
          {
            label: 'Historical Average',
            val: fmtShort(avgM),
            color: 'var(--accent-warn)',
            desc: `Computed over ${monthly.length || 1} logging cycles`,
            glow: 'rgba(251, 191, 36, 0.15)'
          }
        ].map((item, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              position: 'absolute',
              top: '-15%',
              right: '-15%',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: item.glow,
              filter: 'blur(16px)',
              pointerEvents: 'none',
            }} />
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: item.color, fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
              {item.val}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Monthly spending trend line chart */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Telemetry Stream</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Transaction volumes by logging cycle</span>
            </div>
          </div>
          <div style={{ height: '220px', position: 'relative' }}>
            {ins?.monthly?.length > 0 ? (
              <canvas ref={lineRef} height="220" />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No telemetry recorded.
              </div>
            )}
          </div>
        </div>

        {/* Category Split Chart */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Domain Segmentation</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allocation across category systems</span>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
            {ins?.by_category?.length > 0 ? (
              <canvas ref={donutRef} />
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No categorical data.</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Details Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '20px'
      }}>
        {/* Category Rankings */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>Category Allocations</h3>
          {ins?.by_category?.slice(0, 5).map((cat, idx) => (
            <div key={cat.category} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>
                  {CAT_ICONS[cat.category] || '📦'} {cat.category}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {fmt(cat.amount)} ({cat.percent}%)
                </span>
              </div>
              <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  width: `${cat.percent}%`,
                  height: '100%',
                  background: 'var(--gradient-accent)',
                  borderRadius: '99px'
                }} />
              </div>
            </div>
          ))}
          {ins?.by_category?.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', paddingTop: '20px' }}>
              No recorded logs.
            </div>
          )}
        </div>

        {/* Budget Circular Gauge */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '10px' }}>Budget Gauge</h3>
          
          <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={gaugePercent > 0.85 ? 'var(--accent-danger)' : 'var(--accent-primary)'}
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1s ease-in-out',
                  filter: `drop-shadow(0 0 6px ${gaugePercent > 0.85 ? 'var(--accent-danger)' : 'var(--accent-primary)'}50)`
                }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {Math.round(gaugePercent * 100)}%
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Limit reach
              </div>
            </div>
          </div>
          
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
            Spending: {fmtShort(lastM)} / limit {fmtShort(budgetLimit)}
          </div>
        </div>

        {/* Recent logs */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Telemetry Stack</h3>
            <button onClick={() => setPage('expenses')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
              SEE ALL
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recent.map((exp) => (
              <div key={exp.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ fontSize: '18px' }}>{CAT_ICONS[exp.category] || '📦'}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exp.title}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {exp.date}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                  {fmtShort(exp.amount)}
                </div>
              </div>
            ))}
            
            {recent.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                No telemetry recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
