import Backdrop from '../components/Decor.jsx';

// Trang thông báo đơn giản (sai link, lỗi mạng, vào thẳng trang chủ)
export default function Notice({ title, text }) {
  return (
    <div className="inv inv--center" data-theme="bk">
      <Backdrop />
      <div className="container notice">
        <div className="frost notice__logo">
          <img src="/logo.png" alt="Logo BK TP.HCM" />
        </div>
        <h1 className="display notice__title">{title}</h1>
        <p className="notice__text">{text}</p>
      </div>
    </div>
  );
}
