import { useState } from 'react';
import Icon from './Icon.jsx';
import Confetti from './Confetti.jsx';
import { api } from '../api.js';

const MAX = 500;

export default function Rsvp({ guest, onSaved }) {
  const saved = guest.rsvp;
  const [status, setStatus] = useState(saved.status || 'yes');
  const [reason, setReason] = useState(saved.reason || '');
  const [wish, setWish] = useState(saved.wish || '');
  const [contact, setContact] = useState(saved.contact || '');
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null); // { message, field }
  const [burst, setBurst] = useState(0);

  const answered = Boolean(saved.status);
  const showThanks = answered && !editing;

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setError(null);
    if (!contact.trim()) {
      setError({ message: 'Bạn vui lòng để lại thông tin liên lạc.', field: 'contact' });
      return;
    }
    if (status === 'no' && !reason.trim()) {
      setError({ message: 'Bạn cho mình biết lý do với nhé.', field: 'reason' });
      return;
    }
    setSending(true);
    try {
      const updated = await api.sendRsvp(guest.slug, { status, reason, wish, contact });
      onSaved(updated);
      setEditing(false);
      if (updated.rsvp.status === 'yes') setBurst((n) => n + 1);
    } catch (err) {
      setError({ message: err.message, field: err.field });
    } finally {
      setSending(false);
    }
  };

  const startEdit = () => {
    setStatus(saved.status || 'yes');
    setReason(saved.reason || '');
    setWish(saved.wish || '');
    setContact(saved.contact || '');
    setError(null);
    setEditing(true);
  };

  return (
    <section id="rsvp" className="rsvp">
      <Confetti burst={burst} />

      <div className="rsvp__intro">
        <div className="eyebrow">XÁC NHẬN THAM DỰ</div>
        <h2 className="display h2 h2--lg">Bạn sẽ đến chứ?</h2>
        <p className="rsvp__lead">Chỉ mất một phút. Dù đi được hay không, mình cũng rất muốn đọc lời chúc của bạn.</p>
        <div className="glass whoami">
          <Icon name="user" size={18} />
          Đang trả lời với tên: {guest.honorific} {guest.name}
        </div>
      </div>

      <div className="glass rsvp__card">
        {showThanks ? (
          <div className="thanks" role="status">
            <div className="thanks__tick">
              <Icon name="check" size={36} strokeWidth={2.2} />
            </div>
            <div className="display thanks__title">
              {saved.status === 'yes' ? 'Hẹn gặp bạn nhé!' : 'Cảm ơn bạn đã báo cho mình'}
            </div>
            <p className="thanks__text">
              {saved.status === 'yes'
                ? 'Mình đã nhận xác nhận của bạn. Hẹn gặp ở ngày vui.'
                : 'Mình đã nhận lý do và lời chúc của bạn. Mong sớm có dịp gặp nhau.'}
            </p>
            {saved.wish && <blockquote className="thanks__wish">“{saved.wish}”</blockquote>}
            <button type="button" className="btn btn--glass glass btn--sm" onClick={startEdit}>
              Sửa câu trả lời
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="form">
            <div className="seg" role="group" aria-label="Bạn có tham dự không?">
              <button type="button" aria-pressed={status === 'yes'} onClick={() => setStatus('yes')}>
                Mình sẽ đến
              </button>
              <button type="button" aria-pressed={status === 'no'} onClick={() => setStatus('no')}>
                Rất tiếc, mình không đến
              </button>
            </div>

            {status === 'no' && (
              <div className="field">
                <label htmlFor="reason">Lý do vắng mặt</label>
                <textarea
                  id="reason"
                  rows={3}
                  maxLength={MAX}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Bạn chia sẻ để mình hiểu nhé…"
                  aria-invalid={error?.field === 'reason'}
                  aria-describedby={error?.field === 'reason' ? 'rsvp-error' : undefined}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="contact">Thông tin liên lạc *</label>
              <input
                id="contact"
                type="text"
                maxLength={100}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Số điện thoại hoặc email"
                aria-invalid={error?.field === 'contact'}
                aria-describedby={error?.field === 'contact' ? 'rsvp-error' : undefined}
              />
            </div>

            <div className="field">
              <label htmlFor="wish">Lời chúc gửi mình</label>
              <textarea
                id="wish"
                rows={4}
                maxLength={MAX}
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="Viết vài dòng cho mình nhé…"
                aria-invalid={error?.field === 'wish'}
              />
              <div className="field__count">
                {wish.length}/{MAX}
              </div>
            </div>

            {error && (
              <div id="rsvp-error" className="form-error" role="alert">
                {error.message}
              </div>
            )}

            <div className="form__actions">
              <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
                <Icon name="send" size={20} strokeWidth={2} />
                {sending ? 'Đang gửi…' : answered ? 'Lưu thay đổi' : 'Gửi xác nhận'}
              </button>
              {answered && (
                <button type="button" className="btn btn--glass glass btn--sm" onClick={() => setEditing(false)}>
                  Huỷ
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
