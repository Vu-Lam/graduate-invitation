import Icon from './Icon.jsx';
import { config } from '../config.js';

export default function Tour() {
  const { tour } = config;
  return (
    <section id="tour" className="section">
      <div className="glass tour">
        <div className="tour__text">
          <div className="eyebrow">TOUR 360°</div>
          <h2 className="display h2 h2--md">Dạo một vòng Bách Khoa trước ngày gặp</h2>
          <p className="tour__lead">
            Đi từng bước qua khuôn viên ngay trên trình duyệt: nơi mình đã học, và cũng là nơi mình mời bạn đến.
          </p>
          <a className="btn btn--primary" href={tour.url} target="_blank" rel="noopener noreferrer">
            Bắt đầu tham quan
            <Icon name="arrow" size={20} strokeWidth={2} />
          </a>
        </div>

        <a className="tour__preview" href={tour.url} target="_blank" rel="noopener noreferrer" aria-label="Mở tour 360° Bách Khoa">
          {tour.preview ? (
            <img src={tour.preview} alt="" />
          ) : (
            <div className="tour__placeholder">
              <svg aria-hidden="true" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16.2 7.8l-2 6.3-6.3 2 2-6.3z" />
              </svg>
              <span>Tham quan Bách Khoa 360°</span>
            </div>
          )}
          <span className="hotspot" style={{ left: '22%', top: '64%' }} />
          <span className="hotspot" style={{ left: '68%', top: '38%', animationDelay: '.6s' }} />
          <span className="hotspot" style={{ left: '46%', top: '78%', animationDelay: '1.2s' }} />
        </a>
      </div>
    </section>
  );
}
