import { useEffect, useMemo, useState } from 'react';

const COLORS = ['#ffffff', 'var(--s)', 'var(--tint)', '#ffd0e2'];

// `burst` đổi giá trị (số tăng dần) mỗi lần cần bắn pháo giấy.
export default function Confetti({ burst }) {
  const [show, setShow] = useState(false);

  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2.4 + Math.random() * 1.4,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        drift: (Math.random() - 0.5) * 180,
        rotate: Math.random() * 360
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst]
  );

  useEffect(() => {
    if (!burst) return undefined;
    setShow(true);
    const id = setTimeout(() => setShow(false), 4600);
    return () => clearTimeout(id);
  }, [burst]);

  if (!show) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--rot': `${p.rotate}deg`
          }}
        />
      ))}
    </div>
  );
}
