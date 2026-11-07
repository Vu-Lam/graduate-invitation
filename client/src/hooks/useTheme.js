import { useCallback, useState } from 'react';
import { DEFAULT_THEME, THEMES } from '../themes.js';

const KEY = 'thiep-moi:theme';

function read() {
  try {
    const saved = localStorage.getItem(KEY);
    return THEMES.some((t) => t.key === saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

// Nhớ màu khách đã chọn cho lần mở thiệp sau.
export function useTheme() {
  const [theme, setThemeState] = useState(read);
  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* chế độ riêng tư: bỏ qua */
    }
  }, []);
  return [theme, setTheme];
}
