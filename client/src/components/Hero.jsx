import Icon from './Icon.jsx';
import { Lotus } from './Decor.jsx';
import { config } from '../config.js';
import { fmtRange } from '../utils.js';

const pad = (n) => String(n).padStart(2, '0');

function Countdown({ value }) {
  if (!value) return null;
  if (value.done) {
    return (
      <div className="glass countdown">
        <div className="countdown__title">HÔM NAY</div>
        <div className="display countdown__done">Là ngày vui!</div>
      </div>
    );
  }
  const units = [
    ['Ngày', value.days],
    ['Giờ', value.hours],
    ['Phút', value.minutes],
    ['Giây', value.seconds]
  ];
  return (
    <div className="glass countdown" role="timer" aria-label="Đếm ngược đến ngày lễ">
      <div className="countdown__title">ĐẾM NGƯỢC</div>
      <div className="countdown__units">
        {units.map(([label, n]) => (
          <div key={label} className="countdown__unit">
            <div className="display countdown__num">{pad(n)}</div>
            <div className="countdown__label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero({ guest, countdown, onDownload, downloading, downloadError }) {
  const { event, host } = config;
  return (
    <section className="hero">
      <div className="hero__text">
        <div className="chip glass">
          <Icon name="cap" size={18} />
          THƯ MỜI TỐT NGHIỆP
        </div>
        <div className="hero__greeting">
          Gửi {guest.honorific} {guest.name},
        </div>
        <h1 className="display hero__title">Chung vui ngày tốt nghiệp của {host.name}</h1>
        <p className="hero__lead">
          Sau những năm tháng ở Bách Khoa, mình sắp bước qua cánh cổng trường. Có người thân và bạn bè đi cùng thì ngày
          hôm đó mới trọn vẹn.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#rsvp">
            <Icon name="check" size={20} strokeWidth={2} />
            Xác nhận tham dự
          </a>
          <button type="button" className="btn btn--glass glass" onClick={onDownload} disabled={downloading}>
            <Icon name="download" size={20} />
            {downloading ? 'Đang tạo ảnh…' : 'Tải thiệp mời'}
          </button>
        </div>
        {downloadError && (
          <div className="form-error" role="alert">
            {downloadError}
          </div>
        )}
        <div className="hero__facts">
          <div className="glass fact">
            <Icon name="calendar" size={18} />
            {event.dateText}
          </div>
          <div className="glass fact">
            <Icon name="clock" size={18} />
            {guest.arrival ? `Mời bạn đến ${fmtRange(guest.arrival)}` : event.timeText}
          </div>
          <div className="glass fact">
            <Icon name="pin" size={18} />
            {event.venue}
          </div>
        </div>
      </div>

      <div className="hero__visual">
        <Lotus className="hero-lotus" />
        <div className="frost hero__logo">
          <img src="/logo.png" alt="Logo BK TP.HCM" />
        </div>
        <div className="hero__countdown">
          <Countdown value={countdown} />
        </div>
        <div className="glass hero__year">
          <Icon name="cap" size={18} />
          Tốt nghiệp {event.year}
        </div>
      </div>
    </section>
  );
}
