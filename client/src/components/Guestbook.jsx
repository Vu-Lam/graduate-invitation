import { useEffect, useState } from 'react';
import { api } from '../api.js';

function Ghost({ lines, tall }) {
  return (
    <div className={`glass ghost${tall ? ' ghost--tall' : ''}`}>
      <div className="ghost__head">
        <span className="ghost__avatar" />
        <span className="ghost__line ghost__line--name" />
      </div>
      {lines.map((w, i) => (
        <span key={i} className="ghost__line" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// Bật bằng GUESTBOOK_ENABLED=true ở server. Chưa bật thì hiện khung "Sắp ra mắt".
export default function Guestbook({ slug }) {
  const [state, setState] = useState({ loading: true, enabled: false, items: [] });

  useEffect(() => {
    let alive = true;
    api
      .getWishes(slug)
      .then((data) => alive && setState({ loading: false, enabled: data.enabled, items: data.items }))
      .catch(() => alive && setState({ loading: false, enabled: false, items: [] }));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.loading) return null;

  return (
    <section id="guestbook" className="section">
      <div className="section__head section__head--row">
        <div>
          <div className="eyebrow">SỔ LƯU BÚT</div>
          <h2 className="display h2">Lời chúc từ mọi người</h2>
        </div>
        {!state.enabled && <div className="glass badge">SẮP RA MẮT</div>}
      </div>

      {state.enabled && state.items.length > 0 && (
        <div className="wishes">
          {state.items.map((w) => (
            <figure key={w.id} className={`glass wish${w.isOwn ? ' wish--own' : ''}`}>
              <blockquote>”{w.wish}”</blockquote>
              <div className="wish__tag">
                <figcaption>{w.from}</figcaption>
              </div>
            </figure>
          ))}
        </div>
      )}

      {state.enabled && state.items.length === 0 && (
        <div className="glass ghost ghost--empty">Chưa có lời chúc nào được hiển thị. Hãy là người đầu tiên!</div>
      )}

      {!state.enabled && (
        <div className="ghosts">
          <Ghost lines={[100, 80, 60]} />
          <Ghost lines={[100, 90, 100, 70]} tall />
          <Ghost lines={[100, 75]} />
        </div>
      )}
    </section>
  );
}
