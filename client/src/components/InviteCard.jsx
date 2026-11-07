import { forwardRef } from 'react';
import Icon from './Icon.jsx';
import { LogoShapes, Lotus, Wheel } from './Decor.jsx';
import { config } from '../config.js';

// Ảnh thiệp 1080x1350 để tải về. Cố ý KHÔNG dùng backdrop-filter:
// các mảng nền được làm mờ sẵn nên PNG xuất ra vẫn giữ hiệu ứng kính.
const InviteCard = forwardRef(function InviteCard({ guest, qr, link }, ref) {
  const { host, event } = config;
  return (
    <div className="xcard" ref={ref}>
      <LogoShapes className="xcard__shape xcard__shape--a" />
      <LogoShapes className="xcard__shape xcard__shape--b" swap />
      <Wheel className="xcard__shape xcard__wheel" />
      <Lotus className="xcard__shape xcard__lotus" />

      <div className="xcard__panel">
        <div className="xcard__top">
          <div className="xcard__logo">
            <img src="/logo.png" alt="" />
          </div>
          <div className="xcard__eyebrow">THƯ MỜI TỐT NGHIỆP</div>
        </div>

        <div className="xcard__main">
          <div className="xcard__lead">Trân trọng kính mời</div>
          <div className="display xcard__guest">
            {guest.honorific} {guest.name}
          </div>
          <div className="xcard__rule" />
          <div className="xcard__lead xcard__lead--sm">tới chung vui lễ tốt nghiệp của</div>
          <div className="display xcard__host">{host.name}</div>
          <div className="xcard__meta">
            {host.major} · {host.faculty} · {host.school}
          </div>
        </div>

        <div className="xcard__facts">
          <div>
            <Icon name="calendar" size={36} strokeWidth={1.7} />
            <span>{event.dateText}</span>
          </div>
          <div>
            <Icon name="clock" size={36} strokeWidth={1.7} />
            <span>{event.timeText}</span>
          </div>
          <div>
            <Icon name="pin" size={36} strokeWidth={1.7} />
            <span>{event.venue}</span>
          </div>
        </div>

        <div className="xcard__foot">
          <div>
            <div className="xcard__scan">Quét mã để xác nhận tham dự</div>
            <div className="xcard__link">{link}</div>
          </div>
          <div className="xcard__qr">{qr ? <img src={qr} alt="" /> : null}</div>
        </div>
      </div>
    </div>
  );
});

export default InviteCard;
