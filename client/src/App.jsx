import { Route, Routes } from 'react-router-dom';
import InvitePage from './pages/InvitePage.jsx';
import Notice from './pages/Notice.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/moi/:slug" element={<InvitePage />} />
      <Route
        path="/"
        element={
          <Notice
            title="Thư mời tốt nghiệp của Lâm Vũ"
            text="Mỗi thiệp mời có một đường link riêng. Bạn hãy mở đúng link mình đã gửi cho bạn nhé 😉😉."
          />
        }
      />
      <Route path="*" element={<Notice title="Không tìm thấy trang" text="Đường link này không tồn tại." />} />
    </Routes>
  );
}
