import { useCallback, useEffect, useState } from 'react';
import { config } from '../config.js';
import { fmtRange } from '../utils.js';

const input = { padding: '8px', borderRadius: '6px', border: 'none', fontSize: '14px', boxSizing: 'border-box' };
const btn = {
  padding: '6px 12px',
  borderRadius: '4px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '12px'
};
const btnPrimary = { ...btn, border: 'none', background: '#3fd1b0', color: '#031a63', fontWeight: 600 };
const EMPTY = { group: '', start: '10:00', end: '12:00' };

export default function AdminSchedules({ token }) {
  const [items, setItems] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(EMPTY); // form thêm
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const call = useCallback(
    async (path, method = 'GET', body) => {
      const res = await fetch(`${config.apiUrl}/api/admin/schedules${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra.');
      return data;
    },
    [token]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await call('');
      setItems(data.items);
      setUnmatched(data.unmatched);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      await call('', 'POST', draft);
      setDraft(EMPTY);
    });
  };
  const save = (id) =>
    run(async () => {
      await call(`/${id}`, 'PUT', edit);
      setEditingId(null);
    });
  const remove = (s) => {
    if (!confirm(`Xóa khung giờ của nhóm "${s.group}"?`)) return;
    run(() => call(`/${s.id}`, "DELETE"));
  };

  const timeInputs = (v, set) => (
    <>
      <input type="time" value={v.start} onChange={(e) => set({ ...v, start: e.target.value })} style={input} required />
      <span>–</span>
      <input type="time" value={v.end} onChange={(e) => set({ ...v, end: e.target.value })} style={input} required />
    </>
  );

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 0 }}>
        Khung giờ khách được mời có mặt, khớp với cột “Nhóm” của khách (không phân biệt hoa/thường).
        Khách thuộc nhóm nào sẽ thấy khung giờ của nhóm đó trên thiệp.
      </p>

      {error && (
        <div style={{ padding: 10, borderRadius: 6, background: 'rgba(255,0,0,0.2)', color: '#ff6b6b', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={add} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <input
          placeholder="Tên nhóm (vd: Bạn bè)"
          value={draft.group}
          onChange={(e) => setDraft({ ...draft, group: e.target.value })}
          style={{ ...input, minWidth: 200 }}
          maxLength={40}
          required
        />
        {timeInputs(draft, setDraft)}
        <button type="submit" disabled={busy} style={{ ...btnPrimary, padding: '9px 18px', fontSize: 14 }}>
          + Thêm nhóm
        </button>
      </form>

      {unmatched.length > 0 && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,200,0,0.15)', marginBottom: 20, fontSize: 14 }}>
          ⚠ Chưa có khung giờ cho:{' '}
          {unmatched.map((u, i) => (
            <span key={u.group}>
              {i > 0 && ', '}
              <button
                type="button"
                onClick={() => setDraft({ ...EMPTY, group: u.group })}
                disabled={!u.group}
                style={{ ...btn, padding: '2px 8px', marginLeft: 4 }}
              >
                {u.group || '(chưa gán nhóm)'} · {u.count} khách
              </button>
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Nhóm</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Khung giờ</th>
              <th style={{ padding: 12, textAlign: 'center' }}>Số khách</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {editingId === s.id ? (
                  <>
                    <td style={{ padding: 12 }}>
                      <input value={edit.group} onChange={(e) => setEdit({ ...edit, group: e.target.value })} style={input} maxLength={40} />
                    </td>
                    <td style={{ padding: 12, display: 'flex', gap: 6, alignItems: 'center' }}>{timeInputs(edit, setEdit)}</td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: 12 }}>{s.group}</td>
                    <td style={{ padding: 12 }}>{fmtRange(s)}</td>
                  </>
                )}
                <td style={{ padding: 12, textAlign: 'center' }}>{s.guests}</td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {editingId === s.id ? (
                      <>
                        <button style={btnPrimary} disabled={busy} onClick={() => save(s.id)}>Lưu</button>
                        <button style={btn} onClick={() => setEditingId(null)}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <button
                          style={btn}
                          onClick={() => {
                            setEditingId(s.id);
                            setEdit({ group: s.group, start: s.start, end: s.end });
                          }}
                        >
                          Sửa
                        </button>
                        <button style={{ ...btn, color: '#ff6b6b', borderColor: 'rgba(255,0,0,0.5)' }} onClick={() => remove(s)}>
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && items.length === 0 && <div style={{ padding: 40, textAlign: 'center' }}>Chưa có nhóm nào.</div>}
    </div>
  );
}
