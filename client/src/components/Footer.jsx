import { config } from '../config.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__brand">
        <div className="logo-tile logo-tile--sm">
          <img src="/logo.png" alt="" />
        </div>
        <div>
          <div>
            {config.host.name} · {config.host.school}
          </div>
          <div className="footer__credit">
            © {config.event.year} · Nhạc từ{' '}
            <a href="https://www.youtube.com/watch?v=pAbhAmOxGfc" target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
