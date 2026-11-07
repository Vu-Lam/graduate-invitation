import { useEffect, useState } from 'react';

function compute(target) {
  const diff = target - Date.now();
  if (diff <= 0) return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor(diff / 1000);
  return {
    done: false,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60
  };
}

// Trả về null nếu chưa cấu hình ngày (config.event.iso)
export function useCountdown(iso) {
  const target = iso ? new Date(iso).getTime() : NaN;
  const valid = Number.isFinite(target);
  const [value, setValue] = useState(() => (valid ? compute(target) : null));

  useEffect(() => {
    if (!valid) return undefined;
    setValue(compute(target));
    const id = setInterval(() => setValue(compute(target)), 1000);
    return () => clearInterval(id);
  }, [valid, target]);

  return valid ? value : null;
}
