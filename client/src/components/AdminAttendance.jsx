import { useMemo, useState } from 'react';
import { config } from '../config.js';

const MARKS = [
  { key: 'photo', on: '📷 Đã chụp ảnh', off: '📷 Chưa chụp' },
  { key: 'photoSent', on: '📤 Đã gửi ảnh', off: '📤 Chưa gửi ảnh' },
  { key: 'gift', on: '🎁 Đã tặng quà', off: '🎁 Chưa tặng quà' }
];

const STATUS_FILTERS = [
  ['yes', 'Đi'],
  ['no', 'Không đi'],
  ['none', 'Chưa trả lời'],
  ['all', 'Tất cả']
];

const TODO_FILTERS = [
  ['', 'Tất cả việc'],
  ['noPhoto', 'Chưa chụp ảnh'],
  ['needSend', 'Đã chụp, chưa gửi ảnh'],
  ['noGift', 'Chưa tặng quà']
];

// Bỏ dấu để tìm "lam" ra "Lâm"
const fold = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const statusOf = (g) => g.rsvpStatus || 'none';

const pill = (active) => ({
  padding: '8px 16px',
  borderRadius: '999px',
  border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.4)',
  background: active ? '#fff' : 'transparent',
  color: active ? '#031a63' : '#fff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
});

const field = {
  padding: '10px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '14px',
  boxSizing: 'border-box'
};

function Stat({ label, value, sub }) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '14px 16px'
      }}
    >
      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
        {value}
        {sub != null && <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)' }}> / {sub}</span>}
      </div>
    </div>
  );
}

function ContactLink({ contact }) {
  if (!contact) return null;
  if (/^[\d\s.+()-]{8,}$/.test(contact)) {
    return (
      <a href={`tel:${contact.replace(/[^\d+]/g, '')}`} style={{ color: '#fff' }}>
        {contact}
      </a>
    );
  }
  if (contact.includes('@')) {
    return (
      <a href={`mailto:${contact}`} style={{ color: '#fff' }}>
        {contact}
      </a>
    );
  }
  return contact;
}

export default function AdminAttendance({ token, guests, setGuests }) {
  const [status, setStatus] = useState('yes');
  const [todo, setTodo] = useState('');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState({});
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});

  const stats = useMemo(() => {
    const yes = guests.filter((g) => g.rsvpStatus === 'yes');
    const count = (k) => guests.filter((g) => g.checkin?.[k]).length;
    return {
      total: guests.length,
      yes: yes.length,
      no: guests.filter((g) => g.rsvpStatus === 'no').length,
      none: guests.filter((g) => !g.rsvpStatus).length,
      photo: count('photo'),
      photoSent: count('photoSent'),
      gift: count('gift')
    };
  }, [guests]);

  const list = useMemo(() => {
    const q = fold(query.trim());
    return guests
      .filter((g) => status === 'all' || statusOf(g) === status)
      .filter((g) => {
        const c = g.checkin || {};
        if (todo === 'noPhoto') return !c.photo;
        if (todo === 'needSend') return c.photo && !c.photoSent;
        if (todo === 'noGift') return !c.gift;
        return true;
      })
      .filter((g) => !q || fold(`${g.honorific} ${g.name} ${g.group} ${g.slug}`).includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [guests, status, todo, query]);

  const save = async (guest, patch) => {
    const key = guest.id;
    const before = guest.checkin;
    setError('');
    setSaving((s) => ({ ...s, [key]: true }));
    // Cập nhật ngay trên màn hình cho nhanh, lỗi thì trả lại như cũ
    setGuests((all) => all.map((g) => (g.id === key ? { ...g, checkin: { ...g.checkin, ...patch } } : g)));
    try {
      const res = await fetch(`${config.apiUrl}/api/admin/guests/${key}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu đánh dấu.');
      setGuests((all) => all.map((g) => (g.id === key ? { ...g, checkin: data.checkin } : g)));
    } catch (err) {
      setGuests((all) => all.map((g) => (g.id === key ? { ...g, checkin: before } : g)));
      setError(`${guest.name}: ${err.message}`);
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  const saveNote = (guest) => {
    const value = notes[guest.id];
    if (value === undefined || value.trim() === (guest.checkin?.note ?? '')) return;
    save(guest, { note: value.trim() });
  };

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '24px'
        }}
      >
        <Stat label="✅ Đi" value={stats.yes} sub={stats.total} />
        <Stat label="❌ Không đi" value={stats.no} />
        <Stat label="⏳ Chưa trả lời" value={stats.none} />
        <Stat label="📷 Đã chụp ảnh" value={stats.photo} />
        <Stat label="📤 Đã gửi ảnh" value={stats.photoSent} sub={stats.photo} />
        <Stat label="🎁 Đã tặng quà" value={stats.gift} />
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {STATUS_FILTERS.map(([key, label]) => (
          <button key={key} onClick={() => setStatus(key)} style={pill(status === key)}>
            {label} ({key === 'all' ? stats.total : stats[key]})
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          type="search"
          placeholder="Tìm tên, nhóm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...field, flex: '1 1 220px' }}
        />
        <select value={todo} onChange={(e) => setTodo(e.target.value)} style={{ ...field, flex: '0 1 220px' }}>
          {TODO_FILTERS.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255, 0, 0, 0.2)', color: '#ff6b6b', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {list.map((guest) => {
          const c = guest.checkin || {};
          const st = statusOf(guest);
          return (
            <div
              key={guest.id}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '12px',
                padding: '14px 16px',
                opacity: saving[guest.id] ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    {guest.honorific} {guest.name}
                  </span>
                  {guest.group && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>· {guest.group}</span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: st === 'yes' ? '#3fd1b0' : st === 'no' ? '#ff8a8a' : 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  {st === 'yes' ? 'Đi' : st === 'no' ? 'Không đi' : 'Chưa trả lời'}
                </span>
              </div>

              {(guest.contact || (st === 'no' && guest.reason)) && (
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '6px', overflowWrap: 'anywhere' }}>
                  {guest.contact && (
                    <>
                      Liên lạc: <ContactLink contact={guest.contact} />
                    </>
                  )}
                  {st === 'no' && guest.reason && <div>Lý do: {guest.reason}</div>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {MARKS.map(({ key, on, off }) => (
                  <button
                    key={key}
                    onClick={() => save(guest, { [key]: !c[key] })}
                    disabled={saving[guest.id]}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: c[key] ? 'none' : '1px solid rgba(255, 255, 255, 0.4)',
                      background: c[key] ? '#3fd1b0' : 'transparent',
                      color: c[key] ? '#031a63' : '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: saving[guest.id] ? 'wait' : 'pointer'
                    }}
                  >
                    {c[key] ? `✓ ${on}` : off}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Ghi chú (vd: gửi ảnh qua Zalo, quà gửi lại sau...)"
                maxLength={200}
                value={notes[guest.id] ?? c.note ?? ''}
                onChange={(e) => setNotes((n) => ({ ...n, [guest.id]: e.target.value }))}
                onBlur={() => saveNote(guest)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                style={{ ...field, width: '100%', marginTop: '10px', padding: '8px', fontSize: '13px' }}
              />
            </div>
          );
        })}
        {list.length === 0 && <div style={{ padding: '40px', textAlign: 'center' }}>Không có khách nào khớp bộ lọc.</div>}
      </div>
    </div>
  );
}
