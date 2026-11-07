import Icon from './Icon.jsx';
import { config } from '../config.js';

export default function Info() {
  const { host, event } = config;
  return (
    <section id="info" className="section">
      <div className="section__head">
        <div className="eyebrow">THÔNG TIN</div>
        <h2 className="display h2">Mình là ai, gặp nhau ở đâu</h2>
      </div>

      <div className="glass about">
        {host.photo ? (
          <img className="about__photo" src={host.photo} alt={`Ảnh của ${host.name}`} />
        ) : (
          <div className="about__photo about__photo--empty">
            Ảnh
            <br />
            chân dung
          </div>
        )}
        <div className="about__body">
          <div className="display about__name">{host.name}</div>
          <div className="about__meta">
            <span className="liquid">{host.major}</span>
            <span className="liquid">{host.faculty}</span>
            <span className="liquid">{host.school}</span>
          </div>
          <p className="about__bio">{host.bio}</p>
        </div>
      </div>

      <div className="cards">
        <div className="glass card">
          <div className="card__icon">
            <Icon name="calendar" size={26} />
          </div>
          <div className="eyebrow eyebrow--sm">THỜI GIAN</div>
          <div className="display card__title">{event.dateText}</div>
          <div className="card__text">
            {event.timeText}
            <br />
            {event.schedule}
          </div>
        </div>

        <div className="glass card">
          <div className="card__icon">
            <Icon name="pin" size={26} />
          </div>
          <div className="eyebrow eyebrow--sm">ĐỊA ĐIỂM</div>
          <div className="display card__title">{event.venue}</div>
          <div className="card__text">{event.address}</div>
          <a className="card__link" href={event.mapUrl} target="_blank" rel="noopener noreferrer">
            Mở Google Maps
            <Icon name="arrow" size={18} strokeWidth={2} />
          </a>
        </div>

        <div className="glass card">
          <div className="card__icon">
            <Icon name="phone" size={26} />
          </div>
          <div className="eyebrow eyebrow--sm">LIÊN HỆ</div>
          <div className="display card__title">{host.name}</div>
          <ul className="card__list">
            {host.contacts.map((c) => (
              <li key={c.label}>
                {c.href ? (
                  <a href={c.href} target="_blank" rel="noopener noreferrer">
                    {c.value}
                  </a>
                ) : (
                  c.value
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
