import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DUST = (() => {
  const r = mulberry32(42);
  return Array.from({ length: 140 }, () => ({ x: r() * 100, y: r() * 100, s: r() < 0.85 ? 1 : 2, o: 0.2 + r() * 0.5 }));
})();

const PARTICLES = [
  { x: '8%', y: '78%', s: '5px', d: '7s', dl: '0s', dx: '14px' },
  { x: '26%', y: '30%', s: '3px', d: '9s', dl: '-3s', dx: '-10px' },
  { x: '48%', y: '86%', s: '6px', d: '8s', dl: '-5s', dx: '18px' },
  { x: '66%', y: '18%', s: '4px', d: '10s', dl: '-2s', dx: '-16px' },
  { x: '84%', y: '62%', s: '5px', d: '7.5s', dl: '-6s', dx: '-8px' },
  { x: '92%', y: '12%', s: '3px', d: '11s', dl: '-1s', dx: '10px' }
];

const SPARKS = Array.from({ length: 10 }, (_, k) => ({ a: `${k * 36 + (k % 2) * 12}deg`, r: `${34 + (k % 3) * 12}px` }));

// Vị trí sao cố định theo danh sách lời chúc: mỗi lần mở trang bầu trời đều giống nhau.
function buildSky(items) {
  const r = mulberry32(hashStr(items.map((i) => i.id).join('|')) || 1);
  const stars = [];
  const lines = [];
  const centers = [];
  const gap = (a, b) => Math.hypot((a.x - b.x) * 2.4, a.y - b.y);

  let i = 0;
  while (i < items.length) {
    const left = items.length - i;
    let size = 3 + Math.floor(r() * 3);
    if (left - size < 2) size = left;

    let center = null;
    let best = -1;
    for (let t = 0; t < 16; t++) {
      const c = { x: 0.08 + r() * 0.84, y: 0.16 + r() * 0.68 };
      const d = centers.length ? Math.min(...centers.map((o) => gap(c, o))) : 1;
      if (d > best) {
        best = d;
        center = c;
      }
    }
    centers.push(center);

    const group = [];
    for (let k = 0; k < size; k++, i++) {
      let p;
      for (let t = 0; t < 14; t++) {
        const a = r() * Math.PI * 2;
        const d = 0.3 + r() * 0.7;
        p = {
          x: clamp(center.x + Math.cos(a) * d * 0.1, 0.04, 0.96),
          y: clamp(center.y + Math.sin(a) * d * 0.17, 0.08, 0.92)
        };
        if (group.every((q) => gap(p, q) > 0.09)) break;
      }
      const item = items[i];
      const star = {
        ...p,
        item,
        special: Boolean(item.isOwn) || r() < 0.16,
        size: 2.5 + r() * 3,
        dur: 2 + r() * 4,
        delay: -r() * 6
      };
      group.push(star);
      stars.push(star);
    }

    const rest = group.slice(1);
    let cur = group[0];
    while (rest.length) {
      rest.sort((a, b) => gap(cur, a) - gap(cur, b));
      const next = rest.shift();
      lines.push({ a: cur, b: next });
      cur = next;
    }
  }
  return { stars, lines };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function Message({ star, out }) {
  return (
    <div className={`uc__msg${out ? ' is-out' : ''}`} aria-hidden={out || undefined}>
      <blockquote className="uc__wish">“{star.item.wish}”</blockquote>
      <div className={`name-tag${star.item.isOwn ? ' name-tag--own' : ''}`}>
        <span>{star.item.from}</span>
      </div>
    </div>
  );
}

function UniverseCard({ star, live, reduced, onNeighbor }) {
  const [out, setOut] = useState(null);
  const [bursts, setBursts] = useState([]);
  const prevRef = useRef(star);

  const burst = useCallback(
    (at) => {
      if (reduced) return;
      const id = `${Date.now()}-${Math.random()}`;
      setBursts((b) => [...b, { id, at }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
    },
    [reduced]
  );

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === star) return undefined;
    prevRef.current = star;
    setOut(prev);
    if (star?.special) burst('top');
    const t = setTimeout(() => setOut(null), 320);
    return () => clearTimeout(t);
  }, [star, burst]);

  if (!star) return null;

  return (
    <aside className="uc">
      <div className="uc__particles" aria-hidden="true">
        {PARTICLES.map((p, k) => (
          <i
            key={k}
            style={{ '--x': p.x, '--y': p.y, '--s': p.s, '--d': p.d, '--dl': p.dl, '--dx': p.dx }}
          />
        ))}
      </div>
      <div className="uc__eyebrow">A MESSAGE FROM THE UNIVERSE</div>
      <div className="uc__stage" aria-live={live ? 'polite' : 'off'}>
        {out && <Message key={`out-${out.item.id}`} star={out} out />}
        <Message key={star.item.id} star={star} />
      </div>
      <div className="uc__foot">
        <p className="uc__hint">Tap another star to discover a memory.</p>
        <div className="uc__btns">
          <button type="button" className="uc__btn" onClick={onNeighbor}>
            ✧ Ngôi sao cạnh bên
          </button>
          <button type="button" className="uc__btn" onClick={() => burst('btn')}>
            ✦ Gửi ánh sáng
          </button>
        </div>
      </div>
      {bursts.map((b) => (
        <span key={b.id} className={`uc__burst uc__burst--${b.at}`} aria-hidden="true">
          {SPARKS.map((s, k) => (
            <i key={k} style={{ '--a': s.a, '--r': s.r }} />
          ))}
        </span>
      ))}
    </aside>
  );
}

