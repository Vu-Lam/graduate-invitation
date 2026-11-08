import { useRef } from 'react';

const SIGMA = 42;
const PEAK = 1.0;

// Hiệu ứng phóng đại kiểu dock: chữ nào gần con trỏ nhất thì to nhất, lan mượt sang các chữ bên cạnh.
export default function MagnifyText({ text }) {
  const ref = useRef(null);

  const reset = () => {
    for (const el of ref.current.children) {
      el.style.transform = '';
      el.style.textShadow = '';
    }
  };

  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (const el of ref.current.children) {
      const r = el.getBoundingClientRect();
      const d = e.clientX - (r.left + r.width / 2);
      const k = Math.exp(-(d * d) / (SIGMA * SIGMA));
      const scale = 1 + PEAK * k;
      el.style.transform = `translateY(${-k * 8}px) scale(${scale})`;
      el.style.textShadow = `0 0 ${k * 16}px var(--tint)`;
    }
  };

  return (
    <span ref={ref} className="magnify" aria-label={text} onPointerMove={onMove} onPointerLeave={reset}>
      {[...text].map((ch, i) => (
        <span key={i} className="magnify__ch" aria-hidden="true">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}
