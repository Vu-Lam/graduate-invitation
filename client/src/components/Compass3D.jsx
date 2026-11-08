import { useEffect, useRef } from 'react';

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const EDGE_LAYERS = [0, 1, 2, 3, 4, 5];
const SCROLL_DEG_PER_PX = 0.45;
const MAX_TILT = 9;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Mặt trên la bàn hướng thẳng vào người xem, đáy là màn hình.
// Desktop: kim chỉ theo con trỏ. Mobile: kim xoay theo chiều kim đồng hồ khi cuộn xuống, ngược lại khi cuộn lên.
export default function Compass3D() {
  const rootRef = useRef(null);
  const tiltRef = useRef(null);
  const needleRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = { angle: 0, vel: 0, target: 0, rx: 0, ry: 0, trx: 0, tries: 0 };
    let raf = 0;
    let visible = false;
    let last = 0;

    const paint = () => {
      needleRef.current.style.transform = `translateZ(8px) rotate(${s.angle}deg)`;
      tiltRef.current.style.transform = `rotateX(${s.rx}deg) rotateY(${s.ry}deg)`;
    };

    const step = (now) => {
      raf = 0;
      const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
      last = now;

      let diff = s.target - s.angle;
      if (fine) diff = ((((diff + 180) % 360) + 360) % 360) - 180;
      s.vel += (120 * diff - 14 * s.vel) * dt;
      s.angle += s.vel * dt;

      const ease = Math.min(1, dt * 8);
      s.rx += (s.trx - s.rx) * ease;
      s.ry += (s.tries - s.ry) * ease;
      paint();

      const settled =
        Math.abs(diff) < 0.05 && Math.abs(s.vel) < 0.05 && Math.abs(s.trx - s.rx) < 0.02 && Math.abs(s.tries - s.ry) < 0.02;
      if (!settled && visible) raf = requestAnimationFrame(step);
    };

    const update = () => {
      if (reduced) {
        s.angle = s.target;
        s.rx = s.trx;
        s.ry = s.tries;
        paint();
        return;
      }
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };

    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      s.target = (Math.atan2(dx, -dy) * 180) / Math.PI;
      s.tries = clamp(dx / 360, -1, 1) * MAX_TILT;
      s.trx = -clamp(dy / 360, -1, 1) * MAX_TILT;
      update();
    };

    const onScroll = () => {
      s.target = window.scrollY * SCROLL_DEG_PER_PX;
      update();
    };

    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true });
    } else {
      s.target = window.scrollY * SCROLL_DEG_PER_PX;
      s.angle = s.target;
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    paint();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) update();
    });
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="c3" aria-hidden="true">
      <div ref={tiltRef} className="c3__tilt">
        <i className="c3__shadow" />
        {EDGE_LAYERS.map((i) => (
          <i key={i} className="c3__edge" style={{ '--i': i }} />
        ))}
        <i className="c3__bezel" />

        <svg className="c3__dial" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="c3-face" cx="50%" cy="38%" r="70%">
              <stop offset="0%" className="c3__stop c3__stop--a" />
              <stop offset="100%" className="c3__stop c3__stop--b" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="url(#c3-face)" />
          <circle cx="50" cy="50" r="40" className="c3__rim" />
          {TICKS.map((deg) => {
            const major = deg % 90 === 0;
            const mid = deg % 30 === 0;
            return (
              <line
                key={deg}
                x1="50"
                y1="11.5"
                x2="50"
                y2={major ? 20 : mid ? 17.5 : 15}
                transform={`rotate(${deg} 50 50)`}
                className={major ? 'c3__tick c3__tick--major' : mid ? 'c3__tick c3__tick--mid' : 'c3__tick'}
              />
            );
          })}
          <text x="50" y="30" className="c3__letter c3__letter--n">N</text>
          <text x="70" y="50" className="c3__letter">E</text>
          <text x="50" y="70" className="c3__letter">S</text>
          <text x="30" y="50" className="c3__letter">W</text>
        </svg>

        <svg ref={needleRef} className="c3__needle" viewBox="0 0 100 100">
          <polygon points="50,13 44,50 56,50" fill="#ff5a4d" />
          <polygon points="50,13 50,50 56,50" fill="#b3261e" />
          <polygon points="50,87 44,50 56,50" fill="#eef3fb" />
          <polygon points="50,87 50,50 56,50" fill="#a9b6cc" />
        </svg>

        <i className="c3__pin" />
        <i className="c3__glass" />
      </div>
    </div>
  );
}
