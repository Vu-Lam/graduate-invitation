import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { config } from '../config.js';

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

export default function Admin() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ slug: '', name: '', honorific: 'bạn', group: '' });
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', honorific: 'bạn', group: '' });
  const [editError, setEditError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (token) {
      setAuthenticated(true);
      setError('');
      loadGuests(token);
    }
  };

  const loadGuests = async (authToken) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.apiUrl}/api/admin/guests`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Token không đúng.' : 'Lỗi kết nối.');
      }
      const data = await res.json();
      setGuests(data.items);
    } catch (err) {
      setError(err.message);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setFormError('');
    setAdding(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/admin/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newGuest)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi thêm khách.');
      }

      const data = await res.json();
      setGuests([data, ...guests]);
      setNewGuest({ slug: '', name: '', honorific: 'bạn', group: '' });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleEditStart = (guest) => {
    setEditingId(guest.id);
    setEditData({ name: guest.name, honorific: guest.honorific, group: guest.group });
    setEditError('');
  };

  const handleEditSave = async (id) => {
    setEditError('');
    try {
      const res = await fetch(`${config.apiUrl}/api/admin/guests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi cập nhật.');
      }

      const data = await res.json();
      setGuests(guests.map((g) => (g.id === id ? data : g)));
      setEditingId(null);
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn chắc chắn xóa khách này?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${config.apiUrl}/api/admin/guests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi xóa.');
      }

      setGuests(guests.filter((g) => g.id !== id));
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(165deg, #031a63 0%, #0b45c2 52%, #031a63 100%)',
          color: '#fff',
          padding: '20px'
        }}
      >
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Admin</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showToken ? 'text' : 'password'}
                placeholder="Nhập admin token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#666'
                }}
              >
                {showToken ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {error && (
              <div
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 0, 0, 0.2)',
                  color: '#ff6b6b',
                  fontSize: '14px'
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#fff',
                color: '#031a63',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #031a63 0%, #0b45c2 52%, #031a63 100%)',
        color: '#fff',
        padding: '40px 20px'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Quản lý khách mời</h1>
          <button
            onClick={() => setAuthenticated(false)}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Đăng xuất
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#fff',
            color: '#031a63',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '30px'
          }}
        >
          {showForm ? 'Hủy' : '+ Thêm khách'}
        </button>

        {showForm && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px'
            }}
          >
            <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Slug *</label>
                <input
                  type="text"
                  placeholder="ví dụ: lam-vu"
                  value={newGuest.slug}
                  onChange={(e) => setNewGuest({ ...newGuest, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tên *</label>
                <input
                  type="text"
                  placeholder="Tên khách"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Xưng hô</label>
                <select
                  value={newGuest.honorific}
                  onChange={(e) => setNewGuest({ ...newGuest, honorific: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="bạn">Thầy</option>
                  <option value="bạn">Cô</option>
                  <option value="bạn">Xếp</option>
                  <option value="bạn">Bạn</option>
                  <option value="anh">Anh</option>
                  <option value="chị">Chị</option>
                  <option value="cô">Cô</option>
                  <option value="chú">Chú</option>
                  <option value="em">Em</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Nhóm</label>
                <input
                  type="text"
                  placeholder="ví dụ: gia đình, bạn bè, thầy cô"
                  value={newGuest.group}
                  onChange={(e) => setNewGuest({ ...newGuest, group: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {formError && (
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 0, 0, 0.2)',
                    color: '#ff6b6b',
                    fontSize: '14px'
                  }}
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={adding}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#fff',
                  color: '#031a63',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: adding ? 'not-allowed' : 'pointer',
                  opacity: adding ? 0.6 : 1
                }}
              >
                {adding ? 'Đang thêm...' : 'Thêm khách'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
        ) : error ? (
          <div
            style={{
              padding: '15px',
              borderRadius: '8px',
              background: 'rgba(255, 0, 0, 0.2)',
              color: '#ff6b6b'
            }}
          >
            {error}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.3)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Slug</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tên</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Xưng hô</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nhóm</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>RSVP</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Lượt mở</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '13px' }}>{guest.slug}</td>
                    <td style={{ padding: '12px' }}>
                      {editingId === guest.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '13px'
                          }}
                        />
                      ) : (
                        guest.name
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {editingId === guest.id ? (
                        <select
                          value={editData.honorific}
                          onChange={(e) => setEditData({ ...editData, honorific: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '13px'
                          }}
                        >
                          <option value="bạn">Bạn</option>
                          <option value="anh">Anh</option>
                          <option value="chị">Chị</option>
                          <option value="cô">Cô</option>
                          <option value="chú">Chú</option>
                          <option value="em">Em</option>
                        </select>
                      ) : (
                        guest.honorific
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {editingId === guest.id ? (
                        <input
                          type="text"
                          value={editData.group}
                          onChange={(e) => setEditData({ ...editData, group: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '13px'
                          }}
                        />
                      ) : (
                        guest.group || '—'
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: guest.rsvpStatus ? '#3fd1b0' : 'rgba(255, 255, 255, 0.6)' }}>
                      {guest.rsvpStatus ? guest.rsvpStatus.toUpperCase() : '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{guest.visits}</td>
                    <td style={{ padding: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {editingId === guest.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(guest.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              background: '#3fd1b0',
                              color: '#031a63',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              background: 'transparent',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => copyToClipboard(`${config.siteUrl}/moi/${guest.slug}`)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              background: 'transparent',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Link
                          </button>
                          <button
                            onClick={() => handleEditStart(guest)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              background: 'transparent',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            disabled={deleting === guest.id}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 0, 0, 0.5)',
                              background: 'transparent',
                              color: '#ff6b6b',
                              cursor: deleting === guest.id ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              opacity: deleting === guest.id ? 0.6 : 1
                            }}
                          >
                            {deleting === guest.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {guests.length === 0 && <div style={{ padding: '40px', textAlign: 'center' }}>Chưa có khách nào.</div>}
          </div>
        )}

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
          Tổng cộng: {guests.length} khách
        </div>
      </div>
    </div>
  );
}
