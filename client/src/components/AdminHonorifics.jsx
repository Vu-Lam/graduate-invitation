import { useCallback, useEffect, useState } from 'react';
import { config } from '../config.js';

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

export default function AdminHonorifics({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState('');
  const [busy, setBusy] = useState(false);

  const call = useCallback(
    async (path, method = 'GET', body) => {
      const res = await fetch(`${config.apiUrl}/api/admin/honorifics${path}`, {
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
      setItems((await call('')).items);
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

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 0 }}>
        Các lựa chọn trong ô “Xưng hô” khi thêm/sửa khách. Chữ này hiện nguyên văn trên thiệp, ví dụ “thầy Minh”.
        Đổi tên sẽ cập nhật luôn các khách đang dùng.
      </p>

      {error && (
        <div style={{ padding: 10, borderRadius: 6, background: 'rgba(255,0,0,0.2)', color: '#ff6b6b', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            await call('', 'POST', { name: draft });
            setDraft('');
          });
        }}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}
      >
        <input
          placeholder="Xưng hô mới (vd: dì, bác)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ ...input, minWidth: 220 }}
          maxLength={20}
          required
        />
        <button type="submit" disabled={busy} style={{ ...btnPrimary, padding: '9px 18px', fontSize: 14 }}>
          + Thêm
        </button>
      </form>

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Xưng hô</th>
              <th style={{ padding: 12, textAlign: 'center' }}>Số khách</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((h) => (
              <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: 12 }}>
                  {editingId === h.id ? (
                    <input value={edit} onChange={(e) => setEdit(e.target.value)} style={input} maxLength={20} />
                  ) : (
                    h.name
                  )}
                </td>
                <td style={{ padding: 12, textAlign: 'center' }}>{h.guests}</td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {editingId === h.id ? (
                      <>
                        <button
                          style={btnPrimary}
                          disabled={busy}
                          onClick={() =>
                            run(async () => {
                              await call(`/${h.id}`, 'PUT', { name: edit });
                              setEditingId(null);
                            })
                          }
                        >
                          Lưu
                        </button>
                        <button style={btn} onClick={() => setEditingId(null)}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <button
                          style={btn}
                          onClick={() => {
                            setEditingId(h.id);
                            setEdit(h.name);
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          style={{ ...btn, color: '#ff6b6b', borderColor: 'rgba(255,0,0,0.5)' }}
                          onClick={() => confirm(`Xóa "${h.name}"?`) && run(() => call(`/${h.id}`, 'DELETE'))}
                        >
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
    </div>
  );
}
