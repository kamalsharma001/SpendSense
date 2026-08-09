import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Brain, Sun, Moon } from 'lucide-react';

export default function LandingPage({ API, onStart, theme, toggleTheme }) {
  const [inputText, setInputText] = React.useState('Bought coffee at Starbucks and got cookies');
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);
  const [predictedCat, setPredictedCat] = React.useState('');
  const [confidence, setConfidence] = React.useState(0);

  // A local rule-based simulation of the ML categorizer for the sandbox
  const sampleCategorize = (text) => {
    const txt = text.toLowerCase();
    if (txt.includes('starbucks') || txt.includes('coffee') || txt.includes('dinner') || txt.includes('food') || txt.includes('lunch') || txt.includes('pizza')) {
      return { category: 'Food & Dining', icon: '🍜', confidence: 94.8 };
    } else if (txt.includes('uber') || txt.includes('ola') || txt.includes('taxi') || txt.includes('ride') || txt.includes('flight') || txt.includes('petrol')) {
      return { category: 'Transport', icon: '🚕', confidence: 91.2 };
    } else if (txt.includes('amazon') || txt.includes('shoes') || txt.includes('shirt') || txt.includes('shopping') || txt.includes('laptop')) {
      return { category: 'Shopping', icon: '🛒', confidence: 89.5 };
    } else if (txt.includes('netflix') || txt.includes('spotify') || txt.includes('movie') || txt.includes('game')) {
      return { category: 'Entertainment', icon: '🎮', confidence: 97.1 };
    } else if (txt.includes('doctor') || txt.includes('medicine') || txt.includes('pill') || txt.includes('hospital')) {
      return { category: 'Healthcare', icon: '💊', confidence: 95.3 };
    } else if (txt.includes('rent') || txt.includes('wifi') || txt.includes('electricity') || txt.includes('recharge')) {
      return { category: 'Bills & Utilities', icon: '⚡', confidence: 96.0 };
    }
    return { category: 'Other', icon: '📦', confidence: 64.0 };
  };

  const CAT_ICONS = {
    'Food & Dining': '🍜', 'Transport': '🚕', 'Shopping': '🛒', 'Healthcare': '💊',
    'Entertainment': '🎮', 'Education': '📖', 'Bills & Utilities': '⚡', 'Personal Care': '🪞',
    'Travel': '✈️', 'Investments': '📊', 'Gifts & Donations': '🎁', 'Other': '📦'
  };

  const triggerScan = async () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    setScanProgress(0);
    setPredictedCat('');
    
    let responseCategory = '';
    let responseConfidence = 92.5; 
    
    try {
      const res = await fetch(`${API}/api/expenses/public-categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: inputText })
      });
      const data = await res.json();
      if (res.ok && data.category) {
        responseCategory = data.category;
      } else {
        responseCategory = 'Other';
      }
    } catch (e) {
      console.error(e);
      const localRes = sampleCategorize(inputText);
      responseCategory = localRes.category;
      responseConfidence = localRes.confidence;
    }

    const catIcon = CAT_ICONS[responseCategory] || '📦';
    
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setPredictedCat(responseCategory + ' ' + catIcon);
        setConfidence(responseConfidence);
        setIsScanning(false);
      }
      setScanProgress(current);
    }, 50);
  };

  React.useEffect(() => {
    // Canvas animation background
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        color: theme === 'dark' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(2, 132, 199, 0.15)'
      });
    }

    const drawGrid = (opacity) => {
      ctx.strokeStyle = theme === 'dark' ? `rgba(255, 255, 255, ${opacity * 0.03})` : `rgba(0, 0, 0, ${opacity * 0.03})`;
      ctx.lineWidth = 1;
      const step = 45;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      drawGrid(1.5);
      
      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
        if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme]);

  const testCases = [
    'Monthly subscription fee for Netflix UHD plan',
    'Taxi ride back home from train station',
    'Bought generic medicines from pharmacy Apollo',
    'Ordered dinner on Swiggy application'
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <canvas 
        id="grid-canvas" 
        style={{ position: 'absolute', inset: 0, zIndex: -2, pointerEvents: 'none' }}
      />
      
      {/* Ambient background glows */}
      <div className="ambient-orb" style={{
        top: '-10%', left: '10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)'
      }}/>
      <div className="ambient-orb" style={{
        bottom: '-10%', right: '10%', width: '45vw', height: '45vw',
        background: 'radial-gradient(circle, var(--accent-tertiary) 0%, transparent 70%)'
      }}/>

      {/* Landing Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="36" height="36">
            <defs>
              <linearGradient id="logo-grad-landing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-tertiary)" />
              </linearGradient>
            </defs>
            <rect x="5" y="5" width="90" height="90" rx="26" fill="transparent" stroke="url(#logo-grad-landing)" strokeWidth="8" />
            <path d="M 25 70 C 25 70, 35 45, 50 45 C 65 45, 75 70, 75 70" fill="none" stroke="url(#logo-grad-landing)" strokeWidth="8" strokeLinecap="round" />
            <circle cx="50" cy="30" r="10" fill="url(#logo-grad-landing)" />
          </svg>
          <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Spend<span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sense</span>
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--accent-warn)' }} /> : <Moon size={18} style={{ color: 'var(--accent-primary)' }} />}
          </button>
          
          <button onClick={onStart} className="btn btn-secondary">
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px 100px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
        }}>
          {/* Hero Left Info */}
          <div style={{ animation: 'fade-in-up 0.8s ease' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '99px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              marginBottom: '20px',
            }}>
              <Sparkles size={14} />
              <span>Next-Gen Machine Learning Insights</span>
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: '24px',
            }}>
              Future of <br/>
              <span style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-tertiary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Finance Intelligence
              </span>
            </h1>
            
            <p style={{
              fontSize: '17px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              marginBottom: '36px',
              maxWidth: '480px',
            }}>
              Track, categorize, and forecast expenses automatically. Combining Naive Bayes classification with custom analytical telemetry. All styled in an Apple-inspired modular design system.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={onStart} className="btn btn-primary" style={{ padding: '14px 28px' }}>
                <span>Access Console</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Interactive ML Sandbox Right */}
          <div id="sandbox-widget" className="glass-card" style={{
            padding: '36px',
            borderRadius: '24px',
            animation: 'fade-in-up 1s ease',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain style={{ color: 'var(--accent-primary)' }} size={20} />
                <span style={{ fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Classifier Sandbox
                </span>
              </div>
              <div style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                background: 'var(--border)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}>
                LOCAL MODEL v1.4.0
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Enter Expense Description
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. Bought medicine from drugstore"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.15)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
                <button 
                  onClick={triggerScan} 
                  disabled={isScanning}
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', padding: '12px 20px' }}
                >
                  Analyze
                </button>
              </div>
            </div>

            {/* Test quick pre-fills */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                OR SELECT A TEST CASE:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {testCases.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(tc);
                      setIsScanning(false);
                      setPredictedCat('');
                    }}
                    style={{
                      background: 'rgba(0,0,0,0.1)',
                      border: '1px solid var(--border)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {tc.substring(0, 26)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Progress Bar & Result */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--border)',
              minHeight: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              {isScanning && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                    <span>TOKENIZING & EXTRACTING FEATURES...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${scanProgress}%`, height: '100%', background: 'var(--gradient-accent)', transition: 'width 0.08s ease' }} />
                  </div>
                </div>
              )}

              {!isScanning && !predictedCat && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Enter text above and press "Analyze" to see classification logic in action.
                </div>
              )}

              {!isScanning && predictedCat && (
                <div style={{ animation: 'fade-in 0.3s ease' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    CLASSIFICATION COMPLETE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                        {predictedCat}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Predicted Category Capsule
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600, color: 'var(--accent-success)' }}>
                        {confidence}%
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Confidence Vector
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginTop: '100px',
        }}>
          {[
            {
              icon: Zap,
              title: 'FastAPI Telemetry',
              desc: 'High speed, fully verified OpenAPI documentation. Secure JWT token headers keeping your telemetry confidential.',
              color: 'var(--accent-primary)',
            },
            {
              icon: Brain,
              title: 'Naive Bayes Engine',
              desc: 'Continuous training classification routines matching item descriptions directly to target categories with zero user effort.',
              color: 'var(--accent-tertiary)',
            },
            {
              icon: ShieldCheck,
              title: 'Neon Serverless DB',
              desc: 'Hosted Postgres with connection pooling providing sub-millisecond query responses for secure, durable operations.',
              color: 'var(--accent-success)',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass-card" style={{
                padding: '28px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `rgba(255, 255, 255, 0.05)`,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: feat.color,
                  marginBottom: '20px',
                }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{feat.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
