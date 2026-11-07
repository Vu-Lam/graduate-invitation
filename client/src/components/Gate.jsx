import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { config } from '../config.js';

// Màn "Chạm để mở thiệp". Cú chạm này cũng là lúc được phép phát nhạc.
export default function Gate({ guest, musicAvailable, onOpen, onClosed }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const open = () => {
    if (leaving) return;
    setLeaving(true);
    onOpen();
    setTimeout(onClosed, 650);
  };

  return (
    <div className={`gate${leaving ? ' gate--out' : ''}`}>
      <div className="chip glass">
        <Icon name="cap" size={16} />
        THƯ MỜI TỐT NGHIỆP
      </div>

      <div className="gate__center">
        <div className="frost gate__logo">
          <img src="/logo.png" alt="Logo BK TP.HCM" />
        </div>
        <div className="gate__text">
          <div className="gate__small">Trân trọng kính mời</div>
          <div className="display gate__name">
            {guest.honorific} {guest.name}
          </div>
          <div className="gate__small gate__small--light">đến chung vui lễ tốt nghiệp của {config.host.name}</div>
        </div>
      </div>

      <div className="gate__bottom">
        <div className="gate__cta">
          <span className="gate__ring" aria-hidden="true" />
          <button type="button" className="btn btn--primary btn--block" onClick={open} autoFocus>
            <Icon name="music" size={22} strokeWidth={1.9} />
            Chạm để mở thiệp
          </button>
        </div>
        {musicAvailable && <div className="gate__hint">Có nhạc nhẹ khi mở thiệp. Bạn bật loa giúp mình nhé.</div>}
      </div>
    </div>
  );
}
