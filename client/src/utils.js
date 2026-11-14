// '10:00' -> '10h', '09:30' -> '9h30'
export function fmtTime(t) {
  const [h, m] = String(t).split(':');
  return `${Number(h)}h${m === '00' ? '' : m}`;
}

// { start:'10:00', end:'12:00' } -> '10h – 12h'
export function fmtRange(a) {
  return a ? `${fmtTime(a.start)} – ${fmtTime(a.end)}` : '';
}
