import { useState, useEffect } from 'react';
import Logo from './Logo';

const BACKEND_URL   = 'https://delivery-robot-fdh2.onrender.com';
const LOCATION_CODE = 'ROBORUN47';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order received' },
  { key: 'preparing',  label: 'Item being prepared' },
  { key: 'loading',    label: 'Robot being loaded' },
  { key: 'in_transit', label: 'Robot in transit' },
  { key: 'arriving',   label: 'Arriving soon' },
  { key: 'delivered',  label: 'Delivered!' },
];

const STATUS_BADGE = {
  pending:    { label: 'Pending',     color: '#854d0e', bg: '#fef9c3' },
  preparing:  { label: 'Preparing',   color: '#9a3412', bg: '#ffedd5' },
  loading:    { label: 'Loading',     color: '#1e40af', bg: '#dbeafe' },
  in_transit: { label: 'In transit',  color: '#5b21b6', bg: '#ede9fe' },
  arriving:   { label: 'Arriving',    color: '#0f766e', bg: '#ccfbf1' },
  delivered:  { label: 'Delivered',   color: '#166534', bg: '#dcfce7' },
};

const EDITABLE_STATUSES = ['pending', 'preparing'];

// ── SVG icons ─────────────────────────────────────────────────────────────────
function SofaIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="5"  y="9"  width="20" height="5"  rx="2.5" fill="#4338ca"/>
      <rect x="4"  y="14" width="22" height="7"  rx="2"   fill="#6366f1"/>
      <rect x="2"  y="12" width="4"  height="8"  rx="2"   fill="#4338ca"/>
      <rect x="24" y="12" width="4"  height="8"  rx="2"   fill="#4338ca"/>
      <rect x="7"  y="21" width="3"  height="3"  rx="1"   fill="#4338ca"/>
      <rect x="20" y="21" width="3"  height="3"  rx="1"   fill="#4338ca"/>
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="4"  y="12" width="22" height="4"  rx="2"   fill="#6366f1"/>
      <rect x="8"  y="16" width="3"  height="8"  rx="1.5" fill="#4338ca"/>
      <rect x="19" y="16" width="3"  height="8"  rx="1.5" fill="#4338ca"/>
      <rect x="1"  y="13" width="3"  height="5"  rx="1.5" fill="#4338ca"/>
      <rect x="26" y="13" width="3"  height="5"  rx="1.5" fill="#4338ca"/>
      <circle cx="15" cy="14" r="2.5" fill="#c7d2fe"/>
    </svg>
  );
}

function FireplaceIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="2"  y="9"  width="26" height="3"  rx="1.5" fill="#4338ca"/>
      <rect x="5"  y="12" width="20" height="13" rx="2"   fill="#6366f1"/>
      <rect x="9"  y="15" width="12" height="8"  rx="2"   fill="#eef0f8"/>
      <path d="M15 22 C13 20 12 17.5 14 15.5 C14 17.5 16 17.5 16 15.5 C18 17.5 17 20 15 22Z" fill="#f59e0b"/>
    </svg>
  );
}

function BedIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="3"   y="17" width="24"  height="7"  rx="2"    fill="#cbd5e1"/>
      <rect x="3"   y="10" width="10"  height="9"  rx="2"    fill="#e2e8f0"/>
      <rect x="17"  y="10" width="10"  height="9"  rx="2"    fill="#e2e8f0"/>
      <rect x="3"   y="8"  width="1.5" height="16" rx="0.75" fill="#94a3b8"/>
      <rect x="25.5" y="8" width="1.5" height="16" rx="0.75" fill="#94a3b8"/>
    </svg>
  );
}

function CheckStepIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#6366f1"/>
      <path d="M5.5 10 L8.5 13 L14.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ActiveStepIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#6366f1"/>
      <circle cx="10" cy="10" r="4"  fill="white"/>
    </svg>
  );
}

function UpcomingStepIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#cbd5e1" strokeWidth="2" fill="white"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }}>
      <path d="M3 8 L13 8 M9 4 L13 8 L9 12"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
      style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }}>
      <rect x="2" y="4" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M5 8 L13 8 M5 11 L10 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 2 L6 5 M12 2 L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
      style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }}>
      <path d="M2 8 L9 2 L16 8 L16 16 L11 16 L11 11 L7 11 L7 16 L2 16 Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 4 L14 14 M14 4 L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ── Rooms ─────────────────────────────────────────────────────────────────────
const ROOMS = [
  { name: 'Living Room',        icon: <SofaIcon />,      available: true  },
  { name: 'Dining Room',        icon: <TableIcon />,     available: true  },
  { name: 'Formal Living Room', icon: <FireplaceIcon />, available: true  },
  { name: "Alex's Bedroom",     icon: <BedIcon />,       available: false },
  { name: 'Guest Bedroom',      icon: <BedIcon />,       available: false },
  { name: 'Master Bedroom',     icon: <BedIcon />,       available: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

function getStepState(stepKey, currentStatus) {
  const stepIndex    = STATUS_STEPS.findIndex(s => s.key === stepKey);
  const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
  if (stepIndex < currentIndex)  return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'upcoming';
}

// ── Code gate ─────────────────────────────────────────────────────────────────
function CodeGate({ onUnlock }) {
  const [code, setCode]   = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (code.trim().toUpperCase() === LOCATION_CODE) {
      localStorage.setItem('orderit-code', LOCATION_CODE);
      onUnlock();
    } else {
      setError(true);
      setCode('');
    }
  }

  return (
    <div className="app">
      <div className="header">
        <Logo size={52} />
        <h1>OrderIt!</h1>
        <p>Enter your house code to continue.</p>
      </div>
      <form onSubmit={handleSubmit} className="code-gate-form">
        <input
          className={`code-input ${error ? 'code-input-error' : ''}`}
          type="text"
          placeholder="House code"
          value={code}
          autoCapitalize="characters"
          onChange={e => { setCode(e.target.value); setError(false); }}
        />
        {error && <p className="code-error">Incorrect code. Ask Alex!</p>}
        <button type="submit" className="submit-btn" disabled={!code.trim()}>
          Continue <ArrowIcon />
        </button>
      </form>
    </div>
  );
}

// ── Step tracker ──────────────────────────────────────────────────────────────
function StepTracker({ status, statusHistory }) {
  return (
    <div className="step-tracker">
      {STATUS_STEPS.map((step, i) => {
        const state     = getStepState(step.key, status);
        const timestamp = formatTime(statusHistory?.[step.key]);
        const isLast    = i === STATUS_STEPS.length - 1;
        return (
          <div key={step.key} className="step-row">
            <div className="step-left">
              <div className="step-icon">
                {state === 'completed' && <CheckStepIcon />}
                {state === 'active'    && <ActiveStepIcon />}
                {state === 'upcoming'  && <UpcomingStepIcon />}
              </div>
              {!isLast && <div className={`step-line ${state === 'upcoming' ? 'step-line-dim' : ''}`} />}
            </div>
            <div className={`step-content ${state}`}>
              <span className="step-label">{step.label}</span>
              {timestamp && <span className="step-time">{timestamp}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Order history page ────────────────────────────────────────────────────────
function HistoryPage({ onBack, activeOrderId, isEditable, onEdit }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/orders`)
      .then(r => r.json())
      .then(data => { setOrders([...data].reverse()); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <div className="topbar">
        <div className="header" style={{ marginBottom: 0 }}>
          <Logo size={36} />
          <h1 style={{ fontSize: 20 }}>Orders</h1>
        </div>
        <button className="history-btn" onClick={onBack}>
          <HomeIcon /> Home
        </button>
      </div>

      <div className="history-page">
        {loading && <p className="panel-empty">Loading…</p>}
        {!loading && orders.length === 0 && (
          <p className="panel-empty">No orders yet — place your first one!</p>
        )}
        {orders.map(order => {
          const badge    = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
          const isActive = order.id === activeOrderId;
          return (
            <div key={order.id} className={`history-row ${isActive ? 'history-row-active' : ''}`}>
              <div className="history-row-top">
                <span className="history-item">{order.item}</span>
                <span className="history-badge" style={{ color: badge.color, background: badge.bg }}>
                  {badge.label}
                </span>
              </div>
              <div className="history-row-bottom">
                <span className="history-room">{order.room}</span>
                <span className="history-time">{formatDate(order.createdAt)}</span>
              </div>
              {isActive && (
                <div className="history-active-row">
                  <span className="history-active-label">Current order</span>
                  {isEditable && (
                    <button className="history-edit-btn" onClick={onEdit}>Edit</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem('orderit-code') === LOCATION_CODE
  );
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [item, setItem]                 = useState('');
  const [note, setNote]                 = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [activeOrder, setActiveOrder]   = useState(() => {
    try {
      const saved = localStorage.getItem('orderit-active-order');
      if (!saved) return null;
      const order = JSON.parse(saved);
      // If the saved order is missing key fields, discard it
      if (!order.id || !order.item || !order.room) return null;
      return order;
    } catch { return null; }
  });
  const [error, setError]         = useState('');
  const [showHistory, setShowHistory]   = useState(false);
  const [forceOrdering, setForceOrdering] = useState(false);

  // Edit mode state
  const [editing, setEditing]     = useState(false);
  const [editRoom, setEditRoom]   = useState('');
  const [editItem, setEditItem]   = useState('');
  const [editNote, setEditNote]   = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Persist active order across refreshes
  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('orderit-active-order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('orderit-active-order');
    }
  }, [activeOrder]);

  // Poll for status updates every 3 seconds
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/orders/${activeOrder.id}`);
        // 404 means the server restarted and lost the order — clear it
        if (res.status === 404) { setActiveOrder(null); return; }
        setActiveOrder(await res.json());
      } catch { /* ignore network failures, try again next tick */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeOrder]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedRoom || !item.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ room: selectedRoom, item: item.trim(), note: note.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Something went wrong.');
      setActiveOrder(await res.json());
      setForceOrdering(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing() {
    setEditRoom(activeOrder.room);
    setEditItem(activeOrder.item);
    setEditNote(activeOrder.note || '');
    setEditError('');
    setEditing(true);
  }

  async function saveEdit() {
    if (!editRoom || !editItem.trim()) return;
    setEditSaving(true);
    setEditError('');
    try {
      const res = await fetch(`${BACKEND_URL}/orders/${activeOrder.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ room: editRoom, item: editItem.trim(), note: editNote.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Could not save changes.');
      setActiveOrder(await res.json());
      setEditing(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  function reset() {
    setSelectedRoom(null);
    setItem('');
    setNote('');
    setActiveOrder(null);
    setError('');
    setEditing(false);
  }

  if (!unlocked) return <CodeGate onUnlock={() => setUnlocked(true)} />;

  const canEdit = activeOrder && EDITABLE_STATUSES.includes(activeOrder.status);

  if (showHistory) {
    return (
      <HistoryPage
        onBack={() => { setShowHistory(false); setForceOrdering(true); }}
        activeOrderId={activeOrder?.id}
        isEditable={canEdit}
        onEdit={() => { setShowHistory(false); setForceOrdering(false); startEditing(); }}
      />
    );
  }

  // ── Tracking screen ────────────────────────────────────────────────────────
  if (activeOrder && !forceOrdering) {
    return (
      <div className="app">

        <div className="topbar">
          <div className="header" style={{ marginBottom: 0 }}>
            <Logo size={36} />
            <h1 style={{ fontSize: 20 }}>OrderIt!</h1>
          </div>
          <button className="history-btn" onClick={() => setShowHistory(v => !v)}>
            {showHistory ? <><HomeIcon /> Home</> : <><HistoryIcon /> Orders</>}
          </button>
        </div>

        <div className="tracking-card">
          {editing ? (
            // ── Edit form ────────────────────────────────────────────────────
            <div className="edit-form">
              <h3 className="edit-title">Edit order</h3>
              <div className="edit-room-grid">
                {ROOMS.filter(r => r.available).map(room => (
                  <button
                    key={room.name}
                    type="button"
                    className={`room-card room-card-sm ${editRoom === room.name ? 'selected' : ''}`}
                    onClick={() => setEditRoom(room.name)}
                  >
                    <span className="room-icon">{room.icon}</span>
                    <span className="room-name">{room.name}</span>
                  </button>
                ))}
              </div>
              <div className="form-group" style={{ marginTop: 14 }}>
                <label>Item *</label>
                <input
                  type="text"
                  value={editItem}
                  onChange={e => setEditItem(e.target.value)}
                  placeholder="e.g. Banana, Coffee, Batteries…"
                />
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <textarea rows={2} value={editNote} onChange={e => setEditNote(e.target.value)} />
              </div>
              {editError && <p className="code-error" style={{ marginBottom: 8 }}>{editError}</p>}
              <div className="edit-actions">
                <button className="edit-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                <button
                  className="submit-btn"
                  style={{ flex: 1 }}
                  disabled={!editRoom || !editItem.trim() || editSaving}
                  onClick={saveEdit}
                >
                  {editSaving ? <><span className="spinner" />Saving…</> : 'Save changes'}
                </button>
              </div>
            </div>
          ) : (
            // ── Normal tracking view ──────────────────────────────────────────
            <>
              <div className="tracking-summary">
                <div>
                  <span className="tracking-item">{activeOrder.item}</span>
                  <span className="tracking-arrow"> → </span>
                  <span className="tracking-room">{activeOrder.room}</span>
                  {activeOrder.note && (
                    <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{activeOrder.note}</p>
                  )}
                  {activeOrder.editedAt && (
                    <p style={{ fontSize: 12, color: '#a78bfa', marginTop: 4, fontWeight: 600 }}>
                      Edited · {formatTime(activeOrder.editedAt)}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <button className="edit-btn" onClick={startEditing}>Edit</button>
                )}
              </div>
              <StepTracker status={activeOrder.status} statusHistory={activeOrder.statusHistory} />
              {activeOrder.status === 'delivered' && (
                <button className="order-again-btn" onClick={reset}>Place another order</button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Ordering screen ────────────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="topbar">
        <div className="header" style={{ marginBottom: 0 }}>
          <Logo size={40} />
          <h1>OrderIt!</h1>
          <p>Pick a room, tell us what you need.</p>
        </div>
        <button className="history-btn" onClick={() => setShowHistory(true)}>
          <HistoryIcon /> Orders
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <p className="section-label">1. Where should we deliver?</p>
        <div className="room-grid">
          {ROOMS.map((room) => (
            <button
              key={room.name}
              type="button"
              disabled={!room.available}
              className={[
                'room-card',
                !room.available            ? 'coming-soon' : '',
                selectedRoom === room.name ? 'selected'    : '',
              ].join(' ')}
              onClick={() => room.available && setSelectedRoom(room.name)}
            >
              <span className="room-icon">{room.icon}</span>
              <span className="room-name">{room.name}</span>
              {!room.available && <span className="coming-soon-badge">Coming soon</span>}
            </button>
          ))}
        </div>

        <p className="section-label">2. What would you like?</p>
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="item">Item *</label>
            <input
              id="item"
              type="text"
              placeholder="e.g. Banana, Coffee, Batteries…"
              value={item}
              onChange={e => setItem(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="note">Note (optional)</label>
            <textarea
              id="note"
              rows={2}
              placeholder="e.g. Cold please, or leave at the door"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="status-card error" style={{ marginBottom: 16 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 8px', display: 'block' }}>
              <circle cx="20" cy="20" r="16" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
              <path d="M13 13 L27 27 M27 13 L13 27" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={!selectedRoom || !item.trim() || submitting}
        >
          {submitting ? <><span className="spinner" />Placing order…</> : <>Place Order<ArrowIcon /></>}
        </button>
      </form>
    </div>
  );
}
