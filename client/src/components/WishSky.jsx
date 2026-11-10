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

// ---- Vườn sen (theme Phật pháp) ----
// Cánh sen vẽ từ gốc (0,0) hướng lên; xoay theo --a * --open nên nụ có thể nở ra mượt bằng CSS.
const PETAL_D = {
  back: 'M0 0C-9 -7 -9 -23 0 -31C9 -23 9 -7 0 0Z',
  mid: 'M0 0C-8 -6 -8 -20 0 -27C8 -20 8 -6 0 0Z',
  front: 'M0 0C-6.5 -6 -6.5 -17 0 -24C6.5 -17 6.5 -6 0 0Z'
};
const PETALS = [
  { a: -80, k: 'back' },
  { a: 80, k: 'back' },
  { a: -56, k: 'back' },
  { a: 56, k: 'back' },
  { a: -32, k: 'mid' },
  { a: 32, k: 'mid' },
  { a: -14, k: 'front' },
  { a: 14, k: 'front' },
  { a: 0, k: 'front' }
];
const BLOOM_OPEN = [0.14, 0.42, 0.7]; // nụ, hé nở, nở; bấm vào thì nở trọn (1)
// Sóng là elip dẹt (nhìn mặt nước từ trên nghiêng xuống): bán kính ngang 300px, dọc 150px, lan trong 1.4s.
const RIPPLE_REACH = 300;
const RIPPLE_SPEED = 300 / 1.4; // px/giây theo trục ngang, khớp với .pond__ripple trong CSS
const WATERLINE = 13; // khoảng từ tâm nút xuống mặt lá sen

// Giọt nước bắn ra khi sen nở: bay theo đường cong rồi rơi xuống tạo gợn nhỏ.
const SPLASH = (() => {
  const r = mulberry32(7);
  return Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2 + (r() - 0.5) * 0.4;
    const d = 26 + r() * 34;
    return {
      dx: `${(Math.cos(a) * d).toFixed(1)}px`,
      dy: `${(Math.sin(a) * d * 0.5).toFixed(1)}px`,
      h: `${(-16 - r() * 26).toFixed(1)}px`,
      s: `${(2 + r() * 2.2).toFixed(1)}px`,
      t: `${(0.62 + r() * 0.25).toFixed(2)}s`
    };
  });
})();

function spreadLotus(sky, W, H) {
  const minD = 60;
  const pts = sky.stars.map((s) => ({ x: s.x * W, y: s.y * H }));
  for (let it = 0; it < 40; it++) {
    for (let a = 0; a < pts.length; a++) {
      for (let b = a + 1; b < pts.length; b++) {
        const dx = pts[b].x - pts[a].x;
        const dy = pts[b].y - pts[a].y;
        const d = Math.hypot(dx, dy) || 0.01;
        if (d >= minD) continue;
        const k = (minD - d) / 2 / d;
        pts[a].x -= dx * k;
        pts[a].y -= dy * k;
        pts[b].x += dx * k;
        pts[b].y += dy * k;
      }
    }
    for (const p of pts) {
      p.x = Math.min(W - 34, Math.max(34, p.x));
      p.y = Math.min(H - 34, Math.max(36, p.y));
    }
  }
  const map = new Map();
  const stars = sky.stars.map((s, i) => {
    const n = { ...s, x: pts[i].x / W, y: pts[i].y / H };
    map.set(s, n);
    return n;
  });
  return { stars, lines: sky.lines.map((l) => ({ a: map.get(l.a), b: map.get(l.b) })) };
}

