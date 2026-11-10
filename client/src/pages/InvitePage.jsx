import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { api } from '../api.js';
import { config } from '../config.js';
import { useTheme } from '../hooks/useTheme.js';
import { useMusic } from '../hooks/useMusic.js';
import { useCountdown } from '../hooks/useCountdown.js';
import Backdrop from '../components/Decor.jsx';
import Gate from '../components/Gate.jsx';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Info from '../components/Info.jsx';
import Tour from '../components/Tour.jsx';
import Rsvp from '../components/Rsvp.jsx';
import Guestbook from '../components/Guestbook.jsx';
import Footer from '../components/Footer.jsx';
import InviteCard from '../components/InviteCard.jsx';
import Notice from './Notice.jsx';

const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export default function InvitePage() {
  const { slug } = useParams();
  const [theme, setTheme] = useTheme();
  const [load, setLoad] = useState({ status: 'loading', guest: null });
  const [opened, setOpened] = useState(false);
  const [qr, setQr] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const cardRef = useRef(null);

  const music = useMusic(config.music.src, config.music.volume);
  const countdown = useCountdown(config.event.iso);

  // Tải thông tin khách theo slug
  useEffect(() => {
    let alive = true;
    setLoad({ status: 'loading', guest: null });
    api
      .getGuest(slug)
      .then((guest) => alive && setLoad({ status: 'ready', guest }))
      .catch((err) => alive && setLoad({ status: err.status === 404 ? 'notfound' : 'error', guest: null }));
    return () => {
      alive = false;
    };
  }, [slug]);

  const guest = load.guest;
  const link = guest ? `${config.siteUrl}/moi/${guest.slug}` : '';

  // Mã QR trỏ về chính link của khách
  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, { margin: 1, width: 264, color: { dark: '#0a1f5c', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [link]);

  const download = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    setDownloadError('');
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const options = { pixelRatio: 1, cacheBust: true };
      let dataUrl;
      try {
        if (isSafari()) await toPng(cardRef.current, options); // Safari cần "làm nóng" lần đầu
        dataUrl = await toPng(cardRef.current, options);
      } catch {
        // Không nhúng được font từ Google thì vẫn xuất ảnh bằng font hệ thống
        dataUrl = await toPng(cardRef.current, { ...options, skipFonts: true });
      }
      const a = document.createElement('a');
      a.download = `thiep-moi-${guest.slug}.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      setDownloadError('Chưa tạo được ảnh thiệp, bạn thử lại giúp mình nhé.');
    } finally {
      setDownloading(false);
    }
  }, [downloading, guest]);

  if (load.status === 'notfound') {
    return (
      <Notice
        title="Không tìm thấy thiệp mời"
        text="Link này chưa đúng. Bạn kiểm tra lại đường link mình đã gửi riêng cho bạn nhé."
      />
    );
  }
  if (load.status === 'error') {
    return <Notice title="Chưa tải được thiệp" text="Có lỗi kết nối. Bạn thử tải lại trang giúp mình nhé." />;
  }

  return (
    <div className="inv" data-theme={theme}>
      <Backdrop />

      {load.status === 'loading' && (
        <div className="loading" role="status" aria-label="Đang tải thiệp">
          <div className="frost loading__logo">
            <img src="/logo.png" alt="" />
          </div>
        </div>
      )}

      {guest && (
        <>
          {!opened && (
            <Gate guest={guest} musicAvailable={music.available} onOpen={music.play} onClosed={() => setOpened(true)} />
          )}

          <div className="container">
            <Header theme={theme} onTheme={setTheme} music={music} />
            <Hero
              guest={guest}
              countdown={countdown}
              onDownload={download}
              downloading={downloading}
              downloadError={downloadError}
            />
            <Info />
            <Tour />
            <Rsvp key={guest.slug} guest={guest} onSaved={(g) => setLoad({ status: 'ready', guest: g })} />
            <Guestbook slug={guest.slug} theme={theme} />
            <Footer />
          </div>

          {/* Thẻ ảnh để xuất PNG: nằm ngoài màn hình, không ảnh hưởng bố cục */}
          <div className="export-host" aria-hidden="true">
            <InviteCard ref={cardRef} guest={guest} qr={qr} link={link.replace(/^https?:\/\//, '')} />
          </div>
        </>
      )}
    </div>
  );
}
