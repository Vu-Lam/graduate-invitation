import Icon from './Icon.jsx';
import { config } from '../config.js';
import { fmtRange, fmtTime } from '../utils.js';

const mins = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function Timeline({ guest, event }) {
  const a0 = mins(event.axis.start);
  const span = mins(event.axis.end) - a0;
  const pos = (t) => ((mins(t) - a0) / span) * 100;
  const bar = (from, to) => ({ left: `${pos(from)}%`, width: `${pos(to) - pos(from)}%` });

  const lanes = [
    { key: 'host', label: 'Mình có mặt', text: `từ ${fmtTime(event.hostFrom)}`, from: event.hostFrom, to: event.axis.end, open: true },
    guest?.arrival && {
      key: 'guest',
      label: 'Mời bạn đến',
      text: fmtRange(guest.arrival),
      from: guest.arrival.start,
      to: guest.arrival.end
    },
    { key: 'ceremony', label: 'Lễ tốt nghiệp', text: fmtRange(event.ceremony), from: event.ceremony.start, to: event.ceremony.end, note: 'Mình ngồi trong hội trường, chưa gặp được nhé' }
  ].filter(Boolean);

  const ticks = [];
  for (let h = Math.ceil(a0 / 60); h * 60 <= a0 + span; h++) ticks.push(h);

  return (
    <div className="tl" role="group" aria-label="Lịch trình trong ngày">
      <div className="tl__lanes">
        {lanes.map((l) => (
          <div className={`tl__lane tl__lane--${l.key}`} key={l.key}>
            <div className="tl__label">
              {l.label}
              {l.note && <small>{l.note}</small>}
            </div>
            <div className="tl__track">
              <div className={`tl__bar${l.open ? ' tl__bar--open' : ''}`} style={bar(l.from, l.to)}>
                <span>{l.text}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="tl__axis" aria-hidden="true">
          {ticks.map((h) => (
            <span key={h} style={{ left: `${pos(`${h}:00`)}%` }}>
              {h}h
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Info({ guest }) {
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
        <div className="glass card card--time">
          <div className="card__icon">
            <Icon name="calendar" size={26} />
          </div>
          <div className="eyebrow eyebrow--sm">THỜI GIAN</div>
          <div className="display card__title">{event.dateText}</div>
          <Timeline guest={guest} event={event} />
          <div className="card__text">{event.schedule}</div>
        </div>

        <div className="glass card card--place">
          <div className="card__icon">
            <Icon name="pin" size={26} />
          </div>
          <div className="eyebrow eyebrow--sm">ĐỊA ĐIỂM</div>
          <div className="display card__title">{event.venue}</div>
          <div className="card__text">{event.address}</div>
          {event.parking?.length > 0 && (
            <div className="parking">
              <div className="eyebrow eyebrow--sm">GỬI XE</div>
              <ul className="parking__list">
                {event.parking.map((p) => (
                  <li key={p.name}>
                    <strong>{p.name}</strong>
                    <div className="parking__maps">
                      {p.maps.map((m) => (
                        <a key={m.url} href={m.url} target="_blank" rel="noopener noreferrer">
                          <Icon name="pin" size={14} strokeWidth={2} />
                          {m.label}
                        </a>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <a className="card__link" href={event.mapUrl} target="_blank" rel="noopener noreferrer">
            Mở Google Maps
            <Icon name="arrow" size={18} strokeWidth={2} />
          </a>
        </div>

        <div className="glass card card--contact">
          <div className="card__icon">
            <Icon name="phone" size={26} />
          </div>
          <div className="contact__who">
            <div className="eyebrow eyebrow--sm">LIÊN HỆ</div>
            <div className="display card__title">{host.name}</div>
          </div>
          <div className="contact__links">
            {host.contacts.map((c) => {
              const label = c.href?.startsWith('tel:') ? c.value : c.label;
              return c.href ? (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer">
                  {c.label === 'Điện thoại' ? `Gọi ${label}` : `Nhắn ${label}`}
                </a>
              ) : (
                <span key={c.label}>{c.value}</span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
