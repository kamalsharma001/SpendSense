import React from 'react';
import { Search, Plus, Edit2, Trash2, Calendar, FileText, X, BrainCircuit } from 'lucide-react';

const CAT_ICONS = {
  'Food & Dining': '🍜', 'Transport': '🚕', 'Shopping': '🛒', 'Healthcare': '💊',
  'Entertainment': '🎮', 'Education': '📖', 'Bills & Utilities': '⚡', 'Personal Care': '🪞',
  'Travel': '✈️', 'Investments': '📊', 'Gifts & Donations': '🎁', 'Other': '📦'
};
const CATS = Object.keys(CAT_ICONS);

export default function ExpensesPage({ API }) {
  const [expenses, setExpenses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterCat, setFilterCat] = React.useState('');
  const [filterMonth, setFilterMonth] = React.useState('');
  const [modal, setModal] = React.useState(null); // 'add' or expense object to edit

  const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filterMonth) params.set('month', filterMonth);
      if (filterCat) params.set('category', filterCat);

      const res = await fetch(`${API}/api/expenses/?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setExpenses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadExpenses();
  }, [filterMonth, filterCat]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this telemetry point?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setExpenses(es => es.filter(e => e.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = (saved) => {
    if (modal?.id) {
      // Edit mode
      setExpenses(es => es.map(e => e.id === saved.id ? saved : e));
    } else {
      // Add mode
      setExpenses(es => [saved, ...es]);
    }
    setModal(null);
  };

  const filtered = expenses.filter(e =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalAmount = filtered.reduce((a, e) => a + e.amount, 0);

  return (
    <div style={{ padding: '0 24px 40px', maxWidth: '1200px', margin: '0 auto', animation: 'fade-in-up 0.5s ease' }}>
      
      {/* Search & Filters Panel */}
      <div className="glass-card" style={{
        padding: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search telemetry stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px', borderRadius: '99px' }}
          />
        </div>

        <select
          className="form-control"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{ width: '180px', borderRadius: '99px', cursor: 'pointer' }}
        >
          <option value="">All Segment Categories</option>
          {CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>

        <input
          type="month"
          className="form-control"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{ width: '180px', borderRadius: '99px', colorScheme: 'dark' }}
        />

        <button onClick={() => setModal('add')} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Log</span>
        </button>
      </div>

      {/* Aggregate telemetry details */}
      {filtered.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '16px',
          padding: '12px 24px',
          background: 'var(--surface)',
          borderRadius: '99px',
          border: '1px solid var(--border)',
          alignItems: 'center',
          fontSize: '13px'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Segment points: <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong>
          </span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Sum total: <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{fmt(totalAmount)}</strong>
          </span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Mean value: <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{fmt(totalAmount / filtered.length)}</strong>
          </span>
        </div>
      )}

      {/* Table Data */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>No logs detected</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Try adjusting your segmentation filters or insert a new data point.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Title</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Segment</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Date Coordinates</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Valuation</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{exp.title}</div>
                    {exp.notes && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>{exp.notes}</div>}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      background: 'var(--surface-hover)',
                      border: '1px solid var(--border)',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      {CAT_ICONS[exp.category] || '📦'} {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {fmtDate(exp.date)}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    {fmt(exp.amount)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => setModal(exp)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border)'
                        }}
                        title="Edit Log"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-danger)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border)'
                        }}
                        title="Delete Log"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Modal (Add / Edit) */}
      {modal && (
        <ExpenseModal
          API={API}
          expense={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ── EXPENSE EDIT / ADD FLOATING MODAL COMPONENT ──
function ExpenseModal({ API, expense, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = React.useState(expense
    ? { title: expense.title, amount: expense.amount, category: expense.category, date: expense.date, notes: expense.notes || '' }
    : { title: '', amount: '', category: '', date: today, notes: '' }
  );
  
  const [aiCat, setAiCat] = React.useState('');
  const [checkingAi, setCheckingAi] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const searchDebounce = React.useRef(null);

  const setField = k => e => {
    const val = e.target.value;
    setForm(f => ({ ...f, [k]: val }));
    
    // Auto category prediction trigger
    if (k === 'title') {
      clearTimeout(searchDebounce.current);
      setCheckingAi(false);
      
      if (val.trim().length > 3) {
        setCheckingAi(true);
        searchDebounce.current = setTimeout(async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/api/expenses/categorize`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ title: val })
            });
            const data = await res.json();
            if (res.ok && data.category) {
              setAiCat(data.category);
              setForm(f => ({ ...f, category: data.category }));
            }
          } catch (e) {
            console.error('Categorize error', e);
          } finally {
            setCheckingAi(false);
          }
        }, 600);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    
    const amt = parseFloat(form.amount);
    if (!form.title.trim()) return setError('Description title is required');
    if (isNaN(amt) || amt <= 0) return setError('Please enter a valid positive valuation');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const method = expense ? 'PUT' : 'POST';
      const url = expense ? `${API}/api/expenses/${expense.id}` : `${API}/api/expenses/`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title.strip ? form.title.strip() : form.title,
          amount: amt,
          category: form.category || 'Other',
          date: form.date,
          notes: form.notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save log');
      onSave(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 6, 13, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fade-in 0.2s ease',
    }} onClick={(e) => e.target.style.position === 'fixed' && onClose()}>
      
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '32px',
        borderRadius: '24px',
        background: 'var(--surface-solid)',
        border: '1px solid var(--border-hover)',
        animation: 'fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
            {expense ? 'Edit Log Coordinate' : 'Record Telemetry Point'}
          </h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--accent-danger)',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Telemetry Title</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Server hosting fee or Dinner"
              value={form.title}
              onChange={setField('title')}
            />
            {checkingAi && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-primary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                <BrainCircuit size={12} className="spinner" />
                <span>Running Naive Bayes Classifier...</span>
              </div>
            )}
            {!checkingAi && aiCat && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-success)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                <span>✦ Engine Suggestion: </span>
                <strong style={{ textDecoration: 'underline' }}>{aiCat}</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Valuation (₹)</label>
              <input
                type="number"
                step="any"
                required
                className="form-control"
                placeholder="0.00"
                value={form.amount}
                onChange={setField('amount')}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
            
            <div className="form-group">
              <label>Coordinates Date</label>
              <input
                type="date"
                required
                className="form-control"
                value={form.date}
                onChange={setField('date')}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Segment Domain</label>
            <select
              className="form-control"
              value={form.category}
              onChange={setField('category')}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Choose or Auto-detect</option>
              {CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Telemetry notes</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. AWS elastic load balancing system"
              value={form.notes}
              onChange={setField('notes')}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Committing...' : expense ? 'Save Segment' : 'Commit Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