export default function WishSky({ items }) {
  const sky = useMemo(() => buildSky(items), [items]);
  const reduced = usePrefersReducedMotion();

  const rootRef = useRef(null);
  const viewRef = useRef(null);
  const worldRef = useRef(null);
  const dustRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const inertia = useRef(0);
  const centered = useRef(false);
  const visited = useRef(new Set());

  const [view, setView] = useState({ w: 0, h: 0, coarse: false });
  const [activeId, setActiveId] = useState(() => (items.find((i) => i.isOwn) ?? items[0])?.id);
  const [interacted, setInteracted] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [meteor, setMeteor] = useState(null);

  const active = sky.stars.find((s) => s.item.id === activeId) ?? sky.stars[0];

  // Bầu trời rộng hơn khung nhìn; trên màn hình cảm ứng chỉ kéo ngang để không chặn cuộn trang.
  const world = useMemo(() => {
    const n = items.length;
    let fx = clamp(1 + n / 25, 1.3, 3);
    let fy = clamp(1 + n / 60, 1.15, 1.8);
    if (view.coarse) {
      fx = clamp(fx * 1.35, 1.5, 4);
      fy = 1;
    }
    return { W: view.w * fx, H: view.h * fy };
  }, [items.length, view]);

  const apply = useCallback(
    (x, y, glide = false) => {
      const o = { x: clamp(x, view.w - world.W, 0), y: clamp(y, view.h - world.H, 0) };
      offset.current = o;
      for (const [el, k] of [
        [worldRef.current, 1],
        [dustRef.current, 0.45]
      ]) {
        if (!el) continue;
        el.classList.toggle('is-gliding', glide);
        el.style.transform = `translate3d(${o.x * k}px, ${o.y * k}px, 0)`;
      }
    },
    [view, world]
  );

  const focusStar = useCallback(
    (star, glide, force = false) => {
      if (!star || !view.w) return;
      const wide = view.w >= 720;
      const sx = star.x * world.W + offset.current.x;
      const sy = star.y * world.H + offset.current.y;
      const visible =
        sx > view.w * 0.1 &&
        sx < view.w * 0.9 &&
        sy > view.h * 0.12 &&
        sy < view.h * 0.88 &&
        !(wide && sx < 440 && sy > view.h - 260);
      if (visible && !force) return;
      apply(view.w * (wide ? 0.62 : 0.5) - star.x * world.W, view.h * (wide ? 0.4 : 0.5) - star.y * world.H, glide);
    },
    [apply, view, world]
  );

  useLayoutEffect(() => {
    const el = viewRef.current;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setView({ w: rect.width, h: rect.height, coarse: window.matchMedia('(pointer: coarse)').matches });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!view.w) return;
    if (!centered.current) {
      centered.current = true;
      focusStar(active, false, true);
    } else {
      apply(offset.current.x, offset.current.y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);

  useEffect(() => {
    visited.current.add(activeId);
    if (centered.current) focusStar(active, !reduced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setRevealed(true);
    }, { threshold: 0.25 });
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  // Chưa ai chạm thì tự lần lượt kể từng lời chúc
  useEffect(() => {
    if (interacted || !inView || sky.stars.length < 2) return undefined;
    const t = setInterval(() => {
      setActiveId((id) => {
        const k = sky.stars.findIndex((s) => s.item.id === id);
        return sky.stars[(k + 1) % sky.stars.length].item.id;
      });
    }, 6500);
    return () => clearInterval(t);
  }, [interacted, inView, sky]);

  useEffect(() => {
    if (!inView || reduced) return undefined;
    let t;
    const next = () => {
      t = setTimeout(() => {
        setMeteor({ key: Date.now(), top: 4 + Math.random() * 40, left: 40 + Math.random() * 55 });
        next();
      }, 4000 + Math.random() * 7000);
    };
    next();
    return () => clearTimeout(t);
  }, [inView, reduced]);

  useEffect(() => {
    const el = viewRef.current;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      cancelAnimationFrame(inertia.current);
      apply(offset.current.x - e.deltaX, offset.current.y);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [apply]);

  useEffect(() => () => cancelAnimationFrame(inertia.current), []);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(inertia.current);
    suppressClick.current = false;
    drag.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: offset.current.x,
      oy: offset.current.y,
      moved: false,
      samples: [{ t: e.timeStamp, x: e.clientX, y: e.clientY }]
    };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      d.moved = true;
      viewRef.current.setPointerCapture(e.pointerId);
      rootRef.current.classList.add('is-dragging');
      setDragged(true);
      setInteracted(true);
    }
    apply(d.ox + dx, d.oy + dy);
    d.samples.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
    if (d.samples.length > 5) d.samples.shift();
  };

  const endDrag = (e, fling) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    suppressClick.current = true;
    rootRef.current.classList.remove('is-dragging');
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const dt = last.t - first.t;
    if (!fling || reduced || dt <= 0 || e.timeStamp - last.t > 80) return;
    let vx = (last.x - first.x) / dt;
    let vy = (last.y - first.y) / dt;
    let prev = performance.now();
    const step = (now) => {
      const ms = Math.min(32, now - prev);
      prev = now;
      const decay = Math.pow(0.94, ms / 16);
      vx *= decay;
      vy *= decay;
      apply(offset.current.x + vx * ms, offset.current.y + vy * ms);
      if (Math.hypot(vx, vy) > 0.02) inertia.current = requestAnimationFrame(step);
    };
    inertia.current = requestAnimationFrame(step);
  };

  const select = (star) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setInteracted(true);
    setActiveId(star.item.id);
  };

  // Ngôi sao gần nhất chưa ghé; ghé hết rồi thì bắt đầu vòng mới để không đi vòng quanh một cặp sao.
  const goNeighbor = () => {
    if (sky.stars.length < 2) return;
    setInteracted(true);
    const others = sky.stars.filter((s) => s !== active);
    let pool = others.filter((s) => !visited.current.has(s.item.id));
    if (!pool.length) {
      visited.current = new Set([active.item.id]);
      pool = others;
    }
    const dist = (s) => Math.hypot((s.x - active.x) * world.W, (s.y - active.y) * world.H);
    const next = pool.reduce((best, s) => (dist(s) < dist(best) ? s : best));
    setActiveId(next.item.id);
  };

  return (
    <div ref={rootRef} className={`sky${revealed ? ' is-revealed' : ''}${dragged ? ' has-dragged' : ''}`}>
      <div
        ref={viewRef}
        className="sky__view"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, true)}
        onPointerCancel={(e) => endDrag(e, false)}
      >
        <div ref={dustRef} className="sky__dust" style={{ width: world.W, height: world.H }} aria-hidden="true">
          {DUST.map((p, k) => (
            <i key={k} style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, opacity: p.o }} />
          ))}
        </div>

        <div ref={worldRef} className="sky__world" style={{ width: world.W, height: world.H }}>
          <svg className="sky__lines" width={world.W} height={world.H} aria-hidden="true">
            {sky.lines.map((l, k) => {
              const x1 = l.a.x * world.W;
              const y1 = l.a.y * world.H;
              const x2 = l.b.x * world.W;
              const y2 = l.b.y * world.H;
              const hot = l.a === active || l.b === active;
              return (
                <line
                  key={k}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={hot ? 'is-hot' : undefined}
                  style={{ '--len': Math.hypot(x2 - x1, y2 - y1), animationDelay: `${0.4 + k * 0.14}s` }}
                />
              );
            })}
          </svg>

          {sky.stars.map((s) => {
            const isActive = s === active;
            return (
              <button
                key={s.item.id}
                type="button"
                className={`star${s.special ? ' star--special' : ''}${isActive ? ' is-active' : ''}`}
                style={{
                  left: s.x * world.W,
                  top: s.y * world.H,
                  '--sz': `${s.special ? s.size + 2.5 : s.size}px`,
                  '--tw': `${s.dur}s`,
                  '--td': `${s.delay}s`
                }}
                aria-label={`Lời chúc từ ${s.item.from}`}
                aria-pressed={isActive}
                onClick={() => select(s)}
                onFocus={() => focusStar(s, !reduced)}
              >
                <span className="star__core" />
                {isActive && <span className="star__ring" />}
                {s.item.isOwn && <span className="star__label">Lời chúc của bạn</span>}
              </button>
            );
          })}
        </div>

        {meteor && (
          <i
            key={meteor.key}
            className="sky__meteor"
            style={{ top: `${meteor.top}%`, left: `${meteor.left}%` }}
            onAnimationEnd={() => setMeteor(null)}
            aria-hidden="true"
          />
        )}

        <div className="sky__hint" aria-hidden="true">
          ✦ Kéo để khám phá bầu trời
        </div>
      </div>

      <UniverseCard star={active} live={interacted} reduced={reduced} onNeighbor={goNeighbor} />
    </div>
  );
}
