import { THEMES } from '../themes.js';
import { config } from '../config.js';

function ThemeSwitcher({ theme, onTheme }) {
  return (
    <div className="glass themes" role="group" aria-label="Đổi màu giao diện">
      <span className="themes__label">Màu thiệp</span>
      {THEMES.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`swatch${t.special ? ' swatch--special' : ''}`}
          aria-label={t.label}
          aria-pressed={theme === t.key}
          title={t.label}
          onClick={() => onTheme(t.key)}
        >
          <span className="swatch__dot" style={{ background: t.swatch }} />
        </button>
      ))}
    </div>
  );
}

function MusicButton({ music }) {
  if (!music.available) return null;
  return (
    <button type="button" className="glass music" aria-pressed={music.playing} onClick={music.toggle}>
      <span className={`eqbars${music.playing ? ' is-playing' : ''}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{music.playing ? 'Đang phát nhạc' : 'Bật nhạc'}</span>
    </button>
  );
}

export default function Header({ theme, onTheme, music }) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="logo-tile">
          <img src="/logo.png" alt="Logo Trường Đại học Bách khoa TP.HCM" />
        </div>
        <span>Lễ tốt nghiệp · {config.event.year}</span>
      </div>
      <div className="topbar__tools">
        <ThemeSwitcher theme={theme} onTheme={onTheme} />
        <MusicButton music={music} />
      </div>
    </header>
  );
}
