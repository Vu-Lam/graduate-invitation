import Icon from './Icon.jsx';
import Compass3D from './Compass3D.jsx';
import MagnifyText from './MagnifyText.jsx';
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
              <Compass3D />
              <MagnifyText text="Tham quan Bách Khoa 360°" />
            </div>
          )}
        </a>
      </div>
    </section>
  );
}