function LotusDefs() {
  return (
    <svg className="sky__defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lotus-back" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c9466f" />
          <stop offset="1" stopColor="#ffb79e" />
        </linearGradient>
        <linearGradient id="lotus-mid" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff8fb5" />
          <stop offset="1" stopColor="#ffe2cf" />
        </linearGradient>
        <linearGradient id="lotus-front" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffb0cb" />
          <stop offset="1" stopColor="#fff7ec" />
        </linearGradient>
        <radialGradient id="lotus-seed">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#f4a52e" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function LotusFlower() {
  return (
    <svg className="lotus__svg" viewBox="-34 -42 68 54" aria-hidden="true" focusable="false">
      <ellipse className="lotus__pad" cx="0" cy="5" rx="27" ry="7" />
      {PETALS.map((p, k) => (
        <path key={k} d={PETAL_D[p.k]} className={`lotus__petal lotus__petal--${p.k}`} style={{ '--a': `${p.a}deg` }} />
      ))}
      <circle className="lotus__seed" cx="0" cy="-7" r="3.6" />
    </svg>
  );
}

const FIREFLIES = Array.from({ length: 8 }, (_, k) => ({
  x: `${6 + ((k * 41) % 88)}%`,
  y: `${24 + ((k * 29) % 66)}%`,
  d: `${8 + (k % 4) * 2.5}s`,
  dl: `${-k * 1.9}s`,
  dx: `${(k % 2 ? 1 : -1) * (12 + (k % 3) * 8)}px`
}));

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

const COPY = {
  sky: {
    eyebrow: 'A MESSAGE FROM THE UNIVERSE',
    hint: 'Tap another star to discover a memory.',
    neighbor: '✧ Ngôi sao cạnh bên',
    send: '✦ Gửi ánh sáng'
  },
  lotus: {
    eyebrow: 'LỜI NGUYỆN TỪ VƯỜN SEN',
    hint: 'Chạm vào một đóa sen để nghe lời chúc.',
    neighbor: '❀ Đóa sen cạnh bên',
    send: '✦ Gửi an lành'
  }
};

function UniverseCard({ star, live, reduced, onNeighbor, copy }) {
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
      <div className="uc__eyebrow">{copy.eyebrow}</div>
      <div className="uc__stage" aria-live={live ? 'polite' : 'off'}>
        {out && <Message key={`out-${out.item.id}`} star={out} out />}
        <Message key={star.item.id} star={star} />
      </div>
      <div className="uc__foot">
        <p className="uc__hint">{copy.hint}</p>
        <div className="uc__btns">
          <button type="button" className="uc__btn" onClick={onNeighbor}>
            {copy.neighbor}
          </button>
          <button type="button" className="uc__btn" onClick={() => burst('btn')}>
            {copy.send}
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

export default function WishSky({ items, variant = 'sky' }) {
  const lotus = variant === 'lotus';
  const copy = COPY[lotus ? 'lotus' : 'sky'];
  const baseSky = useMemo(() => buildSky(items), [items]);
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
  const [ripple, setRipple] = useState(null);


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

  // Sen to hơn sao nên cần giãn cách theo pixel thật để không đè lên nhau.
  const sky = useMemo(
    () => (lotus && world.W ? spreadLotus(baseSky, world.W, world.H) : baseSky),
    [baseSky, lotus, world.W, world.H]
  );
  const active = sky.stars.find((s) => s.item.id === activeId) ?? sky.stars[0];

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
    // Sen nở → sóng lan ra, chạm tới đâu đóa sen ở đó sáng lên
    if (lotus && !reduced && revealed && active) setRipple((r) => ({ key: (r?.key ?? 0) + 1, star: active }));
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
    if (!inView || reduced || lotus) return undefined;
    let t;
    const next = () => {
      t = setTimeout(() => {
        setMeteor({ key: Date.now(), top: 4 + Math.random() * 40, left: 40 + Math.random() * 55 });
        next();
      }, 4000 + Math.random() * 7000);
    };
    next();
    return () => clearTimeout(t);
  }, [inView, reduced, lotus]);

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
    // Chạm lại đóa đang nở vẫn gợn sóng (đổi đóa thì effect theo activeId lo)
    if (lotus && !reduced && star.item.id === activeId) setRipple((r) => ({ key: (r?.key ?? 0) + 1, star }));
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
    <div
      ref={rootRef}
      className={`sky${lotus ? ' sky--lotus' : ''}${revealed ? ' is-revealed' : ''}${dragged ? ' has-dragged' : ''}`}
    >
      {lotus && <LotusDefs />}
      <div
        ref={viewRef}
        className="sky__view"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, true)}
        onPointerCancel={(e) => endDrag(e, false)}
      >
        <div ref={dustRef} className="sky__dust" style={{ width: world.W, height: world.H }} aria-hidden="true">
          {lotus && (
            <svg className="pond__currents" viewBox="0 0 1000 600" preserveAspectRatio="none">
              <g>
                {[90, 170, 250, 330, 410, 490, 560].map((y, k) => (
                  <path
                    key={y}
                    d={`M-80 ${y} Q ${60 + k * 20} ${y - 22} ${200 + k * 10} ${y} T ${480 + k * 10} ${y} T ${760 + k * 10} ${y} T 1100 ${y}`}
                  />
                ))}
              </g>
            </svg>
          )}
          {DUST.map((p, k) => (
            <i key={k} style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, opacity: p.o }} />
          ))}
        </div>

        <div ref={worldRef} className="sky__world" style={{ width: world.W, height: world.H }}>
          {!lotus && (
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
          )}

          {lotus && ripple && (
            <span
              key={ripple.key}
              className="pond__splash"
              style={{ left: ripple.star.x * world.W, top: ripple.star.y * world.H + WATERLINE }}
              aria-hidden="true"
            >
              <span className="pond__ripple">
                <i />
                <i />
                <i />
                <i />
              </span>
              {SPLASH.map((d, k) => (
                <span key={k} className="pond__drop" style={{ '--dx': d.dx, '--dy': d.dy, '--h': d.h, '--s': d.s, '--t': d.t }}>
                  <i />
                  <b />
                </span>
              ))}
            </span>
          )}

          {sky.stars.map((s) => {
            const isActive = s === active;
            if (lotus) {
              let lit = 0;
              if (ripple && s.item.id !== ripple.star.item.id) {
                // khoảng cách theo elip của sóng (trục dọc nén một nửa)
                const d = Math.hypot((s.x - ripple.star.x) * world.W, (s.y - ripple.star.y) * world.H * 2);
                if (d < RIPPLE_REACH) lit = d;
              }
              const bloom = hashStr(String(s.item.id)) % 3;
              const wave = lit > 0 ? { '--ld': `${(lit / RIPPLE_SPEED).toFixed(2)}s`, '--li': (1 - lit / RIPPLE_REACH).toFixed(2) } : null;
              return (
                <button
                  key={s.item.id}
                  type="button"
                  className={`lotus${isActive ? ' is-active' : ''}${s.item.isOwn ? ' lotus--own' : ''}`}
                  style={{
                    left: s.x * world.W,
                    top: s.y * world.H,
                    '--open0': BLOOM_OPEN[bloom],
                    '--fs': (0.82 + (s.size - 2.5) / 3 * 0.32).toFixed(2),
                    '--tw': `${s.dur + 3}s`,
                    '--td': `${s.delay}s`
                  }}
                  aria-label={`Lời chúc từ ${s.item.from}`}
                  aria-pressed={isActive}
                  onClick={() => select(s)}
                  onFocus={() => focusStar(s, !reduced)}
                >
                  <span className="lotus__halo" />
                  <span className="lotus__glow" />
                  <span className="lotus__rays" />
                  {wave && <span key={ripple.key} className="lotus__lit" style={wave} />}
                  {/* Sóng tới thì đóa sen dập dềnh; đổi tên animation theo lượt sóng để chạy lại mà không remount */}
                  <span
                    className={`lotus__float${wave ? ` is-wave-${ripple.key % 2}` : ''}`}
                    style={wave ?? undefined}
                  >
                    <span className="lotus__body">
                      <LotusFlower />
                    </span>
                  </span>
                  {s.item.isOwn && <span className="star__label">Đóa sen của bạn</span>}
                </button>
              );
            }
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
          {lotus ? '❀ Kéo để khám phá vườn sen' : '✦ Kéo để khám phá bầu trời'}
        </div>

        {lotus &&
          FIREFLIES.map((f, k) => (
            <i
              key={k}
              className="pond__fly"
              aria-hidden="true"
              style={{ left: f.x, top: f.y, '--d': f.d, '--dl': f.dl, '--dx': f.dx }}
            />
          ))}
      </div>

      <UniverseCard star={active} live={interacted} reduced={reduced} onNeighbor={goNeighbor} copy={copy} />
    </div>
  );
}
